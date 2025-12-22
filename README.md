# E-Learning Platform

A modern, full-stack e-learning platform built with Next.js 15, TypeScript, Supabase, and Cloudinary.

## Tech Stack

- **Frontend & Backend**: Next.js 15 (App Router) + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password + Google OAuth)
- **File Storage**: Cloudinary (videos, images, documents)
- **Payments**: Stripe
- **UI Components**: shadcn/ui + Tailwind CSS
- **Deployment**: Vercel

## Features

### User Roles
- **Admin**: Manage users, approve courses, view analytics
- **Mentor**: Create courses, materials, quests/assessments
- **Student**: Enroll in courses, complete materials, earn certificates

### Core Functionality
- Role-based authentication and authorization
- Google OAuth (SSO) sign-in
- User approval workflow
- Course management with video lessons (Cloudinary)
- Progress tracking system
- Quest/Assessment system with auto-grading
- Automatic certificate generation
- Payment integration with Stripe
- Real-time enrollment and progress updates
- Course reviews and ratings

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── auth/              # OAuth callback handlers
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── dashboard/         # User dashboard
│   ├── admin/             # Admin pages
│   │   └── users/         # User management
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and configs
│   ├── supabase/         # Supabase client (server & client)
│   ├── actions/          # Server Actions
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript type definitions
├── database/             # Database schema and scripts
│   ├── supabase-schema.sql      # Database schema
│   └── create-admin.sql         # Admin user script
└── public/               # Static assets
```

## Quick Start

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier)
- Cloudinary account (optional, for video uploads)
- Stripe account (optional, for payments)

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Copy environment file**:
   ```bash
   cp .env.example .env.local
   ```

3. **Set up Supabase** (see [Supabase Setup](#supabase-setup))

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open browser**: Navigate to http://localhost:3000

---

## Supabase Setup

### Step 1: Create Supabase Project (5 minutes)

1. Go to **https://supabase.com** and sign up
2. Click **"New Project"**
3. Fill in:
   - **Name**: `elearning-platform`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your location
   - **Plan**: Free
4. Click **"Create new project"** and wait 1-2 minutes

### Step 2: Run Database Schema (5 minutes)

1. In Supabase dashboard, click **"SQL Editor"** → **"New query"**
2. Open `database/supabase-schema.sql` in your code editor
3. Copy ALL contents and paste into SQL Editor
4. Click **"Run"** (or Ctrl+Enter)
5. Wait ~10-15 seconds

**Expected Result**:
```
Success. No rows returned
NOTICE: E-Learning Platform database schema created successfully!
NOTICE: Tables created: 13
```

**Verify**: Click **"Table Editor"** - you should see 13 tables (profiles, courses, materials, etc.)

### Step 3: Get API Credentials (2 minutes)

1. Click **"Project Settings"** (gear icon) → **"API"**
2. Copy these values:

   **Project URL**:
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **Anon/Public Key** (long JWT token):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 4: Update Environment Variables (1 minute)

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5: Restart Dev Server
```bash
# Stop server (Ctrl+C), then restart:
npm run dev
```

### Step 6: Create First Admin User

1. Register a new account at http://localhost:3000/register
2. In Supabase SQL Editor, run:
   ```sql
   UPDATE public.profiles
   SET role = 'admin', is_approved = true
   WHERE email = 'your@email.com';
   ```
3. Refresh the page - you now have admin access!

---

## Google OAuth Setup (Students Only)

Enable Google Sign-In for students. **Note:** Mentors and admins must use email/password authentication.

### Step 1: Create Google Cloud Project (10 minutes)

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Click **"New Project"** → Name: `elearning-platform`
3. Go to **"APIs & Services"** → **"OAuth consent screen"**
4. Choose **"External"** → Click **"Create"**
5. Fill in:
   - **App name**: `E-Learning Platform`
   - **User support email**: Your email
   - **Developer contact**: Your email
6. Click **"Save and Continue"** through all steps

### Step 2: Configure Scopes

1. Click **"Add or Remove Scopes"**
2. Select:
   - `userinfo.email`
   - `userinfo.profile`
3. Click **"Update"** → **"Save and Continue"**

### Step 3: Add Test Users (Important!)

Since the app is in testing mode:
1. Click **"Add Users"**
2. Add your email address(es)
3. Click **"Add"** → **"Save and Continue"**

### Step 4: Create OAuth Client ID

1. Go to **"Credentials"** → **"Create Credentials"** → **"OAuth client ID"**
2. Choose **"Web application"**
3. Fill in:
   - **Name**: `E-Learning Platform Web`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
   - **Authorized redirect URIs**:
     - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

     ⚠️ Replace `YOUR_PROJECT_REF` with your Supabase project reference (from your Supabase URL)

4. Click **"Create"**
5. **Save** the Client ID and Client Secret!

### Step 5: Enable Google in Supabase (5 minutes)

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Google** and toggle it **ON**
3. Paste:
   - **Client ID (for OAuth)**: Your Google Client ID
   - **Client Secret (for OAuth)**: Your Google Client Secret
4. Click **"Save"**

### Step 6: Test Google Sign-In

1. Go to http://localhost:3000/login
2. Click **"Continue with Google"**
3. Sign in with your Google account (must be in test users list!)
4. You'll be redirected to the dashboard

**Important Notes**:
- Google OAuth is **only for students**
- Mentors and admins cannot use Google sign-in
- New Google users will have `Pending Approval` status until an admin approves them
- If a mentor/admin tries to use Google, they'll see an error and be signed out

---

## Cloudinary Setup (Optional)

For video hosting and course thumbnails.

### Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com/
2. Sign up for free (25GB storage, 25GB bandwidth/month)
3. Go to Dashboard and note:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 2: Update Environment Variables

Edit `.env.local`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 3: Restart Dev Server
```bash
npm run dev
```

**Cloudinary is ready!** You can now upload course videos and thumbnails.

---

## Database Structure

### Core Tables

**profiles** - User profiles (extends Supabase Auth)
- Stores role (admin, mentor, student)
- Approval status and account activation
- Auto-created via database trigger on signup

**courses** - Course information
- Created by mentors/admins
- Approval workflow
- Tracks enrollment count and ratings

**materials** - Course chapters/sections
- Belongs to a course
- Contains sub-materials (lessons)

**sub_materials** - Individual lessons/videos
- Video URLs from Cloudinary
- Document uploads
- Preview capability

**enrollments** - Student course enrollments
- Links students to courses
- Tracks overall progress
- Records last access

**progress** - Granular progress tracking
- Completion of each sub-material
- Video playback position
- Time spent

**quests** - Assessments/Quizzes
- Created by instructors
- Questions with options
- Passing score requirement

**quest_attempts** - Student quiz attempts
- Records scores and answers
- Tracks pass/fail status

**certificates** - Auto-generated certificates
- Issued on course completion
- Unique certificate number
- Verification URL

**payments** - Stripe payment records
- Tracks payment status
- Stripe integration IDs

**reviews** - Course reviews/ratings
- 1-5 star rating
- Written feedback

---

## Development Commands

```bash
# Start dev server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## Environment Variables

