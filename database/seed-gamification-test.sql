-- =====================================================
-- Gamification Test Data Seed File
-- =====================================================
-- This file creates sample courses, quests, and materials
-- for testing the gamification system.
-- Run this AFTER seed-skills.sql and seed-badges.sql
-- =====================================================

-- Clean up existing test data (optional)
DELETE FROM quest_options WHERE question_id IN (
  SELECT id FROM quest_questions WHERE quest_id IN (
    SELECT id FROM quests WHERE title LIKE 'Test:%'
  )
);
DELETE FROM quest_questions WHERE quest_id IN (
  SELECT id FROM quests WHERE title LIKE 'Test:%'
);
DELETE FROM quests WHERE title LIKE 'Test:%';
DELETE FROM course_skills WHERE course_id IN (
  SELECT id FROM courses WHERE title LIKE 'Test:%'
);
DELETE FROM sub_materials WHERE material_id IN (
  SELECT id FROM materials WHERE course_id IN (
    SELECT id FROM courses WHERE title LIKE 'Test:%'
  )
);
DELETE FROM materials WHERE course_id IN (
  SELECT id FROM courses WHERE title LIKE 'Test:%'
);
DELETE FROM courses WHERE title LIKE 'Test:%';

-- =====================================================
-- 1. Create Test Courses
-- =====================================================

-- Beginner Course: SQL Injection Fundamentals
INSERT INTO courses (
  title, slug, description, category, difficulty,
  estimated_duration, is_published, is_approved,
  created_at, updated_at
) VALUES (
  'Test: SQL Injection Fundamentals',
  'test-sql-injection-fundamentals',
  'Learn the basics of SQL injection vulnerabilities and how to exploit them ethically. This beginner-friendly course covers SQL syntax, common injection points, and basic exploitation techniques.',
  'Web Security',
  'beginner',
  180, -- 3 hours
  true,
  true,
  NOW(),
  NOW()
);

-- Intermediate Course: Cross-Site Scripting (XSS) Mastery
INSERT INTO courses (
  title, slug, description, category, difficulty,
  estimated_duration, is_published, is_approved,
  created_at, updated_at
) VALUES (
  'Test: Cross-Site Scripting (XSS) Mastery',
  'test-xss-mastery',
  'Master reflected, stored, and DOM-based XSS attacks. Learn payload crafting, bypass techniques, and real-world exploitation scenarios.',
  'Web Security',
  'intermediate',
  240, -- 4 hours
  true,
  true,
  NOW(),
  NOW()
);

-- Advanced Course: Web Application Penetration Testing
INSERT INTO courses (
  title, slug, description, category, difficulty,
  estimated_duration, is_published, is_approved,
  created_at, updated_at
) VALUES (
  'Test: Web Application Penetration Testing',
  'test-web-app-pentest',
  'Comprehensive penetration testing methodology for web applications. Covers reconnaissance, vulnerability assessment, exploitation, and reporting.',
  'Web Security',
  'advanced',
  480, -- 8 hours
  true,
  true,
  NOW(),
  NOW()
);

-- =====================================================
-- 2. Link Courses to Skills
-- =====================================================

-- SQL Injection course teaches SQL Injection skill at Intermediate level
INSERT INTO course_skills (course_id, skill_id, proficiency_level_taught)
VALUES (
  (SELECT id FROM courses WHERE slug = 'test-sql-injection-fundamentals'),
  (SELECT id FROM skills WHERE name = 'SQL Injection'),
  'intermediate'
);

-- XSS course teaches XSS skill at Advanced level
INSERT INTO course_skills (course_id, skill_id, proficiency_level_taught)
VALUES (
  (SELECT id FROM courses WHERE slug = 'test-xss-mastery'),
  (SELECT id FROM skills WHERE name = 'Cross-Site Scripting (XSS)'),
  'advanced'
);

-- Pentest course teaches multiple skills
INSERT INTO course_skills (course_id, skill_id, proficiency_level_taught)
VALUES
  (
    (SELECT id FROM courses WHERE slug = 'test-web-app-pentest'),
    (SELECT id FROM skills WHERE name = 'SQL Injection'),
    'expert'
  ),
  (
    (SELECT id FROM courses WHERE slug = 'test-web-app-pentest'),
    (SELECT id FROM skills WHERE name = 'Cross-Site Scripting (XSS)'),
    'expert'
  ),
  (
    (SELECT id FROM courses WHERE slug = 'test-web-app-pentest'),
    (SELECT id FROM skills WHERE name = 'API Security'),
    'advanced'
  );

-- =====================================================
-- 3. Create Course Materials (Chapters)
-- =====================================================

