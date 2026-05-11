# Iteration 42 — Phase 2 — QLD official parser upstream 503 handling

- Iteration: 42
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T14:22:31+10:00
- Objective picked:
  > [NEXT] `src/lib/qld-rego/official.ts:249-264` HTTP-status handling + `tests/qld-rego-parser.test.mjs` — Add fixture test named `qld official parser maps upstream 503 to official_unavailable`; mock the second fetch/result-page response as `new Response("Service Unavailable", { status: 503 })` and assert `ok: false`, `status: "official_unavailable"`, a stable `error` code, a non-empty `userMessage`, `retryable: true`, and two fetch calls before adding explicit non-2xx result-page handling ahead of `parseResult()`.

## Files changed

- src/lib/qld-rego/official.ts
- tests/qld-rego-parser.test.mjs
- .hermes/evidence/iter-42-official-parser-upstream-503.md
- .hermes/LEARNED.md

## Why this matters

`runQldOfficialRegoCheck()` previously treated an upstream QLD Transport 503 result-page response as a generic parse failure because it tried to parse the error body as HTML. That blurred a temporary upstream outage with a markup-change/parser problem. Mapping non-2xx result-page responses to `official_unavailable` gives the route a clearer, retryable failure contract while preserving the existing parse-error path for real unreadable result HTML.

## Test notes

- RED: `node --test --test-name-pattern "qld official parser maps upstream 503 to official_unavailable" tests/qld-rego-parser.test.mjs` — FAIL as expected before the production change with actual `status: "parse_error"` instead of expected `"official_unavailable"`.
- GREEN focused: `node --test --test-name-pattern "qld official parser maps upstream 503 to official_unavailable" tests/qld-rego-parser.test.mjs` — PASS after adding explicit non-2xx result-page handling before `parseResult()`.
- Affected-file check: `node --test tests/qld-rego-parser.test.mjs tests/qld-rego-official-cache.test.mjs` — PASS (11 tests), covering parser malformed-field fixtures, the new upstream-503 branch, success fixture, no-result cache, parse-error cache behaviour, busy metadata, and thrown-fetch fallback.

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (50 tests).
- `npm run build` — PASS; Next production build compiled successfully and generated 70 static pages.
- `BASE_URL=http://127.0.0.1:3251 node scripts/rego-api-smoke.mjs` — PASS after starting `./node_modules/.bin/next start -p 3251`, retrying readiness after one initial connection-refused check, and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including `BAD!!` returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 12 minutes (14:11–14:23 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
