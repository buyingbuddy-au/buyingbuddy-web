# Iteration 13 — Phase 2 — rego busy rate-limit scope metadata

- Iteration: 13
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T05:21:01+10:00
- Objective picked:
  > [NEXT] `src/lib/qld-rego/official.ts:189-195` + `tests/qld-rego-official-cache.test.mjs` — Add test named `busy response declares per-instance rate limit scope`; force `worker_busy` or `hourly_limit` from `runQldOfficialRegoCheck()` and assert the failure response exposes a stable metadata field such as `rateLimitScope: "instance"` before adding route headers. (added by iter 12)

## Files changed

- src/lib/qld-rego/official.ts
- src/lib/qld-rego/types.ts
- tests/qld-rego-official-cache.test.mjs
- .hermes/evidence/iter-13-rate-limit-scope.md
- .hermes/LEARNED.md

## Why this matters

The QLD rego limiter is process-local, so a busy response needs to say the limit scope is per instance rather than implying a global quota. This change makes that operational truth explicit in the typed failure contract and in the two busy branches (`worker_busy` and `hourly_limit`). The new regression forces `hourly_limit` with `REGO_CHECK_MAX_PER_HOUR=0`, proves no QLD fetch is attempted, and asserts `rateLimitScope: "instance"` is present for clients or later route-header mapping.

## Test notes

- RED: `node --test --test-name-pattern "busy response declares per-instance rate limit scope" tests/qld-rego-official-cache.test.mjs` — FAIL as expected before the production change (`undefined !== "instance"`).
- GREEN focused: `node --test --test-name-pattern "busy response declares per-instance rate limit scope" tests/qld-rego-official-cache.test.mjs` — PASS after adding `rateLimitScope: "instance"` to busy failures.
- Affected file check: `node --test tests/qld-rego-official-cache.test.mjs` — PASS (5 tests).

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (22 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3222 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3222` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 12 minutes.

## Token usage estimate

Not available from this CLI run.
