# Supabase Setup Guide

Complete guide to set up your Supabase database for the E-Learning Platform.

## Step 1: Create Supabase Account (2 minutes)

1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email
4. You'll be redirected to your dashboard

## Step 2: Create New Project (3 minutes)

1. Click **"New Project"** button
2. Fill in the details:
   - **Name**: `elearning-platform` (or your choice)
   - **Database Password**: Create a strong password
     - **IMPORTANT**: Save this password! You'll need it for direct database access
     - Example: `MySecurePass123!@#`
   - **Region**: Choose closest to your location
     - US East (Ohio) - `us-east-1`
     - Europe (Frankfurt) - `eu-central-1`
     - Asia Pacific (Singapore) - `ap-southeast-1`
   - **Pricing Plan**: Free (perfect for development)
3. Click **"Create new project"**
4. Wait 1-2 minutes for setup to complete

## Step 3: Run Database Schema (5 minutes)

Once your project is ready:

1. In Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `database/supabase-schema.sql` in your code editor
4. **Copy ALL the contents** (Ctrl+A, Ctrl+C)
5. **Paste** into the Supabase SQL Editor
6. Click **"Run"** button (or press Ctrl+Enter)
7. Wait ~10-15 seconds for execution

### Expected Result:
```
Success. No rows returned
NOTICE: E-Learning Platform database schema created successfully!
NOTICE: Tables created: 13
NOTICE: Indexes created: 25+
NOTICE: RLS policies: Enabled
```

### Verify Tables Were Created:

1. Click **"Table Editor"** in left sidebar
2. You should see **13 tables**:
   - `profiles`
   - `courses`
   - `materials`
   - `sub_materials`
   - `enrollments`
   - `progress`
   - `quests`
   - `quest_questions`
   - `quest_options`
   - `quest_attempts`
   - `certificates`
   - `payments`
   - `reviews`

## Step 4: Get Your API Credentials (2 minutes)

1. Click **"Project Settings"** (gear icon in left sidebar)
2. Click **"API"** in the settings menu
3. You'll see two important values:

### Project URL
```
https://xxxxxxxxxxxxx.supabase.co
```
Copy this - you'll need it for `NEXT_PUBLIC_SUPABASE_URL`

### Anon/Public Key (anon key)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```
Copy this long key - you'll need it for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Note**: The `anon` key is safe to use in your frontend - it respects Row Level Security (RLS) policies.

## Step 5: Update Environment Variables (1 minute)

1. Open `.env.local` in your project root
2. Replace the placeholder values:

```env
# Before:
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_supabase_anon_key

# After (use your actual values):
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Save the file

## Step 6: Restart Your Development Server

If your Next.js dev server is running, restart it to load the new environment variables:

```bash
# Stop the server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

## Step 7: Test the Connection

Let's verify everything is working. I'll create a test page for you.

## Database Structure Overview

### Core Tables:

**`profiles`** - User profiles (extends Supabase Auth)
- Stores user role (admin, mentor, student)
- Approval status and account activation
- Links to auth.users automatically

**`courses`** - Course information
- Created by mentors/admins
- Has approval workflow
- Tracks enrollment count and ratings

**`materials`** - Course chapters/sections
- Belongs to a course
- Contains sub-materials (lessons)

**`sub_materials`** - Individual lessons/videos
- Video URLs from Cloudinary
- Document uploads
- Preview capability

**`enrollments`** - Student course enrollments
- Links students to courses
- Tracks overall progress percentage
- Records last access time

**`progress`** - Granular progress tracking
- Tracks completion of each sub-material
- Stores video playback position
- Records time spent

**`quests`** - Assessments/Quizzes
- Created by instructors
- Has questions and time limits
- Passing score requirement

**`quest_attempts`** - Student quiz attempts
- Records scores and answers
- Tracks if student passed
- Limits attempts if configured

**`certificates`** - Generated certificates
- Issued on course completion
- Unique certificate number
- Verification URL for employers

**`payments`** - Stripe payment records
- Tracks payment status
- Stripe integration IDs
- Refund capability

**`reviews`** - Course reviews/ratings
- 1-5 star rating
- Written feedback
- Updates course average rating

## Security Features

### Row Level Security (RLS)
All tables have RLS enabled with policies:

- **Public**: Can view published courses
- **Students**: Can view/update own enrollments, progress, certificates
- **Mentors**: Can create/edit own courses
- **Admins**: Full access (configured separately)

### Auto-Generated Profiles
When a user signs up via Supabase Auth, a profile is automatically created in the `profiles` table via database trigger.

## Free Tier Limits

Supabase Free Tier includes:
- **Database**: 500MB storage
- **Bandwidth**: 2GB/month
- **File Storage**: 1GB
- **API Requests**: Unlimited
- **Authentication**: 50,000 monthly active users

Perfect for development and small production apps!

## Troubleshooting

### Error: "relation already exists"
If you see this error, it means you're running the schema twice. Either:
- Drop all tables first in SQL Editor
- Or create a new project

### Error: "permission denied"
Make sure you're logged into Supabase and running the SQL in your own project.

### Tables not showing up
1. Refresh the page
2. Check SQL Editor for any error messages
3. Verify you clicked "Run"

### Can't connect from app
1. Double-check URL and anon key are correct
2. Make sure there are no extra spaces in .env.local
3. Restart your dev server after changing .env.local

## Next Steps

After completing this setup:

1. ✅ Supabase project created
2. ✅ Database schema deployed (13 tables)
3. ✅ RLS policies enabled
4. ✅ Environment variables configured
5. ✅ Dev server restarted

**You're ready to build!**

Next up: Creating authentication pages (login, register, etc.)

## Useful Supabase Links

- **Dashboard**: https://supabase.com/dashboard
- **Documentation**: https://supabase.com/docs
- **SQL Editor**: https://supabase.com/dashboard/project/_/sql
- **Table Editor**: https://supabase.com/dashboard/project/_/editor
- **API Docs**: https://supabase.com/dashboard/project/_/api
