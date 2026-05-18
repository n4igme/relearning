# Threat Model

**Based on**: assessment/recon.md
**Date**: 2026-05-18
**Target**: CyberSec Academy (Next.js 15 + Supabase e-learning platform)

---

## Threat Actors

| Actor | Access Level | Motivation | Capabilities |
|-------|-------------|------------|--------------|
| Unauthenticated external attacker | None | Data theft, free course access, platform disruption | Can access /test-db, /login, /register, public pages; can attempt credential stuffing |
| Authenticated student | Standard (student role) | Free paid courses, fake credentials, leaderboard manipulation, access other students' data | Can invoke all server actions, supply arbitrary IDs |
| Authenticated mentor | Elevated (mentor role) | Modify other mentors' courses, self-approve courses, access admin functions | Same as student + course creation privileges |
| Malicious admin / compromised admin account | Full (admin role) | Data exfiltration, platform sabotage | Service role key access, can bypass all RLS |
| Compromised dependency / supply chain | Build-time | Backdoor, credential theft | TypeScript errors and lint ignored in build — malicious code won't be caught |

---

## STRIDE Analysis

### Server Actions — Course Management (`lib/actions/courses.ts`)

| Threat | Category | Risk Level | Attack Vector |
|--------|----------|------------|---------------|
| Any user can modify/delete any course | Tampering | **Critical** | Call `updateCourse(victimCourseId, {...})` or `deleteCourse(victimCourseId)` — no ownership check |
| Any user can self-approve courses | Elevation of Privilege | **Critical** | Call `approveCourse(ownCourseId, true)` — no admin role check |
| Student can create courses as any instructor | Spoofing | **High** | Call `createCourse(anyInstructorId, {...})` — instructorId not validated against session |
| Any user can view all courses including drafts | Information Disclosure | **Medium** | Call `getAllCoursesAdmin()` — no admin check |
| Course deletion has no audit trail | Repudiation | **Medium** | Deleted courses leave no record of who deleted them |

### Server Actions — Quest/Quiz System (`lib/actions/quests.ts`)

| Threat | Category | Risk Level | Attack Vector |
|--------|----------|------------|---------------|
| Submit quiz answers as another student | Spoofing | **Critical** | `submitQuestAttempt(questId, victimStudentId, answers)` — studentId not validated |
| Fetch correct answers before attempting | Information Disclosure | **High** | `getQuestWithQuestions(questId)` returns `is_correct` field on options |
| Bypass max_attempts limit | Tampering | **High** | Race condition: send concurrent requests before count updates |
| Any user can delete/modify quiz questions | Tampering | **Critical** | `deleteQuest()`, `updateQuestion()`, `deleteOption()` — no ownership check |
| Unlimited quiz retries via race | Denial of Service | **Medium** | Flood `submitQuestAttempt` to generate unlimited point awards |

### Server Actions — Enrollment & Payments (`lib/actions/courses.ts`, `payments.ts`)

| Threat | Category | Risk Level | Attack Vector |
|--------|----------|------------|---------------|
| Enroll in paid courses for free | Tampering | **Critical** | `enrollInCourse(myId, courseId, true)` — skipPaymentCheck=true accepted from any caller |
| Manipulate payment status | Tampering | **High** | `updatePaymentStatus({sessionId, status:'completed'})` — no auth check |
| View other students' payment history | Information Disclosure | **Medium** | `getStudentPayments(victimId)` — no ownership check |
| View course revenue data | Information Disclosure | **Medium** | `getCoursePayments(courseId)` — no auth check |

### Server Actions — Gamification (`lib/actions/gamification.ts`, `skills.ts`)

| Threat | Category | Risk Level | Attack Vector |
|--------|----------|------------|---------------|
| Award arbitrary points to self | Tampering | **High** | `awardPoints(myId, 99999, 'quest', fakeId)` — no validation |
| Manipulate leaderboard rankings | Tampering | **High** | Combine point farming + streak manipulation |
| Inflate skill proficiency | Tampering | **Medium** | `updateSkillProficiency(myId, skillId, 'expert', 9999)` — no validation |
| Trigger badge awards fraudulently | Tampering | **Medium** | Inflate stats then call `checkAndAwardBadges(myId)` |

