# Security Reconnaissance Report — RE-learning Platform

**Target:** `/Users/nb-dk-0552/Project/relearning`
**Date:** 2026-05-21
**Version:** 2.0.0

---

## 1. Technology Stack

| Category | Details | Version | Notes |
|----------|---------|---------|-------|
| Framework | Next.js (App Router) | ^16.2.6 | Turbopack dev, standalone output for Docker |
| Language | TypeScript | ^5.7.2 | `ignoreBuildErrors: true` in next.config.js |
| Runtime | Node.js | — | Serverless (Netlify) + Docker |
| UI | Radix UI + Tailwind CSS | tailwindcss ^3.4.17 | shadcn/ui pattern |
| Database | PostgreSQL (Supabase) | — | 20+ tables, RLS enabled |
| Auth | Supabase Auth (@supabase/ssr) | ^0.5.2 | Email/password + Google OAuth |
| Supabase Client | @supabase/supabase-js | ^2.47.10 | Server, client, admin clients |
| Payments | Stripe | ^17.5.0 | Checkout Sessions + Webhooks |
| Media | Cloudinary | ^2.8.0 | Video/document hosting |
| Validation | Zod | ^3.24.1 | Used in courses.ts, quests.ts |
| Testing | Vitest + Playwright | vitest ^4.0.18, playwright ^1.58.0 | Unit, integration, e2e, security |
| Linting | ESLint | ^9.17.0 | next config |
| Deploy | Netlify / Docker | — | standalone output mode |

---

## 2. Entry Points — API Routes

| Method | Path | Handler File:Line | Auth Required | Rate Limited |
|--------|------|-------------------|---------------|--------------|
| POST | `/api/checkout` | `app/api/checkout/route.ts:22` | Yes (session) | Yes — 5/min per IP |
| GET | `/api/check-user` | `app/api/check-user/route.ts:4` | Yes (admin only) | No |
| POST | `/api/webhooks/stripe` | `app/api/webhooks/stripe/route.ts:18` | No (signature verified) | No |
| GET | `/auth/callback` | `app/auth/callback/route.ts:7` | No (code exchange) | No |

---

## 3. Entry Points — Server Actions

### `lib/actions/auth.ts`

| Function | Line | Auth Mechanism | Notes |
|----------|------|----------------|-------|
| `signUp` | 7 | None (public) | Rate limited 3/hr per email |
| `signIn` | 47 | None (public) | Rate limited 5/min per email |
| `signOut` | 82 | Session (getUser) | — |
| `getUser` | 88 | Session | Returns user or null |
| `getUserProfile` | 95 | Session | Returns profile or null |
| `signInWithGoogle` | 119 | None (public) | OAuth redirect |
| `requestPasswordReset` | 140 | None (public) | Rate limited 3/hr per email |
| `updatePassword` | 158 | Session (active session required) | Validates length, match |

### `lib/actions/courses.ts`

| Function | Line | Auth Mechanism | Notes |
|----------|------|----------------|-------|
| `enrollInCourse` | 42 | Session — verifies user.id === studentId | Payment verified for paid courses |
| `enrollInCourseInternal` | 95 | Admin-only guard | Used by webhook/admin flows |
| `markSubMaterialCompleted` | 127 | Session — verifies enrollment ownership | Min 30s time_spent |
| `getStudentEnrollments` | 195 | Session (implicit via RLS) | No explicit auth check |
| `getCourseProgress` | 220 | Session (implicit via RLS) | No explicit auth check |
| `getPublishedCourses` | 245 | None (public data) | Only published+approved |
| `getCourseById` | 268 | Session — blocks unapproved unless owner/admin | — |
| `getMentorCourses` | 313 | Session (implicit via RLS) | No explicit auth check |
| `createCourse` | 340 | Session — verifies user.id === instructorId | Zod validated |
| `updateCourse` | 385 | Session — verifies course ownership | Field allowlist enforced |
| `deleteCourse` | 425 | Session — verifies course ownership | — |
| `createMaterial` | 445 | Session — verifies course ownership | — |
| `updateMaterial` | 474 | Session (implicit via RLS) | No explicit ownership check |
| `deleteMaterial` | 495 | Session (implicit via RLS) | No explicit ownership check |
| `createSubMaterial` | 511 | Session (implicit via RLS) | No explicit ownership check |
| `updateSubMaterial` | 547 | Session (implicit via RLS) | No explicit ownership check |
| `deleteSubMaterial` | 571 | Session (implicit via RLS) | No explicit ownership check |
| `getAllCoursesAdmin` | 587 | Session (implicit via RLS) | No explicit admin check |
| `approveCourse` | 612 | Session — verifies admin role | — |

