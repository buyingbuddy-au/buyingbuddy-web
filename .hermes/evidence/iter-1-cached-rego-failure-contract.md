# Iteration 1 — Phase 2 — cached rego failure contract

- Iteration: 1
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T01:44:44+10:00
- Objective picked: `[NEXT] src/lib/qld-rego/official.ts:180-183 and src/lib/qld-rego/types.ts:34-51 — Fix the cached failure contract by either adding cached?: boolean to QldRegoCheckFailure or only adding cached to success responses. Add a test named runQldOfficialRegoCheck returns typed cached no-result response. (from A1-rego-api-contract.md)`

## Files changed

- src/lib/qld-rego/types.ts
- src/lib/qld-rego/official.ts
- tests/qld-rego-types.test.mjs
- tests/type-fixtures/qld-rego-cached-failure.ts
- .hermes/evidence/iter-1-cached-rego-failure-contract.md
- .hermes/LEARNED.md

## Why this matters

`runQldOfficialRegoCheck()` stores both success and no-result responses in the same cache and marks cache hits with `cached: true`. Before this iteration, the failure branch type did not allow `cached`, so `official.ts` needed a type assertion that hid a real response-contract mismatch. The new type fixture locks the no-result cached response into the public `QldRegoCheckResponse` union, and `official.ts` now returns the cached object without a cast.

## TDD notes

- RED: `npm test -- --test-name-pattern "runQldOfficialRegoCheck returns typed cached no-result response"` failed with `TS2353: 'cached' does not exist in type 'QldRegoCheckFailure'` and `TS2339: Property 'cached' does not exist on type 'QldRegoCheckFailure'`.
- GREEN: added `cached?: boolean` to `QldRegoCheckFailure` and removed the cached response cast in `official.ts`; the same test passed.

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (5 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3210 node scripts/rego-api-smoke.mjs` — PASS after starting local server with `./node_modules/.bin/next start -p 3210`; five smoke requests completed with exit code 0.

## Time taken

Approx. 15 minutes.

## Token usage estimate

Not available from this CLI run.
