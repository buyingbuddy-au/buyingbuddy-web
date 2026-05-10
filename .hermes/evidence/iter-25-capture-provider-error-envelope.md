# Iteration 25 — Phase 2 — rego capture provider error envelope

- Iteration: 25
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T09:01:52+10:00
- Objective picked:
  > [NEXT] `src/app/api/rego/capture/route.ts:199-201` + `tests/rego-capture-route.test.mjs` — Add route-handler test named `rego capture provider failure returns stable error envelope`; mock the second Resend send to throw `new Error("boom secret/path")` and assert HTTP 502 or 500 uses a stable `status`, `error`, `userMessage`, `checkedAt`, and `retryable` contract without leaking `boom` or `secret/path`.

## Files changed

- src/app/api/rego/capture/route.ts
- tests/rego-capture-route.test.mjs
- .hermes/evidence/iter-25-capture-provider-error-envelope.md
- .hermes/LEARNED.md

## Why this matters

`/api/rego/capture` now has a stable public contract when the Resend provider fails after validation and rate-limit checks. Before this iteration, that provider exception fell through the route catch and returned a legacy `{ ok, error }` shape with no `status`, `userMessage`, `checkedAt`, or `retryable` fields. The new regression also proves the thrown provider text `boom secret/path` stays out of the client payload, while the server still logs the raw provider error for debugging.

## Test notes

- RED: `node --test --test-name-pattern "rego capture provider failure returns stable error envelope" tests/rego-capture-route.test.mjs` — FAIL as expected before the route change (`500 !== 502`) because the provider throw reached the legacy catch-all response.
- GREEN focused: `node --test --test-name-pattern "rego capture provider failure returns stable error envelope" tests/rego-capture-route.test.mjs` — PASS after wrapping the Resend send block and returning `provider_error` / `email_provider_failed` with HTTP 502 and `retryable: false`.
- Affected file check: `node --test tests/rego-capture-route.test.mjs` — PASS (10 tests).

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (34 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3234 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3234` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 10 minutes.

## Token usage estimate

Not available from this CLI run.
