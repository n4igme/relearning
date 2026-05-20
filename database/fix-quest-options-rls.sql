-- =====================================================
-- SECURITY FIX: Hide quiz answers from students
-- =====================================================
-- VULNERABILITY: quest_options.is_correct was readable by all users
-- via the "Quest options are viewable by everyone" RLS policy.
--
-- FIX: Move is_correct to a separate table (quest_correct_options)
-- that only instructors/admins can SELECT. Server actions that need
-- to score quizzes use the admin client to read correct answers.
--
-- Migration steps:
--   1. Create quest_correct_options table
--   2. Migrate data from quest_options.is_correct
--   3. Drop the is_correct column from quest_options
--   4. Replace the overly permissive SELECT policy
-- =====================================================

-- Step 1: Create the answers table (instructor-only access)
CREATE TABLE IF NOT EXISTS public.quest_correct_options (
  option_id UUID PRIMARY KEY REFERENCES public.quest_options(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.quest_correct_options ENABLE ROW LEVEL SECURITY;

-- Only instructors of the parent course can read correct answers
CREATE POLICY "Instructors can view correct options for own courses"
  ON public.quest_correct_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quest_options qo
      JOIN public.quest_questions qq ON qq.id = qo.question_id
      JOIN public.quests q ON q.id = qq.quest_id
      JOIN public.courses c ON c.id = q.course_id
      WHERE qo.id = option_id AND c.instructor_id = auth.uid()
    )
  );

-- Admins can view all
CREATE POLICY "Admins can view all correct options"
  ON public.quest_correct_options FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Instructors can manage correct options for their courses
CREATE POLICY "Instructors can manage correct options for own courses"
  ON public.quest_correct_options FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.quest_options qo
      JOIN public.quest_questions qq ON qq.id = qo.question_id
      JOIN public.quests q ON q.id = qq.quest_id
      JOIN public.courses c ON c.id = q.course_id
      WHERE qo.id = option_id AND c.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quest_options qo
      JOIN public.quest_questions qq ON qq.id = qo.question_id
      JOIN public.quests q ON q.id = qq.quest_id
      JOIN public.courses c ON c.id = q.course_id
      WHERE qo.id = option_id AND c.instructor_id = auth.uid()
    )
  );

-- Step 2: Migrate existing data
INSERT INTO public.quest_correct_options (option_id, is_correct)
SELECT id, COALESCE(is_correct, false)
FROM public.quest_options
ON CONFLICT (option_id) DO NOTHING;

-- Step 3: Drop is_correct from quest_options
ALTER TABLE public.quest_options DROP COLUMN IF EXISTS is_correct;

-- Step 4: Replace the overly permissive SELECT policy
DROP POLICY IF EXISTS "Quest options are viewable by everyone" ON public.quest_options;

CREATE POLICY "Quest options are viewable by authenticated users"
  ON public.quest_options FOR SELECT
  USING (auth.uid() IS NOT NULL);
