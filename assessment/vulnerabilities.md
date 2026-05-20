# Vulnerability Scan Results — RE-learning Platform

**Date:** 2026-05-21  
**Cycle:** 5 (fully patched)  
**Scanner:** vuln-scan orchestrator  
**Overall:** No Critical/High findings. 12 Medium/Low residual issues identified.

---

## VULN-ACCESS-CONTROL-001: Profiles Table SELECT Policy Exposes All User PII

**Severity**: Medium  
**Confidence**: High  
**Location**: `database/supabase-schema.sql:354-356`  
**Description**: The RLS policy `"Public profiles are viewable by everyone"` uses `USING (true)`, granting any authenticated user SELECT access to all rows in the `profiles` table. This exposes: `email`, `full_name`, `role`, `avatar_url`, `bio`, `is_approved`, `is_active` for every user.  
**Impact**: Any authenticated student can enumerate all platform users, identify admins by role, harvest emails for phishing, and map the user base. Combined with no MFA on admin (VULN-AUTHN-001), this enables targeted credential attacks.  
**Remediation**: Restrict the SELECT policy to return only `id`, `full_name`, and `avatar_url` for non-self rows. Create a view or use column-level security. Example:
```sql
CREATE POLICY "Users can view limited profile data"
    ON public.profiles FOR SELECT
    USING (
      auth.uid() = id  -- Full access to own profile
      OR true          -- Others see row but use column-level RLS or a view
    );
```
Alternatively, create a `public_profiles` view exposing only display fields and restrict direct table access.

---

## VULN-ACCESS-CONTROL-002: Leaderboard Endpoint Exposes User Emails

**Severity**: Medium  
**Confidence**: High  
**Location**: `lib/actions/gamification.ts:262-275`  
**Description**: The `getLeaderboard()` function joins `profiles:student_id (full_name, email)` — explicitly selecting and returning user emails in leaderboard data. This data is served to any authenticated user viewing the leaderboard page.  
**Impact**: Email addresses of top-performing students are exposed to all authenticated users via the leaderboard, enabling targeted spam or phishing.  
**Remediation**: Remove `email` from the leaderboard select query:
```typescript
profiles:student_id (full_name, avatar_url)
```

---

## VULN-ACCESS-CONTROL-003: Certificates Persist After Refund

**Severity**: Low  
**Confidence**: High  
**Location**: `app/api/webhooks/stripe/route.ts:140-170`  
**Description**: The `handleChargeRefunded` function deletes the enrollment record but does not delete or revoke associated certificates from the `certificates` table. A student who completes a course, obtains a certificate, then requests a refund retains a valid, verifiable certificate.  
**Impact**: Students can systematically complete courses, obtain certificates, then refund — acquiring credentials without payment. Certificate verification URLs remain functional.  
**Remediation**: Add certificate deletion in the refund handler after enrollment deletion:
```typescript
await supabase
  .from('certificates')
  .delete()
  .eq('student_id', payment.student_id)
  .eq('course_id', payment.course_id)
```

---

## VULN-DATA-EXPOSURE-001: Raw Error Objects Returned to Client (47 Instances)

**Severity**: Medium  
**Confidence**: High  
**Location**: `lib/actions/courses.ts` (19), `lib/actions/quests.ts` (14), `lib/actions/gamification.ts` (6), `lib/actions/skills.ts` (5), `lib/actions/tools.ts` (3)  
**Description**: 47 instances of `return { success: false, error }` pass raw caught exception objects to the client. These may contain Supabase error details including table names, column names, constraint names, PostgreSQL error codes, and potentially stack traces.  
**Impact**: Attackers can trigger errors intentionally (e.g., constraint violations, invalid UUIDs) to extract database schema information, aiding further attacks.  
**Remediation**: Replace raw error returns with generic messages:
```typescript
catch (error) {
  console.error('Operation failed:', error)
  return { success: false, error: 'An unexpected error occurred. Please try again.' }
}
```

---

## VULN-LOGIC-001: Rate Limit IP Spoofing via X-Forwarded-For

