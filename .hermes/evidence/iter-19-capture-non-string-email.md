# Iteration 19 — Phase 2 — rego capture non-string email

- Iteration: 19
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T07:22:35+10:00
- Objective picked:
  > [NEXT] `src/app/api/rego/capture/route.ts:98-107` + `tests/rego-capture-route.test.mjs` — Add route-handler test named `rego capture rejects non-string email`; post `{ rego: "123ABC", email: 123 }`, assert HTTP 400 `input_error`/`invalid_email` and zero email sends before replacing `(body.email ?? "").trim()` with a string guard.

## Files changed

- src/app/api/rego/capture/route.ts
- tests/rego-capture-route.test.mjs
- .hermes/evidence/iter-19-capture-non-string-email.md
- .hermes/LEARNED.md

## Why this matters

A parsed JSON object can still carry non-string fields, and the capture route previously trusted `email` enough to call `.trim()` on it. A numeric email produced a catch-all HTTP 500 and logged a `TypeError`, even though the caller sent invalid input. This iteration keeps that request in the stable client-error lane with `status: "input_error"`, `error: "invalid_email"`, `checkedAt`, `retryable: false`, and zero email sends.

## Test notes

- RED: `node --test --test-name-pattern "rego capture rejects non-string email" tests/rego-capture-route.test.mjs` — FAIL as expected before the route change (`500 !== 400`) and logged `TypeError: (body.email ?? "").trim is not a function` from the catch-all branch.
- GREEN focused: `node --test --test-name-pattern "rego capture rejects non-string email" tests/rego-capture-route.test.mjs` — PASS after widening the parsed `email` field to `unknown` and guarding non-string values before trimming.
- Affected file check: `node --test tests/rego-capture-route.test.mjs` — PASS (4 tests).

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (28 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3228 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3228` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 15 minutes.

## Token usage estimate

Not available from this CLI run.
