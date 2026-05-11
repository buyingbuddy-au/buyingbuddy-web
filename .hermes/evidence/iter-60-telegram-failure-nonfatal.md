# Iteration 60 — Phase 3 — Telegram failure non-fatal QA guard

- Iteration: 60
- Phase: Phase 3 — Stage 7 QA harness
- Timestamp: 2026-05-11T20:31:08+10:00
- Objective picked:
  > [NEXT] `tests/ppsr-process-route.test.mjs` — Add test named `PPSR process route treats Telegram notification failure as non-fatal after report email`; provide valid `rawPPSRText`, `orderId: "order_ok"`, matching `customerEmail`, dummy `RESEND_API_KEY`, and a `TELEGRAM_BOT_TOKEN`; mock Telegram `fetch` to return HTTP 500, assert HTTP 200, `telegramSent: false`, one Resend email, two `updateOrder` calls including `status: "complete"`, and one `console.warn` tagged `[PPSR] Telegram notification failed:`.

## Files changed

- tests/ppsr-process-route.test.mjs
- .hermes/evidence/iter-60-telegram-failure-nonfatal.md
- .hermes/LEARNED.md

## Why this matters

Telegram notification is an internal alert path and should not make a paid PPSR fulfilment look failed after the buyer report email has already gone out. This guard locks the intended sequence: order checked, buyer email sent, order completed, Telegram attempted, then Telegram HTTP failure is downgraded to a warning with `telegramSent: false`. It also verifies the test harness never calls live Telegram or Resend services.

## Test notes

- Focused GREEN on current behaviour: `node --test --test-name-pattern "PPSR process route treats Telegram notification failure as non-fatal after report email" tests/ppsr-process-route.test.mjs` — PASS (1 test). The route already treated Telegram HTTP 500 as non-fatal after the report email.
- Mutation RED guard: temporarily changed the new test's Telegram mock response from HTTP 500 to HTTP 200 and reran the same focused command — FAIL as expected with `true !== false` on `payload.telegramSent`, proving the assertion is tied to the Telegram failure branch. Reverted the mutation immediately.
- Focused GREEN after revert plus affected-file GREEN: `node --test --test-name-pattern "PPSR process route treats Telegram notification failure as non-fatal after report email" tests/ppsr-process-route.test.mjs && node --test tests/ppsr-process-route.test.mjs` — PASS (focused 1 test; file 10 tests).

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (68 tests).
- `npm run build` — PASS; Next production build compiled successfully and generated 70 static pages.
- `node scripts/rego-api-smoke.mjs` — Not run; this iteration changed only a Stage 7 PPSR QA test and did not touch rego production code, rego tests, or `scripts/rego-api-smoke.mjs`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 9 minutes (20:22–20:31 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
