# Iteration 11 — Phase 2 — remove unreachable QLD rego validation branch

- Iteration: 11
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T04:45:41+10:00
- Objective picked: `[NEXT] src/lib/qld-rego/normalise.ts:20-22 — Remove the unreachable non-alphanumeric validation branch now that tests/qld-rego-normalise.test.mjs documents punctuation is stripped before validation; keep current public behaviour unchanged and confirm node --test tests/qld-rego-normalise.test.mjs stays green. (added by iter 10)`

## Files changed

- src/lib/qld-rego/normalise.ts
- .hermes/evidence/iter-11-remove-normalise-branch.md
- .hermes/LEARNED.md

## Why this matters

`normaliseQldRego()` strips every non-alphanumeric character before `validateQldRego()` reaches its format checks, so the later non-alphanumeric branch could not be exercised. Removing it keeps the documented public behaviour unchanged while reducing a misleading validation path that future route work could accidentally rely on. The existing normalise regression tests from iteration 10 lock the intended behaviour: punctuation is stripped, valid 3–7 character plates pass, and empty/too-short/too-long inputs still fail with the same public messages.

## Test notes

- Pre-change focused check: `node --test tests/qld-rego-normalise.test.mjs` — PASS (3 tests). This confirmed the existing regression lock before the refactor.
- Post-change focused check: `node --test tests/qld-rego-normalise.test.mjs` — PASS (3 tests). This confirmed branch removal did not change normalisation or validation behaviour.

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (20 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3220 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3220` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 10 minutes.

## Token usage estimate

Not available from this CLI run.
