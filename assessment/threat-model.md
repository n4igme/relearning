# Threat Model — RE-learning Platform

**Date:** 2026-05-20  
**Cycle:** 5 (fully patched)  
**Scope:** Post-remediation residual risk assessment  
**Overall Posture:** Significantly hardened. No Critical/High vulnerabilities remain. Residual issues are Medium/Low severity, mostly information disclosure and defense-in-depth gaps.

---

## 1. Threat Actors

| Actor | Motivation | Capability | Access Level |
|-------|-----------|------------|--------------|
| Authenticated Student | Curiosity, grade manipulation, free access to paid content | Low-Medium; can call any server action | Authenticated, student role |
| Malicious Mentor | Data harvesting, reputation manipulation | Medium; owns courses, can craft quiz content | Authenticated, mentor role |
| External Attacker | Credential theft, data scraping, platform disruption | Medium-High; no initial auth | Unauthenticated |
| Compromised Admin | Full platform takeover | High; bypasses all app-layer controls | Admin role (no MFA) |
| Automated Bot | Credential stuffing, scraping user data | Medium; can spoof headers | Unauthenticated or stolen session |

---

## 2. STRIDE Analysis

### 2.1 Authentication System (Supabase Auth + Middleware)

| Threat | Category | Residual Risk | Notes |
|--------|----------|---------------|-------|
| Admin account takeover via credential stuffing | Spoofing | **Medium** | No MFA for admin accounts; rate limit keyed on email (not IP) for login, but checkout uses spoofable `x-forwarded-for` |
| Session hijacking via XSS | Spoofing | **Low-Medium** | CSP allows `unsafe-inline` for scripts and styles, expanding XSS surface |
| Rate limit bypass on checkout | Tampering | **Medium** | `x-forwarded-for` header is attacker-controlled; can rotate IPs to bypass 5/min limit |

### 2.2 Profiles & User Data

| Threat | Category | Residual Risk | Notes |
|--------|----------|---------------|-------|
| Mass user enumeration | Information Disclosure | **Medium** | `profiles` SELECT USING(true) exposes all emails, full names, roles to any authenticated user |
| Targeted phishing using harvested data | Information Disclosure | **Medium** | Attacker can identify admins by role field, then target them |

### 2.3 Course Content & Enrollment

| Threat | Category | Residual Risk | Notes |
|--------|----------|---------------|-------|
| Certificate retention after refund | Repudiation | **Low** | Certificates persist in DB after enrollment deletion; can be used as false credential |
| Defense-in-depth gap on material mutations | Elevation of Privilege | **Low** | `updateMaterial`/`createSubMaterial` rely solely on RLS without app-layer ownership checks |

### 2.4 Gamification & Quests

| Threat | Category | Residual Risk | Notes |
|--------|----------|---------------|-------|
| Silent RLS failures in badge/skill award | Denial of Service | **Low** | `checkAndAwardBadges` runs in user context but INSERT policies may require admin; failures may be silent |
| Leaderboard manipulation via timing | Tampering | **Low** | Streak system trusts client-reported completion; min 30s enforced but no server-side session timing |

### 2.5 API & Error Handling

| Threat | Category | Residual Risk | Notes |
|--------|----------|---------------|-------|
| Internal state leakage via raw errors | Information Disclosure | **Medium** | 47 instances of `return { success: false, error }` pass raw caught error objects to client (may include stack traces, DB schema details) |
| TypeScript build errors ignored | Tampering | **Low** | `ignoreBuildErrors: true` may allow type-unsafe code paths into production |

---

## 3. Feature Threat Analysis

### 3.1 Profile Data Exposure

| Abuse Case | Impact | Likelihood |
|------------|--------|------------|
| Authenticated user queries all profiles to harvest admin emails | Targeted phishing against admins (no MFA) | High |
| Competitor scrapes full user list for recruitment/spam | Privacy violation, GDPR exposure | Medium |
| Attacker maps role distribution to identify high-value targets | Reconnaissance for privilege escalation | Medium |

### 3.2 Admin Account (No MFA)

