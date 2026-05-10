# Iteration 21 — Phase 2 — rego capture invalid rego envelope

- Iteration: 21
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T08:02:00+10:00
- Objective picked:
  > [NEXT] `src/app/api/rego/capture/route.ts:119-124` + `tests/rego-capture-route.test.mjs` — Add route-handler test named `rego capture invalid string rego returns stable input envelope`; post `{ rego: "!!", email: "buyer@example.com" }`, assert HTTP 400 `input_error`/`invalid_rego`, `checkedAt`, `retryable: false`, and zero email sends before routing `validateQldRego()` failures through `inputErrorResponse()` instead of the legacy `{ ok: false, error }` body.

## Files changed

- src/app/api/rego/capture/route.ts
- tests/rego-capture-route.test.mjs
- .hermes/evidence/iter-21-capture-invalid-rego-envelope.md
- .hermes/LEARNED.md

## Why this matters

`/api/rego/capture` had a split contract for bad rego input: non-string values used the stable `input_error` envelope, but string values that failed `validateQldRego()` still returned only `{ ok: false, error }`. That made client handling depend on the exact bad-input shape and omitted `checkedAt`/`retryable` from one branch of the same endpoint. This iteration routes validation failures through the existing input-error helper and keeps invalid string plates from triggering email sends.

## Test notes

- RED: `node --test --test-name-pattern "rego capture invalid string rego returns stable input envelope" tests/rego-capture-route.test.mjs` — FAIL as expected before the route change (`undefined !== "input_error"`) because the legacy branch had no `status` field.
- GREEN focused: `node --test --test-name-pattern "rego capture invalid string rego returns stable input envelope" tests/rego-capture-route.test.mjs` — PASS after routing `validateQldRego()` failures through `inputErrorResponse("invalid_rego", validation.error)`.
- Affected file check: `node --test tests/rego-capture-route.test.mjs` — PASS (6 tests).

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (30 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3230 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3230` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 11 minutes.

## Token usage estimate

Not available from this CLI run.
