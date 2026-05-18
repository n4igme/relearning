# Bug Bounty Report

**Target**: CyberSec Academy — `/Users/nb-dk-0552/Project/relearning`
**Assessment Date**: 2026-05-18
**Methodology**: Static source code analysis with data flow tracing
**Scope**: Full application — TypeScript/Next.js 15 (App Router), Supabase (PostgreSQL + Auth), Stripe payments, Cloudinary media

---

## Executive Summary

A security assessment of the CyberSec Academy e-learning platform identified **17 validated vulnerabilities**, including **2 Critical** and **3 High** severity findings that allow complete bypass of the payment system and compromise of academic integrity.

The most severe issue is a **payment bypass** that allows any authenticated student to enroll in paid courses for free by directly invoking a server action with a parameter that skips payment verification. Combined with an **instant course completion** vulnerability, an attacker can obtain fraudulent certificates in seconds without paying or learning. A separate **content governance bypass** allows mentors to self-approve their own courses without admin review, undermining platform quality control.

The application relies heavily on Supabase Row Level Security (RLS) for access control, which effectively blocks several classes of attacks (identity spoofing, cross-user data manipulation). However, the application layer lacks authorization checks in server actions, creating a fragile security posture where any RLS misconfiguration would expose critical vulnerabilities. The platform's financial and academic integrity are at immediate risk.

### Risk Overview

| Severity | Count | Key Findings |
|----------|-------|-------------|
| Critical | 2 | Payment bypass, mentor self-approval |
| High | 3 | Admin privilege escalation, quiz answer exposure, instant completion |
| Medium | 8 | Race conditions, missing headers, no rate limiting, debug page exposed |
| Low | 3 | Wildcard injection, clickjacking, dependency management |

### Top Recommendations

1. **Remove `skipPaymentCheck` parameter** from `enrollInCourse()` and create a separate internal-only enrollment function for webhook/admin use — fixes the payment bypass immediately (effort: Low, impact: Critical)
2. **Add role verification to all server actions** that perform privileged operations — add `getUser()` + role check at the start of `approveCourse`, admin inline actions, and `getAllCourseQuests` (effort: Medium, impact: High)
3. **Restrict `getAllCourseQuests` to course owners** — prevents quiz answer leakage that undermines all assessments (effort: Low, impact: High)

---

## Detailed Findings

### [CRITICAL-001] Payment Bypass via `skipPaymentCheck` Parameter

**Severity**: Critical | **CVSS**: 9.1 (AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:N + financial impact) | **CWE**: CWE-862
**Location**: `lib/actions/courses.ts:14`

**Description**:
The `enrollInCourse()` server action accepts a `skipPaymentCheck` boolean parameter that, when set to `true`, bypasses all payment verification. This parameter is directly controllable by any authenticated user calling the server action. The database's Row Level Security only verifies that the student is enrolling themselves — it does not enforce payment status.

**Vulnerable Code**:
```typescript
// lib/actions/courses.ts:14
export async function enrollInCourse(studentId: string, courseId: string, skipPaymentCheck = false) {
  // ...
  // If course is paid and not skipping payment check, verify payment
  if (!skipPaymentCheck && course.price && course.price > 0) {
    // Payment verification — ENTIRELY SKIPPED when skipPaymentCheck=true
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .eq('status', 'completed')
      .single()
    if (!payment) {
      return { success: false, error: 'Payment required for this course' }
    }
  }
  // Enrollment proceeds regardless of payment...
}
```

**Attack Scenario**:
1. Attacker registers as a student (free)
2. Attacker identifies a paid course UUID (visible on course listing pages)
3. Attacker calls: `enrollInCourse(myUserId, paidCourseId, true)`
4. Enrollment succeeds — full course access granted without payment

**Impact**:
- Complete revenue loss — all paid courses accessible for free
- No audit trail distinguishes legitimate from fraudulent enrollments
- Combined with VULN-BL-001, attacker gets certificate in seconds

