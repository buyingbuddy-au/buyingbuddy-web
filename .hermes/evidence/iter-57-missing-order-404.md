# Iteration 57 — Phase 3 — PPSR missing order 404 QA guard

- Iteration: 57
- Phase: Phase 3 — Stage 7 QA harness
- Timestamp: 2026-05-11T19:41:19+10:00
- Objective picked:
  > [NEXT] `tests/ppsr-process-route.test.mjs` — Add test named `PPSR process route returns 404 when orderId is provided but order is missing`; post valid `rawPPSRText` plus `orderId: "order_missing"` with no `customerEmail`, leave `options.order` at default `null`, assert HTTP 404, `error: "Order not found."`, and zero `extractPpsrData`, `generatePpsrPdf`, `updateOrder`, and `resendEmails` calls. (added by iter 56)

## Files changed

- tests/ppsr-process-route.test.mjs
- .hermes/evidence/iter-57-missing-order-404.md
- .hermes/LEARNED.md

## Why this matters

A buyer-facing PPSR report should not be generated, emailed, or written back to an order when an admin/process caller supplies an order ID that does not exist. This guard moves past request-shape validation into the order lookup branch and locks the route's stable 404 envelope. It also proves the missing-order branch stops before PPSR extraction, PDF generation, order mutation, or Resend delivery.

## Test notes

- Focused GREEN on current behaviour: `node --test --test-name-pattern "PPSR process route returns 404 when orderId is provided but order is missing" tests/ppsr-process-route.test.mjs` — PASS (1 test). Current route already returned the expected 404 before downstream side effects.
- Mutation RED guard: temporarily changed the new test's harness setup to return an `order_missing` order from `get_order_by_id`; reran the same focused command — FAIL as expected with `500 !== 404`, proving the assertion is tied to the missing-order branch and would fail if the route continued into report processing. Reverted the mutation immediately.
- Focused GREEN after revert plus affected-file GREEN: `node --test --test-name-pattern "PPSR process route returns 404 when orderId is provided but order is missing" tests/ppsr-process-route.test.mjs && node --test tests/ppsr-process-route.test.mjs` — PASS (focused 1 test; file 7 tests).

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (65 tests).
- `npm run build` — PASS; Next production build compiled successfully and generated 70 static pages.
- `node scripts/rego-api-smoke.mjs` — Not run; this iteration changed only a Stage 7 PPSR QA test and did not touch rego production code, rego tests, or `scripts/rego-api-smoke.mjs`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 8 minutes (19:33–19:41 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
