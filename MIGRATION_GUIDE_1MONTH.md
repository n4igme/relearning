# 🚀 1-Month Migration Plan: MongoDB → PostgreSQL (Free Hosting)

**Timeline:** 4 weeks
**Budget:** $0/month
**Difficulty:** Medium (with AI assistance)
**Goal:** Production-ready e-learning platform on free hosting

---

## 📋 Prerequisites

Before starting, ensure you have:
- [ ] Existing MongoDB data backed up
- [ ] Git repository ready
- [ ] Code editor (VS Code recommended)
- [ ] Node.js 18+ installed
- [ ] Basic command line knowledge

---

## 🎯 Week-by-Week Breakdown

### **Week 1: Database Migration** (Dec 22-28)

#### Day 1: Setup Supabase (2 hours)

**Tasks:**
1. Go to [supabase.com](https://supabase.com)
2. Sign up for free account
3. Create new project:
   - Name: `elearning-platform`
   - Database Password: **Save this securely!**
   - Region: Choose closest to you
4. Wait for project provisioning (~2 minutes)
5. Copy connection string from Settings → Database

**Connection String Format:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

**Save to `.env.migration`:**
```bash
# MongoDB (existing)
MONGODB_URI=mongodb://localhost:27017/elearning

# PostgreSQL (new - Supabase)
POSTGRES_URI=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

---

#### Day 2-3: Create PostgreSQL Schema (4 hours)

**Tasks:**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `database/postgresql-schema.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Verify tables created: Check Table Editor (should see 19 tables)

**Verification:**
```sql
-- Run this in SQL Editor:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected: 19 tables
```

**If errors occur:**
- Check for syntax errors
- Ensure clean database (no existing tables)
- Run schema in sections if needed

---

#### Day 4-5: Run Data Migration (6 hours)

**Tasks:**
1. Install migration dependencies:
   ```bash
   npm install pg --save-dev
   ```

2. Create `.env.migration` file (if not already):
   ```env
   MONGODB_URI=mongodb://localhost:27017/elearning
   POSTGRES_URI=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
   NODE_ENV=development
   ```

3. Ensure MongoDB is running:
   ```bash
   # If using Docker:
   docker-compose up mongodb -d

   # If local MongoDB:
   mongod
   ```

4. Run migration script:
   ```bash
   node database/migrate-to-postgres.js
   ```

5. Monitor output:
   - Should see progress for each table
   - Note any errors (migration will continue despite minor errors)
   - Total time: 5-30 minutes depending on data size

**Expected Output:**
```
🚀 Starting MongoDB → PostgreSQL Migration
✓ Connected to MongoDB
✓ Connected to PostgreSQL

📦 Migrating Users...
  ✓ Migrated 100 users...
✓ Migrated 150 users

📦 Migrating Courses...
✓ Migrated 45 courses

... (continues for all tables)

✅ Migration Complete!
Summary:
  Users:            150
  Courses:          45
  Enrollments:      280
  ...
```

---

#### Day 6-7: Verify Data Integrity (4 hours)

**Tasks:**
1. Open Supabase → Table Editor
2. Manually check sample data in each table
3. Run verification queries:

```sql
-- Check user count
SELECT COUNT(*) FROM users;

-- Check courses with creators
SELECT c.title, u.name AS creator
FROM courses c
JOIN users u ON c.creator_id = u.id
LIMIT 10;

-- Check enrollments
SELECT
  u.name AS student,
  c.title AS course,
  e.progress
FROM enrollments e
JOIN users u ON e.student_id = u.id
JOIN courses c ON e.course_id = c.id
LIMIT 10;

-- Check data integrity
SELECT
  (SELECT COUNT(*) FROM users) AS users,
  (SELECT COUNT(*) FROM courses) AS courses,
  (SELECT COUNT(*) FROM enrollments) AS enrollments,
  (SELECT COUNT(*) FROM certificates) AS certificates;
```

4. Compare counts with MongoDB:
```bash
# In MongoDB shell:
mongo
use elearning
db.users.count()
db.courses.count()
db.enrollments.count()
```

**If data doesn't match:**
- Check migration error logs
- Re-run migration (it's safe to run multiple times with proper cleanup)
- Fix specific errors and migrate again

**✅ Week 1 Deliverable:** PostgreSQL database with all data migrated

---

### **Week 2: Backend Update** (Dec 29 - Jan 4)

#### Day 8: Install PostgreSQL Dependencies (2 hours)

**Tasks:**
1. Install Sequelize (ORM for PostgreSQL):
   ```bash
   npm uninstall mongoose
   npm install sequelize pg pg-hstore
   npm install --save-dev sequelize-cli
   ```

2. Initialize Sequelize:
   ```bash
   npx sequelize-cli init
   ```

   This creates:
   - `config/config.json` - Database config
   - `models/index.js` - Model loader
   - `migrations/` - Migration files
   - `seeders/` - Seed data

3. Update `config/config.json`:
   ```json
   {
     "development": {
       "use_env_variable": "POSTGRES_URI",
       "dialect": "postgres",
       "dialectOptions": {
         "ssl": {
           "require": false
         }
       }
     },
     "production": {
       "use_env_variable": "POSTGRES_URI",
       "dialect": "postgres",
       "dialectOptions": {
         "ssl": {
           "require": true,
           "rejectUnauthorized": false
         }
       }
     }
   }
   ```

---

#### Day 9-11: Rewrite Models (12 hours)

**Task:** Convert Mongoose models to Sequelize

**Example - User Model:**

**Old (Mongoose):** `src/models/User.js`
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'mentor', 'student'] }
});

