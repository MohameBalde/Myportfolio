"""API du portfolio, déployée en fonction serverless Vercel (toutes les routes /api/*).

Données : MongoDB Atlas. Fichiers (CV, images des projets) : GridFS dans la même base.
Variables d'environnement : MONGO_URL, DB_NAME, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD,
et optionnellement RESEND_API_KEY / NOTIFY_EMAIL pour recevoir un email à chaque message.
"""
import hashlib
import json
import logging
import os
import urllib.request
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import gridfs
import jwt
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, FastAPI, File, HTTPException, Query, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from pymongo import MongoClient
from pymongo.errors import PyMongoError

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("portfolio-api")

JWT_ALGORITHM = "HS256"
# Anti-spam du formulaire de contact : nombre de messages par expéditeur et par heure.
MAX_MESSAGES_PER_HOUR = 5
# Limite de corps de requête des fonctions Vercel : 4,5 Mo.
MAX_UPLOAD_BYTES = 4 * 1024 * 1024

# Projets insérés quand la base est vide, dans l'ordre d'affichage. Images : public/projects/.
# Copie identique dans src/data/fallbackProjects.js (affichée si l'API ne répond pas).
INITIAL_PROJECTS = [
    {
        "title": "Supervision réseau centralisée & détection d'anomalies (PFE)",
        "description": "Projet de fin d'études en binôme, en cours (soutenance en avril 2027). Plateforme de supervision "
                       "basée sur Zabbix et SNMP avec auto-discovery, tableaux de bord Grafana (CPU, RAM, bande passante, "
                       "disponibilité), détection d'anomalies par seuils et alertes email, puis portail Python/Flask et "
                       "rapports PDF automatiques. Labo : VM Debian 13 (test et production) sous VMware Workstation, réseau "
                       "NAT dédié.",
        "technologies": "Zabbix, SNMP, Grafana, Python, Flask, Debian 13, VMware Workstation",
        "category": "Network",
        "image_url": "/projects/supervision-zabbix.webp",
        "order": 1,
    },
    {
        "title": "Infrastructure Windows Server 2025 — AD, iSCSI, SharePoint & Exchange",
        "description": "Environnement d'entreprise complet sous Windows Server 2025 : contrôleur de domaine Active "
                       "Directory, DNS, DHCP et GPO, stockage partagé iSCSI (cible/initiateur), SharePoint (sites "
                       "collaboratifs, bibliothèques, permissions) et Exchange (boîtes aux lettres, flux de messagerie, "
                       "intégration AD).",
        "technologies": "Windows Server 2025, Active Directory, DNS, DHCP, GPO, iSCSI, SharePoint, Exchange",
        "category": "System",
        "image_url": "/projects/windows-server-2025.webp",
        "order": 2,
    },
    {
        "title": "Plateforme de Sauvegarde & Cyber-résilience VMware",
        "description": "Projet d'équipe (5 personnes) : infrastructure virtualisée avec plan de reprise après incident. "
                       "Déploiement de VMware ESXi et vCenter, Active Directory et stockage TrueNAS (iSCSI/SMB), sauvegardes "
                       "planifiées Veeam Backup & Replication avec alertes email, et simulation de PRA : restauration "
                       "intégrale d'un serveur MariaDB sans perte de données.",
        "technologies": "VMware ESXi, vCenter, Veeam Backup & Replication, TrueNAS, Active Directory",
        "category": "System",
        "image_url": "/projects/vmware-pra.webp",
        "order": 3,
    },
    {
        "title": "Makiti — Marketplace en ligne guinéenne",
        "description": "Plateforme e-commerce multi-villes (Conakry, Kankan, Labé, Nzérékoré). Base de données MySQL, "
                       "déploiement sur Railway et workflow Git avec pull requests. Logo SVG aux couleurs de la Guinée.",
        "technologies": "MySQL, Railway, Git, GitHub, SVG",
        "category": "Web",
        "image_url": "/projects/makiti.webp",
        "order": 4,
    },
    {
        "title": "Serveur de Messagerie Zimbra sur CentOS",
        "description": "Plateforme collaborative open-source, alternative à Exchange : installation de Zimbra Collaboration "
                       "Suite sur CentOS, services SMTP, IMAP, POP3 et webmail, gestion des comptes, domaines, alias et "
                       "quotas, configuration DNS (MX, A, SPF) et tests d'envoi/réception.",
        "technologies": "Zimbra Collaboration Suite, CentOS, Postfix, SMTP, IMAP, POP3, DNS",
        "category": "System",
        "image_url": "/projects/zimbra-centos.webp",
        "order": 5,
    },
    {
        "title": "Serveurs Web LEMP & LAMP — Debian et AlmaLinux",
        "description": "Stacks web complètes pour héberger des applications : LAMP (Apache, MySQL, PHP) sur Debian avec "
                       "VirtualHosts et sécurisation, LEMP (Nginx, MariaDB, PHP-FPM) sur AlmaLinux avec reverse proxy, HTTPS "
                       "via Let's Encrypt et pare-feu (UFW, firewalld).",
        "technologies": "Debian, AlmaLinux, Apache, Nginx, MySQL, MariaDB, PHP-FPM, Let's Encrypt",
        "category": "Web",
        "image_url": "/projects/lemp-lamp.webp",
        "order": 6,
    },
    {
        "title": "Téléphonie IP d'Entreprise — Issabel (Asterisk)",
        "description": "PABX IP open-source pour la communication interne : installation du serveur Issabel, extensions SIP "
                       "et plan de numérotation, serveur vocal interactif (IVR), files d'attente et messagerie vocale, tests "
                       "avec softphones et contrôle de la qualité (QoS).",
        "technologies": "Issabel, Asterisk, SIP, VoIP, Zoiper, MicroSIP",
        "category": "Telecom",
        "image_url": "/projects/issabel-voip.webp",
        "order": 7,
    },
]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== Database ====================
_client = None
_setup_done = False


