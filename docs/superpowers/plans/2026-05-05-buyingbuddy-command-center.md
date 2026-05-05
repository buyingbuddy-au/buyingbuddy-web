# Buying Buddy Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a repo-local Buying Buddy command center that controls agent work, release state, platform status, email ops, archive context, and runbooks.

**Architecture:** Add a focused `docs/command-center/` documentation layer that sits under the current product truth instead of replacing it. Product positioning remains owned by `docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md`; the new command center owns operational entry points, platform inventory, agent permissions, release readiness, and archive hygiene.

**Tech Stack:** Markdown docs, PowerShell verification commands, Git, Vercel CLI, curl, existing Next.js/Vercel/Supabase/Stripe/Resend project.

---

## Spec Reference

Build from `docs/superpowers/specs/2026-05-05-buyingbuddy-command-center-design.md`.

## File Structure

Create:

- `docs/command-center/README.md` - operational entry point.
- `docs/command-center/release-state.md` - local/GitHub/Vercel/live state.
- `docs/command-center/platform-status.md` - external platform inventory and env names.
- `docs/command-center/agents.md` - agent roles, authority, and safety gates.
- `docs/command-center/email-ops.md` - transactional and customer email control.
- `docs/command-center/context-map.md` - canon, reference, archive, and promotion rules.
- `docs/command-center/decision-log.md` - append-only decisions.
- `docs/command-center/open-questions.md` - unresolved questions.
- `docs/command-center/runbooks/deploy.md` - production release procedure.
- `docs/command-center/runbooks/live-drift-check.md` - live content and route drift scan.
- `docs/command-center/runbooks/stripe-webhooks.md` - Stripe webhook and payment safety check.
- `docs/command-center/runbooks/supabase-health.md` - Supabase health check.
- `docs/command-center/runbooks/customer-email.md` - support/customer email workflow.

Modify:

- `AGENTS.md` - add the command center to the required read list.
- `README.md` - add the command center as the ops starting point.

## Task 1: Create Command Center Entrypoint

**Files:**

- Create: `docs/command-center/README.md`

- [ ] **Step 1: Create directories**

Run:

```powershell
New-Item -ItemType Directory -Force docs\command-center\runbooks | Out-Null
```

Expected: command exits with no error.

- [ ] **Step 2: Create the command center README**

Create `docs/command-center/README.md` with:

```markdown
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
```

- [ ] **Step 3: Verify the README exists**

Run:

```powershell
Test-Path docs\command-center\README.md
```

Expected:

```text
True
```

- [ ] **Step 4: Commit Task 1**

Run:

```powershell
git add docs\command-center\README.md
git commit -m "docs: add buying buddy command center entrypoint"
```

Expected: commit succeeds.

## Task 2: Create Release And Platform State Docs

**Files:**

- Create: `docs/command-center/release-state.md`
- Create: `docs/command-center/platform-status.md`

- [ ] **Step 1: Create release-state doc**

Create `docs/command-center/release-state.md` with:

```markdown
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
```

- [ ] **Step 2: Create platform-status doc**

Create `docs/command-center/platform-status.md` with:

```markdown
# Platform Status

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  
**Last verified:** 2026-05-05  

This file tracks external systems by purpose, project name, env var name, and verification status. Never store secret values here.

## Systems

| System | Current role | Recorded state | Verification |
| --- | --- | --- | --- |
| GitHub | Durable source of truth and repo history | `buyingbuddy-au/buyingbuddy-web`, branch `main` | `git remote -v`, GitHub UI |
| Vercel | Production hosting and deploy target | Project `buyingbuddy-web`, project id `prj_KiQaVrYyhPl5YhwAHnULoV3l6NIK` | `vercel whoami`, `vercel env ls`, Vercel dashboard |
| Supabase | App data layer used by code | URL/key env vars present by name on Vercel | Supabase dashboard and `src/lib/supabase.ts` |
| Stripe | Checkout and payment webhooks | Secret and publishable key env names present by name; webhook secret not observed in Vercel env listing | Stripe dashboard and webhook runbook |
| Resend | Transactional email | `RESEND_API_KEY` env name present by name on Vercel | Resend dashboard and app email routes |
| DNS | Domain routing | `buyingbuddy.com.au` points to Vercel during DNS check | DNS registrar and `nslookup` |
| Mail | Customer mailbox hosting | MX records point to Google-hosted mail during DNS check | Google Workspace/mail admin |
| Telegram | Operational alerts if still enabled | Bot token env name present by name; chat id must be verified before relying on alerts | Telegram integration code and Vercel env |
| SiteGround | Historical or unknown role | No current hosting role proven during audit | Confirm manually before treating as active |

## Vercel Env Names Observed

Observed by name only:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `TELEGRAM_BOT_TOKEN`
- `OPENROUTER_API_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`

Not observed during audit and must be checked before production reliance:

- `STRIPE_WEBHOOK_SECRET`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL`
- `SITE_URL`

