> ⚠️ **Pricing / positioning in this file may be outdated.**
> For current product truth see `/docs/buyingbuddy-product-plan.md` (locked 2026-04-16).
> This doc is kept for technical reference (design system, architecture, specs) only.

# DIRECTORY_ARCHITECTURE.md — Buying Buddy

**Last updated:** 2026-03-31
**Based on:** Full forensic audit of all artifacts

---

## Recommended Structure

```
buyingbuddy-web/           ← THE product (everything deploys from here)
│
├── README.md              ← Entry point — where to start, what's broken, how to deploy
├── PRODUCT_TRUTH.md       ← What this product is and isn't (source of truth)
├── MVP_SCOPE.md           ← V1 features and blockers (ruthless scope control)
├── DECISIONS.md           ← Named decisions, dated, with rationale
├── OPEN_QUESTIONS.md      ← What needs Jordan's input before work proceeds
├── CONTEXT_SOURCES.md     ← Maps every artifact to its location and purpose
├── BUYING_BUDDY_HANDOVER.md ← New agent onboarding doc
│
├── src/                   ← Next.js app (everything that deploys)
│   ├── app/              ← Pages (homepage, admin, /free-kit, /ppi, /contract-pack)
│   ├── app/api/          ← API routes (check, stripe, orders, pdf-report, free-kit, ppi)
│   ├── components/       ← Reusable UI components
│   └── lib/              ← Engine modules (engine, db, stripe, email, pdf, scraper, analysis)
│
├── content/               ← All marketing and strategy content (moved from buyingbuddy-content/)
│   ├── email-nurture-sequence.md
│   ├── social-posts-launch.md
│   ├── google-ads-plan.md
│   └── WEEK1-EXECUTION.md  ← Archive after reading — week has passed
│
├── docs/                  ← Design and architecture reference
│   ├── BUILD_SPEC.md      ← V4 design spec (older, reference only)
│   ├── ENGINE_SPEC.md     ← Original tech spec (partially stale — verify against code)
│   └── SITE_COPY_V5.md   ← Approved copy and tone guide
│
├── handover/              ← Everything about the project for new agents/handoffs
│   ├── archive/           ← Stale work, superseded decisions, old plans
│   │   ├── DEPLOYMENT_AUDIT.md  ← Superseded by FIX_TRACKER
│   │   ├── WEEK1-PASSED.md       ← Week 1 execution, never executed
│   │   ├── AGENT-ROSTER-PREMATURE.md ← None of these agents are deployed
│   │   └── STRATEGY.md-REFERENCE.md ← Keep as reference, not active plan
│   └── FIX_TRACKER.md     ← Active bug/fix tracker (keep in root, not archived)
│
└── .env.local             ← Credentials (NEVER commit)

---

## Folder Purposes

### `content/`
**What goes here:** Marketing content, email sequences, social posts, ad plans, SEO strategy.
**What does NOT go here:** Code, API routes, UI components.
**Existing files to move:**
- `projects/buyingbuddy-content/email-nurture-sequence.md`
- `projects/buyingbuddy-content/social-posts-launch.md`
- `projects/buyingbuddy-content/google-ads-plan.md`

### `docs/`
**What goes here:** Design specs, architecture documents, approved copy guides.
**What does NOT go here:** Daily logs, task lists, or work-in-progress code.
**Existing files to move:**
- `projects/buyingbuddy-web/BUILD_SPEC.md`
- `projects/buyingbuddy-web/ENGINE_SPEC.md` (annotate stale sections)
- `projects/buyingbuddy-web/SITE_COPY_V5.md`

### `handover/`
**What goes here:** Anything a new agent or Jordan needs to understand the project state.
**What does NOT go here:** Build artifacts, `node_modules`, `.next/`.
**Existing files to move:** `FIX_TRACKER.md` stays active in root, not here.

### `handover/archive/`
**What goes here:** Superseded plans, old strategies, premature documents.
**Policy:** If it was never executed, if it was superseded, or if it's older than 2 weeks and not actively referenced — it goes here.
**Files to move:**
- `projects/buyingbuddy-content/WEEK1-EXECUTION.md` — never executed
- `projects/buyingbuddy-content/AGENT-ROSTER.md` — no agents deployed
- `buyingbuddy-web/DEPLOYMENT_AUDIT.md` — superseded by FIX_TRACKER

### `projects/buyingbuddy-inspection/` → ARCHIVE
**What it is:** Half-built PPI inspection tool with camera components.
**Verdict:** Not V1. Park until after V1 is working and calculator is built. Move entire folder to `handover/archive/buyingbuddy-inspection/`.

### `projects/buyingbuddy-content/` → MERGE + ARCHIVE
**What it is:** A dummy Next.js project with marketing content and strategy docs.
**Verdict:** Merge content files into `content/`. Archive the Next.js project shell since it was never deployed and the real product is in `buyingbuddy-web/`.

---

## Naming Conventions

| Type | Pattern | Example |
|---|---|---|
| Daily log | `YYYY-MM-DD-DESCRIPTION.md` | `2026-03-31-stripe-webhook-fix.md` |
| Decision | `YYYY-MM-DD-DECISION-WHAT.md` | `2026-03-31-decision-calculator-parked.md` |
| Feature spec | `FEATURE-DESCRIPTION.md` | `email-resend-wiring.md` |
| Handover | `YYYY-MM-DD-HANDOVER.md` | `2026-03-31-handover-jordan.md` |
| Archive | `YYYY-MM-DD-ARCHIVE-WHAT.md` | `2026-03-31-archive-old-plans.md` |

---

## Archive Policy

**Move to archive when:**
- A plan was for a time period that has passed without execution
- A feature spec was superseded by a later decision
- A project folder (like buyingbuddy-inspection/) is V2+ work
- A document's state has been replaced by a newer version

**Never delete archived material** — it contains decisions that may need to be recovered.

**Annual archive review** — at the end of each quarter, review `handover/archive/` and cull anything obviously redundant.

---

## Daily Log Pattern

```
# YYYY-MM-DD — [One line what happened today]

