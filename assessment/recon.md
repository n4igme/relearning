# Reconnaissance Report

**Target**: /Users/nb-dk-0552/Project/relearning (CyberSec Academy)
**Date**: 2026-05-18
**Version**: 2.0.0

## Technology Stack

| Category | Details |
|----------|---------|
| Languages | TypeScript 5.7, SQL |
| Framework | Next.js 15.1 (App Router, Turbopack, Server Actions, Server Components) |
| UI | React 19, shadcn/ui (Radix primitives), Tailwind CSS 3.4, lucide-react icons |
| Database | Supabase (PostgreSQL) via `@supabase/supabase-js` 2.47, `@supabase/ssr` 0.5 |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Payments | Stripe 17.5 (Checkout Sessions + Webhooks) |
| Media | Cloudinary 2.8 (video hosting, file uploads) |
| Validation | Zod 3.24 (declared as dependency, usage TBD) |
| Package Manager | npm (package-lock.json) |
| Testing | Vitest 4.0, Playwright 1.58, Testing Library |
| Deploy | Netlify (netlify.toml), Docker (Dockerfile, docker-compose) |
| Build | standalone output mode, TypeScript errors ignored in build |

## Entry Points

### API Routes

| Method | Path | Handler | Auth Required |
|--------|------|---------|---------------|
| POST | /api/checkout | app/api/checkout/route.ts:17 | Yes (session) |
| POST | /api/webhooks/stripe | app/api/webhooks/stripe/route.ts:20 | No (signature verified) |
| GET | /api/check-user | app/api/check-user/route.ts:5 | Yes (admin only) |

### Server Actions — `lib/actions/auth.ts`

| Function | Line | Auth Required |
|----------|------|---------------|
| signUp | 7 | No |
| signIn | 59 | No |
| signOut | 93 | Yes (implicit) |
| getUser | 100 | No (returns null if unauth) |
| getUserProfile | 108 | No (returns null if unauth) |
| signInWithGoogle | 125 | No |

### Server Actions — `lib/actions/courses.ts`

| Function | Line | Auth Required |
|----------|------|---------------|
| enrollInCourse | 14 | No (trusts caller-supplied studentId) |
| markSubMaterialCompleted | 85 | No (trusts caller-supplied enrollmentId) |
| getStudentEnrollments | 350 | No (trusts caller-supplied studentId) |
| getCourseProgress | 382 | No (trusts caller-supplied enrollmentId) |
| getPublishedCourses | 416 | No |
| getCourseById | 444 | No |
| getMentorCourses | 489 | No (trusts caller-supplied instructorId) |
| createCourse | 522 | No (trusts caller-supplied instructorId) |
| updateCourse | 577 | No (no ownership check) |
| deleteCourse | 615 | No (no ownership check) |
| createMaterial | 636 | No (no ownership check) |
| updateMaterial | 669 | No (no ownership check) |
| deleteMaterial | 696 | No (no ownership check) |
| createSubMaterial | 717 | No (no ownership check) |
| updateSubMaterial | 762 | No (no ownership check) |
| deleteSubMaterial | 795 | No (no ownership check) |
| getAllCoursesAdmin | 816 | No (no admin check) |
| approveCourse | 843 | No (no admin check) |

### Server Actions — `lib/actions/quests.ts`

| Function | Line | Auth Required |
|----------|------|---------------|
| submitQuestAttempt | 13 | No (trusts caller-supplied studentId) |
| getStudentQuestAttempts | 194 | No (trusts caller-supplied studentId) |
| getQuestWithQuestions | 229 | No |
| getCourseQuests | 279 | No |
| canAttemptQuest | 353 | No (trusts caller-supplied studentId) |
| createQuest | 405 | No (no ownership check) |
| updateQuest | 443 | No (no ownership check) |
| deleteQuest | 473 | No (no ownership check) |
| createQuestion | 494 | No (no ownership check) |
| updateQuestion | 529 | No (no ownership check) |
| deleteQuestion | 557 | No (no ownership check) |
| createOption | 578 | No (no ownership check) |
| updateOption | 611 | No (no ownership check) |
| deleteOption | 638 | No (no ownership check) |
| getAllCourseQuests | 659 | No |