-- SQL Injection Course Materials
INSERT INTO materials (course_id, title, description, order_index, created_at, updated_at)
VALUES
  (
    (SELECT id FROM courses WHERE slug = 'test-sql-injection-fundamentals'),
    'Chapter 1: Introduction to SQL',
    'Understanding SQL databases and basic query syntax',
    1,
    NOW(),
    NOW()
  ),
  (
    (SELECT id FROM courses WHERE slug = 'test-sql-injection-fundamentals'),
    'Chapter 2: SQL Injection Basics',
    'What is SQL injection and how does it work?',
    2,
    NOW(),
    NOW()
  ),
  (
    (SELECT id FROM courses WHERE slug = 'test-sql-injection-fundamentals'),
    'Chapter 3: Hands-On Exploitation',
    'Practice exploiting vulnerable applications',
    3,
    NOW(),
    NOW()
  );

-- XSS Course Materials
INSERT INTO materials (course_id, title, description, order_index, created_at, updated_at)
VALUES
  (
    (SELECT id FROM courses WHERE slug = 'test-xss-mastery'),
    'Chapter 1: XSS Fundamentals',
    'Types of XSS attacks and how they work',
    1,
    NOW(),
    NOW()
  ),
  (
    (SELECT id FROM courses WHERE slug = 'test-xss-mastery'),
    'Chapter 2: Payload Crafting',
    'Creating effective XSS payloads',
    2,
    NOW(),
    NOW()
  );

-- =====================================================
-- 4. Create Sub-Materials (Lessons/Videos)
-- =====================================================

-- SQL Injection - Chapter 1 Lessons
INSERT INTO sub_materials (
  material_id, title, content_type, content,
  duration, order_index, is_preview, created_at, updated_at
)
SELECT
  m.id,
  'What is SQL?',
  'video',
  '{"videoUrl": "https://res.cloudinary.com/demo/video/upload/v1/sample.mp4", "description": "Introduction to SQL databases"}',
  600, -- 10 minutes
  1,
  true,
  NOW(),
  NOW()
FROM materials m
WHERE m.title = 'Chapter 1: Introduction to SQL'
AND m.course_id = (SELECT id FROM courses WHERE slug = 'test-sql-injection-fundamentals');

INSERT INTO sub_materials (
  material_id, title, content_type, content,
  duration, order_index, is_preview, created_at, updated_at
)
SELECT
  m.id,
  'Basic SQL Queries',
  'video',
  '{"videoUrl": "https://res.cloudinary.com/demo/video/upload/v1/sample.mp4", "description": "SELECT, INSERT, UPDATE, DELETE statements"}',
  900, -- 15 minutes
  2,
  false,
  NOW(),
  NOW()
FROM materials m
WHERE m.title = 'Chapter 1: Introduction to SQL'
AND m.course_id = (SELECT id FROM courses WHERE slug = 'test-sql-injection-fundamentals');

-- SQL Injection - Chapter 2 Lessons
INSERT INTO sub_materials (
  material_id, title, content_type, content,
  duration, order_index, is_preview, created_at, updated_at
)
SELECT
  m.id,
  'Understanding SQL Injection',
  'video',
  '{"videoUrl": "https://res.cloudinary.com/demo/video/upload/v1/sample.mp4", "description": "How SQL injection vulnerabilities occur"}',
  1200, -- 20 minutes
  1,
  false,
  NOW(),
  NOW()
FROM materials m
WHERE m.title = 'Chapter 2: SQL Injection Basics'
AND m.course_id = (SELECT id FROM courses WHERE slug = 'test-sql-injection-fundamentals');

-- =====================================================
-- 5. Create Quests (Assessments)
-- =====================================================

-- Beginner Quest: SQL Injection Basics
INSERT INTO quests (
  course_id, title, description, difficulty,
  passing_score, max_attempts, time_limit_minutes,
  is_published, created_at, updated_at
) VALUES (
  (SELECT id FROM courses WHERE slug = 'test-sql-injection-fundamentals'),
  'Test: SQL Injection Basics Quiz',
  'Test your knowledge of SQL injection fundamentals',
  'beginner',
  70,
  3,
  30,
  true,
  NOW(),
  NOW()
);

-- Intermediate Quest: XSS Challenge
INSERT INTO quests (
  course_id, title, description, difficulty,
  passing_score, max_attempts, time_limit_minutes,
  is_published, created_at, updated_at
) VALUES (
  (SELECT id FROM courses WHERE slug = 'test-xss-mastery'),
  'Test: XSS Exploitation Challenge',
  'Demonstrate your XSS skills in realistic scenarios',
  'intermediate',
  75,
  2,
  45,
  true,
  NOW(),
  NOW()
);

-- =====================================================
-- 6. Create Quest Questions
-- =====================================================

