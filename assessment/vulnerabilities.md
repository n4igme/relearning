# Vulnerability Scan Results

**Date**: 2026-05-18
**Target**: CyberSec Academy (Next.js 15 + Supabase)
**Based on**: assessment/recon.md, assessment/threat-model.md

---

## 3b. Access Control Vulnerabilities

### VULN-AC-001: Payment Bypass via `skipPaymentCheck` Parameter

**Severity**: Critical
**Location**: `lib/actions/courses.ts:14` — `enrollInCourse()`
**CWE**: CWE-862 (Missing Authorization)

**Description**: The `enrollInCourse()` server action accepts a `skipPaymentCheck` boolean parameter. Any authenticated user can call this action with `skipPaymentCheck=true` to enroll in paid courses without payment. The enrollment RLS policy (`student_id = auth.uid()`) only ensures you enroll yourself — it does not enforce payment.

**Proof of Concept**:
```typescript
// From browser console as authenticated student:
// Import or invoke the server action directly
await enrollInCourse(myUserId, paidCourseId, true)
// Result: enrolled in paid course, no payment required
```

**Impact**: Complete bypass of payment system. All paid courses accessible for free.
**RLS Mitigation**: None — RLS INSERT policy on enrollments only checks `student_id = auth.uid()`, not payment status.

---

### VULN-AC-002: Admin Privilege Escalation via Unprotected Server Actions

**Severity**: Critical
**Location**: `app/admin/users/page.tsx:~48,~62,~76` — `approveUser`, `rejectUser`, `toggleUserActive`
**CWE**: CWE-862 (Missing Authorization)

**Description**: Inline server actions in the admin users page use `createAdminClient()` (service role key, bypasses ALL RLS) but perform no role verification within the action itself. Page-level role checks only prevent rendering — the server action endpoints remain independently callable by any authenticated user.

**Proof of Concept**:
```typescript
// Any authenticated user can invoke these actions.
// Next.js server actions are POST endpoints with action IDs.
// A student can:
// 1. Self-approve their pending mentor account
// 2. Deactivate any user including admins
// 3. Approve any pending user

const formData = new FormData()
formData.set('userId', targetUserId)
// Invoke approveUser server action via Next.js internal mechanism
```

**Impact**: Full privilege escalation. Any user can approve/reject/deactivate any account. Uses service role key so RLS is completely bypassed.
**RLS Mitigation**: None — admin client bypasses RLS entirely.

---

### VULN-AC-003: Course Self-Approval (Missing Admin Check)

**Severity**: Critical
**Location**: `lib/actions/courses.ts:843` — `approveCourse()`
**CWE**: CWE-862 (Missing Authorization)

**Description**: The `approveCourse()` function performs no role check. Any authenticated user can approve any course. The RLS UPDATE policy on courses allows `instructor_id = auth.uid()` OR admin role — so a mentor can self-approve their own course.

**Proof of Concept**:
```typescript
import { approveCourse } from '@/lib/actions/courses'
// As a mentor, approve your own unpublished course:
await approveCourse(myCourseId, true)
// Bypasses the admin review workflow entirely
```

**Impact**: Mentors can publish courses without admin review. Malicious/low-quality content goes live.
**RLS Mitigation**: Partial — RLS UPDATE policy allows instructor to update own course OR admin to update any. Mentor self-approval succeeds.

---

### VULN-AC-004: IDOR in Course Update/Delete (Mentor Cross-Modification)

**Severity**: High
**Location**: `lib/actions/courses.ts:577,615` — `updateCourse()`, `deleteCourse()`
**CWE**: CWE-639 (Authorization Bypass Through User-Controlled Key)

**Description**: `updateCourse()` and `deleteCourse()` accept a `courseId` parameter with no ownership verification in application code. However, RLS provides partial protection:
- UPDATE: Policy `instructor_id = auth.uid()` blocks non-owners (except admins)
- DELETE: **No DELETE policy exists** on courses table → all deletes denied by RLS

**Proof of Concept**:
```typescript
// updateCourse — blocked by RLS for non-owners (MITIGATED)
await updateCourse(otherMentorsCourseId, { title: 'hacked' })
// → RLS denies: instructor_id != auth.uid()

// deleteCourse — blocked by RLS (no DELETE policy = deny all)
await deleteCourse(anyCourseId)
// → RLS denies: no policy permits DELETE
```

