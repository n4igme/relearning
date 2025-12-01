# Materials-Based Learning Progress System

## Overview

This document describes the new materials-based learning progress system. Students now learn through a hierarchical material structure (Bab → Sub-Bab) and their progress is calculated based on completed materials. Certificates are only issued after completing all materials AND passing the quest.

## Data Structure

### Materials Hierarchy
```
Course
├── Materials (Bab - Chapter)
│   ├── title: string
│   ├── description: string
│   ├── order: number
│   └── SubMaterials (Sub-Bab)
│       ├── title: string
│       ├── type: 'video' | 'article' | 'resource'
│       ├── content: string (for articles)
│       ├── url: string (for videos/resources)
│       ├── duration: number (minutes)
│       └── order: number
└── content: array (legacy, kept for backwards compatibility)
```

### Student Progress Tracking
```
User.enrolledCourses[{
  course: ObjectId,
  enrolledAt: Date,
  progress: number,                    // 0-100, based on completed materials
  completed: boolean,                  // true only if materials 100% AND quest passed
  materialsCompleted: [{               // Track which sub-materials completed
    materialId: ObjectId,
    subMaterialId: ObjectId,
    completedAt: Date
  }],
  materialsProgress: number,           // 0-100, percentage of sub-materials done
  questAttempted: boolean,
  questPassed: boolean
}]
```

## Learning Flow

```
1. Student enrolls in course
   ↓
2. Student views materials (Bab/Sub-Bab)
   ↓
3. Student marks sub-materials as completed (one by one)
   ↓
4. Progress updates: (completed sub-babs / total sub-babs) × 100
   ↓
5. When materialsProgress = 100%
   ├─ Unlock quest (can attempt)
   ├─ Student takes quest
   ├─ Student passes quest (score >= passingScore)
   │  ↓
   │  Certificate issued
   │  Course marked as completed
   │
   └─ Student fails quest
      ├─ Can retry after materials review
      └─ No certificate yet
```

## API Endpoints

### Student Endpoints

#### 1. Get Course Materials & Progress
**Endpoint:** `GET /api/student/courses/:courseId/materials`

**Auth:** Private/Student

**Response:**
```json
{
  "success": true,
  "data": {
    "course": {
      "_id": "courseId",
      "title": "Course Title",
      "description": "Description"
    },
    "materials": [
      {
        "_id": "materialId",
        "title": "Bab 1: Introduction",
        "description": "Intro to the course",
        "order": 1,
        "subMaterials": [
          {
            "_id": "subMaterialId",
            "title": "1.1 Course Overview",
            "type": "video",
            "url": "https://example.com/video.mp4",
            "duration": 15,
            "order": 1,
            "completed": false  // User's completion status
          },
          {
            "_id": "subMaterialId2",
            "title": "1.2 Getting Started",
            "type": "article",
            "content": "Article content here",
            "order": 2,
            "completed": false
          }
        ]
      }
    ],
    "progress": 0,                    // Overall progress (0-100)
    "completedCount": 0,              // How many sub-materials completed
    "totalSubMaterials": 5,           // Total sub-materials in course
    "allMaterialsCompleted": false    // Can take quest when true
  }
}
```

#### 2. Mark Material as Completed
**Endpoint:** `POST /api/student/courses/:courseId/materials/complete`

**Auth:** Private/Student

**Request Body:**
```json
{
  "materialId": "materialId",
  "subMaterialId": "subMaterialId"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Material marked as completed",
  "data": {
    "progress": 20,
    "materialsProgress": 20,
    "completedCount": 1,
    "totalSubMaterials": 5,
    "enrollment": {
      "course": "courseId",
      "progress": 20,
      "materialsProgress": 20,
      "materialsCompleted": [
        {
          "materialId": "materialId",
          "subMaterialId": "subMaterialId",
          "completedAt": "2024-01-15T10:30:00Z"
        }
      ]
    }
  }
}
```

### Mentor/Admin Endpoints

#### 3. Add Material (Bab) to Course
**Endpoint:** `POST /api/courses/:courseId/materials`

**Auth:** Private/Creator/Admin

**Request Body:**
```json
{
  "title": "Bab 1: Introduction",
  "description": "Introduction to the course",
  "order": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Material added successfully",
  "data": {
    "_id": "materialId",
    "title": "Bab 1: Introduction",
    "description": "Introduction to the course",
    "order": 1,
    "subMaterials": []
  }
}
```

#### 4. Update Material (Bab)
**Endpoint:** `PUT /api/courses/:courseId/materials/:materialId`

**Auth:** Private/Creator/Admin

**Request Body:**
```json
{
  "title": "Bab 1: Updated Title",
  "description": "Updated description",
  "order": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Material updated successfully",
  "data": {
    "_id": "materialId",
    "title": "Bab 1: Updated Title",
    "description": "Updated description",
    "order": 1,
    "subMaterials": []
  }
}
```

#### 5. Delete Material (Bab)
**Endpoint:** `DELETE /api/courses/:courseId/materials/:materialId`

**Auth:** Private/Creator/Admin

**Response:**
```json
{
  "success": true,
  "message": "Material deleted successfully"
}
```

#### 6. Add Sub-Material (Sub-Bab)
**Endpoint:** `POST /api/courses/:courseId/materials/:materialId/sub-materials`

**Auth:** Private/Creator/Admin