def get_db():
    global _client
    if not os.environ.get("MONGO_URL"):
        raise HTTPException(status_code=503, detail="Database not configured")
    if _client is None:
        # Échoue vite : le frontend affiche ses données de secours plutôt qu'attendre.
        _client = MongoClient(os.environ["MONGO_URL"], serverSelectionTimeoutMS=5000)
    db = _client[os.environ.get("DB_NAME", "portfolio")]
    _ensure_setup(db)
    return db


def _ensure_setup(db):
    """Initialisation paresseuse : une fois par instance, au premier appel."""
    global _setup_done
    if _setup_done:
        return
    db.users.create_index("email", unique=True)
    seed_admin(db)
    if db.projects.count_documents({}) == 0:
        now = datetime.now(timezone.utc).isoformat()
        db.projects.insert_many([{**p, "id": str(uuid.uuid4()), "created_at": now} for p in INITIAL_PROJECTS])
        logger.info("Initial projects seeded")
    _setup_done = True


def seed_admin(db):
    admin_email = os.environ.get("ADMIN_EMAIL", "balde8307@gmail.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD")
    if not admin_password:
        logger.warning("ADMIN_PASSWORD not set, admin user not seeded")
        return
    existing = db.users.find_one({"email": admin_email})
    if existing is None:
        db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Mohamed Baldé",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Admin user created: {admin_email}")
    elif not existing.get("password_hash") or not verify_password(admin_password, existing["password_hash"]):
        # Compte créé ailleurs (ex. à la main dans Atlas) ou mot de passe changé dans Vercel.
        db.users.update_one({"email": admin_email}, {"$set": {
            "password_hash": hash_password(admin_password),
            "name": existing.get("name") or "Mohamed Baldé",
            "role": "admin",
        }})
        logger.info(f"Admin password updated: {admin_email}")


def get_fs(db):
    return gridfs.GridFS(db, collection="files")


@app.exception_handler(PyMongoError)
async def database_error_handler(request: Request, exc: PyMongoError):
    logger.error(f"Database error: {exc}")
    return Response(content='{"detail":"Database unavailable"}', status_code=503, media_type="application/json")


# ==================== Auth Helpers ====================
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")

    user = get_db().users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    user["_id"] = str(user["_id"])
    user.pop("password_hash", None)
    return user