**Remediation**:
```typescript
// Split into two functions: public (always checks payment) and internal (admin/webhook only)
export async function enrollInCourse(courseId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: course } = await supabase.from('courses').select('price').eq('id', courseId).single()
  if (course?.price && course.price > 0) {
    const { data: payment } = await supabase.from('payments')
      .select('id').eq('student_id', user.id).eq('course_id', courseId).eq('status', 'completed').single()
    if (!payment) return { success: false, error: 'Payment required' }
  }
  // ... proceed with enrollment using user.id as studentId
}

// Internal function — only callable from webhook handler with admin client
export async function _internalEnrollAfterPayment(studentId: string, courseId: string) {
  const adminClient = createAdminClient()
  // ... enrollment logic with admin client
}
```

**Effort**: Low — parameter removal + function split

---

### [CRITICAL-002] Mentor Self-Approval Bypasses Admin Review

**Severity**: Critical | **CVSS**: 8.8 (AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:N) | **CWE**: CWE-862
**Location**: `lib/actions/courses.ts:843` and `lib/actions/courses.ts:577`

**Description**:
The `approveCourse()` function performs no role verification — any authenticated user can call it. Since the RLS UPDATE policy on courses allows `instructor_id = auth.uid()`, a mentor can approve their own course. Additionally, `updateCourse()` accepts arbitrary fields at runtime (mass assignment), allowing a mentor to set `is_approved: true` directly.

**Vulnerable Code**:
```typescript
// lib/actions/courses.ts:843 — No admin check
export async function approveCourse(courseId: string, approved: boolean) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courses')
    .update({ is_approved: approved, updated_at: new Date().toISOString() })
    .eq('id', courseId)
    .select().single()
  // RLS allows because instructor_id = auth.uid() for course owner
}
```

**Attack Scenario**:
1. Mentor creates a course with malicious content
2. Mentor calls `approveCourse(myCourseId, true)` — or `updateCourse(myCourseId, {is_approved: true})`
3. Course is now approved and visible to all students
4. No admin ever reviewed the content

**Impact**:
- Malicious content (phishing, malware links, misinformation) published without review
- Platform reputation damage
- Potential legal liability for harmful content

**Remediation**:
```typescript
export async function approveCourse(courseId: string, approved: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { success: false, error: 'Admin access required' }

  // Use admin client for the actual update (to bypass instructor-only RLS)
  const adminClient = createAdminClient()
  const { data, error } = await adminClient.from('courses')
    .update({ is_approved: approved }).eq('id', courseId).select().single()
  // ...
}

// Also: add runtime field allowlist to updateCourse()
const ALLOWED_FIELDS = ['title', 'description', 'thumbnail_url', 'difficulty', 'category', 'price', 'learning_objectives', 'prerequisites', 'is_published']
const sanitized = Object.fromEntries(Object.entries(courseData).filter(([k]) => ALLOWED_FIELDS.includes(k)))
```

**Effort**: Low — add role check + field allowlist

---

### [HIGH-001] Admin Privilege Escalation via Unprotected Server Actions

**Severity**: High | **CVSS**: 8.1 (AV:N/AC:H/PR:L/UI:N/S:U/C:H/I:H/A:H) | **CWE**: CWE-862
**Location**: `app/admin/users/page.tsx:10,44,62`

**Description**:
Inline server actions (`approveUser`, `rejectUser`, `toggleUserActive`) use the Supabase admin client (service role key) to modify user accounts but contain no authorization checks. While the page itself redirects non-admins, the server actions are independent endpoints. An attacker with knowledge of the action IDs (obtainable from source code) can invoke them directly.

**Vulnerable Code**:
```typescript
// app/admin/users/page.tsx:10
async function approveUser(formData: FormData) {
  'use server'
  const adminClient = createAdminClient() // SERVICE ROLE KEY — bypasses ALL RLS
  const userId = formData.get('userId') as string
  // NO AUTH CHECK — proceeds directly to privileged operation
  await adminClient.from('profiles').update({ is_approved: true }).eq('id', userId)
  await adminClient.auth.admin.updateUserById(userId, { email_confirm: true })
}
```

