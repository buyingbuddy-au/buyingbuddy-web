# Iteration 28 — Phase 2 — rego capture per-email limiter

- Iteration: 28
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T09:53:48+10:00
- Objective picked:
  > [NEXT] `src/app/api/rego/capture/route.ts:60-72` + `tests/rego-capture-route.test.mjs` — Add test named `rego capture limit is per email`; post 6 valid captures from `buyer-a@example.com`, then a 7th from `buyer-b@example.com` and assert HTTP 200 before replacing the global `captureHourlyHits: number[]` limiter with a map keyed by validated email (or validated rego+email).

## Files changed

- src/app/api/rego/capture/route.ts
- tests/rego-capture-route.test.mjs
- .hermes/evidence/iter-28-capture-per-email-limit.md
- .hermes/LEARNED.md

## Why this matters

The capture endpoint had moved from no limiter to a global per-instance hourly cap, which protected Resend but let one noisy buyer lock out every other buyer on the same instance. This iteration keeps the same per-instance scope and hourly cap, but partitions the hit counter by validated email so unrelated buyers do not inherit each other's limit. The regression proves six captures from `buyer-a@example.com` do not block a first valid capture from `buyer-b@example.com`.

## Test notes

- RED: `node --test --test-name-pattern "rego capture limit is per email" tests/rego-capture-route.test.mjs` — FAIL as expected before the route change (`429 !== 200`) because the global `captureHourlyHits` array treated buyer-b as over-limit after buyer-a's six captures.
- GREEN focused: `node --test --test-name-pattern "rego capture limit is per email" tests/rego-capture-route.test.mjs` — PASS after replacing the array with `captureHourlyHitsByEmail` and passing the validated email into `registerCaptureHit(email)`.
- Affected file check: `node --test tests/rego-capture-route.test.mjs` — PASS (13 tests).

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (37 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3237 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3237` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 9 minutes.

## Token usage estimate

Not available from this CLI run.