Complete `.env.local` template:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (Optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Security Features

### Row Level Security (RLS)
All tables have RLS policies:
- **Public**: Can view published courses
- **Students**: Can view/update own enrollments, progress, certificates
- **Mentors**: Can create/edit own courses
- **Admins**: Full access to all data

### Auto-Generated Profiles
When users sign up, a profile is automatically created via database trigger.

### Google OAuth
- Secure OAuth 2.0 flow
- Email verified automatically by Google
- No password to remember

---

## Free Tier Limits

**Supabase Free**:
- Database: 500MB storage
- Bandwidth: 2GB/month
- Auth: 50,000 MAU

**Cloudinary Free**:
- Storage: 25GB
- Bandwidth: 25GB/month
- Videos: 500/month

**Vercel Free**:
- 100GB bandwidth/month
- Unlimited deployments

---

## Troubleshooting

### Database Issues

**Error: "relation already exists"**
- You're running the schema twice. Create a new Supabase project or drop all tables first.

**Tables not showing up**
- Refresh the page
- Check SQL Editor for errors
- Verify you clicked "Run"

### Authentication Issues

**Can't login after Google sign-up**
- Account needs admin approval
- Admin must approve in `/admin/users`

**Error: "403: access_denied" (Google)**
- Your email is not in test users list
- Add it in Google Cloud Console → OAuth consent screen → Test users

**Error: "Invalid client ID" (Google)**
- Double-check Client ID matches in Supabase and Google Console

### Connection Issues

**Can't connect from app**
- Check URL and anon key are correct in `.env.local`
- No extra spaces in environment variables
- Restart dev server after changing `.env.local`

---

## Deployment

### Option 1: Docker (Local/Production)

**Build and run with Docker:**

```bash
# Production build
docker-compose up --build -d

# Development build (with hot reload)
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

Your app will be available at: **http://localhost:3000**

**Docker Features:**
- ✅ Production-optimized build with multi-stage Dockerfile
- ✅ Standalone Next.js output for faster cold starts
- ✅ Development mode with hot reload
- ✅ Minimal image size using Alpine Linux

### Option 2: Deploy to Vercel (Recommended for Cloud)

1. Push your code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables (same as `.env`)
5. Deploy!

**Update Google OAuth** after deployment:
- Add production URL to Authorized JavaScript origins
- Example: `https://your-app.vercel.app`

### Option 3: Deploy to Netlify

1. Push your code to GitHub
2. Go to https://netlify.com
3. Import your repository
4. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Add environment variables
6. Deploy!

---

## Project Status

✅ **Completed**:
- Next.js 15 + TypeScript setup
- Supabase integration (PostgreSQL)
- Email/Password authentication
- Google OAuth SSO (students only)
- Role-based access control (Admin, Mentor, Student)
- User management dashboard with approval workflow
- Protected routes & middleware
- Database schema with RLS policies
- Docker containerization (production & development)
- Netlify/Vercel deployment ready

🚧 **In Progress**:
- Course creation interface
- Video upload with Cloudinary
- Progress tracking
- Assessment system
- Certificate generation
- Stripe payment integration

---

## Support & Resources

- **Supabase**: https://supabase.com/docs
- **Next.js**: https://nextjs.org/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Cloudinary**: https://cloudinary.com/documentation
- **Stripe**: https://stripe.com/docs

---

## License

ISC License

---

**Built with**: Next.js 15 | TypeScript | Supabase | Cloudinary | Stripe | Tailwind CSS
