# Iteration 3 — Phase 2 — no-result rego cache regression

- Iteration: 3
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T02:17:41+10:00
- Objective picked: `[NEXT] tests/qld-rego-official-cache.test.mjs — Add test named no-result response is cached for the no-result TTL; assert two same-plate no-result lookups only fetch once and the second response has cached: true. (added by iter 2)`

## Files changed

- tests/qld-rego-official-cache.test.mjs
- .hermes/evidence/iter-3-no-result-cache-test.md
- .hermes/LEARNED.md

## Why this matters

The previous iteration deliberately stopped retryable parser failures from being cached as stable no-result responses. This regression test protects the other half of that contract: confirmed no-result responses should still be cached for the no-result TTL so repeated typo/non-match checks do not keep hitting the QLD source. It asserts the second same-plate no-result response is marked `cached: true` and that only the first lookup performs the two mocked QLD fetches.

## Test notes

- Change type: test-only regression lock; no production code was changed.
- Added a no-result HTML fixture that trips `looksLikeNoResult()` without returning registration details.
- Verification command: `npm test -- --test-name-pattern "no-result response is cached for the no-result TTL"` — PASS. Node's test runner reported the existing 7 subtests in this project; the new named subtest passed.

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (7 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3212 node scripts/rego-api-smoke.mjs` — PASS after starting local server with `./node_modules/.bin/next start -p 3212` and confirming `/rego-check` returned HTTP 200; five smoke requests completed with exit code 0.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the build/typecheck artifact before staging.

## Time taken

Approx. 8 minutes.

## Token usage estimate

Not available from this CLI run.