### Server Actions — `lib/actions/payments.ts`

| Function | Line | Auth Required |
|----------|------|---------------|
| createPayment | 21 | No (trusts caller-supplied studentId) |
| updatePaymentStatus | 60 | No (no auth check) |
| getPaymentBySessionId | 123 | No |
| getPaymentByIntentId | 143 | No |
| hasStudentPaidForCourse | 163 | No |
| getStudentPayments | 184 | No (trusts caller-supplied studentId) |
| getCoursePayments | 211 | No (no auth check) |

### Server Actions — `lib/actions/enrollment-requests.ts`

| Function | Line | Auth Required |
|----------|------|---------------|
| createEnrollmentRequest | 33 | Yes (getUser) |
| getAllEnrollmentRequests | 133 | Yes (admin role check) |
| getMyEnrollmentRequests | 206 | Yes (getUser) |
| approveEnrollmentRequest | 253 | Yes (admin role check) |
| rejectEnrollmentRequest | 337 | Yes (admin role check) |
| getEnrollmentRequestById | 403 | Yes (owner or admin) |

### Server Actions — `lib/actions/gamification.ts`

| Function | Line | Auth Required |
|----------|------|---------------|
| awardPoints | 11 | No (trusts caller-supplied studentId) |
| checkAndAwardBadges | 80 | No (trusts caller-supplied studentId) |
| updateStreak | 197 | No (trusts caller-supplied studentId) |
| getLeaderboard | 259 | No |
| getStudentRank | 306 | No |
| getStudentBadges | 330 | No |

### Server Actions — `lib/actions/skills.ts`

| Function | Line | Auth Required |
|----------|------|---------------|
| getAllSkills | 10 | No |
| getStudentSkills | 30 | No (trusts caller-supplied studentId) |
| updateSkillProficiency | 52 | No (trusts caller-supplied studentId) |
| getSkillStatistics | 108 | No |
| getSkillsByCategory | 136 | No |

### Server Actions — `lib/actions/tools.ts`

| Function | Line | Auth Required |
|----------|------|---------------|
| getAllTools | 13 | No |
| getToolsByCategory | 50 | No |
| getToolStatistics | 74 | No |

### Inline Server Actions (Page-level)

| Function | File | Line | Auth Required |
|----------|------|------|---------------|
| approveUser | app/admin/users/page.tsx | ~48 | No (no role check in action) |
| rejectUser | app/admin/users/page.tsx | ~62 | No (no role check in action) |
| toggleUserActive | app/admin/users/page.tsx | ~76 | No (no role check in action) |
| handleApprove | app/admin/courses/page.tsx | ~22 | No (no role check in action) |
| handleReject | app/admin/courses/page.tsx | ~28 | No (no role check in action) |

### Pages (Server Components with data fetching)

