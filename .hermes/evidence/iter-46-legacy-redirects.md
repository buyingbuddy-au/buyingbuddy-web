# Iteration 46 — Phase 3 — Legacy redirect QA harness

- Iteration: 46
- Phase: Phase 3 — Stage 7 QA harness
- Timestamp: 2026-05-11T15:51:46+10:00
- Objective picked:
  > [NEXT] Add legacy redirect smoke tests for `/buddy`, `/ppi`, and `/car-buyers-agent-pullenvale` — verify status/location against `src/app/buddy/page.tsx:8-9`, `src/app/ppi/page.tsx:8-9`, and `src/app/car-buyers-agent-pullenvale/page.tsx:8-9`. (from A2-surface-inventory.md)

## Files changed

- tests/legacy-redirect.test.mjs
- .hermes/evidence/iter-46-legacy-redirects.md
- .hermes/LEARNED.md

## Why this matters

The legacy `/buddy`, `/ppi`, and `/car-buyers-agent-pullenvale` surfaces are explicitly parked or out of launch scope, so they must not silently become public destinations again. This Stage 7 test compiles the three legacy App Router pages, executes their default exports, and inspects Next's `NEXT_REDIRECT` digest so it verifies both destination and temporary redirect status. It gives the public-surface cleanup a fast regression tripwire without starting a Next server or touching production routes.

## Test notes

- Initial focused run: `node --test --test-name-pattern "legacy routes redirect to approved replacements" tests/legacy-redirect.test.mjs` — FAIL due to harness recursion (`Maximum call stack size exceeded`) when `next/navigation` was required from inside the `Module._load` shim. Fixed by preloading `next/navigation` before installing the shim.
- Mutation RED guard: temporarily changed the new test's `/buddy` expected target from `/check` to `/not-check`; reran the same focused command — FAIL as expected with actual `{ location: "/check", status: 307, type: "replace" }` vs expected `/not-check`. Reverted the mutation immediately.
- GREEN focused + affected-file check: `node --test --test-name-pattern "legacy routes redirect to approved replacements" tests/legacy-redirect.test.mjs && node --test tests/legacy-redirect.test.mjs` — PASS (focused test, then full new test file).

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (54 tests).
- `npm run build` — PASS; Next production build compiled successfully and generated 70 static pages.
- `node scripts/rego-api-smoke.mjs` — Not run; this iteration changed only a Stage 7 redirect test and did not touch rego production code, rego tests, or `scripts/rego-api-smoke.mjs`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 15 minutes (15:37–15:52 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
