# Iteration 5 — Phase 2 — rego check body/state parser tests

- Iteration: 5
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T02:51:20+10:00
- Objective picked: `[NEXT] tests/rego-check-route.test.mjs — Add route-handler tests named rego check rejects non-object JSON and rego check rejects non-string state; assert HTTP 400 input_error and zero QLD lookup calls. (added by iter 4)`

## Files changed

- tests/rego-check-route.test.mjs
- .hermes/evidence/iter-5-rego-body-state-tests.md
- .hermes/LEARNED.md

## Why this matters

The `/api/rego/check` parser already had branches for valid JSON with the wrong top-level shape and for a non-string `state`, but those branches were not locked by regression tests. These tests prove both bad inputs return the stable HTTP 400 `input_error` envelope and do not spend a QLD lookup call. That keeps malformed client requests cheap, predictable, and safely inside the route-handler contract.

## Test notes

- Change type: test-only regression coverage for parser branches added in the previous iteration; no production route code changed.
- Added `rego check rejects non-object JSON` with a valid JSON string body and asserted `error: "invalid_body"`, the stable user message, `retryable: false`, and zero mocked QLD lookup calls.
- Added `rego check rejects non-string state` with `{ rego: "123ABC", state: 123 }` and asserted `error: "invalid_state"`, the QLD-only user message, `retryable: false`, and zero mocked QLD lookup calls.
- Specific verification: `npm test -- --test-name-pattern "rego check rejects non-object JSON|rego check rejects non-string state"` — PASS. The current npm script still ran all 11 subtests; both new named subtests passed.

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (11 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3214 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3214` and confirming `/rego-check` returned HTTP 200; five smoke requests completed with exit code 0.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 9 minutes.

## Token usage estimate

Not available from this CLI run.
