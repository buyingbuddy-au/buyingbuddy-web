# Iteration 48 — Phase 3 — Stripe secret-prefix QA guard

- Iteration: 48
- Phase: Phase 3 — Stage 7 QA harness
- Timestamp: 2026-05-11T16:34:57+10:00
- Objective picked:
  > [NEXT] `tests/no-live-stripe-keys.test.mjs` — Extend test `committed code does not contain live Stripe publishable or secret keys` to also catch restricted-key and webhook-secret prefixes (`rk_live_`, `whsec_`) without embedding contiguous live-secret literals in the test source.

## Files changed

- tests/no-live-stripe-keys.test.mjs
- .hermes/evidence/iter-48-stripe-secret-prefixes.md
- .hermes/LEARNED.md

## Why this matters

The existing Stage 7 Stripe key guard only covered publishable and secret live-key prefixes. Stripe restricted keys and webhook signing secrets are also credential material, so committed code should trip the same scanner if either family appears under `src/`, `tests/`, or `scripts/`. This change builds the new prefixes from string pieces so the scanner can scan its own test file without allowlisting the guard source.

## Test notes

- RED: `node --test --test-name-pattern "Stripe key material detector catches live secret families" tests/no-live-stripe-keys.test.mjs` — FAIL as expected before widening the pattern; the detector returned `[]` for the constructed restricted-key example.
- GREEN focused: `node --test --test-name-pattern "Stripe key material detector catches live secret families" tests/no-live-stripe-keys.test.mjs` — PASS after adding restricted-key and webhook-secret prefixes to the detector.
- Affected-file GREEN: `node --test tests/no-live-stripe-keys.test.mjs` — PASS (2 tests).
- Mutation RED guard: temporarily created `tests/tmp-stripe-regression.test.mjs` containing fake restricted-key and webhook-secret prefixes; `node --test --test-name-pattern "committed code does not contain live Stripe" tests/no-live-stripe-keys.test.mjs` — FAIL as expected with both fake matches reported. Removed the temporary fixture immediately and reran the affected-file test green.
- Source self-scan check: `search_files` for contiguous `pk_live_`, `sk_live_`, `rk_live_`, or `whsec_` in `tests/no-live-stripe-keys.test.mjs` returned 0 matches.

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (56 tests).
- `npm run build` — PASS; Next production build compiled successfully and generated 70 static pages.
- `node scripts/rego-api-smoke.mjs` — Not run; this iteration changed only a Stage 7 static QA test and did not touch rego production code, rego tests, or `scripts/rego-api-smoke.mjs`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 16 minutes (16:19–16:35 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
