# Iteration 38 — Phase 2 — QLD official parser missing-VIN guard

- Iteration: 38
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T12:56:57+10:00
- Objective picked:
  > [NEXT] `src/lib/qld-rego/official.ts:73-86` + `tests/qld-rego-parser.test.mjs` — Add fixture test named `qld official parser requires VIN`; feed a `Registration details` result body with `Status` = `CURRENT` and a valid `Expiry` but no `Vehicle Identification Number (VIN)` label through `runQldOfficialRegoCheck()` fetch mock, and assert `ok: false`, `status: "parse_error"` instead of a successful result with unknown VIN.

## Files changed

- src/lib/qld-rego/official.ts
- tests/qld-rego-parser.test.mjs
- .hermes/evidence/iter-38-official-parser-vin.md
- .hermes/LEARNED.md

## Why this matters

`runQldOfficialRegoCheck()` is the trusted upstream parser for QLD Transport HTML, so a successful response should only be returned when the identifying fields needed for buyer follow-up are present. Before this change, a `Registration details` page with `CURRENT` status and a valid expiry but no VIN still returned `ok: true`, leaving the UI with an official-looking result built from incomplete source data. Requiring VIN moves changed or partial QLD markup into the existing `parse_error` path, where the buyer can fall back to manual follow-up instead of trusting a half-parsed result.

## Test notes

- RED: `node --test --test-name-pattern "qld official parser requires VIN" tests/qld-rego-parser.test.mjs` — FAIL as expected before the production change with `true !== false` on `response.ok`.
- GREEN focused: `node --test --test-name-pattern "qld official parser requires VIN" tests/qld-rego-parser.test.mjs` — PASS after `parseResult()` returned `null` when parsed details have no VIN.
- Affected-file check: `node --test tests/qld-rego-parser.test.mjs tests/qld-rego-official-cache.test.mjs` — PASS (7 tests), confirming the missing-expiry parser guard and existing official-cache/error behaviours still agree.

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (46 tests).
- `npm run build` — PASS; Next production build compiled and generated 70 static pages.
- `BASE_URL=http://127.0.0.1:3247 node scripts/rego-api-smoke.mjs` — PASS after starting `./node_modules/.bin/next start -p 3247` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including `BAD!!` returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 14 minutes (12:42–12:56 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
