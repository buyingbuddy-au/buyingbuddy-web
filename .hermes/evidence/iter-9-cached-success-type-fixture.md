# Iteration 9 — Phase 2 — cached success type fixture

- Iteration: 9
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T04:10:02+10:00
- Objective picked: `[NEXT] src/lib/qld-rego/types.ts + tests/qld-rego-types.test.mjs — Add a type fixture named cached success response is assignable that constructs a cached QldRegoCheckSuccess with cached: true and assigns it to QldRegoCheckResponse; if it fails, add cached?: boolean to the success contract. (added by iter 8)`

## Files changed

- tests/qld-rego-types.test.mjs
- tests/type-fixtures/qld-rego-cached-success.ts
- .hermes/evidence/iter-9-cached-success-type-fixture.md
- .hermes/LEARNED.md

## Why this matters

Iteration 1 documented the cached failure contract but left a verification gap around cached successful QLD rego responses. The success contract already includes `cached?: boolean`, so this iteration adds a type-only fixture that proves a cached `QldRegoCheckSuccess` can be used as a `QldRegoCheckResponse`. That keeps the process-local cache hit return type honest without touching runtime rego code.

## Test notes

- Added `tests/type-fixtures/qld-rego-cached-success.ts`, constructing a `QldRegoCheckSuccess` with `cached: true` and assigning it to `QldRegoCheckResponse`.
- Added `cached success response is assignable` in `tests/qld-rego-types.test.mjs` to run the fixture through the existing strict `tsc --noEmit` helper.
- Focused check attempted: `npm test -- --test-name-pattern "cached success response is assignable"` — PASS, but the npm script still executed all 17 subtests because the test-name flag is appended after `tests/*.test.mjs`.

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (17 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3218 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3218` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 11 minutes.

## Token usage estimate

Not available from this CLI run.
