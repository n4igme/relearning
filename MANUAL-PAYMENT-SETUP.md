# Manual Payment Confirmation System - Setup Guide

This guide explains how to set up and use the manual payment confirmation system for your e-learning platform. This system allows you to accept bank transfers and manually approve enrollments - **completely free, no payment gateway fees!**

## Overview

The manual payment system works as follows:

```
Student views paid course
    ↓
Clicks "Enroll for IDR X,XXX"
    ↓
Redirected to payment instructions page
    ↓
Student transfers money to your bank account
    ↓
Student uploads payment proof (screenshot)
    ↓
Request saved as "pending" in database
    ↓
Admin reviews payment proof
    ↓
Admin clicks "Approve & Enroll"
    ↓
Student automatically enrolled in course
    ↓
Student can start learning immediately
```

## Files Created

### Database
- **`database/add-enrollment-requests.sql`** - Database table for enrollment requests

### Server Actions
- **`lib/actions/enrollment-requests.ts`** - All enrollment request logic

### Pages
- **`app/courses/[courseId]/enroll/page.tsx`** - Payment instructions and request form
- **`app/admin/enrollment-requests/page.tsx`** - Admin approval dashboard

### Components
- **`components/enrollment-request-form.tsx`** - Form with payment proof upload
- **`components/admin/enrollment-requests-table.tsx`** - Admin approval interface
- **`components/course-enrollment-button.tsx`** - Updated to redirect to manual payment

## Step-by-Step Setup

### 1. Run Database Migration

**In Supabase SQL Editor:**

```sql
-- Run the enrollment requests table migration
-- Copy and paste contents of: database/add-enrollment-requests.sql
```

This creates:
- `enrollment_requests` table
- Indexes for performance
- Row Level Security policies
- Automatic timestamp updates

### 2. Configure Cloudinary Upload Preset

For students to upload payment proof screenshots, you need to create a Cloudinary upload preset.

