-- Migration: Update approval logic - students approved after email confirmation
-- Run this in Supabase SQL Editor

-- Step 1: Update the trigger function
-- Students start unapproved and are approved after email confirmation
-- Mentors start unapproved and need admin approval
-- Admins are auto-approved
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
        -- Auto-approve only admins, students/mentors start as unapproved
        -- Students will be approved after email confirmation (handled in auth callback)
        -- Mentors need admin approval
        CASE WHEN user_role = 'admin' THEN true ELSE false END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Ensure admins are approved
UPDATE public.profiles
SET is_approved = true
WHERE role = 'admin';

-- Step 3: Reset unapproved students who haven't confirmed email
-- This is optional - only run if you want to reset approval status
-- UPDATE public.profiles
-- SET is_approved = false
-- WHERE role = 'student';

-- Step 4: Verify the changes
SELECT
    role,
    is_approved,
    COUNT(*) as count
FROM public.profiles
GROUP BY role, is_approved
ORDER BY role, is_approved;
