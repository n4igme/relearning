# Threat Model

**Based on**: recon.md
**Date**: 2026-05-20

## Threat Actors

| Actor | Access Level | Motivation | Capabilities |
|-------|-------------|------------|--------------|
| Unauthenticated external attacker | None | Account takeover, data theft, service disruption | Can register accounts, probe public endpoints, attempt auth bypass |
| Authenticated student | Standard user | Access paid content for free, view other students' data, inflate gamification scores | Has valid session, can call any server action, knows API patterns |
| Authenticated mentor | Elevated (course owner) | Modify other mentors' courses, access student PII, escalate to admin | Can create/edit courses, access quiz management functions |
| Compromised admin | Full access | Data exfiltration, backdoor creation | Service role key access, can bypass RLS, modify any record |
| Malicious dependency / supply chain | Build-time | Code injection, credential theft | Access to build process, env vars during build |

## STRIDE Analysis

### POST /api/checkout (app/api/checkout/route.ts)

| Threat | Category | Risk Level | Attack Vector |
|--------|----------|------------|---------------|
| Bypass payment for paid courses | Tampering | High | Call `enrollInCourse()` directly with a free-course flow, or manipulate courseId to a free course after session creation |
| CSRF if APP_URL unset | Spoofing | Medium | If `NEXT_PUBLIC_APP_URL` env var is missing, origin check is skipped entirely — cross-origin POST succeeds |
| Price manipulation | Tampering | Low | Price is read server-side from DB, not from client — mitigated |
| Rate limit bypass | DoS | Medium | Distributed IPs bypass per-IP rate limit; server restart resets counters |

### POST /api/webhooks/stripe (app/api/webhooks/stripe/route.ts)

| Threat | Category | Risk Level | Attack Vector |
|--------|----------|------------|---------------|
| Webhook replay | Spoofing | Low | Stripe signature includes timestamp — mitigated by Stripe SDK |
| Enrollment without payment | Elevation of Privilege | High | If signature verification is bypassed, attacker triggers `enrollInCourseInternal()` which skips payment check |
| Refund abuse | Tampering | Medium | Legitimate refund triggers enrollment deletion — could be weaponized if attacker can trigger refunds |

### GET /api/check-user (app/api/check-user/route.ts)

| Threat | Category | Risk Level | Attack Vector |
|--------|----------|------------|---------------|
| User enumeration | Information Disclosure | Medium | Admin-only but returns profile + auth user data for any email; compromised admin account enables bulk PII extraction |
| Auth user listing | Information Disclosure | High | Calls `supabase.auth.admin.listUsers()` and iterates — loads ALL users into memory |

### GET /auth/callback (app/auth/callback/route.ts)

| Threat | Category | Risk Level | Attack Vector |
|--------|----------|------------|---------------|
| Auto-approval bypass | Elevation of Privilege | Medium | Students are auto-approved on callback; if an attacker can trigger the callback flow for a mentor account, approval logic differs but worth testing |
| Open redirect via `next` param | Spoofing | Low | `next` param is checked for leading `/` — mitigated, but path-relative redirects possible |
| Profile creation race | Tampering | Low | If callback fires twice concurrently, duplicate profile insert could fail gracefully or create inconsistency |

### Server Actions — Course Mutations (lib/actions/courses.ts)

| Threat | Category | Risk Level | Attack Vector |
|--------|----------|------------|---------------|
| Unauthorized material modification | Elevation of Privilege | Critical | `updateMaterial(materialId, data)`, `deleteMaterial(materialId)` — no auth check; any authenticated user can modify/delete any chapter |
| Unauthorized sub-material CRUD | Elevation of Privilege | Critical | `createSubMaterial`, `updateSubMaterial`, `deleteSubMaterial` — no ownership verification |
| Course content injection | Tampering | High | Attacker modifies lesson content/video URLs to inject malicious content into other mentors' courses |
| Mass assignment on material/sub-material | Tampering | Medium | No field allowlist on `updateMaterial`/`updateSubMaterial` — all provided fields passed directly to Supabase |

### Server Actions — Quiz System (lib/actions/quests.ts)

