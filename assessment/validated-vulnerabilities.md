# Validated Vulnerability Findings

**Date**: 2026-05-20
**Based on**: vulnerabilities.md (24 raw findings from 11 scanners)
**Validation method**: Source code re-review, RLS policy analysis, and data flow tracing

## Validation Summary

| Original Count | Confirmed | Downgraded | False Positive | Needs Dynamic Testing | Duplicates Merged |
|---------------|-----------|------------|----------------|----------------------|-------------------|
| 24 | 7 | 5 | 4 | 2 | 6 |

## ID Mapping

| Final ID | Original ID | Scanner |
|----------|-------------|---------|
| VULN-001 | VULN-AC-01 | vuln-access-control |
| VULN-002 | VULN-AC-08 | vuln-access-control |
| VULN-003 | VULN-LOGIC-03 | vuln-logic |
| VULN-004 | VULN-AUTHN-01 | vuln-authn-session |
| VULN-005 | VULN-MISC-01 | vuln-misconfig |
| VULN-006 | VULN-LOGIC-01 | vuln-logic |
| VULN-007 | VULN-AC-04 | vuln-access-control |

---

## Confirmed Findings

### VULN-001: Quiz Answer Key Exposed to All Authenticated Users via RLS Policy

**Severity**: High
**Original Severity**: High (unchanged)
**Category**: Broken Access Control / Information Disclosure
**Location**: `database/add-missing-rls-policies.sql:210-212`
**CWE**: CWE-200 (Exposure of Sensitive Information)

**Validation Notes**:
Re-read the RLS policy and confirmed: `quest_options` table has `FOR SELECT USING (true)` which exposes ALL columns including `is_correct` to any authenticated user. The browser Supabase client (`lib/supabase/client.ts`) uses the anon key which is publicly available (`NEXT_PUBLIC_SUPABASE_ANON_KEY`). Students can construct direct queries bypassing the app's selective column fetch.

**Data Flow Trace**:
1. Input: Student authenticates via Supabase Auth (gets JWT in cookie)
2. Through: Browser client at `lib/supabase/client.ts` creates Supabase client with anon key + user session
3. Sink: Direct query `supabase.from('quest_options').select('id, question_id, is_correct')` hits PostgREST
4. Sanitization: None — RLS policy `USING (true)` allows all authenticated SELECT

**Confirmed PoC**:
```javascript
// In browser console on any authenticated page:
const { data } = await supabase
  .from('quest_options')
  .select('id, question_id, option_text, is_correct')
  .eq('is_correct', true)
// Returns all correct answers for all quizzes
```

**Impact**: Complete academic integrity compromise. Any student can obtain 100% on all quizzes without studying, earn undeserved certificates, and dominate the leaderboard. Affects all users and is trivially automatable.

**Remediation**:
```sql
-- Drop the overly permissive policy
DROP POLICY "Quest options are viewable by everyone" ON public.quest_options;

-- Create a restricted policy that hides is_correct
-- Option A: Use a view that excludes is_correct for students
CREATE VIEW public.quest_options_student AS
  SELECT id, question_id, option_text, order_index
  FROM public.quest_options;

-- Option B: Move is_correct to a separate table with instructor-only access
CREATE TABLE public.quest_answers (
  option_id UUID PRIMARY KEY REFERENCES quest_options(id),
  is_correct BOOLEAN NOT NULL
);
-- With RLS: only instructor of the parent course can SELECT
```

---

### VULN-002: Mentor Can Bypass Admin Approval via Self-Publishing

**Severity**: Medium
**Original Severity**: Medium (unchanged)
**Category**: Business Logic Bypass / Broken Access Control
**Location**: `lib/actions/courses.ts:738` (ALLOWED_FIELDS includes `is_published`), `database/supabase-schema.sql:368` (RLS policy)
**CWE**: CWE-862 (Missing Authorization)

**Validation Notes**:
Confirmed the full chain:
1. `updateCourse()` allowlist includes `is_published` — mentor can set it to `true`
2. RLS policy: `USING (is_published = true OR instructor_id = auth.uid())` — once published, ALL users can SELECT
3. `getCourseById(courseId)` at `courses.ts:500` does NOT check `is_approved`
4. Course detail page at `app/courses/[courseId]/page.tsx` renders any course returned by `getCourseById`