| Path | File | Role Check |
|------|------|------------|
| / | app/page.tsx | None (public) |
| /login | app/login/page.tsx | None |
| /register | app/register/page.tsx | None |
| /courses | app/courses/page.tsx | None (middleware auth) |
| /courses/[courseId] | app/courses/[courseId]/page.tsx | None |
| /courses/[courseId]/learn | app/courses/[courseId]/learn/page.tsx | student role + enrollment check |
| /courses/[courseId]/enroll | app/courses/[courseId]/enroll/page.tsx | Auth (session) |
| /dashboard | app/dashboard/page.tsx | Auth (middleware) |
| /admin/users | app/admin/users/page.tsx | admin role (page-level) |
| /admin/courses | app/admin/courses/page.tsx | admin role (page-level) |
| /admin/enrollment-requests | app/admin/enrollment-requests/page.tsx | admin role (page-level) |
| /mentor/courses/new | app/mentor/courses/new/page.tsx | mentor role (page-level) |
| /mentor/courses/[courseId] | app/mentor/courses/[courseId]/page.tsx | mentor role + ownership |
| /leaderboard | app/leaderboard/page.tsx | Auth (middleware) |
| /skills | app/skills/page.tsx | Auth (middleware) |
| /gamification | app/gamification/page.tsx | Auth (middleware) |
| /certificates | app/certificates/page.tsx | Auth (middleware) |
| /quests/[questId] | app/quests/[questId]/page.tsx | Auth (middleware) |
| /tools | app/tools/page.tsx | Auth (middleware) |
| /test-db | app/test-db/page.tsx | **None** (no auth) |
| /payment/success | app/payment/success/page.tsx | Auth (middleware) |
| /auth/callback | app/auth/callback/route.ts | None (OAuth callback) |

## Authentication & Authorization

### Auth Mechanism
- **Provider**: Supabase Auth (email/password + Google OAuth)
- **Session management**: Cookie-based via `@supabase/ssr` (server-side client reads cookies)
- **Token type**: Supabase JWT stored in httpOnly cookies managed by SSR helper

### Middleware (`middleware.ts`)
- **Location**: Root `middleware.ts`
- **Behavior**: Checks if user is authenticated via `supabase.auth.getUser()`
- **Protected paths**: `/dashboard`, `/courses`, `/admin`, `/mentor`, `/student`, `/skills`, `/gamification`, `/leaderboard`, `/certificates`, `/quests`, `/payment`
- **Critical gap**: Middleware only checks **authentication** (is user logged in?), NOT **authorization** (is user an admin/mentor/student?)
- **Auth pages**: `/login`, `/register` redirect authenticated users to `/dashboard`

### Role Model
- Three roles: `admin`, `mentor`, `student` (stored in `profiles.role`)
- Role checks happen **only at page render level** (Server Components check `profile.role`)
- Server actions generally do **NOT** verify the caller's role or identity
- RLS policies at DB level provide some protection but are bypassed when server actions use the anon key with the user's session

### Admin Client
- `lib/supabase/admin.ts` creates a client with `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
- Used in: `app/admin/users/page.tsx` (approveUser, rejectUser, toggleUserActive), `app/auth/callback/route.ts` (auto-approve students)

### CSRF Protection
- `/api/checkout` has origin/referer validation
- Server actions rely on Next.js built-in CSRF protection (action ID tokens)
- Stripe webhook uses signature verification

## Data Flow Summary

### Flow 1: User Registration
```
FormData (email, password, full_name, role)
  → signUp() validates email format, password length, role ∈ [student, mentor]
  → supabase.auth.signUp() with user_metadata
  → Supabase creates auth.users entry
  → Trigger/callback creates profiles entry
  → Redirect to login with "check email" message
```

### Flow 2: Course Enrollment (Paid - Stripe)
```
User clicks "Enroll" → POST /api/checkout { courseId }
  → Validates UUID format, checks auth, checks not already enrolled
  → Creates Stripe Checkout Session
  → Creates payment record (status: pending)
  → User pays on Stripe
  → Stripe sends webhook POST /api/webhooks/stripe
  → Verifies signature, handles checkout.session.completed
  → updatePaymentStatus(completed) + enrollInCourse(userId, courseId, skipPaymentCheck=true)
```

### Flow 3: Course Enrollment (Manual Payment)
```
User fills EnrollmentRequestForm (fullName, email, phone, amount, bankAccount, paymentProof)
  → createEnrollmentRequest() [auth: getUser]
  → Admin views /admin/enrollment-requests
  → approveEnrollmentRequest() [auth: admin role check]
  → enrollInCourse(studentId, courseId, skipPaymentCheck=true)