| Threat | Category | Risk Level | Attack Vector |
|--------|----------|------------|---------------|
| Unauthorized question/option CRUD | Elevation of Privilege | Critical | `createQuestion`, `updateQuestion`, `deleteQuestion`, `createOption`, `updateOption`, `deleteOption` — no ownership check |
| Quiz answer theft | Information Disclosure | High | If `getAllCourseQuests()` authorization check is bypassable, attacker gets all correct answers |
| Max attempts race condition | Tampering | Medium | Concurrent `submitQuestAttempt()` calls can exceed `max_attempts` due to TOCTOU gap |
| Score inflation | Tampering | Medium | If attacker can modify quest_options (via unprotected CRUD), they can set their chosen answers as correct, then submit |

### Server Actions — Data Access (lib/actions/skills.ts, payments.ts, quests.ts)

| Threat | Category | Risk Level | Attack Vector |
|--------|----------|------------|---------------|
| IDOR on student skills | Information Disclosure | Medium | `getStudentSkills(anyStudentId)` — view any student's skill progress |
| IDOR on quest attempts | Information Disclosure | Medium | `getStudentQuestAttempts(anyStudentId)` — view any student's quiz history and answers |
| IDOR on payments | Information Disclosure | High | `getStudentPayments(anyStudentId)` — view any student's payment history; `getCoursePayments(courseId)` — view all payers for any course |
| IDOR on enrollment requests | Information Disclosure | Medium | `getEnrollmentRequestById(requestId)` checks ownership but relies on profile role query |

### Server Actions — Auth (lib/actions/auth.ts)

| Threat | Category | Risk Level | Attack Vector |
|--------|----------|------------|---------------|
| Email flooding | DoS | Medium | `requestPasswordReset` has no rate limiting — attacker can flood any email with reset links |
| Role injection on signup | Elevation of Privilege | Low | Role validated against `['student', 'mentor']` — admin role blocked; mitigated |
| Credential stuffing | Spoofing | Medium | Login rate limit is per-email (5/min) but attacker can target many emails simultaneously |

### Middleware (middleware.ts)

| Threat | Category | Risk Level | Attack Vector |
|--------|----------|------------|---------------|
| Server action bypass | Elevation of Privilege | High | Middleware only protects page routes; server actions are callable directly without middleware role checks |
| Missing path coverage | Elevation of Privilege | Low | `/student` is in protected paths but no such route exists; `/tools` is not in protected paths list but page requires auth via server-side check |

## Feature Threat Analysis

### Course Management (Mentor)

**Endpoints**: createCourse, updateCourse, deleteCourse, createMaterial, updateMaterial, deleteMaterial, createSubMaterial, updateSubMaterial, deleteSubMaterial
**Assets at Risk**: Course content integrity, student learning experience, platform reputation

| Abuse Case | Attack Vector | Impact | Likelihood |
|------------|--------------|--------|------------|
| Modify another mentor's course content | Call `updateMaterial(victimMaterialId, {title: "hacked"})` as any authenticated user | Content defacement, malicious content injection | High |
| Delete another mentor's lessons | Call `deleteSubMaterial(victimSubMaterialId)` | Data destruction, learning disruption | High |
| Inject malicious video URL | `updateSubMaterial(id, {video_url: "attacker-controlled"})` | Phishing, malware distribution to students | High |
| Bypass course approval | Directly set `is_published: true` via `updateCourse` (field is in allowlist) | Unapproved content visible to students | Medium |

**Trust Assumptions Violated**:
- Assumes only the course owner calls material/sub-material mutations
- Assumes middleware role check is sufficient (but server actions bypass middleware)

---

### Payment & Enrollment

**Endpoints**: POST /api/checkout, POST /api/webhooks/stripe, enrollInCourse, enrollInCourseInternal, createEnrollmentRequest
**Assets at Risk**: Revenue, course access control, financial records