-- SQL Injection Quiz Questions
INSERT INTO quest_questions (
  quest_id, question_text, question_type,
  points, order_index, created_at, updated_at
)
VALUES
  (
    (SELECT id FROM quests WHERE title = 'Test: SQL Injection Basics Quiz'),
    'What does SQL stand for?',
    'multiple_choice',
    1,
    1,
    NOW(),
    NOW()
  ),
  (
    (SELECT id FROM quests WHERE title = 'Test: SQL Injection Basics Quiz'),
    'Which of the following is a common SQL injection payload?',
    'multiple_choice',
    1,
    2,
    NOW(),
    NOW()
  ),
  (
    (SELECT id FROM quests WHERE title = 'Test: SQL Injection Basics Quiz'),
    'What is the primary goal of SQL injection?',
    'multiple_choice',
    1,
    3,
    NOW(),
    NOW()
  ),
  (
    (SELECT id FROM quests WHERE title = 'Test: SQL Injection Basics Quiz'),
    'Which SQL statement is used to extract data from a database?',
    'multiple_choice',
    1,
    4,
    NOW(),
    NOW()
  ),
  (
    (SELECT id FROM quests WHERE title = 'Test: SQL Injection Basics Quiz'),
    'Select all valid SQL injection techniques:',
    'multiple_select',
    2,
    5,
    NOW(),
    NOW()
  );

-- XSS Challenge Questions
INSERT INTO quest_questions (
  quest_id, question_text, question_type,
  points, order_index, created_at, updated_at
)
VALUES
  (
    (SELECT id FROM quests WHERE title = 'Test: XSS Exploitation Challenge'),
    'Which type of XSS is stored on the server?',
    'multiple_choice',
    1,
    1,
    NOW(),
    NOW()
  ),
  (
    (SELECT id FROM quests WHERE title = 'Test: XSS Exploitation Challenge'),
    'What HTML tag is commonly used for XSS attacks?',
    'multiple_choice',
    1,
    2,
    NOW(),
    NOW()
  ),
  (
    (SELECT id FROM quests WHERE title = 'Test: XSS Exploitation Challenge'),
    'Which of the following are valid XSS payloads? (Select all that apply)',
    'multiple_select',
    2,
    3,
    NOW(),
    NOW()
  );

-- =====================================================
-- 7. Create Quest Options (Answers)
-- =====================================================

-- Question 1: What does SQL stand for?
INSERT INTO quest_options (question_id, option_text, is_correct, order_index)
SELECT id, 'Structured Query Language', true, 1
FROM quest_questions WHERE question_text = 'What does SQL stand for?'
UNION ALL
SELECT id, 'Simple Query Language', false, 2
FROM quest_questions WHERE question_text = 'What does SQL stand for?'
UNION ALL
SELECT id, 'Server Query Language', false, 3
FROM quest_questions WHERE question_text = 'What does SQL stand for?'
UNION ALL
SELECT id, 'System Query Language', false, 4
FROM quest_questions WHERE question_text = 'What does SQL stand for?';

