# Deployment Checklist

Use this checklist to ensure smooth deployment.

## Pre-Deployment Checklist

### Code Preparation
- [x] Netlify configuration file created (`netlify.toml`)
- [x] Render configuration file created (`render.yaml`)
- [x] Production environment variables template created (`frontend/.env.production`)
- [x] CORS configured for production
- [x] Health check endpoints added
- [ ] All sensitive data removed from code (no hardcoded secrets)
- [ ] `.gitignore` includes `.env` files

### Testing
- [ ] Application works locally with Docker
- [ ] All core features tested (auth, courses, payments, etc.)
- [ ] Frontend builds successfully: `cd frontend && npm run build`
- [ ] Backend starts successfully: `npm start`

---

## Deployment Steps

### Step 1: Database (MongoDB Atlas)
- [ ] Created MongoDB Atlas account
- [ ] Created free M0 cluster
- [ ] Created database user with password
- [ ] Whitelisted IP addresses (0.0.0.0/0 for now)
- [ ] Copied connection string
- [ ] Updated connection string with username, password, and database name

**Connection String Format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/elearning?retryWrites=true&w=majority
```

---

### Step 2: Backend (Render)
- [ ] Pushed code to GitHub
- [ ] Created Render account
- [ ] Connected GitHub repository to Render
- [ ] Created new Web Service on Render
- [ ] Configured build settings:
  - Runtime: Node
  - Build Command: `npm install`
  - Start Command: `npm start`
- [ ] Added all environment variables (see list below)
- [ ] Deployed backend
- [ ] Tested health endpoint: `https://your-app.onrender.com/health`
- [ ] Saved backend URL for frontend configuration

**Required Environment Variables for Render:**
```
✓ NODE_ENV=production
✓ PORT=5001
✓ MONGODB_URI=<your-atlas-connection-string>
✓ JWT_SECRET=<random-32-char-string>
✓ JWT_EXPIRE=7d
✓ JWT_REFRESH_SECRET=<random-32-char-string>
✓ JWT_REFRESH_EXPIRE=30d
✓ SMTP_HOST=smtp.gmail.com
✓ SMTP_PORT=587
✓ SMTP_EMAIL=<your-email>
✓ SMTP_PASSWORD=<your-app-password>
✓ FROM_NAME=eLearning Platform
✓ FROM_EMAIL=<your-email>
✓ STRIPE_SECRET_KEY=<your-stripe-secret>
✓ STRIPE_PUBLISHABLE_KEY=<your-stripe-public>
✓ PLATFORM_FEE_PERCENTAGE=10
✓ PASSING_SCORE=70
```

**Generate JWT Secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Step 3: Frontend (Netlify)
- [ ] Updated `frontend/.env.production` with backend URL
- [ ] Deployed to Netlify via dashboard or CLI
- [ ] Configured build settings:
  - Base directory: `frontend`
  - Build command: `npm run build`
  - Publish directory: `frontend/dist`
- [ ] Added environment variables in Netlify:
  - `VITE_API_URL=https://your-app.onrender.com/api`
  - `VITE_STRIPE_PUBLIC_KEY=<your-stripe-public-key>`
- [ ] Deployed successfully
- [ ] Verified site is accessible at: `https://dapper-cocada-70d414.netlify.app`

---

### Step 4: Post-Deployment Testing
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] Email verification works
- [ ] Login works
- [ ] Course creation works (Mentor role)
- [ ] Course enrollment works (Student role)
- [ ] Payment flow works (if using Stripe)
- [ ] Admin dashboard accessible
- [ ] All API calls successful (check browser Network tab)
- [ ] No CORS errors in browser console

---

### Step 5: Production Configuration
- [ ] Updated CORS in backend to allow only Netlify domain
- [ ] Switched Stripe to live keys (when ready for production)
- [ ] Configured custom domain (if applicable)
- [ ] Set up SSL/HTTPS (automatic on Netlify and Render)
- [ ] Created admin user in database
- [ ] Seeded initial data (if needed)

---

## Troubleshooting

### Issue: Frontend can't connect to backend
**Solutions:**
1. Check `VITE_API_URL` in Netlify environment variables
2. Verify backend is running: visit `https://your-app.onrender.com/health`
3. Check CORS configuration in `src/server.js`
4. Rebuild Netlify site after changing environment variables

### Issue: 500 errors from backend
**Solutions:**
1. Check Render logs: Dashboard → Your service → Logs
2. Verify MongoDB connection string is correct
3. Ensure all environment variables are set
4. Check MongoDB Atlas allows connections from anywhere

### Issue: Email not sending
**Solutions:**
1. Verify Gmail App Password (not regular password)
2. Check SMTP settings are correct
3. Enable "Less secure app access" in Gmail (if required)
4. Check Render logs for email-related errors

### Issue: Payment not working
**Solutions:**
1. Verify Stripe keys match (test vs live)
2. Check `VITE_STRIPE_PUBLIC_KEY` in Netlify
3. Check `STRIPE_SECRET_KEY` in Render
4. Review Stripe dashboard for errors

---

## Post-Launch Checklist

### Monitoring
- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Monitor Render logs regularly
- [ ] Check MongoDB Atlas metrics

### Security
- [ ] All secrets are in environment variables
- [ ] CORS only allows your Netlify domain
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced
- [ ] Database backups are configured

### Maintenance
- [ ] Document deployment process for team
- [ ] Set up CI/CD pipeline (if needed)
- [ ] Plan for scaling (upgrade Render/MongoDB tiers when needed)
- [ ] Create monitoring dashboard

---

## Quick Commands

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test Backend Locally
```bash
npm start
# Visit: http://localhost:5001/health
```

### Build Frontend Locally
```bash
cd frontend
npm run build
# Preview: npm run preview
```

### Deploy to Netlify (CLI)
```bash
cd frontend
netlify deploy --prod
```

### View Logs
- **Render:** Dashboard → Service → Logs tab
- **Netlify:** Dashboard → Site → Deploys → Deploy log
- **MongoDB:** Atlas → Metrics tab

---

## Support Resources

- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com/
- **Render Docs:** https://render.com/docs
- **Netlify Docs:** https://docs.netlify.com/
- **Vite Docs:** https://vitejs.dev/
- **Express Docs:** https://expressjs.com/

---

## Deployment URLs

After deployment, save these URLs:

- **Frontend:** `https://dapper-cocada-70d414.netlify.app`
- **Backend:** `https://______________.onrender.com`
- **API Base:** `https://______________.onrender.com/api`
- **MongoDB:** `mongodb+srv://cluster0._____.mongodb.net/elearning`

---

**Last Updated:** 2025-12-22
**Status:** Ready for deployment ✅