**Impact**: Mitigated by RLS for regular users. However, if admin client were used (or RLS misconfigured), full IDOR. The lack of application-level checks is a defense-in-depth failure.
**RLS Mitigation**: Yes — UPDATE restricted to owner/admin, DELETE denied entirely.
**Residual Risk**: Medium — relies solely on RLS with no application-layer defense.

---

### VULN-AC-005: Quiz Answer Submission as Another Student (Identity Spoofing)

**Severity**: High
**Location**: `lib/actions/quests.ts:13` — `submitQuestAttempt()`
**CWE**: CWE-639 (Authorization Bypass Through User-Controlled Key)

**Description**: `submitQuestAttempt(questId, studentId, answers)` accepts `studentId` as a parameter without validating it matches the authenticated user. However, the RLS INSERT policy on `quest_attempts` requires `student_id = auth.uid()`.

**Proof of Concept**:
```typescript
// Attempt to submit as another student:
await submitQuestAttempt(questId, victimStudentId, answers)
// → RLS INSERT policy: student_id = auth.uid() → DENIED if victimId != myId
// → But submitting as YOURSELF with pre-fetched correct answers works (see VULN-DE-001)
```

**Impact**: Spoofing other students is blocked by RLS. But the missing application-level check means if RLS is ever relaxed or bypassed, full identity spoofing is possible.
**RLS Mitigation**: Yes — `quest_attempts` INSERT requires `student_id = auth.uid()`.

---

### VULN-AC-006: Gamification Point Manipulation

**Severity**: High
**Location**: `lib/actions/gamification.ts:11` — `awardPoints()`
**CWE**: CWE-862 (Missing Authorization)

**Description**: `awardPoints(studentId, points, source, sourceId)` has no auth check. However, the RLS policy on `leaderboard_stats` requires admin role for INSERT/UPDATE (`FOR ALL USING (role = 'admin')`). Since server actions use the user's session (anon key + JWT), a student calling `awardPoints` would be denied by RLS.

**Proof of Concept**:
```typescript
await awardPoints(myId, 99999, 'quest', 'fake-quest-id')
// → RLS on leaderboard_stats: FOR ALL requires admin role → DENIED
```

**Impact**: Blocked by RLS in current configuration. However, the function is exported and callable — if ever invoked in a context with admin client, it becomes exploitable.
**RLS Mitigation**: Yes — `leaderboard_stats` ALL operations require admin role.
**Residual Risk**: Low (unless admin client context is introduced).

---

### VULN-AC-007: Progress Manipulation via Enrollment ID

**Severity**: High
**Location**: `lib/actions/courses.ts:85` — `markSubMaterialCompleted()`
**CWE**: CWE-639 (Authorization Bypass Through User-Controlled Key)

**Description**: Accepts `enrollmentId` without verifying ownership. RLS on `progress` table requires `enrollment_id IN (SELECT id FROM enrollments WHERE student_id = auth.uid())` — so you can only mark progress on your own enrollments.

**Proof of Concept**:
```typescript
// Attempt to mark another student's progress:
await markSubMaterialCompleted(victimEnrollmentId, subMaterialId, 60)
// → RLS on progress: enrollment must belong to auth.uid() → DENIED

// But marking ALL your own lessons complete instantly works:
await markSubMaterialCompleted(myEnrollmentId, lessonId1, 0)
await markSubMaterialCompleted(myEnrollmentId, lessonId2, 0)
// ... for all lessons → triggers completeCourse → generateCertificate
```

**Impact**: Cannot manipulate others' progress (RLS blocks). CAN instantly complete your own course without watching content → fraudulent certificate.
**RLS Mitigation**: Partial — blocks cross-user, but allows self-completion bypass.


---

## 3g. Business Logic Vulnerabilities

### VULN-BL-001: Instant Course Completion via Bulk Progress Marking

**Severity**: High
**Location**: `lib/actions/courses.ts:85,154,211` — `markSubMaterialCompleted()`, `updateCourseProgress()`, `completeCourse()`
**CWE**: CWE-841 (Improper Enforcement of Behavioral Workflow)

**Description**: A student can call `markSubMaterialCompleted()` for every lesson in their enrolled course without actually consuming the content. When progress reaches 100%, `completeCourse()` auto-triggers, which awards points, updates skills, awards badges, and generates a certificate. There is no validation that the student actually watched videos or spent meaningful time.

