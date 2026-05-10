# Iteration 15 — Phase 2 — rego no-result HTTP status

- Iteration: 15
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T05:59:27+10:00
- Objective picked:
  > [NEXT] `src/app/api/rego/check/route.ts:112-120` + `tests/rego-check-route.test.mjs` — Add route-handler test named `rego check no-result response returns 404 not 502`; mock `runQldOfficialRegoCheck()` to return `status: "no_result"` and assert HTTP 404 before adding an explicit `no_result` status-code branch ahead of the 502 fallback. (added by iter 14)

## Files changed

- src/app/api/rego/check/route.ts
- tests/rego-check-route.test.mjs
- .hermes/evidence/iter-15-no-result-404.md
- .hermes/LEARNED.md

## Why this matters

A QLD lookup that completes but finds no registration record is a buyer/input outcome, not an upstream technical failure. Returning HTTP 404 makes that distinction clear to clients, monitoring, and smoke checks while preserving the existing stable JSON body (`status: "no_result"`). The regression locks the route mapping so future catch-all/fallback work does not accidentally turn a valid no-result branch back into a 502.

## Test notes

- RED: `node --test --test-name-pattern "rego check no-result response returns 404 not 502" tests/rego-check-route.test.mjs` — FAIL as expected before the route change (`502 !== 404`).
- GREEN focused: `node --test --test-name-pattern "rego check no-result response returns 404 not 502" tests/rego-check-route.test.mjs` — PASS after adding the explicit `no_result` → 404 route status branch.
- Affected file check: `node --test tests/rego-check-route.test.mjs` — PASS (10 tests).

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (24 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3224 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3224` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case now returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 11 minutes.

## Token usage estimate

Not available from this CLI run.
