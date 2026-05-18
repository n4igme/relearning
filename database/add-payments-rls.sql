-- =====================================================
-- MIGRATION: Add RLS Policies to Payments Table
-- =====================================================
-- The payments table had RLS enabled but zero policies,
-- meaning all operations were denied for non-service-role clients.
-- This adds proper policies for students and admins.
--
-- Usage:
--   docker exec -i supabase_db_relearning psql -U postgres -d postgres < database/add-payments-rls.sql
-- =====================================================

-- Students can view their own payments
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Students can view own payments'
  ) THEN
    CREATE POLICY "Students can view own payments"
      ON public.payments FOR SELECT
      USING (student_id = auth.uid());
  END IF;
END $$;

-- Students can insert their own payment records (for checkout flow)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Students can create own payments'
  ) THEN
    CREATE POLICY "Students can create own payments"
      ON public.payments FOR INSERT
      WITH CHECK (student_id = auth.uid());
  END IF;
END $$;

-- Admins can view all payments
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Admins can view all payments'
  ) THEN
    CREATE POLICY "Admins can view all payments"
      ON public.payments FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      ));
  END IF;
END $$;

-- Admins can update payment status (for manual approval)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Admins can update payments'
  ) THEN
    CREATE POLICY "Admins can update payments"
      ON public.payments FOR UPDATE
      USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      ));
  END IF;
END $$;

-- Instructors can view payments for their courses
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Instructors can view payments for own courses'
  ) THEN
    CREATE POLICY "Instructors can view payments for own courses"
      ON public.payments FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.courses
        WHERE courses.id = course_id AND courses.instructor_id = auth.uid()
      ));
  END IF;
END $$;
