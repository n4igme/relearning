# Reconnaissance Report

**Target**: /Users/nb-dk-0552/Project/relearning
**Date**: 2026-05-20

## Technology Stack

| Category | Details |
|----------|---------|
| Languages | TypeScript 5.7, SQL |
| Frameworks | Next.js 15 (App Router), React 19 |
| UI | shadcn/ui (Radix UI), Tailwind CSS 3.4 |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Auth | Supabase Auth (@supabase/ssr ^0.5.2, @supabase/supabase-js ^2.47.10) |
| Payments | Stripe ^17.5.0 |
| Media | Cloudinary ^2.8.0 |
| Validation | Zod ^3.24.1 |
| Testing | Vitest ^4.0.18, Playwright ^1.58.0, fast-check ^4.5.3 |
| Deploy | Netlify, Docker (standalone output) |
| Package Manager | npm (package-lock.json) |

## Entry Points

### API Routes

| Method | Path | Handler | Auth Required |
|--------|------|---------|---------------|
| GET | /api/check-user | app/api/check-user/route.ts:4 | Yes (admin only) |
| POST | /api/checkout | app/api/checkout/route.ts:18 | Yes (authenticated user) |
| POST | /api/webhooks/stripe | app/api/webhooks/stripe/route.ts:18 | No (Stripe signature verification) |
| GET | /auth/callback | app/auth/callback/route.ts:7 | No (OAuth/email callback) |

### Server Actions (lib/actions/)

| File | Key Functions | Auth Required |
|------|---------------|---------------|
| auth.ts | signUp, signIn, signOut, signInWithGoogle, requestPasswordReset, updatePassword, getUser, getUserProfile | Varies (signUp/signIn: No; others: Yes) |
| courses.ts | enrollInCourse, enrollInCourseInternal, markSubMaterialCompleted, createCourse, updateCourse, deleteCourse, createMaterial, updateMaterial, deleteMaterial, createSubMaterial, updateSubMaterial, deleteSubMaterial, approveCourse, getAllCoursesAdmin | Yes (role-dependent) |
| payments.ts | createPayment, updatePaymentStatus, getPaymentBySessionId, getPaymentByIntentId, hasStudentPaidForCourse, getStudentPayments, getCoursePayments | Yes |
| gamification.ts | awardPoints, checkAndAwardBadges, updateStreak, getLeaderboard, getStudentRank, getStudentBadges | Yes |
| quests.ts | submitQuestAttempt, getStudentQuestAttempts, getQuestWithQuestions, getCourseQuests, canAttemptQuest, createQuest, updateQuest, deleteQuest, createQuestion, updateQuestion, deleteQuestion, createOption, updateOption, deleteOption, getAllCourseQuests | Yes (role-dependent) |
| skills.ts | getAllSkills, getStudentSkills, updateSkillProficiency, getSkillStatistics, getSkillsByCategory | Yes |
| tools.ts | getAllTools, getToolsByCategory, getToolStatistics | Yes |
| enrollment-requests.ts | createEnrollmentRequest, getAllEnrollmentRequests, getMyEnrollmentRequests, approveEnrollmentRequest, rejectEnrollmentRequest, getEnrollmentRequestById | Yes (role-dependent) |

### Pages (App Router)

| Path | Auth | Role |
|------|------|------|
| / | No | Public |
| /login | No | Public |
| /register | No | Public |
| /forgot-password | No | Public |
| /reset-password | No | Public |
| /resend-verification | No | Public |
| /dashboard | Yes | Any |
| /courses | Yes | Any |
| /courses/[slug] | Yes | Any |
| /skills | Yes | Any |
| /gamification | Yes | Any |
| /leaderboard | Yes | Any |
| /certificates | Yes | Any |
| /quests/[questId] | Yes | Any |
| /tools | Yes | Any |
| /payment/success | Yes | Any |
| /admin/users | Yes | Admin |
| /admin/courses | Yes | Admin |
| /admin/enrollment-requests | Yes | Admin |
| /mentor/courses | Yes | Mentor/Admin |

## Authentication & Authorization

### Mechanism
- **Supabase Auth** with email/password and Google OAuth
- Session managed via HTTP-only cookies (`@supabase/ssr`)
- Token validated server-side via `supabase.auth.getUser()` (not `getSession()`)

