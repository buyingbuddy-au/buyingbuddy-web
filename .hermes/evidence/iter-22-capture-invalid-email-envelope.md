# Iteration 22 — Phase 2 — rego capture invalid email envelope

- Iteration: 22
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T08:15:44+10:00
- Objective picked:
  > [NEXT] `src/app/api/rego/capture/route.ts:127-129` + `tests/rego-capture-route.test.mjs` — Add route-handler test named `rego capture invalid email returns stable input envelope`; post `{ rego: "123ABC", email: "not-an-email" }`, assert HTTP 400 `input_error`/`invalid_email`, `checkedAt`, `retryable: false`, and zero email sends before routing `validEmail()` failures through `inputErrorResponse()` instead of the legacy `{ ok: false, error }` body.

## Files changed

- src/app/api/rego/capture/route.ts
- tests/rego-capture-route.test.mjs
- .hermes/evidence/iter-22-capture-invalid-email-envelope.md
- .hermes/LEARNED.md

## Why this matters

`/api/rego/capture` had one remaining bad-email branch that returned the legacy `{ ok: false, error }` shape while adjacent parse/type/rego validation failures returned the stable `input_error` envelope. That meant client code could not reliably read `status`, `userMessage`, `checkedAt`, or `retryable` for the same class of caller-fixable input errors. This iteration routes invalid email-string failures through the existing `inputErrorResponse()` helper and keeps the no-email-side-effect assertion in place.

## Test notes

- RED: `node --test --test-name-pattern "rego capture invalid email returns stable input envelope" tests/rego-capture-route.test.mjs` — FAIL as expected before the route change (`undefined !== "input_error"`) because the legacy invalid-email branch had no `status` field.
- GREEN focused: `node --test --test-name-pattern "rego capture invalid email returns stable input envelope" tests/rego-capture-route.test.mjs` — PASS after replacing the legacy `NextResponse.json({ ok: false, error })` branch with `inputErrorResponse("invalid_email", "Enter a valid email address.")`.
- Affected file check: `node --test tests/rego-capture-route.test.mjs` — PASS (7 tests).

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (31 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3231 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3231` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 8 minutes.

## Token usage estimate

Not available from this CLI run.
