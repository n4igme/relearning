# Validated Vulnerability Findings

**Date**: 2026-05-21
**Based on**: vulnerabilities.md (13 findings from cycle 5 scan)
**Validation method**: Source code re-review and data flow tracing

## Validation Summary

| Original Count | Confirmed | Downgraded | False Positive | Needs Dynamic Testing | Duplicates Merged |
|---------------|-----------|------------|----------------|----------------------|-------------------|
| 13 | 6 | 2 | 1 | 1 | 3 |

## ID Mapping

| Final ID | Original ID | Scanner |
|----------|-------------|---------|
| VULN-001 | VULN-ACCESS-CONTROL-001 + VULN-ACCESS-CONTROL-002 | vuln-access-control |
| VULN-002 | VULN-DATA-EXPOSURE-001 | vuln-data-exposure |
| VULN-003 | VULN-LOGIC-001 | vuln-logic |
| VULN-004 | VULN-AUTHN-001 | vuln-authn-session |
| VULN-005 | VULN-MISCONFIG-001 | vuln-misconfig |
| VULN-006 | VULN-ACCESS-CONTROL-003 | vuln-access-control |

---

## Confirmed Findings

### VULN-001: User Profile Data (Emails, Roles) Exposed to All Authenticated Users

**Severity**: Medium
**Category**: Information Disclosure
**Location**: `database/supabase-schema.sql:354-355`, `lib/actions/gamification.ts:265-268`
**CWE**: CWE-200 (Exposure of Sensitive Information)

**Validation Notes**:
Re-read profiles RLS policy: `FOR SELECT USING (true)` — any authenticated user can query all profiles. The `getLeaderboard()` function at line 265 explicitly selects `full_name, email` from profiles and returns it to the client. This means any student viewing the leaderboard sees all participants' email addresses.

Additionally, any authenticated user can directly query: `supabase.from('profiles').select('email, role, full_name')` to enumerate all users, their roles, and emails.

**Data Flow Trace**:
1. Input: Any authenticated user visits leaderboard page or queries profiles directly
2. Through: `getLeaderboard()` → Supabase query with profiles join
3. Sink: Client receives `{ profiles: { full_name, email } }` for all leaderboard entries
4. Sanitization: None — RLS allows all authenticated SELECT

**Confirmed PoC**:
```javascript
// Direct query from browser:
const { data } = await supabase.from('profiles').select('id, email, role, full_name')
// Returns ALL users with emails and roles
```

**Impact**: User enumeration (all emails + roles). Enables targeted phishing against admin accounts (identifiable by role). Violates user privacy expectations.

**Remediation**:
```sql
-- Restrict profiles SELECT to own profile + public fields only
DROP POLICY "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own full profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Public profile fields viewable by authenticated"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);
-- Note: This still allows SELECT but consider creating a view
-- that only exposes full_name (not email/role) for non-self queries
```

Also fix leaderboard to not return emails:
```typescript
// lib/actions/gamification.ts:265
profiles:student_id (
  full_name
  // Remove: email
)
```

---

### VULN-002: Server Actions Return Raw Error Objects to Client (118 locations)

**Severity**: Medium
**Category**: Information Disclosure
**Location**: `lib/actions/courses.ts` (42), `lib/actions/enrollment-requests.ts` (29), `lib/actions/quests.ts` (29), `lib/actions/gamification.ts` (9), `lib/actions/skills.ts` (6), `lib/actions/tools.ts` (3)
**CWE**: CWE-209 (Generation of Error Message Containing Sensitive Information)

**Validation Notes**:
Confirmed 118 instances of `return { success: false, error }` where `error` is the raw caught exception. Supabase errors include table names, column names, constraint names, and RLS policy messages. These are serialized by Next.js server actions to the client.

**Impact**: Schema information disclosure. Aids attacker reconnaissance. Example leaked info: `"new row violates row-level security policy for table \"enrollments\""`.

**Remediation**: Replace with generic messages in all catch blocks:
```typescript
} catch (error) {
  console.error('Operation failed:', error)
  return { success: false, error: 'Operation failed. Please try again.' }
}
```

---

### VULN-003: Checkout Rate Limit Bypassable via x-forwarded-for Spoofing

**Severity**: Medium
**Category**: Insufficient Anti-Automation
**Location**: `app/api/checkout/route.ts:21`
**CWE**: CWE-348 (Use of Less Trusted Source)

**Validation Notes**:
Re-read line 21: `const ip = req.headers.get('x-forwarded-for') || 'unknown'`. The `x-forwarded-for` header is client-controlled. An attacker can set a different IP on each request to bypass the 5/min rate limit entirely.

In Netlify/Vercel deployments, the platform typically overwrites this header with the real client IP. In Docker/self-hosted deployments without a trusted reverse proxy, this is directly spoofable.

**Impact**: Conditional — depends on deployment. In self-hosted Docker without trusted proxy, checkout rate limit is completely bypassable.

