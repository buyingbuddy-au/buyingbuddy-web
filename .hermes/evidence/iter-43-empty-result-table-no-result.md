# Iteration 43 — Phase 2 — QLD official parser empty-result-table no-result handling

- Iteration: 43
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T14:43:56+10:00
- Objective picked:
  > [NEXT] `src/lib/qld-rego/official.ts:98-106` (`looksLikeNoResult`) + `tests/qld-rego-parser.test.mjs` — Add fixture test named `qld official parser detects empty result table as no_result`; feed a result-page HTML body with the search/result shell but no `Registration details` heading and no explicit error banner, assert `ok: false`, `status: "no_result"`, `error: "no_official_result"`, `retryable: false`, and two fetch calls before extending `looksLikeNoResult()` if needed.

## Files changed

- src/lib/qld-rego/official.ts
- tests/qld-rego-parser.test.mjs
- .hermes/evidence/iter-43-empty-result-table-no-result.md
- .hermes/LEARNED.md

## Why this matters

`runQldOfficialRegoCheck()` already distinguished explicit upstream “not found” messages from parser failures, but an empty QLD result table with no banner still fell through as `parse_error`. That makes a legitimate no-match response look like a broken parser/manual-check problem. This iteration keeps the temporary/manual `parse_error` path for genuinely unreadable markup while mapping the empty-table no-record shape to the stable buyer-facing `no_result` contract.

## Test notes

- RED: `node --test --test-name-pattern "qld official parser detects empty result table as no_result" tests/qld-rego-parser.test.mjs` — FAIL as expected before the production change with actual `status: "parse_error"` instead of expected `"no_result"`.
- GREEN focused: `node --test --test-name-pattern "qld official parser detects empty result table as no_result" tests/qld-rego-parser.test.mjs` — PASS after extending `looksLikeNoResult()` to recognise an empty result table shell.
- Affected-file check: `node --test tests/qld-rego-parser.test.mjs tests/qld-rego-official-cache.test.mjs` — PASS (12 tests), covering parser required-field fixtures, the upstream-503 branch, the new empty-result-table branch, success fixture, no-result cache, parse-error cache behaviour, busy metadata, and thrown-fetch fallback.

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (51 tests).
- `npm run build` — PASS; Next production build compiled successfully and generated 70 static pages.
- `BASE_URL=http://127.0.0.1:3252 node scripts/rego-api-smoke.mjs` — PASS after starting `./node_modules/.bin/next start -p 3252` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including `BAD!!` returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 13 minutes (14:31–14:44 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
