-- Migration: Auto-approve students and admins, mentors need approval
-- This updates the handle_new_user function to automatically approve students

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

-- Update any existing students to be approved
UPDATE public.profiles
SET is_approved = true
WHERE role = 'student' AND is_approved = false;

-- Ensure existing admins are approved
UPDATE public.profiles
SET is_approved = true
WHERE role = 'admin' AND is_approved = false;
