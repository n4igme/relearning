# Security Reconnaissance Report — RE-learning Platform

**Date:** 2026-05-20  
**Target:** /Users/nb-dk-0552/Project/relearning  
**Cycle:** 5 (fully patched)

---

## 1. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | ^16.2.6 |
| Language | TypeScript | ^5.7.2 |
| Runtime | React | ^19.0.0 |
| Database | Supabase (PostgreSQL) | @supabase/supabase-js ^2.47.10 |
| Auth | Supabase Auth + @supabase/ssr ^0.5.2 | — |
| Payments | Stripe | ^17.5.0 |
| Media | Cloudinary | ^2.8.0 |
| Validation | Zod | ^3.24.1 |
| UI | Radix UI + Tailwind CSS ^3.4.17 | — |
| Testing | Vitest ^4.0.18, Playwright ^1.58.0 | — |
| Deploy | Standalone (Docker) / Netlify | — |

**Build:** `next build` with `output: 'standalone'`  
**Dev:** Turbopack (`next dev --turbopack`)

---

## 2. Entry Points

### API Routes (app/api/)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/checkout` | POST | Create Stripe checkout session |
| `/api/check-user` | GET | Admin-only: lookup user by email |
| `/api/webhooks/stripe` | POST | Stripe webhook handler (checkout.session.completed, payment_intent.succeeded, payment_intent.payment_failed, charge.refunded) |
| `/auth/callback` | GET | OAuth/email-confirmation callback, session exchange |

### Middleware

- **File:** `middleware.ts`
- **Matcher:** All routes except static assets
- **Functions:**
  - Session refresh via `supabase.auth.getUser()`
  - Protected route enforcement (redirect to `/login`)
  - Role-based access: `/admin` → admin only, `/mentor` → mentor or admin
  - Deactivated/unapproved user blocking
  - Redirect authenticated users away from `/login`, `/register`

---

## 3. Server Actions (lib/actions/)

### auth.ts
- `signUp(formData)` — rate-limited (3/hr per email), validates email/password/role, role restricted to student|mentor
- `signIn(formData)` — rate-limited (5/min per email), generic error messages
- `signOut()` — clears session
- `getUser()` / `getUserProfile()` — session introspection
- `signInWithGoogle()` — OAuth redirect to `/auth/callback`
- `requestPasswordReset(formData)` — rate-limited (3/hr per email)
- `updatePassword(formData)` — requires active session (from reset link)

### courses.ts
- `enrollInCourse(studentId, courseId)` — verifies caller === studentId, checks payment for paid courses
- `enrollInCourseInternal(studentId, courseId)` — admin-only gate, uses admin client, skips payment check
- `markSubMaterialCompleted(enrollmentId, subMaterialId, timeSpent)` — ownership check, min 30s time
- `createCourse / updateCourse / deleteCourse` — instructor ownership checks, Zod validation, field allowlist on update
- `createMaterial / updateMaterial / deleteMaterial` — instructor ownership
- `createSubMaterial / updateSubMaterial / deleteSubMaterial` — instructor context
- `approveCourse(courseId, approved)` — admin-only
- `getCourseById(courseId)` — blocks unapproved courses unless instructor/admin
- `getPublishedCourses()` — only published + approved

### payments.ts
- `createPayment(...)` — inserts pending payment record
- `updatePaymentStatus(...)` — uses admin client (webhook context)
- `getStudentPayments(studentId)` — caller must be student or admin
- `hasStudentPaidForCourse(studentId, courseId)` — boolean check

### gamification.ts
- `awardPoints(studentId, points, source, sourceId)` — upserts leaderboard_stats
- `checkAndAwardBadges(studentId)` — evaluates all badge criteria
- `updateStreak(studentId)` — consecutive-day tracking
- `getLeaderboard(limit, timeframe)` — public read
- `getStudentRank(studentId)` / `getStudentBadges(studentId)` — read-only

### quests.ts
- `submitQuestAttempt(questId, studentId, answers)` — caller verification, UUID+answers validation, admin client for correct answers, max_attempts check (app + DB trigger), scoring scoped to current quest options only
- `getQuestWithQuestions(questId)` — returns options without is_correct
- `createQuest / updateQuest / deleteQuest` — instructor ownership
- `createQuestion / updateQuestion / deleteQuestion` — instructor context
- `createOption(questionId, optionData)` — stores is_correct in quest_correct_options via admin client
- `updateOption / deleteOption` — instructor context
- `getAllCourseQuests(courseId)` — instructor-only (includes correct answers via RLS join)
- `canAttemptQuest(questId, studentId)` — enrollment + max_attempts check