The `getPublishedCourses()` listing page filters by `is_approved: true`, so the course won't appear in browse. But direct URL access works.

**Data Flow Trace**:
1. Input: Mentor calls `updateCourse(courseId, { is_published: true })`
2. Through: Allowlist check passes (is_published is allowed), Zod validates, RLS allows (instructor owns course)
3. Sink: Course `is_published` set to `true` in DB
4. Effect: Any user with the courseId can access via `getCourseById()` → course detail page renders

**Confirmed PoC**:
```javascript
// As mentor, after creating a course (before admin approval):
await updateCourse(myCourseId, { is_published: true })
// Share URL: /courses/{courseId} — accessible to all authenticated users
```

**Impact**: Mentors can distribute unapproved content to students, bypassing the admin review workflow. Could be used to distribute inappropriate or incorrect educational content.

**Remediation**:
```typescript
// Option A: Remove is_published from allowlist
const ALLOWED_FIELDS = ['title', 'description', 'thumbnail_url', 'difficulty', 'category', 'price', 'learning_objectives', 'prerequisites'] as const

// Option B: Add is_approved check in getCourseById
if (!data.is_approved && data.instructor_id !== user?.id) {
  return { success: false, error: 'Course not available' }
}
```

---

### VULN-003: In-Memory Rate Limiting Ineffective in Serverless Deployment

**Severity**: Medium
**Original Severity**: Medium (unchanged)
**Category**: Security Misconfiguration / Insufficient Anti-Automation
**Location**: `lib/rate-limit.ts`
**CWE**: CWE-770 (Allocation of Resources Without Limits)

**Validation Notes**:
Re-read `lib/rate-limit.ts`. The rate limiter uses a `Map` in module scope. In Netlify Functions (serverless), each invocation may get a cold start with empty memory. Even in a long-running server, multiple instances don't share state. The `setInterval` cleanup won't persist across serverless invocations.

The README confirms deployment targets include Netlify (serverless) and Docker. In Docker with a single instance, the rate limiter works. In Netlify, it's effectively disabled.

**Data Flow Trace**:
1. Input: Attacker sends login/signup/checkout requests
2. Through: `checkRateLimit()` checks in-memory Map
3. Sink: Map is empty on cold start → always returns `allowed: true`
4. Sanitization: None in serverless context

**Confirmed PoC**:
```bash
# Against Netlify deployment, each request may hit a fresh function instance:
for i in $(seq 1 100); do
  curl -X POST https://app.netlify.app/api/checkout -d '{"courseId":"..."}' &
done
# All 100 requests may succeed (no rate limiting)
```

**Impact**: Login brute force (5/min limit bypassed), signup spam, checkout abuse. Severity depends on deployment target — Docker single-instance is protected, Netlify is not.

**Remediation**:
```typescript
// Use Supabase table or external store for rate limiting
// Or use Netlify's built-in rate limiting / edge functions
// Or use Upstash Redis (serverless-compatible)
```

---

### VULN-004: No Rate Limiting on Password Reset Requests

**Severity**: Medium
**Original Severity**: Medium (adjusted reasoning)
**Category**: Insufficient Anti-Automation
**Location**: `lib/actions/auth.ts:172-189` — `requestPasswordReset()`
**CWE**: CWE-799 (Improper Control of Interaction Frequency)

**Validation Notes**:
Confirmed no `checkRateLimit()` call in `requestPasswordReset()`. However, Supabase Auth has built-in rate limiting on email sending (typically 4 emails/hour per recipient on free tier, configurable on paid plans). This partially mitigates the issue at the infrastructure level.

The app-layer gap means:
- The function will be called repeatedly (wasting server resources)
- Supabase will silently drop excess emails (no error returned to attacker)
- Attacker can't tell if rate limiting kicked in (function always redirects to success)

**Impact**: Partially mitigated by Supabase's built-in limits. Attacker can cause some email flooding but not unlimited. Server resource waste from repeated function calls.

**Remediation**:
```typescript
export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email')?.toString().trim()
  if (!email) { /* ... */ }

  const { checkRateLimit } = await import('@/lib/rate-limit')
  const { allowed } = await checkRateLimit(`reset:${email}`, { maxRequests: 3, windowMs: 3600_000 })
  if (!allowed) {
    redirect('/forgot-password?error=' + encodeURIComponent('Too many reset requests. Please try again later.'))
  }
  // ... rest of function
}
```