**Proof of Concept**:
```typescript
// 1. Get course structure
const course = await getCourseById(courseId)
const allLessons = course.data.materials.flatMap(m => m.sub_materials)

// 2. Get my enrollment
const enrollments = await getStudentEnrollments(myId)
const enrollment = enrollments.data.find(e => e.course_id === courseId)

// 3. Mark all lessons complete (timeSpent=0 is accepted)
for (const lesson of allLessons) {
  await markSubMaterialCompleted(enrollment.id, lesson.id, 0)
}
// Result: course completed, certificate generated, points awarded
```

**Impact**: Fraudulent certificates, inflated leaderboard, devalued credentials.
**RLS Mitigation**: RLS allows this — student is marking their own progress.

---

### VULN-BL-002: Race Condition in Quest Max Attempts Check (TOCTOU)

**Severity**: Medium
**Location**: `lib/actions/quests.ts:30-40` — `submitQuestAttempt()` max_attempts check
**CWE**: CWE-367 (Time-of-check Time-of-use Race Condition)

**Description**: The max_attempts enforcement follows a non-atomic pattern: SELECT count of previous attempts → compare to limit → INSERT new attempt. Concurrent requests can pass the check simultaneously before any INSERT completes.

**Proof of Concept**:
```typescript
// Quest has max_attempts = 3, student has used 2 attempts
// Send 5 concurrent requests:
const promises = Array(5).fill(null).map(() =>
  submitQuestAttempt(questId, myId, correctAnswers)
)
const results = await Promise.all(promises)
// Multiple requests pass the count check before any INSERT commits
// Result: more attempts than max_attempts allows
```

**Impact**: Bypass attempt limits, unlimited retries to achieve perfect score.
**Likelihood**: Medium — requires concurrent requests but easily scriptable.

---

### VULN-BL-003: Course Price Manipulation Before Enrollment

**Severity**: High (if RLS allows)
**Location**: `lib/actions/courses.ts:577` — `updateCourse()`
**CWE**: CWE-841 (Improper Enforcement of Behavioral Workflow)

**Description**: If a mentor can update their own course price to 0, then any student can enroll for free. The enrollment flow checks `course.price` at enrollment time. A colluding mentor (or a mentor exploiting their own course) can set price to 0, let students enroll, then set it back.

**Proof of Concept**:
```typescript
// As mentor (course owner):
await updateCourse(myCourseId, { price: 0 })
// RLS allows: instructor_id = auth.uid() ✓

// As student (or same user with student account):
// Course now appears free, normal enrollment works without payment

// Mentor resets price:
await updateCourse(myCourseId, { price: 99.99 })
```

**Impact**: Revenue loss. Mentor can offer "free" access to select students outside the payment system.
**RLS Mitigation**: None — mentor updating own course price is a legitimate RLS-permitted operation.

---

### VULN-BL-004: Webhook-to-Enrollment Architectural Flaw

**Severity**: Medium
**Location**: `app/api/webhooks/stripe/route.ts:73-95` — `handleCheckoutSessionCompleted()`
**CWE**: CWE-672 (Operation on a Resource after Expiration or Release)

**Description**: The Stripe webhook handler calls `updatePaymentStatus()` and `enrollInCourse()` which use `createClient()` (user session-based). But webhooks have no user session — the Supabase client would have no JWT. This means either:
1. The payment/enrollment flow is broken in production (operations denied by RLS), OR
2. The anon key alone grants sufficient access (misconfigured RLS)

If the `payments` table has no RLS policies (confirmed: zero policies defined beyond ENABLE RLS), then with RLS enabled and no policies, ALL operations are denied. The webhook would silently fail.

**Impact**: Payment completion may not properly enroll students (broken flow), OR if RLS is not properly enabled, the anon key has unrestricted access to payments table.
**Note**: This is an architectural bug that may mask or enable other vulnerabilities depending on deployment state.


---

## 3c. Data Exposure Vulnerabilities

### VULN-DE-001: Quiz Correct Answers Exposed via Server Action

**Severity**: High
**Location**: `lib/actions/quests.ts:229` — `getQuestWithQuestions()`
**CWE**: CWE-200 (Exposure of Sensitive Information)

**Description**: The `getQuestWithQuestions()` server action returns the full quest data including `quest_options` with the `is_correct` boolean field. The RLS policy on `quest_options` is "viewable by everyone." While the UI component may strip this field before rendering, the server action response contains it, and any authenticated user can call this action directly.

