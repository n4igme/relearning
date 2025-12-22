# E-Learning Platform 2.0

A modern, full-stack e-learning platform built with Next.js 15, TypeScript, Supabase, and Cloudinary.

## Tech Stack

- **Frontend & Backend**: Next.js 15 (App Router) + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Cloudinary (videos, images, documents)
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (recommended)

## Features

### User Roles
- **Admin**: Manage users, approve courses, view analytics
- **Mentor**: Create courses, materials, quests/assessments
- **Student**: Enroll in courses, complete materials, earn certificates

### Core Functionality
- Role-based authentication and authorization
- Course management with video lessons (Cloudinary)
- Progress tracking system
- Quest/Assessment system
- Certificate generation
- Payment integration with Stripe
- Real-time enrollment and progress updates

## Project Structure

```
├── app/                    # Next.js App Router pages and layouts
│   ├── (auth)/            # Authentication routes (login, register)
│   ├── (dashboard)/       # Dashboard routes (admin, mentor, student)
│   ├── courses/           # Course-related pages
│   ├── api/               # API routes (Server Actions)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── ui/               # UI components (buttons, forms, etc.)
│   ├── course/           # Course-specific components
│   └── auth/             # Auth-related components
├── lib/                   # Utility functions and configs
│   ├── supabase/         # Supabase client configuration
│   │   ├── client.ts     # Browser client
│   │   └── server.ts     # Server client
│   ├── cloudinary/       # Cloudinary utilities
│   ├── stripe/           # Stripe configuration
│   └── utils/            # Helper functions
├── types/                 # TypeScript type definitions
│   └── database.types.ts # Supabase database types
└── public/               # Static assets

```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier available)
- Cloudinary account (you already have this configured)
- Stripe account (for payments)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key
   - Update `.env.local` with your credentials

3. **Update environment variables**:
   ```bash
   # Copy the example file
   cp .env.example .env.local

   # Edit .env.local and add your Supabase credentials:
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup

### Create Supabase Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- See database/schema.sql for the complete schema
-- You'll create tables for:
-- - users (with roles)
-- - courses
-- - materials (chapters/lessons)
-- - enrollments
-- - progress
-- - quests (assessments)
-- - certificates
-- - payments
```

## Current Status

✅ **Completed**:
- Project initialization with Next.js 15 + TypeScript
- Basic project structure
- Supabase client configuration
- Environment setup
- Cloudinary credentials configured
- Development server running

🚧 **Next Steps** (in order):
1. Set up Supabase project and create database schema
2. Install shadcn/ui components
3. Build authentication system (login, register)
4. Implement role-based access control
5. Create course management interface
6. Build video player with Cloudinary
7. Implement progress tracking
8. Add quest/assessment system
9. Integrate Stripe payments
10. Deploy to Vercel

## Development Commands

```bash
# Start development server with Turbopack (fast!)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linter
npm run lint
```

## Environment Variables

Create a `.env.local` file with the following:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary (Already configured)
CLOUDINARY_CLOUD_NAME=djdcuznhq
CLOUDINARY_API_KEY=336619795213399
CLOUDINARY_API_SECRET=ylxBXTyDUVC6HY0Lv9CCNy6ZQ40
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=djdcuznhq

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Backup

Your old project has been saved to git commit `9c30604` and branch `backup/old-project-YYYYMMDD`.

To restore the old project if needed:
```bash
git checkout backup/old-project-YYYYMMDD
```

## Contributing

This is a personal project. Development is tracked via the todo list system.

## License

ISC License

---

**Built with**:Next.js 15 | TypeScript | Supabase | Cloudinary | Stripe | Tailwind CSS
