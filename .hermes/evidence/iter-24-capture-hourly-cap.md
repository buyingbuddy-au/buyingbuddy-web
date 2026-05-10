# Iteration 24 — Phase 2 — rego capture hourly cap

- Iteration: 24
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T08:46:18+10:00
- Objective picked:
  > [NEXT] `src/app/api/rego/capture/route.ts` + `tests/rego-capture-route.test.mjs` — Add route-handler test named `rego capture enforces hourly cap`; with `RESEND_API_KEY=unit-test-api-key`, post the same valid capture request repeatedly and assert the over-limit request returns HTTP 429 with `x-rego-rate-limit-scope: instance` and sends zero additional emails before adding a simple per-instance capture limiter.

## Files changed

- src/app/api/rego/capture/route.ts
- tests/rego-capture-route.test.mjs
- .hermes/evidence/iter-24-capture-hourly-cap.md
- .hermes/LEARNED.md

## Why this matters

`/api/rego/capture` previously had input guards but no pacing guard, so a valid request loop could trigger two Resend sends per POST until quota or inbox pain did the limiting. This iteration adds a small per-instance hourly cap after validation and before email side effects, matching the check route's public `x-rego-rate-limit-scope: instance` disclosure. The regression test proves the first six valid captures still succeed and the seventh returns 429 without adding buyer or notification emails.

## Test notes

- RED: `node --test --test-name-pattern "rego capture enforces hourly cap" tests/rego-capture-route.test.mjs` — FAIL as expected before the route change (`200 !== 429`) because the seventh valid capture still reached the success path.
- GREEN focused: `node --test --test-name-pattern "rego capture enforces hourly cap" tests/rego-capture-route.test.mjs` — PASS after adding the module-local hourly hit register and 429 response with `x-rego-rate-limit-scope: instance`.
- Affected file check: `node --test tests/rego-capture-route.test.mjs` — PASS (9 tests).

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (33 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3233 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3233` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 9 minutes.

## Token usage estimate

Not available from this CLI run.
