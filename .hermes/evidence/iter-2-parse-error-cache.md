# Iteration 2 — Phase 2 — retryable parse errors are not cached

- Iteration: 2
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T02:02:44+10:00
- Objective picked: [NEXT] `src/lib/qld-rego/official.ts:243-256` — Stop caching retryable `result_parse_failed` responses for `NO_RESULT_CACHE_MS`; add test named `parse error is not cached as no-result`. (added by iter 1)

## Files changed

- src/lib/qld-rego/official.ts
- tests/qld-rego-official-cache.test.mjs
- .hermes/evidence/iter-2-parse-error-cache.md
- .hermes/LEARNED.md

## Why this matters

Retryable parser failures mean the QLD source was reachable but the app could not confidently read the result. Caching those failures for the same TTL as stable no-result plates turns a temporary parser/source-shape issue into repeated stale user-facing failures. This change keeps confirmed no-result caching intact while forcing retryable `result_parse_failed` responses to perform a fresh lookup on the next request.

## TDD notes

- RED: added `tests/qld-rego-official-cache.test.mjs` with `parse error is not cached as no-result`; after correcting the fixture to avoid no-result keywords, the test failed because the second response had `cached: true`.
- GREEN: changed `src/lib/qld-rego/official.ts` so only `noResult` failures are written to the no-result cache; retryable parse errors return without cache insertion.
- Specific verification: `npm test -- --test-name-pattern "parse error is not cached as no-result"` — PASS after the implementation.

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (6 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3211 node scripts/rego-api-smoke.mjs` — PASS after starting local server with `./node_modules/.bin/next start -p 3211` and confirming `/rego-check` returned HTTP 200; five smoke requests completed with exit code 0.

## Time taken

Approx. 10 minutes.

## Token usage estimate

Not available from this CLI run.
