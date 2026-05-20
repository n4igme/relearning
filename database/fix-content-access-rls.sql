-- =====================================================
-- SECURITY FIX: Restrict course content to enrolled students
-- =====================================================
-- VULNERABILITY: materials and sub_materials had SELECT USING(true),
-- allowing any authenticated user to read all paid course content
-- without enrollment or payment.
--
-- FIX: Replace with policies that allow access only to:
--   1. Students enrolled in the course
--   2. The course instructor
--   3. Admins
--   4. Preview content (sub_materials.is_preview = true)
-- =====================================================

-- Fix materials (chapters)
DROP POLICY IF EXISTS "Materials are viewable by everyone" ON public.materials;

CREATE POLICY "Materials viewable by enrolled students and instructors"
  ON public.materials FOR SELECT
  USING (
    -- Course instructor
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.instructor_id = auth.uid()
    )
    -- Enrolled student
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = course_id AND e.student_id = auth.uid()
    )
    -- Admin
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Fix sub_materials (lessons)
DROP POLICY IF EXISTS "Sub-materials are viewable by everyone" ON public.sub_materials;

-- Preview content is public (for course marketing)
CREATE POLICY "Preview sub-materials viewable by all authenticated"
  ON public.sub_materials FOR SELECT
  USING (
    is_preview = true AND auth.uid() IS NOT NULL
  );

-- Full content requires enrollment
CREATE POLICY "Sub-materials viewable by enrolled students and instructors"
  ON public.sub_materials FOR SELECT
  USING (
    -- Course instructor (via material -> course)
    EXISTS (
      SELECT 1 FROM public.materials m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = material_id AND c.instructor_id = auth.uid()
    )
    -- Enrolled student (via material -> course -> enrollment)
    OR EXISTS (
      SELECT 1 FROM public.materials m
      JOIN public.enrollments e ON e.course_id = m.course_id
      WHERE m.id = material_id AND e.student_id = auth.uid()
    )
    -- Admin
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
