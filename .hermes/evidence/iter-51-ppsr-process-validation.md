# Iteration 51 — Phase 3 — PPSR process route validation guard

- Iteration: 51
- Phase: Phase 3 — Stage 7 QA harness
- Timestamp: 2026-05-11T17:47:34+10:00
- Objective picked:
  > [NEXT] (THE ACTUAL PPSR PIVOT — second-highest leverage) `src/app/api/ppsr/process/route.ts` (read it first) + new `tests/ppsr-process-route.test.mjs` — The PPSR funnel is the named target on the branch and has had zero iters. Read the route handler; identify the equivalent of the iter-36 entry point (the place where a missing/malformed upstream PPSR field could silently downgrade a buyer-facing signal, or where the route surfaces an error without a stable status/retryable contract). Write the first RED test there — likely a happy-path fixture that asserts the response shape, OR a single-failure-mode test (e.g., upstream PPSR API returns 5xx → route returns `{ ok: false, status: "...", retryable: true }`). **This is the actual Stage 7 work. Iters 46–50 wrote a moat around the funnel; this NEXT writes the first test inside the funnel.** (added by Claude review)

## Files changed

- tests/ppsr-process-route.test.mjs
- .hermes/evidence/iter-51-ppsr-process-validation.md
- .hermes/LEARNED.md

## Why this matters

The PPSR processing endpoint was named as the branch's untouched funnel risk, so this iteration adds the first route-handler regression inside that flow rather than another moat around it. The new test exercises `src/app/api/ppsr/process/route.ts` through its real `POST()` export, with admin/auth, DB, report extraction, PDF, and Resend dependencies mocked. It asserts a non-string `customerEmail` returns HTTP 400 with a stable error before any order lookup, PPSR extraction, PDF generation, order update, or report-email send can happen.

## Test notes

- Focused GREEN on current behaviour: `node --test --test-name-pattern "PPSR process route rejects non-string customerEmail" tests/ppsr-process-route.test.mjs` — PASS (1 test).
- Mutation RED guard: temporarily changed the test request from `customerEmail: 123` to `customerEmail: "buyer@example.com"`; reran the same focused command — FAIL as expected with `500 !== 400`, proving the guard is tied to the invalid-email-type branch and fails if the request reaches downstream processing. Reverted the mutation immediately.
- Affected-file GREEN after revert: `node --test tests/ppsr-process-route.test.mjs` — PASS (1 test).
- Harness note: a direct temporary `tsc --project` CommonJS compile of `src/app/api/ppsr/process/route.ts` pulled `src/lib/pdfkit-compat.ts` and failed on `import.meta`; the final test uses `typescript.transpileModule()` for the route file plus `Module._load` mocks and relies on the normal `npm run typecheck`/`npm run build` gates for type/build validation.

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (59 tests).
- `npm run build` — PASS; Next production build compiled successfully and generated 70 static pages.
- `node scripts/rego-api-smoke.mjs` — Not run; this iteration changed only a Stage 7 PPSR QA test and did not touch rego production code, rego tests, or `scripts/rego-api-smoke.mjs`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 20 minutes (17:28–17:48 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