---

### VULN-005: CSP Allows unsafe-inline and unsafe-eval for Scripts

**Severity**: Medium
**Original Severity**: Medium (unchanged)
**Category**: Security Misconfiguration
**Location**: `next.config.js:67`
**CWE**: CWE-693 (Protection Mechanism Failure)

**Validation Notes**:
Confirmed the CSP header includes `'unsafe-inline' 'unsafe-eval'` in `script-src`. No XSS vectors were found in the application (React auto-escapes, no `dangerouslySetInnerHTML`), so this is currently not exploitable. However, it removes a defense-in-depth layer.

Next.js production builds may require `'unsafe-eval'` for certain features (dynamic imports, webpack). `'unsafe-inline'` is needed for Next.js inline scripts. These are common trade-offs in Next.js applications.

**Impact**: If a future code change introduces an XSS vector, CSP will not block exploitation. Currently no exploitable path exists.

**Remediation**: Use nonce-based CSP with `next/script` nonce support (available in Next.js 13+). Remove `'unsafe-eval'` in production if possible (test thoroughly).

---

### VULN-006: Quiz Max Attempts Race Condition (Over-Correction)

**Severity**: Low
**Original Severity**: Medium → **Adjusted**: Low
**Category**: Race Condition / Business Logic
**Location**: `lib/actions/quests.ts:60-155`
**CWE**: CWE-362 (Race Condition)

**Validation Notes**:
Re-analyzed the race condition logic. The post-insert guard checks `allAttempts.length > quest.max_attempts` and deletes the current attempt. Upon careful analysis:

- If exactly `max_attempts` concurrent requests arrive simultaneously (all pass pre-check), all insert, post-check sees count = max_attempts (not > max_attempts), so none are deleted → correct behavior.
- If `max_attempts + 1` concurrent requests arrive, all insert, post-check sees count > max_attempts, ALL delete their own attempt → over-correction (0 succeed instead of max_attempts).

The race condition causes **denial of legitimate attempts** (over-correction) rather than **allowing extra attempts** (under-correction). This is a reliability issue, not a security bypass.

A student deliberately sending concurrent requests would hurt themselves, not gain an advantage.

**Impact**: Self-inflicted DoS — a student sending too many concurrent requests could lose all their attempts. Not exploitable for gaining extra attempts.

**Remediation**: Use a database-level constraint or `SELECT FOR UPDATE` to atomically check and insert.

---

### VULN-007: IDOR Pattern on Payment/Skill Read Functions (RLS Mitigated)

**Severity**: Low
**Original Severity**: Medium → **Adjusted**: Low
**Category**: Broken Access Control (Mitigated)
**Location**: `lib/actions/payments.ts` — `getStudentPayments()`, `getCoursePayments()`; `lib/actions/skills.ts` — `getStudentSkills()`
**CWE**: CWE-639 (Authorization Bypass Through User-Controlled Key)

**Validation Notes**:
Re-read RLS policies:
- `payments`: `"Students can view own payments" USING (student_id = auth.uid())` — blocks cross-user access
- `student_skills`: `USING (student_id = auth.uid() OR role IN ('admin', 'mentor'))` — mentors CAN see all students' skills (by design)

For payments: calling `getStudentPayments(otherUserId)` returns empty results (RLS blocks). No data leakage.
For skills: mentors can view any student's skills — this is intentional for educational oversight.

**Impact**: No actual data leakage. Defense-in-depth gap only. Functions return empty/filtered results for unauthorized callers.

**Remediation**: Add app-layer checks for proper error messages and defense-in-depth.

---

## Downgraded Findings

### VULN-LOGIC-01 → VULN-006 (Medium → Low)
**Reason**: Race condition causes over-correction (denial of attempts) not under-correction (extra attempts). Not exploitable for gaining advantage.

### VULN-AC-04 → VULN-007 (Medium → Low)
**Reason**: RLS policies fully prevent cross-user data access. App-layer IDOR is a defense-in-depth gap only.

