-- Script to create default admin user
-- Run this in Supabase SQL Editor

-- First, create the auth user via Supabase Dashboard or this script
-- Note: You'll need to set a password when creating via Dashboard

-- After creating the auth user, update the profile to admin role
-- Replace 'admin@example.com' with your actual admin email

-- Update existing user to admin (if they already registered)
UPDATE public.profiles
SET
  role = 'admin',
  is_approved = true,
  full_name = 'Admin User'
WHERE email = 'admin@example.com'; -- Change this to your email

-- Or if you want to approve your current mentor account as admin:
UPDATE public.profiles
SET
  role = 'admin',
  is_approved = true
WHERE email = 'cikumel@gmail.com';

-- Verify the update
SELECT id, email, full_name, role, is_approved, is_active
FROM public.profiles
WHERE role = 'admin';