### Admin Server Actions (`app/admin/users/page.tsx`)

| Threat | Category | Risk Level | Attack Vector |
|--------|----------|------------|---------------|
| Non-admin can approve/reject users | Elevation of Privilege | **Critical** | Invoke `approveUser` server action directly — uses admin client, no role check in action |
| Non-admin can deactivate any user | Denial of Service | **Critical** | Invoke `toggleUserActive` with any userId — no role check |
| Admin actions have no audit beyond redirect params | Repudiation | **Medium** | No persistent audit log of who approved/rejected whom |

### Middleware & Auth (`middleware.ts`, `lib/actions/auth.ts`)

| Threat | Category | Risk Level | Attack Vector |
|--------|----------|------------|---------------|
| No role-based route protection | Elevation of Privilege | **High** | Middleware only checks auth, not role — student can access /admin/* page rendering (blocked at component level only) |
| No rate limiting on login | Denial of Service | **Medium** | Credential stuffing / brute force on `signIn` |
| No rate limiting on registration | Denial of Service | **Medium** | Mass account creation |
| /test-db accessible without auth | Information Disclosure | **Medium** | Reveals DB connection status, env var presence, table names |

### Infrastructure & Configuration

| Threat | Category | Risk Level | Attack Vector |
|--------|----------|------------|---------------|
| No security headers (CSP, X-Frame-Options) | Tampering | **Medium** | Clickjacking via iframe embedding |
| Build ignores TypeScript/ESLint errors | Tampering | **Low** | Malicious or buggy code passes build without detection |
| Supabase filter injection in tools search | Information Disclosure | **Low** | `%` and `_` wildcards in ilike pattern — data enumeration |

---

## Feature Threat Analysis

### Course Enrollment (Stripe Payment)

**Endpoints**: `POST /api/checkout`, `POST /api/webhooks/stripe`, `enrollInCourse()`
**Assets at Risk**: Revenue (course fees), paid content access

| Abuse Case | Attack Vector | Impact | Likelihood |
|------------|--------------|--------|------------|
| Bypass payment entirely | Call `enrollInCourse(myId, courseId, true)` directly | Free access to paid courses | **High** |
| Forge payment completion | Call `updatePaymentStatus({sessionId: x, status: 'completed'})` | Free access + fake payment record | **High** |
| Enroll another user without consent | Call `enrollInCourse(victimId, courseId, true)` | Unwanted enrollment, progress pollution | **Medium** |
| Replay webhook | Resend captured webhook body (mitigated by Stripe signature) | Duplicate enrollment | **Low** |

**Trust Assumptions Violated**:
- Assumes only webhook/admin calls `enrollInCourse` with `skipPaymentCheck=true`
- Assumes `updatePaymentStatus` is only called from webhook handler

---

### Course Management (Mentor)

**Endpoints**: `createCourse`, `updateCourse`, `deleteCourse`, `createMaterial`, `createSubMaterial`, `approveCourse`
**Assets at Risk**: Course intellectual property, platform content integrity

| Abuse Case | Attack Vector | Impact | Likelihood |
|------------|--------------|--------|------------|
| Deface/delete competitor's course | `deleteCourse(victimCourseId)` | Content destruction | **High** |
| Self-approve own course | `approveCourse(myCourseId, true)` | Bypass admin review | **High** |
| Inject malicious content into others' courses | `updateSubMaterial(victimLessonId, {content: 'phishing'})` | Phishing/malware distribution | **High** |
| Impersonate another instructor | `createCourse(victimInstructorId, {...})` | Reputation damage | **Medium** |

**Trust Assumptions Violated**:
- Assumes only the course owner calls update/delete on their own course
- Assumes only admins call `approveCourse`

---

### Assessment System (Quests)

**Endpoints**: `submitQuestAttempt`, `getQuestWithQuestions`, `canAttemptQuest`
**Assets at Risk**: Academic integrity, certification validity, gamification fairness

| Abuse Case | Attack Vector | Impact | Likelihood |
|------------|--------------|--------|------------|
| Cheat on quiz (fetch answers first) | `getQuestWithQuestions(questId)` → read `is_correct` from options | Perfect scores without learning | **High** |
| Submit perfect score for another student | `submitQuestAttempt(questId, victimId, correctAnswers)` | Fake credentials for victim | **High** |
| Bypass attempt limits | Concurrent requests exploiting TOCTOU race | Unlimited retries | **Medium** |
| Delete quiz before others can take it | `deleteQuest(questId)` | Denial of assessment | **Medium** |
| Modify correct answers after submission | `updateOption(optionId, {is_correct: false})` | Invalidate others' scores | **High** |

**Trust Assumptions Violated**:
- Assumes `is_correct` is never exposed to client
- Assumes `studentId` in submission matches authenticated user
- Assumes max_attempts check is atomic

---

### Admin User Management

**Endpoints**: `approveUser`, `rejectUser`, `toggleUserActive` (inline server actions)
**Assets at Risk**: Platform access control, user accounts

| Abuse Case | Attack Vector | Impact | Likelihood |
|------------|--------------|--------|------------|
| Student approves own mentor account | Register as mentor → invoke `approveUser(myId)` | Unauthorized mentor access | **High** |
| Deactivate admin accounts | Invoke `toggleUserActive(adminId)` | Lock out legitimate admins | **High** |
| Mass-deactivate all users | Script to call `toggleUserActive` for all user IDs | Platform-wide DoS | **Medium** |

**Trust Assumptions Violated**:
- Assumes only admin-rendered page can trigger these actions
- Assumes Next.js server action binding prevents direct invocation (it doesn't)

---

### Gamification & Leaderboard

**Endpoints**: `awardPoints`, `updateStreak`, `updateSkillProficiency`, `checkAndAwardBadges`
**Assets at Risk**: Competitive integrity, badge/certificate value

| Abuse Case | Attack Vector | Impact | Likelihood |
|------------|--------------|--------|------------|
| Infinite point farming | `awardPoints(myId, 99999, 'quest', fakeId)` repeatedly | #1 leaderboard position | **High** |
| Fake streak | `updateStreak(myId)` daily without actual activity | Streak badges unlocked | **Medium** |
| Expert-level skills without learning | `updateSkillProficiency(myId, skillId, 'expert', 9999)` | Fake expertise claims | **Medium** |
| Trigger all badges at once | Inflate stats → `checkAndAwardBadges(myId)` | All achievements unlocked | **Medium** |

**Trust Assumptions Violated**:
- Assumes gamification functions are only called internally after legitimate actions
- Assumes studentId parameter matches the authenticated user

---

### Learning Progress & Certificates

**Endpoints**: `markSubMaterialCompleted`, `updateCourseProgress`, `generateCertificate`
**Assets at Risk**: Certificate validity, academic records

| Abuse Case | Attack Vector | Impact | Likelihood |
|------------|--------------|--------|------------|
| Complete course instantly | Call `markSubMaterialCompleted` for all lessons in victim's enrollment | Instant certificate generation | **High** |
| Generate certificate without learning | Mark all progress → triggers `completeCourse` → `generateCertificate` | Fraudulent credential | **High** |
| Pollute another student's progress | Use victim's enrollmentId in `markSubMaterialCompleted` | Corrupt their learning state | **Medium** |

**Trust Assumptions Violated**:
- Assumes enrollmentId belongs to the calling user
- Assumes progress is only marked through the learning interface

---

## Attack Trees

### Goal 1: Free Access to Paid Courses

```
Goal: Enroll in paid course without paying
├── Path A: Direct enrollment bypass [EASIEST]
│   ├── Precondition: Authenticated as any user
│   └── Steps: Call enrollInCourse(myId, courseId, skipPaymentCheck=true)
├── Path B: Forge payment status
│   ├── Precondition: Know a pending payment sessionId
│   └── Steps: Call updatePaymentStatus({sessionId, status:'completed'})
├── Path C: Self-approve enrollment request
│   ├── Precondition: Authenticated as any user (if admin actions unprotected)
│   └── Steps: Create enrollment request → invoke approveEnrollmentRequest(requestId)
│   └── Note: This path is BLOCKED — approveEnrollmentRequest has admin role check
└── Path D: Manipulate course price
    ├── Precondition: Authenticated as any user
    └── Steps: Call updateCourse(courseId, {price: 0}) → enroll normally as free course
```

### Goal 2: Account Takeover / Privilege Escalation

```
Goal: Gain admin privileges
├── Path A: Self-approve as admin [NOT DIRECTLY POSSIBLE — role set at registration]
├── Path B: Activate deactivated admin account
│   ├── Precondition: Know an inactive admin's userId
│   └── Steps: Invoke toggleUserActive(adminId) to reactivate, then somehow access their session
│   └── Note: Reactivation alone doesn't give session access
├── Path C: Approve own mentor account
│   ├── Precondition: Registered as mentor (pending approval)
│   └── Steps: Invoke approveUser(myId) → now approved mentor
└── Path D: Deactivate all other admins (DoS on admin capability)
    ├── Precondition: Authenticated as any user
    └── Steps: Enumerate admin userIds → toggleUserActive for each → only attacker's account active
```

### Goal 3: Fraudulent Certification

```
Goal: Obtain course certificate without completing coursework
├── Path A: Instant progress completion [EASIEST]
│   ├── Precondition: Enrolled in course (free or via payment bypass)
│   └── Steps:
│       1. Get enrollment ID from getStudentEnrollments(myId)
│       2. Get all sub_material IDs from getCourseById(courseId)
│       3. Call markSubMaterialCompleted(enrollmentId, subMaterialId) for each
│       4. Auto-triggers completeCourse → generateCertificate
├── Path B: Cheat on quizzes for high score
│   ├── Precondition: Enrolled in course
│   └── Steps:
│       1. Call getQuestWithQuestions(questId) → extract is_correct from options
│       2. Submit perfect answers via submitQuestAttempt
│       3. Certificate generated with high average score
└── Path C: Direct point/badge manipulation
    ├── Precondition: Authenticated
    └── Steps: awardPoints + checkAndAwardBadges to meet all badge criteria
```

### Goal 4: Platform Sabotage

```
Goal: Destroy platform content and disrupt service
├── Path A: Mass course deletion
│   ├── Precondition: Authenticated as any user
│   └── Steps: getAllCoursesAdmin() → deleteCourse(id) for each
├── Path B: Quiz corruption
│   ├── Precondition: Authenticated as any user
│   └── Steps: Modify correct answers → all future students fail
├── Path C: User deactivation
│   ├── Precondition: Authenticated as any user
│   └── Steps: toggleUserActive for all users → platform-wide lockout
└── Path D: Leaderboard pollution
    ├── Precondition: Authenticated
    └── Steps: awardPoints(myId, MAX_INT, ...) → corrupt rankings
```

---

## Priority Targets

| Priority | Target | Why | Expected Vuln Classes |
|----------|--------|-----|----------------------|
| 1 | `enrollInCourse` (courses.ts:14) | `skipPaymentCheck` param = free paid courses | Broken Access Control, Business Logic Bypass |
| 2 | `approveUser`/`toggleUserActive` (admin/users/page.tsx) | Admin actions without role check, uses service role key | Privilege Escalation, Broken Access Control |
| 3 | `updateCourse`/`deleteCourse` (courses.ts:577,615) | No ownership verification | IDOR, Broken Access Control |
| 4 | `submitQuestAttempt` (quests.ts:13) | Accepts arbitrary studentId, race condition on max_attempts | Spoofing, TOCTOU Race Condition |
| 5 | `getQuestWithQuestions` (quests.ts:229) | Returns `is_correct` field to any caller | Information Disclosure |
| 6 | `approveCourse` (courses.ts:843) | No admin role check | Privilege Escalation |
| 7 | `awardPoints` (gamification.ts:11) | Arbitrary point injection | Business Logic Bypass |
| 8 | `markSubMaterialCompleted` (courses.ts:85) | No enrollment ownership check | IDOR, Business Logic Bypass |
| 9 | `updatePaymentStatus` (payments.ts:60) | No auth check at all | Broken Access Control |
| 10 | `updateQuest`/`deleteQuest`/`updateQuestion` (quests.ts) | No ownership check on quiz CRUD | IDOR, Data Tampering |
| 11 | `/test-db` page | No auth, exposes infra info | Information Disclosure |
| 12 | `getAllTools` filter (tools.ts:13) | ilike wildcard injection | Information Disclosure (minor) |

---

## Trust Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET (Untrusted)                       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Next.js Middleware  │  ← Only checks: is user logged in?
                    │   (Authentication)    │  ← Does NOT check: role, ownership
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
   ┌──────▼──────┐    ┌───────▼───────┐    ┌──────▼──────┐
   │  Page Render  │    │ Server Actions │    │  API Routes  │
   │ (role check)  │    │ (NO role check)│    │ (mixed auth) │
   └──────┬──────┘    └───────┬───────┘    └──────┬──────┘
          │                    │                    │
          │         ┌─────────┼─────────┐          │
          │         │         │         │          │
   ┌──────▼─────────▼─────────▼─────────▼──────────▼──────┐
   │              Supabase Client (anon key + user JWT)      │
   │              RLS applies based on auth.uid()            │
   └────────────────────────────┬──────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Supabase Admin Client │  ← Used by admin page actions
                    │   (service role key)    │  ← BYPASSES ALL RLS
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │     PostgreSQL (RLS)    │
                    └───────────────────────┘
```

**Key boundary violations:**
1. Server actions sit INSIDE the auth boundary but perform NO authorization — they trust parameters blindly
2. Admin client (service role) is invoked from actions that don't verify the caller is admin
3. Page-level role checks create a false sense of security — the underlying actions are independently callable

---

## Assumptions & Gaps

### Cannot Determine from Static Analysis

1. **RLS effectiveness in practice**: While RLS policies exist, the actual behavior depends on whether the Supabase client in server actions carries the user's JWT correctly. If the session cookie is properly forwarded, RLS on `enrollments` (INSERT requires `student_id = auth.uid()`) would block some attacks. Need runtime testing to confirm.

2. **Next.js server action invocation model**: Server actions have built-in CSRF protection via action IDs. However, an authenticated user can invoke ANY server action from their browser — the question is whether the Supabase session (JWT in cookie) limits what the DB allows. This is the critical gap between "action is callable" and "action succeeds."

3. **Cloudinary upload security**: No server-side upload handler found. If uploads go directly from client to Cloudinary with unsigned presets, arbitrary file upload is possible. If signed, the signing logic wasn't found in the codebase.

4. **Email verification enforcement**: It's unclear if unverified accounts can invoke server actions. The auth callback auto-approves students on email confirmation, but what happens if a student calls actions before confirming?

5. **Supabase RLS on gamification tables**: The `leaderboard_stats` INSERT/UPDATE policy requires admin role. If `awardPoints()` uses the student's session (not admin client), the DB would reject the write. This needs runtime verification.

6. **Rate limiting at infrastructure level**: Netlify or Cloudflare (if used) may provide rate limiting not visible in code. Cannot confirm from static analysis.

### Key Hypothesis to Test in Step 3

> **Hypothesis**: Server actions use the user's Supabase session (anon key + JWT cookie). RLS policies will block SOME attacks (e.g., inserting enrollments for other users) but NOT others (e.g., deleting courses where the RLS policy only checks `instructor_id = auth.uid()` for UPDATE, not DELETE). The critical vulnerabilities are where:
> - RLS has no policy for the operation (e.g., no DELETE policy on courses)
> - The action uses the admin client (bypasses RLS entirely)
> - The RLS policy is too permissive (e.g., "viewable by everyone")

This hypothesis determines whether findings are **confirmed critical** or **mitigated by RLS**. Step 3 scanning should prioritize validating this.
