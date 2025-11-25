# Postman Collection - eLearning Platform API

Complete Postman collection for testing the eLearning Platform API with all endpoints organized by functionality.

## Files in this Directory

- **eLearning-Platform.postman_collection.json** - Main API collection with all endpoints
- **eLearning-Platform.postman_environment.json** - Environment variables for local development

## Quick Start

### 1. Import into Postman

#### Option A: Import Collection File
1. Open Postman
2. Click "Import" button (top left)
3. Drag and drop both JSON files or click "Choose Files"
4. Select:
   - `eLearning-Platform.postman_collection.json`
   - `eLearning-Platform.postman_environment.json`
5. Click "Import"

#### Option B: Import via URL (if hosted on GitHub)
1. Click "Import" > "Link"
2. Paste the raw URL to the collection file
3. Click "Continue" and "Import"

### 2. Set Environment

1. Click the environment dropdown (top right)
2. Select "eLearning Platform - Local"
3. Verify `base_url` is set to `http://localhost:5001`

### 3. Start Testing

The collection is organized into folders:
- Authentication
- Admin
- Courses
- Quests
- Student
- Forum
- Payments
- Health Check

## Environment Variables

The environment includes these variables that are automatically set by test scripts:

| Variable | Description | Auto-set |
|----------|-------------|----------|
| base_url | API base URL | Manual |
| jwt_token | Authentication token | Auto (on login) |
| user_id | Current user ID | Auto (on login) |
| user_role | User role (admin/mentor/student) | Auto (on login) |
| course_id | Last created/viewed course ID | Auto |
| quest_id | Last created/viewed quest ID | Auto |
| question_id | Last created forum question ID | Auto |
| reply_id | Last created reply ID | Auto |
| certificate_id | Last earned certificate ID | Auto |
| payment_intent_id | Stripe payment intent ID | Auto |
| client_secret | Stripe client secret | Auto |

## Testing Workflow

### Complete User Journey

Follow this sequence to test the full platform:

#### 1. Authentication Flow

```
1. Register User → Creates account and auto-saves token
2. Login → Updates token and user info
3. Get Current User → Verify authentication works
```

#### 2. Admin Flow

```
1. Login as Admin
2. Get Dashboard Stats → View platform metrics
3. Get Pending Courses → Review submissions
4. Approve Course → Approve a course
5. Approve Price → Approve pricing
6. Approve Quest → Approve assessment
```

#### 3. Mentor Flow

```
1. Register/Login as Mentor
2. Create Course → Submit new course (saves course_id)
3. Wait for Admin Approval
4. Create Quest → Add assessment (saves quest_id)
5. Get My Courses → View all created courses
6. Get My Quests → View all created quests
```

#### 4. Student Flow

```
1. Register/Login as Student
2. Get All Courses → Browse available courses
3. Get Single Course → View course details (saves course_id)
4. Enroll in Course → Purchase course
5. Get Enrolled Courses → View my courses
6. Get Course Quests → View available assessments
7. Submit Quest Attempt → Take quiz (auto-saves certificate_id if passed)
8. Get My Certificates → View earned certificates
9. Get Payment History → View transactions
```

#### 5. Forum Flow

```
1. Create Question → Post in forum (saves question_id)
2. Get Course Questions → View all questions
3. Add Reply → Answer question (saves reply_id)
4. Vote on Question → Upvote/downvote
5. Vote on Reply → Upvote/downvote
6. Accept Reply as Answer → Mark as solved (question author only)
```

## Request Examples

### 1. Register and Auto-Login

