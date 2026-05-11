# Iteration 34 — Phase 2 — rego check parse-error HTTP coverage

- Iteration: 34
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T11:35:04+10:00
- Objective picked:
  > [NEXT] `tests/rego-check-route.test.mjs` — Add route-handler test named `rego check parse-error response returns 502`; mock `runQldOfficialRegoCheck()` to return `status: "parse_error"` and assert HTTP 502 plus one lookup call so `STATUS_TO_HTTP.parse_error` is covered.

## Files changed

- tests/rego-check-route.test.mjs
- .hermes/evidence/iter-34-parse-error-http-502.md
- .hermes/LEARNED.md

## Why this matters

`STATUS_TO_HTTP` is now the public boundary between lower-level QLD rego lookup failures and the API response clients see. The `parse_error` branch represents an upstream/HTML parsing failure, not a buyer input problem, so it must remain a 502 server-side failure instead of drifting to 4xx or timeout semantics. This test locks the mapping at the route-handler boundary and asserts the valid request still reaches the mocked QLD lookup exactly once.

## Test notes

- Initial focused run: `node --test --test-name-pattern "rego check parse-error response returns 502" tests/rego-check-route.test.mjs` — PASS immediately because `STATUS_TO_HTTP.parse_error` already mapped to 502.
- Mutation RED guard: temporarily changed `src/app/api/rego/check/route.ts` from `parse_error: 502` to `parse_error: 504`, then reran the focused test — FAIL as expected with `504 !== 502`. The temporary mutation was reverted before GREEN/gates.
- GREEN focused + affected file check: `node --test --test-name-pattern "rego check parse-error response returns 502" tests/rego-check-route.test.mjs && node --test tests/rego-check-route.test.mjs` — PASS; focused test passed and the full rego-check route file passed 13 tests.

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (42 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3243 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3243` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 12 minutes (11:23–11:35 Australia/Brisbane local).

## Token usage estimate

Not available from this CLI run.
