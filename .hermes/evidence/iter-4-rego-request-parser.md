# Iteration 4 — Phase 2 — rego check request parser

- Iteration: 4
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T02:37:00+10:00
- Objective picked: `[NEXT] src/app/api/rego/check/route.ts:8-40 + tests/rego-check-route.test.mjs — Add route-handler tests for malformed JSON and non-string rego, then add a runtime request parser that returns HTTP 400 input_error before calling QLD lookup. (added by iter 3)`

## Files changed

- src/app/api/rego/check/route.ts
- tests/rego-check-route.test.mjs
- .hermes/evidence/iter-4-rego-request-parser.md
- .hermes/LEARNED.md

## Why this matters

Malformed JSON and non-string `rego` values previously fell into the route-level catch block and returned HTTP 500, with the non-string path exposing an implementation error from `normaliseQldRego()`. The new parser treats request body shape as untrusted input before trimming, normalising, or calling the QLD lookup. This keeps client mistakes in the stable `input_error` envelope and proves those bad requests do not hit the external rego source.

## TDD notes

- RED: added `tests/rego-check-route.test.mjs` with `rego check rejects malformed JSON` and `rego check rejects non-string rego`. After fixing the test harness module resolution, both failed as expected with `500 !== 400` against the existing route.
- GREEN: added `parseRegoCheckRequest()` plus `inputErrorResponse()` in `src/app/api/rego/check/route.ts`; malformed JSON now returns `error: "invalid_json"`, non-string rego returns `error: "invalid_rego"`, and both paths return HTTP 400 without invoking the mocked QLD lookup.
- Specific verification: `npm test -- --test-name-pattern "rego check rejects"` — PASS (9 subtests reported by the current test command; the two new named subtests passed).

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (9 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3213 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3213` and confirming `/rego-check` returned HTTP 200; five smoke requests completed with exit code 0.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 35 minutes.

## Token usage estimate

Not available from this CLI run.