```

### Flow 4: Quiz Submission
```
User answers quiz → submitQuestAttempt(questId, studentId, answers)
  → Fetches quest + questions + correct options
  → Calculates score (earned/total * 100)
  → Checks max_attempts (TOCTOU race condition)
  → Inserts quest_attempt record
  → If passed: awardPoints() + updateStreak() + updateCourseSkills() + checkAndAwardBadges()
```

### Flow 5: Course Content Management (Mentor)
```
Mentor creates course → createCourse(instructorId, data)
  → No auth verification on instructorId
  → Creates materials → createMaterial(courseId, data)
  → Creates lessons → createSubMaterial(materialId, data)
  → Creates quizzes → createQuest(courseId, data) + createQuestion + createOption
  → Publishes → updateCourse(courseId, { is_published: true })
  → Admin approves → approveCourse(courseId, true) [NO admin check]
```

### Flow 6: Admin User Management
```
Admin visits /admin/users (page checks role=admin)
  → Inline server action approveUser(formData) → adminClient.from('profiles').update({ is_approved: true })
  → Uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS)
  → NO role verification inside the server action itself
```

## Business Features

| Feature | Endpoints | Data Lifecycle | Dependencies | Sensitivity |
|---------|-----------|---------------|--------------|-------------|
| User Registration | signUp, /auth/callback, signInWithGoogle | Create → Verify Email → Auto-approve (student) or Admin-approve (mentor) | Supabase Auth, Email service | PII (email, name) |
| Authentication | signIn, signOut, signInWithGoogle, /auth/callback | Login → Session → Logout | Supabase Auth, Google OAuth | Credentials |
| Course Management | createCourse, updateCourse, deleteCourse, createMaterial, createSubMaterial, approveCourse | Create → Edit → Publish → Approve | Cloudinary (videos) | Intellectual property |
| Course Enrollment (Stripe) | POST /api/checkout, POST /api/webhooks/stripe, enrollInCourse | Browse → Pay → Enroll | Stripe, Payments table | Financial |
| Course Enrollment (Manual) | createEnrollmentRequest, approveEnrollmentRequest, rejectEnrollmentRequest | Request → Review → Approve/Reject → Enroll | Admin approval | Financial |
| Learning Progress | markSubMaterialCompleted, updateCourseProgress, getCourseProgress | Start → Track → Complete | Enrollments, Progress tables | Academic integrity |
| Assessments (Quests) | submitQuestAttempt, getQuestWithQuestions, canAttemptQuest | Attempt → Score → Award | Gamification system | Academic integrity |
| Gamification | awardPoints, checkAndAwardBadges, updateStreak, getLeaderboard | Earn → Accumulate → Rank | Quests, Courses | Competitive integrity |
| Skills Tracking | updateSkillProficiency, getStudentSkills | Assess → Level Up | Quests, Courses | Academic record |
| Certificates | generateCertificate (auto on course completion) | Complete → Generate → Verify | Enrollments, Quests | Credential validity |
| Admin - User Mgmt | approveUser, rejectUser, toggleUserActive | Pending → Approve/Reject → Active/Inactive | Admin client (service role) | Account access |
| Admin - Course Mgmt | getAllCoursesAdmin, approveCourse | Review → Approve/Reject | Courses table | Content governance |

## Sensitive Assets

### Database Schema (20+ tables with RLS)

**Core tables:**
- `profiles` — PII: email, full_name, avatar_url, bio, role, is_approved, is_active
- `courses` — title, description, price, instructor_id, is_published, is_approved
- `materials` / `sub_materials` — course content, video URLs, Cloudinary IDs
- `enrollments` — student-course relationships, progress
- `progress` — per-lesson completion tracking
- `quests` / `quest_questions` / `quest_options` — quiz content including correct answers
- `quest_attempts` — student answers (stored as JSONB)
- `certificates` — certificate_number, verification_url, score
- `payments` — amount, currency, stripe_session_id, stripe_payment_intent_id, status

**Gamification tables:**
- `skills` / `student_skills` — proficiency tracking
- `badges` / `student_badges` — achievement records
- `leaderboard_stats` — points, streaks, rankings
- `security_tools` — tool catalog

### Payment/Financial Logic
- Stripe Checkout Sessions (card payments)
- Manual bank transfer workflow with admin approval
- Payment records with status lifecycle: pending → completed/failed/refunded
- Refund handling revokes course access (deletes enrollment)

### PII Handling
- Email, full name stored in `profiles`
- Phone number in `enrollment_requests`
- Payment proof URLs (uploaded images)
- Google profile data (avatar, name) from OAuth

### Admin/Privileged Functionality
- User approval/rejection/deactivation (`SUPABASE_SERVICE_ROLE_KEY`)
- Course approval
- Enrollment request approval (triggers enrollment)
- All admin operations use service role key (bypasses all RLS)

### Secrets Management
- Environment variables in `.env.local` (gitignored)
- `SUPABASE_SERVICE_ROLE_KEY` — full DB access
- `STRIPE_SECRET_KEY` — payment processing
- `STRIPE_WEBHOOK_SECRET` — webhook signature verification
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — exposed to client (by design)
- `CLOUDINARY_CLOUD_NAME` — media access

### File Upload/Download
- Payment proof images (URL stored in `enrollment_requests.payment_proof_url`)
- Course thumbnails (URL in `courses.thumbnail_url`)
- Video content via Cloudinary (`sub_materials.video_url`, `cloudinary_public_id`)
- No server-side file upload handler found (likely client-side direct-to-Cloudinary)

## Attack Surface Notes

1. **Server actions lack authorization**: The vast majority of server actions in `courses.ts`, `quests.ts`, `payments.ts`, `gamification.ts`, and `skills.ts` accept user IDs as parameters without verifying the caller's identity. The middleware only checks authentication, not authorization.

2. **Inline admin server actions unprotected**: `approveUser`, `rejectUser`, `toggleUserActive` in `app/admin/users/page.tsx` use the admin client (service role key) but don't verify the caller is an admin within the action itself. Page-level role checks don't protect the action endpoint.

3. **`skipPaymentCheck` parameter exposed**: `enrollInCourse()` accepts a boolean to skip payment verification. Any caller can set this to `true`.

4. **Race condition in quest attempts**: The max_attempts check (SELECT count → compare → INSERT) is not atomic, allowing concurrent requests to bypass the limit.

5. **`/test-db` page has no auth**: Exposes database connection status and environment variable presence to unauthenticated users.

6. **No security headers configured**: `next.config.js` has no `headers()` configuration — missing CSP, X-Frame-Options, HSTS, etc.

7. **Build ignores type errors and lint**: `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` mean type-safety and lint rules don't gate deployment.

8. **RLS vs Server Actions mismatch**: RLS policies exist but server actions use the user's session (anon key), meaning RLS applies. However, many actions pass arbitrary IDs that don't match `auth.uid()`, which means RLS *should* block some operations — but the `INSERT` policies on tables like `enrollments` only check `student_id = auth.uid()`, not the full context. Actions using the admin client bypass RLS entirely.

9. **Supabase filter injection**: `tools.ts` interpolates user input directly into `.or()` ilike patterns without escaping `%` and `_` wildcards.

10. **Quiz answers fetchable**: `getQuestWithQuestions()` returns full question data including `quest_options` with `is_correct` field visible to any authenticated user (RLS policy: "Quests are viewable by everyone"). The page component (`getQuestWithQuestions`) strips `is_correct` before rendering, but the server action itself returns it.

11. **No rate limiting**: No rate limiting on any endpoint — login, registration, quiz submission, API routes.

12. **Verbose error logging**: `console.error` throughout server actions may leak stack traces in server logs but not to client (low risk).