Additional names referenced by code or scripts that require route-specific verification before use:

- `TELEGRAM_CHAT_ID`
- `OPENAI_API_KEY`
- `GOOGLE_AI_API_KEY`
- `ANTHROPIC_API_KEY`
- `CRON_SECRET`
- `WEBHOOK_SECRET`
- PPSR automation card/payment variables referenced by scripts or legacy automation

## Secret Handling

- Secret values never go in repo docs.
- Env var names are allowed.
- Secret-looking values found in archive docs or terminal history must be treated as compromised until rotated or confirmed safe by Jordan.
- Agents may identify missing env names.
- Agents may not print, copy, rotate, or create secrets without explicit Jordan approval.

## Platform Verification Commands

Run from repo root:

```powershell
git remote -v
vercel whoami
vercel env ls
nslookup buyingbuddy.com.au
nslookup -type=mx buyingbuddy.com.au
```

Expected:

- GitHub remote points to `buyingbuddy-au/buyingbuddy-web`.
- Vercel user/team access is available.
- Env names are visible without values.
- Domain resolves to Vercel.
- Mail records are understood before changing email flows.
```

- [ ] **Step 3: Verify both docs exist**

Run:

```powershell
Test-Path docs\command-center\release-state.md
Test-Path docs\command-center\platform-status.md
```

Expected:

```text
True
True
```

- [ ] **Step 4: Commit Task 2**

Run:

```powershell
git add docs\command-center\release-state.md docs\command-center\platform-status.md
git commit -m "docs: record buying buddy release and platform state"
```

Expected: commit succeeds.

## Task 3: Create Agent And Email Operating Rules

**Files:**

- Create: `docs/command-center/agents.md`
- Create: `docs/command-center/email-ops.md`

- [ ] **Step 1: Create agents doc**

Create `docs/command-center/agents.md` with:

```markdown
# Agent Rules

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  
**Last verified:** 2026-05-05  

This file controls how Codex, Claude CLI, Hermes, OpenClaw, and future agents work on Buying Buddy.

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

### Claude CLI

- Useful for secondary code review, copy critique, and implementation support.
- Must read command-center docs before touching Buying Buddy.
- Must not use old memories as truth unless promoted through `context-map.md`.

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
```

- [ ] **Step 2: Create email-ops doc**

Create `docs/command-center/email-ops.md` with:

```markdown
# Email Ops

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  
**Last verified:** 2026-05-05  

Buying Buddy has two email lanes: transactional app email and human/customer conversation email.

## Lanes

### Transactional Lane

Purpose:

- Order confirmations.
- PPSR or Deal Pack delivery messages.
- Free-kit delivery.
- System notifications.

Current technical path:

- App code sends through Resend.
- Env name: `RESEND_API_KEY`.
- Customer promises must match `docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md`.

Rules:

- Do not change delivery promises without checking product truth.
- Do not expose API keys in docs or logs.
- If transactional delivery fails, treat it as a launch/blocking reliability issue.

### Conversation Lane

Purpose:

- Customer replies.
- Support.
- Refund or payment questions.
- Supplier or partner emails.
- Manual fulfilment coordination.

Current observed mail routing:

- DNS MX records pointed to Google-hosted mail during audit.
- Exact mailbox ownership must be verified before relying on inbox automation.

Rules:

- Agents may classify emails.
- Agents may draft replies.
- Jordan approves sends by default.
- Refund, complaint, legal, safety, payment, chargeback, or angry customer messages escalate to Jordan.
- Do not promise same-hour delivery unless Jordan explicitly approves that message.

