# Iteration 18 — Phase 2 — rego capture non-object JSON

- Iteration: 18
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T07:00:20+10:00
- Objective picked:
  > [NEXT] `src/app/api/rego/capture/route.ts:54-67` + `tests/rego-capture-route.test.mjs` — Add route-handler test named `rego capture rejects non-object JSON`; post `null` or an array body, assert HTTP 400 `input_error`/`invalid_body` and zero email sends before adding an object guard ahead of `body.email` access. (added by iter 17)

## Files changed

- src/app/api/rego/capture/route.ts
- tests/rego-capture-route.test.mjs
- .hermes/evidence/iter-18-capture-non-object-json.md
- .hermes/LEARNED.md

## Why this matters

A parsed JSON body can still be `null` or an array, so malformed-shape requests were bypassing the iter-17 JSON parser and falling into the catch-all 500 branch when the route tried to read `body.email`. This change keeps non-object bodies in the client-error lane with the stable `input_error` envelope, including `checkedAt` and `retryable: false`. The regression also asserts zero email sends so bad-shape capture requests cannot trigger buyer or internal notification emails.

## Test notes

- RED: `node --test --test-name-pattern "rego capture rejects non-object JSON" tests/rego-capture-route.test.mjs` — FAIL as expected before the route change (`500 !== 400`) and logged `TypeError: Cannot read properties of null (reading 'email')` from the catch-all branch.
- GREEN focused: `node --test --test-name-pattern "rego capture rejects non-object JSON" tests/rego-capture-route.test.mjs` — PASS after adding `isObjectBody()` and returning `invalid_body` from `parseRegoCaptureRequest()`.
- Affected file check: `node --test tests/rego-capture-route.test.mjs` — PASS (3 tests).

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (27 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3227 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3227` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 11 minutes.

## Token usage estimate

Not available from this CLI run.
