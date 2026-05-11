# Iteration 31 — Phase 2 — rego check unknown-status HTTP fallback

- Iteration: 31
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T10:41:16+10:00
- Objective picked:
  > [NEXT] `src/app/api/rego/check/route.ts:130` — **Add `?? 502` runtime fallback to the `STATUS_TO_HTTP[result.status]` lookup.** Replace `const statusCode = result.ok ? 200 : STATUS_TO_HTTP[result.status];` with `const statusCode = result.ok ? 200 : (STATUS_TO_HTTP[result.status] ?? 502);`. The `satisfies` clause catches missing entries at compile time; the `??` catches an `as`-cast or JSON-parsed status that bypasses typecheck at runtime. Add a test named `rego check unknown status falls back to 502`; mock `runQldOfficialRegoCheck()` to return `{ ok: false, status: "future_unknown" as any, ... }` and assert HTTP 502. Belt-and-braces with the type system — same iter shape as iter 30 (one test, one route line) but addresses a real defensive gap rather than re-covering a typecheck-enforced cell. (added by Claude review)

## Files changed

- src/app/api/rego/check/route.ts
- tests/rego-check-route.test.mjs
- .hermes/evidence/iter-31-unknown-status-fallback.md
- .hermes/LEARNED.md

## Why this matters

`STATUS_TO_HTTP` is exhaustive at TypeScript compile time, but runtime data can still bypass the union through a cast, mocked dependency, or future parser drift. Before this change, an unknown failure status produced `status: undefined` for `NextResponse.json()`, which silently degraded to HTTP 200 while carrying an error payload. The route now defaults unknown failure statuses to HTTP 502, preserving the public success/error boundary even if the internal failure union is bypassed.

## Test notes

- RED: `node --test --test-name-pattern "rego check unknown status falls back to 502" tests/rego-check-route.test.mjs` — FAIL as expected before the route change (`200 !== 502`) because `STATUS_TO_HTTP["future_unknown"]` returned `undefined` and Next defaulted the response to HTTP 200.
- GREEN focused + affected file check: `node --test --test-name-pattern "rego check unknown status falls back to 502" tests/rego-check-route.test.mjs && node --test tests/rego-check-route.test.mjs` — PASS; focused test passed and the full rego-check route file passed 12 tests.

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (39 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3240 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3240` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 8 minutes (10:33–10:41 Australia/Brisbane local).

## Token usage estimate

Not available from this CLI run.
