# Iteration 41 — Phase 2 — QLD official parser happy-path success cap

- Iteration: 41
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T14:02:35+10:00
- Objective picked:
  > [NEXT] `tests/qld-rego-parser.test.mjs` — Add fixture test named `qld official parser parses successful registration details`; feed a complete `Registration details` body and assert `ok: true`, `status: "success"`, `source: "qld-transport-check-rego"`, plus `data.vin`, `data.expiry`, and `data.registrationStatus` so the label-value guard does not regress the happy path.

## Files changed

- tests/qld-rego-parser.test.mjs
- .hermes/evidence/iter-41-official-parser-success.md
- .hermes/LEARNED.md

## Why this matters

The last four parser iterations hardened malformed or partial QLD Transport result pages, but the new guard cluster had no direct success-path fixture. This test locks the inverse contract: a complete `Registration details` page must still return a successful official lookup with the expected source and core identity fields. That keeps future parser tightening from accidentally turning valid upstream markup into a manual `parse_error` fallback.

## Test notes

- Initial focused run: `node --test --test-name-pattern "qld official parser parses successful registration details" tests/qld-rego-parser.test.mjs` — PASS immediately, confirming current production behaviour already handles the complete fixture.
- Mutation RED guard: temporarily changed `src/lib/qld-rego/official.ts` so parsed VIN was `undefined`, then reran the focused test — FAIL as expected with `false !== true` on `response.ok`. Reverted the mutation immediately; no production source change remains.
- GREEN focused: `node --test --test-name-pattern "qld official parser parses successful registration details" tests/qld-rego-parser.test.mjs` — PASS after reverting the mutation.
- Affected-file check: `node --test tests/qld-rego-parser.test.mjs tests/qld-rego-official-cache.test.mjs` — PASS (10 tests), confirming parser failure fixtures, the new success fixture, cache behaviour, busy response metadata, and low-level official-failure behaviours still agree.

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (49 tests).
- `npm run build` — PASS; Next production build compiled and generated 70 static pages.
- `BASE_URL=http://127.0.0.1:3250 node scripts/rego-api-smoke.mjs` — PASS after starting `./node_modules/.bin/next start -p 3250` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including `BAD!!` returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 14 minutes (13:48–14:02 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
