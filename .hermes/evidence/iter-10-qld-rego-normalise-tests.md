# Iteration 10 — Phase 2 — QLD rego normalise regression tests

- Iteration: 10
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T04:27:07+10:00
- Objective picked: `[NEXT] src/lib/qld-rego/normalise.ts:1-25 + tests/qld-rego-normalise.test.mjs — Add unit tests for normaliseQldRego() and validateQldRego() covering BAD!!, spaced plates, empty input, 2-char input, 7-char input, 8-char input, and longer raw input; explicitly assert whether punctuation is stripped or rejected before changing route behaviour. (added by iter 9)`

## Files changed

- tests/qld-rego-normalise.test.mjs
- .hermes/evidence/iter-10-qld-rego-normalise-tests.md
- .hermes/LEARNED.md

## Why this matters

The rego input normaliser currently strips punctuation, spaces, and hyphens before validation, then validates the normalised plate length. That behaviour affects what `/api/rego/check` will send to the QLD lookup for inputs like `BAD!!`, so it needs an explicit regression lock before any route-level behaviour change. These tests document the current contract: punctuation is stripped rather than rejected, 3-to-7 character normalised plates are accepted, and empty/too-short/8-char/longer raw inputs are rejected with the existing user-safe messages.

## Test notes

- Added `tests/qld-rego-normalise.test.mjs` with a narrow TypeScript compile helper for `src/lib/qld-rego/normalise.ts`.
- Added `normaliseQldRego strips punctuation, spaces, and limits plate length` to cover `BAD!!`, spaced plates, hyphenated plates, and longer raw input truncation.
- Added `validateQldRego accepts normalised 3-to-7 character plates` to prove punctuation/spaces are stripped before validation and 7-character plates remain valid.
- Added `validateQldRego rejects empty, too-short, 8-char, and longer raw plates` to cover empty input, 2-character input, 8-character input, and longer raw input.
- Focused verification: `node --test tests/qld-rego-normalise.test.mjs` — PASS (3 tests).

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (20 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3219 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3219` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 10 minutes.

## Token usage estimate

Not available from this CLI run.
