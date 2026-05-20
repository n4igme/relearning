# Threat Model — RE-learning Platform

**Target:** `/Users/nb-dk-0552/Project/relearning`
**Date:** 2026-05-21
**Assessment Cycle:** Post-patch (5 cycles completed)
**Overall Remaining Risk:** Medium/Low — All Critical/High vulnerabilities have been remediated. Remaining risks are primarily Medium-severity logic issues, defense-in-depth gaps, and information disclosure concerns.

---

## 1. Threat Actors

| Actor | Access Level | Motivation | Capabilities |
|-------|-------------|------------|--------------|
| **Malicious Student** | Authenticated (student role, approved) | Free access to paid content, inflated grades/scores, certificate fraud, leaderboard manipulation | Can call all student-facing server actions, enumerate UUIDs, manipulate client-side time values |
| **Malicious Mentor** | Authenticated (mentor role, approved) | Data exfiltration, content sabotage, privilege escalation to admin | Can create/modify courses, access enrolled student data via RLS, potentially probe RLS-dependent actions |
| **Unapproved User** | Authenticated (unapproved) | Bypass approval gate, access paid content | Has valid JWT but middleware blocks protected paths; can still call server actions directly if endpoint known |
| **Anonymous Attacker** | Unauthenticated | Account takeover, credential stuffing, payment fraud, DoS | Can target public endpoints (signUp, signIn, OAuth, password reset), attempt rate limit bypass |
| **Compromised Admin** | Full admin access | Data theft, mass privilege changes, financial fraud | Full service-role access, can bypass all RLS, modify payments/enrollments |
| **Insider (Infrastructure)** | Server/env access | Secret exfiltration, DB manipulation | Access to `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, deployment configs |

---

## 2. STRIDE Analysis

### 2.1 API Routes

#### `POST /api/checkout` (`app/api/checkout/route.ts:22`)

| Threat | Category | Risk | Mitigation Present | Residual Risk |
|--------|----------|------|-------------------|---------------|
| Attacker forges origin header to bypass CSRF | Spoofing | Low | Origin/Referer check against `NEXT_PUBLIC_APP_URL` | Low — browsers enforce origin on POST |
| Rate limit bypass via `x-forwarded-for` spoofing | DoS | Medium | Rate limit keyed on `x-forwarded-for` (line 25) | **Medium** — no trusted proxy guarantee |
| Price manipulation via courseId swap | Tampering | Low | Price fetched server-side from DB (line 89) | Mitigated |
| Double-payment race condition | Tampering | Low | Checks existing payment (line 107) but no DB lock | Low — Stripe idempotency helps |

#### `GET /api/check-user` (`app/api/check-user/route.ts:4`)

| Threat | Category | Risk | Mitigation Present | Residual Risk |
|--------|----------|------|-------------------|---------------|
| Non-admin access to user enumeration | Info Disclosure | Low | Admin role check (line 18-22) | Mitigated |
| Admin enumerates all auth users | Info Disclosure | Low | `listUsers()` returns all users (line 44) | Low — admin-only, but no pagination/audit |
| No rate limiting on admin endpoint | DoS | Low | No rate limit | Low — admin-only |

#### `POST /api/webhooks/stripe` (`app/api/webhooks/stripe/route.ts:18`)

| Threat | Category | Risk | Mitigation Present | Residual Risk |
|--------|----------|------|-------------------|---------------|
| Forged webhook events | Spoofing | Low | Stripe signature verification (line 38-42) | Mitigated |
| Replay attacks | Repudiation | Low | Stripe's built-in tolerance window (~5 min) | Low — no app-level replay protection |
| Enrollment on partial refund | Tampering | Low | `charge.refunded` deletes enrollment (line 130) | Low — partial refunds still revoke full access |
| Failed enrollment after payment | Denial of Service | Medium | Logs error but no retry/notification (line 97) | **Medium** — manual intervention needed |

#### `GET /auth/callback` (`app/auth/callback/route.ts:7`)

| Threat | Category | Risk | Mitigation Present | Residual Risk |
|--------|----------|------|-------------------|---------------|
| Code injection via `next` param | Tampering | Low | Validates `next.startsWith('/')` (line 119) | Mitigated — no open redirect |
| Role escalation via Google OAuth | Elevation | Low | Non-student roles blocked from Google SSO (line 76) | Mitigated |
| Auto-approval bypass for non-students | Elevation | Low | Only students auto-approved (line 82-84) | Mitigated |

### 2.2 Server Action Groups

#### Auth Actions (`lib/actions/auth.ts`)

| Threat | Category | Risk | Residual Risk |
|--------|----------|------|---------------|
| Credential stuffing on `signIn` | Spoofing | Medium | Low — rate limited 5/min per email, fails closed |
| Account enumeration via signup | Info Disclosure | Low | Low — generic error messages |
| Password reset flood | DoS | Low | Low — rate limited 3/hr per email |
| Weak password acceptance | Spoofing | Low | Low — min 8 chars enforced, but no complexity rules |

#### Course Actions (`lib/actions/courses.ts`)

| Threat | Category | Risk | Residual Risk |
|--------|----------|------|---------------|
| Unauthorized material modification | Tampering | Medium | **Medium** — `updateMaterial`, `deleteMaterial`, `createSubMaterial`, `updateSubMaterial`, `deleteSubMaterial` (lines 474-571) rely solely on RLS |
| `getAllCoursesAdmin` called by non-admin | Info Disclosure | Low | Low — RLS filters results silently |
| `timeSpent` spoofing in `markSubMaterialCompleted` | Tampering | Medium | **Medium** — client sends arbitrary value, only min 30s check (line 200) |
| Cross-course progress injection | Tampering | Low | Low — enrollment ownership verified, RLS + UNIQUE constraint |

#### Payment Actions (`lib/actions/payments.ts`)

| Threat | Category | Risk | Residual Risk |
|--------|----------|------|---------------|
| `getCoursePayments` info disclosure | Info Disclosure | Medium | **Medium** — no explicit ownership check (line 168), relies on RLS |
| `createPayment` without auth check | Tampering | Low | Low — RLS enforces student_id = uid |

#### Quest Actions (`lib/actions/quests.ts`)

| Threat | Category | Risk | Residual Risk |
|--------|----------|------|---------------|
| Answer leakage via timing/error | Info Disclosure | Low | Mitigated — answers fetched via admin client, separate table |
| `createQuestion`/`updateQuestion` by non-owner | Tampering | Medium | **Medium** — no app-level ownership check (lines 378-435), RLS only |
| Max attempts race condition | Tampering | Low | Low — DB trigger + post-insert cleanup (lines 100-108) |
| Quiz answer brute-force across attempts | Tampering | Low | Low — max_attempts enforced |

#### Gamification Actions (`lib/actions/gamification.ts`)

| Threat | Category | Risk | Residual Risk |
|--------|----------|------|---------------|
| Points inflation via repeated triggers | Tampering | Low | Low — called internally from completion flows |
| Leaderboard data scraping | Info Disclosure | Low | Low — public by design |

#### Enrollment Request Actions (`lib/actions/enrollment-requests.ts`)

| Threat | Category | Risk | Residual Risk |
|--------|----------|------|---------------|
| Spam enrollment requests | DoS | Low | Low — UNIQUE constraint on (student_id, course_id, status) |
| Re-request after rejection | Tampering | Low | **Low-Medium** — UNIQUE allows multiple rejected entries for same course |

---

## 3. Feature Threat Analysis

### 3.1 User Registration

**Assets at Risk:** Profile data, role assignment, approval status
**Trust Assumptions:** Supabase Auth handles email verification securely; DB trigger `handle_new_user()` correctly assigns roles; rate limiter DB is available.

| Abuse Case | Actor | Severity | Likelihood |
|------------|-------|----------|------------|
| Mass account creation to exhaust rate_limits table | Anonymous | Low | Low — 3/hr per email |
| Register as mentor to gain course creation access without approval | Anonymous | Low | Mitigated — mentor requires admin approval |
| Manipulate `raw_user_meta_data` to inject admin role at signup | Anonymous | Low | Mitigated — trigger only auto-approves admin role, and admin creation requires DB seed |

### 3.2 Course Management

**Assets at Risk:** Course content, intellectual property, pricing data
**Trust Assumptions:** RLS policies on `materials` and `sub_materials` correctly enforce instructor ownership; Cloudinary URLs are not guessable.

| Abuse Case | Actor | Severity | Likelihood |
|------------|-------|----------|------------|
| Mentor modifies another mentor's course materials via direct action call | Malicious Mentor | Medium | Low — RLS blocks, but no app-level error |
| Mentor sets price to 0 after approval to bypass payment | Malicious Mentor | Low | Low — `updateCourse` has field allowlist |
| Unpublished course content accessed via direct ID | Student | Low | Low — `getCourseById` blocks unapproved unless owner/admin |

### 3.3 Enrollment (Paid)

**Assets at Risk:** Payment integrity, course access, revenue
**Trust Assumptions:** Stripe webhook signature is valid; `enrollInCourseInternal` is only reachable from webhook/admin context; payment status transitions are one-way.

| Abuse Case | Actor | Severity | Likelihood |
|------------|-------|----------|------------|
| Enroll in paid course without payment via `enrollInCourse` | Student | Low | Mitigated — payment verification in `enrollInCourse` (line 82) |
| Race condition: two simultaneous checkout sessions for same course | Student | Low | Low — existing payment check + Stripe idempotency |
| Webhook replay to double-enroll | External | Low | Low — `enrollInCourseInternal` checks existing enrollment |

### 3.4 Manual Payment

**Assets at Risk:** Financial records, enrollment integrity, PII (bank details, phone)
**Trust Assumptions:** Admin reviews payment proof honestly; Cloudinary proof URLs are not publicly enumerable.

| Abuse Case | Actor | Severity | Likelihood |
|------------|-------|----------|------------|
| Submit fake payment proof image | Student | Medium | Medium — admin must visually verify |
| Enumerate other students' payment proof URLs | Student | Low | Low — Cloudinary URLs are long random strings |
| Spam enrollment requests after rejection | Student | Low | Low-Medium — UNIQUE constraint allows re-requests with different status |

### 3.5 Content Access

**Assets at Risk:** Paid course content (videos, documents), progress integrity
**Trust Assumptions:** RLS on `sub_materials` correctly gates full content to enrolled/instructor/admin; `timeSpent` is meaningful.

| Abuse Case | Actor | Severity | Likelihood |
|------------|-------|----------|------------|
| Speed-run course by sending `timeSpent: 31` for all lessons | Student | Medium | **High** — trivial to automate, only 30s minimum enforced |
| Access sub_material content without enrollment via direct Cloudinary URL | Student | Medium | Low — requires knowing the URL; not exposed in public queries |
| Mark all lessons complete in rapid succession | Student | Medium | Medium — no per-lesson cooldown beyond 30s minimum |

### 3.6 Quizzes

**Assets at Risk:** Answer integrity, academic credibility, certificate validity
**Trust Assumptions:** `quest_correct_options` table is only readable by admin client; max_attempts is atomically enforced by DB trigger.

| Abuse Case | Actor | Severity | Likelihood |
|------------|-------|----------|------------|
| Brute-force answers across max attempts | Student | Low | Low — limited attempts, randomized option order would help |
| Share correct answers between students out-of-band | Student | Medium | Medium — social engineering, not preventable technically |
| Timing attack on answer validation | Student | Low | Low — all options checked regardless of correctness |

### 3.7 Gamification

**Assets at Risk:** Leaderboard integrity, badge legitimacy
**Trust Assumptions:** Points are only awarded through legitimate completion flows; `awardPoints` is not directly callable by students.

| Abuse Case | Actor | Severity | Likelihood |
|------------|-------|----------|------------|
| Inflate points by speed-running courses with `timeSpent: 31` | Student | Medium | **Medium-High** — combines with content access abuse |
| Manipulate streak by enrolling/completing trivial free courses | Student | Low | Low — streak only tracks daily activity |

### 3.8 Skills

**Assets at Risk:** Skill proficiency accuracy
**Trust Assumptions:** `updateSkillProficiency` blocks direct student calls (line 44); only internal/admin can update.

| Abuse Case | Actor | Severity | Likelihood |
|------------|-------|----------|------------|
| Direct call to `updateSkillProficiency` as student | Student | Low | Mitigated — explicit block in code |
| Inflate skills by completing easy courses repeatedly | Student | Low | Low — skills tied to specific courses |

### 3.9 Certificates

**Assets at Risk:** Credential integrity, institutional reputation
**Trust Assumptions:** Certificate generation requires genuine course completion + quiz pass; certificate numbers are unique and non-sequential.

| Abuse Case | Actor | Severity | Likelihood |
|------------|-------|----------|------------|
| Obtain certificate via speed-run (timeSpent abuse) | Student | Medium | **Medium** — if all lessons marked complete with min time |
| Forge certificate by guessing certificate_number | External | Low | Low — UUIDs are not guessable |
| Certificate data visible to all (public SELECT) | Any | Low | Low — by design for verification |

### 3.10 Leaderboard

**Assets at Risk:** Ranking fairness
**Trust Assumptions:** Points are legitimately earned; leaderboard_stats is denormalized correctly.

| Abuse Case | Actor | Severity | Likelihood |
|------------|-------|----------|------------|
| Create multiple accounts to dominate leaderboard | Anonymous | Low | Low — requires email verification per account |
| View other students' total points and streaks | Student | Low | Low — public by design |

### 3.11 Security Tools Catalog

**Assets at Risk:** None significant (read-only catalog)
**Trust Assumptions:** Data is admin-seeded; no user input stored.

| Abuse Case | Actor | Severity | Likelihood |
|------------|-------|----------|------------|
| SQL injection via search/filter | Student | Low | Mitigated — LIKE wildcards escaped in `getAllTools` (line 11) |

### 3.12 Admin User Management

**Assets at Risk:** User accounts, role assignments, platform integrity
**Trust Assumptions:** Admin role is only assignable via DB seed; `prevent_self_privilege_change()` trigger blocks self-elevation; middleware enforces `/admin/*` access.

| Abuse Case | Actor | Severity | Likelihood |
|------------|-------|----------|------------|
| Admin deactivates own account accidentally | Admin | Low | Low — trigger prevents self-modification of role/approval/active |
| Compromised admin escalates another user to admin | Compromised Admin | High | Low — requires compromised credentials |
| Non-admin calls admin server actions directly | Student/Mentor | Medium | Low — explicit role checks on critical actions; RLS on others |

---

## 4. Attack Trees

### 4.1 Goal: Obtain Certificate Without Legitimate Learning

```
[Obtain Certificate Fraudulently]
├── [Speed-run all lessons] ← MEDIUM RISK
│   ├── Call markSubMaterialCompleted with timeSpent=31 for each lesson
│   │   └── Automate via script (enrollment ID + sub_material IDs enumerable)
│   ├── Complete minimum quiz (pass_score threshold)
│   │   └── Brute-force within max_attempts OR collude with other students
│   └── Trigger completeCourse → generateCertificate
│
├── [Manipulate progress directly] ← LOW RISK
│   ├── Call markSubMaterialCompleted with cross-course sub_material_id
│   │   └── BLOCKED: enrollment ownership check + RLS UNIQUE constraint
│   └── Direct DB manipulation
│       └── BLOCKED: RLS prevents INSERT on progress for other enrollments
│
└── [Bypass quiz requirement] ← LOW RISK
    ├── Complete course without quiz (if course has no quests)
    │   └── ALLOWED by design — quiz only required if course has quests
    └── Modify quest pass_score
        └── BLOCKED: only instructor/admin can update quests
```

### 4.2 Goal: Access Paid Course Content Without Payment

```
[Access Paid Content Free]
├── [Bypass payment verification] ← LOW RISK
│   ├── Call enrollInCourse directly without payment
│   │   └── BLOCKED: payment check in enrollInCourse (line 82)
│   ├── Call enrollInCourseInternal as non-admin
│   │   └── BLOCKED: admin role check (line 130)
│   └── Manipulate enrollment_requests approval
│       └── BLOCKED: admin-only approval
│
├── [Access content without enrollment] ← LOW-MEDIUM RISK
│   ├── Guess Cloudinary video URLs
│   │   └── LOW: URLs are long random strings, not indexed
│   ├── Read sub_materials via RLS gap
│   │   └── LOW: RLS gates full content to enrolled/instructor/admin
│   └── Preview content (if preview flag set)
│       └── ALLOWED by design — preview sub_materials are public
│
└── [Exploit refund flow] ← LOW RISK
    ├── Pay → get enrolled → request Stripe refund → retain access
    │   └── BLOCKED: charge.refunded webhook deletes enrollment
    └── Pay → download all content → request refund
        └── LOW: content is streaming (Cloudinary), not downloadable files
```

### 4.3 Goal: Escalate Privileges (Student → Admin)

```
[Privilege Escalation]
├── [Modify own profile role] ← LOW RISK
│   ├── Direct profile UPDATE via Supabase client
│   │   └── BLOCKED: prevent_self_privilege_change() DB trigger
│   ├── Manipulate raw_user_meta_data at signup
│   │   └── BLOCKED: trigger only auto-approves admin, admin requires seed
│   └── Call updateCourse/approveCourse as student
│       └── BLOCKED: explicit role checks
│
├── [Exploit RLS-only actions] ← MEDIUM RISK
│   ├── Call getAllCoursesAdmin as non-admin
│   │   └── LOW: RLS filters results (returns empty), no error
│   ├── Call updateMaterial/deleteSubMaterial on other's course
│   │   └── LOW: RLS blocks, but no app-level error feedback
│   └── Call getCoursePayments for other instructor's course
│       └── MEDIUM: RLS should block, but no explicit check (line 168)
│
└── [Session/token manipulation] ← LOW RISK
    ├── Forge JWT
    │   └── BLOCKED: Supabase validates JWT signature server-side
    ├── Reuse expired session
    │   └── BLOCKED: middleware calls getUser() which validates token
    └── Exploit OAuth callback
        └── BLOCKED: code exchange is one-time, Google SSO restricted to students
```

### 4.4 Goal: Manipulate Leaderboard/Gamification

```
[Leaderboard Manipulation]
├── [Inflate points artificially] ← MEDIUM RISK
│   ├── Speed-run courses (timeSpent=31 per lesson)
│   │   └── MEDIUM: awards 200-800 points per course completion
│   ├── Retake quizzes for points
│   │   └── LOW: max_attempts limits retakes; points may only award on first pass
│   └── Create multiple accounts
│       └── LOW: requires unique email + verification per account
│
├── [Manipulate streak] ← LOW RISK
│   ├── Automate daily activity (mark one lesson/day)
│   │   └── LOW: legitimate use pattern, hard to distinguish
│   └── Reset streak counter
│       └── BLOCKED: leaderboard_stats only writable by admin (RLS)
│
└── [Direct points injection] ← LOW RISK
    ├── Call awardPoints directly
    │   └── LOW: internal function, no direct student-facing endpoint
    └── Modify point_history
        └── BLOCKED: RLS restricts writes
```

---

## 5. Priority Targets for Step 3 Scanning

| Priority | Target | File/Location | Vulnerability Class | Rationale |
|----------|--------|---------------|--------------------:|-----------|
| 1 | RLS-only authorization on material CRUD | `lib/actions/courses.ts:474-571` | Access Control (IDOR) | 6 functions with no app-level ownership check; single point of failure if RLS misconfigured |
| 2 | `timeSpent` client-controlled value | `lib/actions/courses.ts:200` | Business Logic | Trivially spoofable; enables certificate fraud and points inflation |
| 3 | Rate limit key using `x-forwarded-for` | `app/api/checkout/route.ts:25` | Rate Limit Bypass | Header spoofable without trusted proxy; shared bucket on `'unknown'` fallback |
| 4 | RLS-only authorization on quest question CRUD | `lib/actions/quests.ts:378-435` | Access Control (IDOR) | `createQuestion`, `updateQuestion`, `deleteQuestion` — no app-level ownership |
| 5 | `getCoursePayments` no ownership check | `lib/actions/payments.ts:168` | Info Disclosure | Financial data exposure if RLS policy has gaps |
| 6 | CSP `unsafe-inline` for scripts | `next.config.js:67` | XSS (Injection) | Weakens CSP protection; stored XSS in course content could execute |
| 7 | `quest_correct_options` admin client usage | `lib/actions/quests.ts:55` | Data Exposure | Correct answers fetched server-side; verify no leakage in response |
| 8 | Webhook enrollment failure (no retry) | `app/api/webhooks/stripe/route.ts:97` | Business Logic | Payment succeeds but enrollment fails — orphaned payment |
| 9 | `typescript.ignoreBuildErrors: true` | `next.config.js:5` | Misconfig | Type errors masked; potential runtime type confusion |
| 10 | Profile data public SELECT (`USING (true)`) | RLS policy on `profiles` | Info Disclosure | Email, full_name, avatar of all users readable by any authenticated user |
| 11 | `createOption`/`updateOption` uses admin client for `is_correct` | `lib/actions/quests.ts:438-496` | Access Control | RLS-only check on who can call; admin client bypasses RLS for the write |
| 12 | Enrollment request re-submission after rejection | `lib/actions/enrollment-requests.ts:33` | Business Logic (DoS) | UNIQUE on (student_id, course_id, status) allows multiple rejected rows |
| 13 | `img-src https:` in CSP | `next.config.js:67` | SSRF/Exfiltration | Any HTTPS image loadable; potential data exfiltration via image src |
| 14 | Partial refund handling | `app/api/webhooks/stripe/route.ts:130` | Business Logic | Partial refund still revokes full access — may be intentional but worth verifying |
| 15 | `listUsers()` in check-user returns all auth users | `app/api/check-user/route.ts:44` | Performance/DoS | No pagination; large user base could cause memory issues |

---

## 6. Trust Boundaries

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          INTERNET (Untrusted)                            │
│                                                                         │
│  [Browser/Client]  ←──→  [Stripe Hosted Checkout]                       │
│        │                         │                                      │
└────────┼─────────────────────────┼──────────────────────────────────────┘
         │ HTTPS                   │ Webhook (signature-verified)
═════════╪═════════════════════════╪══════════ TRUST BOUNDARY 1 ══════════
         │                         │           (Network Edge)
┌────────┼─────────────────────────┼──────────────────────────────────────┐
│        ▼                         ▼                                      │
│  ┌──────────────────────────────────────────┐                           │
│  │         Next.js Middleware (middleware.ts) │                          │
│  │  • JWT validation (getUser)               │                          │
│  │  • Route protection                       │                          │
│  │  • Role enforcement (admin/mentor)        │                          │
│  │  • Deactivated/unapproved user blocking   │                          │
│  └──────────────┬───────────────────────────┘                           │
│                 │                                                        │
│  ═══════════════╪════════════════════════════ TRUST BOUNDARY 2 ═════════ │
│                 │                (Authenticated Zone)                    │
│                 ▼                                                        │
│  ┌──────────────────────────────────────────┐                           │
│  │       Server Actions / API Routes         │                          │
│  │  • Session verification (getUser)         │                          │
│  │  • Role checks (explicit on some)         │                          │
│  │  • Input validation (Zod on critical)     │                          │
│  │  • Rate limiting (auth + checkout)        │                          │
│  └──────────┬──────────────┬────────────────┘                           │
│             │              │                                             │
│  ═══════════╪══════════════╪═════════════════ TRUST BOUNDARY 3 ═════════ │
│             │              │        (Privileged Operations)              │
│             ▼              ▼                                             │
│  ┌─────────────────┐  ┌─────────────────────┐                          │
│  │ Supabase Client │  │ Supabase Admin Client│                          │
│  │ (anon key + JWT)│  │ (service_role key)   │                          │
│  │ • RLS enforced  │  │ • RLS BYPASSED       │                          │
│  │ • User context  │  │ • Used for:          │                          │
│  └────────┬────────┘  │   - correct answers  │                          │
│           │            │   - payment updates  │                          │
│           │            │   - auto-approval    │                          │
│           │            │   - rate limits      │                          │
│           │            │   - refund enrollment│                          │
│           │            └──────────┬───────────┘                          │
│           │                       │                                      │
│  ═════════╪═══════════════════════╪══════════ TRUST BOUNDARY 4 ═════════ │
│           │                       │           (Data Layer)               │
│           ▼                       ▼                                      │
│  ┌──────────────────────────────────────────┐                           │
│  │          PostgreSQL (Supabase)            │                           │
│  │  • RLS policies (26 tables)              │                           │
│  │  • DB triggers (5 triggers)              │                           │
│  │  • GRANT ALL to authenticated role       │                           │
│  └──────────────────────────────────────────┘                           │
│                                                                         │
│                    DEPLOYMENT ENVIRONMENT                                │
│              (Netlify Serverless / Docker)                               │
└─────────────────────────────────────────────────────────────────────────┘

External Services (Trusted Third Parties):
  • Supabase Auth — JWT issuance, email verification, OAuth
  • Stripe — Payment processing, webhook delivery
  • Cloudinary — Media hosting (videos, documents, payment proofs)
  • Google — OAuth provider (student SSO only)
```

---

## 7. Assumptions & Gaps

### Assumptions (Cannot Verify Statically)

| # | Assumption | Risk if False |
|---|-----------|---------------|
| 1 | RLS policies are correctly configured for all 26 tables | **High** — `GRANT ALL` means RLS is the sole access control; any misconfigured policy = full table access |
| 2 | Supabase Auth JWT validation is cryptographically sound | High — session forgery possible |
| 3 | `x-forwarded-for` is set by a trusted proxy in production | **Medium** — rate limit bypass on checkout if not |
| 4 | Cloudinary URLs are sufficiently random/unguessable | Medium — paid content accessible without enrollment |
| 5 | Stripe webhook secret is properly configured and rotated | Medium — forged webhooks could grant free enrollment |
| 6 | `SUPABASE_SERVICE_ROLE_KEY` is not exposed in client bundles | **High** — full DB bypass if leaked |
| 7 | The `prevent_self_privilege_change()` trigger covers all escalation vectors | Medium — if trigger has edge cases, self-elevation possible |
| 8 | `NEXT_PUBLIC_APP_URL` matches the actual deployment origin | Low — CSRF check would fail or be bypassable |
| 9 | Email verification links are not replayable | Low — Supabase handles this |
| 10 | Docker/Netlify deployment does not expose `.env` or source maps | Medium — secret leakage |

### Gaps (Cannot Determine from Static Analysis)

| # | Gap | Why It Matters |
|---|-----|----------------|
| 1 | Actual RLS policy SQL not fully audited in this model | Need to verify each policy's `USING` and `WITH CHECK` clauses match intended access |
| 2 | No visibility into Supabase Auth configuration (password policy, MFA, session duration) | Weak session config could enable session hijacking |
| 3 | Cloudinary upload permissions and signed URL configuration unknown | Could allow unauthorized uploads or content access |
| 4 | No audit log review for admin actions beyond code-level logging | Compromised admin actions may go undetected |
| 5 | Rate limit table cleanup/TTL mechanism not verified | Table could grow unbounded if cleanup fails |
| 6 | No load testing data — unknown behavior under concurrent quiz submissions | Race conditions in max_attempts may be exploitable under load |
| 7 | Stripe webhook retry behavior on 500 errors | Could cause duplicate enrollments if idempotency not handled |
| 8 | Whether `ignoreBuildErrors: true` masks any security-relevant type errors | Type confusion could lead to runtime vulnerabilities |
| 9 | Production CORS configuration (Supabase project settings) | Misconfigured CORS could allow cross-origin API access |
| 10 | Whether Supabase realtime subscriptions are enabled and what data they expose | Could leak data changes to unauthorized subscribers |

---

## Summary

This is a **well-hardened application** after 5 security assessment cycles. The remaining attack surface is primarily:

1. **Defense-in-depth gaps** — Multiple server actions rely solely on RLS without app-level authorization checks. This is not a vulnerability if RLS is correct, but creates a single point of failure.

2. **Business logic abuse** — The `timeSpent` validation (30s minimum) is trivially bypassable, enabling certificate fraud and leaderboard manipulation. This is the highest-impact remaining issue.

3. **Rate limit bypass potential** — The `x-forwarded-for` key for checkout rate limiting is spoofable without a trusted proxy configuration.

4. **Information disclosure** — Public profile SELECT policy exposes all user emails; `getCoursePayments` lacks explicit ownership verification.

**Recommended focus for Step 3 scanning:** Access control (RLS verification), business logic (timeSpent, enrollment flows), and misconfiguration (CSP, TypeScript build errors, rate limit keys).
