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
- **Documentation**: See [frontend/README.md](frontend/README.md)

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
- **MongoDB Express**: Currently having authentication issues (optional UI tool)

### Access Points
- **Web App (Frontend)**: http://localhost:3000
- **API Backend**: http://localhost:5001
- **Backend API**: http://localhost:5001/api
- **Backend Health Check**: http://localhost:5001/health
- **MongoDB Admin UI**: http://localhost:8081 (admin/pass)
- **Database Access**: localhost:27017
  - Username: `admin`
  - Connection string: `mongodb://admin:ReLe@rN1ng_M0ng0_D8_P@ssw0rd_2025!@localhost:27017/elearning?authSource=admin`

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

# Rebuild after code changes
docker-compose up -d --build

# Access database shell
docker exec -it elearning-mongodb mongosh

# Access app shell
docker exec -it elearning-app sh
```

### Common Tasks
```bash
# Rebuild frontend after changes
docker-compose build frontend
docker-compose up -d frontend

# Rebuild backend after changes
docker-compose build app
docker-compose up -d app

# View database
docker-compose exec mongodb mongosh
# Then in mongosh shell:
use elearning
show collections
db.courses.find()

# View container resource usage
docker stats

# Check disk usage
docker system df
```

### Testing the Deployment
```bash
# 1. Test Backend Health
curl http://localhost:5001/health
# Expected: {"success":true,"message":"Server is running"}

# 2. Test Frontend
open http://localhost:3000
# or
curl http://localhost:3000 | head -20

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

### Collection Contents
- **55+ API requests** organized in 8 folders
- **Auto-saves** JWT tokens and resource IDs
- **Complete examples** for all request bodies
- **Test scripts** for response validation

See `/postman/README.md` for detailed testing guide.

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
| PUT | `/api/student/courses/:courseId/progress` | Update progress |
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

### Create Quest
```bash
curl -X POST http://localhost:5001/api/quests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Node.js Basics Quiz",
    "description": "Test your Node.js knowledge",
    "courseId": "COURSE_ID",
    "questions": [
      {
        "question": "What is Node.js?",
        "type": "multiple-choice",
        "options": [
          {"text": "A JavaScript runtime", "isCorrect": true},
          {"text": "A database", "isCorrect": false}
        ],
        "points": 10
      }
    ],
    "passingScore": 70
  }'
```

## 📁 Project Structure
```
relearning/
├── src/
│   ├── config/              # Database configuration
│   ├── controllers/         # Business logic
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── questController.js
│   │   ├── studentController.js
│   │   ├── forumController.js
│   │   └── paymentController.js
│   ├── middleware/          # Auth & error handling
│   ├── models/             # MongoDB models
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Quest.js
│   │   ├── Payment.js
│   │   ├── Certificate.js
│   │   └── Forum.js
│   ├── routes/             # API routes
│   ├── services/           # Payment service
│   ├── utils/              # JWT utilities
│   └── server.js           # Entry point
│
├── frontend/               # Frontend React application
│   ├── src/                # Source code
│   ├── public/             # Static assets
│   ├── package.json        # Dependencies
│   └── README.md           # Frontend documentation
│
├── postman/                # API testing collection
│   ├── eLearning-Platform.postman_collection.json
│   ├── eLearning-Platform.postman_environment.json
│   └── README.md
│
├── scripts/                # Deployment and setup scripts
│   └── SAMPLE_DATA.md      # Sample data documentation
│
├── docker-compose.yml      # Docker orchestration
├── Dockerfile             # Node.js container
├── .env.docker            # Environment template
├── README.md              # This file
├── MATERIALS_API.md       # Materials system documentation
├── package.json           # Dependencies
└── LICENSE                # License information
```

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

### Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/elearning
JWT_SECRET=your_secure_secret_key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
NODE_ENV=development
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

See Docker Compose production configuration in `docker-compose.yml` for deployment details.

## 💾 Backup & Restore

### Backup MongoDB
```bash
docker exec elearning-mongodb mongodump \
  --username admin \
  --password your_password \
  --authenticationDatabase admin \
  --out /backup
```

### Restore MongoDB
```bash
docker exec elearning-mongodb mongorestore \
  --username admin \
  --password your_password \
  --authenticationDatabase admin \
  /backup
```

## 🧪 Testing

### Manual Testing
Use the Postman collection in `/postman` directory:
1. Import collection and environment
2. Run requests in sequence
3. Collection Runner for automated tests

### CLI Testing
```bash
# Run example test script
./postman/test-example.sh
```

### Frontend Testing
```bash
cd frontend
npm run test
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

#### Frontend Blank Screen
```bash
# Rebuild frontend
docker-compose build frontend --no-cache
docker-compose restart frontend

# Check browser console for errors
```

#### MongoDB connection issues
```bash
# Test MongoDB connection
docker exec -it elearning-mongodb mongosh -u admin -p

# Check MongoDB logs
docker-compose logs mongodb

# Verify credentials in .env
# Restart both services
docker-compose restart mongodb app
```

#### Database cleanup
```bash
# Remove all data and restart
docker-compose down -v
docker-compose up -d --build
```

#### For MongoDB Express (Optional):
The MongoDB Express UI service has authentication issues and is restarting. This does not affect the main application functionality. To fix it, you would need to ensure the password encoding matches between all services.

#### API won't start
```bash
# Check logs
docker-compose logs app

# Verify MongoDB is healthy
docker-compose ps mongodb

# Check environment variables
docker-compose config
```

#### Port 5001 already in use
```bash
# Find process using port
lsof -i :5001

# Or change port in docker-compose.yml
ports:
  - "5002:5000"
```

#### Frontend not loading
```bash
# Check if frontend container is running
docker-compose ps frontend

# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose build frontend --no-cache
docker-compose up -d frontend
```

## 📋 Documentation Files

- **README.md**: This file with main project documentation
- **MATERIALS_API.md**: Detailed documentation on the materials-based learning system
- **scripts/SAMPLE_DATA.md**: Sample data documentation with courses, quests, and certificates
- **postman/README.md**: Postman collection documentation for API testing
- **frontend/README.md**: Frontend-specific documentation

## 💡 Key Features Highlight

### Materials-Based Learning System
- Unique hierarchical content structure (Bab → Sub-Bab)
- Progress tracking based on completed materials
- Quests only accessible after 100% material completion
- Certificate generation requires both material completion and quest passing

### Role-Based Access Control
- Admin: Platform management and approval workflows
- Mentor: Course and quest creation with approval system
- Student: Course enrollment and assessment participation

### Comprehensive Content Management
- Rich course creation with materials hierarchy
- Multiple question types in assessments
- Progress tracking and certification system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add documentation for new features
5. Test thoroughly using the Postman collection
6. Submit a pull request

## 📞 Support

For issues and questions:
- Check the documentation files in the repository
- Review server logs: `docker-compose logs -f app`
- Test health endpoint: `curl http://localhost:5001/health`
- Use the Postman collection in `/postman` for API examples

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

Built with React, Node.js, Express, MongoDB, and Docker