### Middleware (middleware.ts)
- Runs on all routes except static assets
- **Protected paths**: /dashboard, /courses, /admin, /mentor, /student, /skills, /gamification, /leaderboard, /certificates, /quests, /payment
- **Role enforcement**: /admin → admin only; /mentor → mentor or admin
- **Account status checks**: blocks deactivated users (`is_active=false`), blocks unapproved users from protected content
- Redirects authenticated users away from /login, /register

### Role Model
- **admin**: Full access, user management, course approval, enrollment request approval
- **mentor**: Course creation/editing, quiz management (own courses only)
- **student**: Enrollment, learning, quiz attempts, gamification

### Auth Gaps Observed
- `updateMaterial`, `deleteMaterial`, `createSubMaterial`, `updateSubMaterial`, `deleteSubMaterial` — no ownership verification (only `createMaterial` checks course ownership)
- `createQuestion`, `updateQuestion`, `deleteQuestion`, `createOption`, `updateOption`, `deleteOption` — no ownership verification
- `getStudentSkills`, `getStudentQuestAttempts` — no verification that caller is the student or admin
- `getStudentPayments`, `getCoursePayments` — no authorization check on who can view payments
- `getAllCoursesAdmin` — no admin role check in the function itself (relies on page-level middleware)

## Data Flow Summary

### Registration Flow
1. User submits form → `signUp()` server action
2. Rate limit check (3/hour per email)
3. Email/password validation
4. Role validation (student/mentor only)
5. `supabase.auth.signUp()` → email confirmation sent
6. On email confirm → `/auth/callback` → auto-approves students, mentors need admin approval

### Payment Flow
1. Student clicks checkout → POST `/api/checkout`
2. Rate limit (5/min per IP), CSRF origin check
3. UUID validation on courseId
4. Auth check, enrollment/payment duplicate check
5. Stripe checkout session created with metadata (userId, courseId)
6. Payment record created in DB (status: pending)
7. Stripe webhook → POST `/api/webhooks/stripe`
8. Signature verification → `updatePaymentStatus` + `enrollInCourseInternal`

### Quiz Submission Flow
1. Student submits answers → `submitQuestAttempt()`
2. Auth verification (caller = studentId)
3. UUID + answers format validation (Zod)
4. Max attempts check (pre-insert)
5. Score calculation against correct options
6. Attempt saved to DB
7. Race condition guard (post-insert max attempts check)
8. If passed: award points, update streak, update skills, check badges

### Course Update Flow
1. Mentor submits update → `updateCourse()`
2. Auth check (caller = course instructor)
3. Zod schema validation
4. **Field allowlist** applied: only title, description, thumbnail_url, difficulty, category, price, learning_objectives, prerequisites, is_published
5. Update executed with sanitized data

## Business Features

| Feature | Endpoints | Data Lifecycle | Dependencies | Sensitivity |
|---------|-----------|---------------|--------------|-------------|
| User Registration | signUp, signIn, signInWithGoogle, /auth/callback | Create → Verify → Approve → Active | Supabase Auth, Email | PII (email, name) |
| Password Reset | requestPasswordReset, updatePassword, /auth/callback | Request → Email → Reset | Supabase Auth, Email | Auth credential |
| Course Management | createCourse, updateCourse, deleteCourse, approveCourse | Create → Edit → Publish → Approve | Cloudinary (media) | Business content |
| Course Enrollment | enrollInCourse, enrollInCourseInternal | Payment → Enroll → Progress → Complete | Payments, Gamification | Financial |
| Stripe Payments | POST /api/checkout, POST /api/webhooks/stripe | Create → Pending → Completed/Failed/Refunded | Stripe, Enrollment | Financial |
| Manual Payments | createEnrollmentRequest, approveEnrollmentRequest, rejectEnrollmentRequest | Submit → Review → Approve/Reject → Enroll | Admin approval | Financial, PII |
| Learning Progress | markSubMaterialCompleted, updateCourseProgress | Start → Progress → Complete → Certificate | Gamification, Skills | Academic |
| Quiz System | submitQuestAttempt, createQuest, createQuestion, createOption | Create → Publish → Attempt → Score | Gamification, Skills | Academic integrity |
| Gamification | awardPoints, checkAndAwardBadges, updateStreak | Activity → Points → Badges → Leaderboard | Courses, Quests | Competitive |
| Skills Tracking | updateSkillProficiency, getStudentSkills | Quiz/Course → Assess → Level Up | Quests, Courses | Academic |
| Admin User Mgmt | approveUser, rejectUser (inline actions in admin/users/page.tsx) | Register → Pending → Approve/Reject | Admin client (service role) | Access control |
| Certificate Gen | generateCertificate (internal) | Course complete + quiz pass → Issue | Courses, Quests | Academic credential |