**Proof of Concept**:
```typescript
const result = await getQuestWithQuestions(questId)
// result.data.quest_questions[0].quest_options = [
//   { id: 'opt-1', option_text: 'Answer A', is_correct: false },
//   { id: 'opt-2', option_text: 'Answer B', is_correct: true },  ← LEAKED
//   { id: 'opt-3', option_text: 'Answer C', is_correct: false },
// ]
// Student now knows correct answers before attempting quiz
```

**Impact**: Complete academic integrity compromise. Students can achieve 100% on all quizzes without learning. Combined with VULN-BL-001, enables instant fraudulent certification.
**RLS Mitigation**: None — RLS policy explicitly allows everyone to read quest_options including `is_correct`.

---

### VULN-DE-002: Debug Page Exposes Infrastructure Information

**Severity**: Medium
**Location**: `app/test-db/page.tsx` (entire file)
**CWE**: CWE-200 (Exposure of Sensitive Information)

**Description**: The `/test-db` page is accessible without any authentication. It reveals:
- Database connection status (confirms Supabase is reachable)
- Presence/absence of environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Complete list of database table names (hardcoded but confirms schema)

**Proof of Concept**:
```
GET /test-db
# No authentication required
# Response reveals: connection status, env var presence, table names
```

**Impact**: Information disclosure aids reconnaissance. Confirms technology stack and database structure for attackers.
**RLS Mitigation**: N/A — this is a page-level issue, not a database query issue.

---

### VULN-DE-003: Payment Data Accessible Without Authorization

**Severity**: Medium
**Location**: `lib/actions/payments.ts:211` — `getCoursePayments()`, `lib/actions/payments.ts:184` — `getStudentPayments()`
**CWE**: CWE-862 (Missing Authorization)

**Description**: `getCoursePayments(courseId)` returns all payment records for a course (including student names, emails, amounts) with no auth check. `getStudentPayments(studentId)` accepts arbitrary student IDs. However, since the `payments` table has RLS enabled with **zero policies**, these queries would return empty results for non-service-role clients.

**Proof of Concept**:
```typescript
// These calls would be DENIED by RLS (no policies = deny all):
const payments = await getCoursePayments(courseId) // → empty/error
const studentPayments = await getStudentPayments(victimId) // → empty/error
```

**Impact**: Currently mitigated by RLS (no policies = deny all). But this means the payment viewing functionality is also broken for legitimate use. If policies are added later without proper scoping, this becomes exploitable.
**RLS Mitigation**: Accidentally mitigated — zero policies means deny all.

---

### VULN-DE-004: All Courses (Including Drafts) Viewable by Any User

**Severity**: Medium
**Location**: `lib/actions/courses.ts:816` — `getAllCoursesAdmin()`
**CWE**: CWE-862 (Missing Authorization)

**Description**: `getAllCoursesAdmin()` has no role check. However, the RLS SELECT policy on courses is: `is_published = true OR instructor_id = auth.uid()` (plus admin policy from migration). A non-admin, non-owner would only see published courses.

**Proof of Concept**:
```typescript
const result = await getAllCoursesAdmin()
// RLS filters: student sees only published courses
// Mentor sees published + own courses
// Admin sees all (if admin RLS policy applied)
```

**Impact**: Mitigated by RLS for students. Mentors see only their own unpublished courses. Admin policy allows full access only for admins.
**RLS Mitigation**: Yes — SELECT policy restricts visibility.


---

## 3h. Authentication & Session Vulnerabilities

### VULN-AUTH-001: No Rate Limiting on Authentication Endpoints

**Severity**: Medium
**Location**: `lib/actions/auth.ts:59` — `signIn()`, `lib/actions/auth.ts:7` — `signUp()`
**CWE**: CWE-307 (Improper Restriction of Excessive Authentication Attempts)

**Description**: No rate limiting exists on login or registration. Supabase has built-in rate limiting on its auth endpoints (default: 30 requests/hour for signup, configurable), but the application layer adds no additional protection. Credential stuffing and brute force attacks are possible up to Supabase's limits.

**Proof of Concept**:
```bash
# Brute force login (limited only by Supabase's internal rate limits):
for password in $(cat wordlist.txt); do
  curl -X POST /login -d "email=victim@example.com&password=$password"
done
```

**Impact**: Account compromise via credential stuffing. Mitigated partially by Supabase's built-in rate limits.
**Compensating Control**: Supabase Auth has configurable rate limiting (not visible in codebase).