## Customer Promise Baseline

Allowed baseline promise for launch:

- PPSR delivery is same business day, usually within 2 hours, while fulfilment is manual or supervised.
- Deal Pack is low-cost self-serve buyer-side support.
- Buying Buddy does not find cars, negotiate for buyers, or handle the whole purchase.

## Drafting Rules

Email drafts should be:

- Short.
- Plain English.
- Direct.
- Australian tone.
- Specific about next step.
- Consistent with launch pricing and scope.

Do not include:

- $997 offers.
- Concierge claims.
- "We find the car" promises.
- Legal advice positioning.
- Mechanical inspection guarantees.
- Secret links, tokens, or internal dashboard URLs.

## Inbox Triage Buckets

- `urgent-money` - payment, refund, duplicate charge, failed order.
- `urgent-safety` - scam risk, finance owing, unsafe handover, seller pressure.
- `needs-reply` - normal customer question.
- `fulfilment` - PPSR/report/deal-pack delivery work.
- `supplier` - platform, vendor, partner, or tool provider.
- `fyi` - no action unless Jordan asks.

## Before Any Agent Reads Mail

Confirm:

- Which mailbox to search.
- Date range or search query.
- Whether the agent may draft only or draft and send.
- Whether attachments may be opened.
```

- [ ] **Step 3: Verify product guardrail terms are framed as banned terms**

Run:

```powershell
rg -n "\$997|concierge|Pullenvale|standalone public AI buddy" docs\command-center\agents.md docs\command-center\email-ops.md
```

Expected: matches only inside guardrail or banned-content sections.

- [ ] **Step 4: Commit Task 3**

Run:

```powershell
git add docs\command-center\agents.md docs\command-center\email-ops.md
git commit -m "docs: define buying buddy agent and email rules"
```

Expected: commit succeeds.

## Task 4: Create Context, Decisions, And Open Questions Docs

**Files:**

- Create: `docs/command-center/context-map.md`
- Create: `docs/command-center/decision-log.md`
- Create: `docs/command-center/open-questions.md`

- [ ] **Step 1: Create context-map doc**

Create `docs/command-center/context-map.md` with:

```markdown
# Context Map

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  
**Last verified:** 2026-05-05  

This file separates canon from evidence and archive.

## Canon

Use these as current truth:

- `AGENTS.md`
- `README.md`
- `docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md`
- `docs/BUYING_BUDDY_LAUNCH_PLAN.md`
- `docs/buyingbuddy-product-plan.md`
- `docs/command-center/README.md`
- `docs/command-center/release-state.md`
- `docs/command-center/platform-status.md`
- `docs/command-center/agents.md`
- `docs/command-center/email-ops.md`

## Reference

Use these for technical background, then check against canon:

- `BUILD_SPEC.md`
- `ENGINE_SPEC.md`
- `DEAL_ROOM_SPEC.md`
- `DIRECTORY_ARCHITECTURE.md`
- `docs/audits/2026-04-phase-1/drift-register.md`

## Archive And Evidence

These locations may contain useful history but are not truth by default:

- `C:\Users\jrl-j\OpenClaw_Extract\buyingbuddy-memory`
- `C:\Users\jrl-j\OpenClaw_Archive`
- `C:\Users\jrl-j\.openclaw`
- Hermes mission folders under `.openclaw\workspace\codex_missions`
- Claude CLI history
- Codex history
- Repo `handover` archive files
- Repo `docs/archive`

## Promotion Rule

Before archive material can influence product or implementation:

1. Extract the exact claim.
2. Compare it with canon.
3. Mark it as confirmed, stale, rejected, or open.
4. Copy only the confirmed part into a command-center doc or current project doc.
5. Leave the archive source as archive.

## Known Archive Notes

- Old OpenClaw/Hermes/Claude context includes useful audit and Stripe findings.
- Old context also includes stale pricing, public AI buddy ideas, Pullenvale buyer-agent SEO, PPI service scope, and historical secret-looking values.
- Treat historical secret-looking values as compromised until Jordan confirms rotation or safety.
- Do not copy old product copy into public pages without checking `docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md`.
```

- [ ] **Step 2: Create decision-log doc**

Create `docs/command-center/decision-log.md` with:

```markdown
# Decision Log

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  

