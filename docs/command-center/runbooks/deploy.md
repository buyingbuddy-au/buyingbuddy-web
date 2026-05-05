# Deploy Runbook

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  

Use this before any production deploy.

## Approval Gate

Do not deploy until Jordan explicitly approves production deployment in the current thread.

## Preflight

Run from repo root:

```powershell
git status --short --branch
git log --oneline --decorate -8
npm run typecheck
npm run build
vercel whoami
vercel env ls
```

Required:

- Worktree status is understood.
- Latest local commits are known.
- Typecheck result is known.
- Build result is known.
- Vercel account access is known.
- Env names have been checked without exposing values.

## Required Env Name Check

Confirm presence or document absence:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL` or `SITE_URL`

## Release Drift Targets

Before deploy, confirm local code intends these public outcomes:

- `/buddy` redirects to `/check`.
- `/ppi` redirects to `/inspect`.
- `/car-buyers-agent-pullenvale` redirects to `/`.
- Public copy does not sell $997, concierge, sourcing, or full-service buyer-agent work.
- Public pricing shows Free, $4.95 PPSR, and $9.99 Deal Pack.

## Deploy Methods

Preferred after approval:

```powershell
git push origin main
```

Fallback after approval:

```powershell
vercel --prod
```

## After Deploy

Run:

```powershell
vercel ls buyingbuddy-web
```

Then run:

```text
docs/command-center/runbooks/live-drift-check.md
```

Update `docs/command-center/release-state.md` with the deployed commit, deployment URL, and live drift result.