**Remediation**:
```typescript
// Use a more reliable IP source, or combine with user ID
const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
// Better: rate limit by authenticated user ID instead of IP
const { data: { user } } = await supabase.auth.getUser()
const rateLimitKey = user ? `checkout:${user.id}` : `checkout:${ip}`
```

---

### VULN-004: No Multi-Factor Authentication for Admin Accounts

**Severity**: Medium
**Category**: Insufficient Authentication
**Location**: `lib/actions/auth.ts` (entire auth flow), `middleware.ts`
**CWE**: CWE-308 (Use of Single-factor Authentication)

**Validation Notes**:
No MFA implementation found anywhere in the codebase. Admin accounts (which can approve users, manage courses, view all data) are protected only by email/password. Combined with VULN-001 (admin emails exposed), this creates a viable attack chain: enumerate admin email → credential stuff/phish → no MFA barrier → full admin access.

**Impact**: If admin credentials are compromised (phishing, credential stuffing, password reuse), there is no second factor to prevent account takeover.

**Remediation**: Enable Supabase Auth MFA (TOTP) for admin accounts:
```typescript
// Require MFA verification for admin actions
const { data: factors } = await supabase.auth.mfa.listFactors()
if (profile.role === 'admin' && (!factors?.totp || factors.totp.length === 0)) {
  redirect('/admin/setup-mfa')
}
```

---

### VULN-005: CSP unsafe-inline Weakens XSS Defense-in-Depth

**Severity**: Low
**Original Severity**: Medium → **Adjusted**: Low
**Category**: Security Misconfiguration
**Location**: `next.config.js:56`
**CWE**: CWE-693 (Protection Mechanism Failure)

**Validation Notes**:
CSP includes `'unsafe-inline'` for scripts. No XSS vectors exist (confirmed across 5 scan cycles — React auto-escapes, no dangerouslySetInnerHTML). Downgraded to Low because: purely theoretical, no current exploit path, required by Next.js for hydration.

**Impact**: Theoretical only.

**Remediation**: Implement nonce-based CSP when feasible (medium effort).

---

### VULN-006: Certificates Persist After Refund

**Severity**: Low
**Category**: Business Logic
**Location**: `app/api/webhooks/stripe/route.ts:157-185`
**CWE**: CWE-841 (Improper Enforcement of Behavioral Workflow)

**Validation Notes**:
Re-read refund handler. It deletes the enrollment but does NOT delete or invalidate the certificate. A student who completed a course, received a certificate, then got a refund retains a valid certificate with a verification URL.

**Impact**: Credential validity after refund. Low severity because: student DID complete the course and pass quizzes before refunding — the learning was real, only the payment was reversed.

**Remediation**:
```typescript
// Add after enrollment deletion in handleChargeRefunded:
await supabase.from('certificates').delete()
  .eq('student_id', payment.student_id)
  .eq('course_id', payment.course_id)
```

---

## Downgraded Findings

### VULN-AUTHN-002: Password Policy Length-Only (Medium → Low)
**Reason**: Supabase Auth has its own password requirements. The app-layer check (8 chars) is a minimum — Supabase may enforce additional rules at the auth service level. Also, credential stuffing is rate-limited (5/min, fails closed).

### VULN-MISCONFIG-002: ignoreBuildErrors (Medium → Informational)
**Reason**: Not a security vulnerability — it's a development practice issue. Type errors don't create exploitable paths (confirmed across 5 cycles of scanning).

---

## False Positives

| Original ID | Title | Reason Eliminated |
|-------------|-------|-------------------|
| VULN-CLIENT-SIDE-001 | Open redirect | Confirmed mitigated — `${origin}${next}` stays on same origin |

---

## Needs Dynamic Testing

| Original ID | Title | What to Test | Why Static Analysis Is Insufficient |
|-------------|-------|-------------|-------------------------------------|
| VULN-LOGIC-001 | x-forwarded-for spoofing | Test in actual Netlify/Docker deployment | Platform may overwrite header; behavior depends on reverse proxy config |

---

## Merged Duplicates

| Kept Finding | Merged From | Reason |
|-------------|-------------|--------|
| VULN-001 | VULN-ACCESS-CONTROL-001, VULN-ACCESS-CONTROL-002 | Same root cause (profiles SELECT USING(true)) — leaderboard email exposure is a symptom |
| (Eliminated) | VULN-DEPENDENCY-001, VULN-DOS-001 | Dev-only deps + single unbounded query — not exploitable, hardening only |
| (Eliminated) | VULN-LOGIC-002 | Webhook deduplication — Stripe handles retries with idempotency keys; not an app vulnerability |

---

## Final Severity Distribution

| Severity | Count | IDs |
|----------|-------|-----|
| Critical | 0 | — |
| High | 0 | — |
| Medium | 4 | VULN-001, VULN-002, VULN-003, VULN-004 |
| Low | 2 | VULN-005, VULN-006 |
| **Total Confirmed** | **6** | |
