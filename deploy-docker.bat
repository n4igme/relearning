@echo off
REM =====================================================
REM E-Learning Platform - Docker Deployment Script (Windows)
REM =====================================================

echo =========================================
echo E-Learning Platform - Docker Deployment
echo =========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Check if .env.docker exists
if not exist ".env.docker" (
    echo [WARNING] .env.docker not found
    echo Creating .env.docker from template...

    if exist ".env.docker.example" (
        copy .env.docker.example .env.docker
        echo [WARNING] Please edit .env.docker with your configuration
        echo Required: POSTGRES_PASSWORD, CLOUDINARY credentials, SUPABASE credentials
        echo.
        pause
    ) else (
        echo [ERROR] .env.docker.example not found!
        pause
        exit /b 1
    )
)

echo [OK] Environment file exists
echo.

REM Pull latest images
echo Pulling Docker images...
docker-compose -f docker-compose.staging.yml pull

REM Build and start services
echo.
echo Building and starting services...
docker-compose -f docker-compose.staging.yml up --build -d

REM Wait for PostgreSQL
echo.
echo Waiting for PostgreSQL to be ready...
timeout /t 10 /nobreak >nul

:check_postgres
docker exec elearning-postgres pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    echo Waiting for PostgreSQL...
    timeout /t 2 /nobreak >nul
    goto check_postgres
)

echo [OK] PostgreSQL is ready
echo.

REM Ask about database initialization
set /p INIT_DB="Do you want to initialize the database schema? (y/n): "
if /i "%INIT_DB%"=="y" (
    echo Initializing database schema...

    if exist "database\supabase-schema.sql" (
        docker exec -i elearning-postgres psql -U postgres -d elearning < database\supabase-schema.sql
        echo [OK] Schema initialized
    ) else (
        echo [WARNING] database\supabase-schema.sql not found
    )
)

echo.
set /p SEED_DB="Do you want to seed the database with sample data? (y/n): "
if /i "%SEED_DB%"=="y" (
    echo Seeding database...

    if exist "database\seed-skills.sql" (
        echo Running seed-skills.sql...
        docker exec -i elearning-postgres psql -U postgres -d elearning < database\seed-skills.sql
        echo [OK] Skills seeded
    )

    if exist "database\seed-tools.sql" (
        echo Running seed-tools.sql...
        docker exec -i elearning-postgres psql -U postgres -d elearning < database\seed-tools.sql
        echo [OK] Tools seeded
    )

    if exist "database\seed-badges.sql" (
        echo Running seed-badges.sql...
        docker exec -i elearning-postgres psql -U postgres -d elearning < database\seed-badges.sql
        echo [OK] Badges seeded
    )

    if exist "database\seed-courses.sql" (
        echo Running seed-courses.sql...
        docker exec -i elearning-postgres psql -U postgres -d elearning < database\seed-courses.sql
        echo [OK] Courses seeded
    )

    if exist "database\link-tools-to-courses.sql" (
        echo Running link-tools-to-courses.sql...
        docker exec -i elearning-postgres psql -U postgres -d elearning < database\link-tools-to-courses.sql
        echo [OK] Tools linked
    )

    if exist "database\add-enrollment-requests.sql" (
        echo Running add-enrollment-requests.sql...
        docker exec -i elearning-postgres psql -U postgres -d elearning < database\add-enrollment-requests.sql
        echo [OK] Enrollment requests table created
    )
)

REM Show status
echo.
echo =========================================
echo Deployment Complete!
echo =========================================
echo.
docker-compose -f docker-compose.staging.yml ps
echo.
echo Application:  http://localhost:3000
echo pgAdmin:      http://localhost:5050
echo PostgreSQL:   localhost:5432
echo.
echo pgAdmin credentials:
echo   Email: admin@admin.com
echo   Password: admin
echo.
echo To view logs:
echo   docker-compose -f docker-compose.staging.yml logs -f
echo.
echo To stop services:
echo   docker-compose -f docker-compose.staging.yml down
echo.
echo =========================================
echo.
pause
