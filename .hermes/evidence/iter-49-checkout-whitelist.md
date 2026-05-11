# Iteration 49 — Phase 3 — Checkout whitelist QA guard

- Iteration: 49
- Phase: Phase 3 — Stage 7 QA harness
- Timestamp: 2026-05-11T16:55:24+10:00
- Objective picked:
  > [NEXT] Add tests/checkout-whitelist.test.mjs — assert checkout API rejects unknown product slugs

## Files changed

- tests/checkout-whitelist.test.mjs
- .hermes/evidence/iter-49-checkout-whitelist.md
- .hermes/LEARNED.md

## Why this matters

Unknown product slugs should fail before the checkout route asks Stripe to build a session or success URL. The new route-handler test compiles `src/app/api/stripe/checkout/route.ts`, mocks `@/lib/stripe`, posts an otherwise valid checkout request with `product: "mystery_pack"`, and asserts HTTP 400 plus zero checkout-session calls. This gives the Stage 7 harness a direct tripwire for product-slug drift without reading env files or touching Stripe.

## Test notes

- Focused GREEN on current behaviour: `node --test --test-name-pattern "checkout API rejects unknown product slugs" tests/checkout-whitelist.test.mjs` — PASS (1 test).
- Mutation RED guard: temporarily changed the test harness' mocked `is_paid_product` default to `() => true`; reran the same focused command — FAIL as expected with `200 !== 400`, proving the test catches an unknown product reaching checkout-session creation. Reverted the mutation immediately.
- Affected-file GREEN after revert: `node --test tests/checkout-whitelist.test.mjs` — PASS (1 test).

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (57 tests).
- `npm run build` — PASS; Next production build compiled successfully and generated 70 static pages.
- `node scripts/rego-api-smoke.mjs` — Not run; this iteration changed only a Stage 7 checkout QA test and did not touch rego production code, rego tests, or `scripts/rego-api-smoke.mjs`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 11 minutes (16:44–16:55 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