## Sensitive Assets

### Database Schema (20+ tables with RLS)
- **profiles**: id, email, full_name, role, avatar_url, bio, is_approved, is_active
- **courses**: instructor_id, title, price, is_published, is_approved
- **enrollments**: student_id, course_id, progress_percentage, completed_at
- **payments**: student_id, course_id, amount, status, stripe_payment_intent_id, stripe_session_id
- **enrollment_requests**: student_id, full_name, email, phone_number, amount_paid, bank_account_used, payment_proof_url, payment_reference
- **quest_attempts**: student_id, quest_id, score, passed, answers
- **quest_options**: is_correct (answer key)
- **certificates**: student_id, certificate_number, verification_url
- **leaderboard_stats**: total_points, badges_earned, current_streak_days
- **student_skills**: proficiency_level, points_earned
- **student_badges**: badge_id, evidence
- **audit_log**: actor_id, action, target_type, target_id, details

### Privileged Operations
- **Admin client** (`lib/supabase/admin.ts`): Uses `SUPABASE_SERVICE_ROLE_KEY`, bypasses RLS
- **User approval/rejection**: Admin can approve/reject users, confirm emails
- **Course approval**: Admin can approve/reject courses for publication
- **Enrollment approval**: Admin can approve manual payment enrollment requests
- **Internal enrollment**: `enrollInCourseInternal()` skips payment verification (used by webhooks/admin)

### Secrets Management
- Environment variables in `.env.local` (gitignored)
- Keys: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLOUDINARY_CLOUD_NAME`
- Service role key used server-side only in `lib/supabase/admin.ts`

### Security Headers (next.config.js)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- HSTS: max-age=31536000; includeSubDomains
- CSP: default-src 'self'; script-src includes 'unsafe-inline' 'unsafe-eval'; connect-src allows *.supabase.co

### Rate Limiting
- In-memory store (`Map`) — not distributed (resets on restart, per-instance only)
- Login: 5 attempts/min per email
- Signup: 3 attempts/hour per email
- Checkout: 5 attempts/min per IP

## Attack Surface Notes

1. **Missing authorization on sub-resource mutations**: `updateMaterial`, `deleteMaterial`, `createSubMaterial`, `updateSubMaterial`, `deleteSubMaterial`, `createQuestion`, `updateQuestion`, `deleteQuestion`, `createOption`, `updateOption`, `deleteOption` — any authenticated user could potentially modify any course's content if they know the IDs (relies on RLS only)

2. **IDOR potential on read operations**: `getStudentSkills(studentId)`, `getStudentQuestAttempts(studentId)`, `getStudentPayments(studentId)`, `getCoursePayments(courseId)` — accept arbitrary IDs without verifying caller authorization at the application layer

3. **Race condition in quiz attempts**: Post-insert check for max_attempts has a TOCTOU window; concurrent requests could exceed the limit before the guard triggers

4. **In-memory rate limiting**: Not effective in multi-instance deployments; resets on server restart; trivially bypassed with distributed requests

5. **CSP allows unsafe-inline and unsafe-eval**: Weakens XSS protection significantly

6. **Checkout CSRF protection**: Only checks `origin`/`referer` headers against `NEXT_PUBLIC_APP_URL`; if env var is unset, the check is skipped entirely

7. **Admin client exposure risk**: `createAdminClient()` is importable from any server-side code; no additional guardrails beyond developer discipline

8. **Quiz answer exposure**: `getQuestWithQuestions()` returns questions without `is_correct` field (good), but `getAllCourseQuests()` returns full answers — authorization check exists but worth verifying

9. **Enrollment request PII**: Contains phone_number, bank_account_used, payment_proof_url — sensitive financial/personal data in a single table

10. **No input sanitization on search**: `getAllTools()` escapes SQL LIKE wildcards (good), but other text inputs (course descriptions, student notes) flow directly to Supabase without HTML sanitization — potential stored XSS if rendered unsafely

11. **Password reset flow**: No rate limiting on `requestPasswordReset` — potential for email flooding

12. **Webhook endpoint**: Properly validates Stripe signature, but error responses leak internal state via `console.error` (not exposed to client, but logged)

13. **TypeScript build errors ignored**: `ignoreBuildErrors: true` in next.config.js — type safety gaps may hide runtime issues
