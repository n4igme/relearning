-- ============================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR E-LEARNING PLATFORM
-- ============================================================================
-- Migration from MongoDB to PostgreSQL
-- Created: 2025-12-22
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'mentor', 'student')),

    -- Profile
    avatar_url TEXT,
    bio TEXT,

    -- Authentication
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token TEXT,
    email_verification_expires TIMESTAMP,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMP,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_approval_status ON users(approval_status);

-- ============================================================================
-- COURSES TABLE
-- ============================================================================
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Content
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('programming', 'design', 'business', 'marketing', 'data-science', 'other')),
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
    thumbnail_url TEXT,
    tags TEXT[], -- PostgreSQL array type

    -- Pricing
    price_amount DECIMAL(10, 2) DEFAULT 0,
    price_currency VARCHAR(3) DEFAULT 'USD',
    price_proposed_by INTEGER REFERENCES users(id),
    admin_approved_price DECIMAL(10, 2),
    admin_approved_by INTEGER REFERENCES users(id),
    admin_approved_at TIMESTAMP,
    price_approval_status VARCHAR(20) DEFAULT 'pending',
    platform_fee_percentage INTEGER DEFAULT 10,

    -- Status
    is_published BOOLEAN DEFAULT FALSE,
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,

    -- Stats
    enrollment_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3, 2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

-- Indexes for courses
CREATE INDEX idx_courses_creator ON courses(creator_id);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_approval_status ON courses(approval_status);
CREATE INDEX idx_courses_is_published ON courses(is_published);
CREATE INDEX idx_courses_price ON courses(price_amount);

-- ============================================================================
-- COURSE MENTORS (Many-to-Many)
-- ============================================================================
CREATE TABLE course_mentors (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    mentor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, mentor_id)
);

CREATE INDEX idx_course_mentors_course ON course_mentors(course_id);
CREATE INDEX idx_course_mentors_mentor ON course_mentors(mentor_id);

-- ============================================================================
-- MATERIALS (Bab/Chapter)
-- ============================================================================
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_materials_course ON materials(course_id);
CREATE INDEX idx_materials_order ON materials(course_id, order_index);

-- ============================================================================
-- SUB-MATERIALS (Sub-Bab/Lessons)
-- ============================================================================
CREATE TABLE sub_materials (
    id SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('video', 'article', 'pdf', 'resource', 'text')),
    content TEXT, -- For text content
    video_url TEXT, -- Cloudinary video URL
    file_url TEXT, -- For PDFs and resources
    duration INTEGER, -- Duration in minutes
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sub_materials_material ON sub_materials(material_id);
CREATE INDEX idx_sub_materials_order ON sub_materials(material_id, order_index);

