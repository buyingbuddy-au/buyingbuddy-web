# Iteration 17 — Phase 2 — rego capture malformed JSON

- Iteration: 17
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T06:43:01+10:00
- Objective picked:
  > [NEXT] `src/app/api/rego/capture/route.ts:33-40` + `tests/rego-capture-route.test.mjs` — Add route-handler test named `rego capture rejects malformed JSON`; assert malformed JSON returns HTTP 400 with a stable input-error envelope before adding a runtime parser that handles `request.json()` failures outside the catch-all 500 branch. (carried forward by iter 16)

## Files changed

- src/app/api/rego/capture/route.ts
- tests/rego-capture-route.test.mjs
- .hermes/evidence/iter-17-capture-malformed-json.md
- .hermes/LEARNED.md

## Why this matters

Malformed JSON previously fell through the capture route's catch-all branch and returned HTTP 500, even though the caller made a bad request. The new parser catches only the JSON-read failure path and returns the same stable input-error envelope shape used by the check route: `status`, `error`, `userMessage`, `checkedAt`, and `retryable`. That prevents noisy server-error monitoring and makes the fallback email capture API safer for clients to handle without expanding the route's validation scope beyond this iteration.

## Test notes

- RED: `node --test --test-name-pattern "rego capture rejects malformed JSON" tests/rego-capture-route.test.mjs` — FAIL as expected before the route change (`500 !== 400`) and logged the JSON parse exception from the catch-all branch.
- GREEN focused: `node --test --test-name-pattern "rego capture rejects malformed JSON" tests/rego-capture-route.test.mjs` — PASS after adding `parseRegoCaptureRequest()` and `inputErrorResponse()`.
- Affected file check: `node --test tests/rego-capture-route.test.mjs` — PASS (2 tests).

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (26 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3226 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3226` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 12 minutes.

## Token usage estimate

Not available from this CLI run.
