# Iteration 35 — Phase 2 — expired current rego classification coverage

- Iteration: 35
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T11:53:54+10:00
- Objective picked:
  > [NEXT] `src/lib/qld-rego/education.ts:81-90` + `tests/qld-rego-education.test.mjs` — Add unit test named `classifyQldRego stops expired current registrations`; stub `Date.now()` after an expired `expiry` date, pass a `registrationStatus: "CURRENT"` fixture, and assert `classifyQldRego()` returns `"stop"` before any broader education-table coverage.

## Files changed

- tests/qld-rego-education.test.mjs
- .hermes/evidence/iter-35-qld-rego-expired-current.md
- .hermes/LEARNED.md

## Why this matters

`classifyQldRego()` drives the buyer-facing pass/watch/stop signal from the QLD rego result. A vehicle can still say `CURRENT` while the expiry date has passed relative to the request time, and that should be a stop signal rather than being softened into a near-expiry watch. This regression locks the expired-current branch before expanding broader education-table coverage.

## Test notes

- Initial focused run: `node --test --test-name-pattern "classifyQldRego stops expired current registrations" tests/qld-rego-education.test.mjs` — PASS immediately because `classifyQldRego()` already returned `"stop"` for `days < 0`.
- Mutation RED guard: temporarily changed `src/lib/qld-rego/education.ts` from `if (days < 0) return "stop";` to `if (days < -999) return "stop";`, reran the focused test, and got the expected failure: `'watch' !== 'stop'`. The temporary mutation was reverted before GREEN/gates.
- GREEN focused + affected file check: `node --test --test-name-pattern "classifyQldRego stops expired current registrations" tests/qld-rego-education.test.mjs && node --test tests/qld-rego-education.test.mjs` — PASS; the focused test and the full new education test file both passed.

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (43 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3244 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3244` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 12 minutes (11:42–11:54 Australia/Brisbane local).

## Token usage estimate

Not available from this CLI run.