**Severity**: Medium  
**Confidence**: Medium  
**Location**: `app/api/checkout/route.ts:21`  
**Description**: The checkout rate limiter uses `req.headers.get('x-forwarded-for') || 'unknown'` as the rate limit key. This header is attacker-controlled unless the deployment sits behind a trusted reverse proxy that overwrites it. An attacker can rotate `x-forwarded-for` values to bypass the 5 requests/minute limit entirely.  
**Impact**: Unlimited Stripe checkout session creation, potentially causing cost amplification on the Stripe account and enabling brute-force attacks on the checkout flow.  
**Remediation**: Use a more reliable client identifier or validate the proxy chain:
1. If behind a trusted proxy (e.g., Cloudflare, AWS ALB), use the last IP in the chain or a platform-specific header (e.g., `CF-Connecting-IP`).
2. Combine IP with authenticated user ID for rate limiting: `checkout:${user.id}` (already authenticated at that point).
3. Move rate limit check after authentication to use `user.id` as the key.

---

## VULN-LOGIC-002: Webhook Lacks Idempotency/Deduplication

**Severity**: Low  
**Confidence**: Medium  
**Location**: `app/api/webhooks/stripe/route.ts:50-75`  
**Description**: The Stripe webhook handler does not track processed event IDs. Stripe may retry webhook deliveries (up to 3 days), and if the initial response was lost in transit, the same event could be processed multiple times — potentially creating duplicate enrollments or double-awarding points.  
**Impact**: Duplicate enrollment attempts (mitigated by DB UNIQUE constraint), but `updatePaymentStatus` could be called redundantly. More critically, if the enrollment creation succeeds on retry after a partial failure, state inconsistencies could arise.  
**Remediation**: Store processed Stripe event IDs and check before processing:
```typescript
const { data: existing } = await supabase
  .from('processed_webhook_events')
  .select('id')
  .eq('event_id', event.id)
  .single()
if (existing) return NextResponse.json({ received: true })
```

---

## VULN-AUTHN-001: No MFA Enforcement on Admin Accounts

**Severity**: Medium  
**Confidence**: High  
**Location**: `middleware.ts` (no MFA check), `lib/actions/auth.ts` (no MFA enrollment)  
**Description**: Admin accounts use single-factor authentication (email/password) with no option to enable or enforce MFA. Combined with VULN-ACCESS-CONTROL-001 (admin emails discoverable), this creates a viable attack chain for admin account takeover.  
**Impact**: A compromised admin password (via phishing, credential stuffing, or reuse) grants full platform access with no second factor barrier — including user management, course approval, and payment administration.  
**Remediation**: Enable Supabase Auth MFA (TOTP) and enforce it for admin role:
1. Enable MFA in Supabase Auth settings
2. Add MFA enrollment flow for admin users
3. Check `aal2` (Authenticator Assurance Level 2) in middleware for `/admin` routes

---

## VULN-AUTHN-002: Weak Password Policy (Length Only)

**Severity**: Low  
**Confidence**: High  
**Location**: `lib/actions/auth.ts:35-36`  
**Description**: Password validation only enforces minimum 8 characters (`password.length < 8`). No requirements for uppercase, lowercase, digits, or special characters. No check against common/breached passwords.  
**Impact**: Users can set weak passwords like `aaaaaaaa` or `password` that are trivially guessable or present in breach databases.  
**Remediation**: Add complexity requirements:
```typescript
const hasUpper = /[A-Z]/.test(password)
const hasLower = /[a-z]/.test(password)
const hasDigit = /\d/.test(password)
if (!hasUpper || !hasLower || !hasDigit) {
  return { error: 'Password must contain uppercase, lowercase, and a digit' }
}
```

---

## VULN-MISCONFIG-001: CSP Allows unsafe-inline for Scripts and Styles

**Severity**: Medium  
**Confidence**: High  
**Location**: `next.config.js:62`  
**Description**: The Content-Security-Policy header includes `script-src 'self' 'unsafe-inline'` and `style-src 'self' 'unsafe-inline'`. This significantly weakens XSS protections by allowing inline script execution — the primary vector for XSS exploitation.  
**Impact**: If any XSS vector is found (e.g., via a future code change that introduces unsanitized output), the CSP will not block inline script execution. The protection is effectively reduced to same-origin restrictions only.  
**Remediation**: Replace `unsafe-inline` with nonce-based CSP:
1. Generate a per-request nonce in middleware
2. Apply nonce to CSP header: `script-src 'self' 'nonce-{value}'`
3. Pass nonce to Next.js for inline scripts via `<Script nonce={nonce}>`
4. For styles, use `unsafe-inline` only for style-src (lower risk) or migrate to nonce-based styles

---

## VULN-MISCONFIG-002: TypeScript Build Errors Ignored