module.exports = mongoose.model('User', userSchema);
```

**New (Sequelize):** `src/models/User.js`
```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash' // Maps to snake_case column
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['admin', 'mentor', 'student']]
      }
    },
    avatar_url: DataTypes.TEXT,
    bio: DataTypes.TEXT,
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    approval_status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'approved', 'rejected']]
      }
    }
  }, {
    tableName: 'users',
    underscored: true, // Use snake_case for all fields
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Define associations
  User.associate = (models) => {
    User.hasMany(models.Course, {
      foreignKey: 'creator_id',
      as: 'createdCourses'
    });

    User.hasMany(models.Enrollment, {
      foreignKey: 'student_id',
      as: 'enrollments'
    });

    User.hasMany(models.Certificate, {
      foreignKey: 'student_id',
      as: 'certificates'
    });
  };

  return User;
};
```

**Models to rewrite (in order):**
1. `User.js` ✅
2. `Course.js`
3. `Material.js` (new table structure)
4. `SubMaterial.js` (new table)
5. `Enrollment.js`
6. `Quest.js`
7. `QuestQuestion.js` (new table)
8. `QuestAttempt.js` (new table)
9. `Certificate.js`
10. `Payment.js`
11. `ForumQuestion.js`
12. `ForumReply.js` (new table)
13. `Progress.js`

**Time per model:** ~1-1.5 hours
**AI Assistance:** Ask AI to convert each Mongoose model to Sequelize

---

#### Day 12-13: Update Controllers (10 hours)

**Task:** Replace MongoDB queries with Sequelize queries

**Example - Course Controller:**

**Old (Mongoose):**
```javascript
// Get all courses
const courses = await Course.find({ is_published: true })
  .populate('creator', 'name email')
  .sort({ createdAt: -1 });
```

**New (Sequelize):**
```javascript
// Get all courses
const courses = await Course.findAll({
  where: { is_published: true },
  include: [{
    model: User,
    as: 'creator',
    attributes: ['name', 'email']
  }],
  order: [['created_at', 'DESC']]
});
```

**Controllers to update:**
- `authController.js` - User registration, login
- `courseController.js` - Course CRUD
- `studentController.js` - Enrollments, progress
- `questController.js` - Quizzes and attempts
- `adminController.js` - Dashboard stats
- `certificateController.js` - Certificate generation
- `paymentController.js` - **IMPORTANT: Add transactions!**
- `forumController.js` - Q&A forums
- `progressController.js` - Material completion

**Critical: Fix Payment Transactions!**

**Old (broken):**
```javascript
// NO TRANSACTION - can fail partially
enrollment.paymentStatus = 'completed';
await enrollment.save();

course.enrollmentCount += 1;
await course.save();

const payment = new Payment({...});
await payment.save();
```

**New (with transaction):**
```javascript
const { sequelize } = require('../models');

// USE TRANSACTION - all or nothing!
const transaction = await sequelize.transaction();

