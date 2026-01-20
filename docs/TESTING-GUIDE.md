# CyberSec Academy - Testing Guide

**Application URL**: http://localhost:3000
**Deployment**: Docker (Local)
**Database**: PostgreSQL 16 (Docker)

---

## 🧪 Test Plan Overview

This guide walks you through testing all major features of the CyberSec Academy platform, including the security fixes we just deployed.

---

## ✅ Pre-Test Checklist

- [x] Docker containers running
- [x] Application accessible at http://localhost:3000
- [x] Database connected and healthy
- [x] All security fixes deployed

---

## 1️⃣ **Public Pages Testing**

### Test 1.1: Homepage
**URL**: http://localhost:3000

**Expected Results**:
- ✅ "CyberSec Academy" branding visible
- ✅ Hero section: "Master Cybersecurity, One Skill at a Time"
- ✅ Three feature cards:
  - 🔐 Ethical Hacking Training
  - 🛡️ Security Operations
  - 🎯 Hands-on Challenges
- ✅ "Get Started" and "Sign In" buttons

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 1.2: Login Page
**URL**: http://localhost:3000/login

**Expected Results**:
- ✅ Email input field
- ✅ Password input field
- ✅ "Login" button
- ✅ "Sign up" link
- ✅ "Login with Google" button (for students)

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 1.3: Register Page
**URL**: http://localhost:3000/register

**Expected Results**:
- ✅ Full Name input
- ✅ Email input
- ✅ Password input
- ✅ Role selection (Student/Mentor)
- ✅ "Create Account" button

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## 2️⃣ **Authentication Testing**

### Test 2.1: Student Registration ✨ NEW INPUT VALIDATION

**Steps**:
1. Go to http://localhost:3000/register
2. Try registering with INVALID data first (test our new validation):
   - Empty fields → Should show "All fields are required"
   - Invalid email (e.g., "notanemail") → Should show "Invalid email format"
   - Short password (e.g., "123") → Should show "Password must be at least 8 characters long"
3. Register with VALID data:
   - Full Name: "Test Student"
   - Email: "student@test.com"
   - Password: "password123" (8+ chars)
   - Role: Student
   - Click "Create Account"

**Expected Results**:
- ✅ Input validation errors show correctly
- ✅ Valid submission succeeds
- ✅ Redirects to login with message: "Check your email to confirm your account"
- ✅ Email confirmation sent (check Supabase dashboard)

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 2.2: Email Confirmation & Auto-Approval

**Steps**:
1. Check your email for Supabase confirmation link
2. Click the confirmation link
3. You should be redirected back to the app

**Expected Results**:
- ✅ Redirected to dashboard after confirmation
- ✅ Student account is **auto-approved** (no admin approval needed)
- ✅ Can access student features immediately

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 2.3: Student Login ✨ NEW INPUT VALIDATION

**Steps**:
1. Go to http://localhost:3000/login
2. Try logging in with INVALID data first:
   - Empty email/password → Should show error
   - Invalid email format → Should show "Invalid email format"
3. Login with VALID credentials:
   - Email: "student@test.com"
   - Password: "password123"

**Expected Results**:
- ✅ Input validation works
- ✅ Invalid credentials show: "Invalid email or password" (generic, no leak)
- ✅ Valid login redirects to dashboard
- ✅ Dashboard shows: "Welcome back, Test Student"

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 2.4: Mentor Registration (Requires Admin Approval)

**Steps**:
1. Logout (if logged in)
2. Go to http://localhost:3000/register
3. Register as Mentor:
   - Full Name: "Test Mentor"
   - Email: "mentor@test.com"
   - Password: "password123"
   - Role: **Mentor**
4. Confirm email via link

**Expected Results**:
- ✅ Registration succeeds
- ✅ After email confirmation, redirected to login with message:
  - "Your account is pending approval. Please wait for an admin to approve your account."
- ✅ **Cannot login until admin approves**

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## 3️⃣ **Student Dashboard Testing**

### Test 3.1: Dashboard Overview

**Steps**:
1. Login as student
2. Go to http://localhost:3000/dashboard

