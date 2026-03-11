-- =====================================================
-- MIGRATION: Add Missing RLS Policies & Schema Fixes
-- =====================================================
-- This migration adds RLS policies that were missing from the
-- original schema, plus schema additions needed by the application.
-- Safe to re-run (uses IF NOT EXISTS / CREATE OR REPLACE where possible).

-- =====================================================
-- 1. SCHEMA ADDITIONS - courses table
-- =====================================================

-- Add learning_objectives and prerequisites columns to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS learning_objectives TEXT[];
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS prerequisites TEXT[];

-- =====================================================
-- 2. RLS POLICIES - materials (chapters)
-- =====================================================

-- Everyone can read materials
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'materials' AND policyname = 'Materials are viewable by everyone'
  ) THEN
    CREATE POLICY "Materials are viewable by everyone"
      ON public.materials FOR SELECT
      USING (true);
  END IF;
END $$;

-- Instructors can manage their own course materials
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'materials' AND policyname = 'Instructors can manage own course materials'
  ) THEN
    CREATE POLICY "Instructors can manage own course materials"
      ON public.materials FOR ALL
      USING (EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = course_id AND c.instructor_id = auth.uid()
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = course_id AND c.instructor_id = auth.uid()
      ));
  END IF;
END $$;

-- =====================================================
-- 3. RLS POLICIES - sub_materials (lessons)
-- =====================================================

-- Everyone can read sub_materials
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sub_materials' AND policyname = 'Sub-materials are viewable by everyone'
  ) THEN
    CREATE POLICY "Sub-materials are viewable by everyone"
      ON public.sub_materials FOR SELECT
      USING (true);
  END IF;
END $$;

-- Instructors can manage sub_materials for their own courses
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sub_materials' AND policyname = 'Instructors can manage own course sub-materials'
  ) THEN
    CREATE POLICY "Instructors can manage own course sub-materials"
      ON public.sub_materials FOR ALL
      USING (EXISTS (
        SELECT 1 FROM public.materials m
        JOIN public.courses c ON c.id = m.course_id
        WHERE m.id = material_id AND c.instructor_id = auth.uid()
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.materials m
        JOIN public.courses c ON c.id = m.course_id
        WHERE m.id = material_id AND c.instructor_id = auth.uid()
      ));
  END IF;
END $$;

-- =====================================================
-- 4. RLS POLICIES - quests
-- =====================================================

-- Everyone can read quests
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quests' AND policyname = 'Quests are viewable by everyone'
  ) THEN
    CREATE POLICY "Quests are viewable by everyone"
      ON public.quests FOR SELECT
      USING (true);
  END IF;
END $$;

-- Instructors can INSERT quests for their own courses
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quests' AND policyname = 'Instructors can create quests for own courses'
  ) THEN
    CREATE POLICY "Instructors can create quests for own courses"
      ON public.quests FOR INSERT
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = course_id AND c.instructor_id = auth.uid()
      ));
  END IF;
END $$;

-- Instructors can UPDATE their own course quests
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quests' AND policyname = 'Instructors can update own course quests'
  ) THEN
    CREATE POLICY "Instructors can update own course quests"
      ON public.quests FOR UPDATE
      USING (EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = course_id AND c.instructor_id = auth.uid()
      ));
  END IF;
END $$;

-- Instructors can DELETE their own course quests
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quests' AND policyname = 'Instructors can delete own course quests'
  ) THEN
    CREATE POLICY "Instructors can delete own course quests"
      ON public.quests FOR DELETE
      USING (EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = course_id AND c.instructor_id = auth.uid()
      ));
  END IF;
END $$;

-- =====================================================
-- 5. RLS POLICIES - quest_questions
-- =====================================================

-- Everyone can read quest_questions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quest_questions' AND policyname = 'Quest questions are viewable by everyone'
  ) THEN
    CREATE POLICY "Quest questions are viewable by everyone"
      ON public.quest_questions FOR SELECT
      USING (true);
  END IF;
END $$;

-- Instructors can INSERT quest_questions for their own courses
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quest_questions' AND policyname = 'Instructors can create quest questions for own courses'
  ) THEN
    CREATE POLICY "Instructors can create quest questions for own courses"
      ON public.quest_questions FOR INSERT
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.quests q
        JOIN public.courses c ON c.id = q.course_id
        WHERE q.id = quest_id AND c.instructor_id = auth.uid()
      ));
  END IF;
END $$;