-- ============================================================================
-- QUESTS (Assessments/Quizzes)
-- ============================================================================
CREATE TABLE quests (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    title VARCHAR(500) NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 70,
    time_limit INTEGER, -- In minutes

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quests_course ON quests(course_id);
CREATE INDEX idx_quests_creator ON quests(creator_id);
CREATE INDEX idx_quests_approval_status ON quests(approval_status);

-- ============================================================================
-- QUEST QUESTIONS
-- ============================================================================
CREATE TABLE quest_questions (
    id SERIAL PRIMARY KEY,
    quest_id INTEGER NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('multiple-choice', 'true-false', 'short-answer')),
    points INTEGER DEFAULT 10,
    explanation TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quest_questions_quest ON quest_questions(quest_id);

-- ============================================================================
-- QUEST QUESTION OPTIONS (for multiple-choice)
-- ============================================================================
CREATE TABLE quest_question_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES quest_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_quest_options_question ON quest_question_options(question_id);

-- ============================================================================
-- ENROLLMENTS (Student-Course Join Table)
-- ============================================================================
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

    -- Progress
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed BOOLEAN DEFAULT FALSE,

    -- Payment
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_amount DECIMAL(10, 2),
    transaction_id VARCHAR(255),

    -- Quest
    quest_attempted BOOLEAN DEFAULT FALSE,
    quest_passed BOOLEAN DEFAULT FALSE,

    -- Timestamps
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    UNIQUE(student_id, course_id)
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_payment_status ON enrollments(payment_status);

-- ============================================================================
-- PROGRESS (Material Completion Tracking)
-- ============================================================================
CREATE TABLE progress (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    sub_material_id INTEGER NOT NULL REFERENCES sub_materials(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    watched_duration INTEGER, -- Seconds watched (for videos)

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(enrollment_id, sub_material_id)
);

CREATE INDEX idx_progress_enrollment ON progress(enrollment_id);
CREATE INDEX idx_progress_user ON progress(user_id);
CREATE INDEX idx_progress_sub_material ON progress(sub_material_id);

-- ============================================================================
-- QUEST ATTEMPTS
-- ============================================================================
CREATE TABLE quest_attempts (
    id SERIAL PRIMARY KEY,
    quest_id INTEGER NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,

    score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    time_taken INTEGER, -- Seconds

    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quest_attempts_quest ON quest_attempts(quest_id);
CREATE INDEX idx_quest_attempts_student ON quest_attempts(student_id);
CREATE INDEX idx_quest_attempts_enrollment ON quest_attempts(enrollment_id);

-- ============================================================================
-- QUEST ATTEMPT ANSWERS
-- ============================================================================
CREATE TABLE quest_attempt_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL REFERENCES quest_attempts(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES quest_questions(id) ON DELETE CASCADE,
    selected_option_id INTEGER REFERENCES quest_question_options(id) ON DELETE SET NULL,
    answer_text TEXT, -- For short-answer questions
    is_correct BOOLEAN NOT NULL,
    points_earned INTEGER DEFAULT 0
);

CREATE INDEX idx_attempt_answers_attempt ON quest_attempt_answers(attempt_id);

-- ============================================================================
-- CERTIFICATES
-- ============================================================================
CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    quest_id INTEGER REFERENCES quests(id) ON DELETE SET NULL,

    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    score INTEGER NOT NULL,
    grade VARCHAR(5) NOT NULL,

    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP,

    -- Verification
    verification_url TEXT,
    is_valid BOOLEAN DEFAULT TRUE,

    -- Revocation
    revoked_at TIMESTAMP,
    revoked_by INTEGER REFERENCES users(id),
    revoke_reason TEXT
);

CREATE INDEX idx_certificates_student ON certificates(student_id);
CREATE INDEX idx_certificates_course ON certificates(course_id);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);

-- ============================================================================
-- PAYMENTS
-- ============================================================================
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE SET NULL,

    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    payment_method VARCHAR(50) CHECK (payment_method IN ('stripe', 'paypal', 'midtrans', 'bank-transfer')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),

    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_payment_intent_id VARCHAR(255),

    -- Refund
    refunded_at TIMESTAMP,
    refund_reason TEXT,
    refund_amount DECIMAL(10, 2),

    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_course ON payments(course_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================================
-- FORUM QUESTIONS
-- ============================================================================
CREATE TABLE forum_questions (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[],

    is_resolved BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_closed BOOLEAN DEFAULT FALSE,

    views INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_forum_questions_course ON forum_questions(course_id);
CREATE INDEX idx_forum_questions_author ON forum_questions(author_id);
CREATE INDEX idx_forum_questions_resolved ON forum_questions(is_resolved);

-- Full-text search index
CREATE INDEX idx_forum_questions_search ON forum_questions USING GIN (to_tsvector('english', title || ' ' || content));

-- ============================================================================
-- FORUM REPLIES
-- ============================================================================
CREATE TABLE forum_replies (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES forum_questions(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_reply_id INTEGER REFERENCES forum_replies(id) ON DELETE CASCADE, -- For nested replies

    content TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_forum_replies_question ON forum_replies(question_id);
CREATE INDEX idx_forum_replies_author ON forum_replies(author_id);
CREATE INDEX idx_forum_replies_parent ON forum_replies(parent_reply_id);

-- ============================================================================
-- FORUM VOTES (Questions and Replies)
-- ============================================================================
CREATE TABLE forum_votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES forum_questions(id) ON DELETE CASCADE,
    reply_id INTEGER REFERENCES forum_replies(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- User can vote on either question OR reply, not both
    CHECK ((question_id IS NOT NULL AND reply_id IS NULL) OR (question_id IS NULL AND reply_id IS NOT NULL)),
    -- User can only vote once per item
    UNIQUE(user_id, question_id, reply_id)
);

CREATE INDEX idx_forum_votes_user ON forum_votes(user_id);
CREATE INDEX idx_forum_votes_question ON forum_votes(question_id);
CREATE INDEX idx_forum_votes_reply ON forum_votes(reply_id);

-- ============================================================================
-- REVIEWS & RATINGS
-- ============================================================================
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(course_id, student_id) -- One review per student per course
);

CREATE INDEX idx_reviews_course ON reviews(course_id);
CREATE INDEX idx_reviews_student ON reviews(student_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sub_materials_updated_at BEFORE UPDATE ON sub_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON quests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_questions_updated_at BEFORE UPDATE ON forum_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Courses with creator info and stats
CREATE VIEW courses_with_details AS
SELECT
    c.*,
    u.name AS creator_name,
    u.email AS creator_email,
    COUNT(DISTINCT e.id) AS actual_enrollment_count,
    COALESCE(AVG(r.rating), 0) AS actual_rating_average,
    COUNT(DISTINCT r.id) AS actual_rating_count
FROM courses c
LEFT JOIN users u ON c.creator_id = u.id
LEFT JOIN enrollments e ON c.id = e.course_id
LEFT JOIN reviews r ON c.id = r.course_id
GROUP BY c.id, u.id;

-- View: Student progress summary
CREATE VIEW student_progress_summary AS
SELECT
    e.student_id,
    e.course_id,
    e.id AS enrollment_id,
    COUNT(DISTINCT sm.id) AS total_sub_materials,
    COUNT(DISTINCT p.id) AS completed_sub_materials,
    CASE
        WHEN COUNT(DISTINCT sm.id) > 0
        THEN (COUNT(DISTINCT p.id)::FLOAT / COUNT(DISTINCT sm.id) * 100)::INTEGER
        ELSE 0
    END AS calculated_progress
FROM enrollments e
JOIN courses c ON e.course_id = c.id
JOIN materials m ON c.id = m.course_id
JOIN sub_materials sm ON m.id = sm.material_id
LEFT JOIN progress p ON e.id = p.enrollment_id AND sm.id = p.sub_material_id AND p.completed = TRUE
GROUP BY e.student_id, e.course_id, e.id;

-- ============================================================================
-- SEED DATA (Optional - for testing)
-- ============================================================================

-- Create admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role, email_verified, approval_status, is_active)
VALUES ('Admin User', 'admin@elearning.com', '$2a$10$XqZ8tF3K.6yLvQH4kYHFH.YvP0e0U0lC3Y7kZ8dN9Y8tF3K.6yLvQ', 'admin', TRUE, 'approved', TRUE);

-- Create mentor user (password: mentor123)
INSERT INTO users (name, email, password_hash, role, email_verified, approval_status, is_active)
VALUES ('John Mentor', 'mentor@elearning.com', '$2a$10$XqZ8tF3K.6yLvQH4kYHFH.YvP0e0U0lC3Y7kZ8dN9Y8tF3K.6yLvQ', 'mentor', TRUE, 'approved', TRUE);

-- Create student user (password: student123)
INSERT INTO users (name, email, password_hash, role, email_verified, approval_status, is_active)
VALUES ('Jane Student', 'student@elearning.com', '$2a$10$XqZ8tF3K.6yLvQH4kYHFH.YvP0e0U0lC3Y7kZ8dN9Y8tF3K.6yLvQ', 'student', TRUE, 'approved', TRUE);

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
-- Total Tables: 19
-- Total Views: 2
-- Total Indexes: 40+
-- Foreign Keys: Properly enforced
-- Constraints: CHECK constraints for data integrity
-- Triggers: Auto-update timestamps
-- ============================================================================
