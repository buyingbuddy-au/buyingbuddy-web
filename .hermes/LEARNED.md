# Buying Buddy Hardening Loop — Learned Memory

This file is the loop's working memory. Every iteration reads it. Every iteration appends to it.

## Format
- [DONE] <what shipped — file path> (iter N, YYYY-MM-DD)
- [NEXT] <specific target — file/function/test> (added by iter N or audit)
- [AVOID] <wasted-time pattern> (iter N)

## Standing principles for this loop
- Stage 2 (rego) and Stage 7 (QA) only during mutation phases
- Stage 4/5/6/9 are out of scope — Jordan owns those awake
- Database is read-only; Stripe is read-only
- One change per iteration; vague NEXTs are forbidden
- Evidence files must be specific enough that the next iteration does not re-read source code already covered

## Bootstrap NEXTs (Phase 1 audits will add many more)

### Rego hardening seeds
- [NEXT] Audit src/app/api/rego/check/route.ts for input validation gaps — list every code path that can return 400, confirm each has a test
- [NEXT] Audit src/lib/qld-rego/* for response shape contracts — is there a zod schema or type-only contract?
- [NEXT] Add timestamp + source field to /api/rego/check successful response if not present
- [NEXT] Add limitations field to /api/rego/check response (what the QLD lookup does/doesn't cover)
- [NEXT] Expand scripts/rego-api-smoke.mjs — currently 2 cases, target 8+ negative cases (empty, whitespace, lowercase, hyphen, too-long, too-short, non-QLD, malformed body)
- [NEXT] Add rate-limit / pacing guard to /api/rego/check if external lookup is hit per-request — confirm via code read first

### QA harness seeds
- [NEXT] Add tests/sitemap-completeness.test.mjs — assert all 12 known public surfaces present in sitemap
- [NEXT] Add tests/route-smoke.test.mjs — HEAD request to each public route, assert 200 or expected redirect
- [NEXT] Add tests/metadata-regression.test.mjs — assert /, /rego-check, /ppsr, /check, /inspect each have title + description + canonical
- [NEXT] Add tests/checkout-whitelist.test.mjs — assert checkout API rejects unknown product slugs
- [NEXT] Add tests/legacy-redirect.test.mjs — assert /buddy → /check, /ppi → /inspect, /car-buyers-agent-pullenvale → /

### Wisdom seeded from Sprint A
- [DONE] sitemap.ts now includes /rego-check (commit 67bc73e)
- [DONE] /ppsr converted to server component with metadata (commit 67bc73e)
- [AVOID] tsconfig.tsbuildinfo dirties the working tree — Jordan will resolve manually
- [AVOID] Preflight rego-api-smoke needs a local Next server on BASE_URL/localhost:3000; raw `node scripts/rego-api-smoke.mjs` fails with ECONNREFUSED if `npm run start -- -p 3000` is not already ready

## Phase 1 audit harvest — 2026-05-11T01:17:27+10:00

- [NEXT] `src/app/api/rego/check/route.ts:8-40` — Add a runtime request parser for `POST()` that treats malformed JSON, non-object JSON, non-string `rego`, and non-string `state` as HTTP 400 `input_error` responses. Add tests named `rego check rejects malformed JSON`, `rego check rejects non-string rego`, and `rego check rejects non-string state`. (from A1-rego-api-contract.md)
- [NEXT] `src/app/api/rego/capture/route.ts:33-44` — Add a runtime request parser for `POST()` that validates `rego`, `email`, and optional `reason` before `.trim()` or email sending. Add tests named `rego capture rejects malformed JSON`, `rego capture rejects non-string email`, and `rego capture rejects invalid rego`. (from A1-rego-api-contract.md)
- [NEXT] `src/app/api/rego/capture/route.ts:39-68` — Standardise capture errors to include `status`, `error`, `userMessage`, `checkedAt`, and `retryable`, matching the check route envelope. Add tests named `rego capture invalid email returns stable contract` and `rego capture provider failure returns retryable error`. (from A1-rego-api-contract.md)
- [NEXT] `src/lib/qld-rego/normalise.ts:1-25` — Decide whether validation should strip punctuation or reject it; then make the non-alphanumeric branch reachable or remove it. Add unit tests for `normaliseQldRego()` and `validateQldRego()` covering `BAD!!`, spaces, empty input, 2-char input, 7-char input, 8-char input, and longer raw input. (from A1-rego-api-contract.md)
- [DONE] `src/lib/qld-rego/official.ts:180-183` and `src/lib/qld-rego/types.ts:34-51` — Fixed the cached failure contract by adding `cached?: boolean` to `QldRegoCheckFailure`, removing the cached response cast, and adding test `runQldOfficialRegoCheck returns typed cached no-result response`. (iter 1, 2026-05-11)
- [NEXT] `src/lib/qld-rego/official.ts:243-256` — Stop caching retryable `result_parse_failed` responses for the no-result TTL, or split retryable parse-error TTL from stable no-result TTL. Add a test named `parse error is not cached as no-result`. (from A1-rego-api-contract.md)
- [NEXT] `src/lib/qld-rego/official.ts:67-90` — Add fixture-based parser tests for successful QLD HTML, no-result HTML, changed-form HTML, missing VIN, missing expiry, and unexpected label order. Use a test helper around `parseResult()` or export a narrow parser for tests. (from A1-rego-api-contract.md)
- [NEXT] `src/lib/qld-rego/education.ts:67-98` — Add unit tests for `getPurposeEducation()` and `classifyQldRego()` covering private current pass, commercial watch, dealer watch, conditional watch, expired stop, non-current stop, expiry within 30 days watch, and unknown purpose default education. (from A1-rego-api-contract.md)
- [NEXT] `src/lib/qld-rego/official.ts:163-195` — Replace process-local `hourlyHits` and `inFlight` with a shared rate limit or document that limits are per instance. Add tests named `hourly limit returns busy` and `concurrent request returns worker_busy`, and consider response headers that tell the client when to retry. (from A1-rego-api-contract.md)
- [NEXT] `src/app/api/rego/check/route.ts:54-65` and `src/lib/qld-rego/official.ts:276-280` — Stop returning raw exception messages in the public `error` field. Log the raw error server-side and return stable codes such as `route_unhandled` or `official_fetch_failed`. Add tests named `rego check route catch does not leak error message` and `official unavailable returns stable error code`. (from A1-rego-api-contract.md)
- [NEXT] Add sitemap parity assertions for `src/app/sitemap.ts:15-24` — every explicit sitemap entry maps to a route file, and legacy routes `/buddy`, `/ppi`, `/car-buyers-agent-pullenvale` are not emitted. (from A2-surface-inventory.md)
- [NEXT] Add legacy redirect smoke tests for `/buddy`, `/ppi`, and `/car-buyers-agent-pullenvale` — verify status/location against `src/app/buddy/page.tsx:8-9`, `src/app/ppi/page.tsx:8-9`, and `src/app/car-buyers-agent-pullenvale/page.tsx:8-9`. (from A2-surface-inventory.md)
- [NEXT] Add a Buddy surface guard test — fail if `/api/buddy` or `BuddyChat` remains reachable/imported from `src/app/api/buddy/route.ts` or `src/components/buddy-chat.tsx`. (from A2-surface-inventory.md)
- [NEXT] Add a PPI surface guard test — fail if blog CTAs still point to `/ppi` or if `/api/ppi` accepts submissions from `src/components/blog/editorial-blog-post-page.tsx:62-67`, `src/app/api/ppi/route.ts:14`, or `src/components/ppi-form.tsx:38`. (from A2-surface-inventory.md)
- [NEXT] Add nav/footer crawl tests — assert `src/components/app-header.tsx:6-14`, `src/components/bottom-nav.tsx:13-19`, and `src/components/site-footer.tsx:21-40` href sets contain no legacy paths. (from A2-surface-inventory.md)
- [NEXT] Add metadata coverage/drift tests — public SEO pages must have route-local metadata and no forbidden terms; current gaps include `/contact`, `/deal`, `/deal/demo`, `/inspect/print`, and `/order/success`. (from A2-surface-inventory.md)
- [NEXT] Add public demo exposure test — assert `/deal/demo` is blocked, noindexed, or intentionally test-only because `src/app/deal/demo/page.tsx:8-9` says test mode while `src/app/robots.ts:9` only disallows `/admin`, `/api/`, `/order/`. (from A2-surface-inventory.md)
- [NEXT] Add transactional/dynamic exclusion tests — `/order/success`, `/deal/[id]`, `/shared/[id]`, and admin pages must be excluded from sitemap/indexed surfaces while handling valid requests. (from A2-surface-inventory.md)
- [NEXT] Add blog dynamic + CTA harness — crawl `/blog` plus representative `/blog/[slug]`, verify `src/app/sitemap.ts:7-8` dynamic blog URLs render, and assert sidebar CTAs avoid `/ppi` in `src/components/blog/editorial-blog-post-page.tsx:55-67`. (from A2-surface-inventory.md)
- [NEXT] Add forbidden-term source/rendered-output gate — fail on `$997`, `Pullenvale`, `concierge`, standalone `Buddy`, and `PPI` except documented allowlist paths. (from A2-surface-inventory.md)
- [NEXT] Add `tests/rego-check-route.test.mjs` for `src/app/api/rego/check/route.ts` — cover malformed JSON, missing `rego`, non-string `rego`, missing/invalid `state`, and empty/whitespace plate without making external QLD calls (from A3-coverage-and-types.md)
- [NEXT] Add `tests/rego-capture-route.test.mjs` for `src/app/api/rego/capture/route.ts` — assert required lead fields, method handling, and safe failure shape when persistence/email dependencies are unavailable (from A3-coverage-and-types.md)
- [NEXT] Add `tests/qld-rego-parser.test.mjs` for `src/lib/qld-rego/*` — fixture-test private/dealer/heavy/expired/no-result response parsing and user-facing messages (from A3-coverage-and-types.md)

## 2026-05-11 — Iteration 1 Phase 2

- [DONE] Fixed cached no-result rego response typing and removed the cached response cast — `src/lib/qld-rego/types.ts`, `src/lib/qld-rego/official.ts` (iter 1, 2026-05-11)
- [NEXT] `src/lib/qld-rego/official.ts:243-256` — Stop caching retryable `result_parse_failed` responses for `NO_RESULT_CACHE_MS`; add test named `parse error is not cached as no-result`. (added by iter 1)
- [AVOID] Iter 1 smoke server: `npm run start -- -p 3210` left only an npm process and did not bind the port; use `./node_modules/.bin/next start -p <port>` plus a `/rego-check` health check before `scripts/rego-api-smoke.mjs`.

## 2026-05-11 — Iteration 2 Phase 2

- [DONE] Stopped caching retryable `result_parse_failed` QLD rego responses as no-result cache entries — `src/lib/qld-rego/official.ts`, `tests/qld-rego-official-cache.test.mjs` (iter 2, 2026-05-11)
- [NEXT] `tests/qld-rego-official-cache.test.mjs` — Add test named `no-result response is cached for the no-result TTL`; assert two same-plate no-result lookups only fetch once and the second response has `cached: true`. (added by iter 2)
- [AVOID] Iter 2 parse-error fixtures: avoid no-result keywords like `no registration` in changed-form HTML because `looksLikeNoResult()` will classify the branch as `no_result` instead of `parse_error`.

## 2026-05-11 — Iteration 3 Phase 2

- [DONE] Added no-result cache regression coverage — `tests/qld-rego-official-cache.test.mjs` (iter 3, 2026-05-11)
- [NEXT] `src/app/api/rego/check/route.ts:8-40` + `tests/rego-check-route.test.mjs` — Add route-handler tests for malformed JSON and non-string `rego`, then add a runtime request parser that returns HTTP 400 `input_error` before calling QLD lookup. (added by iter 3)

## 2026-05-11 — Iteration 4 Phase 2

- [DONE] Added `/api/rego/check` runtime request parsing for malformed JSON and non-string `rego` with route-handler regression tests — `src/app/api/rego/check/route.ts`, `tests/rego-check-route.test.mjs` (iter 4, 2026-05-11)
- [NEXT] `tests/rego-check-route.test.mjs` — Add route-handler tests named `rego check rejects non-object JSON` and `rego check rejects non-string state`; assert HTTP 400 `input_error` and zero QLD lookup calls. (added by iter 4)
- [AVOID] Iter 4 route-handler harness: compiled `/tmp` route modules cannot resolve `next/server` relative to temp output; pre-load `next/server` via project `createRequire()` before overriding `Module._load`.

## 2026-05-11 — Iteration 5 Phase 2

- [DONE] Added `/api/rego/check` route-handler regression tests for non-object JSON and non-string `state` without QLD lookup calls — `tests/rego-check-route.test.mjs` (iter 5, 2026-05-11)
- [NEXT] `tests/rego-check-route.test.mjs` — Add route-handler tests named `rego check defaults missing state to QLD` and `rego check rejects unsupported state before lookup`; assert missing state reaches the mocked QLD lookup once and state `NSW` returns HTTP 400 `not_qld` with zero lookup calls. (added by iter 5)

## CLAUDE REVIEW 2026-05-11T03:10:00+10:00

Reviewer: Claude (read-only architectural review of commits `6bded03..c26a233`).

### 1. Drift check — scope is holding, but focus is narrowing
- All 5 iterations are Stage 2 (rego). Stage 7 (QA harness) has not been touched once. Stage 2 vs 7 is fine in principle, but the bootstrap NEXTs for Stage 7 (sitemap-completeness, route-smoke, metadata-regression, checkout-whitelist, legacy-redirect) have sat untouched while iter 5 spawned yet another two-tests-on-the-same-route NEXT. The loop is *self-feeding* on rego internals: iter 4 added parser branches → iter 5 locked them with tests → iter 5 NEXT proposes two more tests on the same parser. That is not scope creep, but it is **diminishing-return tunneling**. Break out for one iteration before the loop spends iter 6 + iter 7 still inside `tests/rego-check-route.test.mjs`.

### 2. Quality check — evidence is genuinely good, NEXTs are getting derivative
- Evidence files cite line ranges, exact test names, exact gate commands, exact server start commands, exit codes, time taken. This is the right bar — keep it.
- NEXTs from the bootstrap audit are still high-quality (cite file:line, test name, expected envelope).
- NEXTs *spawned by iterations themselves* (iter 4 → iter 5 → proposed iter 6) are getting smaller in scope each pass. The loop is amortising a single audit finding across multiple iterations. That's fine for safety, but it inflates iteration count without proportional risk reduction.
- Iter 4 took ~35 min vs. ~8–15 min for the others — and the evidence shows that overhead came from the per-test `tsc`-to-tmpdir harness, not from the actual change. The loop is paying that cost twice already (cache test + route test).

### 3. Code check — pattern worth flagging (NOTE only, do not refactor)
- **Test compile harness duplication.** `tests/qld-rego-official-cache.test.mjs`, `tests/rego-check-route.test.mjs`, and `tests/qld-rego-types.test.mjs` each spin up their own `tsc → tmpdir → require → Module._load patch` setup with subtly different shapes (one uses a tsconfig file, one uses CLI flags, one uses a fixture file). This is the dominant friction in recent iterations. A single `tests/_helpers/compile-ts-module.mjs` helper that takes `{ entries, mocks }` and returns `{ module, getCalls(name), cleanup }` would pay for itself within 2 iterations. **Note only — do NOT refactor in this loop; flag for an awake-Jordan session.**
- **Error envelope duplication in `route.ts`.** `inputErrorResponse()` was extracted, but the `not_qld`, `invalid_input`, and catch-all branches still inline the same five-field envelope shape with hand-rolled wording. Four envelopes, drift risk on every future edit.
- **Nested ternary at `route.ts:112-120`** for status-to-HTTP mapping is already three levels deep. One more error status will tip it from "ugly" to "unreviewable."

### 4. Test check — testing behaviour, not shape (good)
- Tests assert HTTP status, response status field, error code, `retryable`, AND **lookup-call count = 0** (or `requests.length` for the cache test). That last assertion is what makes these behavioural tests rather than shape tests — they prove malformed input does not reach the external dependency. Good.
- The cache test asserts `requests.length === 4` for the parse-error path (form + result, twice), which is real network-shape verification.
- Minor weakness: tests assert exact `userMessage` strings verbatim. That couples tests to copy. Tolerable for a small surface, but if Jordan ever rewords the user-facing copy these tests will all churn. Not actionable now.

### 5. Risk check — three real production smells in the last 5 commits
- **(highest)** The route catch-all at `src/app/api/rego/check/route.ts:123-135` still returns `error: error instanceof Error ? error.message : "unknown_error"` to the client. **None of the last 5 iterations addressed this** despite it being in the audit NEXTs (line 51 of LEARNED.md). This leaks internal exception text — library errors, file paths, library-version tells — to anyone who can POST to the endpoint. With the new parser, the catch is now reachable mainly when `runQldOfficialRegoCheck` throws unexpectedly, which is exactly the path most likely to leak something embarrassing.
- **`retryable: true` on HTTP 500** in that same catch block tells well-behaved clients to retry. If the underlying cause is QLD upstream weirdness, the route will *amplify* load on the QLD source under failure. The 500/502/504/429 split (lines 112-120) returns 502 for known-unhandled lookup statuses but 500 for unhandled exceptions, which is backwards: 500 = "our bug, don't retry" and 502 = "upstream bug, maybe retry" by convention.
- **Iter 1 type fix may be incomplete.** The diff only adds `cached?: boolean` to `QldRegoCheckFailure`. But `cache.set()` at `official.ts:252-256` writes the full response (which on the success branch is `QldRegoCheckSuccess`), and the cache-hit return at line 182 is now `return { ...cached.value, cached: true };` *without* a cast. Typecheck passes, so either (a) `QldRegoCheckSuccess` already had `cached?: boolean` before this loop began, or (b) only the failure branch is ever cache-stored. **Verify in a follow-up — the iter 1 evidence does not document which.** If (b) is true, the success-cache path is dead code and worth removing; if (a), the loop's audit missed a pre-existing field.

### 6. Top 3 NEW [NEXT] hints — higher leverage than the current trajectory
- [NEXT] `src/app/api/rego/check/route.ts:123-135` + `tests/rego-check-route.test.mjs` — Stop returning the raw `error.message` to clients. Replace with stable code `route_unhandled`, log the raw error server-side via `console.error("[rego-check] unhandled", error)`, and switch the response to HTTP 502 with `retryable: false` to prevent retry-amplification on upstream failures. Add tests named `rego check route catch returns stable error code` (assert `payload.error === "route_unhandled"` and `payload.error.includes("boom")` is false when the lookup throws `new Error("boom")`) and `rego check route catch returns 502 not 500`. (added by Claude review, audit NEXT line 51 was already queued — promote it above the iter-5 spawned NEXT)
- [NEXT] **Pivot iter 6 to Stage 7** — pick `tests/legacy-redirect.test.mjs` for `/buddy → /check`, `/ppi → /inspect`, `/car-buyers-agent-pullenvale → /` (audit NEXT, LEARNED.md:32 + :53). Rationale: it requires NO `tsc → tmpdir` harness (just a fetch/HEAD against compiled route handlers or a simple page-export shape check), it covers a different stage, and it breaks the rego-test echo chamber. Estimated 10–15 min vs. yet another route-handler tsc compile. Hard rule: do not pick a Stage 2 NEXT for iter 6.
- [NEXT] `src/lib/qld-rego/types.ts` + `tests/qld-rego-types.test.mjs` — Add a type fixture file `tests/type-fixtures/qld-rego-cached-success.ts` that constructs a cached `QldRegoCheckSuccess` (with `cached: true`) and assigns it to `QldRegoCheckResponse`. If it compiles, the iter 1 fix was complete and the success-cache path is exercised. If it fails, the iter 1 fix only covered the failure branch and `cached?: boolean` is missing from `QldRegoCheckSuccess`. This closes the verification gap the iter 1 evidence left open and costs ~5 minutes.

### Bluntness note
The loop is not producing slop, but it is producing **safe, low-risk, ever-narrower** work. Iters 3 and 5 were both test-only regression locks for behaviour added in the immediately-preceding iteration. That's defensible (TDD discipline) but the marginal risk reduction is small compared to the audit NEXTs sitting unpicked. The single highest-value unaddressed item — the `error.message` leak — has been in the queue since the Phase 1 audit and the loop has walked past it 5 times. Pick that one, or pick a Stage 7 item, before iter 6 burrows further into the rego-check route.

## 2026-05-11 — Iteration 6 Phase 2

- [DONE] Stopped `/api/rego/check` route catch from leaking raw exception messages and retry-amplifying unexpected failures — `src/app/api/rego/check/route.ts`, `tests/rego-check-route.test.mjs` (iter 6, 2026-05-11)
- [NEXT] `src/lib/qld-rego/official.ts:278-282` + `tests/qld-rego-official-cache.test.mjs` — Add test named `official unavailable returns stable error code`; simulate the official lookup fetch throwing `new Error("boom secret/path")` and assert the failure uses a stable public `error` code without including `boom` or `secret/path`. (added by iter 6)
