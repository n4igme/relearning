-- Migration: Auto-approve mentors and admins, only students need approval
-- This updates the handle_new_user function to automatically approve non-student roles

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
        -- Auto-approve mentors and admins, students need approval
        CASE WHEN user_role IN ('mentor', 'admin') THEN true ELSE false END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also update any existing mentors/admins to be approved
UPDATE public.profiles
SET is_approved = true
WHERE role IN ('mentor', 'admin') AND is_approved = false;
