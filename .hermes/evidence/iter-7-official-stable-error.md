# Iteration 7 — Phase 2 — official rego stable upstream error

- Iteration: 7
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T03:36:13+10:00
- Objective picked: `[NEXT] src/lib/qld-rego/official.ts:278-282 + tests/qld-rego-official-cache.test.mjs — Add test named official unavailable returns stable error code; simulate the official lookup fetch throwing new Error("boom secret/path") and assert the failure uses a stable public error code without including boom or secret/path. (added by iter 6)`

## Files changed

- src/lib/qld-rego/official.ts
- tests/qld-rego-official-cache.test.mjs
- .hermes/evidence/iter-7-official-stable-error.md
- .hermes/LEARNED.md

## Why this matters

The low-level QLD lookup catch path still returned arbitrary exception text as the public `error` field, even after the API route catch was hardened in iteration 6. A thrown fetch/provider error such as `boom secret/path` could therefore leak internal details if `runQldOfficialRegoCheck()` handled it and passed the response back through the route. This iteration keeps the raw error in server logs and returns the stable public code `official_fetch_failed` with the existing user-safe message.

## TDD notes

- RED: added `official unavailable returns stable error code` in `tests/qld-rego-official-cache.test.mjs`; `npm test -- --test-name-pattern "official unavailable returns stable error code"` failed as expected with `actual: 'boom secret/path'` vs `expected: 'official_fetch_failed'`.
- GREEN: updated `src/lib/qld-rego/official.ts` to log `console.error("[qld-rego] official lookup failed", error)` on unexpected official lookup failures and return `error: "official_fetch_failed"`. The same focused command then passed.

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (14 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3216 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3216` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 12 minutes.

## Token usage estimate

Not available from this CLI run.
