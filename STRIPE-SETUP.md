# Stripe Payment Integration Setup Guide

This guide will walk you through setting up Stripe payments for your cybersecurity e-learning platform.

## What Was Implemented

✅ **Complete Stripe Payment Flow:**
- Stripe checkout session creation
- Payment webhook handler for automatic enrollment
- Payment record tracking in database
- Enrollment validation (paid courses require payment)
- Success/error pages
- Updated enrollment button with payment flow

## Files Created/Modified

### New Files
1. **`lib/actions/payments.ts`** - Payment server actions (create, update, get payments)
2. **`app/api/checkout/route.ts`** - Creates Stripe checkout sessions
3. **`app/api/webhooks/stripe/route.ts`** - Handles Stripe webhook events
4. **`app/payment/success/page.tsx`** - Payment success confirmation page

### Modified Files
1. **`lib/actions/courses.ts`** - Updated `enrollInCourse()` to validate payment for paid courses
2. **`components/course-enrollment-button.tsx`** - Handles free vs paid course enrollment

## Prerequisites

1. **Stripe Account**
   - Create account at [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
   - Complete business profile (required for live mode)

2. **Environment Variables**
   - Already configured in your `.env` file
   - Need to replace placeholder values with real Stripe keys

## Step-by-Step Setup

### 1. Get Stripe API Keys

**For Testing (Development):**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Make sure you're in "Test mode" (toggle in sidebar)
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

**Update your `.env` file:**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

### 2. Set Up Webhook Endpoint

Webhooks allow Stripe to notify your app when payments succeed/fail.

**For Local Development (using Stripe CLI):**

1. **Install Stripe CLI:**
   ```bash
   # Windows (using Scoop)
   scoop install stripe

   # Mac (using Homebrew)
   brew install stripe/stripe-cli/stripe

   # Or download from: https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe CLI:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copy the webhook signing secret** (starts with `whsec_`)

5. **Update `.env`:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

**For Production:**

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your production URL:
   ```
   https://your-domain.com/api/webhooks/stripe
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the webhook signing secret
6. Update production environment variables

### 3. Update Course Enrollment Button Usage

Wherever you're using the `CourseEnrollmentButton` component, add the `coursePrice` and `courseCurrency` props:

**Example (`app/courses/[courseId]/page.tsx`):**

```tsx
<CourseEnrollmentButton
  courseId={course.id}
  studentId={user.id}
  isEnrolled={isEnrolled}
  coursePrice={course.price}        // Add this
  courseCurrency={course.currency}  // Add this
/>
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Test the Payment Flow

**Using Stripe Test Cards:**

1. **Navigate to a paid course** (from your seeded courses, e.g., $49.99, $79.99, etc.)

2. **Click "Enroll for $XX.XX"** button

3. **You'll be redirected to Stripe checkout**

4. **Use test card details:**
   - **Successful payment:**
     - Card: `4242 4242 4242 4242`
     - Expiry: Any future date (e.g., `12/25`)
     - CVC: Any 3 digits (e.g., `123`)
     - ZIP: Any 5 digits (e.g., `12345`)

   - **Declined payment:**
     - Card: `4000 0000 0000 0002`

   - **Requires authentication (3D Secure):**
     - Card: `4000 0025 0000 3155`

5. **Complete payment**

6. **You'll be redirected to success page** at `/payment/success`

7. **Check enrollment:**
   - Go to `/dashboard` - course should appear
   - Go to `/courses/[course-slug]/learn` - should have access

### 6. Verify Webhook Processing

**In terminal where `stripe listen` is running:**
- You should see webhook events logged
- Should show `checkout.session.completed` event
- Should show 200 response from your webhook handler

**In Supabase:**
1. Check `payments` table - should have record with `status = 'completed'`
2. Check `enrollments` table - should have enrollment record
3. Check `leaderboard_stats` - streak should be updated

## Testing Checklist

- [ ] Environment variables set correctly
- [ ] Stripe webhook endpoint configured
- [ ] `stripe listen` running (for local dev)
- [ ] Can access course detail page
- [ ] Enrollment button shows correct price
- [ ] Clicking button redirects to Stripe checkout
- [ ] Test payment succeeds
- [ ] Redirected to success page
- [ ] Payment record created in database
- [ ] Enrollment record created in database
- [ ] Can access course learning page
- [ ] Free courses still enroll directly without payment

## Payment Flow Diagram

```
User clicks "Enroll for $XX.XX"
    ↓
POST /api/checkout
    ↓
Create Stripe checkout session
    ↓
Create payment record (status: pending)
    ↓
Redirect to Stripe hosted checkout
    ↓
User enters payment details
    ↓
[Payment Successful]
    ↓
Stripe triggers webhook: checkout.session.completed
    ↓
POST /api/webhooks/stripe
    ↓
Update payment status to "completed"
    ↓
Call enrollInCourse(userId, courseId, skipPaymentCheck=true)
    ↓
Create enrollment record
    ↓
Update streak
    ↓
Redirect to /payment/success
    ↓
User clicks "Start Learning"
    ↓
Access course content
```

## Common Issues & Solutions

### Issue: "Invalid signature" webhook error

**Solution:**
- Make sure `STRIPE_WEBHOOK_SECRET` in `.env` matches the secret from `stripe listen`
- Restart your dev server after updating `.env`
- Check that webhook secret starts with `whsec_`

### Issue: Payment succeeds but no enrollment

**Solution:**
- Check terminal logs for errors
- Verify webhook is being received (check `stripe listen` output)
- Check Supabase logs for errors
- Manually check `payments` table - status should be "completed"
- Check `enrollments` table - should have record

### Issue: "Payment required for this course" when trying to access paid course

**Solution:**
- This is correct behavior! User must pay first
- Check `payments` table for completed payment
- If payment exists, check `enrollments` table
- If both exist, clear browser cache and try again

### Issue: Redirect to payment but stays on same page

**Solution:**
- Check browser console for errors
- Verify `NEXT_PUBLIC_APP_URL` is set correctly in `.env`
- Check network tab - `/api/checkout` should return `200` with `url` field

### Issue: Free courses also redirecting to payment

**Solution:**
- Verify course price is `0` or `null` in database
- Check button component props - `coursePrice` should be `0`
- Clear browser cache

## Database Queries for Debugging

```sql
-- Check payment status
SELECT * FROM payments
WHERE student_id = 'your-user-id'
ORDER BY created_at DESC;

-- Check enrollment status
SELECT * FROM enrollments
WHERE student_id = 'your-user-id'
ORDER BY enrolled_at DESC;

-- Check all payments for a course
SELECT p.*, prof.email, c.title
FROM payments p
JOIN profiles prof ON p.student_id = prof.id
JOIN courses c ON p.course_id = c.id
WHERE c.slug = 'web-app-security-fundamentals';

-- Reset payment for testing (BE CAREFUL!)
UPDATE payments
SET status = 'pending'
WHERE student_id = 'your-user-id'
AND course_id = 'course-id';

-- Delete enrollment for retesting (BE CAREFUL!)
DELETE FROM enrollments
WHERE student_id = 'your-user-id'
AND course_id = 'course-id';
```

## Going Live (Production)

1. **Switch to Live Mode in Stripe:**
   - Toggle to "Live mode" in Stripe Dashboard
   - Get live API keys (start with `pk_live_` and `sk_live_`)

2. **Update Production Environment Variables:**
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
   STRIPE_SECRET_KEY=sk_live_your_live_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
   ```

3. **Set up production webhook endpoint:**
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: Same as test mode

4. **Complete Stripe account activation:**
   - Provide business information
   - Verify bank account
   - Agree to terms

5. **Test with real payment in staging environment first!**

## Security Best Practices

✅ **Already Implemented:**
- Webhook signature verification
- Server-side payment validation
- User authentication required
- Payment status checked before enrollment access
- Secure Stripe secret key handling

🔒 **Additional Recommendations:**
- Never log full Stripe API keys
- Use environment variables (never commit keys to git)
- Implement rate limiting on checkout endpoint
- Monitor for suspicious payment patterns
- Set up Stripe fraud detection rules

## Next Steps

1. **Add Payment History to Dashboard:**
   - Create `/app/dashboard/payments/page.tsx`
   - Use `getStudentPayments()` action
   - Display payment history table

2. **Add Refund Functionality (Admin):**
   - Create admin refund endpoint
   - Update `charge.refunded` webhook handler
   - Optionally revoke course access on refund

3. **Email Notifications:**
   - Send payment confirmation emails
   - Send enrollment confirmation
   - Send receipt

4. **Analytics:**
   - Track revenue per course
   - Monitor payment success rate
   - Identify drop-off points in checkout flow

## Support

If you run into issues:
1. Check Stripe Dashboard logs: https://dashboard.stripe.com/logs
2. Check Stripe webhook logs: https://dashboard.stripe.com/webhooks
3. Check your app logs (terminal output)
4. Check Supabase logs (if using Supabase)

## Testing Credentials Summary

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

**All test cards:**
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

Full list: https://stripe.com/docs/testing

---

**Created:** December 2025
**Status:** ✅ Ready for Testing
