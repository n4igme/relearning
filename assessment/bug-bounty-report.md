# Bug Bounty Report

**Target**: RE-learning Platform
**Repository**: /Users/nb-dk-0552/Project/relearning
**Assessment Date**: 2026-05-21
**Assessment Cycle**: 6 (post-remediation verification)
**Methodology**: Static source code analysis with iterative remediation
**Scope**: Next.js 16.2.6 (TypeScript), Supabase (PostgreSQL + RLS), Stripe, 8 server action modules, 4 API routes, 23 pages

---

## Executive Summary

After six iterative assessment and remediation cycles, the RE-learning Platform has **zero Critical or High severity vulnerabilities**. The 7 remaining confirmed findings (5 Medium, 2 Low) represent hardening opportunities that require specific preconditions to exploit and have limited blast radius.

The most actionable remaining risk is a business logic gap: courses without quizzes allow students to earn certificates by rapidly marking lessons as complete (client-controlled `timeSpent` parameter). This devalues certificates for quiz-less courses but does not bypass payment requirements or affect courses with quizzes. Combined with certificates persisting after refunds, this creates a "pay → speed-complete → refund → keep certificate" attack chain for quiz-less paid courses.

The platform's security architecture is robust: Supabase RLS enforces access control at the database layer, database triggers prevent privilege escalation, rate limiting is persistent and fails closed for authentication paths, quiz answers are stored in a separate instructor-only table, and content access requires enrollment. The remaining findings are primarily information disclosure (profile emails, error messages) and missing defense-in-depth controls (MFA, CSP nonces).

### Risk Overview

| Severity | Count | Findings |
|----------|-------|----------|
| Critical | 0 | — |
| High | 0 | — |
| Medium | 5 | Certificate fraud on quiz-less courses, profile email exposure, no MFA, certificate persistence after refund, raw error disclosure |
| Low | 2 | Rate limit IP spoofing (conditional), CSP unsafe-inline |

### Top Recommendations

1. **Add certificate deletion to refund webhook** — Prevents the "complete → refund → keep cert" chain. 5-minute fix, highest ROI.
2. **Remove email from leaderboard query** — Stops admin enumeration and user privacy violation. 1-line fix.
3. **Require quizzes for certificate-eligible courses** — Prevents timeSpent spoofing from yielding certificates. Design decision.

---

## Detailed Findings

### [MEDIUM-001] Certificate Fraud via timeSpent Spoofing on Quiz-less Courses

**Severity**: Medium | **CVSS**: 5.4 (AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:L/A:N) | **CWE**: CWE-20
**Location**: `lib/actions/courses.ts:180`, `lib/actions/courses.ts:326`

**Description**:
The `markSubMaterialCompleted` function accepts a client-provided `timeSpent` parameter and only validates it is ≥ 30 seconds. There is no server-side timing verification. When course progress reaches 100%, `completeCourse()` checks if the course has published quizzes — if it does, at least one must be passed. If the course has **zero published quizzes**, a certificate is issued based on progress alone.

**Vulnerable Code**:
```typescript
// lib/actions/courses.ts:190
if (timeSpent < 30) {
  return { success: false, error: 'Insufficient time spent on material' }
}
// No server-side timestamp tracking — client controls the value

// lib/actions/courses.ts:326
if (quests && quests.length > 0) {
  // Quiz check only runs if course HAS quizzes
  // Courses without quizzes skip this entirely
}
```

**Attack Scenario**:
1. Student enrolls in a free course with 5 lessons and no quizzes
2. Calls `markSubMaterialCompleted(enrollmentId, lessonId, 31)` for each lesson
3. Total time: ~155 seconds (under 3 minutes)
4. Progress reaches 100% → certificate auto-generated
5. Certificate is valid and verifiable at `/certificates/{number}`

**Impact**: Certificates for quiz-less courses can be earned in under 3 minutes regardless of actual content length. Devalues the platform's certification credibility for affected courses. Does NOT affect courses with quizzes (quiz pass still required).