**Expected Results**:
- ✅ Welcome message: "Continue your cybersecurity journey..."
- ✅ Quick links visible:
  - 📚 Browse Courses
  - 🎮 My Progress
  - 🏆 Leaderboard
  - 🎯 My Skills
  - 📜 Certificates
- ✅ "Enrolled Courses" section (empty for new student)

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 3.2: Browse Courses (Protected Route)

**Steps**:
1. As logged-in student, go to http://localhost:3000/courses

**Expected Results**:
- ✅ Courses page loads successfully
- ✅ Learning path filters visible:
  - 🔴 Offensive Security
  - 🔵 Defensive Security
- ✅ Filter by difficulty (Beginner, Intermediate, Advanced)
- ✅ Search bar present
- ✅ Course cards show (if any courses exist)

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## 4️⃣ **Security Testing** 🛡️

### Test 4.1: Protected Routes Middleware

**Steps**:
1. Logout completely
2. Try accessing protected routes directly:
   - http://localhost:3000/dashboard
   - http://localhost:3000/courses
   - http://localhost:3000/admin/users

**Expected Results**:
- ✅ Redirects to `/login` for all protected routes
- ✅ URL includes `?redirectedFrom=` parameter
- ✅ After login, redirects back to originally requested page

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 4.2: Admin Endpoint RBAC ✨ NEW SECURITY FIX

**Test the `/api/check-user` endpoint that we secured**

**Steps**:
1. Login as **student** (not admin)
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run this command:
```javascript
fetch('/api/check-user?email=test@test.com')
  .then(r => r.json())
  .then(data => console.log(data))
```

**Expected Results**:
- ✅ Returns: `{"error": "Forbidden - Admin access required"}`
- ✅ Status code: 403 Forbidden
- ✅ **Student CANNOT access admin endpoints** (security fix working!)

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 4.3: CSRF Protection ✨ NEW SECURITY FIX

**Test checkout endpoint CSRF protection**

**Steps**:
1. As logged-in student
2. Open browser DevTools Console
3. Try to call checkout API without proper origin:
```javascript
fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ courseId: 'fake-uuid-here' })
})
  .then(r => r.json())
  .then(data => console.log(data))
```

**Expected Results**:
- ✅ Should work when called from same origin (localhost:3000)
- ✅ Invalid UUID format returns: "Invalid course ID format"
- ✅ **CSRF protection working!**

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 4.4: Error Message Sanitization ✨ NEW SECURITY FIX

**Steps**:
1. Try logging in with wrong credentials multiple times
2. Try registering with invalid data
3. Observe error messages

**Expected Results**:
- ✅ Error messages are **generic** (no database details leaked)
- ✅ No SQL errors visible
- ✅ No internal system information exposed
- ✅ Examples:
  - "Invalid email or password" (not "User not found in database")
  - "Failed to create account. Please try again." (not database error details)

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## 5️⃣ **Admin Features Testing**

### Test 5.1: Create Admin Account

**You need an admin account to test admin features. Two options:**

**Option A: Manually via Database**
1. Login to pgAdmin: http://localhost:5050
   - Email: admin@admin.com
   - Password: admin
2. Connect to database:
   - Host: postgres
   - Database: elearning
   - User: postgres
   - Password: postgres
3. Run SQL to create admin:
```sql
-- First, get the user ID from Supabase auth
-- Then update their role
UPDATE profiles
SET role = 'admin', is_approved = true, is_active = true
WHERE email = 'your-email@test.com';
```

**Option B: Via Supabase Dashboard**
1. Go to your Supabase dashboard
2. Navigate to Table Editor → profiles
3. Find your student account
4. Change `role` to 'admin'
5. Set `is_approved` to true
6. Set `is_active` to true

**Status**: ⬜ Not Tested | ✅ Done

---

### Test 5.2: Admin User Management

**Steps**:
1. Login as admin
2. Go to http://localhost:3000/admin/users

**Expected Results**:
- ✅ Page loads successfully
- ✅ List of all users visible
- ✅ Can see user roles (Student, Mentor, Admin)
- ✅ Can see approval status
- ✅ "Approve" button visible for pending mentors
- ✅ Can deactivate users

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 5.3: Approve Mentor Account

**Prerequisites**: You created a mentor account in Test 2.4

