# Iteration 53 — Phase 3 — PPSR missing customerEmail QA guard

- Iteration: 53
- Phase: Phase 3 — Stage 7 QA harness
- Timestamp: 2026-05-11T18:21:47+10:00
- Objective picked:
  > [NEXT] `tests/ppsr-process-route.test.mjs` — Add test named `PPSR process route rejects missing customerEmail when orderId is absent before report side effects`; post valid `rawPPSRText` without `customerEmail` or `orderId`, assert HTTP 400, `error: "customerEmail is required when orderId is not provided."`, and zero `getOrderById`, `extractPpsrData`, `generatePpsrPdf`, `updateOrder`, and `resendEmails` calls.

## Files changed

- tests/ppsr-process-route.test.mjs
- .hermes/evidence/iter-53-ppsr-missing-customer-email.md
- .hermes/LEARNED.md

## Why this matters

The PPSR process route supports manual/admin processing without an order ID, so the customer email is the only delivery target in that branch. This guard proves a missing delivery address is rejected before order lookup, PPSR extraction, PDF generation, order mutation, or Resend email send. It keeps malformed manual PPSR processing requests from doing expensive or customer-visible work with no valid recipient.

## Test notes

- Focused GREEN on current behaviour: `node --test --test-name-pattern "PPSR process route rejects missing customerEmail when orderId is absent before report side effects" tests/ppsr-process-route.test.mjs` — PASS (1 test). Current route already rejects this branch.
- Mutation RED guard: temporarily added `orderId: "order_test_email_guard"` to the test request; reran the same focused command — FAIL as expected with `404 !== 400`, proving the assertion is tied to the missing-email/no-order branch and would fail if the request drifted into order lookup. Reverted the mutation immediately.
- Focused GREEN after revert plus affected-file GREEN: `node --test --test-name-pattern "PPSR process route rejects missing customerEmail when orderId is absent before report side effects" tests/ppsr-process-route.test.mjs && node --test tests/ppsr-process-route.test.mjs` — PASS (focused 1 test; file 3 tests).

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (61 tests).
- `npm run build` — PASS; Next production build compiled successfully and generated 70 static pages.
- `node scripts/rego-api-smoke.mjs` — Not run; this iteration changed only a Stage 7 PPSR QA test and did not touch rego production code, rego tests, or `scripts/rego-api-smoke.mjs`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 9 minutes (18:12–18:21 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
