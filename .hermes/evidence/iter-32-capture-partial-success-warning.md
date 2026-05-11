# Iteration 32 — Phase 2 — rego capture partial-success warning

- Iteration: 32
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T10:58:30+10:00
- Objective picked:
  > [NEXT] `src/app/api/rego/capture/route.ts:211-225` + `tests/rego-capture-route.test.mjs` — Add route-handler test named `rego capture logs partial success when buyer send fails`; mock the second Resend send to throw, capture `console.warn`, assert exactly one tagged warning before returning the provider-error envelope, then track notification-sent state and warn before `providerErrorResponse()`.

## Files changed

- src/app/api/rego/capture/route.ts
- tests/rego-capture-route.test.mjs
- .hermes/evidence/iter-32-capture-partial-success-warning.md
- .hermes/LEARNED.md

## Why this matters

Iteration 26 intentionally sends the internal notification before the buyer follow-up email, which is safer than emailing the buyer first. That still leaves a partial-success state when Jordan receives the lead but the buyer email fails and the API returns a provider error. This change logs a tagged server-side warning for that exact state, making it searchable during incident review without leaking provider errors in the public response.

## Test notes

- RED: `node --test --test-name-pattern "rego capture logs partial success when buyer send fails" tests/rego-capture-route.test.mjs` — FAIL as expected before the route change (`warnCalls.length` was `0`, expected `1`).
- GREEN focused + affected file check: `node --test --test-name-pattern "rego capture logs partial success when buyer send fails" tests/rego-capture-route.test.mjs && node --test tests/rego-capture-route.test.mjs` — PASS; focused test passed and the full rego-capture route file passed 14 tests. The pre-existing provider-failure test now stubs `console.warn` to keep the affected-file run clean while the new test owns the warning assertion.

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (40 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3241 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3241` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 11 minutes (10:47–10:58 Australia/Brisbane local).

## Token usage estimate

Not available from this CLI run.