### `lib/actions/payments.ts`

| Function | Line | Auth Mechanism | Notes |
|----------|------|----------------|-------|
| `createPayment` | 20 | Session (implicit via RLS) | No explicit auth check |
| `updatePaymentStatus` | 49 | Admin client (service role) | Called from webhooks |
| `getPaymentBySessionId` | 95 | Session (implicit via RLS) | — |
| `getPaymentByIntentId` | 111 | Session (implicit via RLS) | — |
| `hasStudentPaidForCourse` | 127 | Session (implicit via RLS) | — |
| `getStudentPayments` | 143 | Session — verifies caller is student or admin | — |
| `getCoursePayments` | 168 | Session (implicit via RLS) | No explicit ownership check |

### `lib/actions/gamification.ts`

| Function | Line | Auth Mechanism | Notes |
|----------|------|----------------|-------|
| `awardPoints` | 11 | Session (implicit) | Called internally from other actions |
| `checkAndAwardBadges` | 72 | Session (implicit) | Called internally |
| `updateStreak` | 137 | Session (implicit) | Called internally |
| `getLeaderboard` | 185 | Session (implicit via RLS) | No explicit auth check |
| `getStudentRank` | 222 | Session (implicit via RLS) | No explicit auth check |
| `getStudentBadges` | 242 | Session (implicit via RLS) | No explicit auth check |

### `lib/actions/quests.ts`

| Function | Line | Auth Mechanism | Notes |
|----------|------|----------------|-------|
| `submitQuestAttempt` | 16 | Session — verifies user.id === studentId | UUID + answers validated; max_attempts enforced |
| `getStudentQuestAttempts` | 148 | Session — verifies user.id === studentId | — |
| `getQuestWithQuestions` | 178 | Session (implicit via RLS) | No explicit auth check |
| `getCourseQuests` | 213 | Session (implicit via RLS) | Only published quests |
| `canAttemptQuest` | 268 | Session (implicit via RLS) | Checks enrollment + attempts |
| `createQuest` | 302 | Session — verifies course ownership | — |
| `updateQuest` | 333 | Session — verifies course ownership | — |
| `deleteQuest` | 358 | Session — verifies course ownership | — |
| `createQuestion` | 378 | Session (implicit via RLS) | No explicit ownership check |
| `updateQuestion` | 402 | Session (implicit via RLS) | No explicit ownership check |
| `deleteQuestion` | 422 | Session (implicit via RLS) | No explicit ownership check |
| `createOption` | 438 | Session (implicit via RLS) | Stores is_correct via admin client |
| `updateOption` | 466 | Session (implicit via RLS) | Updates is_correct via admin client |
| `deleteOption` | 498 | Session (implicit via RLS) | — |
| `getAllCourseQuests` | 514 | Session — verifies course ownership | Includes correct answers |

### `lib/actions/skills.ts`

| Function | Line | Auth Mechanism | Notes |
|----------|------|----------------|-------|
| `getAllSkills` | 7 | Session (implicit via RLS) | Public read |
| `getStudentSkills` | 23 | Session (implicit via RLS) | — |
| `updateSkillProficiency` | 44 | Blocks direct student calls | Only internal/admin |
| `getSkillStatistics` | 103 | Session (implicit via RLS) | — |
| `getSkillsByCategory` | 123 | Session (implicit via RLS) | — |

### `lib/actions/tools.ts`