Append decisions here when they change product, platform, release, agent, email, or operational control.

## 2026-05-05 - Repo-Local Command Center First

**Decision:** Build the Buying Buddy command center inside the `buyingbuddy-web` repo before creating a broader JordanOS hub.

**Reason:** Buying Buddy has active live-site drift and multiple agents/tools touching context. The repo is already tied to GitHub and Vercel, so it is the cleanest source of truth.

**Impact:** Agents must read command-center docs before using old terminal history, OpenClaw output, Hermes missions, or dashboard assumptions.

## 2026-05-05 - GitHub/Repo Wins Over Terminal History

**Decision:** Terminal history and local agent memories are evidence, not truth.

**Reason:** The local machine contains multiple stale experiments and archive folders.

**Impact:** Useful archive findings must be promoted through `docs/command-center/context-map.md` before becoming operational guidance.

## 2026-05-05 - Level 3 Actions Require Jordan Approval

**Decision:** Deploys, customer email sends, Stripe changes, Supabase production changes, DNS changes, Vercel env changes, and secret rotation require explicit Jordan approval.

**Reason:** These actions can affect money, customers, production data, or live availability.

**Impact:** Agents can prepare and verify, but they cannot mutate external production systems without current-thread approval.
```

- [ ] **Step 3: Create open-questions doc**

Create `docs/command-center/open-questions.md` with:

```markdown
# Open Questions

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  
**Last verified:** 2026-05-05  

Only unresolved operational questions belong here.

## Platform

- Is SiteGround still attached to Buying Buddy in any active way, or is it old context only?
- Which exact Google mailbox handles `info@buyingbuddy.com.au` customer conversations?
- Should Vercel deploys happen only through GitHub push, or is manual `vercel --prod` approved as a backup path?
- Which production env vars are required for launch versus future/legacy routes?

## Stripe

- Is Stripe currently in test mode, live mode, or mixed across local and production?
- What is the current production webhook endpoint in Stripe?
- Has `STRIPE_WEBHOOK_SECRET` been added to Vercel production env?
- Which Stripe products/prices are live and customer-facing?

## Supabase

- Which Supabase project is production?
- Which tables are required for launch-critical flows?
- Does any production table need backup/export before deploy?

## Email

- Should agents be allowed to draft only, or can Jordan approve send-on-command for specific inbox tasks?
- Which transactional email templates need a launch copy audit?
- What customer support SLA should be used for paid PPSR/Deal Pack customers?

## Agents

- Should Claude CLI and OpenClaw have write access to this repo, or read/draft only?
- Should Hermes missions stay outside this repo unless promoted through the context map?
- Should a future JordanOS index include DealPilot and Buying Buddy, or stay separate until Buying Buddy is stable?
```

- [ ] **Step 4: Verify docs exist**

Run:

```powershell
Test-Path docs\command-center\context-map.md
Test-Path docs\command-center\decision-log.md
Test-Path docs\command-center\open-questions.md
```

Expected:

```text
True
True
True
```

- [ ] **Step 5: Commit Task 4**

Run:

```powershell
git add docs\command-center\context-map.md docs\command-center\decision-log.md docs\command-center\open-questions.md
git commit -m "docs: map buying buddy context and decisions"
```

Expected: commit succeeds.

## Task 5: Create Operating Runbooks

**Files:**

- Create: `docs/command-center/runbooks/deploy.md`
- Create: `docs/command-center/runbooks/live-drift-check.md`
- Create: `docs/command-center/runbooks/stripe-webhooks.md`
- Create: `docs/command-center/runbooks/supabase-health.md`
- Create: `docs/command-center/runbooks/customer-email.md`

- [ ] **Step 1: Create deploy runbook**

Create `docs/command-center/runbooks/deploy.md` with:

```markdown
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
```

- [ ] **Step 2: Create live drift runbook**

Create `docs/command-center/runbooks/live-drift-check.md` with:

```markdown
# Live Drift Check Runbook

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  

Use this after deploy and whenever the live site feels wrong.

## Route Status Check

Run:

```powershell
$routes = @("/", "/check", "/ppsr", "/pricing", "/deal", "/buddy", "/ppi", "/car-buyers-agent-pullenvale", "/sitemap.xml", "/robots.txt")
foreach ($route in $routes) {
  $url = "https://buyingbuddy.com.au$route"
  $status = curl.exe -I -L $url 2>$null | Select-String -Pattern "HTTP/"
  Write-Output "$route"
  Write-Output $status
}
```

Expected:

- Primary routes return 200 after redirects.
- `/buddy` ends at `/check`.
- `/ppi` ends at `/inspect`.
- `/car-buyers-agent-pullenvale` ends at `/`.

## Copy Drift Scan

Run:

```powershell
$routes = @("/", "/pricing", "/ppsr", "/check", "/deal", "/sitemap.xml")
$terms = @("997", "Pullenvale", "concierge", "we find", "we negotiate", "full-service buyer", "/buddy", "/ppi", "car-buyers-agent-pullenvale")
foreach ($route in $routes) {
  $body = curl.exe -L "https://buyingbuddy.com.au$route"
  foreach ($term in $terms) {
    $count = ([regex]::Matches(($body -join "`n"), [regex]::Escape($term), "IgnoreCase")).Count
    if ($count -gt 0) {
      Write-Output "$route`t$term`t$count"
    }
  }
}
```

Expected:

- No stale public sales copy for $997, concierge, sourcing, or full-service buyer-agent work.
- Sitemap does not list redirected off-scope routes.
- Mentions of buyer-agent language are generic comparison language only.

## Manual Page Checks

Open and inspect:

- `https://buyingbuddy.com.au/`
- `https://buyingbuddy.com.au/pricing`
- `https://buyingbuddy.com.au/ppsr`
- `https://buyingbuddy.com.au/check`

Required:

- Homepage promise is self-serve buyer-side help.
- Primary CTA is Free Listing Check or equivalent.
- PPSR price is $4.95.
- Deal Pack price is $9.99.
- No public $997 or concierge pitch.
```

- [ ] **Step 3: Create Stripe webhook runbook**

Create `docs/command-center/runbooks/stripe-webhooks.md` with:

```markdown
# Stripe Webhooks Runbook

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  

Use this before relying on paid flows.

## Safety Rule

Do not change Stripe products, prices, webhook endpoints, live/test mode, or refunds without explicit Jordan approval.

## Code Paths

Inspect:

```powershell
Get-Content src\lib\stripe.ts
Get-Content src\app\api\stripe\webhook\route.ts
```

Expected current launch products:

- PPSR Report - $4.95.
- Deal Pack - $9.99.
- Hidden/future Quick Review is not public front-door copy.

## Vercel Env Check

Run:

```powershell
vercel env ls | Select-String "STRIPE"
vercel env ls | Select-String "SITE_URL"
```

Required env names for production payment safety:

- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL` or `SITE_URL`

## Dashboard Check

In Stripe dashboard, verify:

- Account mode being inspected: test or live.
- Active products and prices match launch truth.
- Webhook endpoint is `https://buyingbuddy.com.au/api/stripe/webhook`.
- Webhook signing secret exists and is copied only into Vercel env, never docs.
- Events include `checkout.session.completed`.
- Refund handling expectations are documented before relying on automated refund state.

## Known Risk From Code Inspection

If `STRIPE_WEBHOOK_SECRET` is absent, webhook verification can fall back to parsing raw JSON. That is not acceptable for production payment reliability.

Required outcome before production reliance:

- `STRIPE_WEBHOOK_SECRET` present in Vercel production env.
- Webhook route verifies Stripe signatures in production.
- Email/Telegram failures do not create duplicate customer-facing payment problems.
```

- [ ] **Step 4: Create Supabase health runbook**

Create `docs/command-center/runbooks/supabase-health.md` with:

```markdown
# Supabase Health Runbook

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  

Use this before relying on app data flows.

## Safety Rule

Do not change Supabase production data, policies, or schema without explicit Jordan approval.

## Code Inspection

Run:

```powershell
npm ls @supabase/supabase-js
Get-Content src\lib\supabase.ts
rg -n "\.from\(" src
```

Known app tables from code inspection:

- `orders`
- `email_captures`
- `deals`
- `known_issues_cache`

## Env Check

Run:

```powershell
vercel env ls | Select-String "SUPABASE"
```

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Dashboard Check

In Supabase dashboard, verify:

- Which project is production.
- Tables exist for launch-critical flows.
- Row-level security and policies are understood before exposing new client writes.
- Recent order/email/deal writes exist if production has live traffic.
- No manual destructive changes are pending.

## Launch-Critical Data Flows

- Free Listing Check email capture.
- Stripe order creation or update.
- Deal Pack room creation.
- Admin stats if admin dashboard is used.

If any launch-critical flow is not backed by a real table or reliable fallback, record it in `docs/command-center/open-questions.md`.
```

- [ ] **Step 5: Create customer email runbook**

Create `docs/command-center/runbooks/customer-email.md` with:

```markdown
# Customer Email Runbook

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  

Use this for inbox triage, support replies, fulfilment replies, and customer-facing drafts.

## Approval Gate

Agents draft by default. Jordan approves sends unless he explicitly grants send authority in the current thread.

## Before Reading Mail

Confirm:

- Mailbox.
- Search query or date range.
- Whether attachments may be opened.
- Whether task is classify only, draft reply, or send after approval.

## Triage Buckets

- `urgent-money` - payment, refund, duplicate charge, checkout issue, failed delivery after payment.
- `urgent-safety` - scam risk, finance owing, unsafe handover, seller pressure.
- `fulfilment` - PPSR, Deal Pack, report, contract pack, or free-kit delivery.
- `needs-reply` - normal customer question.
- `supplier` - vendor, platform, partner, bank, registrar, tool provider.
- `fyi` - no action unless Jordan asks.

## Draft Format

Use:

- Short subject if creating a new email.
- Direct opening sentence.
- One clear next step.
- No corporate filler.
- No promise outside the product truth.

## Escalate To Jordan

Escalate:

- Refund requests.
- Complaints.
- Legal threats.
- Chargebacks.
- Payment disputes.
- Safety concerns.
- Anything asking Buying Buddy to find, negotiate, inspect, or guarantee a car.

## Product Promise Guardrail

Allowed:

- Same business day, usually within 2 hours for PPSR while fulfilment is manual or supervised.
- Buyer-side self-serve help.
- Practical QLD-first private-sale paperwork support.

Not allowed:

- $997 public service.
- Concierge service.
- Car sourcing.
- Negotiation-for-you.
- Full-service buyer-agent promise.
- Mechanical guarantee.
```

- [ ] **Step 6: Verify runbooks exist**

Run:

```powershell
Test-Path docs\command-center\runbooks\deploy.md
Test-Path docs\command-center\runbooks\live-drift-check.md
Test-Path docs\command-center\runbooks\stripe-webhooks.md
Test-Path docs\command-center\runbooks\supabase-health.md
Test-Path docs\command-center\runbooks\customer-email.md
```

Expected:

```text
True
True
True
True
True
```

- [ ] **Step 7: Commit Task 5**

Run:

```powershell
git add docs\command-center\runbooks
git commit -m "docs: add buying buddy operating runbooks"
```

Expected: commit succeeds.

## Task 6: Wire Command Center Into Existing Entrypoints

**Files:**

- Modify: `AGENTS.md`
- Modify: `README.md`

- [ ] **Step 1: Update AGENTS.md required read list**

Modify the top list in `AGENTS.md` to:

```markdown
Before changing this project, read:

- `docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md`
- `docs/command-center/README.md`
- `docs/buyingbuddy-product-plan.md`
- `docs/audits/2026-04-phase-1/drift-register.md`
```

Do not change the existing launch truth or drift rules below the list.

- [ ] **Step 2: Update README start section**

Modify the `## Start here` section in `README.md` to:

```markdown
## Start here

**Product truth:** `/docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md` - current positioning, pricing, scope, and anti-drift rules.

**Ops truth:** `/docs/command-center/README.md` - current agent, release, platform, email, and runbook control.

**Locked product plan:** `/docs/buyingbuddy-product-plan.md` - original locked product plan from 16 April 2026.

Anything else in this repo is either (a) a technical spec that may pre-date the plan, (b) command-center operational guidance, or (c) archived in `/docs/archive/2026-04-pre-lock/`.
```