**Attack Scenario**:
1. Attacker obtains source code (open-source, leaked repo, or insider)
2. Attacker determines server action ID from build output or source analysis
3. Attacker (authenticated as student) sends POST with action ID and `userId` = their own pending mentor account
4. Account is approved with email confirmed — attacker gains mentor privileges

**Impact**:
- Approve/reject/deactivate any user account
- Self-approve pending accounts for elevated roles
- Deactivate admin accounts (denial of service on admin capability)
- All operations bypass RLS via service role key

**Remediation**:
```typescript
async function approveUser(formData: FormData) {
  'use server'
  // ALWAYS verify caller identity and role first
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Only then use admin client
  const adminClient = createAdminClient()
  const userId = formData.get('userId') as string
  // ...proceed with privileged operation
}
```

**Effort**: Low — add 5 lines of auth check to each action

---

### [HIGH-002] Quiz Answers Exposed to All Authenticated Users

**Severity**: High | **CVSS**: 7.5 (AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N) | **CWE**: CWE-200
**Location**: `lib/actions/quests.ts:659`

**Description**:
The `getAllCourseQuests()` server action returns quiz questions with the `is_correct` field on each option. This function is exported and callable by any authenticated user. The RLS SELECT policy on `quest_options` allows "everyone" to read all fields. While intended for mentor course management, no ownership check restricts access.

**Vulnerable Code**:
```typescript
// lib/actions/quests.ts:659
export async function getAllCourseQuests(courseId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('quests').select(`
    *, quest_questions (
      id, question_text, question_type, points, order_index,
      quest_options ( id, option_text, is_correct, order_index )  // ← is_correct EXPOSED
    )
  `).eq('course_id', courseId)
  // No ownership check — any authenticated user gets correct answers
}
```

**Attack Scenario**:
1. Student identifies course ID (visible in URLs)
2. Student calls `getAllCourseQuests(courseId)`
3. Response contains `is_correct: true/false` for every option
4. Student submits perfect answers on all quizzes
5. Combined with VULN-BL-001: instant 100% completion + certificate

**Impact**:
- Complete academic integrity compromise across all courses
- All certificates and scores are untrustworthy
- Leaderboard rankings meaningless

**Remediation**:
```typescript
export async function getAllCourseQuests(courseId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Only course instructor can see correct answers
  const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', courseId).single()
  if (course?.instructor_id !== user.id) {
    return { success: false, error: 'Only course instructor can view quiz details' }
  }
  // ...proceed
}
```

**Effort**: Low — add 4 lines of ownership check

---

### [HIGH-003] Instant Course Completion and Fraudulent Certificates

**Severity**: High | **CVSS**: 7.1 (AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:N) | **CWE**: CWE-841
**Location**: `lib/actions/courses.ts:85`

**Description**:
The `markSubMaterialCompleted()` function accepts `timeSpent: 0` with no minimum validation. A student can mark all lessons in their enrolled course as complete in rapid succession, triggering automatic course completion, certificate generation, point awards, and skill updates — all without consuming any content.

**Vulnerable Code**:
```typescript
// lib/actions/courses.ts:85
export async function markSubMaterialCompleted(
  enrollmentId: string,
  subMaterialId: string,
  timeSpent: number = 0  // ← No minimum enforced
) {
  // No check that content was actually viewed
  // No minimum time requirement
  // Directly marks as completed
}
```

**Attack Scenario**:
1. Student enrolls in course (free, or via CRITICAL-001 payment bypass)
2. Student fetches course structure via `getCourseById(courseId)`
3. Student loops through all sub_materials calling `markSubMaterialCompleted(enrollmentId, lessonId, 0)`
4. Progress reaches 100% → `completeCourse()` auto-triggers
5. Certificate generated, points awarded, skills updated — all in seconds