| Function | Line | Auth Mechanism | Notes |
|----------|------|----------------|-------|
| `getAllTools` | 11 | Session (implicit via RLS) | Escapes LIKE wildcards |
| `getToolsByCategory` | 47 | Session (implicit via RLS) | — |
| `getToolStatistics` | 72 | Session (implicit via RLS) | — |

### `lib/actions/enrollment-requests.ts`

| Function | Line | Auth Mechanism | Notes |
|----------|------|----------------|-------|
| `createEnrollmentRequest` | 33 | Session — getUser() | Checks existing enrollment/pending |
| `getAllEnrollmentRequests` | 100 | Session — verifies admin role | — |
| `getMyEnrollmentRequests` | 145 | Session — getUser() | Own requests only |
| `approveEnrollmentRequest` | 177 | Session — verifies admin role | Enrolls student internally |
| `rejectEnrollmentRequest` | 237 | Session — verifies admin role | — |
| `getEnrollmentRequestById` | 285 | Session — verifies owner or admin | — |

---

## 4. Pages

| Path | Auth Required | Role | File |
|------|---------------|------|------|
| `/` | No | Any | `app/page.tsx` |
| `/login` | No (redirects if authed) | Any | `app/login/page.tsx` |
| `/register` | No (redirects if authed) | Any | `app/register/page.tsx` |
| `/forgot-password` | No | Any | `app/forgot-password/page.tsx` |
| `/reset-password` | No | Any | `app/reset-password/page.tsx` |
| `/resend-verification` | No | Any | `app/resend-verification/page.tsx` |
| `/dashboard` | Yes | Any | `app/dashboard/page.tsx` |
| `/courses` | Yes | Any | `app/courses/page.tsx` |
| `/courses/[courseId]` | Yes | Any | `app/courses/[courseId]/page.tsx` |
| `/courses/[courseId]/learn` | Yes | Any (enrolled) | `app/courses/[courseId]/learn/page.tsx` |
| `/courses/[courseId]/enroll` | Yes | Any | `app/courses/[courseId]/enroll/page.tsx` |
| `/quests/[questId]` | Yes | Any (enrolled) | `app/quests/[questId]/page.tsx` |
| `/skills` | Yes | Any | `app/skills/page.tsx` |
| `/gamification` | Yes | Any | `app/gamification/page.tsx` |
| `/leaderboard` | Yes | Any | `app/leaderboard/page.tsx` |
| `/certificates` | Yes | Any | `app/certificates/page.tsx` |
| `/tools` | Yes | Any | `app/tools/page.tsx` |
| `/payment/success` | Yes | Any | `app/payment/success/page.tsx` |
| `/admin/courses` | Yes | admin | `app/admin/courses/page.tsx` |
| `/admin/users` | Yes | admin | `app/admin/users/page.tsx` |
| `/admin/enrollment-requests` | Yes | admin | `app/admin/enrollment-requests/page.tsx` |
| `/mentor/courses/new` | Yes | mentor/admin | `app/mentor/courses/new/page.tsx` |
| `/mentor/courses/[courseId]` | Yes | mentor/admin | `app/mentor/courses/[courseId]/page.tsx` |

Middleware-enforced protected paths: `/dashboard`, `/courses`, `/admin`, `/mentor`, `/student`, `/skills`, `/gamification`, `/leaderboard`, `/certificates`, `/quests`, `/payment`

---

## 5. Authentication & Authorization

### Mechanism
- **Supabase Auth** with `@supabase/ssr` for cookie-based sessions
- Email/password signup + Google OAuth (students only)
- Password reset via email link → `/auth/callback?next=/reset-password`

### Middleware (`middleware.ts`)
- Runs on all routes except static assets (matcher regex)
- Creates Supabase server client, calls `getUser()` to validate JWT
- **Protected paths:** Redirects unauthenticated users to `/login`
- **Role enforcement:** `/admin/*` → admin only; `/mentor/*` → mentor or admin
- **Deactivated users:** Signs out and redirects with error
- **Unapproved users:** Signs out and redirects with error
- **Auth pages:** Redirects authenticated users to `/dashboard`