try {
  await enrollment.update(
    { payment_status: 'completed' },
    { transaction }
  );

  await course.increment(
    'enrollment_count',
    { by: 1, transaction }
  );

  await Payment.create({
    student_id: enrollment.student_id,
    course_id: enrollment.course_id,
    amount: enrollment.payment_amount,
    status: 'completed',
    transaction_id: `TXN-${Date.now()}`
  }, { transaction });

  await transaction.commit();
  console.log('✅ Payment processed successfully');
} catch (error) {
  await transaction.rollback();
  console.error('❌ Payment failed, rolled back');
  throw error;
}
```

---

#### Day 14: Test Backend Locally (4 hours)

**Tasks:**
1. Update `.env` to use PostgreSQL:
   ```env
   # Comment out MongoDB
   # MONGODB_URI=mongodb://localhost:27017/elearning

   # Use PostgreSQL
   POSTGRES_URI=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

   # Other existing vars...
   JWT_SECRET=your_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   # ...
   ```

2. Update `src/config/database.js`:
   ```javascript
   // Remove this file (was for MongoDB)
   // Connection now handled by Sequelize
   ```

3. Update `src/server.js`:
   ```javascript
   const express = require('express');
   const { sequelize } = require('./models'); // Add this

   // Remove: const connectDB = require('./config/database');

   // Test database connection
   sequelize.authenticate()
     .then(() => console.log('✓ PostgreSQL connected'))
     .catch(err => console.error('✗ PostgreSQL error:', err));

   // Rest of server setup...
   ```

4. Start server:
   ```bash
   npm run dev
   ```

5. Test endpoints:
   ```bash
   # Health check
   curl http://localhost:5001/health

   # Get courses
   curl http://localhost:5001/api/courses

   # Login
   curl -X POST http://localhost:5001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"student@elearning.com","password":"student123"}'
   ```

**Expected:** All endpoints should work as before, but now using PostgreSQL!

**✅ Week 2 Deliverable:** Backend running on PostgreSQL with transaction support

---

### **Week 3: Add Video Hosting & Frontend** (Jan 5-11)

#### Day 15-16: Cloudinary Integration (6 hours)

**Task 1: Setup Cloudinary**
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Get credentials from Dashboard:
   - Cloud Name
   - API Key
   - API Secret

**Task 2: Install SDK**
```bash
npm install cloudinary multer-storage-cloudinary
```

**Task 3: Configure Cloudinary**

Create `src/config/cloudinary.js`:
```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
```

**Task 4: Add to `.env`:**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Task 5: Create Upload Middleware**

Create `src/middleware/cloudinaryUpload.js`:
```javascript
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Video upload
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'elearning/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi'],
    transformation: [
      { quality: 'auto', fetch_format: 'mp4' }
    ]
  }
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Image upload (thumbnails)
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'elearning/thumbnails',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [
      { width: 800, height: 450, crop: 'fill' }
    ]
  }
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = { uploadVideo, uploadImage };
```

**Task 6: Add Video Upload Route**

Update `src/routes/courses.js`:
```javascript
const { uploadVideo, uploadImage } = require('../middleware/cloudinaryUpload');