def require_admin(request: Request) -> dict:
    user = get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


def read_upload(upload: UploadFile) -> bytes:
    data = upload.file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Fichier trop volumineux (4 Mo maximum)")
    return data


def store_file(db, upload: UploadFile, default_type: str) -> str:
    data = read_upload(upload)
    file_id = get_fs(db).put(data, filename=upload.filename, content_type=upload.content_type or default_type)
    return str(file_id)


def clean_link(link):
    """Lien optionnel vers le projet (démo, dépôt GitHub…) : vide ou URL http(s)."""
    link = (link or "").strip()
    if link and not link.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Le lien doit commencer par http:// ou https://")
    return link or None


def delete_file(db, file_url):
    """Supprime une image stockée en GridFS (URL de la forme /api/files/<id>)."""
    if not file_url or not file_url.startswith("/api/files/"):
        return
    try:
        get_fs(db).delete(ObjectId(file_url.rsplit("/", 1)[-1]))
    except (InvalidId, gridfs.errors.NoFile):
        pass


# ==================== Models ====================
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class MessageCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(min_length=1, max_length=5000)
    # Champ piège invisible pour les humains : seuls les robots le remplissent.
    website: str = ""


# ==================== Health ====================
@api_router.get("/health")
def health():
    get_db().command("ping")
    return {"status": "ok"}


# ==================== Auth Endpoints ====================
@api_router.post("/auth/login")
def login(credentials: LoginRequest):
    email = credentials.email.lower()
    user = get_db().users.find_one({"email": email})
    if not user or not user.get("password_hash") or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id = str(user["_id"])
    return {
        "access_token": create_access_token(user_id, email),
        "token_type": "bearer",
        "_id": user_id,
        "email": user["email"],
        "name": user.get("name", ""),
        "role": user.get("role", ""),
    }


@api_router.post("/auth/logout")
def logout():
    # Le token est supprimé côté frontend (localStorage).
    return {"message": "Logged out successfully"}


@api_router.get("/auth/me")
def get_me(request: Request):
    return get_current_user(request)


# ==================== Projects Endpoints ====================
@api_router.get("/projects")
def get_projects():
    # Les projets sans "order" (ajoutés depuis l'admin) passent en premier, du plus récent au plus ancien.
    return list(get_db().projects.find({}, {"_id": 0}).sort([("order", 1), ("created_at", -1)]))


