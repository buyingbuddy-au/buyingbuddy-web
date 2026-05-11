# Iteration 47 — Phase 3 — Live Stripe key static QA guard

- Iteration: 47
- Phase: Phase 3 — Stage 7 QA harness
- Timestamp: 2026-05-11T16:10:57+10:00
- Objective picked:
  > [NEXT] Add `tests/no-live-stripe-keys.test.mjs` to assert no `pk_live_`/`sk_live_` strings exist under `src/`, `tests/`, or `scripts/`

## Files changed

- tests/no-live-stripe-keys.test.mjs
- .hermes/evidence/iter-47-no-live-stripe-keys.md
- .hermes/LEARNED.md

## Why this matters

Live Stripe publishable or secret key prefixes should never land in committed source, tests, or scripts, especially while this loop is intentionally avoiding env files and external Stripe mutations. This Stage 7 guard gives the repo a cheap, repeatable tripwire for accidental live-key leakage without reading `.env*` or credential-like files. It also constructs the key-prefix regex without embedding contiguous live-key prefixes in the test source, so the scanner can scan itself without allowlist gymnastics.

## Test notes

- Focused GREEN: `node --test tests/no-live-stripe-keys.test.mjs` — PASS (1 test).
- Mutation RED guard: temporarily created `tests/tmp-live-stripe-key-regression.test.mjs` with a fake live Stripe secret-key prefix; reran `node --test tests/no-live-stripe-keys.test.mjs` — FAIL as expected with `tests/tmp-live-stripe-key-regression.test.mjs: sk_live_fake…` in the reported matches. Removed the temporary fixture immediately.
- Focused GREEN after cleanup: `node --test tests/no-live-stripe-keys.test.mjs && git status --short` — PASS and confirmed the temporary fixture was gone.

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (55 tests).
- `npm run build` — PASS; Next production build compiled successfully and generated 70 static pages.
- `node scripts/rego-api-smoke.mjs` — Not run; this iteration changed only a Stage 7 static QA test and did not touch rego production code, rego tests, or `scripts/rego-api-smoke.mjs`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 10 minutes (16:01–16:11 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