### Role Model
| Role | Source | Approval |
|------|--------|----------|
| `student` | Default on signup | Auto-approved after email confirmation (via auth callback) |
| `mentor` | Selected at signup | Requires admin approval |
| `admin` | DB trigger auto-approves | Created via seed script |

### DB Triggers
1. **`handle_new_user()`** — `AFTER INSERT ON auth.users`: Creates profile row with role from `raw_user_meta_data`, auto-approves admins only
2. **`prevent_self_privilege_change()`** — `BEFORE UPDATE ON profiles`: Blocks users from changing own `role`, `is_approved`, `is_active`
3. **`update_updated_at_column()`** — On all major tables
4. **`check_quest_max_attempts()`** — `BEFORE INSERT ON quest_attempts`: Atomic max attempts enforcement
5. **`update_enrollment_request_updated_at()`** — On enrollment_requests

### RLS Summary
| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | All (public) | Own (uid=id) | Own (uid=id) | — |
| courses | Published OR own OR admin | Mentor/admin | Own OR admin | — |
| materials | Enrolled OR instructor OR admin | Instructor (own course) | Instructor (own course) | Instructor (own course) |
| sub_materials | Preview=public; Full=enrolled/instructor/admin | Instructor (own course) | Instructor (own course) | Instructor (own course) |
| enrollments | Own (student_id=uid) | Own | — | — |
| progress | Own enrollment | Own enrollment | — | — |
| quests | All authenticated | Instructor (own course) | Instructor (own course) | Instructor (own course) |
| quest_questions | All authenticated | Instructor (own course) | Instructor (own course) | Instructor (own course) |
| quest_options | Authenticated | Instructor (own course) | Instructor (own course) | Instructor (own course) |
| quest_correct_options | Instructor (own course) OR admin | Instructor (own course) | Instructor (own course) | — |
| quest_attempts | Own (student_id=uid) | Own | — | — |
| certificates | All (public verification) | — | — | — |
| payments | Own OR admin OR instructor (own course) | Own | Admin | — |
| enrollment_requests | Own OR admin/mentor | Own | Own (pending) OR admin | — |
| skills | All (public) | Admin | Admin | Admin |
| student_skills | Own OR admin/mentor | Own | Own OR admin | — |
| badges | All (public) | Admin | Admin | Admin |
| student_badges | Own OR admin/mentor | Admin | — | — |
| leaderboard_stats | Authenticated | Admin | Admin | Admin |
| security_tools | All (public) | Admin | Admin | Admin |
| course_skills | All (public) | Instructor (own course) | Instructor (own course) | Instructor (own course) |
| rate_limits | Service role only | Service role only | — | Service role only |

---

## 6. Data Flow Summary

### Registration Flow
1. User submits form → `signUp()` (`lib/actions/auth.ts:7`)
2. Rate limit check (3/hr per email)
3. Input validation (email regex, password length ≥8, role ∈ {student, mentor})
4. `supabase.auth.signUp()` → creates auth.users row
5. DB trigger `handle_new_user()` → creates profiles row (is_approved=false)
6. User receives confirmation email → clicks link → `/auth/callback`
7. Callback exchanges code for session, auto-approves students via admin client
8. Mentors remain unapproved until admin action

### Google OAuth Flow
1. `signInWithGoogle()` → redirects to Google
2. Google redirects to `/auth/callback` with code
3. Callback exchanges code, checks/creates profile (role=student, is_approved=false)
4. Auto-approves student, redirects to `/dashboard`
5. Non-student roles blocked from Google SSO

### Stripe Payment Flow
1. Student clicks "Enroll" on paid course → frontend POSTs to `/api/checkout`
2. Rate limit check (5/min per IP), CSRF origin check
3. Validates user session, course existence, no existing enrollment/payment
4. Creates Stripe Checkout Session with metadata (userId, courseId)
5. Creates `payments` row (status=pending, stripe_session_id)
6. User completes payment on Stripe → Stripe sends webhook to `/api/webhooks/stripe`
7. Webhook verifies signature, handles `checkout.session.completed`
8. Updates payment status to `completed`, stores payment_intent_id
9. Calls `enrollInCourseInternal()` → creates enrollment row (bypasses payment check)

