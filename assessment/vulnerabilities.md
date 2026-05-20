# Vulnerability Findings — Access Control

**Scanner**: vuln-access-control (3b)
**Date**: 2026-05-20
**Scope**: IDOR, missing authorization, privilege escalation

---

## VULN-AC-01: Quiz Answer Key Exposed to All Authenticated Users

**Severity**: High
**Confidence**: High
**Location**: `database/add-missing-rls-policies.sql:210-212`, `lib/actions/quests.ts:getQuestWithQuestions()`

**Description**:
The `quest_options` table has a SELECT RLS policy `"Quest options are viewable by everyone"` with `USING (true)`. This means any authenticated user can read the `is_correct` field on all quiz options, revealing the complete answer key for every quiz.

While `getQuestWithQuestions()` only selects `id, option_text, order_index` (excluding `is_correct`), a student can bypass this by querying Supabase directly using the anon key + their session token:

```javascript
const { data } = await supabase
  .from('quest_options')
  .select('id, question_id, option_text, is_correct')
```

**Impact**: Complete academic integrity compromise. Any student can obtain 100% on all quizzes, earn undeserved certificates, and inflate leaderboard rankings.

**Proof of Concept**:
1. Authenticate as any student
2. Use Supabase client directly: `supabase.from('quest_options').select('*, is_correct')`
3. All correct answers for all quizzes are returned

**Remediation**: Change the RLS policy to exclude `is_correct` from student reads, or create a view that omits the column for non-instructors. Alternatively, use a column-level security approach or split correct answers into a separate table with restricted access.

---

## VULN-AC-02: Missing App-Layer Authorization on Material Mutations (RLS Compensates)

**Severity**: Low
**Confidence**: Medium
**Location**: `lib/actions/courses.ts` — `updateMaterial()`, `deleteMaterial()`, `createSubMaterial()`, `updateSubMaterial()`, `deleteSubMaterial()`

**Description**:
These server action functions accept arbitrary IDs without verifying that the caller owns the parent course. However, RLS policies in `add-missing-rls-policies.sql` restrict mutations to the course instructor (`c.instructor_id = auth.uid()`).

The vulnerability is **defense-in-depth failure**: if RLS policies are ever misconfigured, dropped during migration, or bypassed (e.g., via admin client misuse), these functions become fully exploitable. The app layer provides zero protection.

**Impact**: Currently mitigated by RLS. If RLS fails, any authenticated user could modify/delete any course's materials.

**Remediation**: Add ownership verification in the server action functions (matching the pattern used in `createMaterial()` and `updateCourse()`). This provides defense-in-depth.

---

## VULN-AC-03: Missing App-Layer Authorization on Question/Option CRUD (RLS Compensates)

**Severity**: Low
**Confidence**: Medium
**Location**: `lib/actions/quests.ts` — `createQuestion()`, `updateQuestion()`, `deleteQuestion()`, `createOption()`, `updateOption()`, `deleteOption()`

**Description**:
Same pattern as VULN-AC-02. These functions perform no ownership verification. RLS policies on `quest_questions` and `quest_options` restrict mutations to the course instructor via multi-table joins.

Note: `createQuest()`, `updateQuest()`, `deleteQuest()` DO have proper ownership checks — the inconsistency suggests the question/option functions were an oversight.

**Impact**: Currently mitigated by RLS. Defense-in-depth gap.

**Remediation**: Add ownership verification matching the pattern in `createQuest()`.

---

## VULN-AC-04: IDOR on Student Payment History

**Severity**: Medium
**Confidence**: Medium
**Location**: `lib/actions/payments.ts` — `getStudentPayments(studentId)`, `getCoursePayments(courseId)`

**Description**:
`getStudentPayments(studentId)` accepts an arbitrary `studentId` parameter with no verification that the caller is that student. However, the RLS policy `"Students can view own payments"` restricts SELECT to `student_id = auth.uid()`.

For `getCoursePayments(courseId)`, the RLS policy `"Instructors can view payments for own courses"` restricts access to the course instructor.

The app-layer IDOR exists but is mitigated by RLS — the query will return empty results for unauthorized callers rather than throwing an error.

