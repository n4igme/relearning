# Bug Bounty Report

**Target**: CyberSec Academy (cybersec-academy)
**Repository**: /Users/nb-dk-0552/Project/relearning
**Assessment Date**: 2026-05-20
**Methodology**: Static source code analysis with data flow tracing
**Scope**: Next.js 15 (TypeScript), Supabase (PostgreSQL + RLS), Stripe integration, server actions, API routes

---

## Executive Summary

A security assessment of the CyberSec Academy e-learning platform identified **7 confirmed vulnerabilities** (1 High, 4 Medium, 2 Low). The most critical finding is an information disclosure vulnerability that exposes quiz answer keys to all authenticated users, completely undermining the platform's academic integrity, certification system, and gamification leaderboard.

The application demonstrates generally sound security practices — Supabase Row Level Security (RLS) effectively prevents most access control attacks, authentication uses server-side token validation, and input handling leverages React's auto-escaping and Zod validation. However, a permissive RLS policy on the `quest_options` table, combined with business logic gaps in the course publishing workflow and rate limiting infrastructure, create exploitable weaknesses.

**Overall Security Posture**: Moderate. The platform's reliance on RLS as the primary access control layer is largely effective, but the quiz answer exposure represents a fundamental design flaw that invalidates the platform's core value proposition (verified learning outcomes). The rate limiting infrastructure is unsuitable for the stated deployment target (Netlify serverless).

### Risk Overview

| Severity | Count | Key Findings |
|----------|-------|--------------|
| Critical | 0 | — |
| High | 1 | Quiz answer key exposure to all users |
| Medium | 4 | Admin approval bypass, ineffective rate limiting, password reset flooding, weak CSP |
| Low | 2 | Quiz race condition (self-DoS), IDOR pattern (RLS-mitigated) |

### Top Recommendations

1. **Restrict `quest_options` RLS policy** — Remove the `is_correct` column from student-accessible queries. This is the highest-impact fix and protects academic integrity, certificates, and leaderboard fairness.
2. **Remove `is_published` from the course update allowlist** — Prevent mentors from bypassing admin approval. Add `is_approved` check to `getCourseById()`.
3. **Replace in-memory rate limiting with a persistent store** — Use Redis, Supabase table, or Netlify Edge rate limiting to ensure anti-automation controls work in serverless deployments.

---

## Detailed Findings

### [HIGH-001] Quiz Answer Key Exposed to All Authenticated Users

**Severity**: High | **CVSS**: 7.5 (AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N) | **CWE**: CWE-200
**Location**: `database/add-missing-rls-policies.sql:210-212`

**Description**:
The `quest_options` table contains a boolean `is_correct` column that identifies correct answers for all quiz questions. The RLS policy grants unrestricted SELECT access to all authenticated users:

```sql
CREATE POLICY "Quest options are viewable by everyone"
  ON public.quest_options FOR SELECT
  USING (true);
```

While the application's `getQuestWithQuestions()` function only selects `id, option_text, order_index` (excluding `is_correct`), students have direct access to the Supabase client via the publicly-exposed anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`). They can bypass the application layer entirely and query the table directly.

**Vulnerable Code**:
```sql
-- database/add-missing-rls-policies.sql:210
CREATE POLICY "Quest options are viewable by everyone"
  ON public.quest_options FOR SELECT
  USING (true);  -- No restriction on columns or rows
```

**Attack Scenario**:
1. Student authenticates normally (email/password or Google OAuth)
2. Opens browser developer console on any authenticated page
3. Executes: `const { data } = await supabase.from('quest_options').select('id, question_id, is_correct').eq('is_correct', true)`
4. Receives all correct answer IDs for every quiz on the platform
5. Submits quiz with known correct answers → 100% score → points → badges → certificate

**Impact**:
- **Academic integrity**: All quiz scores and certificates become meaningless
- **Gamification fairness**: Leaderboard rankings are trivially manipulable
- **Business value**: Certificates issued by the platform lose credibility
- **Scope**: Affects ALL students, ALL quizzes, automatable with a single query