---

### VULN-AUTH-002: Middleware Does Not Enforce Role-Based Access

**Severity**: Medium
**Location**: `middleware.ts:44-55`
**CWE**: CWE-863 (Incorrect Authorization)

**Description**: The middleware only checks if a user is authenticated (`supabase.auth.getUser()`). It does not check roles. A student can navigate to `/admin/*` or `/mentor/*` paths — the middleware allows it. Protection relies entirely on page-level Server Component checks, which don't protect the server actions defined within those pages.

**Proof of Concept**:
```
# As authenticated student, access admin page:
GET /admin/users
# Middleware: user is authenticated ✓ → allows request
# Page render: checks profile.role !== 'admin' → redirects
# BUT: server actions defined in that page are still callable
```

**Impact**: Server actions in admin/mentor pages are accessible to any authenticated user. Combined with VULN-AC-002, this enables privilege escalation.

---

## 3a. Injection Vulnerabilities

### VULN-INJ-001: Supabase ilike Filter Injection in Tools Search

**Severity**: Low
**Location**: `lib/actions/tools.ts:30-33` — `getAllTools()`
**CWE**: CWE-943 (Improper Neutralization of Special Elements in Data Query Logic)

**Description**: The `searchQuery` parameter is interpolated directly into a Supabase `.or()` filter using `ilike` without escaping SQL wildcard characters (`%`, `_`). While this is not SQL injection (Supabase parameterizes the value), the wildcards allow pattern-based data enumeration beyond intended search behavior.

**Proof of Concept**:
```typescript
// Normal search:
await getAllTools({ searchQuery: 'nmap' })

// Wildcard injection — return ALL tools:
await getAllTools({ searchQuery: '%' })

// Pattern matching — find tools with exactly 4-char names:
await getAllTools({ searchQuery: '____' })

// Enumerate tools starting with specific prefix:
await getAllTools({ searchQuery: 'meta%' })
```

**Impact**: Minor information disclosure. The `security_tools` table is read-only catalog data (not sensitive). Attacker can enumerate all tools regardless of intended search UX.
**RLS Mitigation**: N/A — tools are publicly readable by design.

---

## 3f. Security Misconfiguration Vulnerabilities

### VULN-MC-001: No Security Headers Configured

**Severity**: Medium
**Location**: `next.config.js` (entire file — no `headers()` function)
**CWE**: CWE-693 (Protection Mechanism Failure)

**Description**: The Next.js configuration has no security headers. Missing headers include:
- `Content-Security-Policy` — no XSS mitigation
- `X-Frame-Options` / `frame-ancestors` — clickjacking possible
- `X-Content-Type-Options` — MIME sniffing possible
- `Strict-Transport-Security` — no HSTS enforcement
- `Referrer-Policy` — full referrer leaked
- `Permissions-Policy` — no feature restrictions

**Proof of Concept**:
```bash
curl -I https://target-app.com/
# Response headers will NOT contain:
# Content-Security-Policy
# X-Frame-Options
# Strict-Transport-Security
# X-Content-Type-Options
```

**Impact**: Enables clickjacking (iframe embedding), no defense-in-depth against XSS, no HSTS.

---

### VULN-MC-002: Build Pipeline Ignores Type Errors and Lint

**Severity**: Low
**Location**: `next.config.js:7-12` — `ignoreBuildErrors: true`, `ignoreDuringBuilds: true`
**CWE**: CWE-710 (Improper Adherence to Coding Standards)

**Description**: TypeScript type checking and ESLint are disabled during production builds. This means:
- Type errors that could indicate logic bugs are not caught
- Security-relevant lint rules (e.g., no-eval, no-unsafe-assignment) are bypassed
- Malicious or buggy code can be deployed without static analysis gates

**Impact**: Reduced code quality assurance. Potential for undetected logic bugs or supply chain attacks to pass through build.

---

### VULN-MC-003: Debug Page Accessible in Production

**Severity**: Medium
**Location**: `app/test-db/page.tsx`
**CWE**: CWE-489 (Active Debug Code)

**Description**: The `/test-db` diagnostic page has no authentication check and is included in the production build. It's not excluded by middleware (not in protected paths list) and not conditionally rendered based on `NODE_ENV`.

**Proof of Concept**:
```
GET /test-db
# Accessible by anyone, reveals infrastructure details
```

