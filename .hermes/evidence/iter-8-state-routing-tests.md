# Iteration 8 — Phase 2 — rego check state routing tests

- Iteration: 8
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T03:53:00+10:00
- Objective picked: `[NEXT] tests/rego-check-route.test.mjs — Add route-handler tests named rego check defaults missing state to QLD and rego check rejects unsupported state before lookup; assert missing state reaches the mocked QLD lookup once and state NSW returns HTTP 400 not_qld with zero lookup calls. (carried forward by iter 7)`

## Files changed

- tests/rego-check-route.test.mjs
- .hermes/evidence/iter-8-state-routing-tests.md
- .hermes/LEARNED.md

## Why this matters

The `/api/rego/check` route supports a QLD-only beta, so state handling needs to be cheap and deterministic before any external QLD lookup is spent. These tests lock the two important routing branches: omitted `state` continues down the QLD lookup path, while unsupported `NSW` input returns the public `not_qld` envelope before lookup. This is test-only hardening of existing behaviour and avoids expanding the production route surface during the loop.

## Test notes

- Added `rego check defaults missing state to QLD`; it posts `{ rego: "123ABC" }`, expects HTTP 200/found from the mocked lookup, and asserts exactly one lookup call.
- Added `rego check rejects unsupported state before lookup`; it posts `{ rego: "123ABC", state: "NSW" }`, expects HTTP 400 `not_qld` / `qld_only`, and asserts zero lookup calls.
- Focused verification command: `npm test -- --test-name-pattern "rego check defaults missing state to QLD|rego check rejects unsupported state before lookup"` — PASS. The current npm script still executed all 16 subtests; both new named subtests passed.

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (16 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3217 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3217` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 10 minutes.

## Token usage estimate

Not available from this CLI run.
