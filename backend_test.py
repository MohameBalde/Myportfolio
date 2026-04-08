#!/usr/bin/env python3
"""
Backend API Testing for Mohamed Baldé Portfolio
Tests all API endpoints including auth, projects, messages, and CV management
"""

import requests
import sys
import json
from datetime import datetime
import io

class PortfolioAPITester:
    def __init__(self, base_url="https://telecom-systems-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_credentials = {
            "email": "balde8307@gmail.com",
            "password": "Admin@2025"
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = self.session.get(url, params=params)
            elif method == 'POST':
                if files:
                    response = self.session.post(url, data=data, files=files, params=params)
                else:
                    response = self.session.post(url, json=data, params=params)
            elif method == 'PUT':
                if files:
                    response = self.session.put(url, data=data, files=files, params=params)
                else:
                    response = self.session.put(url, json=data, params=params)
            elif method == 'DELETE':
                response = self.session.delete(url, params=params)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error details: {error_detail}")
                except:
                    print(f"   Response text: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_auth_flow(self):
        """Test complete authentication flow"""
        print("\n" + "="*50)
        print("TESTING AUTHENTICATION FLOW")
        print("="*50)
        
        # Test login
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=self.admin_credentials
        )
        
        if not success:
            print("❌ Login failed, cannot continue with protected endpoints")
            return False
            
        # Test get current user
        success, user_data = self.run_test(
            "Get Current User",
            "GET", 
            "auth/me",
            200
        )
        
        if success and user_data.get("role") == "admin":
            print(f"✅ Authenticated as admin: {user_data.get('email')}")
        
        return success

    def test_projects_crud(self):
        """Test projects CRUD operations"""
        print("\n" + "="*50)
        print("TESTING PROJECTS CRUD")
        print("="*50)
        
        # Get initial projects
        success, projects = self.run_test(
            "Get All Projects",
            "GET",
            "projects",
            200
        )
        
        if success:
            print(f"✅ Found {len(projects)} initial projects")
            
        # Create new project
        project_data = {
            "title": "Test Project",
            "description": "Test project description",
            "technologies": "Python, FastAPI",
            "category": "Test"
        }
        
        success, new_project = self.run_test(
            "Create Project",
            "POST",
            "projects",
            200,
            params=project_data
        )
        
        project_id = None
        if success and new_project.get("id"):
            project_id = new_project["id"]
            print(f"✅ Created project with ID: {project_id}")
            
            # Update project
            update_data = {
                "title": "Updated Test Project",
                "description": "Updated description",
                "technologies": "Python, FastAPI, MongoDB",
                "category": "Updated"
            }
            
            success, updated = self.run_test(
                "Update Project",
                "PUT",
                f"projects/{project_id}",
                200,
                params=update_data
            )
            
            if success:
                print(f"✅ Updated project title: {updated.get('title')}")
            
            # Delete project
            success, _ = self.run_test(
                "Delete Project",
                "DELETE",
                f"projects/{project_id}",
                200
            )
            
            if success:
                print(f"✅ Deleted test project")
        
        return True

    def test_messages_flow(self):
        """Test messages functionality"""
        print("\n" + "="*50)
        print("TESTING MESSAGES FLOW")
        print("="*50)
        
        # Create a test message (public endpoint)
        message_data = {
            "name": "Test User",
            "email": "test@example.com",
            "message": "This is a test message from the contact form"
        }
        
        success, response = self.run_test(
            "Create Message (Contact Form)",
            "POST",
            "messages",
            200,
            data=message_data
        )
        
        if success:
            print("✅ Contact form message created successfully")
        
        # Get all messages (admin only)
        success, messages = self.run_test(
            "Get All Messages (Admin)",
            "GET",
            "messages",
            200
        )
        
        if success:
            print(f"✅ Retrieved {len(messages)} messages")
            
            # Delete the test message if it exists
            for message in messages:
                if message.get("email") == "test@example.com":
                    success, _ = self.run_test(
                        "Delete Test Message",
                        "DELETE",
                        f"messages/{message['id']}",
                        200
                    )
                    if success:
                        print("✅ Deleted test message")
                    break
        
        return True

    def test_cv_management(self):
        """Test CV upload/download functionality"""
        print("\n" + "="*50)
        print("TESTING CV MANAGEMENT")
        print("="*50)
        
        # Check current CV status
        success, cv_status = self.run_test(
            "Get Current CV Status",
            "GET",
            "cv/current",
            200
        )
        
        if success:
            print(f"✅ CV status: {'Has CV' if cv_status.get('has_cv') else 'No CV uploaded'}")
        
        # Create a dummy PDF for testing
        pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF"
        
        # Test CV upload
        files = {'file': ('test_cv.pdf', io.BytesIO(pdf_content), 'application/pdf')}
        success, upload_response = self.run_test(
            "Upload CV",
            "POST",
            "cv/upload",
            200,
            files=files
        )
        
        if success:
            print(f"✅ CV uploaded: {upload_response.get('filename')}")
            
            # Test CV download
            success, _ = self.run_test(
                "Download CV",
                "GET",
                "cv/download",
                200
            )
            
            if success:
                print("✅ CV download successful")
        
        return True

    def test_logout(self):
        """Test logout functionality"""
        print("\n" + "="*50)
        print("TESTING LOGOUT")
        print("="*50)
        
        success, _ = self.run_test(
            "Admin Logout",
            "POST",
            "auth/logout",
            200
        )
        
        if success:
            print("✅ Logout successful")
            
            # Verify we can't access protected endpoints
            success, _ = self.run_test(
                "Access Protected After Logout",
                "GET",
                "auth/me",
                401
            )
            
            if success:
                print("✅ Protected endpoints properly secured after logout")
        
        return success

def main():
    """Run all tests"""
    print("🚀 Starting Portfolio Backend API Tests")
    print("=" * 60)
    
    tester = PortfolioAPITester()
    
    # Test authentication first
    if not tester.test_auth_flow():
        print("\n❌ Authentication failed, stopping tests")
        return 1
    
    # Test all CRUD operations
    tester.test_projects_crud()
    tester.test_messages_flow()
    tester.test_cv_management()
    tester.test_logout()
    
    # Print final results
    print("\n" + "="*60)
    print("📊 FINAL TEST RESULTS")
    print("="*60)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())