# Iteration 29 — Phase 2 — rego check status HTTP map

- Iteration: 29
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T10:09:45+10:00
- Objective picked:
  > [NEXT] `src/app/api/rego/check/route.ts:112-122` — Flatten the status-to-HTTP nested ternary into a `const STATUS_TO_HTTP` lookup before adding any further rego-check status branches; existing route tests should lock `busy`, `invalid`, `no_result`, and fallback mappings.

## Files changed

- src/app/api/rego/check/route.ts
- .hermes/evidence/iter-29-status-http-map.md
- .hermes/LEARNED.md

## Why this matters

The rego-check route's nested status ternary had grown to five branches, making every future status addition harder to review and easier to misread. This iteration keeps public behaviour unchanged while moving the mapping into a typed `STATUS_TO_HTTP` table keyed by `QldRegoCheckFailure["status"]`, so future failure statuses force an explicit HTTP mapping at typecheck time. The existing route-handler tests continue to exercise the key public mappings (`not_qld`/input rejection, `busy`, `no_result`, and catch/fallback 502) after the refactor.

## Test notes

- Baseline guard before refactor: `node --test tests/rego-check-route.test.mjs` — PASS (10 tests). This was a refactor-only objective with no new behaviour; no new RED test was added because the picked NEXT explicitly said existing route tests should lock the mappings.
- Focused guard after refactor: `node --test tests/rego-check-route.test.mjs` — PASS (10 tests) after replacing the nested ternary with `STATUS_TO_HTTP`.

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (37 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3238 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3238` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 10 minutes.

## Token usage estimate

Not available from this CLI run.