-- Instructors can UPDATE quest_questions for their own courses
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quest_questions' AND policyname = 'Instructors can update quest questions for own courses'
  ) THEN
    CREATE POLICY "Instructors can update quest questions for own courses"
      ON public.quest_questions FOR UPDATE
      USING (EXISTS (
        SELECT 1 FROM public.quests q
        JOIN public.courses c ON c.id = q.course_id
        WHERE q.id = quest_id AND c.instructor_id = auth.uid()
      ));
  END IF;
END $$;

-- Instructors can DELETE quest_questions for their own courses
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quest_questions' AND policyname = 'Instructors can delete quest questions for own courses'
  ) THEN
    CREATE POLICY "Instructors can delete quest questions for own courses"
      ON public.quest_questions FOR DELETE
      USING (EXISTS (
        SELECT 1 FROM public.quests q
        JOIN public.courses c ON c.id = q.course_id
        WHERE q.id = quest_id AND c.instructor_id = auth.uid()
      ));
  END IF;
END $$;

-- =====================================================
-- 6. RLS POLICIES - quest_options
-- =====================================================

-- Everyone can read quest_options
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quest_options' AND policyname = 'Quest options are viewable by everyone'
  ) THEN
    CREATE POLICY "Quest options are viewable by everyone"
      ON public.quest_options FOR SELECT
      USING (true);
  END IF;
END $$;

-- Instructors can INSERT quest_options for their own courses
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quest_options' AND policyname = 'Instructors can create quest options for own courses'
  ) THEN
    CREATE POLICY "Instructors can create quest options for own courses"
      ON public.quest_options FOR INSERT
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.quest_questions qq
        JOIN public.quests q ON q.id = qq.quest_id
        JOIN public.courses c ON c.id = q.course_id
        WHERE qq.id = question_id AND c.instructor_id = auth.uid()
      ));
  END IF;
END $$;

-- Instructors can UPDATE quest_options for their own courses
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quest_options' AND policyname = 'Instructors can update quest options for own courses'
  ) THEN
    CREATE POLICY "Instructors can update quest options for own courses"
      ON public.quest_options FOR UPDATE
      USING (EXISTS (
        SELECT 1 FROM public.quest_questions qq
        JOIN public.quests q ON q.id = qq.quest_id
        JOIN public.courses c ON c.id = q.course_id
        WHERE qq.id = question_id AND c.instructor_id = auth.uid()
      ));
  END IF;
END $$;

-- Instructors can DELETE quest_options for their own courses
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quest_options' AND policyname = 'Instructors can delete quest options for own courses'
  ) THEN
    CREATE POLICY "Instructors can delete quest options for own courses"
      ON public.quest_options FOR DELETE
      USING (EXISTS (
        SELECT 1 FROM public.quest_questions qq
        JOIN public.quests q ON q.id = qq.quest_id
        JOIN public.courses c ON c.id = q.course_id
        WHERE qq.id = question_id AND c.instructor_id = auth.uid()
      ));
  END IF;
END $$;

-- =====================================================
-- 7. RLS POLICIES - quest_attempts (students)
-- =====================================================

-- Students can INSERT their own quest attempts
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quest_attempts' AND policyname = 'Students can create own quest attempts'
  ) THEN
    CREATE POLICY "Students can create own quest attempts"
      ON public.quest_attempts FOR INSERT
      WITH CHECK (student_id = auth.uid());
  END IF;
END $$;

-- Students can SELECT their own quest attempts
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quest_attempts' AND policyname = 'Students can view own quest attempts'
  ) THEN
    CREATE POLICY "Students can view own quest attempts"
      ON public.quest_attempts FOR SELECT
      USING (student_id = auth.uid());
  END IF;
END $$;

-- =====================================================
-- 8. RLS POLICIES - courses (admin management)
-- =====================================================

-- Admins can SELECT all courses (including unpublished)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'courses' AND policyname = 'Admins can view all courses'
  ) THEN
    CREATE POLICY "Admins can view all courses"
      ON public.courses FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      ));
  END IF;
END $$;

-- Admins can UPDATE any course (for approval/rejection)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'courses' AND policyname = 'Admins can update any course'
  ) THEN
    CREATE POLICY "Admins can update any course"
      ON public.courses FOR UPDATE
      USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      ));
  END IF;
END $$;

-- =====================================================
-- DONE
-- =====================================================
-- Run this migration in Supabase SQL Editor.
-- All policies use IF NOT EXISTS so it's safe to re-run.
