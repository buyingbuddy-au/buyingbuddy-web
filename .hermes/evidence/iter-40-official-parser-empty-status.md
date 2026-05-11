# Iteration 40 — Phase 2 — QLD official parser empty-status guard

- Iteration: 40
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T13:36:28+10:00
- Objective picked:
  > [NEXT] `src/lib/qld-rego/official.ts:68-87` + `tests/qld-rego-parser.test.mjs` — Add fixture test named `qld official parser rejects empty registration status value`; feed a `Status` label with no value immediately before the `Expiry` label, assert `ok: false`, `status: "parse_error"`, then update the parser so `lineAfter()` cannot treat another known label as a field value.

## Files changed

- src/lib/qld-rego/official.ts
- tests/qld-rego-parser.test.mjs
- .hermes/evidence/iter-40-official-parser-empty-status.md
- .hermes/LEARNED.md

## Why this matters

`runQldOfficialRegoCheck()` turns QLD Transport HTML into the official-looking result shown to buyers. Before this change, a blank `Status` row immediately followed by the `Expiry` label could be parsed as `registrationStatus: "Expiry"`, allowing incomplete upstream markup to reach the success path. Treating adjacent known labels as missing field values keeps malformed or changed QLD result pages in the existing `parse_error` fallback path instead of presenting a misleading successful rego result.

## Test notes

- RED: `node --test --test-name-pattern "qld official parser rejects empty registration status value" tests/qld-rego-parser.test.mjs` — FAIL as expected before the production change with `true !== false` on `response.ok`.
- GREEN focused: `node --test --test-name-pattern "qld official parser rejects empty registration status value" tests/qld-rego-parser.test.mjs` — PASS after `lineAfter()` returned `undefined` when the candidate value is another known result label.
- Affected-file check: `node --test tests/qld-rego-parser.test.mjs tests/qld-rego-official-cache.test.mjs` — PASS (9 tests), confirming the missing-expiry, missing-VIN, missing-status, cache, busy, and low-level official-failure behaviours still agree.

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (48 tests).
- `npm run build` — PASS; Next production build compiled and generated 70 static pages.
- `BASE_URL=http://127.0.0.1:3249 node scripts/rego-api-smoke.mjs` — PASS after starting `./node_modules/.bin/next start -p 3249` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including `BAD!!` returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 10 minutes (13:26–13:36 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
