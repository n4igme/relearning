# Quick Start Guide

Get CyberSec Academy running in minutes.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#-local-development-fastest)
3. [Staging (Docker)](#-staging-docker-with-database)
4. [Production (Netlify)](#-production-netlify)
5. [Common Commands](#-common-commands)
6. [Troubleshooting](#-troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js 20+** - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **Supabase account** (free tier) - [Sign up](https://supabase.com/)
- **Cloudinary account** (optional, for video hosting) - [Sign up](https://cloudinary.com/)
- **Docker Desktop** (only for staging) - [Download](https://www.docker.com/products/docker-desktop)

---

Choose your deployment method:

---

## 🚀 Local Development (Fastest)

**Start development server with hot reload:**

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local with your credentials
npm run dev
```

**Access:** http://localhost:3000

---

## 🐳 Staging (Docker with Database)

> **Note:** The npm scripts below are convenient wrappers around `docker-compose` commands. For full docker-compose reference and advanced options, see [DEPLOYMENT.md](./DEPLOYMENT.md#staging-docker).

**Start full environment (PostgreSQL + App):**

```bash
cp .env.staging.example .env.docker
# Edit .env.docker with your credentials
npm run docker:staging:up:build
```

**With pgAdmin database UI:**

```bash
npm run docker:staging:up:pgadmin
```

**Access:**
- App: http://localhost:3000
- pgAdmin: http://localhost:5050 (admin@admin.com / admin)
- PostgreSQL: localhost:5432

**Stop:**

```bash
npm run docker:staging:down
```

---

## 🌐 Production (Netlify)

**Deploy via Git:**

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Netlify automatically builds and deploys!

**Configure:**
1. Set environment variables in Netlify Dashboard
2. Use values from `.env.production.example`
3. Update `NEXT_PUBLIC_APP_URL` to your Netlify domain

---

## 📝 Common Commands

### Development
```bash
npm run dev              # Start dev server
npm run build            # Build production
npm run start            # Run production build locally
npm run lint             # Lint code
npm run type-check       # Check TypeScript
```

### Docker - Staging
```bash
npm run docker:staging:up             # Start
npm run docker:staging:up:build       # Rebuild and start
npm run docker:staging:up:pgadmin     # Start with pgAdmin
npm run docker:staging:down           # Stop
npm run docker:staging:logs           # View logs
npm run docker:staging:restart        # Restart app
```

### Docker - Production-like
```bash
npm run docker:prod:up               # Start
npm run docker:prod:up:build         # Rebuild and start
npm run docker:prod:down             # Stop
npm run docker:prod:logs             # View logs
```

---

## 🔧 Environment Files

| File | Purpose | Committed? |
|------|---------|------------|
| `.env.local` | Local development | ❌ No |
| `.env.docker` | Docker staging | ❌ No |
| `.env.local.example` | Local template | ✅ Yes |
| `.env.staging.example` | Staging template | ✅ Yes |
| `.env.production.example` | Production template | ✅ Yes |

---

## 🆘 Troubleshooting

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :3000

# Change port in environment file or stop conflicting service
```

**Docker not starting:**
```bash
# Check Docker is running
docker ps

# Rebuild from scratch
npm run docker:staging:down
docker system prune -a
npm run docker:staging:up:build
```

**pgAdmin login fails:**
```bash
docker-compose -f docker-compose.staging.yml down
docker volume rm relearning_pgadmin_data
npm run docker:staging:up:pgadmin
```

---

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide.