**Remediation**:
```typescript
// Option A: Require at least one published quiz for certification
if (!quests || quests.length === 0) {
  // Don't generate certificate for quiz-less courses
  // Or generate a "participation" certificate with different styling
  return
}

// Option B: Server-side timing (more complex)
// Record lesson_opened_at timestamp, validate elapsed >= video_duration
```

**Effort**: Low (Option A: 3 lines) / Medium (Option B: new DB column + logic)

---

### [MEDIUM-002] User Profile Data (Emails, Roles) Exposed to All Authenticated Users

**Severity**: Medium | **CVSS**: 5.3 (AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N) | **CWE**: CWE-200
**Location**: `database/supabase-schema.sql:354`, `lib/actions/gamification.ts:266`

**Description**:
The `profiles` table has a SELECT RLS policy `USING (true)` — any authenticated user can read all profiles including email addresses and roles. The leaderboard function explicitly returns emails to the client.

**Vulnerable Code**:
```sql
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);
```
```typescript
// lib/actions/gamification.ts:266
profiles:student_id ( full_name, email )
```

**Attack Scenario**:
```javascript
const { data } = await supabase.from('profiles').select('email, role').eq('role', 'admin')
// Returns all admin email addresses
```

**Impact**: All user emails harvestable. Admin accounts identifiable by role. Enables targeted phishing against administrators.

**Remediation**:
```typescript
// Remove email from leaderboard
profiles:student_id ( full_name )
```

**Effort**: Low (1 line for leaderboard; RLS change requires view-based approach for column restriction)

---

### [MEDIUM-003] No Multi-Factor Authentication for Admin Accounts

**Severity**: Medium | **CVSS**: 5.9 (AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N) | **CWE**: CWE-308
**Location**: Platform-wide

**Description**:
Admin accounts have full platform access but are protected only by email + password. Combined with MEDIUM-002 (admin emails exposed), the attack chain is: enumerate admin email → credential stuff or phish → no MFA → full admin access.

**Impact**: Full platform compromise if admin credentials are obtained through any means.

**Remediation**: Enable Supabase Auth MFA (TOTP) for admin accounts.

**Effort**: Medium (Supabase MFA integration + setup UI)

---

### [MEDIUM-004] Certificates Persist After Refund

**Severity**: Medium | **CVSS**: 5.4 (AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:L/A:N) | **CWE**: CWE-841
**Location**: `app/api/webhooks/stripe/route.ts:175-190`

**Description**:
The refund webhook deletes the enrollment but does not delete or invalidate the certificate. A student who completed a course and received a refund retains a valid, verifiable certificate.

**Attack Scenario**:
1. Pay for course → complete it → receive certificate
2. Request Stripe refund → enrollment deleted, payment marked refunded
3. Certificate remains valid at `/certificates/{number}`

**Impact**: Revenue loss combined with credential retention. Enables "pay → complete → refund → keep cert" pattern.

**Remediation**:
```typescript
// Add after enrollment deletion in handleChargeRefunded:
await supabase.from('certificates').delete()
  .eq('student_id', payment.student_id)
  .eq('course_id', payment.course_id)
```

**Effort**: Low (3 lines)

---

### [MEDIUM-005] Server Actions Return Raw Error Objects (118 Locations)

**Severity**: Medium | **CVSS**: 4.3 (AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N) | **CWE**: CWE-209
**Location**: 6 files in `lib/actions/` (118 total instances)

**Description**:
Server action catch blocks return raw Supabase error objects to the client, exposing table names, column names, constraint names, and RLS policy messages.

**Impact**: Database schema disclosure aids attacker reconnaissance.

**Remediation**: Replace with generic messages; log details server-side.

**Effort**: Medium (118 locations — systematic find-and-replace)

---

### [LOW-001] Checkout Rate Limit Bypassable via Header Spoofing

**Severity**: Low | **CVSS**: 3.7 (AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:L/A:N) | **CWE**: CWE-348
**Location**: `app/api/checkout/route.ts:21`

**Description**:
Rate limit uses `x-forwarded-for` header as key. Spoofable in self-hosted deployments without trusted proxy. Production platforms (Netlify/Vercel) overwrite this header.

**Impact**: Conditional — only in self-hosted Docker without reverse proxy.

**Remediation**: Rate limit by authenticated user ID.