| Abuse Case | Attack Vector | Impact | Likelihood |
|------------|--------------|--------|------------|
| Free enrollment in paid course | Call `enrollInCourse(studentId, courseId)` for a course where price > 0 but no payment exists — relies on payment check in function | Free access to paid content | Low (payment check exists) |
| Enrollment via direct internal call | If any code path calls `enrollInCourseInternal()` without proper gating | Bypass payment entirely | Low (only webhook/admin use it) |
| Payment status manipulation | If `updatePaymentStatus` is callable with arbitrary sessionId/intentId | Mark unpaid as completed | Low (uses admin client, but function is exported) |
| Duplicate enrollment request spam | Submit many `createEnrollmentRequest` for same course after rejection | Admin fatigue, potential approval of fraudulent request | Medium |

**Trust Assumptions Violated**:
- Assumes webhook is the only path to `enrollInCourseInternal`
- Assumes `updatePaymentStatus` is only called from webhook context

---

### Quiz System & Academic Integrity

**Endpoints**: submitQuestAttempt, getQuestWithQuestions, getAllCourseQuests, createQuestion, updateQuestion, createOption, updateOption
**Assets at Risk**: Academic integrity, certification validity, gamification fairness

| Abuse Case | Attack Vector | Impact | Likelihood |
|------------|--------------|--------|------------|
| Steal quiz answers | Call `getAllCourseQuests(courseId)` — if authz check fails, get all `is_correct` flags | Perfect scores without learning | Medium |
| Exceed max attempts | Send concurrent `submitQuestAttempt` requests | Unlimited retries, guaranteed pass | Medium |
| Modify correct answers | Call `updateOption(optionId, {is_correct: true})` on your chosen answer | Guaranteed 100% score | High |
| Delete difficult questions | Call `deleteQuestion(questionId)` to remove hard questions | Easier quizzes for everyone | High |
| Points farming | Pass quiz → modify answers → pass again (if attempts allow) | Inflate leaderboard position | Medium |

**Trust Assumptions Violated**:
- Assumes only course instructor manages questions/options
- Assumes max_attempts is atomically enforced
- Assumes quiz answers are never exposed to students

---

### Gamification & Leaderboard

**Endpoints**: awardPoints, updateStreak, checkAndAwardBadges, getLeaderboard
**Assets at Risk**: Competitive fairness, badge/certificate legitimacy

| Abuse Case | Attack Vector | Impact | Likelihood |
|------------|--------------|--------|------------|
| Points inflation via quiz manipulation | Modify quiz options → pass repeatedly → accumulate points | Unfair leaderboard ranking | High (if quiz CRUD is unprotected) |
| Streak manipulation | Call `updateStreak(studentId)` — function is exported, no direct caller check | Artificial streak maintenance | Low (called internally) |
| Badge farming | Manipulate stats to meet badge criteria via quiz/course exploits | Illegitimate badges | Medium |

**Cross-feature attack**: Exploiting unprotected quiz CRUD → inflated scores → unearned badges → fraudulent certificates

---

### User Management (Admin)

**Endpoints**: approveUser, rejectUser (inline in admin/users/page.tsx), /api/check-user
**Assets at Risk**: Platform access control, user PII

| Abuse Case | Attack Vector | Impact | Likelihood |
|------------|--------------|--------|------------|
| Bulk user enumeration | Compromised admin calls `/api/check-user?email=` iteratively | Full user database extraction | Low (requires admin) |
| Self-elevation to admin | If `profiles.role` update is possible via unprotected path | Full platform compromise | Low (RLS should block, but admin client bypasses) |
| Deactivate legitimate users | Admin action with no confirmation/approval workflow | Service disruption for users | Low (requires admin) |

---

### Certificate Generation

**Endpoints**: generateCertificate (internal), /certificates/[number]
**Assets at Risk**: Academic credential validity, platform trust

| Abuse Case | Attack Vector | Impact | Likelihood |
|------------|--------------|--------|------------|
| Forge certificate | If certificate_number is predictable (timestamp + random) | Fake credentials | Low |
| Earn certificate without learning | Exploit quiz CRUD to pass → trigger course completion → auto-generate cert | Illegitimate certification | High (if quiz CRUD unprotected) |

---

## Attack Trees

### Goal 1: Access Paid Course Content Without Payment

1. **Path A: Direct enrollment bypass**
   - Precondition: Authenticated as student
   - Steps: Call `enrollInCourse(myId, paidCourseId)` → function checks payment table → if RLS allows reading payments table, check passes/fails correctly
   - Likelihood: Low (payment check exists in code)

