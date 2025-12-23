-- E-Learning Platform Database Schema for Supabase
-- PostgreSQL with Row Level Security (RLS)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS & PROFILES
-- =====================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'mentor', 'student')),
    avatar_url TEXT,
    bio TEXT,
    is_approved BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- =====================================================
-- COURSES
-- =====================================================

CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    thumbnail_url TEXT,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    price DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    is_published BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    enrollment_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX idx_courses_category ON public.courses(category);
CREATE INDEX idx_courses_published ON public.courses(is_published);
CREATE INDEX idx_courses_slug ON public.courses(slug);

-- =====================================================
-- COURSE MATERIALS (Chapters/Sections)
-- =====================================================

CREATE TABLE public.materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_materials_course ON public.materials(course_id);
CREATE INDEX idx_materials_order ON public.materials(course_id, order_index);

-- =====================================================
-- SUB-MATERIALS (Lessons/Videos)
-- =====================================================

CREATE TABLE public.sub_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    video_url TEXT,
    video_duration INTEGER, -- in seconds
    cloudinary_public_id TEXT,
    document_url TEXT,
    cloudinary_file_id TEXT,
    order_index INTEGER NOT NULL,
    is_preview BOOLEAN DEFAULT false, -- Allow preview without enrollment
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sub_materials_material ON public.sub_materials(material_id);
CREATE INDEX idx_sub_materials_order ON public.sub_materials(material_id, order_index);

-- =====================================================
-- ENROLLMENTS
-- =====================================================

CREATE TABLE public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    UNIQUE(student_id, course_id)
);

CREATE INDEX idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);

-- =====================================================
-- PROGRESS TRACKING
-- =====================================================

CREATE TABLE public.progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
    sub_material_id UUID REFERENCES public.sub_materials(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    time_spent INTEGER DEFAULT 0, -- in seconds
    last_position INTEGER DEFAULT 0, -- for video playback position
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(enrollment_id, sub_material_id)
);

CREATE INDEX idx_progress_enrollment ON public.progress(enrollment_id);
CREATE INDEX idx_progress_sub_material ON public.progress(sub_material_id);

-- =====================================================
-- QUESTS (Assessments/Quizzes)
-- =====================================================

CREATE TABLE public.quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    passing_score DECIMAL(5,2) DEFAULT 70,
    time_limit INTEGER, -- in minutes
    max_attempts INTEGER,
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quests_course ON public.quests(course_id);

-- =====================================================
-- QUEST QUESTIONS
-- =====================================================

CREATE TABLE public.quest_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quest_questions_quest ON public.quest_questions(quest_id);

-- =====================================================
-- QUEST QUESTION OPTIONS
-- =====================================================

CREATE TABLE public.quest_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES public.quest_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quest_options_question ON public.quest_options(question_id);

-- =====================================================
-- QUEST ATTEMPTS
-- =====================================================

CREATE TABLE public.quest_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    score DECIMAL(5,2),
    passed BOOLEAN DEFAULT false,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    time_taken INTEGER, -- in seconds
    answers JSONB -- Store all answers as JSON
);

CREATE INDEX idx_quest_attempts_quest ON public.quest_attempts(quest_id);
CREATE INDEX idx_quest_attempts_student ON public.quest_attempts(student_id);

-- =====================================================
-- CERTIFICATES
-- =====================================================

CREATE TABLE public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    score DECIMAL(5,2),
    verification_url TEXT,
    UNIQUE(student_id, course_id)
);

CREATE INDEX idx_certificates_student ON public.certificates(student_id);
CREATE INDEX idx_certificates_course ON public.certificates(course_id);
CREATE INDEX idx_certificates_number ON public.certificates(certificate_number);

-- =====================================================
-- PAYMENTS
-- =====================================================

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_student ON public.payments(student_id);
CREATE INDEX idx_payments_course ON public.payments(course_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- =====================================================
-- REVIEWS
-- =====================================================

CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, student_id)
);

CREATE INDEX idx_reviews_course ON public.reviews(course_id);
CREATE INDEX idx_reviews_student ON public.reviews(student_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
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

CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON public.quests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Profiles: Users can read all profiles, insert and update their own
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Courses: Public can view published courses
CREATE POLICY "Published courses are viewable by everyone"
    ON public.courses FOR SELECT
    USING (is_published = true OR instructor_id = auth.uid());

CREATE POLICY "Instructors can create courses"
    ON public.courses FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM public.profiles
            WHERE role IN ('mentor', 'admin')
        )
    );

CREATE POLICY "Instructors can update own courses"
    ON public.courses FOR UPDATE
    USING (instructor_id = auth.uid());

-- Enrollments: Students can view their own enrollments
CREATE POLICY "Students can view own enrollments"
    ON public.enrollments FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Students can enroll in courses"
    ON public.enrollments FOR INSERT
    WITH CHECK (student_id = auth.uid());

-- Progress: Students can view and update their own progress
CREATE POLICY "Students can view own progress"
    ON public.progress FOR SELECT
    USING (
        enrollment_id IN (
            SELECT id FROM public.enrollments WHERE student_id = auth.uid()
        )
    );

CREATE POLICY "Students can update own progress"
    ON public.progress FOR INSERT
    WITH CHECK (
        enrollment_id IN (
            SELECT id FROM public.enrollments WHERE student_id = auth.uid()
        )
    );

-- Certificates: Public can verify certificates, students can view their own
CREATE POLICY "Certificates are viewable by owner and public for verification"
    ON public.certificates FOR SELECT
    USING (student_id = auth.uid() OR true);

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- You can add seed data here if needed

