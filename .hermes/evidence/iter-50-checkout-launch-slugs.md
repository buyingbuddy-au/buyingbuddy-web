# Iteration 50 — Phase 3 — Checkout launch-slug QA guard

- Iteration: 50
- Phase: Phase 3 — Stage 7 QA harness
- Timestamp: 2026-05-11T17:16:16+10:00
- Objective picked:
  > [NEXT] `tests/checkout-whitelist.test.mjs` — Add test named `checkout API allows launch paid product slugs`; post valid `ppsr` and `deal_room` requests, assert HTTP 200, and assert the mocked checkout-session calls carry exactly `ppsr` and `deal_room` products.

## Files changed

- tests/checkout-whitelist.test.mjs
- .hermes/evidence/iter-50-checkout-launch-slugs.md
- .hermes/LEARNED.md

## Why this matters

The Stage 7 checkout guard now proves both sides of the whitelist contract: unknown products stop before Stripe, while launch paid slugs still pass through to checkout-session creation. This matters because a future whitelist tightening could accidentally block PPSR or Deal Pack purchases while still making the unknown-product rejection test pass. The test uses a compiled route handler with a mocked `@/lib/stripe`, so it does not read env files or touch Stripe.

## Test notes

- Focused GREEN on current behaviour: `node --test --test-name-pattern "checkout API allows launch paid product slugs" tests/checkout-whitelist.test.mjs` — PASS (1 test). Current route already allowed both launch slugs.
- Mutation RED guard: temporarily removed `deal_room` from the test harness' `KNOWN_PAID_PRODUCTS`; reran the same focused command — FAIL as expected with `deal_room should create a checkout session` and `400 !== 200`. Reverted the mutation immediately.
- Focused GREEN after revert: `node --test --test-name-pattern "checkout API allows launch paid product slugs" tests/checkout-whitelist.test.mjs` — PASS (1 test).
- Affected-file GREEN after revert: `node --test tests/checkout-whitelist.test.mjs` — PASS (2 tests).

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (58 tests).
- `npm run build` — PASS; Next production build compiled successfully and generated 70 static pages.
- `node scripts/rego-api-smoke.mjs` — Not run; this iteration changed only a Stage 7 checkout QA test and did not touch rego production code, rego tests, or `scripts/rego-api-smoke.mjs`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 11 minutes (17:05–17:16 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
