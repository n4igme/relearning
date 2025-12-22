# Complete Deployment Guide

This guide will help you deploy your e-learning platform to production.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Architecture                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (Netlify)                                          │
│  └─ https://dapper-cocada-70d414.netlify.app                │
│      │                                                        │
│      │ API Calls                                             │
│      ▼                                                        │
│  Backend (Render)                                            │
│  └─ https://your-app.onrender.com/api                       │
│      │                                                        │
│      │ Database Queries                                      │
│      ▼                                                        │
│  Database (MongoDB Atlas)                                    │
│  └─ mongodb+srv://cluster.mongodb.net                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 1: Deploy Database (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Click "Build a Database"
4. Choose **FREE (M0)** tier
5. Select cloud provider and region (choose closest to your users)
6. Click "Create Cluster"

### Step 2: Configure Database Access
1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
   - Authentication Method: Password
   - Username: `elearning_admin` (or your choice)
   - Password: Generate a secure password (save it!)
   - Database User Privileges: "Read and write to any database"
3. Click "Add User"

### Step 3: Configure Network Access
1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, you should restrict this to your backend server IP
4. Click "Confirm"

### Step 4: Get Connection String
1. Click "Database" in left sidebar
2. Click "Connect" on your cluster
3. Click "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your actual credentials
6. Add database name at the end: `...mongodb.net/elearning?retryWrites=true&w=majority`
7. **Save this connection string** - you'll need it for backend deployment

---

## Part 2: Deploy Backend (Render)

