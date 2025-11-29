# eLearning Platform

A comprehensive full-stack eLearning management system with React frontend, Node.js backend, and MongoDB database. Supports three user roles (Admin, Mentor, Student) with complete course management, assessments, payments, certifications, and Q&A forums.

## 🚀 Features

### User Roles
- **Admin**: Approve courses/quests/pricing, manage users, view analytics
- **Mentor**: Create courses and assessments, propose pricing (requires admin approval)
- **Student**: Enroll in courses, complete materials and quests, earn certificates, participate in forums

### Complete Learning Flow
- **Student Enrollment**: Students can enroll in courses through the platform
- **Material Completion**: Students progress through babs and sub-babs incrementally (0% → 100%)
- **Progress Monitoring**: System tracks completion of each sub-bab individually and calculates overall progress
- **Quest Access Control**: Students can only access course quests after achieving 100% material completion
- **Assessment**: Students take quests (assessments) after completing all materials
- **Certificate Issuance**: Successful quest completion triggers automatic certificate generation

### Learning Progression Structure
- **Bab/Sub-bab Organization**: Course materials structured as main topics (Bab) with detailed content (Sub-bab)
- **Progress Tracking**: Individual completion tracking for each sub-bab with aggregate progress calculation
- **Gate-Controlled Assessments**: Quests only accessible after 100% material completion
- **Certification System**: Certificates issued upon successful quest completion
- **Role-based Access**: Separate interfaces for Admin, Mentor, and Student roles

### Additional Core Functionality
- JWT-based authentication with role-based access control
- Course management with approval workflow
- Quest system with multiple question types (multiple-choice, true/false, short-answer)
- Stripe payment integration
- Q&A forum with voting system
- Real-time progress tracking
- Certificate generation system
- Rich content management system

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **API Client**: Axios + React Query

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Stripe
- **Security**: bcryptjs for password hashing

### DevOps
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (for frontend)
- **Proxy**: Vite dev server / Nginx reverse proxy

## 🚀 Quick Start with Docker

### Prerequisites
- Docker Desktop installed
- 4GB+ RAM available
- Ports available: 3000 (frontend), 5001 (API), 8081 (MongoDB UI), 27017 (MongoDB)

### Setup (3 steps)
```bash
# 1. Configure environment
cp .env.docker .env
# Edit .env and update: MONGO_ROOT_PASSWORD, JWT_SECRET, STRIPE_SECRET_KEY

# 2. Start services
docker-compose up --build -d

# 3. Verify
curl http://localhost:5001/health
```

### Services Overview
✅ **Successfully deployed** with Docker Compose
- **Frontend (React)**: Running on port 3000
- **Backend (Node.js)**: Running on port 5001 (mapped from 5000)
- **Database (MongoDB)**: Running on port 27017
- **Seeder**: Completed successfully, populated database with sample data

### Access Points
- **Web App (Frontend)**: http://localhost:3000
- **API Backend**: http://localhost:5001
- **Backend API**: http://localhost:5001/api
- **Backend Health Check**: http://localhost:5001/health
- **MongoDB Admin UI**: http://localhost:8081 (admin/pass)
- **Database Access**: localhost:27017

### Essential Docker Commands
```bash
# View status of all services
docker-compose ps

# View logs
# All services
docker-compose logs -f

# Specific service logs
docker-compose logs -f app
docker-compose logs -f mongodb
docker-compose logs -f frontend

# Restart services
# All services
docker-compose restart

# Single service
docker-compose restart app
docker-compose restart mongodb
docker-compose restart frontend

# Stop services
docker-compose stop

# Start services
docker-compose up -d

# Full redeploy
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Remove all (including data)
docker-compose down -v
```

### Testing the Deployment
```bash
# 1. Test Backend Health
curl http://localhost:5001/health
# Expected: {"success":true,"message":"Server is running"}

# 2. Test Frontend
open http://localhost:3000

# 3. Test API Endpoints
# Get all courses
curl http://localhost:5001/api/courses

# Health check
curl http://localhost:5001/health
```

