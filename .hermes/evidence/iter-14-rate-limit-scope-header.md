# Iteration 14 — Phase 2 — rego busy rate-limit scope header

- Iteration: 14
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T05:40:15+10:00
- Objective picked:
  > [NEXT] `src/app/api/rego/check/route.ts:111-122` + `tests/rego-check-route.test.mjs` — Add route-handler test named `rego check busy response sets rate-limit scope header`; mock `runQldOfficialRegoCheck()` to return a busy failure with `rateLimitScope: "instance"` and assert HTTP 429 plus `x-rego-rate-limit-scope: instance` before adding the route header mapping. (added by iter 13)

## Files changed

- src/app/api/rego/check/route.ts
- tests/rego-check-route.test.mjs
- .hermes/evidence/iter-14-rate-limit-scope-header.md
- .hermes/LEARNED.md

## Why this matters

Iteration 13 made the QLD rego busy response disclose that its rate limit is process-local/per-instance, but the public API route still only exposed that as JSON body metadata. Adding the `x-rego-rate-limit-scope: instance` header lets clients, smoke checks, and observability read the rate-limit scope without parsing the response body. The regression also keeps the important behaviour lock that a valid request reaches the mocked lookup once and maps busy failures to HTTP 429.

## Test notes

- RED: `node --test --test-name-pattern "rego check busy response sets rate-limit scope header" tests/rego-check-route.test.mjs` — FAIL as expected before the route change (`response.headers.get("x-rego-rate-limit-scope")` was `null`, expected `"instance"`).
- GREEN focused: `node --test --test-name-pattern "rego check busy response sets rate-limit scope header" tests/rego-check-route.test.mjs` — PASS after adding the conditional header mapping for busy failures.
- Affected file check: `node --test tests/rego-check-route.test.mjs` — PASS (9 tests).

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (23 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3223 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3223` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 11 minutes.

## Token usage estimate

Not available from this CLI run.