### skills.ts
- `getAllSkills()` / `getStudentSkills(studentId)` / `getSkillsByCategory()` — read-only
- `updateSkillProficiency(studentId, skillId, newLevel, pointsToAdd)` — blocks direct student calls (user.id === studentId rejected unless admin)

### tools.ts
- `getAllTools(filters)` — LIKE wildcards escaped, public read
- `getToolsByCategory()` / `getToolStatistics()` — read-only

### enrollment-requests.ts
- `createEnrollmentRequest(data)` — authenticated student, checks existing enrollment/pending request
- `getAllEnrollmentRequests(status)` — admin-only
- `getMyEnrollmentRequests()` — own requests
- `approveEnrollmentRequest(requestId, adminNotes)` — admin-only, calls enrollInCourseInternal
- `rejectEnrollmentRequest(requestId, adminNotes)` — admin-only

---

## 4. Pages

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Public | Landing page |
| `/login` | Public | Login form |
| `/register` | Public | Registration form |
| `/forgot-password` | Public | Password reset request |
| `/reset-password` | Public (with token) | Set new password |
| `/resend-verification` | Public | Resend email verification |
| `/dashboard` | Authenticated | Student dashboard |
| `/courses` | Authenticated | Browse courses |
| `/courses/[courseId]` | Authenticated | Course detail |
| `/courses/[courseId]/learn` | Authenticated (enrolled) | Learning interface |
| `/courses/[courseId]/enroll` | Authenticated | Enrollment/payment page |
| `/quests/[questId]` | Authenticated (enrolled) | Take quiz |
| `/skills` | Authenticated | Skill tracking |
| `/gamification` | Authenticated | Points & badges overview |
| `/leaderboard` | Authenticated | Rankings |
| `/certificates` | Authenticated | Student certificates |
| `/tools` | Authenticated | Security tools catalog |
| `/payment/success` | Authenticated | Post-payment confirmation |
| `/admin/users` | Admin | User management |
| `/admin/courses` | Admin | Course approval |
| `/admin/enrollment-requests` | Admin | Manual payment approval |
| `/mentor/courses/new` | Mentor/Admin | Create course |
| `/mentor/courses/[courseId]` | Mentor/Admin | Edit course |

---

## 5. Authentication & Authorization

### Authentication
- **Providers:** Email/password, Google OAuth
- **Session:** Supabase Auth cookies, validated via `getUser()` (not `getSession()`)
- **Token refresh:** Middleware refreshes on every request
- **Password reset:** Email-based with redirect to `/auth/callback?next=/reset-password`

### Authorization Layers
1. **Middleware:** Route-level protection (unauthenticated → login, role checks for /admin, /mentor)
2. **Server Actions:** Per-action ownership/role verification via `supabase.auth.getUser()`
3. **Database RLS:** Row-level policies on all 20+ tables
4. **DB Triggers:**
   - `prevent_self_privilege_escalation` — blocks role/is_approved/is_active self-modification
   - `enforce_quest_max_attempts` — atomic max attempts enforcement

### Role Model
| Role | Capabilities |
|------|-------------|
| student | Enroll, learn, take quizzes, view own data |
| mentor | Create/manage own courses and quizzes |
| admin | Full access: approve courses/users, manage enrollments, view all data |

### Key Security Controls
- Rate limiting: persistent (Supabase table), fails closed for login/signup/reset
- CSRF: Origin/Referer check on `/api/checkout`, fails closed if APP_URL unset
- Field allowlist on course updates (prevents mass assignment)
- Google OAuth restricted to student role only
- Deactivated/unapproved users blocked at middleware level

---

## 6. Data Flow Summary

### Enrollment (Paid Course)
```
Student → /api/checkout (CSRF check, rate limit) → Stripe session created → payment record (pending)
Stripe webhook → /api/webhooks/stripe → updatePaymentStatus (admin client) → enrollInCourseInternal (admin gate) → enrollment created
```

### Enrollment (Manual Payment)
```
Student → createEnrollmentRequest → pending record
Admin → approveEnrollmentRequest → enrollInCourseInternal → enrollment created
```

### Quiz Submission
```
Student → submitQuestAttempt → verify caller, validate inputs → fetch correct answers (admin client, scoped to quest options) → calculate score → insert attempt (DB trigger enforces max_attempts) → award points/badges/skills if passed
```