1. Go to [Cloudinary Dashboard](https://console.cloudinary.com/)
2. Navigate to **Settings** → **Upload**
3. Scroll to **Upload presets**
4. Click **Add upload preset**
5. Configure:
   - **Upload preset name:** `payment_proofs`
   - **Signing Mode:** Unsigned
   - **Folder:** `enrollment_requests`
   - **Allowed formats:** jpg, png, jpeg, webp
   - **Max file size:** 5 MB
6. Click **Save**

### 3. Update Bank Account Details

Edit the payment instructions in the enrollment page:

**File:** `app/courses/[courseId]/enroll/page.tsx`

Update lines ~80-120 with your actual bank account details:

```tsx
{/* Bank Account 1 */}
<div className="bg-muted/50 rounded-lg p-4 space-y-2">
  <div className="font-semibold text-sm text-muted-foreground">Bank BCA</div>
  <div className="space-y-1">
    <div className="flex justify-between">
      <span className="text-sm">Account Number:</span>
      <span className="font-mono font-semibold">YOUR_BCA_ACCOUNT</span>
    </div>
    <div className="flex justify-between">
      <span className="text-sm">Account Name:</span>
      <span className="font-semibold">YOUR_NAME</span>
    </div>
  </div>
</div>
```

Add more banks or remove banks as needed.

### 4. Set Course Prices

Make sure your courses have prices set in the database:

```sql
-- Example: Set price for a course
UPDATE courses
SET price = 99000, currency = 'IDR'
WHERE slug = 'web-app-security-fundamentals';
```

Indonesian price examples:
- Beginner courses: IDR 49,000 - 99,000
- Intermediate: IDR 149,000 - 249,000
- Advanced: IDR 299,000 - 499,000

### 5. Test the Flow

1. **As a Student:**
   - Browse to a paid course
   - Click "Enroll for IDR X,XXX"
   - You'll see payment instructions
   - Upload a test image as payment proof
   - Submit the form
   - Check you get confirmation message

2. **As Admin:**
   - Go to `/admin/enrollment-requests`
   - See the pending request
   - Click on the payment proof to view
   - Click "Approve & Enroll"
   - Check student is now enrolled

3. **As Student (after approval):**
   - Refresh `/dashboard`
   - Course should appear in "My Courses"
   - Click "Continue Learning"
   - Should have access to all lessons

## Usage Guide

### For Students

#### How to Enroll in a Paid Course

1. **Browse to course page**
2. **Click "Enroll for IDR X,XXX" button**
3. **Transfer the exact amount** to one of the bank accounts shown
4. **Take a screenshot** of your transfer confirmation
5. **Fill in the enrollment form:**
   - Full name
   - Email (pre-filled)
   - Phone number (optional but recommended)
   - Amount paid (should match course price)
   - Bank used (which bank you transferred from)
   - Payment date
   - Transaction reference (if available)
   - Upload payment proof screenshot
   - Add any notes (optional)
6. **Click "Submit Enrollment Request"**
7. **Wait for approval** (usually within 24 hours)
8. **Get notified** when approved
9. **Start learning!**

#### Checking Request Status

Students can check their enrollment request status:
- Go to `/dashboard`
- Pending requests will show at the top
- Status: Pending / Approved / Rejected

### For Admins

#### Reviewing Enrollment Requests

1. **Access admin dashboard:** `/admin/enrollment-requests`

2. **Dashboard shows:**
   - Pending requests (needs action)
   - Approved requests (historical)
   - Rejected requests (historical)

3. **For each request, you can see:**
   - Student name and contact info
   - Course they're enrolling in
   - Amount paid vs course price
   - Bank used
   - Payment date
   - Transaction reference
   - Payment proof screenshot
   - Student notes

4. **To approve a request:**
   - Review payment proof (click to enlarge)
   - Verify amount matches course price
   - Click "Approve & Enroll"
   - Optionally add admin notes
   - Student is immediately enrolled!

5. **To reject a request:**
   - Click "Reject"
   - **Must provide reason** (student will see this)
   - Examples: "Payment amount doesn't match", "Unclear payment proof", "Duplicate request"

#### Admin Checklist for Approvals

Before approving, verify:
- [ ] Payment proof is clear and readable
- [ ] Amount paid matches course price
- [ ] Bank transfer shows successful status
- [ ] Transfer date is recent (not too old)
- [ ] Student name matches bank transfer
- [ ] No duplicate requests for same course

## Database Queries

### Useful Admin Queries

```sql
-- Get all pending requests
SELECT
    er.*,
    p.full_name as student_name,
    p.email,
    c.title as course_title,
    c.price as course_price
FROM enrollment_requests er
JOIN profiles p ON er.student_id = p.id
JOIN courses c ON er.course_id = c.id
WHERE er.status = 'pending'
ORDER BY er.created_at ASC;

-- Get all requests for a specific course
SELECT
    er.*,
    p.full_name as student_name
FROM enrollment_requests er
JOIN profiles p ON er.student_id = p.id
WHERE er.course_id = 'YOUR_COURSE_ID'
ORDER BY er.created_at DESC;

-- Check if student has pending request
SELECT * FROM enrollment_requests
WHERE student_id = 'USER_ID'
AND course_id = 'COURSE_ID'
AND status = 'pending';

-- Get enrollment stats
SELECT
    status,
    COUNT(*) as count,
    SUM(amount_paid) as total_amount
FROM enrollment_requests
GROUP BY status;
```

## Troubleshooting

### Issue: "Failed to upload image"

**Possible causes:**
1. Cloudinary upload preset not created
2. Upload preset name doesn't match (`payment_proofs`)
3. Cloudinary cloud name not set in `.env`

**Solution:**
- Check `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in `.env`
- Verify upload preset exists and is "Unsigned"
- Check browser console for specific error

### Issue: Student can't submit form

**Possible causes:**
1. Payment proof not uploaded
2. Required fields not filled
3. Already has pending request

**Solution:**
- All fields marked with * are required
- Payment proof must be uploaded before submit
- Check if student already submitted (shows alert)

### Issue: Admin can't approve request

**Possible causes:**
1. Not logged in as admin
2. Request already processed
3. Database error

**Solution:**
- Verify user role is 'admin' in profiles table
- Check request status (must be 'pending')
- Check browser console and server logs

### Issue: Student not enrolled after approval

**Possible causes:**
1. Enrollment creation failed
2. Student already enrolled
3. Course not found

**Solution:**
- Check `enrollments` table for record
- Check server logs for errors
- Verify course exists and is published

### Issue: Payment proof image not loading

**Possible causes:**
1. Cloudinary URL invalid
2. Image was deleted from Cloudinary
3. Network issue

**Solution:**
- Try opening URL directly in browser
- Check if image exists in Cloudinary dashboard
- Re-upload if necessary

## Security Considerations

✅ **Already Implemented:**
- Row Level Security (RLS) on enrollment_requests table
- Students can only see their own requests
- Only admins can approve/reject
- Image upload size limit (5MB)
- File type validation (images only)
- Duplicate request prevention
- Authentication required

🔒 **Best Practices:**
- Regularly review pending requests (don't let them pile up)
- Keep payment proofs for audit trail
- Add notes when rejecting to help students
- Monitor for suspicious patterns (same payment proof used multiple times)
- Back up enrollment_requests table regularly

## Email Notifications (Optional Enhancement)

Currently, there are no automatic email notifications. You can add them:

1. **When student submits request:**
   - Send confirmation email to student
   - Notify admin of new request

2. **When admin approves:**
   - Send approval email to student
   - Include link to start learning

3. **When admin rejects:**
   - Send rejection email with reason
   - Include instructions to correct and resubmit

To implement, add email sending logic in:
- `lib/actions/enrollment-requests.ts` - `createEnrollmentRequest()`
- `lib/actions/enrollment-requests.ts` - `approveEnrollmentRequest()`
- `lib/actions/enrollment-requests.ts` - `rejectEnrollmentRequest()`

## Scaling Considerations

**Current system is suitable for:**
- Up to 100 enrollments per month
- 1-2 admins reviewing requests
- Manual review is manageable

**If you grow beyond this:**
- Add automated payment verification (integrate with bank API)
- Multiple admin approvers with assignment system
- Automated fraud detection
- WhatsApp notifications
- Eventually, upgrade to Midtrans or Xendit

## Comparison: Manual vs Automated

### Manual Payment (Current)

**Pros:**
- ✅ Zero transaction fees
- ✅ Simple to implement
- ✅ Works with any bank
- ✅ No API complexity
- ✅ Full control

**Cons:**
- ❌ Manual review required
- ❌ Delays in enrollment (up to 24 hours)
- ❌ Not scalable beyond ~100/month
- ❌ Requires admin availability

### Automated (Midtrans/Xendit)

**Pros:**
- ✅ Instant enrollment
- ✅ Fully automated
- ✅ Scalable to thousands
- ✅ Multiple payment methods
- ✅ Professional checkout

**Cons:**
- ❌ ~2.9% transaction fee
- ❌ More complex integration
- ❌ API dependencies

**Recommendation:** Start with manual, switch to automated when earning IDR 10,000,000+/month

## Migration Path to Automated

When ready to upgrade:

1. The `payments` table already exists
2. Add Midtrans/Xendit integration
3. Keep manual system as backup
4. Offer both options to students
5. Eventually deprecate manual system

The architecture supports both!

## Support

### Admin Dashboard Access

Make sure you have an admin account:

```sql
-- Make yourself admin
UPDATE profiles
SET role = 'admin', is_approved = true
WHERE email = 'your@email.com';
```

Then access: `/admin/enrollment-requests`

### Adding Navigation Link

Add a link to admin menu/sidebar:

```tsx
{profile.role === 'admin' && (
  <Link href="/admin/enrollment-requests">
    Enrollment Requests
  </Link>
)}
```

---

**Created:** December 2025
**System:** Manual Payment Confirmation
**Status:** ✅ Ready to Use
**Cost:** FREE (no transaction fees!)

## Next Steps

1. ✅ Run database migration
2. ✅ Configure Cloudinary upload preset
3. ✅ Update bank account details
4. ✅ Set course prices
5. ✅ Test the flow
6. ✅ Start accepting enrollments!

Good luck with your e-learning platform! 🚀
