# Codex Model Delegation Policy

Goal: use the weekly Codex allowance deliberately instead of accidentally burning premium reasoning on grunt work.

## Live Model Probe Result

Checked through Codex OAuth from this machine.

Available:

- `gpt-5.5`
- `gpt-5.4`
- `gpt-5.4-mini`

Not available:

- `gpt-5.5-mini`
- `gpt-5.5-pro`
- `gpt-5.4-pro`

Default current OpenClaw model:

- `openai-codex/gpt-5.5`

## Routing Rules

### Tier 1: Hard reasoning / owner agent

Use `gpt-5.5` with high or xhigh reasoning.

Use for:

- architecture
- launch decisions
- high-risk code review
- failure taxonomy
- security/privacy decisions
- production debugging
- strategy and conversion tradeoffs
- final audit before deploy

Do not use for:

- mass copy rewrites
- formatting docs
- simple grep/read summaries
- fixture generation
- routine smoke-test summarisation

### Tier 2: Normal coding / feature worker

Use `gpt-5.4` with medium/high reasoning.

Use for:

- Next.js route/component implementation
- test writing
- refactors with clear scope
- API integration cleanup
- build error fixes
- docs with technical detail

### Tier 3: Light/repetitive worker

Use `gpt-5.4-mini` with low/medium reasoning unless quality drops.

Use for:

- checking many pages/files for obvious issues
- writing simple smoke-test reports
- generating copy variants
- fixture expansion
- lint-style pass
- changelog/diff summaries
- cron/task documentation

Escalate to `gpt-5.4` or `gpt-5.5` if:

- it proposes risky changes
- it cannot explain a failing test
- it touches money, auth, secrets, production deploy, or privacy
- it needs broad project context

## Delegation Pattern

Owner loop stays on `gpt-5.5`:

1. Define task and acceptance criteria.
2. Spawn lower-tier agent for isolated subtask.
3. Demand concrete output: files changed, tests run, risks.
4. Owner audits before merge/deploy.
5. Owner runs final build/test gate.

Sub-agents should not deploy, send messages, edit secrets, or make irreversible changes unless explicitly authorised.

## Usage Budget Strategy

Weekly aim: use close to 100% of allowance, but keep a reserve for emergencies.

Suggested rhythm:

- Early week: spend heavier on architecture, backlog cleanup, and hard code work.
- Midweek: run implementation and QA batches.
- Late week: if allowance remains high, do speculative improvements, refactors, tests, docs, and agents-on-agent audits.
- Final 24 hours before reset: burn surplus on low-risk backlog cleanup, documentation, test expansion, and codebase review.
- Always keep 5-10% unspent if active production work is underway.

## Weekly Work Session Suggestions

If weekly usage is under 35% with more than 3 days left:

- schedule one deep build session
- use `gpt-5.5` for planning/review
- delegate code/test/docs chunks to `gpt-5.4`/`gpt-5.4-mini`

If weekly usage is 35-75%:

- keep normal balanced routing
- reserve `gpt-5.5` for owner review and hard bugs

If weekly usage is over 75% and more than 24h remains:

- reduce exploratory xhigh sessions
- prefer `gpt-5.4-mini` for repetitive tasks
- batch questions before asking owner model

If weekly usage is over 90%:

- only use premium reasoning for production-critical work
- postpone speculative refactors until reset

If weekly usage is under 80% inside final 24h:

- run backlog burn-down: tests, docs, issue triage, copy polish, dependency review, QA passes

## Monitor Command

Run from the repo:

```bash
node scripts/codex-usage-monitor.mjs
```

The script reads local Codex session logs, finds the latest rate-limit telemetry, lists model usage by session metadata, and prints recommended routing for the current week.
