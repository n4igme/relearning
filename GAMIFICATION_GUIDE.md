# 🎮 Gamification Integration Guide

This guide explains how the gamification system is integrated into your cybersecurity e-learning platform.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Points System](#points-system)
3. [Badges & Achievements](#badges--achievements)
4. [Skills Tracking](#skills-tracking)
5. [Leaderboard](#leaderboard)
6. [Usage Examples](#usage-examples)
7. [API Reference](#api-reference)

---

## Overview

The gamification system automatically rewards students with:
- **Points** for completing quests, courses, and maintaining streaks
- **Badges** when achieving milestones (automated)
- **Skill progression** based on quiz performance
- **Leaderboard rankings** based on total points

### Automatic Integration Points

The system is integrated at:
1. ✅ **Quest Completion** - Awards points, updates skills, checks badges
2. ✅ **Course Completion** - Awards points, advances skills, generates certificates
3. ✅ **Daily Activity** - Updates learning streaks
4. ✅ **Skill Mastery** - Tracks proficiency levels (beginner → expert)

---

## Points System

### Point Sources

| Action | Base Points | Multipliers/Bonuses |
|--------|-------------|---------------------|
| **Quest Pass (Beginner)** | 100 | +50 for perfect score, +25 first attempt |
| **Quest Pass (Intermediate)** | 150 | +50 for perfect score, +25 first attempt |
| **Quest Pass (Advanced)** | 200 | +50 for perfect score, +25 first attempt |
| **Course Complete (Beginner)** | 200 | - |
| **Course Complete (Intermediate)** | 400 | - |
| **Course Complete (Advanced)** | 800 | - |
| **Skill Level Up** | 50-200 | Based on proficiency level |
| **Badge Earned** | Variable | Defined in badge (50-2000 points) |
| **7-day Streak** | 50 | Via badge |
| **30-day Streak** | 200 | Via badge |
| **100-day Streak** | 1000 | Via badge |

### How Points Are Awarded

Points are automatically awarded when calling:
- `submitQuestAttempt()` - When student passes a quest
- Internal `completeCourse()` - When student finishes all course materials
- `awardPoints()` - Direct point award (admin use)

---

## Badges & Achievements

### Badge System

Badges are **automatically checked and awarded** after any point-earning action.

### Current Badges (15 total)

#### Bronze Tier (5 badges)
- **First Blood** - Complete first course (50 pts)
- **Script Kiddie** - Pass 5 quests with 70%+ (75 pts)
- **Bug Spotter** - Master 1 skill to Intermediate (100 pts)
- **Dedicated Learner** - 7-day streak (100 pts)
- **Point Collector** - Earn 500 points (50 pts)

#### Silver Tier (5 badges)
- **Exploit Developer** - Master 3 skills to Advanced (200 pts)
- **Penetration Tester** - Complete 5 courses (250 pts)
- **CTF Warrior** - Score 95%+ on 10 quests (300 pts)
- **Persistent Hacker** - 30-day streak (300 pts)
- **Rising Star** - Earn 2000 points (150 pts)

#### Gold Tier (4 badges)
- **Security Researcher** - Master 5 skills to Expert (500 pts)
- **Bug Bounty Hunter** - Complete 10 Web App Security courses (600 pts)
- **Hacking Legend** - Reach Top 10 on leaderboard (750 pts)
- **Century Club** - 100-day streak (1000 pts)

#### Platinum Tier (1 badge)
- **Elite Hacker** - Reach #1 on leaderboard (2000 pts)

### Badge Auto-Check Logic

The `checkAndAwardBadges()` function is called automatically after:
- Quest completion (if passed)
- Course completion
- Skill level up
- Manual point awards

---

## Skills Tracking

### Skill Categories

1. **Web Application Security** (8 skills)
   - SQL Injection, XSS, CSRF, Authentication Bypass, SSRF, File Upload, API Security, OWASP Top 10

2. **Network Security** (6 skills)
   - Network Scanning, MITM Attacks, Network Sniffing, Firewall Evasion, VPN Security, DNS Attacks

3. **Cryptography** (4 skills)
   - Encryption Algorithms, Hash Functions, PKI, Password Cracking

4. **Social Engineering** (3 skills)
   - Phishing, Pretexting, Physical Security

5. **Reverse Engineering** (3 skills)
   - Assembly Language, Binary Analysis, Malware Analysis

6. **Forensics** (2 skills)
   - Disk Forensics, Memory Forensics

### Proficiency Levels

| Level | Quest Score Required | Points Awarded |
|-------|---------------------|----------------|
| **Beginner** | 70-74% | 20 |
| **Intermediate** | 75-84% | 30 |
| **Advanced** | 85-94% | 40 |
| **Expert** | 95-100% | 50 |

### How Skills Are Updated

Skills are automatically updated when:
1. **Student passes a quest** - Based on their score percentage
2. **Student completes a course** - All linked skills advance to the taught level

To link skills to a course, insert into `course_skills` table:
```sql
INSERT INTO course_skills (course_id, skill_id, proficiency_level_taught)
VALUES ('course-uuid', 'skill-uuid', 'intermediate');
```

---

## Leaderboard

### Leaderboard Stats

Each student has a `leaderboard_stats` record tracking:
- `total_points` - Sum of all points earned
- `badges_earned` - Count of unlocked badges
- `courses_completed` - Count of finished courses
- `quests_completed` - Count of passed quests
- `average_score` - Average quest score
- `current_streak_days` - Consecutive days of activity
- `longest_streak_days` - Best streak ever
- `last_activity_date` - Last login/action date
- `rank` - Cached position (updated periodically)

### Viewing the Leaderboard

Use the `<Leaderboard />` component:
```tsx
import { Leaderboard } from '@/components/leaderboard'

// In your page
<Leaderboard studentId={currentUserId} limit={10} />
```

---

## Usage Examples

### 1. Quest Submission with Gamification

```tsx
import { QuestAttempt } from '@/components/quest-attempt'

export default async function QuestPage({ params }) {
  const { id } = await params
  const { data: quest } = await getQuestWithQuestions(id)
  const profile = await getUserProfile()

  return (
    <QuestAttempt
      questId={id}
      studentId={profile.id}
      quest={quest}
      onComplete={(result) => {
        console.log('Quest completed!', result)
        // Redirect to dashboard to see new points/badges
      }}
    />
  )
}
```

**What happens automatically:**
1. ✅ Calculates score based on correct answers
2. ✅ Awards points (100-275 depending on difficulty/performance)
3. ✅ Updates student skills based on quest score
4. ✅ Updates learning streak
5. ✅ Checks and awards qualifying badges
6. ✅ Updates leaderboard stats

---

### 2. Course Enrollment

```tsx
import { CourseEnrollmentButton } from '@/components/course-enrollment-button'

export default async function CoursePage({ params }) {
  const { data: course } = await getCourseById(params.id)
  const profile = await getUserProfile()

  // Check if already enrolled
  const { data: enrollments } = await getStudentEnrollments(profile.id)
  const isEnrolled = enrollments?.some(e => e.course_id === course.id)

  return (
    <div>
      <h1>{course.title}</h1>
      <CourseEnrollmentButton
        courseId={course.id}
        studentId={profile.id}
        isEnrolled={isEnrolled}
      />
    </div>
  )
}
```

**What happens automatically:**
1. ✅ Creates enrollment record
2. ✅ Updates learning streak (activity logged)

---

### 3. Marking Lessons as Completed

```tsx
'use client'

import { markSubMaterialCompleted } from '@/lib/actions/courses'

export function VideoPlayer({ enrollmentId, subMaterialId }) {
  const handleVideoComplete = async () => {
    const timeSpent = 300 // 5 minutes in seconds
    await markSubMaterialCompleted(enrollmentId, subMaterialId, timeSpent)
  }

  return (
    <video onEnded={handleVideoComplete}>
      {/* video player */}
    </video>
  )
}
```

**What happens automatically:**
1. ✅ Marks lesson as completed
2. ✅ Updates course progress percentage
3. ✅ If progress reaches 100%, triggers course completion:
   - Awards points (200-800 based on difficulty)
   - Updates all course skills
   - Generates certificate
   - Checks and awards badges

---

### 4. Manual Point Awards (Admin)

```tsx
import { awardPoints } from '@/lib/actions/gamification'

// Award bonus points for special achievement
await awardPoints(
  studentId,
  500, // points
  'skill', // source type
  'special-achievement-id' // optional source ID
)
```

---

## API Reference

### Quest Actions (`/lib/actions/quests.ts`)

#### `submitQuestAttempt(questId, studentId, answers)`
Submit a quest attempt and auto-award points/badges if passed.

**Parameters:**
- `questId` - UUID of the quest
- `studentId` - UUID of the student
- `answers` - Object mapping question IDs to selected answer(s)

**Returns:**
```ts
{
  success: boolean
  data?: {
    attempt: QuestAttempt
    score: number
    passed: boolean
    earnedPoints: number
    totalPoints: number
  }
  error?: any
}
```

#### `getQuestWithQuestions(questId)`
Get quest details including all questions and options.

#### `getCourseQuests(courseId)`
Get all published quests for a course.

#### `canAttemptQuest(questId, studentId)`
Check if student can attempt the quest (enrollment, max attempts).

---

### Course Actions (`/lib/actions/courses.ts`)

#### `enrollInCourse(studentId, courseId)`
Enroll student in a course. Updates streak.

#### `markSubMaterialCompleted(enrollmentId, subMaterialId, timeSpent)`
Mark a lesson/video as completed. Auto-completes course at 100%.

#### `getStudentEnrollments(studentId)`
Get all courses the student is enrolled in.

#### `getCourseProgress(enrollmentId)`
Get detailed progress for a specific enrollment.

#### `getPublishedCourses()`
Get all published and approved courses.

#### `getCourseById(courseId)`
Get course details with materials and sub-materials.

---

### Gamification Actions (`/lib/actions/gamification.ts`)

#### `awardPoints(studentId, points, source, sourceId?)`
Award points to a student. Auto-updates leaderboard.

**Sources:** `'quest'`, `'course'`, `'skill'`, `'streak'`

#### `checkAndAwardBadges(studentId)`
Check all badge requirements and award qualifying badges.

#### `updateStreak(studentId)`
Update student's learning streak based on activity.

#### `getLeaderboard(limit, timeframe)`
Get top students by points.

**Timeframes:** `'all'`, `'month'`, `'week'`

#### `getStudentRank(studentId)`
Get student's current rank on the leaderboard.

#### `getStudentBadges(studentId)`
Get earned and locked badges for a student.

---

### Skills Actions (`/lib/actions/skills.ts`)

#### `getAllSkills()`
Get all 25 cybersecurity skills.

#### `getStudentSkills(studentId)`
Get student's skill progress.

#### `updateSkillProficiency(studentId, skillId, newLevel, pointsToAdd)`
Update a skill's proficiency level. Auto-called by quest/course completion.

#### `getSkillsByCategory()`
Get skills grouped by category (web, network, etc.).

---

## Testing the Integration

### 1. Seed the Database
Run all 4 seed files in Supabase SQL Editor (see main README).

### 2. Create Test Data

```sql
-- Create a test course
INSERT INTO courses (title, slug, category, difficulty, is_published, is_approved)
VALUES ('Test Hacking Course', 'test-hacking', 'Web Security', 'beginner', true, true);

-- Link course to a skill
INSERT INTO course_skills (course_id, skill_id, proficiency_level_taught)
VALUES (
  (SELECT id FROM courses WHERE slug = 'test-hacking'),
  (SELECT id FROM skills WHERE name = 'SQL Injection'),
  'intermediate'
);

-- Create a quest
INSERT INTO quests (course_id, title, passing_score, is_published)
VALUES (
  (SELECT id FROM courses WHERE slug = 'test-hacking'),
  'SQL Injection Basics',
  70,
  true
);

-- Add a question
INSERT INTO quest_questions (quest_id, question_text, question_type, points, order_index)
VALUES (
  (SELECT id FROM quests WHERE title = 'SQL Injection Basics'),
  'What does SQL stand for?',
  'multiple_choice',
  1,
  1
);

-- Add options
INSERT INTO quest_options (question_id, option_text, is_correct, order_index)
VALUES
  ((SELECT id FROM quest_questions WHERE question_text LIKE 'What does SQL%'), 'Structured Query Language', true, 1),
  ((SELECT id FROM quest_questions WHERE question_text LIKE 'What does SQL%'), 'Simple Query Language', false, 2),
  ((SELECT id FROM quest_questions WHERE question_text LIKE 'What does SQL%'), 'Server Query Language', false, 3);
```

### 3. Test Flow

1. **Enroll in course** - Streak updates ✓
2. **Complete lessons** - Progress tracks ✓
3. **Pass quest** - Points awarded, skills updated, badges checked ✓
4. **Check dashboard** - See points, skills, badges, leaderboard ✓
5. **Complete course** - More points, certificate generated ✓

---

## 🎯 Summary

The gamification system is **fully integrated** and works automatically:

- ✅ Points awarded on quest/course completion
- ✅ Badges auto-checked and awarded
- ✅ Skills updated based on performance
- ✅ Leaderboard auto-updated
- ✅ Streaks tracked daily
- ✅ Certificates generated on course completion

**You don't need to manually call gamification functions** - they're automatically triggered by the quest and course actions!