Keep the rest of the README unchanged unless the existing text directly contradicts this section.

- [ ] **Step 3: Verify entrypoint links**

Run:

```powershell
Test-Path docs\BUYING_BUDDY_CENTRE_OF_TRUTH.md
Test-Path docs\command-center\README.md
Test-Path docs\buyingbuddy-product-plan.md
Test-Path docs\audits\2026-04-phase-1\drift-register.md
```

Expected:

```text
True
True
True
True
```

- [ ] **Step 4: Commit Task 6**

Run:

```powershell
git add AGENTS.md README.md
git commit -m "docs: wire command center into project entrypoints"
```

Expected: commit succeeds.

## Task 7: Verify Command Center

**Files:**

- Verify: `docs/command-center/**`
- Verify: `AGENTS.md`
- Verify: `README.md`

- [ ] **Step 1: Check all required files exist**

Run:

```powershell
$files = @(
  "docs\command-center\README.md",
  "docs\command-center\release-state.md",
  "docs\command-center\platform-status.md",
  "docs\command-center\agents.md",
  "docs\command-center\email-ops.md",
  "docs\command-center\context-map.md",
  "docs\command-center\decision-log.md",
  "docs\command-center\open-questions.md",
  "docs\command-center\runbooks\deploy.md",
  "docs\command-center\runbooks\live-drift-check.md",
  "docs\command-center\runbooks\stripe-webhooks.md",
  "docs\command-center\runbooks\supabase-health.md",
  "docs\command-center\runbooks\customer-email.md"
)
foreach ($file in $files) {
  if (-not (Test-Path $file)) {
    throw "Missing $file"
  }
}
Write-Output "All command-center files exist"
```

Expected:

```text
All command-center files exist
```

- [ ] **Step 2: Scan for unfinished-plan markers**

Run:

```powershell
$patterns = @(
  -join ([char[]](84,66,68)),
  -join ([char[]](84,79,68,79)),
  -join ([char[]](105,109,112,108,101,109,101,110,116,32,108,97,116,101,114)),
  -join ([char[]](102,105,108,108,32,105,110,32,100,101,116,97,105,108,115))
)
foreach ($pattern in $patterns) {
  rg -n $pattern docs\command-center AGENTS.md README.md
}
```

Expected: no matches.

- [ ] **Step 3: Scan for secret-looking values**

Run:

```powershell
$patterns = @(
  ("sk" + "_live"),
  ("sk" + "_test"),
  ("wh" + "sec_"),
  ("re" + "_[A-Za-z0-9]")
)
foreach ($pattern in $patterns) {
  rg -n $pattern docs\command-center docs\superpowers\specs docs\superpowers\plans
}
```

Expected: no matches.

- [ ] **Step 4: Check git state**

Run:

```powershell
git status --short --branch
```

Expected: no uncommitted command-center changes.

- [ ] **Step 5: Record final status**

Open `docs/command-center/release-state.md` and add one bullet under `## 2026-05-05 Audit Findings`:

```markdown
- Command-center docs were created locally and must be pushed before other agents can treat GitHub as updated.
```

- [ ] **Step 6: Commit final status update**

Run:

```powershell
git add docs\command-center\release-state.md
git commit -m "docs: finalize buying buddy command center status"
```

Expected: commit succeeds.

## Self-Review

Spec coverage:

- Repo-local command center: covered by Tasks 1-6.
- Release state: covered by Task 2 and Task 7.
- Platform inventory: covered by Task 2.
- Agent authority model: covered by Task 3.
- Email ops: covered by Task 3 and Task 5.
- Context/archive quarantine: covered by Task 4.
- Runbooks: covered by Task 5.
- Entry point wiring: covered by Task 6.
- Verification: covered by Task 7.

No independent subsystem split is needed for this plan because the output is one cohesive documentation/control-plane layer. External mutations, deploys, dashboard changes, and email access are explicitly outside this implementation plan.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-05-buyingbuddy-command-center.md`. Two execution options:

**1. Subagent-Driven (recommended)** - dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** - execute tasks in this session using executing-plans, batch execution with checkpoints.

Recommended choice for Jordan: Inline Execution. This is a docs/control-plane implementation with a small write surface, so inline execution avoids overhead and keeps one accountable thread.