**Impact**: No data leakage due to RLS. However, the function silently returns empty data instead of an authorization error, which could confuse legitimate debugging and masks the access control gap.

**Remediation**: Add caller verification (`user.id === studentId` check) for defense-in-depth and proper error messaging.

---

## VULN-AC-05: IDOR on Student Quest Attempts — Mentors Can View All

**Severity**: Low
**Confidence**: High
**Location**: `lib/actions/quests.ts` — `getStudentQuestAttempts(studentId)`, RLS policy in `add-missing-rls-policies.sql:253`

**Description**:
The RLS policy for `quest_attempts` is `student_id = auth.uid()` — students can only see their own attempts. However, the app function `getStudentQuestAttempts(studentId)` has no app-layer check.

Since the Supabase client uses the anon key with the user's session, RLS correctly blocks cross-student access. This is properly mitigated.

**Impact**: None — RLS enforces correctly.

**Remediation**: Add app-layer check for defense-in-depth.

---

## VULN-AC-06: Student Skills Viewable by All Mentors

**Severity**: Low
**Confidence**: High
**Location**: `database/supabase-schema.sql:560-564`, `lib/actions/skills.ts` — `getStudentSkills(studentId)`

**Description**:
The RLS policy for `student_skills` allows SELECT when `student_id = auth.uid() OR role IN ('admin', 'mentor')`. This means ANY mentor can view ANY student's skill progress, not just students in their own courses.

The app function `getStudentSkills(studentId)` has no additional restriction.

**Impact**: Minor privacy concern — mentors can view skill data of students not enrolled in their courses. Low sensitivity data (skill levels, not PII).

**Remediation**: Restrict mentor access to students enrolled in their courses via a more specific RLS policy.

---

## VULN-AC-07: `getAllCoursesAdmin` Lacks Function-Level Admin Check

**Severity**: Medium
**Confidence**: Medium
**Location**: `lib/actions/courses.ts` — `getAllCoursesAdmin()`

**Description**:
This function queries all courses (including unpublished/unapproved) without verifying the caller is an admin. It relies entirely on:
1. Page-level middleware (only protects the `/admin/courses` page route)
2. RLS policy `"Admins can view all courses"` (restricts to admin role)

A non-admin user calling this server action directly would get results filtered by RLS (only published courses visible to them via the general SELECT policy). However, the function name and intent suggest it should be admin-only.

**Impact**: Non-admin callers get published courses only (same as `getPublishedCourses()`). No actual privilege escalation due to RLS. But the function could leak unpublished course metadata if RLS is misconfigured.

**Remediation**: Add `role === 'admin'` check at the function level.

---

## VULN-AC-08: `is_published` in Course Update Allowlist Enables Self-Publishing

**Severity**: Medium
**Confidence**: High
**Location**: `lib/actions/courses.ts` — `updateCourse()`, line with `ALLOWED_FIELDS`

**Description**:
The field allowlist for `updateCourse()` includes `is_published`. This means a mentor can publish their own course without admin approval by calling:

```javascript
updateCourse(courseId, { is_published: true })
```

The course still has `is_approved: false` (not in allowlist), and `getPublishedCourses()` filters by both `is_published: true` AND `is_approved: true`. So the course won't appear in the public listing.

However, if any code path checks only `is_published` without also checking `is_approved`, the course could be accessible.

**Impact**: Limited — course won't appear in public listings due to dual-check in `getPublishedCourses()`. But direct URL access to `/courses/[slug]` may not enforce the `is_approved` check.

**Remediation**: Remove `is_published` from the allowlist, or add a separate `publishCourse()` function that requires admin approval status.

---

## Summary

| ID | Finding | Severity | Confidence | RLS Mitigated? |
|----|---------|----------|------------|----------------|
| AC-01 | Quiz answer key exposed via quest_options SELECT policy | High | High | No — RLS IS the problem |
| AC-02 | Missing auth on material mutations | Low | Medium | Yes |
| AC-03 | Missing auth on question/option CRUD | Low | Medium | Yes |
| AC-04 | IDOR on payment history | Medium | Medium | Yes (returns empty) |
| AC-05 | IDOR on quest attempts | Low | High | Yes |
| AC-06 | Student skills viewable by all mentors | Low | High | By design (broad policy) |
| AC-07 | getAllCoursesAdmin lacks admin check | Medium | Medium | Partially |
| AC-08 | Self-publishing via updateCourse allowlist | Medium | High | No |