-- Question 2: Common SQL injection payload
INSERT INTO quest_options (question_id, option_text, is_correct, order_index)
SELECT id, ''' OR ''1''=''1', true, 1
FROM quest_questions WHERE question_text = 'Which of the following is a common SQL injection payload?'
UNION ALL
SELECT id, '<script>alert(1)</script>', false, 2
FROM quest_questions WHERE question_text = 'Which of the following is a common SQL injection payload?'
UNION ALL
SELECT id, '<?php echo "hello"; ?>', false, 3
FROM quest_questions WHERE question_text = 'Which of the following is a common SQL injection payload?'
UNION ALL
SELECT id, 'SELECT * FROM users', false, 4
FROM quest_questions WHERE question_text = 'Which of the following is a common SQL injection payload?';

-- Question 3: Primary goal of SQL injection
INSERT INTO quest_options (question_id, option_text, is_correct, order_index)
SELECT id, 'To manipulate or access database data', true, 1
FROM quest_questions WHERE question_text = 'What is the primary goal of SQL injection?'
UNION ALL
SELECT id, 'To crash the web server', false, 2
FROM quest_questions WHERE question_text = 'What is the primary goal of SQL injection?'
UNION ALL
SELECT id, 'To steal user cookies', false, 3
FROM quest_questions WHERE question_text = 'What is the primary goal of SQL injection?'
UNION ALL
SELECT id, 'To perform DDoS attacks', false, 4
FROM quest_questions WHERE question_text = 'What is the primary goal of SQL injection?';

-- Question 4: SQL statement to extract data
INSERT INTO quest_options (question_id, option_text, is_correct, order_index)
SELECT id, 'SELECT', true, 1
FROM quest_questions WHERE question_text = 'Which SQL statement is used to extract data from a database?'
UNION ALL
SELECT id, 'INSERT', false, 2
FROM quest_questions WHERE question_text = 'Which SQL statement is used to extract data from a database?'
UNION ALL
SELECT id, 'UPDATE', false, 3
FROM quest_questions WHERE question_text = 'Which SQL statement is used to extract data from a database?'
UNION ALL
SELECT id, 'DELETE', false, 4
FROM quest_questions WHERE question_text = 'Which SQL statement is used to extract data from a database?';

-- Question 5: SQL injection techniques (multiple select)
INSERT INTO quest_options (question_id, option_text, is_correct, order_index)
SELECT id, 'Union-based injection', true, 1
FROM quest_questions WHERE question_text = 'Select all valid SQL injection techniques:'
UNION ALL
SELECT id, 'Boolean-based blind injection', true, 2
FROM quest_questions WHERE question_text = 'Select all valid SQL injection techniques:'
UNION ALL
SELECT id, 'Time-based blind injection', true, 3
FROM quest_questions WHERE question_text = 'Select all valid SQL injection techniques:'
UNION ALL
SELECT id, 'Buffer overflow injection', false, 4
FROM quest_questions WHERE question_text = 'Select all valid SQL injection techniques:';

-- XSS Question 1: Type of XSS stored on server
INSERT INTO quest_options (question_id, option_text, is_correct, order_index)
SELECT id, 'Stored XSS', true, 1
FROM quest_questions WHERE question_text = 'Which type of XSS is stored on the server?'
UNION ALL
SELECT id, 'Reflected XSS', false, 2
FROM quest_questions WHERE question_text = 'Which type of XSS is stored on the server?'
UNION ALL
SELECT id, 'DOM-based XSS', false, 3
FROM quest_questions WHERE question_text = 'Which type of XSS is stored on the server?'
UNION ALL
SELECT id, 'Persistent XSS', true, 4
FROM quest_questions WHERE question_text = 'Which type of XSS is stored on the server?';

-- XSS Question 2: HTML tag for XSS
INSERT INTO quest_options (question_id, option_text, is_correct, order_index)
SELECT id, '<script>', true, 1
FROM quest_questions WHERE question_text = 'What HTML tag is commonly used for XSS attacks?'
UNION ALL
SELECT id, '<div>', false, 2
FROM quest_questions WHERE question_text = 'What HTML tag is commonly used for XSS attacks?'
UNION ALL
SELECT id, '<table>', false, 3
FROM quest_questions WHERE question_text = 'What HTML tag is commonly used for XSS attacks?'
UNION ALL
SELECT id, '<form>', false, 4
FROM quest_questions WHERE question_text = 'What HTML tag is commonly used for XSS attacks?';

-- XSS Question 3: Valid XSS payloads (multiple select)
INSERT INTO quest_options (question_id, option_text, is_correct, order_index)
SELECT id, '<script>alert(''XSS'')</script>', true, 1
FROM quest_questions WHERE question_text LIKE 'Which of the following are valid XSS payloads%'
UNION ALL
SELECT id, '<img src=x onerror=alert(1)>', true, 2
FROM quest_questions WHERE question_text LIKE 'Which of the following are valid XSS payloads%'
UNION ALL
SELECT id, '<svg onload=alert(''XSS'')>', true, 3
FROM quest_questions WHERE question_text LIKE 'Which of the following are valid XSS payloads%'
UNION ALL
SELECT id, ''' OR 1=1--', false, 4
FROM quest_questions WHERE question_text LIKE 'Which of the following are valid XSS payloads%';

-- =====================================================
-- Success Message
-- =====================================================

DO $$
DECLARE
  course_count INT;
  quest_count INT;
  question_count INT;
BEGIN
  SELECT COUNT(*) INTO course_count FROM courses WHERE title LIKE 'Test:%';
  SELECT COUNT(*) INTO quest_count FROM quests WHERE title LIKE 'Test:%';
  SELECT COUNT(*) INTO question_count FROM quest_questions
    WHERE quest_id IN (SELECT id FROM quests WHERE title LIKE 'Test:%');

  RAISE NOTICE '✅ Gamification test data seeded successfully!';
  RAISE NOTICE '   - Courses created: %', course_count;
  RAISE NOTICE '   - Quests created: %', quest_count;
  RAISE NOTICE '   - Questions created: %', question_count;
  RAISE NOTICE '';
  RAISE NOTICE '🎮 Test the system:';
  RAISE NOTICE '   1. Enroll in "Test: SQL Injection Fundamentals"';
  RAISE NOTICE '   2. Complete lessons to track progress';
  RAISE NOTICE '   3. Take the quiz to earn points (100-175 pts)';
  RAISE NOTICE '   4. Complete course to earn more points (200 pts)';
  RAISE NOTICE '   5. Check leaderboard and badges!';
END $$;
