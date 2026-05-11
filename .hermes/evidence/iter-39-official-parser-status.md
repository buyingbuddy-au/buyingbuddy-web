# Iteration 39 — Phase 2 — QLD official parser missing-status guard

- Iteration: 39
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T13:16:24+10:00
- Objective picked:
  > [NEXT] `src/lib/qld-rego/official.ts:73-87` + `tests/qld-rego-parser.test.mjs` — Add fixture test named `qld official parser requires registration status`; feed a `Registration details` result body with valid `Vehicle Identification Number (VIN)` and `Expiry` labels but no `Status` label through `runQldOfficialRegoCheck()` fetch mock, and assert `ok: false`, `status: "parse_error"` instead of a successful result with unknown registration status.

## Files changed

- src/lib/qld-rego/official.ts
- tests/qld-rego-parser.test.mjs
- .hermes/evidence/iter-39-official-parser-status.md
- .hermes/LEARNED.md

## Why this matters

`runQldOfficialRegoCheck()` is the source-of-truth parser that turns QLD Transport HTML into the data the UI presents as official. Before this change, a `Registration details` result with VIN and expiry but no `Status` label could still return `ok: true`, leaving downstream classification to infer risk from incomplete official data. Requiring a parsed registration status keeps changed or partial QLD markup in the `parse_error` fallback path instead of presenting an incomplete result as successful.

## Test notes

- RED: `node --test --test-name-pattern "qld official parser requires registration status" tests/qld-rego-parser.test.mjs` — FAIL as expected before the production change with `true !== false` on `response.ok`.
- GREEN focused: `node --test --test-name-pattern "qld official parser requires registration status" tests/qld-rego-parser.test.mjs` — PASS after `parseResult()` returned `null` when parsed details have no `registrationStatus`.
- Affected-file check: `node --test tests/qld-rego-parser.test.mjs tests/qld-rego-official-cache.test.mjs` — PASS (8 tests), confirming the missing-expiry and missing-VIN parser guards plus existing official-cache/error behaviours still agree.

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (47 tests).
- `npm run build` — PASS; Next production build compiled and generated 70 static pages.
- `BASE_URL=http://127.0.0.1:3248 node scripts/rego-api-smoke.mjs` — PASS after starting `./node_modules/.bin/next start -p 3248` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including `BAD!!` returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 11 minutes (13:05–13:16 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
