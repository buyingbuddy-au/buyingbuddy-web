# Iteration 27 — Phase 2 — rego capture route catch envelope

- Iteration: 27
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T09:38:51+10:00
- Objective picked:
  > [NEXT] `src/app/api/rego/capture/route.ts:219-220` + `tests/rego-capture-route.test.mjs` — Add route-handler test named `rego capture route catch returns stable error envelope`; extend the route-test normalise mock to throw `new Error("boom secret/path")`, assert HTTP 500 returns stable `status`, `error`, `userMessage`, `checkedAt`, and `retryable: false` without public `boom` or `secret/path`, then replace the legacy catch-all `{ ok, error }` body.

## Files changed

- src/app/api/rego/capture/route.ts
- tests/rego-capture-route.test.mjs
- .hermes/evidence/iter-27-capture-route-catch-envelope.md
- .hermes/LEARNED.md

## Why this matters

`/api/rego/capture` had stable envelopes for input, rate-limit, and provider failures, but its outer catch-all still returned the old `{ ok, error }` body. If validation or another unexpected route dependency threw, clients saw a different response shape with no `status`, `checkedAt`, or `retryable` fields. This iteration keeps the raw exception server-side, returns a stable `route_unhandled` envelope, and proves the public payload does not leak thrown text such as `boom secret/path`.

## Test notes

- RED: `node --test --test-name-pattern "rego capture route catch returns stable error envelope" tests/rego-capture-route.test.mjs` — FAIL as expected before the route change (`payload.status` was `undefined` instead of `"error"`) because the route catch still returned the legacy body.
- GREEN focused: `node --test --test-name-pattern "rego capture route catch returns stable error envelope" tests/rego-capture-route.test.mjs` — PASS after adding `routeUnhandledResponse()` and returning it from the catch-all.
- Affected file check: `node --test tests/rego-capture-route.test.mjs` — PASS (12 tests).

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (36 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3236 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3236` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 16 minutes.

## Token usage estimate

Not available from this CLI run.
