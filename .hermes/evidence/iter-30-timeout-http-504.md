# Iteration 30 — Phase 2 — rego check timeout HTTP coverage

- Iteration: 30
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T10:24:57+10:00
- Objective picked:
  > [NEXT] `tests/rego-check-route.test.mjs` — Add route-handler test named `rego check timeout response returns 504`; mock `runQldOfficialRegoCheck()` to return `status: "timeout"` and assert HTTP 504 plus one lookup call so `STATUS_TO_HTTP.timeout` is covered.

## Files changed

- tests/rego-check-route.test.mjs
- .hermes/evidence/iter-30-timeout-http-504.md
- .hermes/LEARNED.md

## Why this matters

Iteration 29 made the rego-check status-to-HTTP mapping explicit, but the `timeout -> 504` entry was not directly covered by a route-handler regression. This iteration adds that focused coverage so future edits to `STATUS_TO_HTTP.timeout` fail loudly instead of silently downgrading a QLD timeout into a generic upstream error. The test also asserts a valid timeout payload reaches the mocked QLD lookup exactly once, preserving the behaviour boundary between input rejection and external lookup failures.

## Test notes

- Initial focused check after adding the test: `node --test --test-name-pattern "rego check timeout response returns 504" tests/rego-check-route.test.mjs` — PASS because Iteration 29 had already added `STATUS_TO_HTTP.timeout = 504` without direct coverage.
- Mutation RED guard: temporarily changed `STATUS_TO_HTTP.timeout` from `504` to `502`, then ran `node --test --test-name-pattern "rego check timeout response returns 504" tests/rego-check-route.test.mjs` — FAIL as expected (`502 !== 504`). The temporary mutation was reverted before gates.
- GREEN focused + affected file check: `node --test --test-name-pattern "rego check timeout response returns 504" tests/rego-check-route.test.mjs && node --test tests/rego-check-route.test.mjs` — PASS; focused test passed and the full rego-check route file passed 11 tests.

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (38 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3239 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3239` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 10 minutes.

## Token usage estimate

Not available from this CLI run.