**Steps**:
1. As admin, go to http://localhost:3000/admin/users
2. Find the mentor account ("mentor@test.com")
3. Click "Approve" button
4. Logout
5. Try logging in as mentor

**Expected Results**:
- ✅ Mentor appears in user list as "Pending"
- ✅ After approval, status changes to "Active"
- ✅ Mentor can now login successfully
- ✅ Mentor sees dashboard with "Create Course" option

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## 6️⃣ **Mentor Features Testing**

### Test 6.1: Mentor Dashboard

**Steps**:
1. Login as approved mentor
2. Go to http://localhost:3000/dashboard

**Expected Results**:
- ✅ Welcome message: "Shape the next generation of cybersecurity professionals..."
- ✅ "Create Course" button visible
- ✅ "My Courses" section (empty for new mentor)
- ✅ Course statistics visible

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 6.2: Create Course

**Steps**:
1. As mentor, click "Create Course" or go to http://localhost:3000/mentor/courses/new
2. Fill in course details:
   - Title: "Test Ethical Hacking Course"
   - Short Description: "Learn ethical hacking basics"
   - Description: "Comprehensive introduction to ethical hacking..."
   - Category: Web Application Security
   - Difficulty: Beginner
   - Price: 0 (free) or set amount
   - Thumbnail URL: (optional)
3. Click "Create Course"

**Expected Results**:
- ✅ Course creation form loads
- ✅ All fields present and functional
- ✅ After creation, redirects to course management page
- ✅ Can see tabs: Course Info, Curriculum, Quizzes, Publish

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 6.3: Add Curriculum (Chapters & Lessons)

**Steps**:
1. In course management, go to "Curriculum" tab
2. Click "Add Chapter"
3. Enter chapter title: "Introduction to Ethical Hacking"
4. Click "Add Lesson" to chapter
5. Enter lesson details:
   - Title: "What is Ethical Hacking?"
   - Description: "Introduction to the field..."
   - Video URL: (use a test video URL or leave empty)
   - Duration: 10
   - Order: 1

**Expected Results**:
- ✅ Can create multiple chapters
- ✅ Can add multiple lessons to each chapter
- ✅ Can reorder chapters/lessons
- ✅ Can mark lessons as preview (free)
- ✅ Changes save correctly

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 6.4: Create Quiz ✨ PHASE 4 FEATURE

**Steps**:
1. Go to "Quizzes" tab
2. Click "Create Quiz"
3. Enter quiz details:
   - Title: "Chapter 1 Assessment"
   - Description: "Test your knowledge..."
   - Passing Score: 70%
   - Time Limit: 30 minutes (or unlimited)
   - Max Attempts: 3 (or unlimited)
4. Click "Add Question"
5. Create a multiple-choice question:
   - Question: "What is ethical hacking?"
   - Type: Multiple Choice
   - Points: 10
   - Add 4 options, mark 1 as correct
6. Create a true/false question
7. Publish quiz

**Expected Results**:
- ✅ Quiz builder interface loads
- ✅ Can add multiple question types
- ✅ Can mark correct answers
- ✅ Can set passing score and time limits
- ✅ Quiz saves and publishes successfully
- ✅ Published quiz visible in quiz list

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## 7️⃣ **Gamification Testing** 🎮

### Test 7.1: Skills Page

**Steps**:
1. As student, go to http://localhost:3000/skills

**Expected Results**:
- ✅ Skills page loads
- ✅ Stats overview visible (Total Skills, Expert, Advanced, etc.)
- ✅ Category filters present
- ✅ 25 cybersecurity skills displayed across 6 categories:
  - Web Application Security (8 skills)
  - Network Security (6 skills)
  - Cryptography (4 skills)
  - Social Engineering (3 skills)
  - Reverse Engineering (3 skills)
  - Forensics (2 skills)
- ✅ Empty state message if no progress yet

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 7.2: Leaderboard

**Steps**:
1. Go to http://localhost:3000/leaderboard

**Expected Results**:
- ✅ Leaderboard page loads
- ✅ Your rank card visible at top
- ✅ Filter tabs present:
  - 💎 Total Points
  - 🏅 Badges Earned
  - 📚 Courses Completed
  - 🔥 Current Streak
