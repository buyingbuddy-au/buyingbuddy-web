# Buying Buddy Command Center

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  
**Last verified:** 2026-05-05  

This is the operational starting point for Buying Buddy. It controls how Codex, Claude CLI, Hermes, OpenClaw, and future agents work with the repo, Vercel, Supabase, Stripe, Resend, DNS, email, and archive context.

Product truth still lives in `docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md`. This command center does not rewrite product scope. It keeps work coordinated.

## Start Here

Read in this order:

1. `AGENTS.md`
2. `docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md`
3. `docs/command-center/README.md`
4. The command-center doc or runbook for the task

## Current Priority

The local repo has cleanup work that is not live yet. Before deploy, verify typecheck/build, platform env presence, Stripe webhook safety, and live drift targets.

Do not claim the public site is fixed until `docs/command-center/release-state.md` is updated and live routes have been checked after deployment.

## Control Docs

- `release-state.md` - what is local, pushed, deployed, and live.
- `platform-status.md` - Vercel, GitHub, Supabase, Stripe, Resend, DNS, email, Telegram, SiteGround.
- `agents.md` - what agents can and cannot do.
- `email-ops.md` - transactional email and customer mailbox rules.
- `context-map.md` - canon vs archive, including old OpenClaw/Hermes/Claude context.
- `decision-log.md` - dated operational decisions.
- `open-questions.md` - unresolved decisions only.

## Runbooks

- `runbooks/deploy.md`
- `runbooks/live-drift-check.md`
- `runbooks/stripe-webhooks.md`
- `runbooks/supabase-health.md`
- `runbooks/customer-email.md`

## Source Of Truth Order

1. `docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md` wins on product positioning, pricing, launch scope, copy rules, and public offer.
2. `docs/command-center/README.md` wins on operational entry points and control flow.
3. `docs/command-center/release-state.md` wins on deploy readiness and live-vs-local state.
4. `docs/command-center/platform-status.md` wins on platform inventory and env presence.
5. `docs/command-center/agents.md` wins on agent permissions.
6. GitHub is the durable record. Local terminal history is evidence only.
7. Vercel is the deployment target, not the source of truth.
8. Stripe, Supabase, Resend, DNS, and email dashboards are external systems to verify against this command center.

## Approval Gates

Agents need explicit Jordan approval before:

- Production deploys.
- Sending customer emails.
- Changing Stripe products, prices, or webhook settings.
- Changing Supabase production data or schema.
- Changing DNS or mail records.
- Rotating secrets.
- Reintroducing old public scope.

## Fast State Check

Run:

```powershell
git status --short --branch
vercel whoami
vercel env ls
```

Then read:

```text
docs/command-center/release-state.md
docs/command-center/platform-status.md
```
