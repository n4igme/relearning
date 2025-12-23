-- Migration: Apply student auto-approval logic
-- Run this in Supabase SQL Editor to fix the trigger and approve existing students

-- Step 1: Update the trigger function to auto-approve students
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
BEGIN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');

    INSERT INTO public.profiles (id, email, full_name, role, is_approved)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        user_role,
        -- Auto-approve students and admins, mentors need approval
        CASE WHEN user_role IN ('student', 'admin') THEN true ELSE false END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Update ALL existing students to be approved
UPDATE public.profiles
SET is_approved = true
WHERE role = 'student';

-- Step 3: Ensure admins are also approved
UPDATE public.profiles
SET is_approved = true
WHERE role = 'admin';

-- Step 4: Verify the changes
SELECT
    role,
    is_approved,
    COUNT(*) as count
FROM public.profiles
GROUP BY role, is_approved
ORDER BY role, is_approved;