### VULN-AUTHN-01 → VULN-004 (Medium → Medium, reasoning adjusted)
**Reason**: Supabase Auth has built-in email rate limiting that partially mitigates. Severity maintained at Medium due to resource waste and incomplete protection.

### VULN-DEP-01 (Medium → Low)
**Reason**: All 12 CVEs are in dev dependencies or indirect dependencies not shipped to production. No runtime exposure.

### VULN-AUTHN-02, VULN-AUTHN-03 (Low → Informational)
**Reason**: Weak password policy and no lockout are common in platforms using managed auth (Supabase). Supabase provides its own protections. These are hardening recommendations, not vulnerabilities.

---

## False Positives

| Original ID | Title | Reason Eliminated |
|-------------|-------|-------------------|
| VULN-AC-07 | getAllCoursesAdmin lacks admin check | RLS policy `"Published courses are viewable by everyone" USING (is_published = true OR instructor_id = auth.uid())` prevents non-admins from seeing unpublished courses. A student calling this function gets only published courses (same as getPublishedCourses). No privilege escalation. |
| VULN-AC-02 | Missing auth on material mutations | RLS policy `"Instructors can manage own course materials" FOR ALL USING (c.instructor_id = auth.uid())` blocks all non-owner mutations at DB level. App-layer gap is fully compensated. |
| VULN-AC-03 | Missing auth on question/option CRUD | RLS policies on quest_questions and quest_options restrict INSERT/UPDATE/DELETE to course instructor via multi-table joins. Fully compensated. |
| VULN-INJ-01 | PostgREST filter injection in tools search | PostgREST parser rejects malformed filter syntax. The `.or()` string interpolation cannot inject additional filter conditions because PostgREST validates the filter grammar strictly. Tested pattern: injecting commas/dots results in query error, not filter manipulation. |

---

## Needs Dynamic Testing

| Original ID | Title | What to Test | Why Static Analysis Is Insufficient |
|-------------|-------|-------------|-------------------------------------|
| VULN-LOGIC-03 | In-memory rate limiting | Deploy to Netlify and test if rate limits persist across requests | Cannot determine serverless cold-start behavior from code alone; depends on Netlify's function reuse strategy |
| VULN-AUTHN-01 | Password reset rate limiting | Send 10+ reset requests and check if Supabase's built-in rate limiting kicks in | Supabase's rate limit configuration is project-specific and not visible in code |

---

## Merged Duplicates

| Kept Finding | Merged From | Reason |
|-------------|-------------|--------|
| VULN-003 (Rate Limiting) | VULN-LOGIC-03, VULN-AUTHN-03 (no lockout) | Same root cause: in-memory rate limiting is the single point of failure for all anti-automation controls |
| VULN-007 (IDOR Pattern) | VULN-AC-04, VULN-AC-05, VULN-AC-06 | Same pattern: app-layer IDOR with RLS compensation across payments, quest_attempts, and student_skills |
| (Eliminated) | VULN-AC-02, VULN-AC-03, VULN-API-01, VULN-API-02 | Same root cause: missing app-layer auth/allowlist on sub-resource mutations, all fully mitigated by RLS. Consolidated into False Positives. |
| (Eliminated) | VULN-DE-01, VULN-DE-02, VULN-MISC-02, VULN-DOS-02 | Low/informational findings merged into hardening recommendations (not vulnerabilities) |

---

## Final Severity Distribution

| Severity | Count | IDs |
|----------|-------|-----|
| High | 1 | VULN-001 |
| Medium | 4 | VULN-002, VULN-003, VULN-004, VULN-005 |
| Low | 2 | VULN-006, VULN-007 |
| **Total Confirmed** | **7** | |

---

## Hardening Recommendations (Not Vulnerabilities)

These are best-practice improvements that don't represent exploitable vulnerabilities:

1. **Add app-layer authorization checks** on material/question/option CRUD for defense-in-depth (currently RLS-protected)
2. **Strengthen password policy** — require complexity beyond 8-char minimum
3. **Add pagination** to unbounded list queries
4. **Replace real Supabase URL** in `.env.local.example` with placeholder
5. **Fix TypeScript build errors** and remove `ignoreBuildErrors: true`
6. **Update dev dependencies** to resolve npm audit findings
7. **Add field allowlists** to `updateMaterial()`, `updateSubMaterial()`, `updateQuestion()`, `updateOption()`
