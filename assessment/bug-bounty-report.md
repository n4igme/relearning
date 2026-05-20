# Bug Bounty Report

**Target**: RE-learning Platform
**Repository**: /Users/nb-dk-0552/Project/relearning
**Assessment Date**: 2026-05-21
**Assessment Cycle**: 5 (post-remediation verification)
**Methodology**: Static source code analysis with data flow tracing
**Scope**: Next.js 16 (TypeScript), Supabase (PostgreSQL + RLS), Stripe, server actions, API routes, database schemas

---

## Executive Summary

After five iterative assessment and remediation cycles, the RE-learning Platform has achieved a strong security posture with **zero Critical or High severity vulnerabilities**. The remaining **6 confirmed findings** (4 Medium, 2 Low) represent hardening opportunities rather than immediately exploitable attack paths.

The most significant remaining risk is an overly permissive database policy that exposes all user email addresses and roles to any authenticated user. Combined with the absence of multi-factor authentication on admin accounts, this creates a theoretical attack chain: enumerate admin emails → phish/credential-stuff → gain admin access. While this requires social engineering and is not a direct technical exploit, it represents the platform's highest residual risk.

The platform's layered security architecture — Supabase RLS, database triggers, application-level checks, middleware, and rate limiting — provides effective defense-in-depth. All previously identified Critical and High vulnerabilities (role self-escalation, payment bypass, quiz answer exposure, content access bypass, middleware bypass CVE) have been successfully remediated.

### Risk Overview

| Severity | Count | Findings |
|----------|-------|----------|
| Critical | 0 | — |
| High | 0 | — |
| Medium | 4 | Profile data exposure, raw error objects, rate limit IP spoofing, no MFA |
| Low | 2 | CSP unsafe-inline, certificates persist after refund |

### Top Recommendations

1. **Restrict profile visibility** — Remove email from public SELECT policy and leaderboard query. Prevents admin enumeration and user privacy violation. (Low effort)
2. **Sanitize error returns** — Replace 118 raw error returns with generic messages. Prevents schema disclosure. (Medium effort)
3. **Enable MFA for admin accounts** — Add TOTP requirement for admin role. Blocks the most dangerous attack chain. (Medium effort)

---

## Detailed Findings

### [MEDIUM-001] User Profile Data Exposed to All Authenticated Users

**Severity**: Medium | **CVSS**: 5.3 (AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N) | **CWE**: CWE-200
**Location**: `database/supabase-schema.sql:354-355`, `lib/actions/gamification.ts:265`

**Description**:
The `profiles` table RLS policy allows any authenticated user to SELECT all rows with all columns. The leaderboard function explicitly returns user emails. Any student can enumerate all platform users, their email addresses, and their roles (admin/mentor/student).

**Vulnerable Code**:
```sql
-- database/supabase-schema.sql:354
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);
```
```typescript
// lib/actions/gamification.ts:265
profiles:student_id (
  full_name,
  email  // Exposed to all leaderboard viewers
)
```

**Attack Scenario**:
1. Authenticate as any student
2. Query: `supabase.from('profiles').select('email, role').eq('role', 'admin')`
3. Receive all admin email addresses
4. Use for targeted phishing or credential stuffing

**Impact**: User privacy violation. Admin account identification enables targeted attacks. All user emails harvestable for spam/phishing.

**Remediation**:
```typescript
// Fix leaderboard — remove email
profiles:student_id (
  full_name
)
```
```sql
-- Restrict profiles to own row for full data; public name only for others
DROP POLICY "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT
  USING (id = auth.uid());
CREATE POLICY "Authenticated can view public fields" ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);
-- Then use a view or column-level security for public fields
```

**Effort**: Low (leaderboard fix: 1 line; RLS: requires view-based approach for column restriction)

---

### [MEDIUM-002] Server Actions Return Raw Error Objects (118 Locations)

**Severity**: Medium | **CVSS**: 4.3 (AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N) | **CWE**: CWE-209
**Location**: `lib/actions/courses.ts` (42), `lib/actions/enrollment-requests.ts` (29), `lib/actions/quests.ts` (29), `lib/actions/gamification.ts` (9), `lib/actions/skills.ts` (6), `lib/actions/tools.ts` (3)

