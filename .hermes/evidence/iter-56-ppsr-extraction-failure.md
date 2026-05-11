# Iteration 56 — Phase 3 — PPSR extraction failure side-effect guard

- Iteration: 56
- Phase: Phase 3 — Stage 7 QA harness
- Timestamp: 2026-05-11T19:27:04+10:00
- Objective picked:
  > 1. **(highest leverage)** `tests/ppsr-process-route.test.mjs` — Add test named `PPSR process route does not mutate order when extraction fails`. Provide a valid request with `orderId: "order_ok"` + matching `customerEmail`, mock `options.order` returning `{ id: "order_ok", customer_email: "buyer@example.com", product: "ppsr", status: "pending" }`, mock `extract_ppsr_data` to throw `new Error("upstream parse failure")`, assert HTTP 500, `error` includes `"upstream parse failure"`, **`updateOrder` called zero times**, `generatePpsrPdf` called zero times, `resendEmails` called zero times. This locks the side-effect-ordering invariant the suite's test names keep claiming — but on the success path, where it actually matters in prod. (This is the real Stage 7 work iter 51 promised.)

## Files changed

- tests/ppsr-process-route.test.mjs
- .hermes/evidence/iter-56-ppsr-extraction-failure.md
- .hermes/LEARNED.md

## Why this matters

The PPSR process route should not mutate an order, generate a PDF, or email a customer if report extraction fails after a valid order lookup. Previous tests only proved invalid request payloads failed before side effects; this guard enters the order-present branch and locks the first downstream failure point. That protects the route from marking an order as processed when the PPSR source text cannot be parsed.

## Test notes

- Focused GREEN on current behaviour: `node --test --test-name-pattern "PPSR process route does not mutate order when extraction fails" tests/ppsr-process-route.test.mjs` — PASS (1 test). The route already failed before PDF generation, order mutation, and Resend when the mocked extractor threw.
- Mutation RED guard: temporarily removed the `options.extractPpsrData` override from the route-test harness; reran the same focused command — FAIL as expected because the route continued past extraction and returned `RESEND_API_KEY is not configured.` instead of `upstream parse failure`. Reverted the mutation immediately.
- Focused GREEN after revert plus affected-file GREEN: `node --test --test-name-pattern "PPSR process route does not mutate order when extraction fails" tests/ppsr-process-route.test.mjs && node --test tests/ppsr-process-route.test.mjs` — PASS (focused 1 test; file 6 tests).

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (64 tests).
- `npm run build` — PASS; Next production build compiled successfully and generated 70 static pages.
- `node scripts/rego-api-smoke.mjs` — Not run; this iteration changed only a Stage 7 PPSR QA test and did not touch rego production code, rego tests, or `scripts/rego-api-smoke.mjs`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 10 minutes (19:17–19:27 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
