# Google SSO Setup Guide

Complete guide to enable Google Sign-In for your e-learning platform.

## Part 1: Set Up Google Cloud Project (10 minutes)

### Step 1: Create Google Cloud Project

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Click **"Select a project"** (top left) → **"New Project"**
3. Fill in:
   - **Project name**: `elearning-platform` (or your choice)
   - **Organization**: Leave as default (No organization)
4. Click **"Create"**
5. Wait for project creation (~30 seconds)

### Step 2: Enable Google OAuth

1. Make sure your new project is selected (check top left)
2. Go to **"APIs & Services"** → **"OAuth consent screen"** (left sidebar)
3. Choose **"External"** user type
4. Click **"Create"**

### Step 3: Configure OAuth Consent Screen

**App information:**
- **App name**: `E-Learning Platform`
- **User support email**: Your email (e.g., cikumel@gmail.com)
- **App logo**: Skip for now (optional)

**App domain (optional for testing):**
- Leave blank for now

**Developer contact information:**
- **Email addresses**: Your email (e.g., cikumel@gmail.com)

Click **"Save and Continue"**

### Step 4: Scopes

1. Click **"Add or Remove Scopes"**
2. Select these scopes:
   - `userinfo.email`
   - `userinfo.profile`
3. Click **"Update"**
4. Click **"Save and Continue"**

### Step 5: Test Users (Important for Development!)

Since the app is in testing mode, you need to add test users:

1. Click **"Add Users"**
2. Add your email(s):
   - `cikumel@gmail.com`
   - Any other emails you want to test with
3. Click **"Add"**
4. Click **"Save and Continue"**

### Step 6: Create OAuth Client ID

1. Go to **"Credentials"** (left sidebar)
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Choose **"Web application"**
4. Fill in:
   - **Name**: `E-Learning Platform Web`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `http://localhost:3001`
   - **Authorized redirect URIs**:
     - `https://pqcmlfudwrlnehnxyltr.supabase.co/auth/v1/callback`

     ⚠️ **Replace `pqcmlfudwrlnehnxyltr` with YOUR Supabase project reference!**

     Find it at: Supabase Dashboard → Settings → API → Project URL

5. Click **"Create"**

### Step 7: Save Your Credentials

You'll see a popup with:
- **Client ID**: `123456789-abc.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxx`

**IMPORTANT:** Copy both and save them securely! You'll need them in Part 2.

---

## Part 2: Configure Supabase (5 minutes)

### Step 1: Enable Google Provider in Supabase

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project: `elearning-platform`
3. Click **"Authentication"** in left sidebar
4. Click **"Providers"** tab
5. Find **"Google"** and toggle it **ON**

### Step 2: Add Google Credentials

In the Google provider settings:

1. **Client ID (for OAuth)**: Paste your Google Client ID
   - Example: `123456789-abc.apps.googleusercontent.com`

2. **Client Secret (for OAuth)**: Paste your Google Client Secret
   - Example: `GOCSPX-xxxxxxxxxxxxxxx`

3. Click **"Save"**

### Step 3: Verify Redirect URL

Make sure the redirect URL matches what you added in Google Console:
- Should be: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- Example: `https://pqcmlfudwrlnehnxyltr.supabase.co/auth/v1/callback`

---

## Part 3: Update Your Application (Already Done!)

The code is already implemented! You just need to test it.

### What's Already Implemented:

✅ Google Sign-In buttons on login/register pages
✅ OAuth flow handling
✅ Automatic profile creation
✅ Session management

---

## Testing Google SSO

### Step 1: Clear Browser Data (Recommended)

To test fresh:
1. Open browser DevTools (F12)
2. Go to Application → Clear Storage
3. Click "Clear site data"
4. Or use Incognito/Private window

### Step 2: Test Login with Google

1. Go to: http://localhost:3000/login
2. Click **"Continue with Google"** button
3. Select your Google account (must be in test users list!)
4. Grant permissions
5. You should be redirected to your dashboard

### Expected Result:

- ✅ Logged in successfully
- ✅ Profile created automatically
- ✅ Name from Google account
- ✅ Email from Google account
- ✅ Default role: `student`
- ✅ Status: `Pending Approval` (until admin approves)

---

## Troubleshooting

### Error: "Access blocked: This app's request is invalid"

**Fix:** Make sure you added the correct redirect URI in Google Console:
- `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

### Error: "403: access_denied"

**Fix:** Your email is not in the test users list. Add it:
1. Google Cloud Console → APIs & Services → OAuth consent screen
2. Scroll to "Test users" → Add users
3. Add your email and save

### Error: "Invalid client ID"

**Fix:** Double-check the Client ID in Supabase matches Google Console

### User Created but Wrong Role

**Fix:** Update the profile in Supabase:
```sql
UPDATE public.profiles
SET role = 'mentor'  -- or 'admin'
WHERE email = 'your@email.com';
```

### Can't Login After Google Sign-Up

**Reason:** Account needs admin approval

**Fix:** Have an admin approve your account:
1. Login as admin
2. Go to `/admin/users`
3. Click "Approve" on your account

---

## Production Deployment

When you deploy to production (Vercel):

### 1. Update Google Console

Add production URLs:
- **Authorized JavaScript origins**:
  - `https://your-domain.vercel.app`
- **Authorized redirect URIs**:
  - `https://pqcmlfudwrlnehnxyltr.supabase.co/auth/v1/callback`

### 2. Publish OAuth Consent Screen

1. Google Cloud Console → OAuth consent screen
2. Click **"Publish App"**
3. Your app will be under review (7-10 days)
4. Once approved, anyone can sign in with Google

### 3. Update Supabase Settings

No changes needed - same credentials work for both dev and prod!

---

## Security Notes

- ✅ Client ID is safe to expose (it's in your frontend code)
- ⚠️ Client Secret must stay secret (only in Supabase)
- ✅ Redirect URI must exactly match (security feature)
- ⚠️ In testing mode, only test users can sign in
- ✅ After publishing, anyone can sign in

---

## Benefits of Google SSO

✅ **No password to remember** - users login with Google
✅ **Faster registration** - just click and done
✅ **Email verified automatically** - Google already verified it
✅ **Better security** - Google handles password security
✅ **User trust** - familiar Google sign-in flow

---

## Next Steps

After setting up Google SSO:

1. **Test it yourself** - Sign in with Google
2. **Invite team members** - Add them as test users
3. **Deploy to production** - Update URLs and publish
4. **Add more providers** - GitHub, Facebook, etc. (same process)

---

## Need Help?

- Google Console: https://console.cloud.google.com
- Supabase Docs: https://supabase.com/docs/guides/auth/social-login/auth-google
- Test with your email: cikumel@gmail.com (already in your Google account)