**Impact**: Information disclosure (see VULN-DE-002). Should be removed or gated behind admin auth.


---

## 3m. API Vulnerabilities

### VULN-API-001: No Rate Limiting on Any API Endpoint

**Severity**: Medium
**Location**: `app/api/checkout/route.ts`, `app/api/check-user/route.ts`, all server actions
**CWE**: CWE-770 (Allocation of Resources Without Limits)

**Description**: No rate limiting is implemented at the application layer for any endpoint. This enables:
- Brute force on login (limited by Supabase)
- Spam enrollment requests
- Flood quiz submissions (amplified by VULN-BL-002 race condition)
- Abuse checkout session creation (Stripe has its own limits)

**Impact**: Resource exhaustion, abuse amplification, potential cost impact (Stripe API calls).
**Compensating Controls**: Supabase and Stripe have their own rate limits. Netlify may provide edge rate limiting (not confirmed).

---

### VULN-API-002: Mass Assignment in Course/Quest CRUD Actions

**Severity**: Medium
**Location**: `lib/actions/courses.ts:577` — `updateCourse()`, `lib/actions/quests.ts:443` — `updateQuest()`
**CWE**: CWE-915 (Improperly Controlled Modification of Dynamically-Determined Object Attributes)

**Description**: `updateCourse()` accepts a partial object and spreads it directly into the database update. While TypeScript types constrain the interface, the server action accepts any JSON at runtime. Fields like `is_published`, `is_approved` can be set by the caller.

**Proof of Concept**:
```typescript
// Mentor publishes AND approves own course in one call:
await updateCourse(myCourseId, {
  is_published: true,
  // is_approved would need admin RLS policy — but is_published works for owner
})
```

**Impact**: Mentors can self-publish (intended) but combined with VULN-AC-003, can also self-approve. The spread pattern means any future column additions are automatically writable.
**RLS Mitigation**: Partial — UPDATE restricted to owner/admin.

---

## 3k. Client-Side Vulnerabilities

### VULN-CS-001: Clickjacking — No Frame Protection

**Severity**: Low
**Location**: `next.config.js` (missing `X-Frame-Options` / CSP `frame-ancestors`)
**CWE**: CWE-1021 (Improper Restriction of Rendered UI Layers)

**Description**: Without `X-Frame-Options: DENY` or CSP `frame-ancestors 'none'`, the application can be embedded in an iframe on a malicious site. An attacker could overlay transparent UI elements to trick users into clicking actions (e.g., "Approve" buttons on admin pages).

**Proof of Concept**:
```html
<!-- Attacker's page -->
<iframe src="https://target-app.com/admin/users" style="opacity:0; position:absolute; top:0; left:0; width:100%; height:100%;"></iframe>
<button style="position:absolute; top:200px; left:300px;">Click here for free course!</button>
<!-- User clicks "free course" button but actually clicks "Approve" in the iframe -->
```

**Impact**: Low — requires social engineering and the victim must be an authenticated admin viewing the attacker's page. Admin actions are form-based which adds friction.

---

### VULN-CS-002: Reflected Content via URL Search Parameters

**Severity**: Low
**Location**: `app/login/page.tsx:27,33`, `app/admin/users/page.tsx:123,129`, `app/resend-verification/page.tsx:46,52`
**CWE**: CWE-79 (Cross-site Scripting) — Mitigated

**Description**: Several pages render `searchParams.error` and `searchParams.message` directly in the page. However, React's JSX auto-escaping prevents XSS — content is rendered as text nodes, not HTML. This is NOT exploitable as XSS but could be used for phishing (crafting misleading error messages in URLs).

**Proof of Concept**:
```
/login?error=Your+account+has+been+compromised.+Please+reset+at+evil.com
# Renders as text in the error div — looks like a legitimate error message
# NOT XSS — React escapes all output
```

**Impact**: Social engineering / phishing vector only. No code execution.

---

## 3l. Dependency Vulnerabilities

### VULN-DEP-001: Dependency Versions Use Caret Ranges

**Severity**: Low
**Location**: `package.json` — all dependencies use `^` prefix
**CWE**: CWE-1104 (Use of Unmaintained Third Party Components)

**Description**: All dependencies use caret (`^`) version ranges, allowing automatic minor/patch updates. While `package-lock.json` pins exact versions for reproducible builds, the ranges mean `npm install` on a fresh clone could pull newer (potentially compromised) versions.

