# Iteration 44 — Phase 2 — QLD rego zero-padded expiry classification

- Iteration: 44
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T15:05:31+10:00
- Objective picked:
  > [NEXT] `src/lib/qld-rego/education.ts:75-86` + `tests/qld-rego-education.test.mjs` — Add unit test named `classifyQldRego parses zero-padded expiry dates`; freeze `Date.now` to 2027-01-15, classify CURRENT/PRIVATE with `expiry: "01/02/2027"`, assert `"watch"` (not `"stop"`), and use a temporary regex mutation RED guard if current code already passes.

## Files changed

- tests/qld-rego-education.test.mjs
- .hermes/evidence/iter-44-zero-padded-expiry.md
- .hermes/LEARNED.md

## Why this matters

Iteration 36 made unparseable expiry strings fail safely as `stop`, which is good for malformed data but risky if QLD sends a legitimate date format the parser already should accept. This regression test locks the common zero-padded `dd/mm/yyyy` form so a future regex tightening cannot accidentally downgrade valid current private registrations to `stop`. It keeps the safety-first unparseable-date behaviour while proving the normal QLD slash-date variant still flows through to the expiry-window classification.

## Test notes

- Initial focused run: `node --test --test-name-pattern "classifyQldRego parses zero-padded expiry dates" tests/qld-rego-education.test.mjs` — PASS immediately, confirming current production code already parses `01/02/2027`.
- Mutation RED guard: temporarily changed `parseQldDate()` from `\d{1,2}` slash components to non-zero-leading `[1-9]\d?`; reran the focused test — FAIL as expected with actual `"stop"` vs expected `"watch"`. Reverted the mutation immediately.
- GREEN focused + affected-file check: `node --test --test-name-pattern "classifyQldRego parses zero-padded expiry dates" tests/qld-rego-education.test.mjs && node --test tests/qld-rego-education.test.mjs` — PASS (focused test, then 3 education tests).

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (52 tests).
- `npm run build` — PASS; Next production build compiled successfully and generated 70 static pages.
- `BASE_URL=http://127.0.0.1:3253 node scripts/rego-api-smoke.mjs` — PASS after starting `./node_modules/.bin/next start -p 3253` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including `BAD!!` returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 12 minutes (14:53–15:05 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
