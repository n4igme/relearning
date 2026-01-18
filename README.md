# CyberSec Academy

Master ethical hacking, penetration testing, and security operations through hands-on cybersecurity training. A modern e-learning platform with gamification, built with Next.js 15, TypeScript, and Supabase.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Supabase account (free tier)
- Docker (optional, for local staging)

### Get Started in 3 Steps

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Start development server
npm run dev
```

**📖 Full Setup Guide:** See [QUICK-START.md](./QUICK-START.md) for detailed instructions.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[QUICK-START.md](./QUICK-START.md)** | Quick reference for getting started |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Comprehensive deployment guide (local, staging, production) |
| **[GAMIFICATION_GUIDE.md](./GAMIFICATION_GUIDE.md)** | Gamification system integration guide |
| **[STRIPE-SETUP.md](./STRIPE-SETUP.md)** | Payment integration setup |
| **[MANUAL-PAYMENT-SETUP.md](./MANUAL-PAYMENT-SETUP.md)** | Manual payment approval workflow |

---

## ✨ Features

### 🎓 Learning Management System
- **Multi-role System** - Admin, Mentor (Instructor), Student
- **Course Management** - Create courses with videos, documents, and assessments
- **Progress Tracking** - Granular tracking per lesson with video position
- **Quizzes & Assessments** - Auto-graded quizzes with multiple question types
- **Certificates** - Auto-generated on course completion with verification
- **Video Hosting** - Cloudinary integration for video content

### 💳 Payment Systems
- **Stripe Integration** - Automated payment processing with webhooks
- **Manual Payment** - Bank transfer with admin approval workflow
- **Enrollment Requests** - Upload payment proof, admin reviews and approves

### 🎮 Gamification System
- **Points & Rewards** - Earn 100-275 points per quiz, 200-800 per course
- **25+ Skills** - Cybersecurity skills (Web Security, Network Security, Cryptography, etc.)
- **15 Badges** - Bronze to Platinum tier achievements
- **Leaderboard** - Global rankings based on points and achievements
- **Learning Streaks** - Daily activity tracking (7, 30, 100-day milestones)
- **Skill Progression** - Beginner → Intermediate → Advanced → Expert

### 🔐 Authentication & Security
- **Email/Password** - Supabase Auth with email verification
- **Google OAuth SSO** - One-click sign-in for students
- **Role-Based Access** - Protected routes with middleware
- **Row Level Security (RLS)** - Database-level security policies
- **User Approval** - Admin approval workflow for mentors

### 📊 Analytics & Management
- **User Management** - Admin dashboard for approving users
- **Enrollment Tracking** - Monitor student progress and completions
- **Course Analytics** - Reviews, ratings, and enrollment counts
- **Security Tools Database** - 35+ cybersecurity tools with descriptions

---

## 🏗️ Tech Stack

### Frontend & Backend
- **Framework:** Next.js 15 (App Router) + TypeScript
- **UI Components:** shadcn/ui + Tailwind CSS
- **State Management:** React 19 with Server Components

### Database & Auth
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Email/Password + Google OAuth)
- **ORM:** Direct SQL with Supabase Client

### File Storage & Payments
- **Video/Images:** Cloudinary (25GB free)
- **Payments:** Stripe (with webhook integration)

### Deployment
- **Production:** Netlify / Vercel
- **Staging:** Docker (local PostgreSQL + app)
- **Development:** Next.js Dev Server with Turbopack

---

## 📁 Project Structure

```
relearning/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── admin/                    # Admin dashboard
│   │   ├── users/                # User management
│   │   └── enrollment-requests/  # Manual payment approval
│   ├── courses/                  # Course pages
│   │   └── [courseId]/
│   │       ├── learn/            # Learning interface
│   │       └── enroll/           # Enrollment & payment
│   ├── mentor/                   # Mentor (instructor) dashboard
│   ├── dashboard/                # User dashboard
│   ├── gamification/             # Gamification UI
│   ├── leaderboard/              # Global rankings
│   ├── skills/                   # Skills tracking
│   ├── certificates/             # Student certificates
│   └── api/                      # API routes
│       ├── checkout/             # Stripe checkout
│       └── webhooks/stripe/      # Payment webhooks
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── admin/                    # Admin components
│   └── ...                       # Feature components
├── lib/                          # Core utilities
│   ├── supabase/                 # Supabase client (server & client)
│   ├── actions/                  # Server Actions
│   │   ├── auth.ts               # Authentication
│   │   ├── courses.ts            # Course operations
│   │   ├── quests.ts             # Quiz/assessment logic
│   │   ├── gamification.ts       # Points & badges
│   │   └── payments.ts           # Payment processing
│   └── utils.ts                  # Helper functions
├── database/                     # Database scripts
│   ├── supabase-schema.sql       # Full Supabase schema
│   ├── local-schema.sql          # Local PostgreSQL schema
│   ├── seed-skills.sql           # Seed 25 cybersecurity skills
│   ├── seed-badges.sql           # Seed 15 badges
│   └── seed-tools.sql            # Seed 35 security tools
├── types/                        # TypeScript definitions
├── public/                       # Static assets
└── .env files                    # Environment configurations
```

---

## 🗄️ Database Schema

### Core Tables (13)
- `profiles` - User accounts and roles
- `courses` - Course information
- `materials` - Course sections/chapters
- `sub_materials` - Individual lessons
- `enrollments` - Student enrollments
- `progress` - Lesson completion tracking
- `quests` - Quizzes/assessments
- `quest_questions` - Quiz questions
- `quest_options` - Multiple choice options
- `quest_attempts` - Student quiz attempts
- `certificates` - Course certificates
- `payments` - Payment records
- `reviews` - Course ratings

### Gamification Tables (7)
- `skills` - 25+ cybersecurity skills
- `student_skills` - Skill proficiency tracking
- `badges` - 15 achievement badges
- `student_badges` - Earned badges
- `leaderboard_stats` - Global rankings
- `point_history` - Points transaction log
- `course_skills` - Course-skill mappings

### Additional Tables
- `security_tools` - Cybersecurity tools database
- `enrollment_requests` - Manual payment requests

**Total:** 20+ tables with Row Level Security policies

---

## 🚢 Deployment

### Local Development
```bash
npm run dev
```
Access: http://localhost:3000

### Staging (Docker with Local Database)
```bash
npm run docker:staging:up:build
```
Includes: PostgreSQL + App + pgAdmin (optional)

### Production (Netlify)
```bash
git push origin main
```
Auto-deploys on push to main branch

**📖 Full Deployment Guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📝 Available Scripts

### Development
```bash
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production
npm run start            # Run production build
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
```

### Docker - Staging
```bash
npm run docker:staging:up             # Start staging environment
npm run docker:staging:up:build       # Rebuild and start
npm run docker:staging:up:pgadmin     # Start with pgAdmin UI
npm run docker:staging:down           # Stop all services
npm run docker:staging:logs           # View logs
npm run docker:staging:restart        # Restart app
```

### Docker - Production
```bash
npm run docker:prod:up               # Start production-like env
npm run docker:prod:up:build         # Rebuild and start
npm run docker:prod:down             # Stop
npm run docker:prod:logs             # View logs
```

---

## 🔧 Environment Setup

### Environment Files

| File | Purpose | Committed? |
|------|---------|------------|
| `.env.local` | Local development | ❌ No |
| `.env.docker` | Docker staging | ❌ No |
| `.env.local.example` | Local template | ✅ Yes |
| `.env.staging.example` | Staging template | ✅ Yes |
| `.env.production.example` | Production template | ✅ Yes |

### Required Environment Variables

```env
# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudinary (Video & Image Hosting)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Stripe (Payment Processing - Optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_or_live_key
STRIPE_SECRET_KEY=sk_test_or_live_key
STRIPE_WEBHOOK_SECRET=whsec_webhook_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎯 Key Features Breakdown

