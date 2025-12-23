-- Migration: Add INSERT policy for profiles table
-- This allows users to create their own profile during signup/SSO

-- Add INSERT policy for profiles
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- This policy allows:
-- 1. The database trigger to create profiles when new users sign up
-- 2. Manual profile creation in the auth callback for SSO users
-- 3. Users can only insert a profile with their own user ID (auth.uid() = id)
