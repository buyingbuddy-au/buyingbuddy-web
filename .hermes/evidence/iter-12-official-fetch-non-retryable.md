# Iteration 12 — Phase 2 — official fetch failure retry guidance

- Iteration: 12
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T05:02:27+10:00
- Objective picked: `[NEXT] src/lib/qld-rego/official.ts:282 + tests/qld-rego-official-cache.test.mjs — Add test named official thrown fetch is non-retryable; simulate a thrown official lookup fetch and assert response.retryable === false, then change the official_fetch_failed failure retryable argument from true to false. (carried forward by iter 11)`

## Files changed

- src/lib/qld-rego/official.ts
- tests/qld-rego-official-cache.test.mjs
- .hermes/evidence/iter-12-official-fetch-non-retryable.md
- .hermes/LEARNED.md

## Why this matters

The route-level catch already stopped retry-amplifying unexpected rego failures, but the lower-level QLD official lookup catch still told clients the same thrown-fetch failure was retryable. This made retry guidance depend on which catch layer handled the exception, not on the buyer-visible failure mode. Marking `official_fetch_failed` as non-retryable keeps the stable public error code from iteration 7 while aligning client guidance with the safer route-level behaviour.

## Test notes

- RED: `node --test --test-name-pattern "official thrown fetch is non-retryable" tests/qld-rego-official-cache.test.mjs` — FAIL as expected before the production change (`true !== false`).
- GREEN focused: `node --test --test-name-pattern "official thrown fetch is non-retryable" tests/qld-rego-official-cache.test.mjs` — PASS after changing `official_fetch_failed` to `retryable: false`.
- Affected file check: `node --test tests/qld-rego-official-cache.test.mjs` — PASS (4 tests).

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (21 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3221 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3221` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 13 minutes.

## Token usage estimate

Not available from this CLI run.
