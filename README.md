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

### Local Development with Self-hosted Supabase

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Start local Supabase (Auth, PostgREST, PostgreSQL, Studio)
supabase init
supabase start

# Apply schema
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres < database/supabase-schema.sql
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres < database/add-missing-rls-policies.sql
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres < database/seed-skills.sql
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres < database/seed-badges.sql
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres < database/seed-tools.sql

# Create default admin (email: admin@cybersec.local / password: Admin123!)
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres < database/create-admin.sql

# Use the keys from `supabase status` in your .env.local
npm run dev
```

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
- **Multi-role System** — Admin, Mentor, Student with approval workflows
- **Course Builder** — Chapters, lessons, video hosting (Cloudinary)
- **Assessments** — Auto-graded quizzes with multiple question types
- **Progress Tracking** — Per-lesson completion with minimum time validation
- **Certificates** — Auto-generated on course completion

### Gamification
- **Points** — Earn 100-275 per quiz, 200-800 per course
- **25 Skills** — Web Security, Network Security, Cryptography, Forensics, etc.
- **15 Badges** — Bronze to Platinum tier achievements
- **Leaderboard** — Global rankings with streak tracking
- **Progression** — Beginner → Intermediate → Advanced → Expert

### Payments
- **Stripe** — Automated checkout with webhooks
- **Manual** — Bank transfer with admin approval

### Security
- **Authentication** — Email/password + Google OAuth (Supabase Auth)
- **Row Level Security** — Database-level access control
- **Role-based Authorization** — Middleware + server action level enforcement
- **Field Allowlists** — Prevents mass assignment on sensitive operations
- **Security Headers** — X-Frame-Options, X-Content-Type-Options, Referrer-Policy

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
| Testing | Vitest + Playwright |
| Deploy | Netlify / Docker |

---

## Project Structure

```
app/
├── login/              # Login page
├── register/           # Registration page
├── admin/              # User management, enrollment requests, course approval
├── mentor/             # Course creation & editing
├── courses/            # Browse, enroll, learn
├── dashboard/          # Student dashboard
├── leaderboard/        # Rankings
├── skills/             # Skill tracking
├── gamification/       # Points, badges overview
├── certificates/       # Student certificates
├── quests/             # Quiz attempts
├── tools/              # Security tools catalog
├── payment/            # Payment success page
└── api/                # Checkout, webhooks, check-user

lib/actions/            # Server actions (auth, courses, payments, gamification, quests, skills, tools)
lib/supabase/           # Supabase client (server, client, admin)
database/               # SQL schemas, migrations, and seed files
components/             # React components (UI, forms, interfaces)
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

# Testing
npm run test                   # Run unit tests (Vitest)
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report
npm run test:e2e               # End-to-end tests (Playwright)

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

# Optional - Cloudinary (for video/media hosting)
CLOUDINARY_CLOUD_NAME=your_cloud
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud

# Optional - Stripe (for payment processing)
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
- **Requests:** enrollment_requests

**Schema files:**
- `database/supabase-schema.sql` — Main schema with RLS policies
- `database/add-missing-rls-policies.sql` — Additional RLS policies for full coverage
- `database/local-schema.sql` — Simplified schema for local PostgreSQL (without Supabase auth)

**Seed scripts:** `database/seed-skills.sql`, `seed-badges.sql`, `seed-tools.sql`

---

## Deployment Options

| Environment | Setup | Database |
|-------------|-------|----------|
| Local dev | `npm run dev` | Supabase Cloud or self-hosted |
| Docker staging | `npm run docker:staging:up:build` | Supabase Cloud or self-hosted |
| Production | Netlify / Docker | Supabase Cloud |

For self-hosted Supabase, use the Supabase CLI (`supabase start`) which provides Auth, PostgREST, and PostgreSQL locally.

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

**Version:** 2.0.0 | **Updated:** May 2026

**Built with Next.js 15 | TypeScript | Supabase | Tailwind CSS**