### Port Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 5001 | http://localhost:5001/api |
| Backend Health | 5001 | http://localhost:5001/health |
| MongoDB | 27017 | mongodb://localhost:27017 |
| MongoDB Express | 8081 | http://localhost:8081 |

## 🧪 API Testing with Postman

### Import Collection
1. Open Postman
2. Click "Import" → Select files from `/postman` directory:
   - `eLearning-Platform.postman_collection.json`
   - `eLearning-Platform.postman_environment.json`
3. Select "eLearning Platform - Local" environment
4. Test with "Health Check" request

## 🧑‍🏫 Sample User Credentials

After deployment, the database is seeded with sample data:

### Admin User
- **Email**: admin@elearning.com
- **Password**: admin123

### Mentor Users
- **Emily Roberts**: emily.roberts@elearning.com / mentor123
- **Michael Chen**: michael.chen@elearning.com / mentor123
- **Lisa Anderson**: lisa.anderson@elearning.com / mentor123

### Student Users
- **Alex Johnson**: alex.johnson@student.com / student123
- **Maria Garcia**: maria.garcia@student.com / student123
- **David Kim**: david.kim@student.com / student123
- **Emma Wilson**: emma.wilson@student.com / student123

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Admin (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/courses/pending` | Get pending courses |
| PUT | `/api/admin/courses/:id/approve` | Approve course |
| PUT | `/api/admin/courses/:id/reject` | Reject course |
| GET | `/api/admin/pricing/pending` | Get pending prices |
| PUT | `/api/admin/courses/:id/approve-price` | Approve price |
| GET | `/api/admin/quests/pending` | Get pending quests |
| PUT | `/api/admin/quests/:id/approve` | Approve quest |
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/:id/role` | Update user role |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all approved courses |
| GET | `/api/courses/:id` | Get single course |
| POST | `/api/courses` | Create course (Mentor/Admin) |
| PUT | `/api/courses/:id` | Update course (Creator/Admin) |
| DELETE | `/api/courses/:id` | Delete course (Creator/Admin) |
| GET | `/api/courses/mentor/my-courses` | Get mentor's courses |

### Materials System (Bab/Sub-Bab)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/courses/:courseId/materials` | Get course materials & progress |
| POST | `/api/student/courses/:courseId/materials/complete` | Mark material as completed |
| POST | `/api/courses/:courseId/materials` | Add material (Bab) to course |
| PUT | `/api/courses/:courseId/materials/:materialId` | Update material (Bab) |
| DELETE | `/api/courses/:courseId/materials/:materialId` | Delete material (Bab) |
| POST | `/api/courses/:courseId/materials/:materialId/sub-materials` | Add sub-material (Sub-Bab) |
| PUT | `/api/courses/:courseId/materials/:materialId/sub-materials/:subMaterialId` | Update sub-material |
| DELETE | `/api/courses/:courseId/materials/:materialId/sub-materials/:subMaterialId` | Delete sub-material |

### Quests (Assessments)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quests` | Create quest (Mentor/Admin) |
| GET | `/api/quests/course/:courseId` | Get course quests |
| GET | `/api/quests/:id` | Get single quest |
| PUT | `/api/quests/:id` | Update quest (Creator/Admin) |
| GET | `/api/quests/mentor/my-quests` | Get mentor's quests |

### Student
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/student/enroll/:courseId` | Enroll in course |
| GET | `/api/student/courses` | Get enrolled courses |
| POST | `/api/student/quests/:questId/attempt` | Submit quest attempt |
| GET | `/api/student/quests/:questId/attempts` | Get quest attempts |
| GET | `/api/student/certificates` | Get my certificates |
| GET | `/api/student/certificates/:id` | Get single certificate |
| GET | `/api/student/payments` | Get payment history |

### Forum
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/forum` | Create question |
| GET | `/api/forum/course/:courseId` | Get course questions |
| GET | `/api/forum/:id` | Get single question |
| PUT | `/api/forum/:id` | Update question |
| DELETE | `/api/forum/:id` | Delete question |
| POST | `/api/forum/:id/reply` | Add reply |
| PUT | `/api/forum/:questionId/reply/:replyId` | Update reply |
| PUT | `/api/forum/:questionId/reply/:replyId/accept` | Accept answer |
| POST | `/api/forum/:id/vote` | Vote on question |
| POST | `/api/forum/:questionId/reply/:replyId/vote` | Vote on reply |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-intent` | Create payment intent |
| POST | `/api/payments/confirm` | Confirm payment |
| POST | `/api/payments/:id/refund` | Request refund |
| GET | `/api/payments/:id` | Get payment details |

## 📖 Materials-Based Learning System

The platform implements a sophisticated materials-based learning system where students must complete all course materials before taking assessments.

### Learning Flow
1. Student enrolls in course
2. Student views materials (Bab/Sub-Bab)
3. Student marks sub-materials as completed (one by one)
4. Progress updates: (completed sub-babs / total sub-babs) × 100
5. When materialsProgress = 100%
   - Unlock quest (can attempt)
   - Student takes quest
   - Student passes quest (score ≥ passingScore)
   - Certificate issued
6. Course marked as completed only when both materials 100% and quest passed

### Content Structure
- **Course** contains **Materials (Bab - Chapter)** which contain **SubMaterials (Sub-Bab)**
- Progress is calculated based on completed sub-materials
- Certificate generation requires both 100% material completion AND passing the quest

## 🗃 Database Models

### User
- Authentication & profile management
- Role-based permissions (admin, mentor, student)
- Enrollment and certification tracking

### Course
- Content and pricing management
- Approval workflow (pending → approved/rejected)
- Quest associations and enrollment metrics

### Quest
- Multiple question types with auto-grading
- Passing score validation and attempt tracking

### Payment
- Stripe integration for transactions
- Payment status tracking and refund support

### Certificate
- Auto-generation on quest completion
- Unique certificate numbers with grades

### Forum
- Q&A discussions with reply threading
- Voting system and answer acceptance

### Materials (Bab/Sub-bab)
- Hierarchical content structure for courses
- Progress tracking per sub-material
- Completion requirements for assessments

## 🧑‍💻 Development

### Local Setup (without Docker)
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start MongoDB
mongod

# Run development server
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## 🔒 Security

- Password hashing with bcryptjs
- JWT-based authentication
- Role-based access control
- Input validation
- Secure payment processing with Stripe
- Protection against common web vulnerabilities

## 🚀 Production Deployment

### Important Security Steps

1. **Change default credentials**:
   - MongoDB password
   - JWT secret (use `openssl rand -base64 64`)
   - Mongo Express credentials

2. **Environment configuration**:
   - Set `NODE_ENV=production`
   - Use production MongoDB (MongoDB Atlas recommended)
   - Configure Stripe webhook endpoint

3. **Security hardening**:
   - Disable Mongo Express in production
   - Use HTTPS with reverse proxy (nginx/traefik)
   - Configure firewall to only expose port 5001
   - Set up SSL certificates (Let's Encrypt)

4. **Monitoring**:
   - Set up logging and monitoring
   - Configure health checks
   - Monitor resource usage

## 🔧 Usage Examples

### Register User
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Course (Mentor/Admin)
```bash
curl -X POST http://localhost:5001/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Introduction to Node.js",
    "description": "Learn Node.js from scratch",
    "category": "programming",
    "difficulty": "beginner",
    "price": {
      "amount": 49.99,
      "currency": "USD"
    },
    "tags": ["nodejs", "javascript", "backend"]
  }'
```

## 🛠 Troubleshooting

### Docker-Related Issues

#### If services don't start properly:
1. Ensure Docker and Docker Compose are installed and running
2. Check that ports 3000, 5001, and 27017 are not in use by other applications
3. Run `docker-compose logs` to check for specific error messages

#### Services Won't Start
```bash
# Clean restart
docker-compose down
docker-compose up -d

# Or with rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Backend Shows "Connection Refused"
```bash
# Wait for MongoDB to be ready
docker-compose logs mongodb

# Restart app
docker-compose restart app
```

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :5001

# Kill process
kill -9 <PID>

# Or change Docker port mapping in docker-compose.yml
ports:
  - "5002:5000"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add documentation for new features
5. Test thoroughly using the Postman collection
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

Built with React, Node.js, Express, MongoDB, and Docker