**Description**:
118 catch blocks across 6 server action files return the raw exception object to the client via `{ success: false, error }`. Supabase errors contain table names, column names, constraint names, and RLS policy violation messages.

**Attack Scenario**:
1. Trigger an error condition (e.g., violate a constraint, hit RLS)
2. Receive error like: `"new row violates row-level security policy for table \"enrollments\""`
3. Learn internal schema details to craft more targeted attacks

**Impact**: Database schema disclosure. Aids reconnaissance for more sophisticated attacks.

**Remediation**:
```typescript
} catch (error) {
  console.error('Operation failed:', error)
  return { success: false, error: 'Operation failed. Please try again.' }
}
```

**Effort**: Medium (118 locations across 6 files — systematic find-and-replace)

---

### [MEDIUM-003] Checkout Rate Limit Bypassable via Header Spoofing

**Severity**: Medium | **CVSS**: 5.3 (AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:N) | **CWE**: CWE-348
**Location**: `app/api/checkout/route.ts:21`

**Description**:
The checkout rate limit uses `x-forwarded-for` header as the rate limit key. This header is client-controlled in deployments without a trusted reverse proxy that overwrites it.

**Vulnerable Code**:
```typescript
const ip = req.headers.get('x-forwarded-for') || 'unknown'
const { allowed } = await checkRateLimit(`checkout:${ip}`, { maxRequests: 5, windowMs: 60_000 })
```

**Attack Scenario**:
1. Set `X-Forwarded-For: random-value-1` on first request
2. Set `X-Forwarded-For: random-value-2` on second request
3. Each request gets its own rate limit bucket → unlimited checkout attempts

**Impact**: Conditional — depends on deployment infrastructure. Netlify/Vercel typically overwrite this header. Self-hosted Docker without trusted proxy is vulnerable.

**Remediation**:
```typescript
// Rate limit by authenticated user ID (more reliable)
const { data: { user } } = await supabase.auth.getUser()
const rateLimitKey = user ? `checkout:user:${user.id}` : `checkout:ip:${ip}`
```

**Effort**: Low (5 lines changed)

---

### [MEDIUM-004] No Multi-Factor Authentication for Admin Accounts

**Severity**: Medium | **CVSS**: 5.9 (AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N) | **CWE**: CWE-308
**Location**: Platform-wide (no MFA implementation exists)

**Description**:
Admin accounts have full platform access (user management, course approval, enrollment approval, all data visibility) but are protected only by single-factor authentication (email + password). Combined with MEDIUM-001 (admin emails exposed), this creates the platform's most dangerous attack chain.

**Attack Scenario**:
1. Enumerate admin emails via profile query (MEDIUM-001)
2. Attempt credential stuffing or send targeted phishing email
3. If credentials obtained → no MFA barrier → full admin access
4. Admin can: approve/reject users, view all payments, manage all courses

**Impact**: Full platform compromise if admin credentials are obtained through any means.

**Remediation**:
```typescript
// Require MFA setup for admin accounts
const { data: { user } } = await supabase.auth.getUser()
const { data: factors } = await supabase.auth.mfa.listFactors()
if (profile.role === 'admin' && (!factors?.totp?.length)) {
  redirect('/admin/setup-mfa')
}
```

**Effort**: Medium (Supabase MFA integration + UI for setup/verification)

---

### [LOW-001] CSP unsafe-inline Weakens XSS Defense

**Severity**: Low | **CVSS**: 3.1 (AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:L/A:N) | **CWE**: CWE-693
**Location**: `next.config.js:56`

**Description**:
CSP `script-src` includes `'unsafe-inline'`. No XSS vectors exist (confirmed across 5 assessment cycles), making this purely theoretical. Required by Next.js for hydration scripts.

**Impact**: Theoretical — defense-in-depth gap only.

**Remediation**: Implement nonce-based CSP when Next.js support matures.

**Effort**: Medium

---

### [LOW-002] Certificates Persist After Refund

**Severity**: Low | **CVSS**: 3.1 (AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:L/A:N) | **CWE**: CWE-841
**Location**: `app/api/webhooks/stripe/route.ts:157-185`

**Description**:
The refund webhook revokes enrollment but does not delete or invalidate certificates. A student who completed a course and received a refund retains a valid, verifiable certificate.

**Impact**: Low — the student did complete the course legitimately before refunding. The certificate reflects real learning, only the payment was reversed.