| Abuse Case | Impact | Likelihood |
|------------|--------|------------|
| Credential stuffing against known admin email (from profiles) | Full platform compromise | Medium |
| Phishing admin using harvested email + social engineering | Account takeover → approve malicious courses, exfiltrate data | Medium |

### 3.3 Rate Limit IP Spoofing

| Abuse Case | Impact | Likelihood |
|------------|--------|------------|
| Attacker rotates `x-forwarded-for` values to bypass checkout rate limit | Unlimited checkout session creation (Stripe API abuse, cost amplification) | Medium |
| Bot farm uses spoofed IPs to brute-force checkout flow | Resource exhaustion on Stripe integration | Low |

### 3.4 CSP unsafe-inline

| Abuse Case | Impact | Likelihood |
|------------|--------|------------|
| Stored XSS via course description/title (if sanitization missed) | Session theft, admin impersonation | Low (Zod validation + React escaping mitigate) |
| DOM-based XSS via URL parameters rendered inline | Cookie exfiltration | Low |

### 3.5 Certificate Persistence After Refund

| Abuse Case | Impact | Likelihood |
|------------|--------|------------|
| Student completes course, gets certificate, requests refund | Retains verifiable credential without payment | Medium |
| Systematic abuse: complete → refund → repeat across courses | Free credential farming | Low |

### 3.6 Raw Error Object Exposure

| Abuse Case | Impact | Likelihood |
|------------|--------|------------|
| Trigger DB errors to reveal table/column names | Schema reconnaissance for further attacks | Medium |
| Trigger Supabase errors to reveal connection details | Infrastructure fingerprinting | Low |

---

## 4. Attack Trees

### Goal 1: Compromise Admin Account

```
Compromise Admin Account
├── 1. Identify admin email [EASY — profiles SELECT USING(true)]
├── 2. Credential attack
│   ├── 2a. Credential stuffing (rate limited to 5/min per email) [MEDIUM]
│   ├── 2b. Phishing (no MFA to block stolen creds) [MEDIUM]
│   └── 2c. Password reset abuse (rate limited 3/hr) [LOW]
└── 3. Session hijack via XSS
    ├── 3a. Find injection point (CSP unsafe-inline allows inline scripts) [LOW]
    └── 3b. Steal httpOnly cookie [BLOCKED — Supabase uses httpOnly cookies]
```

### Goal 2: Access Paid Content Without Payment

```
Free Access to Paid Content
├── 1. Direct content access [BLOCKED — RLS restricts to enrolled]
├── 2. Refund after completion [WORKS — certificate persists]
├── 3. Bypass enrollment check
│   ├── 3a. enrollInCourse without payment [BLOCKED — payment check]
│   └── 3b. enrollInCourseInternal [BLOCKED — admin gate]
└── 4. Manipulate enrollment_requests
    └── 4a. Approve own request [BLOCKED — admin-only]
```

### Goal 3: Exfiltrate User Data

```
Harvest User Data
├── 1. Query profiles table (authenticated) [WORKS — all emails/names/roles exposed]
├── 2. Trigger verbose errors for schema info [POSSIBLE — raw error objects returned]
└── 3. Access payment records [BLOCKED — RLS restricts to own + admin]
```

---

## 5. Priority Targets for Scanning

These are the remaining areas worth scanning in subsequent cycles:

| # | Target | Category | Why |
|---|--------|----------|-----|
| 1 | `profiles` RLS policy (SELECT USING true) | Data Exposure | All user PII readable by any authenticated user |
| 2 | Checkout route `x-forwarded-for` IP extraction | Rate Limit Bypass | Attacker-controlled header used as rate limit key |
| 3 | Raw error returns in server actions (47 instances) | Information Disclosure | Caught exceptions passed directly to client |
| 4 | CSP `unsafe-inline` for script-src and style-src | Client-Side | Weakens XSS protections |
| 5 | Admin accounts — no MFA enforcement | Authentication | Single-factor auth on highest-privilege role |
| 6 | Certificate lifecycle after refund | Business Logic | No revocation on enrollment deletion |
| 7 | `updateMaterial` / `createSubMaterial` — no app-layer ownership check | Access Control (Defense-in-Depth) | Relies solely on RLS; if RLS misconfigured, no fallback |
| 8 | `checkAndAwardBadges` RLS context | Logic | May silently fail if INSERT policies require admin |
| 9 | `ignoreBuildErrors: true` in next.config.js | Code Quality | Type-unsafe code may reach production |
| 10 | Image domain allowlist (5+ external domains) | SSRF/Content Injection | Broad img-src allows content from multiple origins |

