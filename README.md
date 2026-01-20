# CyberSec Academy

A modern cybersecurity e-learning platform with gamification. Master ethical hacking, penetration testing, and security operations through hands-on training.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Start development server
npm run dev
```

**Access:** http://localhost:3000

---

## Documentation

| Guide | Description |
|-------|-------------|
| [QUICK-START.md](./QUICK-START.md) | Prerequisites & setup options |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Local, Docker & production deployment |
| [GAMIFICATION_GUIDE.md](./GAMIFICATION_GUIDE.md) | Points, badges & leaderboard system |
| [STRIPE-SETUP.md](./STRIPE-SETUP.md) | Payment integration |
| [MANUAL-PAYMENT-SETUP.md](./MANUAL-PAYMENT-SETUP.md) | Bank transfer workflow |

**Additional docs:** See `docs/` folder for testing guides, content creation, and course templates.

---

## Features

### Learning Management
- **Multi-role System** - Admin, Mentor, Student with approval workflows
- **Course Builder** - Chapters, lessons, video hosting (Cloudinary)
- **Assessments** - Auto-graded quizzes with multiple question types
- **Progress Tracking** - Per-lesson completion with video position
- **Certificates** - Auto-generated on course completion

### Gamification
- **Points** - Earn 100-275 per quiz, 200-800 per course
- **25 Skills** - Web Security, Network Security, Cryptography, Forensics, etc.
- **15 Badges** - Bronze to Platinum tier achievements
- **Leaderboard** - Global rankings with streak tracking
- **Progression** - Beginner → Intermediate → Advanced → Expert

### Payments
- **Stripe** - Automated checkout with webhooks
- **Manual** - Bank transfer with admin approval

### Security
- **Authentication** - Email/password + Google OAuth (Supabase Auth)
- **Row Level Security** - Database-level access control
- **Protected Routes** - Middleware-based authorization

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) + TypeScript |
| UI | shadcn/ui + Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Media | Cloudinary |
| Payments | Stripe |
| Deploy | Netlify / Docker |

---

## Project Structure

```
app/
├── (auth)/           # Login, register
├── admin/            # User management, enrollment requests
├── mentor/           # Course creation
├── courses/          # Browse, learn, enroll
├── dashboard/        # Student dashboard
├── leaderboard/      # Rankings
├── skills/           # Skill tracking
└── api/              # Checkout, webhooks

lib/actions/          # Server actions (auth, courses, payments, gamification)
database/             # SQL schemas and seed files
```

---

## Terminology

| Term | Description | Database |
|------|-------------|----------|
| Course | Complete learning unit | `courses` |
| Chapter | Section within a course | `materials` |
| Lesson | Individual content piece | `sub_materials` |
| Quiz | Auto-graded assessment | `quests` |
| Mentor | Course creator | `profiles` (role='mentor') |
| Skill | Tracked competency | `skills`, `student_skills` |
| Badge | Achievement milestone | `badges`, `student_badges` |

---

## Scripts

```bash
# Development
npm run dev                    # Start with Turbopack
npm run build                  # Production build
npm run lint                   # ESLint check

# Docker Staging
npm run docker:staging:up:build    # Start with PostgreSQL
npm run docker:staging:down        # Stop services

# Docker Production
npm run docker:prod:up:build       # Production-like environment
```

---

## Environment Variables

```env
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Required - Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud

# Optional - Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See `.env.local.example` for the complete template.

---

## Database

**20+ tables** with Row Level Security:

- **Core:** profiles, courses, materials, sub_materials, enrollments, progress, quests, certificates, payments
- **Gamification:** skills, student_skills, badges, student_badges, leaderboard_stats, point_history

**Seed scripts:** `database/seed-skills.sql`, `seed-badges.sql`, `seed-tools.sql`

---

## Free Tier Limits

| Service | Limit |
|---------|-------|
| Supabase | 500MB DB, 50K users |
| Cloudinary | 25GB storage |
| Netlify | 100GB bandwidth |

---

## License

ISC License - See [LICENSE](./LICENSE)

---

**Version:** 2.0.1 | **Updated:** January 2026

**Built with Next.js 15 | TypeScript | Supabase | Tailwind CSS**
