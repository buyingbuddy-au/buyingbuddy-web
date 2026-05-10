# Iteration 23 — Phase 2 — rego capture non-string reason

- Iteration: 23
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T08:30:39+10:00
- Objective picked:
  > [NEXT] `src/app/api/rego/capture/route.ts:13` + `tests/rego-capture-route.test.mjs` — Add route-handler test named `rego capture rejects non-string reason`; post `{ rego: "123ABC", email: "buyer@example.com", reason: 42 }`, assert HTTP 400 `input_error`/`invalid_reason`, `checkedAt`, `retryable: false`, and zero email sends before changing `RegoCaptureRequest.reason` to `unknown` and adding a reason type guard.

## Files changed

- src/app/api/rego/capture/route.ts
- tests/rego-capture-route.test.mjs
- .hermes/evidence/iter-23-capture-non-string-reason.md
- .hermes/LEARNED.md

## Why this matters

`/api/rego/capture` had runtime guards for malformed JSON, non-object bodies, email, and rego, but `reason` remained type-trusted as a string. A numeric reason could pass through to the success path and be coerced into the notification/log surface instead of being treated as caller-fixable invalid input. This iteration closes that last unguarded capture request field and proves rejected reason values do not trigger Resend side effects.

## Test notes

- RED: `node --test --test-name-pattern "rego capture rejects non-string reason" tests/rego-capture-route.test.mjs` — FAIL as expected before the route change (`200 !== 400`) because numeric `reason` was accepted and reached the success path when the mocked Resend API key was set.
- GREEN focused: `node --test --test-name-pattern "rego capture rejects non-string reason" tests/rego-capture-route.test.mjs` — PASS after widening `RegoCaptureRequest.reason` to `unknown`, adding an `invalid_reason` guard, and reusing the narrowed `reason` value for email/log output.
- Affected file check: `node --test tests/rego-capture-route.test.mjs` — PASS (8 tests).

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (32 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3232 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3232` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 10 minutes.

## Token usage estimate

Not available from this CLI run.
