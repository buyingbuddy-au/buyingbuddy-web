# Iteration 52 — Phase 3 — PPSR blank orderId QA guard

- Iteration: 52
- Phase: Phase 3 — Stage 7 QA harness
- Timestamp: 2026-05-11T18:06:50+10:00
- Objective picked:
  > [NEXT] `tests/ppsr-process-route.test.mjs` — Add test named `PPSR process route rejects blank orderId before report side effects`; post valid `rawPPSRText`/`customerEmail` with `orderId: "   "`, assert HTTP 400, `error: "orderId must be a non-empty string when provided."`, and zero `getOrderById`, `extractPpsrData`, `generatePpsrPdf`, `updateOrder`, and `resendEmails` calls.

## Files changed

- tests/ppsr-process-route.test.mjs
- .hermes/evidence/iter-52-ppsr-blank-orderid.md
- .hermes/LEARNED.md

## Why this matters

The PPSR process route accepts optional order IDs, so a whitespace-only value must fail as input validation instead of drifting into order lookup or report generation. This guard keeps malformed admin/manual-processing requests from touching order records, PPSR extraction, PDF generation, or Resend email sends. It extends the first PPSR route harness from iter 51 while staying in the Phase 3 Stage 7 QA-harness scope.

## Test notes

- Focused GREEN on current behaviour: `node --test --test-name-pattern "PPSR process route rejects blank orderId before report side effects" tests/ppsr-process-route.test.mjs` — PASS (1 test). Current route already rejects blank `orderId` before side effects.
- Mutation RED guard: temporarily changed the test request from `orderId: "   "` to `orderId: "order_test_blank_guard"`; reran the same focused command — FAIL as expected with `404 !== 400`, proving the assertion is tied to the blank-order validation branch and would fail if the request reached order lookup. Reverted the mutation immediately.
- Focused GREEN after revert plus affected-file GREEN: `node --test --test-name-pattern "PPSR process route rejects blank orderId before report side effects" tests/ppsr-process-route.test.mjs && node --test tests/ppsr-process-route.test.mjs` — PASS (focused 1 test; file 2 tests).

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (60 tests).
- `npm run build` — PASS; Next production build compiled successfully and generated 70 static pages.
- `node scripts/rego-api-smoke.mjs` — Not run; this iteration changed only a Stage 7 PPSR QA test and did not touch rego production code, rego tests, or `scripts/rego-api-smoke.mjs`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 10 minutes (17:56–18:06 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