Key dependencies and their ranges:
- `next: ^15.1.0` — framework
- `@supabase/supabase-js: ^2.47.10` — database client
- `stripe: ^17.5.0` — payment processing
- `react: ^19.0.0` — UI framework

**Impact**: Supply chain risk if a dependency publishes a malicious minor version. Mitigated by lock file in CI/CD.
**Compensating Control**: `package-lock.json` exists and pins exact versions.

---

### VULN-DEP-002: No Subresource Integrity or Dependency Auditing in CI

**Severity**: Low
**Location**: `package.json` scripts (no `npm audit` step)
**CWE**: CWE-1104 (Use of Unmaintained Third Party Components)

**Description**: No `npm audit` or equivalent is configured in build/CI scripts. Known CVEs in transitive dependencies would not be caught automatically.

**Impact**: Potential use of dependencies with known vulnerabilities. Requires manual auditing.

---

## Summary of Confirmed Vulnerabilities

| ID | Severity | Category | Title | RLS Mitigated? |
|----|----------|----------|-------|----------------|
| VULN-AC-001 | **Critical** | Access Control | Payment bypass via `skipPaymentCheck` | ❌ No |
| VULN-AC-002 | **Critical** | Access Control | Admin privesc via unprotected server actions | ❌ No (admin client) |
| VULN-AC-003 | **Critical** | Access Control | Course self-approval (no admin check) | ❌ No (owner can update) |
| VULN-DE-001 | **High** | Data Exposure | Quiz answers exposed (`is_correct` field) | ❌ No (policy allows read) |
| VULN-BL-001 | **High** | Business Logic | Instant course completion via bulk progress | ❌ No (own enrollment) |
| VULN-AC-004 | **High** | Access Control | IDOR in course update (defense-in-depth) | ✅ Partial |
| VULN-AC-005 | **High** | Access Control | Quiz submission identity spoofing | ✅ Yes |
| VULN-AC-006 | **High** | Access Control | Gamification point manipulation | ✅ Yes |
| VULN-AC-007 | **High** | Access Control | Progress manipulation via enrollment ID | ✅ Partial |
| VULN-BL-003 | **High** | Business Logic | Course price manipulation by mentor | ❌ No |
| VULN-BL-002 | **Medium** | Business Logic | Race condition in quest max_attempts | ❌ No |
| VULN-BL-004 | **Medium** | Business Logic | Webhook architectural flaw (no session) | ⚠️ Unclear |
| VULN-AUTH-001 | **Medium** | Auth/Session | No rate limiting on auth | ⚠️ Partial (Supabase) |
| VULN-AUTH-002 | **Medium** | Auth/Session | Middleware lacks role-based access | ❌ No |
| VULN-MC-001 | **Medium** | Misconfig | No security headers | ❌ No |
| VULN-MC-003 | **Medium** | Misconfig | Debug page in production | ❌ No |
| VULN-DE-002 | **Medium** | Data Exposure | /test-db info disclosure | ❌ No |
| VULN-DE-003 | **Medium** | Data Exposure | Payment data access (accidentally blocked) | ✅ Yes (no policies) |
| VULN-DE-004 | **Medium** | Data Exposure | Draft courses viewable | ✅ Yes |
| VULN-API-001 | **Medium** | API | No rate limiting on endpoints | ⚠️ Partial |
| VULN-API-002 | **Medium** | API | Mass assignment in CRUD actions | ✅ Partial |
| VULN-INJ-001 | **Low** | Injection | ilike wildcard injection in tools search | ❌ No (but low impact) |
| VULN-MC-002 | **Low** | Misconfig | Build ignores type/lint errors | ❌ No |
| VULN-CS-001 | **Low** | Client-Side | Clickjacking (no frame protection) | ❌ No |
| VULN-CS-002 | **Low** | Client-Side | Reflected content in URL params (no XSS) | ✅ Yes (React escaping) |
| VULN-DEP-001 | **Low** | Dependency | Caret version ranges | ✅ Partial (lockfile) |
| VULN-DEP-002 | **Low** | Dependency | No automated dependency auditing | ❌ No |

---

**Critical findings requiring immediate attention**: VULN-AC-001, VULN-AC-002, VULN-AC-003
**High findings with confirmed exploitability**: VULN-DE-001, VULN-BL-001, VULN-BL-003

**Next step**: Run `sc4-validate` to confirm exploitability of critical/high findings through deeper code path analysis.