-- =====================================================
-- CYBERSECURITY PLATFORM EXTENSIONS
-- =====================================================

-- Skills table (cybersecurity competencies)
CREATE TABLE public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('web', 'network', 'cryptography', 'social_engineering', 'reverse_engineering', 'forensics')),
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_skills_category ON public.skills(category);

-- Student skills tracking
CREATE TABLE public.student_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency_level TEXT NOT NULL DEFAULT 'beginner' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    points_earned INTEGER DEFAULT 0,
    last_assessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, skill_id)
);

CREATE INDEX idx_student_skills_student ON public.student_skills(student_id);
CREATE INDEX idx_student_skills_skill ON public.student_skills(skill_id);
CREATE INDEX idx_student_skills_proficiency ON public.student_skills(proficiency_level);

-- Badges/Achievements
CREATE TABLE public.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    badge_tier TEXT NOT NULL CHECK (badge_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    requirement_type TEXT NOT NULL CHECK (requirement_type IN ('quest_score', 'course_completion', 'skill_mastery', 'consecutive_days', 'total_points')),
    requirement_criteria JSONB NOT NULL, -- Flexible criteria (e.g., {"min_score": 95, "quest_count": 10})
    points_reward INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_badges_tier ON public.badges(badge_tier);
CREATE INDEX idx_badges_type ON public.badges(requirement_type);

-- Student badge achievements
CREATE TABLE public.student_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    evidence JSONB, -- Evidence data (quest_id, score, etc.)
    UNIQUE(student_id, badge_id)
);

CREATE INDEX idx_student_badges_student ON public.student_badges(student_id);
CREATE INDEX idx_student_badges_badge ON public.student_badges(badge_id);
CREATE INDEX idx_student_badges_earned ON public.student_badges(earned_at DESC);

-- Leaderboard statistics (denormalized for performance)
CREATE TABLE public.leaderboard_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    badges_earned INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    quests_completed INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    rank INTEGER, -- Cached rank, updated periodically
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_points ON public.leaderboard_stats(total_points DESC);
CREATE INDEX idx_leaderboard_rank ON public.leaderboard_stats(rank);
CREATE INDEX idx_leaderboard_student ON public.leaderboard_stats(student_id);

-- Security Tools Catalog
CREATE TABLE public.security_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('scanner', 'exploitation', 'reconnaissance', 'forensics', 'cryptography', 'wireless')),
    description TEXT,
    documentation_url TEXT,
    icon_url TEXT,
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    related_course_ids UUID[], -- Array of course IDs
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_tools_category ON public.security_tools(category);
CREATE INDEX idx_security_tools_difficulty ON public.security_tools(difficulty_level);

-- Course-Skills junction table (many-to-many)
CREATE TABLE public.course_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency_level_taught TEXT NOT NULL CHECK (proficiency_level_taught IN ('beginner', 'intermediate', 'advanced', 'expert')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, skill_id)
);

CREATE INDEX idx_course_skills_course ON public.course_skills(course_id);
CREATE INDEX idx_course_skills_skill ON public.course_skills(skill_id);

-- =====================================================
-- RLS POLICIES FOR CYBERSECURITY TABLES
-- =====================================================

-- Skills (public read, admin write)
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skills are viewable by everyone"
    ON public.skills FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage skills"
    ON public.skills FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Student Skills (students view own, admins view all)
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own skills"
    ON public.student_skills FOR SELECT
    USING (student_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'mentor')
    ));

CREATE POLICY "Students can update own skills"
    ON public.student_skills FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "System can update student skills"
    ON public.student_skills FOR UPDATE
    USING (student_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Badges (public read, admin write)
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by everyone"
    ON public.badges FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage badges"
    ON public.badges FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Student Badges (students view own, admins view all)
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own badges"
    ON public.student_badges FOR SELECT
    USING (student_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'mentor')
    ));

CREATE POLICY "System can award badges"
    ON public.student_badges FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Leaderboard Stats (public read)
ALTER TABLE public.leaderboard_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboard is viewable by authenticated users"
    ON public.leaderboard_stats FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "System can update leaderboard"
    ON public.leaderboard_stats FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Security Tools (public read, admin write)
ALTER TABLE public.security_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Security tools are viewable by everyone"
    ON public.security_tools FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage tools"
    ON public.security_tools FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Course Skills (public read, instructors/admins write)
ALTER TABLE public.course_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Course skills are viewable by everyone"
    ON public.course_skills FOR SELECT
    USING (true);

CREATE POLICY "Instructors can manage own course skills"
    ON public.course_skills FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.courses c
        JOIN public.profiles p ON c.instructor_id = p.id
        WHERE c.id = course_id AND p.id = auth.uid() AND p.role IN ('mentor', 'admin')
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.courses c
        JOIN public.profiles p ON c.instructor_id = p.id
        WHERE c.id = course_id AND p.id = auth.uid() AND p.role IN ('mentor', 'admin')
    ));

-- =====================================================
-- COMPLETED
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Cybersecurity E-Learning Platform database schema created successfully!';
    RAISE NOTICE 'Tables created: 20 (13 base + 7 cybersecurity extensions)';
    RAISE NOTICE 'Indexes created: 40+';
    RAISE NOTICE 'RLS policies: Enabled on all tables';
    RAISE NOTICE 'New features: Skills tracking, Badges, Leaderboard, Security tools';
END $$;