2. **Path B: Manipulate enrollment request approval**
   - Precondition: Authenticated as student
   - Steps: Submit fake `createEnrollmentRequest` with fabricated payment proof → admin approves → `enrollInCourseInternal` called
   - Likelihood: Medium (social engineering admin)

3. **Path C: Webhook forgery**
   - Precondition: None (unauthenticated)
   - Steps: POST to `/api/webhooks/stripe` with forged payload → if signature check fails, enrollment doesn't happen
   - Likelihood: Low (Stripe signature verification is robust)

### Goal 2: Account Takeover

1. **Path A: Password reset email flooding + phishing**
   - Precondition: Know victim's email
   - Steps: Flood `requestPasswordReset` (no rate limit) → victim receives many emails → send phishing email mimicking reset → capture credentials
   - Likelihood: Medium

2. **Path B: Session fixation via OAuth callback**
   - Precondition: Ability to craft callback URL
   - Steps: Manipulate `/auth/callback?code=attacker_code` → unlikely to work as code is one-time-use from Supabase
   - Likelihood: Low

3. **Path C: Credential stuffing**
   - Precondition: Leaked credential database
   - Steps: Attempt login with known email/password pairs → rate limit is per-email (5/min) but can target many emails
   - Likelihood: Medium

### Goal 3: Platform Content Destruction / Defacement

1. **Path A: Exploit unprotected material mutations**
   - Precondition: Any authenticated account (even student)
   - Steps: Enumerate material IDs → call `updateMaterial(id, {title: "defaced"})` or `deleteMaterial(id)` → course content destroyed
   - Likelihood: High (no auth check in function)

2. **Path B: Exploit unprotected quiz mutations**
   - Precondition: Any authenticated account
   - Steps: Enumerate question/option IDs → `deleteQuestion(id)` or `updateOption(id, {is_correct: false})` → quizzes broken
   - Likelihood: High (no auth check in function)

### Goal 4: Earn Fraudulent Certificate

1. **Path A: Quiz manipulation chain**
   - Precondition: Authenticated student
   - Steps: `updateOption` to make all options correct → `submitQuestAttempt` with any answers → 100% score → course completion triggered → certificate generated
   - Likelihood: High (if option CRUD is truly unprotected at app layer)

2. **Path B: Progress manipulation**
   - Precondition: Authenticated student enrolled in course
   - Steps: Call `markSubMaterialCompleted` for all sub-materials with `timeSpent >= 30` → progress reaches 100% → if quiz pass check is bypassed → certificate
   - Likelihood: Medium (quiz pass is required for cert)

## Priority Targets

| Priority | Target | Why | Expected Vuln Classes |
|----------|--------|-----|----------------------|
| 1 | `updateMaterial`, `deleteMaterial`, `createSubMaterial`, `updateSubMaterial`, `deleteSubMaterial` (lib/actions/courses.ts) | No ownership verification — any authenticated user can modify any course content | Broken Access Control (IDOR), Missing Authorization |
| 2 | `createQuestion`, `updateQuestion`, `deleteQuestion`, `createOption`, `updateOption`, `deleteOption` (lib/actions/quests.ts) | No ownership verification — enables quiz manipulation and certificate fraud | Broken Access Control, Academic Integrity Bypass |
| 3 | `getStudentPayments`, `getCoursePayments` (lib/actions/payments.ts) | No authorization check — exposes financial data of any user | IDOR, Information Disclosure |
| 4 | `getStudentSkills`, `getStudentQuestAttempts` (lib/actions/skills.ts, quests.ts) | No caller verification — exposes academic data of any student | IDOR, Information Disclosure |
| 5 | `submitQuestAttempt` race condition (lib/actions/quests.ts) | TOCTOU gap on max_attempts check | Race Condition, Business Logic Bypass |
| 6 | `requestPasswordReset` (lib/actions/auth.ts) | No rate limiting — email flooding | DoS, Account Harassment |
| 7 | POST `/api/checkout` CSRF check (app/api/checkout/route.ts) | Skipped if `NEXT_PUBLIC_APP_URL` is unset | CSRF, Unauthorized Payment Initiation |
| 8 | `getAllCoursesAdmin` (lib/actions/courses.ts) | No admin role check in function — relies on page middleware only | Broken Access Control (if called directly) |
| 9 | CSP `unsafe-inline` + `unsafe-eval` (next.config.js) | Weakens XSS protection | XSS (if injection vector found) |
| 10 | In-memory rate limiting (lib/rate-limit.ts) | Resets on restart, not distributed | Rate Limit Bypass, Brute Force |
| 11 | `getAllCourseQuests` answer exposure (lib/actions/quests.ts) | Returns `is_correct` flags — verify authz check robustness | Information Disclosure, Academic Integrity |
| 12 | Stored XSS via course/lesson content | No HTML sanitization on text inputs rendered in UI | Stored XSS |
| 13 | `enrollInCourseInternal` export (lib/actions/courses.ts) | Exported function skips payment — verify no unintended call paths | Business Logic Bypass |

