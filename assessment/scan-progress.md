# Scan Progress

| # | Scanner | Status | Findings | Notes |
|---|---------|--------|----------|-------|
| 3a | vuln-injection | DONE (1 finding) | 1 Low | No SQL/XSS/command injection; minor PostgREST filter concern |
| 3b | vuln-access-control | DONE (8 findings) | 1 High, 3 Medium, 4 Low | RLS mitigates most app-layer gaps; quiz answer exposure is real |
| 3c | vuln-data-exposure | DONE (2 findings) | 2 Low | No secrets in code; error responses properly generic |
| 3d | vuln-ssrf | SKIPPED (no user-controlled URL fetching) | — | App uses Stripe/Supabase SDKs, no arbitrary URL fetch |
| 3e | vuln-deserialization | SKIPPED (no XML/SOAP, no custom deserialization) | — | Only JSON via Next.js built-in parsing |
| 3f | vuln-misconfig | DONE (2 findings) | 1 Medium, 1 Low | CSP unsafe-inline/eval; TS build errors ignored |
| 3g | vuln-logic | DONE (5 findings) | 2 Medium, 3 Low | Race condition on quiz attempts; rate limit ineffective in serverless |
| 3h | vuln-authn-session | DONE (3 findings) | 1 Medium, 2 Low | No rate limit on password reset; weak password policy |
| 3i | vuln-crypto | SKIPPED (no custom crypto) | — | Auth handled by Supabase, payments by Stripe |
| 3j | vuln-file-path | SKIPPED (no file upload endpoints in codebase) | — | Media uploads go directly to Cloudinary |
| 3k | vuln-client-side | DONE (0 findings) | — | No open redirect, clickjacking, or DOM XSS |
| 3l | vuln-dependency | DONE (1 finding) | 1 Medium | 12 CVEs in dev/indirect deps; none in production |
| 3m | vuln-api | DONE (2 findings) | 2 Low | Mass assignment on material/quest updates (RLS mitigates) |
| 3n-i | vuln-web3-reentrancy | SKIPPED (no smart contract code) | — | |
| 3n-ii | vuln-web3-arithmetic | SKIPPED (no smart contract code) | — | |
| 3n-iii | vuln-web3-access | SKIPPED (no smart contract code) | — | |
| 3n-iv | vuln-web3-mev | SKIPPED (no smart contract code) | — | |
| 3n-v | vuln-web3-token | SKIPPED (no smart contract code) | — | |
| 3o | vuln-dos | DONE (1 finding) | 1 Low | No ReDoS; unbounded queries minor concern |
| 3p | vuln-memory | SKIPPED (no C/C++/Rust/native code) | — | |
| 3q | vuln-web3-defi | SKIPPED (no smart contract code) | — | |
| 3r | vuln-web3-nft | SKIPPED (no smart contract code) | — | |
| 3s | vuln-web3-evm | SKIPPED (no smart contract code) | — | |