**Remediation**:
```sql
-- Drop the permissive policy
DROP POLICY "Quest options are viewable by everyone" ON public.quest_options;

-- Option A: Create a view that excludes is_correct for non-instructors
CREATE OR REPLACE VIEW public.quest_options_public AS
  SELECT id, question_id, option_text, order_index
  FROM public.quest_options;

-- Grant students access to the view only
CREATE POLICY "Students can view options via view"
  ON public.quest_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quest_questions qq
      JOIN public.quests q ON q.id = qq.quest_id
      JOIN public.courses c ON c.id = q.course_id
      WHERE qq.id = question_id AND c.instructor_id = auth.uid()
    )
  );

-- Option B: Move is_correct to a separate instructor-only table
```

**Effort**: Low (SQL migration only, no application code changes needed)

---

### [MEDIUM-001] Mentor Can Bypass Admin Course Approval

**Severity**: Medium | **CVSS**: 5.4 (AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:L/A:N) | **CWE**: CWE-862
**Location**: `lib/actions/courses.ts:738` (allowlist), `database/supabase-schema.sql:368` (RLS)

**Description**:
The `updateCourse()` function's field allowlist includes `is_published`. A mentor can set their course to published without admin approval. The RLS policy makes any course with `is_published = true` visible to all users. The course detail page (`getCourseById`) does not check `is_approved`, allowing direct URL access to unapproved content.

**Vulnerable Code**:
```typescript
// lib/actions/courses.ts:738
const ALLOWED_FIELDS = ['title', 'description', 'thumbnail_url', 'difficulty',
  'category', 'price', 'learning_objectives', 'prerequisites',
  'is_published'  // ← Allows self-publishing
] as const
```

**Attack Scenario**:
1. Mentor creates a course (starts as `is_published: false, is_approved: false`)
2. Mentor calls `updateCourse(courseId, { is_published: true })`
3. RLS now allows all users to SELECT this course
4. Mentor shares `/courses/{courseId}` URL with students
5. Students can view and enroll in unapproved content

**Impact**: Bypasses content review workflow. Mentors can distribute unreviewed, potentially inappropriate or incorrect educational content. Does not appear in course listings (mitigating factor).

**Remediation**:
```typescript
// Remove is_published from allowlist
const ALLOWED_FIELDS = ['title', 'description', 'thumbnail_url', 'difficulty',
  'category', 'price', 'learning_objectives', 'prerequisites'] as const

// Add approval check in getCourseById
export async function getCourseById(courseId: string) {
  // ... existing code ...
  if (!data.is_approved && data.instructor_id !== user?.id) {
    return { success: false, error: 'Course not available' }
  }
}
```

**Effort**: Low (2 code changes)

---

### [MEDIUM-002] Rate Limiting Ineffective in Serverless Deployment

**Severity**: Medium | **CVSS**: 5.3 (AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L) | **CWE**: CWE-770
**Location**: `lib/rate-limit.ts`

**Description**:
The rate limiter stores state in an in-memory `Map`. In serverless deployments (Netlify Functions), each invocation may receive a fresh execution context with empty memory. Rate limits for login (5/min), signup (3/hour), and checkout (5/min) become ineffective.

**Vulnerable Code**:
```typescript
// lib/rate-limit.ts
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
// This Map is empty on every cold start in serverless
```

**Attack Scenario**:
1. Attacker targets login endpoint against a Netlify deployment
2. Each request may hit a different function instance (cold start)
3. Rate limit counter never accumulates → unlimited login attempts
4. Credential stuffing at full speed against weak passwords

**Impact**: Enables brute force attacks against login, signup spam, and checkout abuse. Only affects serverless deployments; Docker single-instance deployments are protected.

**Remediation**:
```typescript
// Use Upstash Redis (serverless-compatible) or Supabase table
import { Redis } from '@upstash/redis'
const redis = Redis.fromEnv()

export async function checkRateLimit(key: string, opts: { maxRequests: number; windowMs: number }) {
  const current = await redis.incr(key)
  if (current === 1) await redis.pexpire(key, opts.windowMs)
  return { allowed: current <= opts.maxRequests, remaining: Math.max(0, opts.maxRequests - current) }
}
```

**Effort**: Medium (requires adding a dependency and external service)

---

### [MEDIUM-003] No Rate Limiting on Password Reset

**Severity**: Medium | **CVSS**: 5.3 (AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L) | **CWE**: CWE-799
**Location**: `lib/actions/auth.ts:172-189`

**Description**:
The `requestPasswordReset()` function has no rate limiting, unlike `signIn` (5/min) and `signUp` (3/hour). An attacker can trigger unlimited password reset emails to any email address. Supabase Auth has built-in email rate limiting (partially mitigating), but the app layer provides no protection.