- ✅ Top 100 rankings display
- ✅ Top 3 get medals (🥇🥈🥉)
- ✅ Your position highlighted with "You" indicator

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 7.3: Badges

**Steps**:
1. As student, check if any badges visible in dashboard
2. Complete actions to earn badges:
   - Complete first course → "First Blood" badge
   - Pass first quiz → "Script Kiddie" badge

**Expected Results**:
- ✅ Badge system functional
- ✅ 15 badges available across 4 tiers:
  - Bronze (5 badges)
  - Silver (5 badges)
  - Gold (4 badges)
  - Platinum (1 badge)
- ✅ Badge progress visible
- ✅ Earned badges show with timestamp

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## 8️⃣ **Payment Testing** 💳

### Test 8.1: Stripe Payment Flow (If Stripe Configured)

**Prerequisites**: Valid Stripe test keys in `.env.docker`

**Steps**:
1. As student, browse courses
2. Find a paid course (price > 0)
3. Click "Enroll Now"
4. Click "Proceed to Payment"
5. Should redirect to Stripe Checkout

**Expected Results**:
- ✅ Stripe checkout page loads
- ✅ Course details visible
- ✅ Test card works: `4242 4242 4242 4242`
- ✅ After payment, redirects to success page
- ✅ Enrollment created automatically

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail | ⏭️ Skipped (Stripe not configured)

---

### Test 8.2: Manual Payment Workflow

**Steps**:
1. As student, enroll in paid course
2. Select "Bank Transfer" payment method
3. Upload payment proof (screenshot/document)
4. Submit enrollment request
5. As admin, go to http://localhost:3000/admin/enrollment-requests
6. Review and approve the request

**Expected Results**:
- ✅ Manual payment option available
- ✅ Can upload payment proof
- ✅ Request appears in admin dashboard
- ✅ Admin can approve/reject
- ✅ After approval, student gets access to course

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## 9️⃣ **Course Learning Testing**

### Test 9.1: Course Enrollment (Free Course)

**Steps**:
1. As student, find a free course (price = 0)
2. Click "Enroll Now"
3. Confirm enrollment

**Expected Results**:
- ✅ Instant enrollment (no payment required)
- ✅ "Start Learning" button appears
- ✅ Course appears in "My Courses" on dashboard
- ✅ Progress tracking begins at 0%

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 9.2: Learning Interface

**Steps**:
1. Click "Start Learning" on enrolled course
2. Goes to http://localhost:3000/courses/[courseId]/learn
3. Watch video lesson
4. Click "Mark as Complete"
5. Navigate to next lesson

**Expected Results**:
- ✅ Video player loads
- ✅ Sidebar shows course curriculum
- ✅ Can mark lessons complete
- ✅ Progress bar updates
- ✅ Previous/Next navigation works
- ✅ Current lesson highlighted

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 9.3: Take Quiz

**Steps**:
1. In learning interface, click on a quiz
2. Answer questions
3. Submit quiz

**Expected Results**:
- ✅ Quiz questions display correctly
- ✅ Multiple choice with radio buttons
- ✅ True/False with selection
- ✅ Can select answers
- ✅ Submit button works
- ✅ Auto-graded results show immediately
- ✅ Score displayed with pass/fail indicator
- ✅ Correct answers revealed
- ✅ Points awarded if passed

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 9.4: Course Completion

**Steps**:
1. Complete all lessons in a course
2. Complete final quiz (if any)
3. Course should mark as completed

**Expected Results**:
- ✅ Progress reaches 100%
- ✅ "Completed" badge shows on course
- ✅ Certificate generated automatically
- ✅ Points awarded
- ✅ Skills updated (if course has skill mappings)
- ✅ Badges checked and awarded

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 9.5: Certificate Download

**Steps**:
1. Go to http://localhost:3000/certificates
2. Find completed course certificate
3. Click "Download" or "View"

**Expected Results**:
- ✅ Certificates page shows all earned certificates
- ✅ Certificate displays course name, student name, completion date
- ✅ Can download as PDF (if implemented)
- ✅ Certificate has verification ID

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## 🔟 **Database Testing**

### Test 10.1: PostgreSQL Connection

**Steps**:
1. Open pgAdmin: http://localhost:5050
2. Login:
   - Email: admin@admin.com
   - Password: admin
