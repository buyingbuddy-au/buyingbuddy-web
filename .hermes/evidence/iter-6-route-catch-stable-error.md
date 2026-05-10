# Iteration 6 — Phase 2 — rego check route catch stable error

- Iteration: 6
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T03:17:13+10:00
- Objective picked: `[NEXT] src/app/api/rego/check/route.ts:123-135 + tests/rego-check-route.test.mjs — Stop returning the raw error.message to clients. Replace with stable code route_unhandled, log the raw error server-side via console.error("[rego-check] unhandled", error), and switch the response to HTTP 502 with retryable: false to prevent retry-amplification on upstream failures. Add tests named rego check route catch returns stable error code and rego check route catch returns 502 not 500. (added by Claude review, audit NEXT line 51 was already queued — promote it above the iter-5 spawned NEXT)`

## Files changed

- src/app/api/rego/check/route.ts
- tests/rego-check-route.test.mjs
- .hermes/evidence/iter-6-route-catch-stable-error.md
- .hermes/LEARNED.md

## Why this matters

The route catch-all was exposing thrown exception text directly in the public `error` field, which could leak internal paths or provider failure details to anyone posting to `/api/rego/check`. It also returned HTTP 500 with `retryable: true`, encouraging polite clients to retry exactly when the route has already hit an unexpected failure. This iteration keeps the raw exception server-side via `console.error`, returns a stable `route_unhandled` code, and marks the response non-retryable with HTTP 502.

## TDD notes

- RED: added `rego check route catch returns stable error code` and `rego check route catch returns 502 not 500`; `npm test -- --test-name-pattern "rego check route catch"` failed as expected with `actual: 'boom secret/path'` vs `route_unhandled` and `500 !== 502`.
- GREEN: updated `src/app/api/rego/check/route.ts` catch block to log `console.error("[rego-check] unhandled", error)`, return `error: "route_unhandled"`, `retryable: false`, and HTTP 502. The same focused test command then passed.

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (13 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3215 node scripts/rego-api-smoke.mjs` — PASS after starting local server with `./node_modules/.bin/next start -p 3215` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 13 minutes.

## Token usage estimate

Not available from this CLI run.
