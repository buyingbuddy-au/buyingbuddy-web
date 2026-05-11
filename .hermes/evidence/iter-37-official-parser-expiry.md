# Iteration 37 — Phase 2 — QLD official parser missing-expiry guard

- Iteration: 37
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T12:34:31+10:00
- Objective picked:
  > [NEXT] `src/lib/qld-rego/official.ts:73-85` + new `tests/qld-rego-parser.test.mjs` — Add fixture test named `qld official parser requires registration expiry`; feed a `Registration details` result body with `Status` = `CURRENT` but no `Expiry` label through a narrow parser helper or `runQldOfficialRegoCheck()` fetch mock, and assert the official lookup returns `ok: false`, `status: "parse_error"` instead of a successful result with unknown expiry.

## Files changed

- src/lib/qld-rego/official.ts
- tests/qld-rego-parser.test.mjs
- .hermes/evidence/iter-37-official-parser-expiry.md
- .hermes/LEARNED.md

## Why this matters

`runQldOfficialRegoCheck()` is the upstream boundary that turns QLD Transport HTML into the data the route and UI trust. Before this change, a `Registration details` page with a `CURRENT` status but no `Expiry` label still produced an `ok: true` response with `data.expiry` missing, leaving the route to present an official-looking result from incomplete source data. Treating missing expiry as `parse_error` keeps changed or partial QLD markup out of the successful response path and asks for a safer retry/manual path instead.

## Test notes

- RED: `node --test --test-name-pattern "qld official parser requires registration expiry" tests/qld-rego-parser.test.mjs` — FAIL as expected before the production change with `true !== false` on `response.ok`.
- GREEN focused: `node --test --test-name-pattern "qld official parser requires registration expiry" tests/qld-rego-parser.test.mjs` — PASS after `parseResult()` returned `null` when the parsed details have no expiry.
- Affected-file check: `node --test tests/qld-rego-parser.test.mjs tests/qld-rego-official-cache.test.mjs` — PASS (6 tests), confirming the new parser fixture and existing official-cache/error behaviours still agree.

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (45 tests).
- `npm run build` — PASS; Next production build compiled and generated 70 static pages.
- `BASE_URL=http://127.0.0.1:3246 node scripts/rego-api-smoke.mjs` — PASS after starting `./node_modules/.bin/next start -p 3246` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including `BAD!!` returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 11 minutes (12:23–12:34 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