**Severity**: Low  
**Confidence**: High  
**Location**: `next.config.js:6-9`  
**Description**: `typescript.ignoreBuildErrors: true` allows the application to build and deploy even with TypeScript type errors. This bypasses compile-time type safety, potentially allowing type-confused code paths into production.  
**Impact**: Type errors that would normally prevent deployment (e.g., incorrect function signatures, missing null checks) are silently ignored. This could lead to runtime crashes or logic errors that type checking would have caught.  
**Remediation**: Fix the underlying type issues (noted as "Supabase type narrowing issues" and "Next.js 15 async params types") and remove the flag:
```javascript
typescript: {
  ignoreBuildErrors: false,
}
```

---

## VULN-CLIENT-SIDE-001: Open Redirect Mitigated (Confirmed Safe)

**Severity**: Informational  
**Confidence**: High  
**Location**: `app/auth/callback/route.ts:113-116`  
**Description**: The auth callback accepts a `next` query parameter for post-authentication redirect. The implementation correctly validates that the path starts with `/` before redirecting: `if (next && next.startsWith('/'))`. This prevents open redirect to external domains.  
**Impact**: None — properly mitigated. Relative-path redirects within the application are safe.  
**Remediation**: None required. Current implementation is secure.

---

## VULN-DEPENDENCY-001: Known Vulnerabilities in Dev/Build Dependencies

**Severity**: Low  
**Confidence**: High  
**Location**: `package-lock.json` (transitive dependencies)  
**Description**: `npm audit` reports 12 vulnerabilities (6 moderate, 6 high):
- **flatted** (<3.4.0): Unbounded recursion DoS in parse() — used by ESLint (dev only)
- **rollup** (4.0.0-4.58.0): Arbitrary file write via path traversal — build tool only
- **vite** (7.0.0-7.3.1): Multiple path traversal and WebSocket file read issues — dev server only
- **ajv** (<6.14.0): ReDoS with `$data` option — transitive, dev tooling
- **brace-expansion** (<1.1.13): Process hang via zero-step sequence — dev tooling
- **ws** (8.0.0-8.20.0): Uninitialized memory disclosure — dev server
- **qs**: Prototype pollution — transitive

All high-severity issues are in **build/dev tooling** (rollup, vite) and do not affect the production runtime bundle.  
**Impact**: No production runtime impact. Dev environment could be exploited if an attacker can influence dev server inputs (unlikely in normal workflow).  
**Remediation**: Run `npm audit fix` to update transitive dependencies. For breaking changes: `npm audit fix --force` with testing.

---

## VULN-DOS-001: Unbounded Query in getStudentRank

**Severity**: Low  
**Confidence**: Medium  
**Location**: `lib/actions/gamification.ts:311-314`  
**Description**: `getStudentRank()` fetches ALL rows from `leaderboard_stats` table (`select('student_id, total_points').order(...)`) without a `.limit()` to calculate rank via array index. As the platform scales, this query returns increasingly large result sets.  
**Impact**: With thousands of users, this query transfers excessive data from the database, increasing response time and memory usage. Not exploitable for immediate DoS but degrades performance at scale.  
**Remediation**: Use a database function or window function to calculate rank server-side:
```sql
SELECT rank FROM (
  SELECT student_id, RANK() OVER (ORDER BY total_points DESC) as rank
  FROM leaderboard_stats
) ranked WHERE student_id = $1
```

---

## Summary

| Category | Count | Severities |
|----------|-------|-----------|
| Access Control | 3 | 2 Medium, 1 Low |
| Data Exposure | 1 | 1 Medium |
| Business Logic | 2 | 1 Medium, 1 Low |
| Authentication | 2 | 1 Medium, 1 Low |
| Misconfiguration | 2 | 1 Medium, 1 Low |
| Client-Side | 1 | Informational (mitigated) |
| Dependency | 1 | 1 Low |
| DoS | 1 | 1 Low |
| **Total** | **13** | **6 Medium, 5 Low, 1 Informational** |

### Scanners Confirmed Clean

| Scanner | Result |
|---------|--------|
| **Injection (3a)** | ✅ Clean — No `dangerouslySetInnerHTML`, all DB queries via Supabase parameterized client, React auto-escapes JSX output |
| **API/Mass Assignment (3m)** | ✅ Clean — Field allowlists on course updates, no direct spread of user input into DB operations (1 instance is internal data reshaping in quests.ts:684) |