**Request Body:**
```json
{
  "title": "1.1 Course Overview",
  "type": "video",
  "url": "https://example.com/video.mp4",
  "duration": 15,
  "order": 1
}
```

**Note:** For articles, use `content` instead of `url`
```json
{
  "title": "1.2 Getting Started",
  "type": "article",
  "content": "<p>Article HTML content</p>",
  "order": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sub-material added successfully",
  "data": {
    "_id": "subMaterialId",
    "title": "1.1 Course Overview",
    "type": "video",
    "url": "https://example.com/video.mp4",
    "duration": 15,
    "order": 1
  }
}
```

#### 7. Update Sub-Material (Sub-Bab)
**Endpoint:** `PUT /api/courses/:courseId/materials/:materialId/sub-materials/:subMaterialId`

**Auth:** Private/Creator/Admin

**Request Body:** (same as add sub-material, all fields optional)
```json
{
  "title": "1.1 Updated Title",
  "type": "video",
  "url": "https://example.com/video-new.mp4",
  "duration": 20,
  "order": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sub-material updated successfully",
  "data": {
    "_id": "subMaterialId",
    "title": "1.1 Updated Title",
    "type": "video",
    "url": "https://example.com/video-new.mp4",
    "duration": 20,
    "order": 1
  }
}
```

#### 8. Delete Sub-Material (Sub-Bab)
**Endpoint:** `DELETE /api/courses/:courseId/materials/:materialId/sub-materials/:subMaterialId`

**Auth:** Private/Creator/Admin

**Response:**
```json
{
  "success": true,
  "message": "Sub-material deleted successfully"
}
```

## Quest & Certificate Requirements

### Before Taking a Quest
- **Student MUST complete all materials** (progress = 100%)
- If attempt made before 100% materials complete:
  ```json
  {
    "success": false,
    "message": "You must complete all course materials before taking the quest",
    "data": {
      "materialsProgress": 75,
      "required": 100
    }
  }
  ```

### Certificate Issuance
Certificate is only issued when:
1. ✅ All materials are 100% completed
2. ✅ Student attempts the quest
3. ✅ Student passes the quest (score >= passingScore)

### Enrollment Object Fields
- `materialsProgress`: Percentage of sub-materials completed (0-100)
- `questAttempted`: Boolean, true after any quest attempt
- `questPassed`: Boolean, true only if passed
- `completed`: Boolean, true only if both materials=100% AND quest passed

## Example Scenarios

### Scenario 1: Student Learning Path
```
1. Enroll in "JavaScript Basics" course
   POST /api/student/enroll/courseId

2. View materials
   GET /api/student/courses/courseId/materials
   Response: materials=[Bab1, Bab2], progress=0%, allMaterialsCompleted=false

3. Complete Bab1 Sub-material 1 (video)
   POST /api/student/courses/courseId/materials/complete
   Body: { materialId, subMaterialId }
   Response: progress=20%, completedCount=1, totalSubMaterials=5

4. Complete remaining 4 sub-materials
   Progress increases to 40%, 60%, 80%, 100%

5. When progress=100%, attempt quest
   POST /api/student/quests/questId/attempt
   Can only attempt when materials=100%

6. Pass quest (score >= 70)
   Certificate automatically generated
   enrollment.completed = true
   User can view certificate in GET /api/student/certificates
```

### Scenario 2: Mentor Creating Course with Materials
```
1. Create course
   POST /api/courses
   Body: { title, description, category, price... }

2. Add materials (bab)
   POST /api/courses/courseId/materials
   Body: { title: "Bab 1: Intro", order: 1 }
   → GET materialId

3. Add sub-materials
   POST /api/courses/courseId/materials/materialId/sub-materials
   Body: { title: "1.1 Overview", type: "video", url: "...", order: 1 }

4. Add more sub-materials
   POST /api/courses/courseId/materials/materialId/sub-materials
   Body: { title: "1.2 Setup", type: "article", content: "...", order: 2 }

5. Add Bab 2, etc.

6. Create quest(s)
   POST /api/quests

7. Submit for approval
   Course ready when materials + quests complete
```

## Error Handling

### Material Not Found
```json
{
  "success": false,
  "message": "Material not found in this course"
}
```

### Sub-Material Already Completed
```json
{
  "success": false,
  "message": "This material is already marked as completed"
}
```

### Not Enrolled
```json
{
  "success": false,
  "message": "You are not enrolled in this course"
}
```

### Missing Materials
```json
{
  "success": false,
  "message": "You must complete all course materials before taking the quest",
  "data": {
    "materialsProgress": 75,
    "required": 100
  }
}
```

### Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to update this course"
}
```

## Database Changes

### Course Model
- Added `materials` array with hierarchical structure
- Kept `content` array for backwards compatibility

### User Model (enrolledCourses)
- Added `materialsCompleted` array
- Added `materialsProgress` number
- Added `questAttempted` boolean
- Added `questPassed` boolean
- Updated `completed` definition: now true only if materials=100% AND quest passed
- Updated `progress` definition: now calculated from materials completion

## Migration Notes

- Old `content` array still works but is not used in new system
- Existing courses can be migrated by converting content to materials structure
- Students with existing enrollments will have `materialsProgress=0` until they mark materials complete
- Progress calculation has changed - recommend updating student dashboards to show `materialsProgress` instead of manual `progress`