## What was done
- [specific thing]

## What broke
- [specific thing and why]

## What needs Jordan
- [question or decision needed]

## Tomorrow
- [top 3 priorities]
```

---

## Decision Log Pattern

```
## [YYYY-MM-DD] DECISION: <short title>

**What was decided:** <one sentence>

**Context:** <why this came up>

**Alternatives considered:** <what else was on the table>

**Who decides:** <Jordan / Agent / Pablo>

**Status:** OPEN / ✅ RESOLVED / ⚠️ CONTESTED
```

---

## Handover File Pattern

```
# [Project] — Handover
**Date:** YYYY-MM-DD
**From:** [agent/person]
**To:** [agent/person]

## Current state (one sentence)

## What works
- [list]

## What doesn't work
- [list]

## Today's top 3 priorities

## What to ask Jordan before proceeding

## What's been decided vs what's still open
```

---

## Phase 8: Reorganisation Execution

**What stays where it is:**
- `projects/buyingbuddy-web/` — the product, deployed
- All files in `projects/buyingbuddy-web/` with `✅ LIVE` or `⚠️ PARTIAL` status
- `FIX_TRACKER.md` — active, referenced daily

**What moves into `projects/buyingbuddy-web/content/`:**
- `projects/buyingbuddy-content/email-nurture-sequence.md`
- `projects/buyingbuddy-content/social-posts-launch.md`
- `projects/buyingbuddy-content/google-ads-plan.md`
- `projects/buyingbuddy-content/STRATEGY.md` (reference copy)
- `projects/buyingbuddy-content/WEEK1-EXECUTION.md` (archive)

**What goes to `projects/buyingbuddy-web/handover/archive/`:**
- `projects/buyingbuddy-content/AGENT-ROSTER.md` — premature, 0 agents deployed
- `projects/buyingbuddy-web/DEPLOYMENT_AUDIT.md` — superseded
- `projects/buyingbuddy-inspection/` (entire folder) — V2+, not V1
- `projects/buyingbuddy-content/` (empty Next.js shell) — never deployed, redundant

**What becomes the active docs in `projects/buyingbuddy-web/docs/`:**
- `projects/buyingbuddy-web/BUILD_SPEC.md` — keep, annotate
- `projects/buyingbuddy-web/ENGINE_SPEC.md` — keep, annotate stale sections
- `projects/buyingbuddy-web/SITE_COPY_V5.md` — keep

**Risks of reorganising:**
- The `buyingbuddy-content/` and `buyingbuddy-inspection/` folders are not referenced by the deployed app. Moving files causes zero breakage to the live site.
- The GitHub repo (`buyingbuddy-au/buyingbuddy-web`) will need a git mv to preserve history for moved files.
- Jordan should confirm before `buyingbuddy-inspection/` is archived — it's a real product concept, just not V1.