### Step 1: Create Render Account
1. Go to [Render](https://render.com)
2. Sign up with GitHub (recommended for easy deployment)
3. Authorize Render to access your GitHub repositories

### Step 2: Push Your Code to GitHub
If you haven't already:
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for deployment"

# Create repository on GitHub, then:
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### Step 3: Create New Web Service on Render
1. Click "New +" button → "Web Service"
2. Connect your GitHub repository
3. Configure the service:

   **Basic Settings:**
   - Name: `elearning-backend` (or your choice)
   - Region: Choose closest to your users
   - Branch: `main`
   - Root Directory: `.` (leave empty)
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

   **Instance Type:**
   - Choose "Free" (spins down after 15 min of inactivity)
   - OR choose "Starter" ($7/month) for always-on service

### Step 4: Configure Environment Variables
Click "Advanced" → "Add Environment Variable" and add these:

```
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/elearning?retryWrites=true&w=majority
JWT_SECRET=generate_a_random_32_character_string_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=generate_another_random_32_character_string
JWT_REFRESH_EXPIRE=30d

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
FROM_NAME=eLearning Platform
FROM_EMAIL=your_email@gmail.com

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# File Upload (optional)
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/tmp/uploads/

# Platform Configuration
PLATFORM_FEE_PERCENTAGE=10
PASSING_SCORE=70
```

**Important Notes:**
- For `JWT_SECRET` and `JWT_REFRESH_SECRET`, generate random strings:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- For Gmail SMTP, use [App Passwords](https://support.google.com/accounts/answer/185833)
- Replace MongoDB URI with your actual Atlas connection string
- Use Stripe test keys initially, then switch to live keys

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Once deployed, you'll see your backend URL: `https://your-app.onrender.com`
4. Test it by visiting: `https://your-app.onrender.com/health`
   - Should return: `{"success":true,"message":"Server is running"}`

---

## Part 3: Deploy Frontend (Netlify)

### Step 1: Update Frontend Environment
Before deploying, ensure your frontend will connect to the production backend:

1. You already have `frontend/.env.production` file
2. Update it with your actual Render backend URL:
   ```
   VITE_API_URL=https://your-app.onrender.com/api
   VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_publishable_key
   ```

### Step 2: Deploy to Netlify

#### Option A: Deploy via Netlify UI (Easiest)
1. Go to [Netlify](https://netlify.com)
2. Sign up/login with GitHub
3. Click "Add new site" → "Import an existing project"
4. Choose GitHub → Select your repository
5. Configure build settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
6. Click "Show advanced" → "New variable"
7. Add environment variables:
   ```
   VITE_API_URL=https://your-app.onrender.com/api
   VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_publishable_key
   ```
8. Click "Deploy site"

#### Option B: Deploy via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Navigate to frontend directory
cd frontend

# Build the frontend
npm run build

# Deploy to Netlify
netlify deploy --prod

# Follow the prompts:
# - Create & configure a new site
# - Publish directory: dist
```

### Step 3: Configure Custom Domain (Optional)
If you want to use `https://dapper-cocada-70d414.netlify.app`:
1. Go to Site settings → Domain management
2. Your site is already deployed to this domain
3. Or add a custom domain if you have one

### Step 4: Set Environment Variables in Netlify
1. Go to Site settings → Build & deploy → Environment
2. Click "Edit variables"
3. Add:
   ```
   VITE_API_URL=https://your-backend-app.onrender.com/api
   VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_publishable_key
   ```
4. Click "Save"
5. Trigger a new deploy: Deploys → Trigger deploy → Deploy site

---

## Part 4: Final Configuration

### Step 1: Update CORS on Backend
Your backend needs to allow requests from your Netlify domain.

**Edit `src/server.js`:**
```javascript
// CORS - Update this section
const corsOptions = {
  origin: [
    'http://localhost:3000', // Local development
    'https://dapper-cocada-70d414.netlify.app', // Production frontend
    // Add your custom domain if you have one
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

**Then redeploy backend:**
```bash
git add .
git commit -m "Update CORS for production"
git push origin main
# Render will auto-deploy
```

### Step 2: Test Your Deployment
1. Visit your Netlify frontend: `https://dapper-cocada-70d414.netlify.app`
2. Try to register/login
3. Check browser console for any errors
4. Test creating courses, enrolling, etc.

### Step 3: Seed Initial Data (Optional)
If you want to seed admin user or initial data:

**Option A: Via MongoDB Atlas UI**
1. Go to MongoDB Atlas → Browse Collections
2. Manually create an admin user

**Option B: Via Backend Script**
1. Create a seeder script locally
2. Run with production MongoDB URI:
   ```bash
   MONGODB_URI="your-atlas-uri" node src/seeders/seedAdmin.js
   ```

---

## Troubleshooting

### Frontend can't connect to backend
**Check:**
- [ ] `VITE_API_URL` in Netlify environment variables is correct
- [ ] Backend is deployed and accessible at `/health` endpoint
- [ ] CORS is configured correctly on backend
- [ ] Netlify site has been rebuilt after env var changes

### Backend errors on Render
**Check:**
- [ ] All environment variables are set correctly
- [ ] MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- [ ] Database user credentials are correct in `MONGODB_URI`
- [ ] Check Render logs: Dashboard → Logs

### Email verification not working
**Check:**
- [ ] Gmail App Password is correct
- [ ] SMTP settings are correct
- [ ] "Less secure app access" is enabled (if using Gmail)

### Payment not working
**Check:**
- [ ] Stripe keys match (test vs live)
- [ ] Webhook endpoint is configured in Stripe dashboard
- [ ] Frontend has correct `VITE_STRIPE_PUBLIC_KEY`

---

## Cost Breakdown

### Free Tier (Perfect for Testing)
- MongoDB Atlas: Free (512MB storage, good for ~5,000 users)
- Render: Free (sleeps after inactivity, wakes on request)
- Netlify: Free (100GB bandwidth, 300 build minutes/month)
- **Total: $0/month**

### Production Tier (Recommended)
- MongoDB Atlas: $0 (M0 cluster) or $9/month (M10 cluster - 2GB storage)
- Render: $7/month (Starter - always on, better performance)
- Netlify: Free (sufficient for most apps)
- **Total: $7-16/month**

---

## Security Checklist Before Going Live

- [ ] Change all JWT secrets to strong random strings
- [ ] Use Stripe live keys (not test keys)
- [ ] Configure CORS to only allow your Netlify domain
- [ ] Restrict MongoDB Atlas IP whitelist to Render IPs
- [ ] Use environment variables for all secrets (never commit to Git)
- [ ] Enable HTTPS (Netlify and Render provide this automatically)
- [ ] Set secure cookie settings in production
- [ ] Enable rate limiting (already configured)
- [ ] Review and test all authentication flows
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Create database backups (MongoDB Atlas does this automatically)

---

## Post-Deployment

### Monitoring
- Check Render logs regularly
- Monitor MongoDB Atlas metrics
- Set up uptime monitoring (UptimeRobot, Pingdom)

### Backups
- MongoDB Atlas: Automatic backups on paid plans
- Code: Ensure Git repository is backed up

### Updates
- To deploy frontend changes: Push to GitHub → Netlify auto-deploys
- To deploy backend changes: Push to GitHub → Render auto-deploys
- To update environment variables: Update in Netlify/Render dashboard → Redeploy

---

## Quick Reference

### Frontend URL
- Production: `https://dapper-cocada-70d414.netlify.app`

### Backend URL (after deployment)
- Production: `https://your-app.onrender.com`
- Health check: `https://your-app.onrender.com/health`
- API base: `https://your-app.onrender.com/api`

### Database
- MongoDB Atlas Dashboard: https://cloud.mongodb.com

### Deployment Platforms
- Netlify Dashboard: https://app.netlify.com
- Render Dashboard: https://dashboard.render.com

---

## Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review platform-specific logs (Render logs, Netlify deploy logs)
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
5. Test each component separately (database connection, backend health, frontend build)

Good luck with your deployment! 🚀
