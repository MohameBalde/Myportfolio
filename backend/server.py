from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Header, Query
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from bson import ObjectId
from typing import List, Optional
import os
import logging
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import requests
import io

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== Object Storage Setup ====================
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "portfolio-balde"
storage_key = None

def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    logger.info("Storage initialized successfully")
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple:
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ==================== Auth Helpers ====================
JWT_ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== Models ====================
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    email: str
    name: str
    role: str

    model_config = ConfigDict(populate_by_name=True)

class ProjectCreate(BaseModel):
    title: str
    description: str
    technologies: str
    category: str

class ProjectResponse(BaseModel):
    id: str
    title: str
    description: str
    technologies: str
    category: str
    image_url: Optional[str] = None
    created_at: str

class MessageCreate(BaseModel):
    name: str
    email: EmailStr
    message: str

class MessageResponse(BaseModel):
    id: str
    name: str
    email: str
    message: str
    created_at: str

class CVResponse(BaseModel):
    id: str
    filename: str
    uploaded_at: str
    storage_path: str

# ==================== Startup ====================
@app.on_event("startup")
async def startup():
    try:
        init_storage()
        await db.users.create_index("email", unique=True)
        await db.login_attempts.create_index("identifier")
        await seed_admin()
        await seed_initial_projects()
        logger.info("Startup complete")
    except Exception as e:
        logger.error(f"Startup error: {e}")

async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "balde8307@gmail.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@2025")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Mohamed Baldé",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logger.info(f"Admin password updated: {admin_email}")

async def seed_initial_projects():
    count = await db.projects.count_documents({})
    if count == 0:
        initial_projects = [
            {
                "id": str(uuid.uuid4()),
                "title": "Configuration Réseau VLAN",
                "description": "Mise en place d'une architecture réseau segmentée avec VLANs pour optimiser la sécurité et les performances.",
                "technologies": "Cisco Packet Tracer, VLAN, Routing",
                "category": "Network",
                "image_url": "https://images.pexels.com/photos/5480781/pexels-photo-5480781.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Déploiement Windows Server",
                "description": "Installation et configuration de Windows Server 2019 avec Active Directory, DNS et DHCP.",
                "technologies": "Windows Server, Active Directory, GPO",
                "category": "System",
                "image_url": "https://images.unsplash.com/photo-1762163516269-3c143e04175c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwxfHxzZXJ2ZXIlMjByYWNrJTIwZGFya3xlbnwwfHx8fDE3NzU2NjYwODl8MA&ixlib=rb-4.1.0&q=85",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Serveur VoIP Issabel",
                "description": "Configuration d'un serveur de téléphonie IP avec Issabel pour gérer les appels internes.",
                "technologies": "Issabel, Asterisk, VoIP, SIP",
                "category": "Telecom",
                "image_url": "https://images.unsplash.com/photo-1604869515882-4d10fa4b0492?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwxfHxmaWJlciUyMG9wdGljJTIwY2FibGVzfGVufDB8fHx8MTc3NTY2NjA4OXww&ixlib=rb-4.1.0&q=85",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.projects.insert_many(initial_projects)
        logger.info("Initial projects seeded")

# ==================== Auth Endpoints ====================
@api_router.post("/auth/login")
async def login(credentials: LoginRequest, response: Response):
    email = credentials.email.lower()
    user = await db.users.find_one({"email": email})
    
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=900,
        path="/"
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=604800,
        path="/"
    )
    
    return {
        "_id": user_id,
        "email": user["email"],
        "name": user["name"],
        "role": user["role"]
    }

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

# ==================== Projects Endpoints ====================
@api_router.get("/projects")
async def get_projects():
    projects = await db.projects.find({}, {"_id": 0}).to_list(1000)
    return projects

@api_router.post("/projects")
async def create_project(request: Request, title: str = Query(...), description: str = Query(...), 
                        technologies: str = Query(...), category: str = Query(...),
                        image: UploadFile = File(None)):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    project_id = str(uuid.uuid4())
    image_url = None
    
    if image:
        ext = image.filename.split(".")[-1] if "." in image.filename else "jpg"
        path = f"{APP_NAME}/projects/{project_id}.{ext}"
        data = await image.read()
        result = put_object(path, data, image.content_type or "image/jpeg")
        image_url = f"/api/files/{result['path']}"
    
    project = {
        "id": project_id,
        "title": title,
        "description": description,
        "technologies": technologies,
        "category": category,
        "image_url": image_url,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.projects.insert_one(project)
    # Retrieve the inserted project without MongoDB's _id field
    inserted_project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return inserted_project

@api_router.put("/projects/{project_id}")
async def update_project(request: Request, project_id: str, title: str = Query(...), 
                        description: str = Query(...), technologies: str = Query(...), 
                        category: str = Query(...), image: UploadFile = File(None)):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = {
        "title": title,
        "description": description,
        "technologies": technologies,
        "category": category
    }
    
    if image:
        ext = image.filename.split(".")[-1] if "." in image.filename else "jpg"
        path = f"{APP_NAME}/projects/{project_id}.{ext}"
        data = await image.read()
        result = put_object(path, data, image.content_type or "image/jpeg")
        update_data["image_url"] = f"/api/files/{result['path']}"
    
    await db.projects.update_one({"id": project_id}, {"$set": update_data})
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return updated

@api_router.delete("/projects/{project_id}")
async def delete_project(request: Request, project_id: str):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {"message": "Project deleted"}

# ==================== Messages Endpoints ====================
@api_router.post("/messages")
async def create_message(message_data: MessageCreate):
    message = {
        "id": str(uuid.uuid4()),
        "name": message_data.name,
        "email": message_data.email,
        "message": message_data.message,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(message)
    return {"message": "Message sent successfully"}

@api_router.get("/messages")
async def get_messages(request: Request):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    messages = await db.messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return messages

@api_router.delete("/messages/{message_id}")
async def delete_message(request: Request, message_id: str):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    
    return {"message": "Message deleted"}

# ==================== CV Endpoints ====================
@api_router.post("/cv/upload")
async def upload_cv(request: Request, file: UploadFile = File(...)):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    
    cv_id = str(uuid.uuid4())
    path = f"{APP_NAME}/cv/current.pdf"
    data = await file.read()
    result = put_object(path, data, "application/pdf")
    
    await db.cv.delete_many({})
    cv_doc = {
        "id": cv_id,
        "filename": file.filename,
        "storage_path": result["path"],
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    await db.cv.insert_one(cv_doc)
    
    return {"message": "CV uploaded successfully", "filename": file.filename}

@api_router.get("/cv/download")
async def download_cv():
    cv = await db.cv.find_one({}, {"_id": 0})
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    
    data, content_type = get_object(cv["storage_path"])
    
    return Response(
        content=data,
        media_type=content_type,
        headers={"Content-Disposition": f"attachment; filename={cv['filename']}"}
    )

@api_router.get("/cv/current")
async def get_current_cv():
    cv = await db.cv.find_one({}, {"_id": 0})
    if not cv:
        return {"has_cv": False}
    return {"has_cv": True, "filename": cv["filename"], "uploaded_at": cv["uploaded_at"]}

# ==================== Files Download ====================
@api_router.get("/files/{path:path}")
async def download_file(path: str):
    try:
        data, content_type = get_object(path)
        return Response(content=data, media_type=content_type)
    except Exception as e:
        logger.error(f"File download error: {e}")
        raise HTTPException(status_code=404, detail="File not found")

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
