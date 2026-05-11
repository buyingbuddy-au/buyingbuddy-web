# Iteration 54 — Phase 3 — PPSR invalid customerEmail QA guard

- Iteration: 54
- Phase: Phase 3 — Stage 7 QA harness
- Timestamp: 2026-05-11T18:53:59+10:00
- Objective picked:
  > [NEXT] `tests/ppsr-process-route.test.mjs` — Add test named `PPSR process route rejects invalid customerEmail format before report side effects`; post valid `rawPPSRText` with `customerEmail: "not-an-email"` and no `orderId`, assert HTTP 400, `error: "customerEmail must be a valid email address."`, and zero `getOrderById`, `extractPpsrData`, `generatePpsrPdf`, `updateOrder`, and `resendEmails` calls.

## Files changed

- tests/ppsr-process-route.test.mjs
- .hermes/evidence/iter-54-ppsr-invalid-email.md
- .hermes/LEARNED.md

## Why this matters

Manual PPSR processing can send directly to a customer when no order ID is provided, so a syntactically invalid email address must fail before expensive report processing or customer-visible side effects. This guard locks the validation branch through the real `POST()` route export with admin/auth, DB, extraction, PDF, and Resend dependencies mocked. It proves the route returns a stable 400 envelope and does not look up orders, extract PPSR data, generate PDFs, mutate order records, or send report emails for an undeliverable recipient.

## Test notes

- Focused GREEN on current behaviour: `node --test --test-name-pattern "PPSR process route rejects invalid customerEmail format before report side effects" tests/ppsr-process-route.test.mjs` — PASS (1 test).
- Mutation RED guard: temporarily changed the test request from `customerEmail: "not-an-email"` to `customerEmail: "buyer@example.com"`; reran the same focused command — FAIL as expected with `500 !== 400`, proving the assertion is tied to the invalid-email-format branch and would fail if the request reached downstream processing. Reverted the mutation immediately.
- Focused GREEN after revert plus affected-file GREEN: `node --test --test-name-pattern "PPSR process route rejects invalid customerEmail format before report side effects" tests/ppsr-process-route.test.mjs && node --test tests/ppsr-process-route.test.mjs` — PASS (focused 1 test; file 4 tests).

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (62 tests).
- `npm run build` — PASS; Next production build compiled successfully and generated 70 static pages.
- `node scripts/rego-api-smoke.mjs` — Not run; this iteration changed only a Stage 7 PPSR QA test and did not touch rego production code, rego tests, or `scripts/rego-api-smoke.mjs`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 26 minutes (18:28–18:54 Australia/Brisbane local), including discarded out-of-scope/less-specific target-selection false starts that were removed before final gates.

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
