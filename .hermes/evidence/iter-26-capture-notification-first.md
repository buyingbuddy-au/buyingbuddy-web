# Iteration 26 — Phase 2 — rego capture notification-first sends

- Iteration: 26
- Phase: Phase 2 — Stage 2 rego hardening
- Timestamp: 2026-05-11T09:23:03+10:00
- Objective picked:
  > [NEXT] `src/app/api/rego/capture/route.ts:152-180` + `tests/rego-capture-route.test.mjs` — **Reorder the two Resend sends so notification fires before buyer email.** Currently the buyer email sends first (line ~170) and then the internal notification sends (line ~177). If the second send throws, the buyer has the email and Jordan doesn't, and the API returns 502 — partial success masquerades as failure. Swap the order so the notification email is sent first; only on its success send the buyer email; on notification failure return the provider_error envelope without ever sending the buyer email (no spurious user-facing send). Add a test named `rego capture aborts buyer email when notification send fails`; mock the FIRST send to throw and assert `getEmailSends().length === 0`. **Higher priority than the iter-25 spawned catch-all envelope NEXT** because it fixes a real partial-success bug, not a contract polish. (added by Claude review)

## Files changed

- src/app/api/rego/capture/route.ts
- tests/rego-capture-route.test.mjs
- .hermes/evidence/iter-26-capture-notification-first.md
- .hermes/LEARNED.md

## Why this matters

The capture endpoint previously sent the buyer's follow-up email before the internal notification. If the notification send failed, the buyer could receive a success-looking email while Jordan never received the lead and the API still returned a provider error, inviting duplicate retries. This iteration sends the internal notification first, so a notification-provider failure aborts before any buyer-facing email is sent, while keeping the stable provider-error envelope from iteration 25.

## Test notes

- RED: `node --test --test-name-pattern "rego capture aborts buyer email when notification send fails" tests/rego-capture-route.test.mjs` — FAIL as expected before the route change (`1 !== 0`) because the buyer email succeeded before the notification send threw.
- GREEN focused: `node --test --test-name-pattern "rego capture aborts buyer email when notification send fails" tests/rego-capture-route.test.mjs` — PASS after moving the notification Resend call before the buyer Resend call.
- Affected file check: `node --test tests/rego-capture-route.test.mjs` — PASS (11 tests).

## Gates run + results

- `npm run typecheck` — PASS
- `npm test` — PASS (35 tests)
- `npm run build` — PASS (Next production build compiled and generated 70 static pages)
- `BASE_URL=http://127.0.0.1:3235 node scripts/rego-api-smoke.mjs` — PASS after starting a local server with `./node_modules/.bin/next start -p 3235` and confirming `/rego-check` returned HTTP 200. Smoke completed five requests with exit code 0, including the negative `BAD!!` case returning HTTP 404 with `status: "no_result"`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 11 minutes.

## Token usage estimate

Not available from this CLI run.
