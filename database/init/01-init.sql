-- =====================================================
-- DATABASE INITIALIZATION SCRIPT
-- =====================================================
-- This script runs automatically when PostgreSQL container starts
-- for the first time. It sets up the database structure.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create application user (if different from postgres)
-- Note: This is optional, the default postgres user can be used

-- Set timezone
SET timezone = 'UTC';

-- Create database if it doesn't exist (handled by POSTGRES_DB env var)
-- The database is automatically created, this just ensures proper settings

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database initialized successfully!';
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'User: %', current_user();
    RAISE NOTICE 'Timestamp: %', now();
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run schema creation: docker exec -i elearning-postgres psql -U postgres -d elearning < database/supabase-schema.sql';
    RAISE NOTICE '2. Run seed scripts as needed';
    RAISE NOTICE '3. Access pgAdmin at http://localhost:5050';
    RAISE NOTICE '========================================';
END $$;
