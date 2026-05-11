# Iteration 58 — Phase 3 — PPSR email/order mismatch QA guard

- Iteration: 58
- Phase: Phase 3 — Stage 7 QA harness
- Timestamp: 2026-05-11T19:56:21+10:00
- Objective picked:
  > [NEXT] `tests/ppsr-process-route.test.mjs` — Add test named `PPSR process route rejects mismatched order and customerEmail before report side effects`; provide `orderId: "order_x"` plus `customerEmail: "different@example.com"` with `options.order` returning `{ id: "order_x", customer_email: "buyer@example.com", product: "ppsr", status: "pending" }`, assert HTTP 400, `error: "customerEmail does not match the selected order."`, and zero `extractPpsrData`, `generatePpsrPdf`, `updateOrder`, and `resendEmails` calls.

## Files changed

- tests/ppsr-process-route.test.mjs
- .hermes/evidence/iter-58-ppsr-email-mismatch.md
- .hermes/LEARNED.md

## Why this matters

A caller who knows an order ID should not be able to redirect a PPSR report to a different email address. This guard locks the anti-abuse branch after order lookup but before PPSR extraction, PDF generation, order mutation, or Resend delivery. It extends the PPSR process route coverage beyond request-shape validation into the order-present branch without touching production route code.

## Test notes

- Focused GREEN on current behaviour: `node --test --test-name-pattern "PPSR process route rejects mismatched order and customerEmail before report side effects" tests/ppsr-process-route.test.mjs` — PASS (1 test). The route already rejected a mismatched request before downstream report side effects.
- Mutation RED guard: temporarily changed the new test harness order email to `different@example.com`; reran the same focused command — FAIL as expected with `500 !== 400`, proving the assertion is tied to the email mismatch branch and would fail if the route continued into report processing. Reverted the mutation immediately.
- Focused GREEN after revert plus affected-file GREEN: `node --test --test-name-pattern "PPSR process route rejects mismatched order and customerEmail before report side effects" tests/ppsr-process-route.test.mjs && node --test tests/ppsr-process-route.test.mjs` — PASS (focused 1 test; file 8 tests).

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (66 tests).
- `npm run build` — PASS; Next production build compiled successfully and generated 70 static pages.
- `node scripts/rego-api-smoke.mjs` — Not run; this iteration changed only a Stage 7 PPSR QA test and did not touch rego production code, rego tests, or `scripts/rego-api-smoke.mjs`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 8 minutes (19:48–19:56 Australia/Brisbane local).

## Token usage estimate

Not available from this Hermes OpenAI Codex OAuth run.
