# Release State

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  
**Last verified:** 2026-05-05  

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

Current status: not deploy-cleared until typecheck, build, env presence, Stripe webhook safety, and live drift targets are verified.