@api_router.post("/projects")
def create_project(request: Request, title: str = Query(...), description: str = Query(...),
                   technologies: str = Query(...), category: str = Query(...),
                   link: str = Query(""), image: UploadFile = File(None)):
    require_admin(request)
    db = get_db()
    project = {
        "id": str(uuid.uuid4()),
        "title": title,
        "description": description,
        "technologies": technologies,
        "category": category,
        "link": clean_link(link),
        "image_url": f"/api/files/{store_file(db, image, 'image/jpeg')}" if image else None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    db.projects.insert_one(project)
    return db.projects.find_one({"id": project["id"]}, {"_id": 0})


@api_router.put("/projects/{project_id}")
def update_project(request: Request, project_id: str, title: str = Query(...),
                   description: str = Query(...), technologies: str = Query(...),
                   category: str = Query(...), link: str = Query(""), image: UploadFile = File(None)):
    require_admin(request)
    db = get_db()
    project = db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = {"title": title, "description": description, "technologies": technologies,
                   "category": category, "link": clean_link(link)}
    if image:
        update_data["image_url"] = f"/api/files/{store_file(db, image, 'image/jpeg')}"
        delete_file(db, project.get("image_url"))

    db.projects.update_one({"id": project_id}, {"$set": update_data})
    return db.projects.find_one({"id": project_id}, {"_id": 0})


@api_router.delete("/projects/{project_id}")
def delete_project(request: Request, project_id: str):
    require_admin(request)
    db = get_db()
    project = db.projects.find_one_and_delete({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    delete_file(db, project.get("image_url"))
    return {"message": "Project deleted"}


# ==================== Messages Endpoints ====================
def sender_hash(request: Request) -> str:
    """Empreinte de l'expéditeur (IP hachée, jamais stockée en clair) pour limiter le spam."""
    ip = (request.headers.get("x-forwarded-for") or (request.client.host if request.client else "")).split(",")[0].strip()
    return hashlib.sha256(f"{ip}:{os.environ.get('JWT_SECRET', '')}".encode()).hexdigest()[:24]


def notify_new_message(message: dict):
    """Envoie un email via Resend si RESEND_API_KEY est configurée ; un échec n'empêche pas l'enregistrement."""
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        return
    payload = {
        "from": "Portfolio <onboarding@resend.dev>",
        "to": [os.environ.get("NOTIFY_EMAIL") or os.environ.get("ADMIN_EMAIL", "balde8307@gmail.com")],
        "reply_to": message["email"],
        "subject": f"Nouveau message de {message['name']} (portfolio)",
        "text": f"{message['message']}\n\n— {message['name']} <{message['email']}>",
    }
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        urllib.request.urlopen(req, timeout=5).close()
    except Exception as exc:
        logger.error(f"Email notification failed: {exc}")


@api_router.post("/messages")
def create_message(message_data: MessageCreate, request: Request):
    if message_data.website:
        # Robot détecté : on répond comme si tout allait bien, sans rien enregistrer.
        return {"message": "Message sent successfully"}

    db = get_db()
    sender = sender_hash(request)
    since = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    if db.messages.count_documents({"sender": sender, "created_at": {"$gte": since}}) >= MAX_MESSAGES_PER_HOUR:
        raise HTTPException(status_code=429, detail="Trop de messages envoyés, réessayez plus tard")

    message = {
        "id": str(uuid.uuid4()),
        "name": message_data.name.strip(),
        "email": message_data.email,
        "message": message_data.message.strip(),
        "sender": sender,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    db.messages.insert_one(message)
    notify_new_message(message)
    return {"message": "Message sent successfully"}


@api_router.get("/messages")
def get_messages(request: Request):
    require_admin(request)
    return list(get_db().messages.find({}, {"_id": 0, "sender": 0}).sort("created_at", -1))


@api_router.delete("/messages/{message_id}")
def delete_message(request: Request, message_id: str):
    require_admin(request)
    result = get_db().messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted"}


# ==================== CV Endpoints ====================
@api_router.post("/cv/upload")
def upload_cv(request: Request, file: UploadFile = File(...)):
    require_admin(request)
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    db = get_db()
    file_id = store_file(db, file, "application/pdf")
    for old in db.cv.find({}):
        delete_file(db, f"/api/files/{old.get('file_id', '')}")
    db.cv.delete_many({})
    db.cv.insert_one({
        "id": str(uuid.uuid4()),
        "filename": file.filename,
        "file_id": file_id,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"message": "CV uploaded successfully", "filename": file.filename}


@api_router.get("/cv/download")
def download_cv():
    db = get_db()
    cv = db.cv.find_one({"file_id": {"$exists": True}}, {"_id": 0})
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    try:
        data = get_fs(db).get(ObjectId(cv["file_id"])).read()
    except (InvalidId, gridfs.errors.NoFile):
        raise HTTPException(status_code=404, detail="CV not found")
    return Response(
        content=data,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{cv["filename"]}"'},
    )


@api_router.get("/cv/current")
def get_current_cv():
    cv = get_db().cv.find_one({"file_id": {"$exists": True}}, {"_id": 0})
    if not cv:
        return {"has_cv": False}
    return {"has_cv": True, "filename": cv["filename"], "uploaded_at": cv["uploaded_at"]}


# ==================== Files ====================
@api_router.get("/files/{file_id}")
def download_file(file_id: str):
    try:
        grid_out = get_fs(get_db()).get(ObjectId(file_id))
    except (InvalidId, gridfs.errors.NoFile):
        raise HTTPException(status_code=404, detail="File not found")
    return Response(
        content=grid_out.read(),
        media_type=grid_out.content_type or "application/octet-stream",
        # Un id GridFS ne change jamais de contenu : cache long côté navigateur et CDN.
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )


app.include_router(api_router)

# Même origine que le site en production ; utile seulement en développement local.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
