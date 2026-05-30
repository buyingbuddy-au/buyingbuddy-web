# Release State

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  
**Last verified:** 2026-05-31

This file answers one question: what is local, what is pushed, what is deployed, and what is actually live?

## Current Recorded State

- Active repo: `C:\Users\jrl-j\Projects\Active\buyingbuddy-web`
- GitHub repo: `https://github.com/buyingbuddy-au/buyingbuddy-web`
- Default branch: `main`
- Live site: `https://buyingbuddy.com.au`
- Vercel project: `buyingbuddy-web`
- Vercel project id: `prj_KiQaVrYyhPl5YhwAHnULoV3l6NIK`
- Vercel org id: `team_HHKFzxEJV5ynhrPC2WxqbvG0`

## 2026-05-05 Audit Findings

- Local `main` was ahead of `origin/main` during command-center creation.
- Live production was older than local cleanup commits.
- Live routes still exposed stale launch drift during audit:
  - `/buddy`
  - `/ppi`
  - `/car-buyers-agent-pullenvale`
  - old `$997` language
  - Pullenvale local buyer-agent positioning
  - full-service buyer-agent implications
- Vercel CLI was available and logged in as `lansbury2002-2432`.
- Browser Use was attempted but the Codex app-server path failed to start in this desktop session.
- Command-center docs were pushed to PR #1 and must be merged before `main`/default GitHub truth is updated.

## Before Any Deploy

Run:

```powershell
git status --short --branch
git log --oneline --decorate -8
npm run typecheck
npm run build
vercel env ls
```

Required result:

- Worktree state is understood.
- Local branch relation to `origin/main` is known.
- Typecheck passes or the exact failure is documented.
- Build passes or the exact failure is documented.
- Env var names have been checked without exposing values.

## Deploy Rule

No production deploy without explicit Jordan approval in the current thread.

Allowed deploy methods after approval:

```powershell
git push origin main
```

or:

```powershell
vercel --prod
```

Prefer `git push origin main` when the GitHub/Vercel pipeline is healthy, because GitHub should remain the durable deployment record.

## After Deploy

Run the live drift runbook:

```text
docs/command-center/runbooks/live-drift-check.md
```

Then update this section with:

- Commit deployed.
- Vercel production deployment URL.
- Deployment time.
- Live drift result.
- Any hotfix needed.

## 2026-05-31 Production Deploy

- Commit deployed: `2f04ef1` — `fix(stripe): add safe post-payment smoke harness`.
- GitHub workflow: `26688981612` completed successfully.
- Vercel production deployment: `https://buyingbuddy-pidv2q6wy-jordan-lansburys-projects.vercel.app`.
- Production alias assigned: `https://buyingbuddy.com.au`.
- Deployment verified: 2026-05-31 02:33 AEST.
- Local gates before deploy:
  - focused Stripe/email/data-store safety tests passed.
  - `npm run typecheck` passed.
  - `npm test` passed: 118/118.
  - `npm run build` passed.
  - local production smoke passed on key routes and reject-before-Stripe checkout probes.
- Live smoke after deploy:
  - primary routes `/`, `/check`, `/rego-check`, `/ppsr`, `/deal`, `/contract-pack`, `/pricing`, `/contact`, `/privacy`, `/terms`, `/inspect/full`, and `/order/success` returned 200.
  - legacy routes `/pdf`, `/pdf/deal_test`, `/buddy`, `/ppi`, and `/car-buyers-agent-pullenvale` resolved to the expected live destinations.
  - reject-before-Stripe probes returned 400 for unsupported product, PPSR missing identifier, and malformed email.
  - browser checks loaded live `/ppsr` and `/deal` with no console errors.
  - controlled live Checkout creation smoke returned Stripe `live` sessions for PPSR and Deal Room and stopped at the Stripe Checkout page before any card entry or payment.
- Not performed: no real card charge, no completed live checkout, no paid PPSR purchase, no Stripe price/product changes, no Supabase schema/data edits beyond the unpaid Checkout session creation side effect.
- Current caveat: true post-payment live webhook/email persistence is still unproven until Jordan explicitly approves a real paid end-to-end order or a deployed test-mode environment is used.

## Live Route Expectations

Primary launch routes:

- `/`
- `/check`
- `/ppsr`
- `/pricing`
- `/deal`
- `/inspect`
- `/contract-pack`
- `/free-kit`
- `/blog`

Redirected or off-scope launch routes:

- `/buddy` should redirect to `/check`.
- `/car-buyers-agent-pullenvale` should redirect to `/`.
- `/ppi` should redirect to `/inspect`.

## Readiness Status

Current status: production deploy `2f04ef1` is live and safe smoke checks passed. True post-payment live webhook/email persistence still requires either a real paid order or a deployed Stripe test-mode environment.
