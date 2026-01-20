# Database Seeding Guide

This guide explains how to populate your cybersecurity e-learning platform with sample courses and content.

## Prerequisites

Before running the seed scripts, ensure you have:

1. **Database schema created** - Run `supabase-schema.sql` first
2. **At least one admin/mentor user** - Required for course ownership
3. **Supabase project running** or local PostgreSQL connected

**Verify prerequisites:**
```sql
-- Check if schema exists
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
-- Should return 20+ tables

-- Check for admin/mentor user
SELECT id, email, role FROM profiles WHERE role IN ('admin', 'mentor') AND is_approved = true;
-- Should return at least one row
```

---

## Seeding Order

⚠️ **IMPORTANT:** Run scripts in this EXACT order. Each step depends on the previous.

### Step 1: Seed Skills (REQUIRED FIRST)

```sql
-- In Supabase SQL Editor or psql
\i database/seed-skills.sql
```

✅ Creates 25 cybersecurity skills across 6 categories.

⚠️ **Warning:** If you skip this step, course-skill associations will fail.

### Step 2: Seed Badges

```sql
\i database/seed-badges.sql
```

✅ Creates 15 achievement badges across 4 tiers.

### Step 3: Seed Security Tools

```sql
\i database/seed-tools.sql
```

✅ Creates 35+ security tools.

### Step 4: Seed Courses

```sql
\i database/seed-courses.sql
```

⚠️ **Warning:** This script requires:
- Skills to be seeded (Step 1)
- At least one approved admin/mentor user

If you see "No approved admin or mentor found", create one first:
```sql
UPDATE profiles SET role = 'admin', is_approved = true WHERE email = 'your@email.com';
```

This creates 5 comprehensive courses:
- **Web Application Security Fundamentals** (Beginner) - $49.99
  - 5 materials, 20+ lessons, 2 quests
  - Topics: SQL injection, XSS, CSRF, SSRF, file uploads, API security

- **Network Security and Penetration Testing** (Intermediate) - $79.99
  - 4 materials, 12+ lessons, 1 quest
  - Topics: Nmap, Wireshark, MITM attacks, firewall evasion

- **Professional Penetration Testing** (Advanced) - $99.99
  - 6 materials, 15+ lessons
  - Topics: Metasploit, privilege escalation, post-exploitation, reporting

- **Applied Cryptography** (Intermediate) - $69.99
  - 4 materials, 10+ lessons
  - Topics: Encryption, hashing, PKI, password cracking

- **Binary Exploitation and Exploit Development** (Advanced) - $149.99
  - 5 materials, 12+ lessons
  - Topics: Assembly, buffer overflows, shellcode, ROP chains

### 4. Link Tools to Courses
```sql
\i database/link-tools-to-courses.sql
```

This associates security tools with relevant courses (e.g., Burp Suite with Web App Security, Nmap with Network Security).

## Using Supabase Dashboard

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the content of each seed file
5. Click **Run**
6. Check the output messages for success confirmation

## Using psql Command Line

```bash
# Connect to your database
psql postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]

# Run each script
\i database/seed-skills.sql
\i database/seed-tools.sql
\i database/seed-courses.sql
\i database/link-tools-to-courses.sql
```

## Verifying the Data

After seeding, verify with these queries:

```sql
-- Check courses
SELECT title, difficulty, price, is_published
FROM courses
ORDER BY created_at DESC;

-- Check materials per course
SELECT c.title, COUNT(m.id) as material_count
FROM courses c
LEFT JOIN materials m ON c.id = m.course_id
GROUP BY c.id, c.title;

-- Check sub-materials per course
SELECT c.title, COUNT(sm.id) as lesson_count
FROM courses c
LEFT JOIN materials m ON c.id = m.course_id
LEFT JOIN sub_materials sm ON m.id = sm.material_id
GROUP BY c.id, c.title;

-- Check quests
SELECT c.title, q.title as quest_title, q.passing_score, q.time_limit
FROM courses c
LEFT JOIN quests q ON c.id = q.course_id
ORDER BY c.title;

-- Check course-skill associations
SELECT c.title, s.name as skill, cs.proficiency_level_taught
FROM courses c
JOIN course_skills cs ON c.id = cs.course_id
JOIN skills s ON cs.skill_id = s.id
ORDER BY c.title, s.name;

-- Check tool-course associations
SELECT st.name, st.category, c.title as course_title
FROM security_tools st
JOIN courses c ON c.id = ANY(st.related_course_ids)
ORDER BY st.category, st.name;
```

## Content Overview

### Total Content Created
- **5 Courses** covering all major cybersecurity domains
- **23 Materials** (chapters/modules)
- **50+ Sub-materials** (lessons with detailed content)
- **5+ Quests** (assessments/quizzes)
- **30+ Questions** across all quests
- **Course-skill associations** linking courses to 15+ skills
- **Tool-course associations** linking 25+ tools to courses

### Difficulty Distribution
- Beginner: 1 course
- Intermediate: 2 courses
- Advanced: 2 courses

### Topics Covered
- Web Application Security (OWASP Top 10)
- Network Security & Scanning
- Penetration Testing Methodology
- Cryptography & Password Security
- Binary Exploitation & Reverse Engineering

## Customization

### Pricing
Update prices in `seed-courses.sql` before running:
```sql
price, -- Change the numeric value
```

### Instructor
The script automatically assigns courses to the first approved admin/mentor. To use a specific user:
1. Get their UUID: `SELECT id FROM profiles WHERE email = 'your@email.com';`
2. Modify the script to use that UUID

### Content
All lesson content is in the `content` field of `sub_materials` inserts. Edit as needed for your specific curriculum.

## Troubleshooting

### Error: "No approved admin or mentor found"
**Solution:** Create an admin user first:
```sql
UPDATE profiles
SET role = 'admin', is_approved = true
WHERE email = 'your@email.com';
```

### Error: "Skill not found"
**Solution:** Run `seed-skills.sql` first before `seed-courses.sql`

### Courses not showing in app
**Solution:** Check that `is_published = true` and `is_approved = true`:
```sql
UPDATE courses SET is_published = true, is_approved = true;
```

### Empty lessons
**Solution:** The lessons are created with text content in the `content` field. If you want to add videos, update the `video_url` and `cloudinary_public_id` fields after uploading to Cloudinary.

## Next Steps

After seeding the database:
1. Browse courses at `/courses`
2. Enroll in a course as a student
3. Navigate to `/courses/[courseId]/learn` to view lessons
4. Take quests at `/quests/[questId]`
5. Check the leaderboard at `/leaderboard`
6. View your skills at `/skills`

## Resetting Data

To start fresh:
```sql
-- WARNING: This deletes all course data!
TRUNCATE courses CASCADE;
```

This will cascade delete all materials, sub-materials, quests, enrollments, and progress records.

## Adding More Content

To add more courses, you can:
1. Copy the pattern from `seed-courses.sql`
2. Create new course with materials and sub-materials
3. Add quests with questions
4. Link to skills using `course_skills` table
5. Update tools to reference the new course ID

---

**Created:** January 2026
**License:** MIT
**Support:** For issues, check the main project README
