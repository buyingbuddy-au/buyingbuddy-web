# Buying Buddy Command Center Design

**Date:** 2026-05-05  
**Status:** Draft for Jordan review  
**Owner:** Jordan Lansbury  
**Primary repo:** `C:\Users\jrl-j\Projects\Active\buyingbuddy-web`  
**Live site:** `https://buyingbuddy.com.au`  

## Summary

Buying Buddy already has a product centre of truth in `docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md`. The missing piece is an operational command center that keeps agents, GitHub, Vercel, Supabase, Stripe, Resend, DNS, email, deployment state, and old archived context aligned.

The command center should live inside the Buying Buddy repo first. That makes GitHub the durable source of truth, keeps Vercel deployments tied to the same history, and gives Codex, Claude CLI, Hermes, OpenClaw, and any future agent a single place to start before they touch the product.

This is the recommended hybrid path:

1. Build a repo-local Buying Buddy command center now.
2. Treat archived OpenClaw/Hermes/Claude memories as evidence, not truth.
3. Add a small JordanOS umbrella index later only after Buying Buddy is stable.

## Current Reality

- The active project is `buyingbuddy-web`.
- The working tree is clean.
- Local `main` is ahead of `origin/main` by 3 commits.
- The live Vercel production deployment is stale compared with local code.
- Public live routes still show launch drift that the local commits appear intended to remove, including old `/buddy`, `/ppi`, `/car-buyers-agent-pullenvale`, `$997`, Pullenvale, and full-service buyer-agent language.
- Vercel CLI is available and the repo is linked to the `buyingbuddy-web` Vercel project.
- Vercel environment variables include Stripe, Supabase, Telegram, OpenRouter, and Resend keys, but the platform state needs a formal checklist.
- Critical-looking env gaps were found from local inspection: `STRIPE_WEBHOOK_SECRET`, `ADMIN_PASSWORD`, and `NEXT_PUBLIC_SITE_URL` or `SITE_URL`.
- DNS currently points the domain to Vercel and mail to Google-hosted MX records.
- SiteGround appears to be old or noisy context unless a current account check proves otherwise.
- Browser Use was attempted but failed in this desktop session because the Codex app-server path could not be started.
- OpenClaw, Hermes, Claude CLI, and Codex history contains useful research mixed with stale product experiments.

## Goals

- Create one operational entry point for all Buying Buddy work.
- Make GitHub/repo docs the control plane for product, technical, agent, and platform decisions.
- Stop agents from rebuilding old ideas or reviving archived scope.
- Make release state obvious: local, GitHub, Vercel, live site, and required checks.
- Track external systems without dumping secrets into docs.
- Give email/support work clear rules so agents can draft, triage, and route safely.
- Preserve speed by making the next action obvious.

## Non-Goals

- Do not build a full JordanOS control hub yet.
- Do not move secrets into docs.
- Do not make SiteGround, Stripe, Supabase, Gmail, or Vercel the source of truth.
- Do not let any agent deploy, email customers, change billing, edit DNS, or mutate production data without explicit Jordan approval.
- Do not reintroduce the old $997, concierge, sourcing, Pullenvale, standalone AI buddy, or public PPI launch scope.

## Proposed File Structure

Create this structure inside the repo:

```text
docs/command-center/
  README.md
  release-state.md
  platform-status.md
  agents.md
  email-ops.md
  context-map.md
  decision-log.md
  open-questions.md
  runbooks/
    deploy.md
    live-drift-check.md
    stripe-webhooks.md
    supabase-health.md
    customer-email.md
```

## File Responsibilities

`docs/command-center/README.md`

- The single starting point for all Buying Buddy operational work.
- Links to product truth, launch plan, command-center docs, and runbooks.
- States the current priority in plain language.

`docs/command-center/release-state.md`

- Tracks current local branch, GitHub state, Vercel production state, and live-site drift.
- Records the exact release gate before push/deploy.
- Keeps the "what is live vs what is only local" question visible.

`docs/command-center/platform-status.md`

- Tracks Vercel, GitHub, Supabase, Stripe, Resend, DNS, Google mail, Telegram, and any SiteGround status.
- Stores account/project names, URLs, what each system is used for, and last verified date.
- Stores env var presence as names only, never secret values.

`docs/command-center/agents.md`

- Defines agent roles and permissions for Codex, Claude CLI, Hermes, OpenClaw, and future agents.
- Every agent starts with this doc plus `AGENTS.md` and `docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md`.
- Agents may inspect, propose, draft, test, and make approved repo changes.
- Agents may not deploy, send customer emails, change Stripe products, change Supabase data, change DNS, or rotate secrets without Jordan approval.

`docs/command-center/email-ops.md`

- Defines customer email sources and responsibilities.
- Separates transactional email from customer/support inbox work.
- Transactional sending belongs to Resend/app code.
- Customer conversations belong to the mailbox.
- Agents may draft and classify emails, but Jordan approves sends unless he explicitly delegates that action.

`docs/command-center/context-map.md`

- Separates canonical docs from archive/reference docs.
- Lists local memory folders that contain useful but non-canonical context.
- Marks old OpenClaw/Hermes/Claude artifacts as archive unless promoted.

`docs/command-center/decision-log.md`

- Append-only decisions with date, decision, reason, owner, and impact.
- Used when product, platform, agent, or launch rules change.

`docs/command-center/open-questions.md`

- Active unresolved questions only.
- Keeps messy uncertainty out of canon docs until decided.