**Impact**:
- Fraudulent professional certificates issued
- Platform credentials lose market value
- Gamification system corrupted (inflated points/badges)

**Remediation**:
```typescript
export async function markSubMaterialCompleted(enrollmentId: string, subMaterialId: string, timeSpent: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Verify enrollment belongs to user
  const { data: enrollment } = await supabase.from('enrollments')
    .select('student_id').eq('id', enrollmentId).single()
  if (enrollment?.student_id !== user.id) return { success: false, error: 'Not your enrollment' }

  // Enforce minimum time (e.g., 30 seconds or 80% of video duration)
  const { data: lesson } = await supabase.from('sub_materials')
    .select('video_duration').eq('id', subMaterialId).single()
  const minTime = Math.max(30, (lesson?.video_duration || 60) * 0.8)
  if (timeSpent < minTime) return { success: false, error: 'Insufficient time spent' }

  // ...proceed
}
```

**Effort**: Medium — requires minimum time logic + enrollment ownership check


---

### [MEDIUM-001] Race Condition Bypasses Quiz Attempt Limits

**Severity**: Medium | **CVSS**: 5.3 (AV:N/AC:H/PR:L/UI:N/S:U/C:N/I:L/A:N) | **CWE**: CWE-367
**Location**: `lib/actions/quests.ts:42-52`

**Description**:
The max_attempts check in `submitQuestAttempt()` uses a non-atomic SELECT-then-INSERT pattern. Concurrent requests can all pass the count check before any new attempt is committed, allowing students to exceed the configured attempt limit.

**Attack Scenario**:
Student sends 5+ concurrent `submitQuestAttempt` requests when at `max_attempts - 1`. Multiple requests pass the check simultaneously.

**Impact**: Students bypass attempt limits to retry quizzes for better scores. Self-exploitation only.

**Remediation**: Use a database-level unique constraint or advisory lock, or implement optimistic locking with a version counter.

**Effort**: Medium

---

### [MEDIUM-002] No Application-Level Rate Limiting

**Severity**: Medium | **CVSS**: 5.3 (AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L) | **CWE**: CWE-307
**Location**: All endpoints

**Description**:
No rate limiting exists in application code. Supabase Auth provides built-in limits on authentication endpoints, but server actions (quiz submission, progress marking, enrollment) are unlimited.

**Impact**: Enables brute force attacks, spam, and amplifies race condition exploitation.

**Remediation**: Add rate limiting middleware (e.g., `next-rate-limit` or Vercel/Netlify edge rate limiting). Priority endpoints: `/api/checkout`, `signIn`, `signUp`, `submitQuestAttempt`.

**Effort**: Medium

---

### [MEDIUM-003] Middleware Only Checks Authentication, Not Authorization

**Severity**: Medium | **CVSS**: 5.4 (AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:L/A:N) | **CWE**: CWE-863
**Location**: `middleware.ts:44`

**Description**:
The middleware protects routes by checking if a user is authenticated but does not verify roles. A student can access `/admin/*` or `/mentor/*` paths — page components redirect, but server actions defined in those pages remain theoretically accessible.

**Impact**: Architectural weakness that enables VULN-AC-002 attack chain. Defense relies solely on page-level checks.

