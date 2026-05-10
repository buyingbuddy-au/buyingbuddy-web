# Iteration 16 — Phase 2 — rego capture HTML escaping

- Iteration: 16
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T06:21:23+10:00
- Objective picked:
  > [NEXT] `src/app/api/rego/capture/route.ts:59` + new `tests/rego-capture-route.test.mjs` — **HTML injection fix.** Replace the unescaped `${body.reason ?? "not supplied"}` interpolation with an HTML-escape helper (or strip to plain text) before sending the internal notification email. Add a test named `rego capture escapes reason in notification HTML` that posts `reason: "</p><script>alert(1)</script>"` and asserts the captured email HTML contains the literal string `&lt;script&gt;` (or has the script tag stripped). Replace `<strong>` interpolation in the user-facing template at `route.ts:14-30` with the same helper for `validation.rego`. **Promote above iter-15's malformed-JSON NEXT — security beats input parsing.** (added by Claude review)

## Files changed

- src/app/api/rego/capture/route.ts
- tests/rego-capture-route.test.mjs
- .hermes/evidence/iter-16-capture-html-escape.md
- .hermes/LEARNED.md

## Why this matters

The fallback capture endpoint sends user-controlled `reason` into an internal HTML email. Escaping that value prevents a crafted reason from breaking out of the `<p>` wrapper and injecting active HTML into the notification. The same helper now wraps the rego and email fields used in those HTML templates, so future validation changes do not silently reintroduce the same template-injection class.

## Test notes

- RED: `node --test --test-name-pattern "rego capture escapes reason in notification HTML" tests/rego-capture-route.test.mjs` — FAIL as expected before the route change because notification HTML contained raw `<script>alert(1)</script>`.
- GREEN focused: `node --test --test-name-pattern "rego capture escapes reason in notification HTML" tests/rego-capture-route.test.mjs` — PASS after adding `escapeHtml()` and applying it to `reason`, notification rego/email, and `sellerScriptHtml()` rego.
- Affected file check: `node --test tests/rego-capture-route.test.mjs` — PASS (1 test).

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (25 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3225 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3225` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 18 minutes.

## Token usage estimate

Not available from this CLI run.
