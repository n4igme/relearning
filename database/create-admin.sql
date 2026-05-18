-- =====================================================
-- CREATE DEFAULT ADMIN USER
-- =====================================================
-- For local development with self-hosted Supabase.
-- Run AFTER supabase-schema.sql has been applied.
--
-- Usage:
--   docker exec -i supabase_db_relearning psql -U postgres -d postgres < database/create-admin.sql
--
-- Default credentials:
--   Email:    admin@cybersec.local
--   Password: Admin123!
-- =====================================================

-- Step 1: Create auth user with proper password hash
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  role,
  aud,
  confirmation_token,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@cybersec.local',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin User","role":"admin"}',
  'authenticated',
  'authenticated',
  '',
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

-- Step 2: Create identity record (required for login)
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  id,
  id,
  json_build_object('sub', id::text, 'email', email, 'email_verified', true),
  'email',
  id::text,
  now(),
  now(),
  now()
FROM auth.users
WHERE email = 'admin@cybersec.local'
ON CONFLICT DO NOTHING;

-- Step 3: Create admin profile
INSERT INTO public.profiles (id, email, full_name, role, is_approved, is_active)
SELECT id, 'admin@cybersec.local', 'Admin User', 'admin', true, true
FROM auth.users
WHERE email = 'admin@cybersec.local'
ON CONFLICT (id) DO UPDATE SET role = 'admin', is_approved = true, is_active = true;

-- Verify
SELECT id, email, full_name, role, is_approved FROM public.profiles WHERE email = 'admin@cybersec.local';

-- =====================================================
-- NOTE: If login fails with "Invalid email or password",
-- use the Supabase Auth API instead (password hashing differs by version):
--
--   curl -X POST http://127.0.0.1:54321/auth/v1/signup \
--     -H "apikey: <your-anon-key>" \
--     -H "Content-Type: application/json" \
--     -d '{"email":"admin@cybersec.local","password":"Admin123!","data":{"full_name":"Admin User","role":"admin"}}'
--
--   Then run:
--   UPDATE public.profiles SET role='admin', is_approved=true WHERE email='admin@cybersec.local';
-- =====================================================