### Refund
```
Stripe charge.refunded webhook → updatePaymentStatus(refunded) → delete enrollment (admin client) → access revoked
```

### Course Completion
```
markSubMaterialCompleted → updateCourseProgress → if 100%: completeCourse → verify quiz passed → award points → update skills → generate certificate
```

---

## 7. Business Features

- **Multi-role LMS:** Admin, Mentor, Student with approval workflows
- **Course Builder:** Chapters → Lessons (video/text), instructor-owned
- **Assessments:** Single/multiple choice quizzes, configurable passing score and max attempts
- **Gamification:** Points (100-800), 25 skills, 15 badges (bronze-platinum), streaks, leaderboard
- **Payments:** Stripe (automated) + manual bank transfer (admin approval)
- **Certificates:** Auto-generated on course completion with verification URL
- **Security Tools Catalog:** Reference database of cybersecurity tools

---

## 8. Sensitive Assets

| Asset | Location | Protection |
|-------|----------|-----------|
| Quiz correct answers | `quest_correct_options` table | Instructor-only RLS, admin client for scoring |
| Payment records | `payments` table | RLS: student own + admin + instructor (own courses) |
| Service role key | `SUPABASE_SERVICE_ROLE_KEY` env var | Server-only (admin.ts) |
| Stripe secret key | `STRIPE_SECRET_KEY` env var | Server-only |
| Stripe webhook secret | `STRIPE_WEBHOOK_SECRET` env var | Signature verification |
| User passwords | Supabase Auth (bcrypt) | Never exposed |
| Student PII | `profiles` table | Public SELECT (full_name, email visible) |
| Payment proof URLs | `enrollment_requests.payment_proof_url` | Stored as URL (Cloudinary) |
| Certificate numbers | `certificates.certificate_number` | Public verification by design |

---

## 9. Attack Surface Notes

### Security Headers (next.config.js)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- HSTS: max-age=31536000; includeSubDomains
- CSP: Restrictive (self + stripe + supabase)
- Permissions-Policy: camera=(), microphone=(), geolocation=()

### Potential Areas of Interest
1. **Profile visibility:** `profiles` table has `SELECT USING(true)` — all user emails/names publicly readable by any authenticated user
2. **Leaderboard stats:** Readable by all authenticated users (by design for rankings)
3. **updateMaterial / updateSubMaterial:** No explicit ownership verification in the action code (relies on RLS)
4. **createSubMaterial:** No explicit course ownership check in action (relies on RLS for material_id)
5. **Checkout route:** Uses `createClient(cookieStore)` with direct cookies import — different pattern from other server actions
6. **handle_new_user trigger:** Trusts `raw_user_meta_data->>'role'` from signup — but signUp action validates role to student|mentor only
7. **Student badges INSERT policy:** Requires admin role — but `checkAndAwardBadges` runs in user context (may fail silently or rely on leaderboard_stats INSERT policy)
8. **leaderboard_stats / student_skills:** INSERT/UPDATE policies require admin role, but gamification.ts and skills.ts call these in user session context — potential RLS conflicts (may rely on the user being the student_id owner via other policies)
9. **quest_attempts DELETE:** Used in race-condition rollback — no explicit DELETE policy visible (may fail silently)
10. **Image domains:** Allows multiple external domains (googleusercontent, cloudinary, ui-avatars, placehold.co)
11. **TypeScript build errors ignored:** `ignoreBuildErrors: true` in next.config.js — type safety gaps possible
12. **Enrollment uniqueness:** Enforced at DB level (UNIQUE constraint) — safe against double-enrollment

### Patched Vulnerabilities (Cycle 5)
- ✅ Quiz answer exposure → moved to `quest_correct_options` with instructor-only RLS
- ✅ Role self-escalation → DB trigger `prevent_self_privilege_escalation`
- ✅ Rate limiter bypass (serverless) → persistent Supabase table, fails closed
- ✅ enrollInCourseInternal abuse → admin role gate
- ✅ updateSkillProficiency abuse → blocks direct student calls
- ✅ CSRF on checkout → origin check, fails closed if APP_URL unset
- ✅ Refund access revocation → admin client deletes enrollment
- ✅ Max attempts race condition → DB trigger `enforce_quest_max_attempts`
- ✅ Content access without enrollment → RLS restricts materials/sub_materials to enrolled students
- ✅ Quiz scoring manipulation → scoped to current quest's option IDs only