**Vulnerable Code**:
```typescript
// lib/actions/auth.ts:172
export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email')?.toString().trim()
  // No rate limit check
  const { error } = await supabase.auth.resetPasswordForEmail(email, { ... })
}
```

**Attack Scenario**:
1. Attacker calls `requestPasswordReset` repeatedly with victim's email
2. Victim's inbox flooded with legitimate reset emails
3. Attacker sends phishing email mimicking the reset flow (blends in with legitimate emails)
4. Victim clicks phishing link → credentials captured

**Impact**: Email flooding for harassment, phishing amplification, potential Supabase email quota exhaustion.

**Remediation**:
```typescript
export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email')?.toString().trim()
  if (!email) { /* ... */ }

  const { checkRateLimit } = await import('@/lib/rate-limit')
  const { allowed } = await checkRateLimit(`reset:${email}`, { maxRequests: 3, windowMs: 3600_000 })
  if (!allowed) {
    redirect('/forgot-password?error=' + encodeURIComponent('Too many requests. Please try again later.'))
  }
  // ... rest
}
```

**Effort**: Low (add 4 lines of code)

---

### [MEDIUM-004] Content Security Policy Weakened by unsafe-inline/unsafe-eval

**Severity**: Medium | **CVSS**: 4.7 (AV:N/AC:H/PR:N/UI:R/S:C/C:L/I:L/A:N) | **CWE**: CWE-693
**Location**: `next.config.js:67`

**Description**:
The CSP `script-src` directive includes `'unsafe-inline'` and `'unsafe-eval'`, which effectively disable CSP's XSS protection. While no XSS vectors currently exist in the application (React auto-escapes all output), this removes a critical defense-in-depth layer.

**Vulnerable Code**:
```javascript
// next.config.js:67
{ key: 'Content-Security-Policy', value: "... script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; ..." }
```

**Impact**: If a future code change introduces an XSS vector (e.g., `dangerouslySetInnerHTML` for rich content), CSP will not prevent exploitation. Currently theoretical — no active XSS path exists.

**Remediation**:
```javascript
// Use nonce-based CSP (Next.js 13+ supports this)
// In next.config.js, use the experimental CSP nonce feature
// Or at minimum, remove 'unsafe-eval' for production builds
{ key: 'Content-Security-Policy', value: "... script-src 'self' 'nonce-{random}' https://js.stripe.com; ..." }
```

**Effort**: Medium (requires testing all pages for breakage after removing unsafe directives)

---

### [LOW-001] Quiz Attempt Race Condition (Self-DoS)

**Severity**: Low | **CVSS**: 3.1 (AV:N/AC:H/PR:L/UI:N/S:U/C:N/I:N/A:L) | **CWE**: CWE-362
**Location**: `lib/actions/quests.ts:60-155`

**Description**:
The quiz submission has a TOCTOU race condition in the max_attempts enforcement. The post-insert guard over-corrects: if more than `max_attempts` concurrent requests arrive, ALL are rolled back (including legitimate ones). This causes self-inflicted denial of attempts rather than allowing extra attempts.

**Impact**: A student sending concurrent quiz submissions could lose all their attempts. Not exploitable for gaining extra attempts. Reliability issue only.

**Remediation**:
```sql
-- Use a database constraint instead
CREATE UNIQUE INDEX idx_quest_attempts_limit
  ON quest_attempts (quest_id, student_id, attempt_number);
-- Or use SELECT FOR UPDATE in the pre-check
```

**Effort**: Medium

---

### [LOW-002] IDOR Pattern on Read Functions (RLS Mitigated)

**Severity**: Low | **CVSS**: 2.0 (AV:N/AC:H/PR:L/UI:N/S:U/C:L/I:N/A:N) | **CWE**: CWE-639
**Location**: `lib/actions/payments.ts`, `lib/actions/skills.ts`, `lib/actions/quests.ts`

**Description**:
Several read functions accept arbitrary user IDs without app-layer authorization checks: `getStudentPayments(studentId)`, `getCoursePayments(courseId)`, `getStudentSkills(studentId)`, `getStudentQuestAttempts(studentId)`. RLS policies prevent actual data leakage — unauthorized queries return empty results.

**Impact**: No data leakage. Defense-in-depth gap only. Functions silently return empty data instead of authorization errors.

