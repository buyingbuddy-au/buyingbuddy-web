# Iteration 36 — Phase 2 — unparseable QLD rego expiry classification

- Iteration: 36
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T12:14:44+10:00
- Objective picked:
  > [NEXT] `src/lib/qld-rego/education.ts:81-95` + `tests/qld-rego-education.test.mjs` — **Lock the behaviour when `parseQldDate(data.expiry)` returns `null` on a CURRENT registration.** Today `parseQldDate` accepts only `d/m/yyyy`; an upstream parser shift to ISO (`2026-01-14`), a missing `expiry`, or any malformed string returns `null`, skipping the days check entirely. A CURRENT private registration with unparseable expiry then falls through to `"pass"` — silently treating an unknown-expiry car as a clean signal. Test name: `classifyQldRego treats unparseable expiry as stop` (or whichever direction Jordan picks; `"stop"` is the safer default). Pass `{ registrationStatus: "CURRENT", purpose: "PRIVATE", expiry: "2026-01-14" }` (ISO format, deliberately unparseable by `parseQldDate`) and assert the classification. **This is the real defensive gap iter 35 was *next to* but did not address.** Behavioural test against an actual silent-fallthrough, not coverage of an already-correct branch. (added by Claude review)

## Files changed

- src/lib/qld-rego/education.ts
- tests/qld-rego-education.test.mjs
- .hermes/evidence/iter-36-unparseable-expiry-stop.md
- .hermes/LEARNED.md

## Why this matters

`classifyQldRego()` is the final safety classification for a successful QLD rego lookup. Before this change, a `CURRENT` private registration with an expiry string the local parser could not read — for example an ISO date from an upstream markup change — skipped the expiry checks and returned `"pass"`. Treating unknown or malformed expiry data as `"stop"` is safer because the buyer should not get a clean signal when the expiry date is untrusted.

## Test notes

- RED: `node --test --test-name-pattern "classifyQldRego treats unparseable expiry as stop" tests/qld-rego-education.test.mjs` — FAIL as expected before the production change with `'pass' !== 'stop'`.
- GREEN focused + affected file check: `node --test --test-name-pattern "classifyQldRego treats unparseable expiry as stop" tests/qld-rego-education.test.mjs && node --test tests/qld-rego-education.test.mjs` — PASS; focused test passed and the full education test file passed 2 tests.

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (44 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3245 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3245` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 11 minutes (12:04–12:15 Australia/Brisbane local).

## Token usage estimate

Not available from this CLI run.