**Effort**: Low

---

### [LOW-002] CSP unsafe-inline for Scripts

**Severity**: Low | **CVSS**: 3.1 (AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:L/A:N) | **CWE**: CWE-693
**Location**: `next.config.js:56`

**Description**:
CSP `script-src` includes `'unsafe-inline'`. No XSS vectors exist (confirmed across 6 cycles). Required by Next.js for hydration.

**Impact**: Theoretical defense-in-depth gap only.

**Remediation**: Nonce-based CSP when Next.js support matures.

**Effort**: Medium

---

## Remediation Roadmap

| Priority | Finding | Fix | Effort | Timeline |
|----------|---------|-----|--------|----------|
| 1 | MEDIUM-004 | Delete certificates on refund | Low | 1 hour |
| 2 | MEDIUM-002 | Remove email from leaderboard query | Low | 30 min |
| 3 | MEDIUM-001 | Require quiz for certificate eligibility | Low | 1 day |
| 4 | LOW-001 | Rate limit by user ID | Low | 1 day |
| 5 | MEDIUM-003 | Enable MFA for admin accounts | Medium | 1-2 weeks |
| 6 | MEDIUM-005 | Sanitize 118 error returns | Medium | 3-5 days |
| 7 | LOW-002 | Nonce-based CSP | Medium | 2-3 weeks |

---

## Methodology

| Step | Activity | Cycles | Output |
|------|----------|--------|--------|
| 1 | Codebase reconnaissance | 6 | `assessment/recon.md` (457 lines) |
| 2 | Threat modelling (STRIDE) | 6 | `assessment/threat-model.md` (492 lines) |
| 3 | Vulnerability scanning | 6 | `assessment/vulnerabilities.md` |
| 4 | Validation & FP elimination | 6 | `assessment/validated-vulnerabilities.md` |
| 5 | Report compilation | 6 | `assessment/bug-bounty-report.md` |

**Iterative approach**: Each cycle scanned → validated → fixed → rescanned. 11 Critical/High vulnerabilities were identified and remediated across cycles 1-5 before this final verification cycle confirmed zero Critical/High remain.

---

## Scope & Limitations

**In scope**: All TypeScript source, database schemas, configuration files, dependencies.

**Out of scope**: Runtime testing, infrastructure config, Supabase project settings, Stripe dashboard.

### Requires Dynamic Testing

| ID | Title | What to Test | Why Static Analysis Is Insufficient |
|----|-------|-------------|-------------------------------------|
| LOW-001 | Rate limit IP spoofing | Test x-forwarded-for in Netlify deployment | Platform may overwrite header |

---

## Previously Remediated (Cycles 1-5)

| Severity | Finding | Fix Applied |
|----------|---------|-------------|
| Critical | Role self-escalation via profiles UPDATE | DB trigger blocks role/approval/active self-change |
| High | Quiz answer key exposed (quest_options) | Moved to separate table with instructor-only RLS |
| High | enrollInCourseInternal callable by students | Admin role check added |
| High | Paid content readable without enrollment | Enrollment-based RLS on materials/sub_materials |
| High | Next.js middleware bypass CVE | Updated to 16.2.6 |
| High | Quiz scoring global fetch (DoS) | Scoped to current quest options |
| Medium | Mentor self-publishing bypass | Removed is_published from allowlist |
| Medium | In-memory rate limiting (serverless) | Supabase-based persistent store |
| Medium | Refund webhook can't revoke access | Admin client for enrollment deletion |
| Medium | CSRF conditional on env var | Fails closed if unset |
| Medium | updateSkillProficiency manipulation | Caller verification added |

---

## Security Architecture Summary

The platform implements defense-in-depth across 5 layers:

1. **Network**: Security headers (HSTS, X-Frame-Options, CSP, Referrer-Policy)
2. **Application**: Middleware role checks, server action auth verification, Zod validation, field allowlists
3. **Database**: RLS on all 22 tables, DB triggers (role escalation, max_attempts)
4. **Infrastructure**: Persistent rate limiting (fails closed for auth), Stripe signature verification
5. **Design**: Quiz answer separation, enrollment-gated content, admin approval workflows