**Remediation**:
```typescript
// Add caller verification for proper error handling
export async function getStudentPayments(studentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== studentId) {
    return { success: false, error: 'Unauthorized' }
  }
  // ... existing query
}
```

**Effort**: Low

---

## Remediation Roadmap

| Priority | Finding | Fix | Effort | Timeline |
|----------|---------|-----|--------|----------|
| 1 | HIGH-001 | Restrict quest_options RLS policy to hide `is_correct` from students | Low | Immediate (1 day) |
| 2 | MEDIUM-001 | Remove `is_published` from updateCourse allowlist; add `is_approved` check to getCourseById | Low | 1-2 days |
| 3 | MEDIUM-003 | Add rate limiting to requestPasswordReset | Low | 1 day |
| 4 | MEDIUM-002 | Replace in-memory rate limiter with persistent store (Redis/Upstash) | Medium | 1 week |
| 5 | MEDIUM-004 | Implement nonce-based CSP, remove unsafe-eval | Medium | 1-2 weeks |
| 6 | LOW-001 | Add database-level constraint for quiz max_attempts | Medium | 1 week |
| 7 | LOW-002 | Add app-layer authorization checks on read functions | Low | 2-3 days |

---

## Methodology

| Step | Activity | Output |
|------|----------|--------|
| 1 | Codebase reconnaissance — mapped tech stack, entry points, auth mechanisms, data flows | `assessment/recon.md` |
| 2 | Threat modelling — STRIDE analysis, attack trees, priority ranking | `assessment/threat-model.md` |
| 3 | Vulnerability scanning — 11 targeted scanners based on threat model priorities | `assessment/vulnerabilities.md` |
| 4 | Validation — source code re-review, data flow tracing, false positive elimination | `assessment/validated-vulnerabilities.md` |
| 5 | Report compilation | `assessment/bug-bounty-report.md` |

**Scanners executed**: vuln-access-control, vuln-injection, vuln-data-exposure, vuln-logic, vuln-authn-session, vuln-misconfig, vuln-api, vuln-client-side, vuln-dependency, vuln-dos (11 run, 12 skipped as not applicable)

---

## Scope & Limitations

**In scope**:
- All TypeScript/JavaScript source code in `app/`, `lib/`, `components/`
- Database schema and RLS policies in `database/`
- Configuration files (`next.config.js`, `middleware.ts`, `package.json`)
- API routes and server actions

**Out of scope**:
- Runtime/dynamic testing (no live environment accessed)
- Infrastructure configuration (Netlify/Docker deployment settings)
- Supabase project configuration (auth settings, email templates, rate limits)
- Third-party service configurations (Stripe dashboard, Cloudinary settings)
- `node_modules/` (covered by `npm audit` only)

**Limitations**:
- Static analysis cannot confirm runtime behavior of RLS policies — findings assume policies are applied as written in SQL files
- Serverless cold-start behavior is inferred, not tested
- Supabase's built-in rate limiting configuration is unknown

### Requires Dynamic Testing

| ID | Title | What to Test | Why Static Analysis Is Insufficient |
|----|-------|-------------|-------------------------------------|
| DT-001 | Rate limiting in serverless | Deploy to Netlify, send concurrent requests, verify if rate limits persist | Cannot determine Netlify's function instance reuse strategy from code |
| DT-002 | Supabase email rate limiting | Send 10+ password reset requests, check if Supabase blocks excess | Supabase project-level rate limit config not visible in source code |

---

## Positive Security Observations

The following security controls are well-implemented:

1. **Server-side auth validation** — Uses `supabase.auth.getUser()` (validates JWT) not `getSession()` (client-side only)
2. **Row Level Security** — Comprehensive RLS policies on all 20+ tables; effectively blocks most access control attacks
3. **Input validation** — Zod schemas on critical operations, UUID validation, email format checks
4. **Field allowlists** — `updateCourse()` prevents mass assignment on sensitive fields
5. **Generic error messages** — Login failures don't reveal whether email exists
6. **Security headers** — X-Frame-Options, HSTS, X-Content-Type-Options all properly configured
7. **Stripe webhook verification** — Proper signature validation prevents forged payment events
8. **No injection vectors** — React auto-escaping, parameterized Supabase queries, no shell commands
9. **OAuth restrictions** — Google SSO limited to student role only
10. **Audit logging** — Admin actions tracked with actor, target, and timestamp