3. Add new server:
   - Host: postgres (Docker network name)
   - Port: 5432
   - Database: elearning
   - Username: postgres
   - Password: postgres
4. Browse tables

**Expected Results**:
- ✅ Can connect to database
- ✅ Can see all tables:
  - profiles, courses, materials, sub_materials
  - enrollments, progress
  - quests, quest_questions, quest_options, quest_attempts
  - skills, student_skills
  - badges, student_badges
  - leaderboard_stats, point_history
  - certificates, payments, reviews

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 10.2: Data Integrity

**Steps**:
1. In pgAdmin, run queries to check data:
```sql
-- Check users
SELECT id, email, role, is_approved, is_active FROM profiles;

-- Check enrollments
SELECT e.id, p.email, c.title, e.status, e.progress
FROM enrollments e
JOIN profiles p ON e.student_id = p.id
JOIN courses c ON e.course_id = c.id;

-- Check leaderboard
SELECT p.full_name, l.total_points, l.badges_earned, l.courses_completed
FROM leaderboard_stats l
JOIN profiles p ON l.student_id = p.id
ORDER BY l.total_points DESC
LIMIT 10;
```

**Expected Results**:
- ✅ All created users visible
- ✅ Enrollments properly linked
- ✅ Leaderboard stats accurate
- ✅ Foreign key constraints working
- ✅ No orphaned records

**Status**: ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## 🤖 Automated/Programmatic Testing

### Running Tests

The project uses the following testing approaches:

#### TypeScript Type Checking
```bash
npm run type-check
```
Verifies all TypeScript types are correct across the codebase.

#### ESLint Code Quality
```bash
npm run lint
```
Checks code style and catches common issues.

#### Build Verification
```bash
npm run build
```
Ensures the project compiles without errors. This is the primary automated test.

### API Endpoint Testing

Test API endpoints using curl or similar tools:

```bash
# Test public health (replace localhost with your URL)
curl -I http://localhost:3000/

# Test protected route (should redirect to login)
curl -I http://localhost:3000/dashboard

# Test API endpoint (requires auth cookie)
curl http://localhost:3000/api/check-user?email=test@test.com \
  -H "Cookie: your-auth-cookie"
```

### Database Testing

```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check row counts
SELECT 'profiles' as table_name, COUNT(*) as rows FROM profiles
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'enrollments', COUNT(*) FROM enrollments
UNION ALL
SELECT 'quests', COUNT(*) FROM quests;

-- Check RLS policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

### CI/CD Integration

For GitHub Actions or similar CI/CD:

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run build
```

---

## 📊 Testing Summary

### Critical Tests (Must Pass)
- [ ] Public pages load (1.1, 1.2, 1.3)
- [ ] Student registration with validation (2.1)
- [ ] Student login with validation (2.3)
- [ ] Protected routes redirect (4.1)
- [ ] Admin RBAC working (4.2)
- [ ] CSRF protection working (4.3)
- [ ] Error sanitization working (4.4)

### Important Tests (Should Pass)
- [ ] Dashboard loads (3.1)
- [ ] Courses page accessible (3.2)
- [ ] Mentor approval flow (2.4, 5.3)
- [ ] Course creation (6.2)
- [ ] Quiz builder (6.4)
- [ ] Gamification pages (7.1, 7.2)

### Nice-to-Have Tests (Optional)
- [ ] Payment flows (8.1, 8.2)
- [ ] Course learning (9.1-9.5)
- [ ] Database integrity (10.1, 10.2)

---

## 🐛 Issue Tracking

### Issues Found During Testing

| Test # | Issue Description | Severity | Status |
|--------|------------------|----------|---------|
| Example: 4.2 | Admin endpoint accessible | Critical | ✅ Fixed |
|  |  |  |  |
|  |  |  |  |

---

## ✅ Sign-Off

**Tested By**: ___________________________
**Date**: ___________________________
**Overall Status**: ⬜ Pass | ⬜ Fail | ⬜ Partial

**Notes**:
```
(Add any additional notes here)
```

---

**Version**: 2.0.1 (Security Hardened)
**Deployment**: Docker Local
**Last Updated**: January 19, 2026