**Remediation**:
```typescript
// Add after enrollment deletion in refund handler:
await supabase.from('certificates').delete()
  .eq('student_id', payment.student_id)
  .eq('course_id', payment.course_id)
```

**Effort**: Low (3 lines)

---

## Remediation Roadmap

| Priority | Finding | Fix | Effort | Timeline |
|----------|---------|-----|--------|----------|
| 1 | MEDIUM-001 | Remove email from leaderboard; restrict profiles RLS | Low | 1-2 days |
| 2 | MEDIUM-003 | Rate limit by user ID instead of IP | Low | 1 day |
| 3 | MEDIUM-004 | Enable Supabase MFA for admin accounts | Medium | 1-2 weeks |
| 4 | MEDIUM-002 | Replace 118 raw error returns with generic messages | Medium | 3-5 days |
| 5 | LOW-002 | Delete certificates on refund | Low | 1 hour |
| 6 | LOW-001 | Nonce-based CSP | Medium | 2-3 weeks |

---

## Methodology

| Step | Activity | Output |
|------|----------|--------|
| 1 | Codebase reconnaissance (5 cycles) | `assessment/recon.md` |
| 2 | Threat modelling with STRIDE (5 cycles) | `assessment/threat-model.md` |
| 3 | Targeted vulnerability scanning (5 cycles) | `assessment/vulnerabilities.md` |
| 4 | Finding validation and FP elimination (5 cycles) | `assessment/validated-vulnerabilities.md` |
| 5 | Report compilation | `assessment/bug-bounty-report.md` |

**Assessment history**: 5 iterative cycles of scan → validate → fix → rescan. All Critical and High findings from cycles 1-4 have been remediated and verified.

---

## Scope & Limitations

**In scope**: All TypeScript source (`app/`, `lib/`, `components/`), database schemas (`database/`), configuration files, dependencies.

**Out of scope**: Runtime testing, infrastructure config, Supabase project settings, Stripe dashboard, third-party service internals.

### Requires Dynamic Testing

| ID | Title | What to Test | Why Static Analysis Is Insufficient |
|----|-------|-------------|-------------------------------------|
| MEDIUM-003 | Rate limit IP spoofing | Test x-forwarded-for behavior in actual Netlify/Docker deployment | Platform may overwrite header; depends on reverse proxy configuration |

---

## Previously Remediated (Cycles 1-4)

| Cycle | Severity | Finding | Status |
|-------|----------|---------|--------|
| 1 | High | Quiz answer key exposed via quest_options RLS | ✅ Fixed (table separation) |
| 1 | Medium | Mentor self-publishing bypass | ✅ Fixed (allowlist) |
| 1 | Medium | In-memory rate limiting (serverless) | ✅ Fixed (Supabase-based) |
| 2 | High | Next.js middleware bypass CVE | ✅ Fixed (updated to 16.2.6) |
| 2 | Medium | Refund webhook can't revoke access | ✅ Fixed (admin client) |
| 2 | Medium | CSRF check conditional on env var | ✅ Fixed (fail-closed) |
| 3 | Critical | Role self-escalation via profiles UPDATE | ✅ Fixed (DB trigger) |
| 3 | High | enrollInCourseInternal callable by students | ✅ Fixed (admin check) |
| 3 | Medium | updateSkillProficiency direct manipulation | ✅ Fixed (caller check) |
| 4 | High | Paid content readable without enrollment | ✅ Fixed (enrollment-based RLS) |
| 4 | High | Quiz scoring global fetch (DoS) | ✅ Fixed (scoped query) |

---

## Positive Security Observations

1. **Layered defense**: Middleware + server action checks + RLS + DB triggers
2. **Quiz integrity**: Answer separation with instructor-only RLS + admin client scoring
3. **Payment security**: Stripe signature verification + admin client for webhooks + payment verification on enrollment
4. **Role protection**: DB trigger prevents self-escalation of role/approval/active status
5. **Rate limiting**: Persistent (Supabase-based), fails closed for auth paths
6. **Input validation**: Zod schemas, UUID validation, field allowlists
7. **Content protection**: Materials/sub-materials restricted to enrolled students
8. **Atomic constraints**: DB trigger enforces quiz max_attempts
9. **CSRF protection**: Fails closed if misconfigured
10. **Generic auth errors**: No user enumeration via login responses
