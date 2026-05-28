# Agent Rules

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  
**Last verified:** 2026-05-05  

This file controls how Codex, Hermes, OpenClaw reference archives, and future agents work on Buying Buddy.

## Mandatory Read Order

Every agent starts with:

1. `AGENTS.md`
2. `docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md`
3. `docs/command-center/README.md`
4. The relevant command-center doc or runbook

## Product Guardrails

Agents must not reintroduce public launch drift:

- No public $997 front-door offer.
- No concierge positioning.
- No full-service buyer-agent service.
- No car sourcing service.
- No "we find the car" promise.
- No "we negotiate for you" promise.
- No Pullenvale local buyer-agent SEO front door.
- No standalone public AI buddy destination.
- No public PPI service line unless Jordan approves a repositioned experiment.

Allowed framing:

- Buyer-side used-car help.
- Self-serve buyer-agent alternative.
- Cheap practical tools for expensive used-car mistakes.
- QLD-first private-sale paperwork support.

## Authority Levels

Default authority for every agent is Level 1 unless Jordan grants more in the current thread.

| Level | Name | Allowed actions |
| --- | --- | --- |
| 0 | Read-only | Inspect, summarize, map context, report findings |
| 1 | Draft | Write proposed docs, plans, runbook changes, email drafts |
| 2 | Repo change | Edit code/docs after task approval and run relevant checks |
| 3 | External action | Deploy, send email, change Stripe/Supabase/Vercel/DNS settings, mutate production data |

Level 3 always requires explicit Jordan approval in the current thread.

## Tool-Specific Roles

### Codex

- Primary repo agent.
- Owns command-center maintenance, code edits, verification, and structured plans.
- Must report when Browser Use, Vercel, Supabase, Stripe, or email access is blocked.

### Hermes

- Useful for mission-based research and offline analysis.
- Outputs are reference material until reviewed.
- Hermes mission results must be summarized into command-center docs before they guide product work.

### OpenClaw

- Historical context contains useful research and stale experiments.
- Treat OpenClaw output as archive by default.
- Do not let OpenClaw workspaces become hidden product truth.

## External Action Gate

Agents need explicit Jordan approval before:

- `git push origin main`
- `vercel --prod`
- Vercel env changes
- Stripe product, price, webhook, refund, or live/test mode changes
- Supabase production data/schema changes
- DNS/mail changes
- Sending customer emails
- Rotating or revealing secrets

## Reporting Standard

Every agent handoff should say:

- Files touched.
- Checks run.
- Checks not run and why.
- Whether the work affects product truth, customer email, payment, production data, or deployment.
- Whether anything is local-only, pushed, deployed, or live.
