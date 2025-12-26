# Docker Deployment - Quick Start

Deploy the entire e-learning platform (Next.js + PostgreSQL) with Docker in 5 minutes!

## Prerequisites

- Docker Desktop installed and running
- 4GB+ RAM available
- 5GB+ disk space

## Quick Deploy (Automated)

### Windows

```cmd
# 1. Create environment file
copy .env.docker.example .env.docker

# 2. Edit .env.docker (update POSTGRES_PASSWORD, Cloudinary, Supabase)

# 3. Run deployment script
deploy-docker.bat
```

### Mac/Linux

```bash
# 1. Create environment file
cp .env.docker.example .env.docker

# 2. Edit .env.docker (update POSTGRES_PASSWORD, Cloudinary, Supabase)

# 3. Make script executable and run
chmod +x deploy-docker.sh
./deploy-docker.sh
```

## Manual Deploy

```bash
# 1. Create environment file
cp .env.docker.example .env.docker

# 2. Edit .env.docker with your values

# 3. Start services
docker-compose -f docker-compose.staging.yml up -d

# 4. Wait for PostgreSQL (10 seconds)
sleep 10

# 5. Initialize database
docker exec -i elearning-postgres psql -U postgres -d elearning < database/supabase-schema.sql

# 6. Seed data (optional)
docker exec -i elearning-postgres psql -U postgres -d elearning < database/seed-skills.sql
docker exec -i elearning-postgres psql -U postgres -d elearning < database/seed-tools.sql
docker exec -i elearning-postgres psql -U postgres -d elearning < database/seed-courses.sql
docker exec -i elearning-postgres psql -U postgres -d elearning < database/add-enrollment-requests.sql
```

## Access Points

- **Application:** http://localhost:3000
- **pgAdmin (Database UI):** http://localhost:5050
  - Email: admin@admin.com
  - Password: admin
- **PostgreSQL:** localhost:5432

## Create Admin User

```bash
# Connect to database
docker exec -it elearning-postgres psql -U postgres -d elearning

# Make yourself admin (replace with your email)
UPDATE profiles SET role = 'admin', is_approved = true WHERE email = 'your@email.com';

# Exit
\q
```

## Common Commands

```bash
# View logs
docker-compose -f docker-compose.staging.yml logs -f

# Stop services
docker-compose -f docker-compose.staging.yml down

# Restart services
docker-compose -f docker-compose.staging.yml restart

# Check status
docker-compose -f docker-compose.staging.yml ps

# Rebuild after code changes
docker-compose -f docker-compose.staging.yml up --build -d
```

## Environment Variables (.env.docker)

### Required

```env
# Database
POSTGRES_PASSWORD=your_secure_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Optional

```env
# Stripe (for payment gateway)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Troubleshooting

### Port Already in Use

```bash
# Change port in .env.docker
APP_PORT=3001
```

### Can't Connect to Database

```bash
# Check if PostgreSQL is running
docker-compose -f docker-compose.staging.yml ps postgres

# View PostgreSQL logs
docker-compose -f docker-compose.staging.yml logs postgres
```

### App Won't Start

```bash
# View app logs
docker-compose -f docker-compose.staging.yml logs app

# Rebuild from scratch
docker-compose -f docker-compose.staging.yml down
docker-compose -f docker-compose.staging.yml up --build
```

### Clear Everything and Start Fresh

```bash
# WARNING: This deletes all data!
docker-compose -f docker-compose.staging.yml down -v
docker-compose -f docker-compose.staging.yml up --build -d
```

## What's Included

- **Next.js Application** - Production build
- **PostgreSQL 16** - Database server
- **pgAdmin** - Database management UI (optional)
- **Automatic Health Checks** - Ensures services are running
- **Data Persistence** - Volumes for database storage
- **Network Isolation** - Secure internal network

## Architecture

```
┌─────────────────────────────────────────┐
│  Docker Network (elearning-network)     │
│                                          │
│  ┌──────────────┐   ┌───────────────┐   │
│  │              │   │               │   │
│  │   Next.js    │   │  PostgreSQL   │   │
│  │     App      │──▶│   Database    │   │
│  │  Port: 3000  │   │  Port: 5432   │   │
│  │              │   │               │   │
│  └──────────────┘   └───────────────┘   │
│         │                    │           │
└─────────┼────────────────────┼───────────┘
          │                    │
     Port 3000              Port 5432
     (exposed)              (exposed)
```

## File Structure

```
.
├── Dockerfile                    # Next.js app container
├── docker-compose.staging.yml    # Full stack definition
├── .dockerignore                 # Build exclusions
├── .env.docker.example          # Environment template
├── .env.docker                  # Your configuration (create this)
├── deploy-docker.sh             # Deployment script (Linux/Mac)
├── deploy-docker.bat            # Deployment script (Windows)
├── database/
│   ├── init/
│   │   └── 01-init.sql         # DB initialization
│   ├── supabase-schema.sql     # Main schema
│   └── seed-*.sql              # Sample data
└── DOCKER-DEPLOYMENT.md         # Full documentation
```

## Next Steps

1. ✅ Deploy with Docker
2. ✅ Access at http://localhost:3000
3. ✅ Create admin user
4. ✅ Seed database with courses
5. ✅ Update bank details in enrollment page
6. ✅ Start accepting student enrollments!

## Full Documentation

For detailed information, see:
- **[DOCKER-DEPLOYMENT.md](DOCKER-DEPLOYMENT.md)** - Complete deployment guide
- **[MANUAL-PAYMENT-SETUP.md](MANUAL-PAYMENT-SETUP.md)** - Payment system setup

## Support

- **Check logs:** `docker-compose -f docker-compose.staging.yml logs -f`
- **Check status:** `docker-compose -f docker-compose.staging.yml ps`
- **Database shell:** `docker exec -it elearning-postgres psql -U postgres -d elearning`

---

**Happy Deploying! 🚀**