// Upload video for sub-material
router.post('/materials/:materialId/videos',
  auth,
  authorize('mentor', 'admin'),
  uploadVideo.single('video'),
  async (req, res) => {
    try {
      const { materialId } = req.params;

      // Create sub-material with video URL
      const subMaterial = await SubMaterial.create({
        material_id: materialId,
        title: req.body.title,
        type: 'video',
        video_url: req.file.path, // Cloudinary URL
        duration: req.body.duration,
        order_index: req.body.order || 0
      });

      res.json({
        success: true,
        data: subMaterial
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Upload course thumbnail
router.post('/courses/:courseId/thumbnail',
  auth,
  authorize('mentor', 'admin'),
  uploadImage.single('thumbnail'),
  async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.courseId);

      await course.update({
        thumbnail_url: req.file.path
      });

      res.json({
        success: true,
        data: { thumbnail_url: course.thumbnail_url }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);
```

---

#### Day 17-18: Frontend Video Player (6 hours)

**Task: Create video player component**

`frontend/src/components/VideoPlayer.jsx`:
```jsx
import { useState, useRef } from 'react';

export default function VideoPlayer({ videoUrl, onProgress, onComplete }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    setCurrentTime(video.currentTime);

    // Report progress every 5 seconds
    if (Math.floor(video.currentTime) % 5 === 0) {
      onProgress?.(video.currentTime);
    }

    // Check if 90% watched (mark as complete)
    if (video.currentTime / video.duration > 0.9) {
      onComplete?.();
    }
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (playing) {
      video.pause();
    } else {
      video.play();
    }
    setPlaying(!playing);
  };

  const changeSpeed = (speed) => {
    videoRef.current.playbackRate = speed;
    setPlaybackRate(speed);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        className="w-full rounded-lg"
        controls={false}
      />

      <div className="controls bg-gray-800 text-white p-4 flex items-center gap-4">
        <button onClick={togglePlay} className="px-4 py-2 bg-blue-600 rounded">
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>

        <span>{formatTime(currentTime)} / {formatTime(duration)}</span>

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => {
              videoRef.current.currentTime = e.target.value;
              setCurrentTime(e.target.value);
            }}
            className="w-full"
          />
        </div>

        <select
          value={playbackRate}
          onChange={(e) => changeSpeed(parseFloat(e.target.value))}
          className="bg-gray-700 px-2 py-1 rounded"
        >
          <option value="0.5">0.5x</option>
          <option value="0.75">0.75x</option>
          <option value="1">1x</option>
          <option value="1.25">1.25x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>
      </div>
    </div>
  );
}
```

**Use in course player:**
```jsx
import VideoPlayer from '../components/VideoPlayer';

<VideoPlayer
  videoUrl={currentLesson.video_url}
  onProgress={(time) => {
    // Save progress to backend
    saveProgress(currentLesson.id, time);
  }}
  onComplete={() => {
    // Mark lesson as complete
    markAsComplete(currentLesson.id);
  }}
/>
```

---

#### Day 19-21: Enhanced Frontend Features (8 hours)

**Tasks:**
- [ ] Improve course discovery (better search/filters)
- [ ] Add loading states for all API calls
- [ ] Improve error handling with user-friendly messages
- [ ] Add progress indicators for uploads
- [ ] Improve responsiveness for mobile
- [ ] Add skeleton loaders
- [ ] Polish UI with better animations

**Quick Wins:**
```jsx
// Loading state component
function Loading() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Error component
function ErrorMessage({ message }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {message}
    </div>
  );
}

// Skeleton loader
function CourseSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-300 rounded"></div>
      <div className="h-4 bg-gray-300 rounded mt-4"></div>
      <div className="h-4 bg-gray-300 rounded mt-2 w-3/4"></div>
    </div>
  );
}
```

**✅ Week 3 Deliverable:** Working video hosting + polished frontend

---

### **Week 4: Deploy & Launch** (Jan 12-18)

#### Day 22: Deploy Backend to Railway (3 hours)

**Why Railway?** Better than Render - $5 free credit/month (lasts 1 month with light traffic)

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables:
   ```
   NODE_ENV=production
   PORT=5001
   POSTGRES_URI=postgresql://...supabase...
   JWT_SECRET=...
   JWT_REFRESH_SECRET=...
   SMTP_HOST=smtp.gmail.com
   SMTP_EMAIL=...
   SMTP_PASSWORD=...
   STRIPE_SECRET_KEY=...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```

6. Deploy!
7. Copy your backend URL: `https://your-app.up.railway.app`

**Alternative (truly free forever):**
Use Render free tier instead:
- Sleeps after 15 min inactivity
- Wakes up on request (~30 seconds)
- Perfect for MVP/testing

---

#### Day 23: Deploy Frontend to Netlify (2 hours)

**Steps:**
1. Go to [netlify.com](https://netlify.com)
2. "Add new site" → "Import from Git"
3. Select your repository
4. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
5. Add environment variables:
   ```
   VITE_API_URL=https://your-app.up.railway.app/api
   VITE_STRIPE_PUBLIC_KEY=pk_test_...
   ```
6. Deploy!
7. Site live at: `https://your-app.netlify.app`

**Configure custom domain (optional):**
- Site settings → Domain management → Add custom domain

---

#### Day 24-25: End-to-End Testing (8 hours)

**Test Complete User Flows:**

**Flow 1: Student Registration → Enrollment → Learning**
```
1. Register as student
2. Verify email
3. Wait for admin approval
4. Login
5. Browse courses
6. Enroll in course
7. Watch video lesson
8. Mark as complete
9. Take quiz
10. Get certificate
```

**Flow 2: Mentor Course Creation**
```
1. Register as mentor
2. Create course
3. Add materials
4. Upload video
5. Create quiz
6. Publish course
7. View analytics
```

**Flow 3: Payment Flow**
```
1. Select paid course
2. Checkout with Stripe test card
3. Payment confirmation
4. Enrollment created
5. Access course content
```

**Test Card:** `4242 4242 4242 4242` (any future date, any CVV)

**Create Test Checklist:**
- [ ] User registration works
- [ ] Email verification works
- [ ] Login/logout works
- [ ] Course browsing works
- [ ] Video playback works
- [ ] Progress tracking accurate
- [ ] Quiz submission works
- [ ] Certificate generation works
- [ ] Payment processing works
- [ ] Forum Q&A works
- [ ] Admin dashboard works

---

#### Day 26-27: Bug Fixes & Performance (6 hours)

**Common Issues to Fix:**

**1. CORS Errors**
```javascript
// backend/src/server.js
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-app.netlify.app']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
};
app.use(cors(corsOptions));
```

**2. Slow Queries**
```javascript
// Add indexes if queries are slow
// Already in schema, but verify with:
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public';
```

**3. Large Bundle Size**
```bash
# Analyze bundle
cd frontend
npm run build -- --analyze

# Optimize by code splitting
# Use dynamic imports for heavy components
```

**4. API Timeout Issues**
```javascript
// Increase timeout for video uploads
app.use('/api/courses/videos', (req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  next();
});
```

---

#### Day 28: Launch & Monitor (4 hours)

**1. Setup Error Monitoring (Free)**

Install Sentry:
```bash
npm install @sentry/node @sentry/react
```

Backend (`src/server.js`):
```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Add error handler
app.use(Sentry.Handlers.errorHandler());
```

Frontend (`frontend/src/main.jsx`):
```javascript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE
});
```

**2. Setup Uptime Monitoring**

Use [UptimeRobot](https://uptimerobot.com) (free):
- Create account
- Add monitor for: `https://your-app.netlify.app`
- Add monitor for: `https://your-backend.railway.app/health`
- Get alerts via email if site goes down

**3. Create Backup Procedure**

Supabase auto-backups on paid plan, but for free tier:
```bash
# Manual backup script
pg_dump $POSTGRES_URI > backup-$(date +%Y%m%d).sql

# Restore if needed
psql $POSTGRES_URI < backup-20250118.sql
```

**4. Document Everything**

Update README.md:
- Deployment URLs
- Environment variables needed
- Backup procedures
- Common troubleshooting

**✅ Week 4 Deliverable:** LIVE PRODUCTION PLATFORM! 🎉

---

## 💰 Final Cost Breakdown

| Service | Free Tier | Usage | Monthly Cost |
|---------|-----------|-------|--------------|
| **Supabase** | 500MB DB, 1GB storage | Database | **$0** |
| **Railway** | $5 credit/month | Backend API | **$0** (1st month) |
| **Netlify** | 100GB bandwidth | Frontend | **$0** |
| **Cloudinary** | 25 credits (10GB) | Videos | **$0** |
| **Sentry** | 5K errors/month | Monitoring | **$0** |
| **Total** | | | **$0/month** |

**Note:** After Railway credit exhausted (~1 month), either:
- Switch to Render free tier ($0 forever, but sleeps)
- Pay ~$5/month for Railway (still cheaper than Render $7)

---

## 🎯 Success Metrics

After 1 month, you should have:
- ✅ Full PostgreSQL database (fixes transaction bugs)
- ✅ Video hosting working (Cloudinary)
- ✅ Production deployment (Netlify + Railway/Render)
- ✅ Error monitoring (Sentry)
- ✅ Uptime monitoring (UptimeRobot)
- ✅ All features working
- ✅ **$0/month hosting cost**

---

## 🆘 Troubleshooting

### Migration Issues

**Problem:** Migration script fails
```bash
# Solution: Run in stages
node database/migrate-to-postgres.js --users-only
node database/migrate-to-postgres.js --courses-only
# etc.
```

**Problem:** Data missing after migration
```bash
# Solution: Check MongoDB vs PostgreSQL counts
# Re-run migration (safe to run multiple times)
```

### Deployment Issues

**Problem:** Backend deploy fails
```bash
# Check logs in Railway/Render dashboard
# Common fix: Missing environment variables
```

**Problem:** Frontend can't reach backend
```bash
# Check CORS configuration
# Check VITE_API_URL is correct
# Check backend is actually running
```

### Performance Issues

**Problem:** Slow queries
```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM courses WHERE is_published = true;

-- Add indexes if needed
CREATE INDEX idx_custom ON table_name(column_name);
```

---

## 📞 Get Help

If stuck at any point:
1. Check error logs first (Railway/Render/Netlify dashboards)
2. Review this guide's troubleshooting section
3. Ask AI assistant for specific errors
4. Check Supabase docs: https://supabase.com/docs
5. Check Railway docs: https://docs.railway.app

---

## 🎉 Congratulations!

After 1 month, you'll have:
- Modern PostgreSQL database (better than MongoDB for your use case)
- Transaction-safe payment processing (no more race conditions)
- Video hosting with Cloudinary
- Production deployment on free hosting
- Full-featured e-learning platform

**Total development time:** ~100 hours over 4 weeks
**Total cost:** $0/month
**Result:** Production-ready platform! 🚀

---

**Ready to start? Begin with Week 1, Day 1: Setup Supabase!**