## Trust Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                        PUBLIC INTERNET                            │
│  (Unauthenticated: /, /login, /register, /forgot-password)       │
└──────────────────────────────┬───────────────────────────────────┘
                               │ Auth (Supabase session cookie)
┌──────────────────────────────▼───────────────────────────────────┐
│                    AUTHENTICATED ZONE                              │
│  Middleware enforces: session exists, account active & approved    │
│  (Server actions callable by ANY authenticated user)              │
│                                                                   │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │    STUDENT       │  │     MENTOR        │  │     ADMIN      │  │
│  │ - Enroll         │  │ - Create courses  │  │ - Approve users│  │
│  │ - Take quizzes   │  │ - Manage content  │  │ - Approve cours│  │
│  │ - View progress  │  │ - Manage quizzes  │  │ - Manage enroll│  │
│  └─────────────────┘  └──────────────────┘  └────────────────┘  │
│                                                                   │
│  ⚠️  TRUST GAP: Server actions lack per-function role checks      │
│      Middleware only protects PAGE routes, not action invocations  │
└──────────────────────────────┬───────────────────────────────────┘
                               │ Service Role Key (admin.ts)
┌──────────────────────────────▼───────────────────────────────────┐
│                    PRIVILEGED ZONE (Bypasses RLS)                  │
│  - createAdminClient() — used by webhooks, admin actions          │
│  - enrollInCourseInternal() — skips payment verification          │
│  - updatePaymentStatus() — modifies payment records               │
└──────────────────────────────┬───────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                    DATABASE (Supabase PostgreSQL)                  │
│  - Row Level Security policies on all tables                      │
│  - RLS is the LAST line of defense for unprotected server actions │
└──────────────────────────────────────────────────────────────────┘
```

**Critical boundary weakness**: The gap between "authenticated zone" and "role-specific operations" is not enforced at the server action level for many functions. The middleware only gates page access, but server actions can be invoked directly by any authenticated client.

## Assumptions & Gaps

### Cannot Determine from Static Analysis
1. **RLS policy effectiveness**: The actual RLS policies in `supabase-schema.sql` and `add-missing-rls-policies.sql` may block the unprotected server actions at the database level — this needs runtime validation
2. **Supabase anon key permissions**: The anon key's RLS context determines what an authenticated user can actually do at the DB level, regardless of missing app-layer checks
3. **Cloudinary upload security**: No upload handler was found in the codebase — unclear if uploads go directly from client to Cloudinary (signed vs unsigned uploads)
4. **Environment variable state in production**: Whether `NEXT_PUBLIC_APP_URL` is set (affects CSRF check), whether `STRIPE_WEBHOOK_SECRET` is properly configured
5. **Actual deployment topology**: Single instance vs multi-instance (affects rate limiting effectiveness)
6. **Email verification enforcement**: Whether Supabase is configured to require email verification before allowing login

### Key Assumptions Made
- RLS policies exist but their completeness/correctness is unverified
- Server actions are callable via Next.js server action protocol from any authenticated client
- The `quest_options.is_correct` field is protected by RLS from student reads (unverified)
- Admin client is only used in intended contexts (no accidental import in client-accessible code)
