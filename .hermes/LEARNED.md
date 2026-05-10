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