**Remediation**: Add role-based path protection in middleware:
```typescript
const adminPaths = ['/admin']
const mentorPaths = ['/mentor']
if (adminPaths.some(p => pathname.startsWith(p)) && profile?.role !== 'admin') {
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

**Effort**: Low

---

### [MEDIUM-004] No Security Headers Configured

**Severity**: Medium | **CVSS**: 4.3 (AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:L/A:N) | **CWE**: CWE-693
**Location**: `next.config.js`

**Description**:
No security headers are configured. Missing: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy, Permissions-Policy.

**Impact**: Clickjacking possible, no CSP defense-in-depth against XSS, no HSTS.

**Remediation**:
```javascript
// next.config.js
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" },
    ],
  }]
}
```

**Effort**: Low

---

### [MEDIUM-005] Debug Page Accessible Without Authentication

**Severity**: Medium | **CVSS**: 5.3 (AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N) | **CWE**: CWE-489
**Location**: `app/test-db/page.tsx`

**Description**:
The `/test-db` diagnostic page is accessible without authentication. It reveals database connection status, environment variable presence, and table names.

**Impact**: Information disclosure aids attacker reconnaissance.

**Remediation**: Delete the page or add to middleware protected paths with admin role check.

**Effort**: Low (delete file)

---

### [MEDIUM-006] Mass Assignment in Course Update

**Severity**: Medium | **CVSS**: 5.4 (AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:L/A:N) | **CWE**: CWE-915
**Location**: `lib/actions/courses.ts:577`

**Description**:
`updateCourse()` spreads caller-provided data directly into the database update without runtime field validation. TypeScript types are not enforced at runtime. A mentor can set `is_approved`, `enrollment_count`, or other protected fields on their own course.

**Impact**: Overlaps with CRITICAL-002 (self-approval). Enables manipulation of any course column the RLS UPDATE policy permits.

**Remediation**: Add runtime field allowlist before spreading into update.

**Effort**: Low

---

### [MEDIUM-007] Course IDOR — Defense-in-Depth Failure

**Severity**: Medium | **CVSS**: 3.5 (AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:N) | **CWE**: CWE-639
**Location**: `lib/actions/courses.ts` — all CRUD functions

**Description**:
No application-level ownership checks exist in `updateCourse`, `deleteCourse`, `createMaterial`, etc. Currently blocked by RLS policies. If RLS is ever disabled or misconfigured, these become Critical IDOR vulnerabilities.

**Impact**: No current exploitability. Architectural risk.

**Remediation**: Add ownership verification in each function regardless of RLS.

**Effort**: Medium

---

### [MEDIUM-008] Course Price Manipulation

**Severity**: Medium | **CVSS**: 4.3 (AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:L/A:N) | **CWE**: CWE-841
**Location**: `lib/actions/courses.ts:577`

**Description**:
Mentors can set their own course price to 0 without admin approval, then revert after select students enroll. This bypasses the payment system for targeted users.

**Impact**: Revenue loss through selective free access. Business policy gap.

**Remediation**: Require admin approval for price changes on published courses, or log price change history.

**Effort**: Medium

---

### [LOW-001] Supabase ilike Wildcard Injection

**Severity**: Low | **CVSS**: 3.1 (AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N) | **CWE**: CWE-943
**Location**: `lib/actions/tools.ts:30-33`

**Description**: Unescaped `%` and `_` wildcards in search query allow pattern-based enumeration of the security tools catalog.

**Impact**: Minor — tools catalog is non-sensitive public data.

**Remediation**: Escape `%` and `_` in searchQuery before passing to ilike.

**Effort**: Low

---

### [LOW-002] Clickjacking Possible

**Severity**: Low | **CVSS**: 3.1 (AV:N/AC:H/PR:N/UI:R/S:U/C:N/I:L/A:N) | **CWE**: CWE-1021
**Location**: `next.config.js`

**Description**: No `X-Frame-Options` or CSP `frame-ancestors` directive. Application can be embedded in iframes.

**Impact**: Requires social engineering + authenticated admin victim. Low practical risk.

**Remediation**: Covered by MEDIUM-004 security headers fix.

**Effort**: Low (included in MEDIUM-004)

---

### [LOW-003] Dependency Management Gaps

**Severity**: Low | **CVSS**: 2.0 | **CWE**: CWE-1104
**Location**: `package.json`

**Description**: All dependencies use caret (`^`) version ranges. No `npm audit` in CI/CD scripts. Mitigated by `package-lock.json` for reproducible builds.

**Impact**: Supply chain risk if lock file is not respected in all environments.

**Remediation**: Add `npm audit --audit-level=high` to CI pipeline. Consider using exact versions for critical dependencies.

**Effort**: Low

---

## Remediation Roadmap

| Priority | Finding | Fix | Effort | Timeline |
|----------|---------|-----|--------|----------|
| 1 | CRITICAL-001 | Remove `skipPaymentCheck` param; split into public/internal functions | Low | Immediate |
| 2 | CRITICAL-002 | Add admin role check to `approveCourse`; add field allowlist to `updateCourse` | Low | Immediate |
| 3 | HIGH-002 | Add ownership check to `getAllCourseQuests` | Low | Immediate |
| 4 | HIGH-001 | Add role verification inside all admin inline server actions | Low | 1-2 days |
| 5 | HIGH-003 | Add minimum time validation + enrollment ownership check to `markSubMaterialCompleted` | Medium | 1 week |
| 6 | MEDIUM-005 | Delete `/test-db` page | Low | Immediate |
| 7 | MEDIUM-003 | Add role-based checks to middleware | Low | 1-2 days |
| 8 | MEDIUM-004 | Add security headers to `next.config.js` | Low | 1-2 days |
| 9 | MEDIUM-006 | Add runtime field allowlist to `updateCourse` | Low | 1-2 days |
| 10 | MEDIUM-001 | Implement atomic attempt counting (DB constraint or advisory lock) | Medium | 1 week |
| 11 | MEDIUM-002 | Add rate limiting to critical endpoints | Medium | 1-2 weeks |
| 12 | MEDIUM-007 | Add application-level ownership checks to all CRUD actions | Medium | 2 weeks |
| 13 | MEDIUM-008 | Add admin approval for price changes on published courses | Medium | 2 weeks |
| 14 | LOW-001 | Escape wildcards in tools search | Low | 1 day |
| 15 | LOW-003 | Add `npm audit` to CI pipeline | Low | 1 day |

---

## Methodology

| Step | Tool/Skill | Output |
|------|-----------|--------|
| 1. Reconnaissance | `sc1-recon` | `assessment/recon.md` — Technology stack, 50+ entry points, auth model, data flows |
| 2. Threat Modelling | `sc2-threat-model` | `assessment/threat-model.md` — STRIDE analysis, attack trees, priority targets |
| 3. Vulnerability Scanning | `sc3-vuln-scan` (9 sub-scanners) | `assessment/vulnerabilities.md` — 27 initial findings across access control, logic, data exposure, auth, injection, misconfig, API, client-side, dependencies |
| 4. Validation | `sc4-validate` | `assessment/validated-vulnerabilities.md` — 5 false positives eliminated, 3 downgraded, 5 duplicates merged |
| 5. Report | `sc5-report` | This document |

---

## Scope & Limitations

**In Scope**:
- All TypeScript/TSX source code in the repository
- Database schema and RLS policies (SQL files in `database/`)
- Next.js configuration, middleware, and routing
- Server actions, API routes, and page-level server components
- Dependency manifest (`package.json`)

**Out of Scope**:
- Runtime/dynamic testing (no live environment accessed)
- Supabase dashboard configuration (rate limits, auth settings)
- Netlify/CDN edge configuration
- Cloudinary upload preset configuration
- Third-party service security (Stripe, Supabase, Google OAuth)

**Areas Requiring Dynamic Testing**:
- **VULN-BL-004**: Stripe webhook → enrollment flow may be broken due to RLS (webhook has no user session). Needs runtime verification to determine if payments table has RLS disabled in production.
- **Rate limiting**: Supabase and Netlify may provide rate limiting not visible in code.
- **RLS enforcement**: While policies are defined in SQL files, actual deployed state may differ.

---

## Disclaimer

This assessment was performed through static source code analysis only. Findings are based on code review, data flow tracing, and RLS policy analysis. No live systems were accessed or tested. Actual exploitability may vary based on deployment configuration, infrastructure-level controls, and Supabase project settings not visible in the codebase.