### User Roles

| Role | Capabilities |
|------|--------------|
| **Admin** | Full access: user management, course approval, analytics |
| **Mentor** | Create courses, materials, quizzes; view student progress |
| **Student** | Enroll in courses, complete lessons, earn certificates |

### Course Structure
```
Course
├── Materials (Chapters)
│   └── Sub-Materials (Lessons)
│       ├── Videos (Cloudinary)
│       ├── Documents
│       └── Preview (free)
├── Quizzes
│   ├── Questions
│   └── Auto-grading
└── Certificate (auto-issued)
```

### Gamification Flow
```
Complete Quiz → Earn Points → Level Up Skills → Unlock Badges → Climb Leaderboard
```

---

## 🔒 Security Features

- **Row Level Security (RLS)** - All tables protected at database level
- **Protected Routes** - Middleware-based route protection
- **Email Verification** - Required for email/password auth
- **Admin Approval** - Mentor accounts require admin approval
- **Webhook Verification** - Stripe webhook signature validation
- **Input Sanitization** - Server-side validation on all inputs

---

## 📊 Free Tier Limits

| Service | Free Tier |
|---------|-----------|
| **Supabase** | 500MB DB, 2GB bandwidth/month, 50K users |
| **Cloudinary** | 25GB storage, 25GB bandwidth/month |
| **Netlify** | 100GB bandwidth/month, unlimited deployments |
| **Stripe** | No monthly fee, pay per transaction |

---

## 🐛 Troubleshooting

### Common Issues

**Build Fails with Missing UI Components**
```bash
# Install missing Radix UI dependencies
npm install @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-alert-dialog
```

**Docker: Port Already in Use**
```bash
# Change port in .env.docker
APP_PORT=3001
```

**Supabase: Can't Connect**
- Verify credentials in `.env.local`
- Check for trailing spaces in environment variables
- Restart dev server after changing `.env`

**More troubleshooting:** See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting)

---

## 🗺️ Roadmap

### ✅ Completed
- [x] Core authentication (email/password + Google OAuth)
- [x] Role-based access control
- [x] Course management system
- [x] Video lessons with Cloudinary
- [x] Quiz/assessment system
- [x] Progress tracking
- [x] Certificate generation
- [x] Gamification (points, badges, skills, leaderboard)
- [x] Stripe payment integration
- [x] Manual payment approval workflow
- [x] Docker deployment
- [x] Comprehensive documentation

### 🚧 In Progress
- [ ] Advanced analytics dashboard
- [ ] Mentor earnings/payouts
- [ ] Course marketplace
- [ ] Live class integration
- [ ] Discussion forums
- [ ] Mobile app (React Native)

### 💡 Planned
- [ ] AI-powered course recommendations
- [ ] Peer-to-peer learning features
- [ ] Certificate blockchain verification
- [ ] Multi-language support
- [ ] Dark mode

---

## 🤝 Contributing

This is a portfolio/learning project, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

ISC License - See [LICENSE](./LICENSE) file for details

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Supabase** - Backend as a Service
- **shadcn/ui** - Beautiful component library
- **Vercel** - Hosting and deployment
- **Cloudinary** - Media management

---

## 📧 Support

For questions or issues:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
2. Review [QUICK-START.md](./QUICK-START.md)
3. Create an issue on GitHub

---

**Built with ❤️ using Next.js 15 | TypeScript | Supabase | Cloudinary | Stripe | Tailwind CSS**

**Version:** 2.0.0 | **Last Updated:** December 2025
