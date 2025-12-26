#!/bin/bash

# =====================================================
# E-Learning Platform - Docker Deployment Script
# =====================================================
# This script automates the deployment of the platform

set -e  # Exit on error

echo "========================================="
echo "E-Learning Platform - Docker Deployment"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

# Check if .env.docker exists
if [ ! -f ".env.docker" ]; then
    echo -e "${YELLOW}! .env.docker not found${NC}"
    echo "Creating .env.docker from template..."

    if [ -f ".env.docker.example" ]; then
        cp .env.docker.example .env.docker
        echo -e "${YELLOW}! Please edit .env.docker with your configuration before continuing${NC}"
        echo "  Required: POSTGRES_PASSWORD, CLOUDINARY credentials, SUPABASE credentials"
        echo ""
        read -p "Press Enter after you've updated .env.docker, or Ctrl+C to exit..."
    else
        echo -e "${RED}Error: .env.docker.example not found!${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Environment file exists${NC}"

# Pull latest images
echo ""
echo "Pulling Docker images..."
docker-compose -f docker-compose.staging.yml pull

# Build and start services
echo ""
echo "Building and starting services..."
docker-compose -f docker-compose.staging.yml up --build -d

# Wait for PostgreSQL to be ready
echo ""
echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Check if PostgreSQL is ready
until docker exec elearning-postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done

echo -e "${GREEN}✓ PostgreSQL is ready${NC}"

# Ask if user wants to initialize the database
echo ""
read -p "Do you want to initialize the database schema? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Initializing database schema..."

    if [ -f "database/supabase-schema.sql" ]; then
        docker exec -i elearning-postgres psql -U postgres -d elearning < database/supabase-schema.sql
        echo -e "${GREEN}✓ Schema initialized${NC}"
    else
        echo -e "${YELLOW}! database/supabase-schema.sql not found${NC}"
    fi
fi

# Ask if user wants to seed the database
echo ""
read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Seeding database..."

    # Seed files in order
    SEED_FILES=(
        "database/seed-skills.sql"
        "database/seed-tools.sql"
        "database/seed-badges.sql"
        "database/seed-courses.sql"
        "database/link-tools-to-courses.sql"
        "database/add-enrollment-requests.sql"
    )

    for file in "${SEED_FILES[@]}"; do
        if [ -f "$file" ]; then
            echo "Running $file..."
            docker exec -i elearning-postgres psql -U postgres -d elearning < "$file"
            echo -e "${GREEN}✓ $(basename $file) completed${NC}"
        else
            echo -e "${YELLOW}! $file not found, skipping${NC}"
        fi
    done
fi

# Show status
echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
docker-compose -f docker-compose.staging.yml ps
echo ""
echo -e "${GREEN}Application:${NC}  http://localhost:3000"
echo -e "${GREEN}pgAdmin:${NC}      http://localhost:5050"
echo -e "${GREEN}PostgreSQL:${NC}   localhost:5432"
echo ""
echo "pgAdmin credentials:"
echo "  Email: admin@admin.com"
echo "  Password: admin"
echo ""
echo "To view logs:"
echo "  docker-compose -f docker-compose.staging.yml logs -f"
echo ""
echo "To stop services:"
echo "  docker-compose -f docker-compose.staging.yml down"
echo ""
echo "========================================="