### Manual Payment Flow
1. Student submits `createEnrollmentRequest()` with bank transfer proof
2. Creates `enrollment_requests` row (status=pending)
3. Admin views pending requests via `getAllEnrollmentRequests()`
4. Admin calls `approveEnrollmentRequest()` → updates status, calls `enrollInCourseInternal()`
5. On failure, rolls back approval status

### Refund Flow
1. Stripe sends `charge.refunded` webhook
2. Handler updates payment status to `refunded`
3. Looks up payment by intent_id, deletes enrollment via admin client
4. Logs critical error if enrollment deletion fails

### Quiz Submission Flow
1. Student calls `submitQuestAttempt()` (`lib/actions/quests.ts:16`)
2. Validates caller === studentId, UUID format, answers format
3. Fetches quest + questions + options (without correct answers)
4. Fetches correct answers via admin client from `quest_correct_options`
5. Checks max_attempts (app-level + DB trigger)
6. Calculates score, determines pass/fail
7. Inserts `quest_attempts` row
8. Post-insert race condition check (deletes if over limit)
9. If passed: awards points, updates streak, updates skills, checks badges

### Course Completion Flow
1. `markSubMaterialCompleted()` → updates progress → calls `updateCourseProgress()`
2. If progress ≥ 100%: calls `completeCourse()`
3. Verifies at least one quiz passed (if course has quizzes)
4. Marks enrollment completed, awards points (200-800 based on difficulty)
5. Updates course skills, checks badges
6. Generates certificate with unique number

---

## 7. Business Features

| Feature | Endpoints/Actions | Data Lifecycle | Dependencies | Sensitivity |
|---------|-------------------|----------------|--------------|-------------|
| User Registration | `signUp`, `signInWithGoogle`, `/auth/callback` | auth.users → profiles (trigger) → approval | Supabase Auth, rate_limits | High — role assignment |
| Course Management | `createCourse`, `updateCourse`, `deleteCourse`, `approveCourse` | courses → materials → sub_materials | Cloudinary (media), profiles | Medium |
| Enrollment | `enrollInCourse`, `enrollInCourseInternal`, `/api/checkout` | payments → enrollments → progress | Stripe, Supabase | High — payment verification |
| Manual Payment | `createEnrollmentRequest`, `approveEnrollmentRequest` | enrollment_requests → enrollments | Cloudinary (proof), admin approval | High — financial |
| Content Access | `markSubMaterialCompleted`, `getCourseProgress` | progress → enrollment percentage | RLS policies | Medium — paid content |
| Quizzes | `submitQuestAttempt`, `createQuest`, `createQuestion`, `createOption` | quests → quest_questions → quest_options → quest_correct_options → quest_attempts | Admin client for answers | High — answer integrity |
| Gamification | `awardPoints`, `checkAndAwardBadges`, `updateStreak` | leaderboard_stats, student_badges, point_history | Internal calls only | Low |
| Skills | `updateSkillProficiency`, `getStudentSkills` | student_skills (level + points) | Course completion, quiz scores | Low |
| Certificates | `generateCertificate` (internal) | certificates (unique number, verification URL) | Course completion + quiz pass | Medium — credential integrity |
| Leaderboard | `getLeaderboard`, `getStudentRank` | leaderboard_stats (denormalized) | Points system | Low |
| Security Tools | `getAllTools`, `getToolsByCategory` | security_tools (read-only catalog) | Seed data | Low |
| Admin User Mgmt | `/api/check-user`, profile updates | profiles (role, is_active, is_approved) | Admin client | High — privilege control |

---

## 8. Sensitive Assets

### Database Tables with Sensitive Columns

| Table | Sensitive Columns | Risk |
|-------|-------------------|------|
| `profiles` | `role`, `is_approved`, `is_active`, `email` | Privilege escalation, PII |
| `payments` | `stripe_payment_intent_id`, `stripe_session_id`, `amount`, `status` | Financial data |
| `quest_correct_options` | `is_correct` | Answer leakage → academic fraud |
| `quest_attempts` | `answers` (JSONB), `score` | Student PII, academic records |
| `enrollment_requests` | `payment_proof_url`, `phone_number`, `bank_account_used`, `email` | PII, financial |
| `certificates` | `certificate_number`, `verification_url` | Credential forgery |
| `rate_limits` | `key` (contains emails/IPs) | PII |