---

# Vulnerability Findings — Injection

**Scanner**: vuln-injection (3a)
**Date**: 2026-05-20
**Scope**: SQL injection, command injection, SSTI, XSS, NoSQL injection

---

## VULN-INJ-01: PostgREST Filter Injection in Tools Search

**Severity**: Low
**Confidence**: Low
**Location**: `lib/actions/tools.ts:37-39`

**Description**:
The `getAllTools()` function constructs a PostgREST `.or()` filter string using template literal interpolation:

```typescript
const escaped = filters.searchQuery.replace(/[%_\\]/g, '\\$&')
query = query.or(
  `name.ilike.%${escaped}%,description.ilike.%${escaped}%`
)
```

The escaping only handles SQL LIKE wildcards (`%`, `_`, `\`), but does NOT escape PostgREST filter syntax characters (`,`, `.`, `(`). A crafted input like `test,id.gt.0` could potentially inject additional filter conditions into the `.or()` clause.

However, PostgREST's parser is strict and would likely reject malformed filter syntax rather than executing it. The Supabase JS client also provides some protection.

**Impact**: Unlikely to be exploitable in practice. Worst case: filter manipulation to bypass intended search constraints. No data modification possible via SELECT queries.

**Proof of Concept**: Requires testing against live PostgREST to confirm if filter injection is possible.

**Remediation**: Use parameterized filter approach or validate/sanitize the search query to only allow alphanumeric characters and spaces.

---

## VULN-INJ-02: No XSS Vectors Found (React Auto-Escaping)

**Severity**: N/A (Informational)
**Confidence**: High

**Description**:
All user-controlled content (course descriptions, lesson content, quiz text, tool descriptions) is rendered via React JSX `{variable}` syntax which auto-escapes HTML entities. No usage of `dangerouslySetInnerHTML` or `innerHTML` was found in the codebase.

No command injection (`exec`, `spawn`), code injection (`eval`, `Function`), or SSTI patterns were found.

**Conclusion**: The application is well-protected against injection attacks due to:
1. Supabase client library uses parameterized queries (no raw SQL)
2. React auto-escapes all rendered content
3. No shell command execution
4. No template engine usage (Next.js RSC/JSX only)
5. Tools search properly escapes LIKE wildcards

---

## Summary

| ID | Finding | Severity | Confidence |
|----|---------|----------|------------|
| INJ-01 | PostgREST filter injection in tools search | Low | Low |
| INJ-02 | No XSS/command/SQL injection vectors | N/A | High |


---

# Vulnerability Findings — Data Exposure

**Scanner**: vuln-data-exposure (3c)
**Date**: 2026-05-20
**Scope**: Secrets in code, verbose errors, PII in logs, missing encryption

---

## VULN-DE-01: Real Supabase Project URL in Committed Example File

**Severity**: Low
**Confidence**: High
**Location**: `.env.local.example:10`

**Description**:
The `.env.local.example` file contains a real Supabase project URL:
```
NEXT_PUBLIC_SUPABASE_URL=https://exzotubtpfniisocrpnd.supabase.co
```

While the anon key placeholder is `your_supabase_anon_key` (not real), the project URL itself reveals the actual Supabase project identifier. This is also referenced in `docs/PLATFORM-REVIEW.md`.

**Impact**: Low — the Supabase URL is semi-public (exposed in client-side code anyway via `NEXT_PUBLIC_` prefix). However, it enables targeted reconnaissance against the Supabase project (checking if it's active, probing PostgREST endpoints).

**Remediation**: Replace with a placeholder like `https://your-project.supabase.co`.

---

## VULN-DE-02: Server-Side Error Logging May Contain Sensitive Context

**Severity**: Low
**Confidence**: Low
**Location**: Multiple files in `lib/actions/` (71 `console.error` calls)

**Description**:
All server action error handlers log the raw error object via `console.error('Error ...:', error)`. In production, these logs may contain:
- Database query details (table names, column values)
- Supabase error messages with row data
- Stack traces revealing internal file paths

These are server-side only (not returned to clients), but if logs are shipped to a monitoring service without redaction, sensitive data could be exposed.

**Impact**: No direct client exposure. Risk depends on log aggregation setup.

**Remediation**: Consider structured logging with PII redaction for production. Error responses to clients are already generic (good).

---

## VULN-DE-03: No Sensitive Data Returned in API Error Responses (Positive Finding)

**Severity**: N/A (Informational)
**Confidence**: High

**Description**:
All API routes return generic error messages to clients:
- `{ error: 'Unauthorized' }` (not "User X not found")
- `{ error: 'Database error' }` (not the actual DB error)
- `{ error: 'Failed to create checkout session' }` (not Stripe error details)

No stack traces, internal paths, or raw error objects are returned to clients.

---

## VULN-DE-04: Test Fixtures Contain Hardcoded Passwords (Non-Issue)

**Severity**: N/A (Informational)
**Confidence**: High
**Location**: `test-utils/fixtures/test-data.ts:77-89`

**Description**:
Test fixtures contain `password: 'TestPassword123!'`. These are test-only values, not production credentials. The file is in a test utilities directory and not deployed.

---

## Summary

| ID | Finding | Severity | Confidence |
|----|---------|----------|------------|
| DE-01 | Real Supabase URL in example file | Low | High |
| DE-02 | Server-side error logging may contain sensitive context | Low | Low |
| DE-03 | API error responses are properly generic | N/A | High |
| DE-04 | Test passwords (non-issue) | N/A | High |


---

# Vulnerability Findings — Business Logic

**Scanner**: vuln-logic (3g)
**Date**: 2026-05-20
**Scope**: Race conditions, rate limiting bypass, workflow bypass

---

## VULN-LOGIC-01: Quiz Max Attempts Race Condition (TOCTOU)

**Severity**: Medium
**Confidence**: Medium
**Location**: `lib/actions/quests.ts:60-70` (pre-check) and `lib/actions/quests.ts:142-155` (post-insert guard)

**Description**:
The quiz submission flow has a Time-of-Check-to-Time-of-Use (TOCTOU) vulnerability:

1. **Pre-check** (line 60): Counts existing attempts, rejects if `>= max_attempts`
2. **Insert** (line 135): Inserts the new attempt
3. **Post-check** (line 142): Re-counts attempts, deletes if `> max_attempts`

Between steps 1 and 2, concurrent requests can pass the pre-check simultaneously. The post-check (step 3) attempts to compensate by deleting excess attempts, but:
- Multiple concurrent requests could all pass the pre-check
- The post-check deletes only the current attempt, not others that also slipped through
- If N concurrent requests arrive, up to N-1 extra attempts could persist (each post-check only sees its own excess)

**Impact**: Students can exceed the maximum attempt limit by sending concurrent requests. With `max_attempts: 3`, a student could potentially get 5-10 attempts by timing requests carefully. This undermines quiz integrity and allows score optimization through extra attempts.

**Proof of Concept**:
```javascript
// Send 5 concurrent requests when max_attempts = 3
const promises = Array(5).fill(null).map(() => 
  submitQuestAttempt(questId, studentId, answers)
);
await Promise.all(promises);
// Result: 3-5 attempts may succeed
```

**Remediation**: Use a database-level constraint (unique partial index or trigger) or a distributed lock (e.g., advisory lock in PostgreSQL) to enforce max_attempts atomically.

---

## VULN-LOGIC-02: Time-Spent Validation is Client-Controlled

**Severity**: Low
**Confidence**: High
**Location**: `lib/actions/courses.ts:190` — `markSubMaterialCompleted(enrollmentId, subMaterialId, timeSpent)`

**Description**:
The `timeSpent` parameter is passed from the client. The server validates `timeSpent >= 30` (seconds), but the client can simply pass `timeSpent: 31` without actually spending any time on the material.

```typescript
if (timeSpent < 30) {
  return { success: false, error: 'Insufficient time spent on material' }
}
```

There is no server-side timestamp tracking (e.g., recording when the lesson was opened vs. when completion was submitted).

**Impact**: Students can complete all lessons instantly by passing `timeSpent: 31` for each, triggering course completion and certificate generation without engaging with content. However, quiz passing is still required for certificates, which provides a compensating control.

**Remediation**: Track lesson open time server-side (record a "started" timestamp, then validate elapsed time on completion). Or accept this as a design trade-off since quizzes enforce actual learning.

---

## VULN-LOGIC-03: In-Memory Rate Limiting Bypass

**Severity**: Medium
**Confidence**: High
**Location**: `lib/rate-limit.ts`

**Description**:
The rate limiter uses an in-memory `Map`:
- Resets on server restart/redeployment
- Not shared across multiple server instances (Netlify functions, Docker replicas)
- The cleanup interval (`setInterval`) won't persist across serverless invocations

In a serverless deployment (Netlify), each function invocation may get a fresh memory space, making the rate limiter completely ineffective.

**Impact**: 
- Login brute force: 5/min limit per email is bypassed
- Signup spam: 3/hour limit is bypassed
- Checkout abuse: 5/min limit is bypassed

**Remediation**: Use a persistent store (Redis, Supabase table, or Netlify/Vercel KV) for rate limiting state. Alternatively, use Supabase's built-in rate limiting or a CDN-level solution.

---

## VULN-LOGIC-04: Enrollment Request Resubmission After Rejection

**Severity**: Low
**Confidence**: High
**Location**: `lib/actions/enrollment-requests.ts:60-70`

**Description**:
The `createEnrollmentRequest()` function only checks for existing requests with `status: 'pending'`:

```typescript
const { data: existingRequest } = await supabase
  .from('enrollment_requests')
  .select('id, status')
  .eq('student_id', user.id)
  .eq('course_id', data.courseId)
  .eq('status', 'pending')
  .single()
```

A student whose request was rejected can immediately submit a new request. There's no cooldown or limit on resubmissions after rejection.

**Impact**: Admin fatigue — a persistent student can spam enrollment requests after each rejection. Low severity since admin can simply keep rejecting.

**Remediation**: Add a cooldown period after rejection (e.g., 7 days), or limit total requests per student per course.

---

## VULN-LOGIC-05: Course Completion Without Full Content Engagement

**Severity**: Low
**Confidence**: Medium
**Location**: `lib/actions/courses.ts:300-310` — `updateCourseProgress()`

**Description**:
Course progress is calculated as `completedSubMaterials / totalSubMaterials * 100`. When progress reaches 100%, `completeCourse()` is triggered. The function requires passing at least one quiz, which is a good control.

However, if a course has no quizzes (`quests.length === 0`), the quiz check is skipped entirely:
```typescript
if (quests && quests.length > 0) {
  // ... check for passed attempts
  if (!passedAttempts || passedAttempts.length === 0) {
    return // Don't complete
  }
}
// If no quests exist, completion proceeds without quiz validation
```

A mentor could create a course with no quizzes, and students could "complete" it by just marking all materials as done (with fake `timeSpent: 31`).

**Impact**: Certificates issued for courses without quiz validation. Low severity since this is a course design issue, not an exploit of another user's course.

**Remediation**: Require at least one published quiz for course completion/certification, or mark quiz-less courses as "participation certificates" vs. "achievement certificates."

---

## Summary

| ID | Finding | Severity | Confidence |
|----|---------|----------|------------|
| LOGIC-01 | Quiz max_attempts race condition | Medium | Medium |
| LOGIC-02 | Client-controlled timeSpent validation | Low | High |
| LOGIC-03 | In-memory rate limiting bypass | Medium | High |
| LOGIC-04 | Enrollment request resubmission after rejection | Low | High |
| LOGIC-05 | Course completion without quizzes | Low | Medium |


---

# Vulnerability Findings — Authentication & Session Management

**Scanner**: vuln-authn-session (3h)
**Date**: 2026-05-20
**Scope**: Broken auth, JWT flaws, session fixation, OAuth/OIDC

---

## VULN-AUTHN-01: No Rate Limiting on Password Reset

**Severity**: Medium
**Confidence**: High
**Location**: `lib/actions/auth.ts` — `requestPasswordReset()`

**Description**:
The `requestPasswordReset()` function has no rate limiting. Unlike `signIn` (5/min) and `signUp` (3/hour), password reset requests are unlimited:

```typescript
export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email')?.toString().trim()
  // No rate limit check here
  const { error } = await supabase.auth.resetPasswordForEmail(email, { ... })
}
```

**Impact**: 
- Email flooding: Attacker can send unlimited password reset emails to any email address
- Phishing amplification: Flood victim's inbox with legitimate reset emails, then send a phishing email that blends in
- Supabase email quota exhaustion: Could exhaust the project's email sending limits

**Remediation**: Add `checkRateLimit(`reset:${email}`, { maxRequests: 3, windowMs: 3600_000 })` matching the signup pattern.

---

## VULN-AUTHN-02: Weak Password Policy

**Severity**: Low
**Confidence**: High
**Location**: `lib/actions/auth.ts:35-36`

**Description**:
Password validation only checks minimum length (8 characters):
```typescript
if (password.length < 8) {
  return { error: 'Password must be at least 8 characters long' }
}
```

No requirements for:
- Uppercase/lowercase mix
- Numbers or special characters
- Common password blocklist
- Breach database check (e.g., HaveIBeenPwned)

**Impact**: Users can set weak passwords like `aaaaaaaa` or `password1`. Combined with the rate-limited-but-bypassable login, this increases credential stuffing risk.

**Remediation**: Add complexity requirements or use a password strength library (e.g., zxcvbn). At minimum, require one uppercase, one lowercase, and one number.

---

## VULN-AUTHN-03: No Account Lockout After Failed Attempts

**Severity**: Low
**Confidence**: Medium
**Location**: `lib/actions/auth.ts` — `signIn()`

**Description**:
The login rate limit (5 attempts/min per email) provides some protection, but:
1. There's no permanent or escalating lockout after repeated failures
2. The rate limit resets every minute — attacker gets 5 attempts/min indefinitely
3. Rate limit is in-memory (see VULN-LOGIC-03) — may not persist

Supabase Auth itself may have built-in protections (configurable), but the application layer doesn't enforce lockout.

**Impact**: Slow brute force is possible at 5 attempts/minute (300/hour, 7200/day). With weak passwords (VULN-AUTHN-02), this could succeed.

**Remediation**: Implement escalating lockout (e.g., 5 failures → 5 min lock, 10 failures → 30 min lock) or rely on Supabase's built-in rate limiting at the auth service level.

---

## VULN-AUTHN-04: Positive Findings — Auth Implementation is Generally Sound

**Severity**: N/A (Informational)
**Confidence**: High

**Positive observations**:
- Uses `supabase.auth.getUser()` (validates JWT server-side) not `getSession()` (client-side only)
- Session cookies managed by `@supabase/ssr` with proper HTTP-only, secure flags
- OAuth callback properly validates code exchange and handles errors
- Generic error messages on login failure ("Invalid email or password")
- Deactivated/unapproved users are blocked at middleware level
- Google OAuth restricted to student role only
- Admin client uses `autoRefreshToken: false, persistSession: false` (good)

---

## Summary

| ID | Finding | Severity | Confidence |
|----|---------|----------|------------|
| AUTHN-01 | No rate limiting on password reset | Medium | High |
| AUTHN-02 | Weak password policy (length only) | Low | High |
| AUTHN-03 | No account lockout after failed attempts | Low | Medium |
| AUTHN-04 | Auth implementation generally sound | N/A | High |


---

# Vulnerability Findings — Security Misconfiguration

**Scanner**: vuln-misconfig (3f)
**Date**: 2026-05-20
**Scope**: CORS, CSP, debug mode, default credentials, security headers

---

## VULN-MISC-01: CSP Allows unsafe-inline and unsafe-eval

**Severity**: Medium
**Confidence**: High
**Location**: `next.config.js:68`

**Description**:
The Content-Security-Policy header includes:
```
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com
```

Both `'unsafe-inline'` and `'unsafe-eval'` significantly weaken CSP protection:
- `'unsafe-inline'`: Allows inline `<script>` tags and event handlers — defeats XSS protection
- `'unsafe-eval'`: Allows `eval()`, `Function()`, `setTimeout(string)` — enables code injection if any input reaches these sinks

These are likely required by Next.js development mode and Stripe.js, but should be tightened for production.

**Impact**: If an XSS vector is found (currently none identified), CSP would not block exploitation. The CSP is effectively decorative for script injection.

**Remediation**: 
- Use nonce-based CSP (`'nonce-{random}'`) instead of `'unsafe-inline'`
- Remove `'unsafe-eval'` if possible (test in production build — Next.js production may not need it)
- Use `'strict-dynamic'` for modern CSP

---

## VULN-MISC-02: TypeScript Build Errors Ignored

**Severity**: Low
**Confidence**: High
**Location**: `next.config.js:5-8`

**Description**:
```javascript
typescript: {
  ignoreBuildErrors: true,
}
```

Type errors are suppressed during build. This means type-safety violations (null checks, incorrect types, missing properties) won't prevent deployment. Runtime errors from type mismatches could cause unexpected behavior.

**Impact**: Not a direct security vulnerability, but reduces confidence in code correctness. Type errors could mask logic bugs that have security implications.

**Remediation**: Fix type errors and remove `ignoreBuildErrors: true`.

---

## VULN-MISC-03: No CORS Configuration (Default Behavior)

**Severity**: N/A (Informational)
**Confidence**: High

**Description**:
No explicit CORS headers are configured. Next.js API routes default to same-origin only, which is secure. The `X-Frame-Options: DENY` header prevents clickjacking. This is correct behavior.

---

## Summary

| ID | Finding | Severity | Confidence |
|----|---------|----------|------------|
| MISC-01 | CSP allows unsafe-inline and unsafe-eval | Medium | High |
| MISC-02 | TypeScript build errors ignored | Low | High |
| MISC-03 | No CORS issues (default same-origin) | N/A | High |

---

# Vulnerability Findings — API Security

**Scanner**: vuln-api (3m)
**Date**: 2026-05-20
**Scope**: Mass assignment, rate limiting, data exposure via API

---

## VULN-API-01: Mass Assignment on Material and Sub-Material Updates

**Severity**: Low
**Confidence**: Medium
**Location**: `lib/actions/courses.ts` — `updateMaterial()`, `updateSubMaterial()`

**Description**:
Unlike `updateCourse()` which uses a field allowlist, `updateMaterial()` and `updateSubMaterial()` pass the entire input object directly to Supabase:

```typescript
// updateMaterial - no allowlist
const { data, error } = await supabase
  .from('materials')
  .update(materialData)  // All fields passed through
  .eq('id', materialId)

// updateSubMaterial - no allowlist
const { data, error } = await supabase
  .from('sub_materials')
  .update(subMaterialData)  // All fields passed through
  .eq('id', subMaterialId)
```

An attacker could potentially pass fields like `course_id` (to move a material to a different course) or `created_at` (to manipulate timestamps).

**Impact**: Mitigated by RLS (only course instructor can update). If RLS is bypassed, attacker could reassign materials between courses. PostgreSQL would also reject invalid column names.

**Remediation**: Add field allowlists matching the pattern in `updateCourse()`.

---

## VULN-API-02: Mass Assignment on Quest Updates

**Severity**: Low
**Confidence**: Medium
**Location**: `lib/actions/quests.ts` — `updateQuest()`, `updateQuestion()`, `updateOption()`

**Description**:
Same pattern — `updateQuest()` passes `questData` directly without allowlist. An attacker (if they bypass RLS) could modify `course_id` to reassign a quest to a different course.

`updateQuestion()` and `updateOption()` similarly pass all fields through.

**Impact**: Mitigated by RLS and ownership checks on `updateQuest()`. Lower risk since these functions have some auth checks.

**Remediation**: Add field allowlists.

---

## Summary

| ID | Finding | Severity | Confidence |
|----|---------|----------|------------|
| API-01 | Mass assignment on material/sub-material updates | Low | Medium |
| API-02 | Mass assignment on quest/question/option updates | Low | Medium |

---

# Vulnerability Findings — Client-Side

**Scanner**: vuln-client-side (3k)
**Date**: 2026-05-20
**Scope**: Open redirect, clickjacking, prototype pollution, DOM-based attacks

---

## VULN-CS-01: No Client-Side Vulnerabilities Found

**Severity**: N/A (Informational)
**Confidence**: High

**Description**:
- **Open redirect**: The `/auth/callback` route's `next` parameter is validated to start with `/` (path-relative only). No other redirect patterns use user-controlled input.
- **Clickjacking**: Protected by `X-Frame-Options: DENY` header.
- **Prototype pollution**: No `Object.assign()` or deep merge of user-controlled objects found.
- **DOM-based XSS**: React auto-escapes all rendered content. No `dangerouslySetInnerHTML` usage.
- **No `window.location` manipulation** from user input found.

---

## Summary

| ID | Finding | Severity | Confidence |
|----|---------|----------|------------|
| CS-01 | No client-side vulnerabilities found | N/A | High |

---

# Vulnerability Findings — Dependency & Supply Chain

**Scanner**: vuln-dependency (3l)
**Date**: 2026-05-20
**Scope**: Known CVEs, dependency confusion, outdated packages

---

## VULN-DEP-01: 12 Known Vulnerabilities in Dependencies

**Severity**: Medium
**Confidence**: High
**Location**: `package-lock.json` (npm audit output)

**Description**:
`npm audit` reports 12 vulnerabilities (5 moderate, 7 high):

| Package | Severity | Issue | Direct? |
|---------|----------|-------|---------|
| vite (7.0.0-7.3.1) | High | Path traversal in optimized deps, `server.fs.deny` bypass, WebSocket arbitrary file read | Dev dependency |
| flatted (<3.4.0) | High | Unbounded recursion DoS in parse() | Indirect (via eslint) |
| rollup | High | Various | Dev dependency |
| ajv (<6.14.0) | Moderate | ReDoS with `$data` option | Indirect (via eslint) |
| brace-expansion | Moderate | Zero-step sequence DoS | Indirect |
| ws (8.0.0-8.20.0) | Moderate | Uninitialized memory disclosure | Indirect |

**Impact**: 
- **Vite vulnerabilities**: Only affect development server, not production. No risk in deployed application.
- **flatted/ajv/brace-expansion**: Indirect dependencies of ESLint — dev-only, not in production bundle.
- **ws**: Used by development tools, not directly in production code.

All vulnerabilities are in dev dependencies or indirect dependencies not shipped to production.

**Remediation**: Run `npm audit fix` to update where possible. These are low-priority since they don't affect the production deployment.

---

## Summary

| ID | Finding | Severity | Confidence |
|----|---------|----------|------------|
| DEP-01 | 12 known CVEs in dev/indirect dependencies | Medium | High |

---

# Vulnerability Findings — Denial of Service

**Scanner**: vuln-dos (3o)
**Date**: 2026-05-20
**Scope**: ReDoS, algorithmic complexity, resource exhaustion

---

## VULN-DOS-01: No ReDoS Patterns Found

**Severity**: N/A (Informational)
**Confidence**: High

**Description**:
All regex patterns in the codebase are simple and non-backtracking:
- Email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` — linear time
- UUID: `/^[0-9a-f]{8}-[0-9a-f]{4}-...$/i` — linear time
- Slug generation: `/[^a-z0-9]+/g` — linear time
- LIKE escape: `/[%_\\]/g` — linear time

No nested quantifiers, alternation with overlap, or other ReDoS-prone patterns.

---

## VULN-DOS-02: Unbounded Query Results

**Severity**: Low
**Confidence**: Medium
**Location**: Multiple server actions (e.g., `getLeaderboard`, `getAllSkills`, `getPublishedCourses`)

**Description**:
Several query functions don't limit result size:
- `getAllSkills()` — returns all skills (bounded by admin-created data, likely <100)
- `getPublishedCourses()` — returns all published courses (could grow large)
- `getAllCoursesAdmin()` — returns all courses
- `getStudentPayments()` — returns all payments for a student

`getLeaderboard()` does use a `limit` parameter (default 10), which is good.

**Impact**: As the platform grows, unbounded queries could cause slow responses or memory pressure. Not exploitable for DoS by external attackers since data volume is controlled by admins/mentors.

**Remediation**: Add pagination (limit/offset) to list queries.

---

## Summary

| ID | Finding | Severity | Confidence |
|----|---------|----------|------------|
| DOS-01 | No ReDoS patterns | N/A | High |
| DOS-02 | Unbounded query results | Low | Medium |
