# eLearning Platform - Postman Collection

This Postman collection provides API access to the eLearning platform with endpoints for Admin, Mentor, and Student roles.

## 📋 Collection Contents

The collection includes all API endpoints organized by functionality:

### Authentication
- Login for Admin, Mentor, and Student roles
- JWT token-based authentication

### Public Endpoints
- Browse published courses
- Course details access

### Admin Endpoints
- Course approval/rejection workflows
- User management
- Dashboard statistics

### Mentor Endpoints
- Course creation and management
- Material and sub-material management
- Quest creation

### Student Endpoints
- Course enrollment
- Progress tracking
- Material access and completion
- Quest attempts
- Certificate management

## 🚀 Setup Instructions

### 1. Import the Collection
1. Open Postman
2. Click "Import" in the top left
3. Select the collection file: `eLearning-Platform.postman_collection.json`
4. Import the environment file: `eLearning-Platform.postman_environment.json`

### 2. Configure Environment
- Select the imported environment from the dropdown
- The environment is pre-configured with local development URL

### 3. Authentication
- First, login using the "Login Admin", "Login Mentor", or "Login Student" requests
- The JWT tokens will be stored in environment variables
- Use these tokens for authenticated requests

## 🔐 Default Credentials

### Admin
- Email: `admin@elearning.com`
- Password: `admin123`

### Mentor
- Email: `emily.roberts@elearning.com`
- Password: `mentor123`

### Student
- Email: `alex.johnson@student.com`
- Password: `student123`

## 🏗️ API Structure

### Course Management
- `/api/courses` - Public course browsing
- `/api/courses/mentor/my-courses` - Mentor course management
- `/api/courses/:id/materials` - Add materials to courses
- `/api/courses/:courseId/materials/:materialId/sub-materials` - Add sub-materials

### Student Functions
- `/api/student/courses` - Enrolled courses
- `/api/student/enroll/:courseId` - Course enrollment
- `/api/student/courses/:courseId/materials` - Course materials access
- `/api/student/courses/:courseId/materials/complete` - Mark materials complete
- `/api/student/certificates` - Earned certificates

### Administrative Functions
- `/api/admin/courses/pending` - Pending course approval
- `/api/admin/courses/:id/approve` - Approve courses
- `/api/admin/courses/:id/reject` - Reject courses
- `/api/admin/stats` - Dashboard statistics

### Assessment System
- `/api/quests` - Create assessments
- `/api/quests/course/:courseId` - Get course quests
- `/api/student/quests/:questId/attempt` - Submit quest attempts

## 📚 Sample Endpoints
- Full-Stack Web Development Bootcamp: `692b260e5815c17df23c6e10`
 - Mobile App Development with React Native: `692b260e5815c17df23c6e20`
 - Machine Learning with Python: `692b260e5815c17df23c6e19`
- Learn Page: `http://localhost:3000/learn/692b260e5815c17df23c6e10`

## 🧪 Testing Workflow
1. Login with desired role
2. Access appropriate endpoints
3. Test functionality based on role permissions
4. Use the student dashboard to track learning progress
5. Test the complete materials workflow: enroll → complete materials → take quest → earn certificate

## 📚 Materials-Based Learning System
- **Bab/Sub-Bab Structure**: Test course materials organized as main topics (Bab) with detailed content (Sub-Bab)
- **Progress Tracking**: Verify individual completion tracking for each sub-material with aggregate progress calculation
- **Gate-Controlled Assessments**: Test that quests are only accessible after 100% material completion
- **Certificate System**: Verify certificates are issued upon successful quest completion

## 🔄 Complete Learning Flow Testing
1. Student enrolls in a course
2. Access materials with `GET /api/student/courses/:courseId/materials`
3. Complete sub-materials with `POST /api/student/courses/:courseId/materials/complete`
4. Verify progress updates and quest accessibility
5. Take and pass the quest
6. Verify certificate generation

## ⚙️ Additional Notes
- All endpoints require proper authentication except public course browsing
- The system implements granular access controls
- Progress tracking is available at material/sub-material level
- Certificate generation happens automatically on quest completion with passing score