---

## 6. Trust Boundaries

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INTERNET (Untrusted)                          │
│  [Browser] ──── [CDN/Proxy] ──── x-forwarded-for (SPOOFABLE)       │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ TLS
┌──────────────────────────────▼──────────────────────────────────────┐
│                    BOUNDARY 1: Edge/Middleware                        │
│  • Session validation (getUser)                                      │
│  • Route protection (role checks)                                    │
│  • Deactivated user blocking                                         │
│  • Security headers (CSP with unsafe-inline)                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                    BOUNDARY 2: Application Layer                      │
│  • Server Actions (ownership checks, Zod validation)                 │
│  • API Routes (CSRF check, rate limiting)                            │
│  • Error handling (RAW ERRORS LEAK across this boundary)             │
│  • Defense-in-depth GAPS: some mutations skip ownership checks       │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                    BOUNDARY 3: Database (RLS)                         │
│  • Row Level Security on all tables                                  │
│  • profiles: SELECT open to all authenticated (OVER-PERMISSIVE)      │
│  • DB triggers: role escalation prevention, max attempts             │
│  • Admin client: used for scoring, enrollment, payments              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                    BOUNDARY 4: External Services                      │
│  • Stripe (webhook signature verified)                               │
│  • Cloudinary (media hosting — URLs stored in DB)                    │
│  • Supabase Auth (password hashing, OAuth)                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Assumptions & Gaps

### Assumptions

| # | Assumption | Risk if Wrong |
|---|-----------|---------------|
| 1 | Supabase Auth cookies are httpOnly and secure | XSS could steal sessions |
| 2 | React's JSX escaping prevents stored XSS in course content | unsafe-inline CSP makes XSS exploitable if escaping fails |
| 3 | RLS policies are correctly configured for all tables | App-layer gaps (updateMaterial, createSubMaterial) become exploitable |
| 4 | Stripe webhook signatures are validated correctly | Payment bypass / fake enrollment |
| 5 | Deployment sits behind a trusted reverse proxy that sets x-forwarded-for correctly | Rate limit on checkout is bypassable if not |
| 6 | `checkAndAwardBadges` INSERT operations succeed despite user-context RLS | Gamification may silently break |

### Gaps (Cannot Verify Without Runtime Testing)

| # | Gap | Impact |
|---|-----|--------|
| 1 | Whether `profiles` SELECT policy is intentional or oversight | May be "by design" for leaderboard display, but exposes emails |
| 2 | Whether badge/skill INSERT policies actually allow user-context writes | Could cause silent gamification failures |
| 3 | Whether `quest_attempts` DELETE policy exists for rollback | Race condition rollback may fail silently |
| 4 | Actual error object contents returned to client | Need runtime testing to confirm severity of info leak |
| 5 | Whether reverse proxy strips/overwrites x-forwarded-for | Deployment-dependent; cannot assess from code alone |
| 6 | Certificate verification endpoint behavior after enrollment deletion | Need to test if verification URL still resolves |

---

## Summary Assessment

The platform is **well-hardened** after 5 cycles. All Critical and High severity issues have been remediated with defense-in-depth (DB triggers, admin gates, persistent rate limiting, fails-closed patterns).

**Remaining risk is Medium/Low**, concentrated in:
1. **Information disclosure** — profiles table over-exposure + raw error leakage
2. **Authentication depth** — no MFA on admin, combined with easy admin identification
3. **Header trust** — x-forwarded-for used for rate limiting without proxy validation
4. **CSP weakness** — unsafe-inline reduces XSS defense effectiveness
5. **Business logic edge case** — certificates survive refunds

None of these individually constitute a Critical vulnerability, but the combination of (1) + (2) creates a viable attack chain: enumerate admin emails → credential stuff/phish → full compromise with no MFA barrier.
