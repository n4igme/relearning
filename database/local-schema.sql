-- ===============================================
-- Local PostgreSQL Schema (Simplified)
-- ===============================================
-- This is a simplified version without Supabase auth
-- For local development/testing with Docker PostgreSQL
-- ===============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (if any)
DROP TABLE IF EXISTS public.enrollment_requests CASCADE;
DROP TABLE IF EXISTS public.point_history CASCADE;
DROP TABLE IF EXISTS public.leaderboard_stats CASCADE;
DROP TABLE IF EXISTS public.student_badges CASCADE;
DROP TABLE IF EXISTS public.course_skills CASCADE;
DROP TABLE IF EXISTS public.student_skills CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.certificates CASCADE;
DROP TABLE IF EXISTS public.quest_attempts CASCADE;
DROP TABLE IF EXISTS public.quest_options CASCADE;
DROP TABLE IF EXISTS public.quest_questions CASCADE;
DROP TABLE IF EXISTS public.quests CASCADE;
DROP TABLE IF EXISTS public.progress CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.sub_materials CASCADE;
DROP TABLE IF EXISTS public.materials CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ===============================================
-- Core Tables
-- ===============================================

-- Profiles (Users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'mentor', 'student')),
    is_approved BOOLEAN DEFAULT false,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    thumbnail_url TEXT,
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    category TEXT,
    price NUMERIC(10, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    is_published BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials (Course Sections/Chapters)
CREATE TABLE public.materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sub Materials (Lessons/Videos)
CREATE TABLE public.sub_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT CHECK (content_type IN ('video', 'document', 'text')),
    content_url TEXT,
    duration_minutes INTEGER,
    is_preview BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments
CREATE TABLE public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress_percentage NUMERIC(5, 2) DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(student_id, course_id)
);

-- Progress Tracking
CREATE TABLE public.progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sub_material_id UUID REFERENCES public.sub_materials(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    time_spent_seconds INTEGER DEFAULT 0,
    last_position_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, sub_material_id)
);

-- Quests (Quizzes/Assessments)
CREATE TABLE public.quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 70,
    max_attempts INTEGER,
    time_limit_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quest Questions
CREATE TABLE public.quest_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
    points INTEGER DEFAULT 10,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quest Options (for multiple choice)
CREATE TABLE public.quest_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES public.quest_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0
);

-- Quest Attempts
CREATE TABLE public.quest_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE,
    score NUMERIC(5, 2),
    passed BOOLEAN DEFAULT false,
    answers JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Certificates
CREATE TABLE public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verification_url TEXT,
    score NUMERIC(5, 2),
    UNIQUE(student_id, course_id)
);

-- Payments
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- ===============================================
-- Gamification Tables
-- ===============================================

-- Student Skills
CREATE TABLE public.student_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency_level TEXT DEFAULT 'beginner' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    score INTEGER DEFAULT 0,
    last_practiced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, skill_id)
);

-- Course Skills (Link courses to skills)
CREATE TABLE public.course_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, skill_id)
);

-- Student Badges
CREATE TABLE public.student_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, badge_id)
);

-- Leaderboard Stats
CREATE TABLE public.leaderboard_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    total_points INTEGER DEFAULT 0,
    badges_earned INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    quests_completed INTEGER DEFAULT 0,
    average_score NUMERIC(5, 2) DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    rank INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Point History
CREATE TABLE public.point_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollment Requests (Manual Payment)
CREATE TABLE public.enrollment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_phone TEXT,
    payment_proof_url TEXT,
    transaction_reference TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- Indexes for Performance
-- ===============================================

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX idx_courses_published ON public.courses(is_published);
CREATE INDEX idx_materials_course ON public.materials(course_id);
CREATE INDEX idx_sub_materials_material ON public.sub_materials(material_id);
CREATE INDEX idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX idx_progress_student ON public.progress(student_id);
CREATE INDEX idx_quest_attempts_student ON public.quest_attempts(student_id);
CREATE INDEX idx_leaderboard_points ON public.leaderboard_stats(total_points DESC);

-- ===============================================
-- Auto-update timestamps
-- ===============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sub_materials_updated_at BEFORE UPDATE ON public.sub_materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON public.progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_skills_updated_at BEFORE UPDATE ON public.student_skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Local PostgreSQL schema created successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables: 20+';
    RAISE NOTICE 'Ready for local development';
    RAISE NOTICE '========================================';
END $$;
