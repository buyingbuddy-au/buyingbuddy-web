# Iteration 45 — Phase 2 — QLD rego text-month expiry classification

- Iteration: 45
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T15:25:59+10:00
- Objective picked:
  > [NEXT] `src/lib/qld-rego/education.ts:75-78` + `tests/qld-rego-education.test.mjs` — Add unit test named `classifyQldRego parses text-month expiry dates`; freeze `Date.now` to 2027-01-15, classify CURRENT/PRIVATE with `expiry: "1 Feb 2027"`, assert `"watch"` before extending `parseQldDate()` to accept `d MMM yyyy`.

## Files changed

- src/lib/qld-rego/education.ts
- tests/qld-rego-education.test.mjs
- .hermes/evidence/iter-45-text-month-expiry.md
- .hermes/LEARNED.md

## Why this matters

Iteration 36 made unparseable expiry strings fail safely as `stop`, which is correct for malformed data but makes date-format tolerance safety-critical. If QLD Transport returns a legitimate text-month expiry such as `1 Feb 2027`, treating it as unparseable would wrongly downgrade a current private registration to a stop signal. This iteration keeps malformed/unknown dates conservative while allowing the common `d MMM yyyy` format to continue through the normal expiry-window classification.

## Test notes

- RED: `node --test --test-name-pattern "classifyQldRego parses text-month expiry dates" tests/qld-rego-education.test.mjs` — FAIL as expected before the production change with actual `"stop"` vs expected `"watch"`.
- GREEN focused + affected-file check: `node --test --test-name-pattern "classifyQldRego parses text-month expiry dates" tests/qld-rego-education.test.mjs && node --test tests/qld-rego-education.test.mjs` — PASS (focused test, then 4 education tests).

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (53 tests).
- `npm run build` — PASS; Next production build compiled successfully and generated 70 static pages.
- `BASE_URL=http://127.0.0.1:3254 node scripts/rego-api-smoke.mjs` — PASS after starting `./node_modules/.bin/next start -p 3254` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including `BAD!!` returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 13 minutes (15:13–15:26 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