### Privileged Operations

| Operation | Client Used | Location |
|-----------|-------------|----------|
| Update payment status | Admin client (service role) | `lib/actions/payments.ts:49` |
| Fetch correct quiz answers | Admin client | `lib/actions/quests.ts:55` |
| Auto-approve students | Admin client | `app/auth/callback/route.ts:82` |
| Delete enrollment on refund | Admin client | `app/api/webhooks/stripe/route.ts:120` |
| Rate limit CRUD | Admin client | `lib/rate-limit.ts:17` |
| Internal enrollment (skip payment) | Admin client | `lib/actions/courses.ts:105` |
| List auth users | `supabase.auth.admin.listUsers()` | `app/api/check-user/route.ts:30` |

### Secrets Management

| Secret | Env Variable | Usage |
|--------|-------------|-------|
| Supabase URL | `NEXT_PUBLIC_SUPABASE_URL` | Public (client-side) |
| Supabase Anon Key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (client-side) |
| Supabase Service Role Key | `SUPABASE_SERVICE_ROLE_KEY` | Server-only (admin client) |
| Stripe Secret Key | `STRIPE_SECRET_KEY` | Server-only (checkout, webhook) |
| Stripe Webhook Secret | `STRIPE_WEBHOOK_SECRET` | Server-only (signature verification) |
| Stripe Publishable Key | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public (client-side) |
| App URL | `NEXT_PUBLIC_APP_URL` | Public — used for CSRF origin check |
| Cloudinary Cloud Name | `CLOUDINARY_CLOUD_NAME` / `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Media uploads |

### Security Headers (`next.config.js`)

| Header | Value |
|--------|-------|
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=() |
| Strict-Transport-Security | max-age=31536000; includeSubDomains |
| Content-Security-Policy | default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com; |

### Rate Limiting Configuration

| Endpoint | Limit | Window | Key |
|----------|-------|--------|-----|
| Login (`signIn`) | 5 requests | 60s | `login:{email}` |
| Signup (`signUp`) | 3 requests | 3600s | `signup:{email}` |
| Password Reset (`requestPasswordReset`) | 3 requests | 3600s | `reset:{email}` |
| Checkout (`/api/checkout`) | 5 requests | 60s | `checkout:{IP}` |

Rate limiter uses persistent Supabase table (`rate_limits`) via admin client. Fails closed on auth-critical paths (login, signup, reset). Fails open on non-critical paths.

---

## 9. Attack Surface Notes

### Access Control Gaps

1. **`updateMaterial`, `deleteMaterial`, `createSubMaterial`, `updateSubMaterial`, `deleteSubMaterial`** (`courses.ts:474-571`) — No explicit ownership verification in application code. Relies entirely on RLS policies. If RLS is misconfigured or bypassed, any authenticated user could modify any course content.

2. **`createQuestion`, `updateQuestion`, `deleteQuestion`** (`quests.ts:378-435`) — Same pattern: no app-level ownership check, relies on RLS.

3. **`getAllCoursesAdmin`** (`courses.ts:587`) — No explicit admin role check in code. Relies on RLS policy "Admins can view all courses". If called by non-admin, RLS would filter results but no error is returned.

4. **`getStudentEnrollments`, `getCourseProgress`, `getMentorCourses`** — Accept arbitrary IDs without verifying caller === target. RLS provides the guard, but the functions don't fail explicitly for unauthorized access.

5. **`getCoursePayments`** (`payments.ts:168`) — No explicit ownership check. Relies on RLS policy for instructor access. Any authenticated user could call this.

### IDOR Potential

6. **`markSubMaterialCompleted`** — Verifies enrollment ownership but accepts `enrollmentId` and `subMaterialId` from client. If a valid enrollment ID is known, the sub_material_id could be from a different course (cross-course progress injection). The RLS constraint `UNIQUE(enrollment_id, sub_material_id)` and the progress recalculation scope to the enrollment's course may mitigate this.

7. **`getStudentBadges`, `getStudentSkills`, `getStudentRank`** — Accept arbitrary `studentId`. No caller verification. RLS allows admin/mentor to view, but students could view other students' data if RLS permits.

### Business Logic

8. **Checkout CSRF protection** (`app/api/checkout/route.ts:30-38`) — Uses `origin`/`referer` header comparison against `NEXT_PUBLIC_APP_URL`. The `origin` header can be absent in some contexts (e.g., same-origin navigations). The check uses `||` (either origin matches OR referer starts with expected), which is correct but relies on `NEXT_PUBLIC_APP_URL` being set correctly.

9. **`enrollInCourseInternal`** (`courses.ts:95`) — Guards against non-admin direct calls by checking `user.id` role. However, if called from a context with no user session (e.g., webhook handler where `getUser()` returns null), the guard is bypassed by design. This is intentional for webhook flows but worth noting.

10. **Quest attempt race condition** (`quests.ts:100-108`) — App-level post-insert check + DB trigger provide defense-in-depth. The app deletes the attempt if over limit, but there's a brief window where the attempt exists.

11. **`timeSpent` validation** (`courses.ts:145`) — Minimum 30 seconds enforced server-side, but the value is client-provided. A client can send `timeSpent: 31` immediately without actually spending time.

### Data Exposure

12. **Profiles SELECT policy** — `USING (true)` means all profile data (email, full_name, role, avatar_url, bio, is_approved, is_active) is readable by any authenticated user. Email enumeration is possible.

13. **Certificates SELECT policy** — `USING (student_id = auth.uid() OR true)` effectively means public read. Certificate numbers and scores are exposed to all.

14. **`quest_options` readable by all authenticated** — After the security fix, `is_correct` was moved to `quest_correct_options`, but option text and order are still visible. This is expected behavior.

15. **Error messages in auth** — `signIn` returns generic "Invalid email or password" (good). `signUp` returns specific "Failed to create account" without leaking whether email exists (Supabase handles this).

### Configuration

16. **`typescript.ignoreBuildErrors: true`** in `next.config.js` — Type errors are not caught at build time. Could mask security-relevant type mismatches.

17. **CSP allows `'unsafe-inline'`** for both scripts and styles — Weakens XSS protection. Required for Next.js inline scripts and Tailwind.

18. **Image domains allowlist** includes `placehold.co` and `ui-avatars.com` — External services that could be used for SSRF if image processing is involved.

19. **`/api/check-user`** — Admin-only endpoint that reveals whether an email exists in the system and returns profile + auth metadata. Properly guarded but high-value target.

### Webhook Security

20. **Stripe webhook** (`app/api/webhooks/stripe/route.ts`) — Properly verifies signature via `stripe.webhooks.constructEvent()`. Uses raw body (`req.text()`). No replay protection beyond Stripe's built-in tolerance window.

21. **Webhook calls `enrollInCourseInternal`** which has no user session — The function's admin guard allows this (null user passes through to admin client usage). This is by design but means the webhook handler has elevated privileges.

### Rate Limiting

22. **Rate limit key for checkout uses `x-forwarded-for`** — Can be spoofed if the application is not behind a trusted proxy that strips/overwrites this header. Falls back to `'unknown'` which would share a single bucket for all requests without the header.

23. **Rate limiter fail-open for non-critical paths** — If Supabase is down, non-auth rate limits are bypassed. This is a deliberate availability trade-off.

### Database

24. **`GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated`** — Very broad grant. RLS policies are the sole access control layer. If any policy is misconfigured, the broad grant means full table access.

25. **No DELETE policies on enrollments** — The schema has no explicit DELETE policy for enrollments. The refund handler uses admin client to delete. Students cannot unenroll themselves via RLS.

26. **`enrollment_requests` UNIQUE constraint** is `(student_id, course_id, status)` — A student could have multiple requests for the same course if previous ones were rejected. The app checks for pending status only.