**Request:** `POST /api/auth/register`

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student"
}
```

**Auto Actions:**
- Saves `jwt_token` to environment
- Saves `user_id` to environment

### 2. Create Course (Mentor)

**Request:** `POST /api/courses`

Requires: Bearer Token (automatically added)

```json
{
    "title": "Introduction to Node.js",
    "description": "Learn Node.js from scratch",
    "category": "programming",
    "difficulty": "beginner",
    "price": {
        "amount": 49.99,
        "currency": "USD"
    },
    "tags": ["nodejs", "javascript", "backend"]
}
```

**Auto Actions:**
- Saves `course_id` for subsequent requests

### 3. Submit Quest Attempt (Student)

**Request:** `POST /api/student/quests/:questId/attempt`

```json
{
    "answers": [
        {
            "questionId": "question_id_1",
            "answer": "A JavaScript runtime"
        },
        {
            "questionId": "question_id_2",
            "answer": "True"
        }
    ],
    "startedAt": "2025-10-17T12:00:00.000Z",
    "timeTaken": 25
}
```

**Auto Actions:**
- If passed: saves `certificate_id`

## Authorization

Most endpoints require authentication. The collection automatically handles this:

1. **Login/Register** sets the `jwt_token` variable
2. **Protected endpoints** use Bearer Token auth with `{{jwt_token}}`
3. Token is automatically included in request headers

### Manual Token Setup (if needed)

1. Go to "Authorization" tab in any request
2. Type: Bearer Token
3. Token: `{{jwt_token}}`

## Collection Features

### Automatic Variable Management

The collection includes test scripts that automatically:

- Save JWT token on login/register
- Save IDs after creating resources
- Extract payment intent details
- Store certificate IDs after passing quests

### Pre-request Scripts

Currently empty, but can be used for:
- Dynamic timestamp generation
- Custom authentication logic
- Request preprocessing

### Test Scripts

Included in key requests to:
- Validate response status
- Extract and save important IDs
- Set environment variables

## Testing Different User Roles

### Create Multiple Users

1. **Admin User:**
   - Register with role: "admin" (requires existing admin or manual DB insertion)
   - Has access to all admin endpoints

2. **Mentor User:**
   ```json
   {
       "name": "Jane Mentor",
       "email": "mentor@example.com",
       "password": "password123",
       "role": "mentor"
   }
   ```

3. **Student User:**
   ```json
   {
       "name": "Bob Student",
       "email": "student@example.com",
       "password": "password123",
       "role": "student"
   }
   ```

### Switch Between Users

1. Login with different user credentials
2. Token automatically updates
3. Test role-specific endpoints

## Common Use Cases

### Scenario 1: Course Creation & Approval

```
1. Login as Mentor
2. Create Course
3. Login as Admin
4. Get Pending Courses
5. Approve Course
6. Approve Price
```

### Scenario 2: Student Enrollment & Certification

```
1. Login as Student
2. Get All Courses
3. Enroll in Course
4. Get Course Quests
5. Submit Quest Attempt
6. Get My Certificates (if passed)
```

### Scenario 3: Forum Discussion

```
1. Login as Student
2. Create Question
3. Login as Mentor
4. Add Reply
5. Login as Original Student
6. Accept Reply as Answer
```

## Troubleshooting

### "Unauthorized" Error

**Problem:** Getting 401 Unauthorized

**Solutions:**
1. Check if `jwt_token` is set in environment
2. Login again to refresh token
3. Verify token in Authorization tab

### "Not found" Error

**Problem:** Resource not found (404)

**Solutions:**
1. Check if IDs are set correctly in environment
2. Verify the resource was created successfully
3. Check if you're using the correct endpoint

### Variables Not Auto-Setting

**Problem:** IDs not saving automatically

**Solutions:**
1. Check "Tests" tab in the request
2. Verify response status is successful (200, 201)
3. Manually set variables if needed:
   - Go to Environment
   - Edit variable value

### Different Base URL

To use a different environment (staging, production):

1. Click environment dropdown
2. Click "+" to create new environment
3. Set `base_url` to your server URL
4. Save and select the new environment

## Advanced Features

### Run Collection with Newman (CLI)

```bash
# Install Newman
npm install -g newman

# Run collection
newman run eLearning-Platform.postman_collection.json \
  -e eLearning-Platform.postman_environment.json

# Generate HTML report
newman run eLearning-Platform.postman_collection.json \
  -e eLearning-Platform.postman_environment.json \
  -r html
```

### Collection Runner

1. Click "Runner" button (top left)
2. Select "eLearning Platform API" collection
3. Select environment
4. Choose folder or run all requests
5. Click "Run eLearning Platform API"

### Monitoring

Set up Postman monitors to:
- Run tests on schedule
- Monitor API health
- Get alerts on failures

## Response Examples

### Successful Login

```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "student"
    }
}
```

### Course List

```json
{
    "success": true,
    "count": 2,
    "totalPages": 1,
    "currentPage": 1,
    "data": [
        {
            "_id": "507f1f77bcf86cd799439011",
            "title": "Introduction to Node.js",
            "description": "Learn Node.js from scratch",
            "category": "programming",
            "difficulty": "beginner",
            "price": {
                "amount": 49.99,
                "currency": "USD"
            },
            "creator": {
                "_id": "507f191e810c19729de860ea",
                "name": "Jane Mentor"
            },
            "enrollmentCount": 15,
            "rating": {
                "average": 4.5,
                "count": 10
            }
        }
    ]
}
```

### Quest Result with Certificate

```json
{
    "success": true,
    "message": "Congratulations! You passed the quest!",
    "data": {
        "score": 90,
        "passed": true,
        "earnedPoints": 27,
        "totalPoints": 30,
        "certificate": "507f1f77bcf86cd799439012",
        "gradedAnswers": [...]
    }
}
```

## API Documentation Links

- **Full API Documentation**: See `API_DOCUMENTATION.md` in project root
- **Docker Deployment**: See `DOCKER_DEPLOYMENT.md`
- **Quick Start Guide**: See `QUICK_START.md`

## Support

If you encounter issues:

1. Check API is running: `GET /health`
2. Verify environment variables are set
3. Review response in "Console" (View > Show Postman Console)
4. Check API logs: `docker-compose logs -f app`

## Collection Maintenance

To update the collection:

1. Make changes in Postman
2. Export collection: Collection menu > Export
3. Choose "Collection v2.1"
4. Replace the JSON file in this directory

---

**Happy Testing!** 🚀
