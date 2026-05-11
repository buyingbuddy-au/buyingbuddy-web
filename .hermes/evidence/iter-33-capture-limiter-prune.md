# Iteration 33 — Phase 2 — rego capture limiter pruning

- Iteration: 33
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T11:16:30+10:00
- Objective picked:
  > [NEXT] `src/app/api/rego/capture/route.ts:68-82` + `tests/rego-capture-route.test.mjs` — Add route-handler test named `rego capture limiter drops expired email keys`; stub `Date.now()` to create an expired per-email limiter bucket, assert stale email keys are pruned before adding the new hit, then update `registerCaptureHit()` so `captureHourlyHitsByEmail` is bounded to active-window keys.

## Files changed

- src/app/api/rego/capture/route.ts
- tests/rego-capture-route.test.mjs
- .hermes/evidence/iter-33-capture-limiter-prune.md
- .hermes/LEARNED.md

## Why this matters

Iteration 28 correctly partitioned the capture limiter by email, but the backing `Map` could retain expired email keys for as long as the instance stayed warm. That is low-risk but unnecessary memory growth on exactly the endpoint that already models abuse. This change prunes expired limiter buckets before registering a new capture hit, keeping the map bounded to active-window keys while preserving the per-email hourly cap behaviour.

## Test notes

- RED: `node --test --test-name-pattern "rego capture limiter drops expired email keys" tests/rego-capture-route.test.mjs` — FAIL as expected before the route change (`2 !== 1`) because the stale email key remained in `captureHourlyHitsByEmail` after the fresh email hit was added.
- GREEN focused + affected file check: `node --test --test-name-pattern "rego capture limiter drops expired email keys" tests/rego-capture-route.test.mjs && node --test tests/rego-capture-route.test.mjs` — PASS; focused test passed and the full rego-capture route file passed 15 tests.

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (41 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3242 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3242` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 12 minutes (11:04–11:16 Australia/Brisbane local).

## Token usage estimate

Not available from this CLI run.
