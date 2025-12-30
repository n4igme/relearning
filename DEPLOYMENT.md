# Deployment Guide

This guide covers deploying the E-Learning Platform in different environments.

---

## Table of Contents

1. [Environment Overview](#environment-overview)
2. [Local Development](#local-development)
3. [Staging (Docker)](#staging-docker)
4. [Production (Netlify)](#production-netlify)
5. [Environment Variables](#environment-variables)
6. [Troubleshooting](#troubleshooting)

---

## Environment Overview

| Environment | Purpose | Database | Hosting | Config File |
|------------|---------|----------|---------|-------------|
| **Local Development** | Daily development | Supabase Cloud | localhost:3000 | `.env.local` |
| **Staging (Docker)** | Testing with local DB | PostgreSQL (Docker) | localhost:3000 | `.env.docker` |
| **Production** | Live website | Supabase Cloud | Netlify | Netlify Dashboard |

---

## Local Development

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Application: http://localhost:3000

### Features
- Hot reload
- Fast refresh
- Uses cloud Supabase database
- Ideal for day-to-day development

---

## Staging (Docker)

### Purpose
Test the application in a production-like environment with a local PostgreSQL database before deploying to production.

### Prerequisites
- Docker Desktop installed and running
- Docker Compose installed

### Setup

1. **Configure environment:**
   ```bash
   cp .env.staging.example .env.docker
   # Edit .env.docker with your values
   ```

2. **Build and start services:**
   ```bash
   docker-compose -f docker-compose.staging.yml up --build -d
   ```

3. **Start with pgAdmin (optional):**
   ```bash
   docker-compose -f docker-compose.staging.yml --profile tools up -d
   ```

### Access Points
- **Application:** http://localhost:3000
- **PostgreSQL:** localhost:5432
- **pgAdmin:** http://localhost:5050 (if started with --profile tools)

### pgAdmin Configuration
- **Login:** admin@admin.com / admin
- **Connect to Database:**
  - Host: `postgres` (from within Docker) or `localhost` (from host machine)
  - Port: `5432`
  - Database: `elearning`
  - Username: `postgres`
  - Password: `postgres`

### Useful Commands

```bash
# View logs
docker-compose -f docker-compose.staging.yml logs -f

# View specific service logs
docker logs elearning-app -f
docker logs elearning-postgres -f
docker logs elearning-pgadmin -f

# Stop services
docker-compose -f docker-compose.staging.yml down

# Stop and remove all data (including database)
docker-compose -f docker-compose.staging.yml down -v

# Restart specific service
docker-compose -f docker-compose.staging.yml restart app

# Rebuild after code changes
docker-compose -f docker-compose.staging.yml up --build -d
```

### Database Management

**Backup database:**
```bash
docker exec elearning-postgres pg_dump -U postgres elearning > backup.sql
```

**Restore database:**
```bash
docker exec -i elearning-postgres psql -U postgres elearning < backup.sql
```

**Access PostgreSQL CLI:**
```bash
docker exec -it elearning-postgres psql -U postgres -d elearning
```

---

## Production (Netlify)

### Prerequisites
- GitHub repository connected to Netlify
- Netlify account with site configured

### Deployment Steps

#### 1. Configure Environment Variables in Netlify

Go to **Site Settings > Environment Variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key

CLOUDINARY_CLOUD_NAME=your_production_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_production_cloudinary_api_key
CLOUDINARY_API_SECRET=your_production_cloudinary_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_production_cloudinary_cloud_name

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret

NEXT_PUBLIC_APP_URL=https://your-app.netlify.app

NODE_ENV=production
```

#### 2. Deploy to Netlify

**Option A: Automatic Deployment (Recommended)**
```bash
# Push to main branch
git add .
git commit -m "Your commit message"
git push origin main
```

Netlify will automatically:
1. Detect the push
2. Run `npm run build`
3. Deploy the `.next` directory
4. Make it live

**Option B: Manual Deployment via CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

#### 3. Configure Webhooks

For Stripe webhooks to work in production:

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-app.netlify.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy the webhook secret and update `STRIPE_WEBHOOK_SECRET` in Netlify

### Monitoring Production

**View deployment logs:**
- Netlify Dashboard > Deploys > [Select deployment] > Deploy log

**View runtime logs:**
- Netlify Dashboard > Functions (for API routes)

### Rollback

If something goes wrong:

1. Go to Netlify Dashboard > Deploys
2. Find a working deployment
3. Click "Publish deploy" to rollback

---

## Environment Variables

### Quick Reference

| Variable | Local Dev | Staging | Production |
|----------|-----------|---------|------------|
| `NEXT_PUBLIC_APP_URL` | http://localhost:3000 | http://localhost:3000 | https://your-app.netlify.app |
| Database | Supabase Cloud | PostgreSQL (Docker) | Supabase Cloud |
| Stripe Keys | Test keys | Test keys | Live keys |
| Config File | `.env.local` | `.env.docker` | Netlify Dashboard |

### Environment Files (Do NOT commit to Git)

```
.env.local          # Local development (not committed)
.env.docker         # Staging/Docker (not committed)
```

### Example Files (Safe to commit)

```
.env.local.example      # Template for local development
.env.staging.example    # Template for staging
.env.production.example # Template for production
```

### .gitignore Configuration

Ensure these are in your `.gitignore`:

```
.env
.env.local
.env.docker
.env.*.local
```

---

## Troubleshooting

### Staging (Docker)

**Problem: Cannot connect to database**
```bash
# Check if PostgreSQL is healthy
docker ps

# View PostgreSQL logs
docker logs elearning-postgres

# Restart PostgreSQL
docker-compose -f docker-compose.staging.yml restart postgres
```

**Problem: App not building**
```bash
# Remove old containers and rebuild
docker-compose -f docker-compose.staging.yml down
docker-compose -f docker-compose.staging.yml up --build -d
```

**Problem: Port already in use**
```bash
# Check what's using the port
netstat -ano | findstr :3000

# Change port in .env.docker
APP_PORT=3001

# Or stop the conflicting service
```

**Problem: pgAdmin login fails**
```bash
# Reset pgAdmin
docker-compose -f docker-compose.staging.yml down
docker volume rm relearning_pgadmin_data
docker-compose -f docker-compose.staging.yml --profile tools up -d
```

### Production (Netlify)

**Problem: Build fails on Netlify**
1. Check build logs in Netlify Dashboard
2. Ensure all environment variables are set
3. Check for missing dependencies in `package.json`
4. Test build locally: `npm run build`

**Problem: Environment variables not working**
1. Verify variables are set in Netlify Dashboard
2. Variables starting with `NEXT_PUBLIC_` are available client-side
3. Redeploy after changing environment variables

**Problem: API routes returning 500**
1. Check function logs in Netlify Dashboard
2. Verify Supabase connection
3. Check Stripe configuration

**Problem: Database connection errors**
1. Verify Supabase credentials
2. Check Supabase project is not paused
3. Verify Row Level Security (RLS) policies

---

## Deployment Checklist

### Before Deploying to Production

- [ ] Test thoroughly in staging environment
- [ ] Update environment variables in Netlify
- [ ] Configure Stripe webhooks
- [ ] Test payment flows with Stripe test cards
- [ ] Verify email confirmations work
- [ ] Check mobile responsiveness
- [ ] Test authentication flows (login, signup, password reset)
- [ ] Verify file uploads to Cloudinary
- [ ] Test all user roles (student, mentor, admin)
- [ ] Run database migrations on production Supabase
- [ ] Set up monitoring and error tracking

### After Deployment

- [ ] Verify production site is accessible
- [ ] Test critical user flows
- [ ] Monitor error logs
- [ ] Check webhook delivery in Stripe Dashboard
- [ ] Verify email notifications
- [ ] Test performance and load times

---

## Quick Commands Reference

### Development
```bash
npm run dev                     # Start development server
npm run build                   # Build for production
npm run start                   # Start production server
```

### Staging (Docker)
```bash
# Start
docker-compose -f docker-compose.staging.yml up -d

# Start with pgAdmin
docker-compose -f docker-compose.staging.yml --profile tools up -d

# Stop
docker-compose -f docker-compose.staging.yml down

# Rebuild
docker-compose -f docker-compose.staging.yml up --build -d

# Logs
docker-compose -f docker-compose.staging.yml logs -f
```

### Production (Netlify)
```bash
# Deploy (automatic on push to main)
git push origin main

# Manual deploy
netlify deploy --prod

# View logs
netlify logs
```

---

## Support

For issues:
1. Check the troubleshooting section above
2. Review logs for error messages
3. Check GitHub issues
4. Contact the development team

---

**Last Updated:** 2025-12-30