`docs/command-center/runbooks/*.md`

- Short operating procedures for common work.
- Each runbook includes purpose, when to use it, commands/checks, approval gate, and done criteria.

## Source of Truth Rules

1. `docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md` wins on product positioning, pricing, launch scope, copy rules, and public offer.
2. `docs/command-center/README.md` wins on operational entry points and current control flow.
3. `docs/command-center/release-state.md` wins on deploy readiness and live-vs-local state.
4. `docs/command-center/platform-status.md` wins on platform inventory and env presence.
5. `docs/command-center/agents.md` wins on agent permissions.
6. GitHub is the durable record. Local terminal history is evidence only.
7. Vercel is the deployment target, not the source of truth.
8. Stripe, Supabase, Resend, DNS, and email dashboards are external systems to verify against the command center, not places where strategy lives.

## Agent Operating Model

Every agent working on Buying Buddy must follow this order:

1. Read repo `AGENTS.md`.
2. Read `docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md`.
3. Read `docs/command-center/README.md`.
4. Read the relevant command-center doc or runbook for the task.
5. Check `docs/command-center/release-state.md` before claiming anything is live.
6. Check `docs/command-center/context-map.md` before using old local memory, OpenClaw workspace output, Hermes missions, or archive docs.
7. Report whether the change affects product truth, platform state, customer email, money, or production data.

Agent authority levels:

- **Level 0: Read-only** - inspect, summarize, map context.
- **Level 1: Draft** - write proposed docs, plans, email drafts, runbook updates.
- **Level 2: Repo change** - edit code/docs after task approval.
- **Level 3: External action** - deploy, send email, change DNS, update Stripe/Supabase/Vercel settings. Requires explicit Jordan approval in the current thread.

Default for all agents is Level 1 unless Jordan grants more.

## Email Operating Model

Buying Buddy needs two separate email lanes:

- **Transactional lane:** app-generated emails through Resend, such as order confirmations, free-kit delivery, PPSR/deal-pack messages, and system notifications.
- **Conversation lane:** human/customer mailbox work, such as support, refund requests, supplier conversations, partnership emails, and manual fulfilment.

Command-center rules:

- No secret API keys in docs.
- Agents can classify and draft.
- Jordan approves customer sends by default.
- Refund, complaint, legal, payment, or safety-related emails are escalated to Jordan.
- Any template that changes customer promise, delivery timing, refund policy, or product offer must be checked against the product centre of truth.

## Platform Control Model

The command center tracks platform state with names, links, and status, not secrets.

Minimum platform inventory:

- GitHub repo and default branch.
- Vercel project, team/org, production domain, latest production deployment, env var names, and deploy method.
- Supabase project, URL name only, core tables used by app, and last health check.
- Stripe account mode, product/price names, webhook endpoint, required webhook secret presence, and test/live checkout rule.
- Resend domain/API status and transactional templates.
- DNS registrar/host and records that matter for Vercel and mail.
- Google mail or mailbox owner/status.
- Telegram alert integration if still active.
- SiteGround status, explicitly marked active, inactive, or unknown.

## Release Gate

No deploy-ready claim unless these are true:

- `npm run typecheck` completed.
- `npm run build` completed or failure is documented.
- Live drift scan target list is known.
- Stripe product labels/prices match launch truth.
- Required env var presence has been checked.
- Redirect rules for `/buddy`, `/ppi`, and `/car-buyers-agent-pullenvale` are checked locally or in build output.
- The release-state doc says what is local, what is pushed, and what is live.

No production deploy without explicit Jordan approval.

## Archive Policy

Archived material may be useful but cannot silently override current truth.

Known archive/reference sources:

- `C:\Users\jrl-j\OpenClaw_Extract\buyingbuddy-memory`
- `C:\Users\jrl-j\OpenClaw_Archive`
- `.openclaw` workspaces and mission folders.
- Hermes mission folders.
- Old docs under repo archive/handover folders.
- Claude/Codex terminal history.

Promotion rule:

1. Extract the claim.
2. Check it against current repo truth.
3. Mark it as confirmed, stale, rejected, or open.
4. Only then copy the useful part into command-center docs.

## Implementation Sequence

1. Create the command-center docs skeleton.
2. Fill the README, source-of-truth order, and current priority.
3. Fill release-state from current Git/Vercel/live findings.
4. Fill platform-status from CLI/DNS/code inspection, marking dashboard-only items as unverified.
5. Fill agents permissions.
6. Fill email-ops rules.
7. Fill context-map and quarantine archive sources.
8. Add short runbooks for deploy, live drift check, Stripe webhook check, Supabase health, and customer email.
9. Run markdown/link sanity checks.
10. Review with Jordan before any deploy or external mutation.

## Open Risks

- Browser Use is currently blocked in this desktop session, so dashboard checks may need connector, CLI, or manual browser confirmation.
- Stripe CLI and Supabase CLI are not installed locally.
- Live site is currently stale versus local repo state.
- Vercel production env appears to be missing important variables, based on env-name inspection and code references.
- Some archived docs include stale pricing, old service scope, or historical secret-looking values. They should be quarantined and cleaned before reuse.

## Definition of Done

This design is done when:

- Jordan approves the repo-local command center structure.
- The implementation plan lists exact files to create and verify.
- Agents have a clear entry point and authority model.
- Buying Buddy has a visible live/local/deploy state.
- Platform and email responsibilities are tracked without leaking secrets.
- Old terminal and agent mess is mapped as archive, not allowed to act as hidden truth.
