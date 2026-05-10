# Iteration 20 — Phase 2 — rego capture non-string rego

- Iteration: 20
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T07:41:49+10:00
- Objective picked:
  > [NEXT] `src/app/api/rego/capture/route.ts:116` + `tests/rego-capture-route.test.mjs` — Add route-handler test named `rego capture rejects non-string rego`; post `{ rego: 123, email: "buyer@example.com" }`, assert HTTP 400 `input_error`/`invalid_rego` and zero email sends before changing `RegoCaptureRequest.rego` to `unknown` and guarding `validateQldRego()` input. (added by iter 19)

## Files changed

- src/app/api/rego/capture/route.ts
- tests/rego-capture-route.test.mjs
- .hermes/evidence/iter-20-capture-non-string-rego.md
- .hermes/LEARNED.md

## Why this matters

The capture route already handled malformed JSON, non-object bodies, and non-string email fields, but `rego` was still type-trusted before calling `validateQldRego()`. A numeric `rego` caused `normaliseQldRego()` to throw `TypeError: input.toUpperCase is not a function`, returning a noisy HTTP 500 for caller-controlled bad input. This iteration keeps that failure in the stable client-error lane with `status: "input_error"`, `error: "invalid_rego"`, `checkedAt`, `retryable: false`, and zero email sends.

## Test notes

- RED: `node --test --test-name-pattern "rego capture rejects non-string rego" tests/rego-capture-route.test.mjs` — FAIL as expected before the route change (`500 !== 400`) and logged `TypeError: input.toUpperCase is not a function` from the catch-all branch.
- GREEN focused: `node --test --test-name-pattern "rego capture rejects non-string rego" tests/rego-capture-route.test.mjs` — PASS after widening `RegoCaptureRequest.rego` to `unknown` and guarding non-string values before validation.
- Affected file check: `node --test tests/rego-capture-route.test.mjs` — PASS (5 tests).

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (29 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3229 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3229` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 12 minutes.

## Token usage estimate

Not available from this CLI run.
