# Docker Local Deployment Guide

This guide explains how to deploy the entire e-learning platform (Next.js app + PostgreSQL database) on your local machine using Docker.

## Prerequisites

1. **Docker Desktop** installed and running
   - Windows/Mac: [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Linux: Install Docker Engine and Docker Compose

2. **Git** (to clone the repository)

3. **Minimum System Requirements:**
   - RAM: 4GB (8GB recommended)
   - Disk Space: 5GB free
   - CPU: 2 cores

## Quick Start (5 Minutes)

### 1. Create Environment File

```bash
# Copy the example environment file
cp .env.docker.example .env.docker

# Edit the file and update the values
# At minimum, change:
# - POSTGRES_PASSWORD
# - CLOUDINARY credentials
# - NEXT_PUBLIC_SUPABASE_URL and keys (if using Supabase)
```

### 2. Start the Stack

```bash
# Build and start all services
docker-compose -f docker-compose.staging.yml up --build -d

# Check if services are running
docker-compose -f docker-compose.staging.yml ps
```

### 3. Initialize Database Schema

```bash
# Wait for PostgreSQL to be ready (about 10 seconds)
sleep 10

# Run the main schema
docker exec -i elearning-postgres psql -U postgres -d elearning < database/supabase-schema.sql

# Run seed scripts (optional but recommended)
docker exec -i elearning-postgres psql -U postgres -d elearning < database/seed-skills.sql
docker exec -i elearning-postgres psql -U postgres -d elearning < database/seed-tools.sql
docker exec -i elearning-postgres psql -U postgres -d elearning < database/seed-badges.sql
docker exec -i elearning-postgres psql -U postgres -d elearning < database/seed-courses.sql
docker exec -i elearning-postgres psql -U postgres -d elearning < database/link-tools-to-courses.sql
docker exec -i elearning-postgres psql -U postgres -d elearning < database/add-enrollment-requests.sql
```

### 4. Access the Application

- **Application:** http://localhost:3000
- **pgAdmin (Database UI):** http://localhost:5050
  - Email: admin@admin.com
  - Password: admin

### 5. Create Admin User

```bash
# Connect to PostgreSQL
docker exec -it elearning-postgres psql -U postgres -d elearning

# Run the following SQL (replace with your email)
UPDATE profiles
SET role = 'admin', is_approved = true
WHERE email = 'your@email.com';

# Exit
\q
```

Done! Your platform is now running at http://localhost:3000

## Detailed Setup Instructions

### Environment Configuration

The `.env.docker` file contains all configuration. Key sections:

#### Database Configuration
```env
POSTGRES_DB=elearning           # Database name
POSTGRES_USER=postgres          # Database user
POSTGRES_PASSWORD=SecurePass123 # CHANGE THIS!
POSTGRES_PORT=5432             # Database port
```

#### Application URLs
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production deployment, change to your domain:
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### Cloudinary (Required)
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

Get these from [Cloudinary Dashboard](https://console.cloudinary.com/)

#### Supabase (if using)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Note:** If using local PostgreSQL instead of Supabase, you'll need to:
1. Remove Supabase auth dependencies
2. Implement local auth (NextAuth.js, Passport, etc.)
3. Update `lib/supabase/` files

## Docker Commands Reference

### Starting Services

```bash
# Start all services (detached mode)
docker-compose -f docker-compose.staging.yml up -d

# Start with logs visible
docker-compose -f docker-compose.staging.yml up

# Start specific service
docker-compose -f docker-compose.staging.yml up postgres

# Rebuild and start (after code changes)
docker-compose -f docker-compose.staging.yml up --build

# Start with pgAdmin
docker-compose -f docker-compose.staging.yml --profile tools up -d
```

### Stopping Services

```bash
# Stop all services
docker-compose -f docker-compose.staging.yml down

# Stop and remove volumes (WARNING: Deletes all data!)
docker-compose -f docker-compose.staging.yml down -v

# Stop specific service
docker-compose -f docker-compose.staging.yml stop app
```

### Viewing Logs

```bash
# View all logs
docker-compose -f docker-compose.staging.yml logs

# Follow logs in real-time
docker-compose -f docker-compose.staging.yml logs -f

# View specific service logs
docker-compose -f docker-compose.staging.yml logs app
docker-compose -f docker-compose.staging.yml logs postgres

# Last 100 lines
docker-compose -f docker-compose.staging.yml logs --tail=100
```

### Database Operations

```bash
# Connect to PostgreSQL
docker exec -it elearning-postgres psql -U postgres -d elearning

# Run SQL file
docker exec -i elearning-postgres psql -U postgres -d elearning < database/your-file.sql

# Backup database
docker exec elearning-postgres pg_dump -U postgres elearning > backup.sql

# Restore database
docker exec -i elearning-postgres psql -U postgres -d elearning < backup.sql

# Check database size
docker exec elearning-postgres psql -U postgres -d elearning -c "SELECT pg_size_pretty(pg_database_size('elearning'));"
```

### Application Container

```bash
# Execute command in app container
docker exec -it elearning-app sh

# View app environment variables
docker exec elearning-app env

# Restart app without rebuilding
docker-compose -f docker-compose.staging.yml restart app

# View app build logs
docker-compose -f docker-compose.staging.yml logs --tail=100 app
```

### Monitoring Services

```bash
# Check service status
docker-compose -f docker-compose.staging.yml ps

# Check resource usage
docker stats

# Inspect a container
docker inspect elearning-app
docker inspect elearning-postgres
```

## Volume Management

### Data Persistence

Volumes store data permanently:
- `postgres_data` - Database files
- `pgadmin_data` - pgAdmin settings

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect relearning_postgres_data

# Backup volume
docker run --rm -v relearning_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz -C /data .

# Restore volume
docker run --rm -v relearning_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /data
```

### Clean Up

```bash
# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes (WARNING: Data loss!)
docker volume prune

# Remove everything (nuclear option)
docker system prune -a --volumes
```

## Troubleshooting

### App Won't Start

**Check logs:**
```bash
docker-compose -f docker-compose.staging.yml logs app
```

**Common issues:**
1. **Port 3000 already in use:**
   ```bash
   # Change APP_PORT in .env.docker
   APP_PORT=3001
   ```

2. **Build fails:**
   ```bash
   # Clear build cache and rebuild
   docker-compose -f docker-compose.staging.yml build --no-cache
   ```

3. **Environment variables not loaded:**
   ```bash
   # Verify .env.docker exists
   ls -la .env.docker

   # Restart with new env
   docker-compose -f docker-compose.staging.yml down
   docker-compose -f docker-compose.staging.yml up -d
   ```

### Database Connection Issues

**Check if PostgreSQL is running:**
```bash
docker-compose -f docker-compose.staging.yml ps postgres
```

**Check PostgreSQL logs:**
```bash
docker-compose -f docker-compose.staging.yml logs postgres
```

**Test connection:**
```bash
docker exec elearning-postgres pg_isready -U postgres
```

**Verify connection string:**
```bash
# Should be:
postgresql://postgres:your_password@postgres:5432/elearning

# NOT:
postgresql://postgres:your_password@localhost:5432/elearning
```

### Can't Access Application

**Check if container is running:**
```bash
docker ps | grep elearning-app
```

**Check if port is exposed:**
```bash
# Should show: 0.0.0.0:3000->3000/tcp
docker port elearning-app
```

**Test from inside container:**
```bash
docker exec elearning-app wget -O- http://localhost:3000
```

### pgAdmin Won't Connect to Database

1. **Get PostgreSQL container IP:**
   ```bash
   docker inspect elearning-postgres | grep IPAddress
   ```

2. **In pgAdmin, add server:**
   - Host: Use container name `postgres` or the IP from above
   - Port: 5432
   - Username: postgres
   - Password: (from .env.docker)

### Out of Disk Space

```bash
# Check Docker disk usage
docker system df

# Clean up
docker system prune -a --volumes
```

### Slow Performance

**Increase Docker resources:**
- Docker Desktop → Settings → Resources
- Increase RAM to 4GB minimum
- Increase CPU to 2 cores minimum

**Check resource usage:**
```bash
docker stats
```

## Production Deployment

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong POSTGRES_PASSWORD
- [ ] Generate secure JWT_SECRET and SESSION_SECRET
- [ ] Remove or secure pgAdmin (don't expose to internet)
- [ ] Use environment secrets management
- [ ] Enable HTTPS (add nginx proxy)
- [ ] Set up firewall rules
- [ ] Regular backups
- [ ] Monitor logs
- [ ] Update NEXT_PUBLIC_APP_URL to your domain

### Recommended Production Setup

```yaml
# Add nginx reverse proxy
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
    - ./ssl:/etc/nginx/ssl:ro
  depends_on:
    - app
```

### SSL/HTTPS Setup

Use Let's Encrypt with certbot:

```bash
# Add to docker-compose
certbot:
  image: certbot/certbot
  volumes:
    - ./ssl:/etc/letsencrypt
  command: certonly --webroot --webroot-path=/var/www/certbot --email your@email.com --agree-tos --no-eff-email -d yourdomain.com
```

## Performance Optimization

### Build Optimization

```dockerfile
# In Dockerfile, already optimized with:
- Multi-stage builds
- Layer caching
- Standalone output
- Alpine base image
```

### Database Optimization

```sql
-- Add indexes (already in schema)
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_payments_student ON payments(student_id);
```

### Application Caching

```bash
# Add Redis for caching (optional)
redis:
  image: redis:alpine
  ports:
    - "6379:6379"
```

## Backup and Restore

### Automated Backups

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
docker exec elearning-postgres pg_dump -U postgres elearning | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

# Backup volumes
docker run --rm -v relearning_postgres_data:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar czf /backup/volume_$TIMESTAMP.tar.gz -C /data .

echo "Backup completed: $TIMESTAMP"
EOF

chmod +x backup.sh
```

### Restore from Backup

```bash
# Restore database
gunzip < backups/db_20231225_120000.sql.gz | docker exec -i elearning-postgres psql -U postgres -d elearning

# Restore volume
docker run --rm -v relearning_postgres_data:/data -v $(pwd)/backups:/backup alpine tar xzf /backup/volume_20231225_120000.tar.gz -C /data
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Staging

on:
  push:
    branches: [staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and Deploy
        run: |
          docker-compose -f docker-compose.staging.yml build
          docker-compose -f docker-compose.staging.yml up -d
```

## Useful Aliases

Add to your `.bashrc` or `.zshrc`:

```bash
alias dc='docker-compose -f docker-compose.staging.yml'
alias dcup='docker-compose -f docker-compose.staging.yml up -d'
alias dcdown='docker-compose -f docker-compose.staging.yml down'
alias dclogs='docker-compose -f docker-compose.staging.yml logs -f'
alias dcps='docker-compose -f docker-compose.staging.yml ps'
```

Then use:
```bash
dcup      # Start services
dclogs    # View logs
dcdown    # Stop services
```

## Support

### Check Health

```bash
# App health check
curl http://localhost:3000/api/health

# Database health
docker exec elearning-postgres pg_isready -U postgres
```

### Debug Mode

```bash
# Run app in development mode for debugging
docker-compose -f docker-compose.staging.yml run --rm app npm run dev
```

---

**Created:** December 2025
**Status:** ✅ Production Ready
**Docker Version:** 24.0+
**Docker Compose Version:** 2.0+

## Quick Reference Card

```
Start:     docker-compose -f docker-compose.staging.yml up -d
Stop:      docker-compose -f docker-compose.staging.yml down
Logs:      docker-compose -f docker-compose.staging.yml logs -f
Rebuild:   docker-compose -f docker-compose.staging.yml up --build -d
DB Shell:  docker exec -it elearning-postgres psql -U postgres -d elearning
App Shell: docker exec -it elearning-app sh
Status:    docker-compose -f docker-compose.staging.yml ps
```

**Access Points:**
- App: http://localhost:3000
- pgAdmin: http://localhost:5050
- PostgreSQL: localhost:5432

Good luck with your deployment! 🚀
