# CONTEXT_SOURCES.md — Buying Buddy

**Last updated:** 2026-03-31
**Purpose:** Maps every relevant artifact. Future agents use this to find what exists without digging through everything.

---

## LIVE PRODUCT

### buyingbuddy.com.au
- **URL:** https://buyingbuddy.com.au
- **Repo:** https://github.com/buyingbuddy-au/buyingbuddy-web
- **Deploy:** Vercel (auto-deploys on push to main)
- **Stack:** Next.js 15 App Router, TypeScript, Tailwind, Stripe, Resend
- **Admin:** https://buyingbuddy.com.au/admin (password: ?)

### Project root
`projects/buyingbuddy-web/`

---

## CORE ARTIFACTS

| File | Path | What it is | When to use |
|---|---|---|---|
| PRODUCT_TRUTH.md | `buyingbuddy-web/` | What this product is and isn't | Every decision |
| MVP_SCOPE.md | `buyingbuddy-web/` | V1 feature list and blockers | Before building anything |
| DECISIONS.md | `buyingbuddy-web/` | Named decisions made | Before re-litigating anything |
| OPEN_QUESTIONS.md | `buyingbuddy-web/` | What needs Jordan's call | Before assuming |
| SITE_COPY_V5.md | `buyingbuddy-web/` | Approved copy and tone | Before writing content |
| BUILD_SPEC.md | `buyingbuddy-web/` | Design system (V4, older) | Design decisions |
| ENGINE_SPEC.md | `buyingbuddy-web/` | Technical architecture (partially stale) | Before touching backend — verify against actual code |
| FIX_TRACKER.md | `buyingbuddy-web/` | What's broken and what's waiting | Daily standup reference |
| DEPLOYMENT_AUDIT.md | `buyingbuddy-web/` | 4/10 readiness score (dated, superseded by FIX_TRACKER) | Historical context only |
| BUYING_BUDDY_HANDOVER.md | `buyingbuddy-web/` | Agent onboarding (to be created) | New agent to project |

---

## CONTENT (what's written but not wired)

| File | Path | What it is | Status |
|---|---|---|---|
| email-nurture-sequence.md | `buyingbuddy-content/` | 5-email sequence written | Written, not wired |
| social-posts-launch.md | `buyingbuddy-content/` | 10 social posts written | Written, not posted |
| google-ads-plan.md | `buyingbuddy-content/` | 3 campaign plans written | Written, not launched |
| STRATEGY.md | `buyingbuddy-content/` | Full business plan | Reference only, 30-day plan not executed |
| WEEK1-EXECUTION.md | `buyingbuddy-content/` | Week 1 actions | Never executed, archive candidate |
| AGENT-ROSTER.md | `buyingbuddy-content/` | 7 AI agents named | None deployed, archive candidate |
| chairmans-blogs.md | `buyingbuddy-content/` | Blog post drafts | Unclear if published |
| MORNING-BRIEF-30MAR.md | `buyingbuddy-content/` | Morning brief format | Reference |

---

## EXTERNAL SERVICES

| Service | Status | Credentials location |
|---|---|---|
| Stripe | Payments working, webhook broken | `buyingbuddy-web/.env.local` |
| Resend | API key exists, not wired | `buyingbuddy-web/.env.local` (re_N78vbUP6_...) |
| Vercel | Deploys from GitHub | GitHub: buyingbuddy-au repo |
| Domain (buyingbuddy.com.au) | DNS propagated | GoDaddy: lansbury2002@gmail.com |
| GitHub | Account: buyingbuddy-au | buyingbuddy-web/.env.local |
| Email (info@) | Used for Stripe/Resend/GitHub login | buyingbuddy-web/.env.local |

---

## RELATED BUT SEPARATE PROJECTS

These are NOT Buying Buddy. Do not mix into Buying Buddy work:

| Project | Location | What it is |
|---|---|---|
| Market Floor | `C:\Users\jrl-j\market-floor\` | Car trading CRM (Autograb leads) |
| Punters Club | `C:\Users\jrl-j\punters-club\` | Horse racing tipping app |
| HerdBase | `C:\Users\jrl-j\herdbase\` | Cattle farm management |
| SEQ Automotive | External | Jordan's car trading business |
| Autograb | External ($1,200/month) | Car deal sourcing |

---

## MEMORY LOGS

Daily logs with Buying Buddy mentions:

| Date | File | Key mentions |
|---|---|---|
| 2026-03-24 | memory/2026-03-24.md | Project identified, first plan |
| 2026-03-25 | memory/2026-03-25.md | Engine built, site on localhost:3003 |
| 2026-03-26 | memory/2026-03-26.md | Full god mode, domains, Stripe keys, pages built |
| 2026-03-27 | memory/2026-03-27.md | Vercel deploy blocked then fixed, DNS setup |
| 2026-03-28 | memory/2026-03-28.md | Site live, Resend DNS, overnight builds, Facebook banned |
| 2026-03-29 | memory/2026-03-29.md | Cost lesson, FB page parked, strategy discussion |
| 2026-03-30 | memory/2026-03-30.md | Agents briefed, market floor + HerdBase discussed |
| 2026-03-31 | memory/2026-03-31.md | Current session |

---

## ARCHIVE CANDIDATES (to be moved)

| Path | Why archive | What to keep |
|---|---|---|
| `projects/buyingbuddy-content/` | Dummy Next.js project, content moved to /content/ | All .md files worth keeping |
| `projects/buyingbuddy-inspection/` | V2 concept, not V1 | buyingbuddy-inspection/ entire folder |
| `projects/buyingbuddy-content/WEEK1-EXECUTION.md` | Week has passed, never executed | Move to handover/archive/ |
| `projects/buyingbuddy-content/AGENT-ROSTER.md` | Premature, zero agents deployed | Move to handover/archive/ |
| `buyingbuddy-web/DEPLOYMENT_AUDIT.md` | Superseded by FIX_TRACKER | Keep in docs/ as historical |

---

## HOW TO WORK ON THIS PROJECT

1. Read `PRODUCT_TRUTH.md` first — understand what it is
2. Read `MVP_SCOPE.md` — understand what's in V1
3. Read `DECISIONS.md` — understand what's already been decided
4. Read `OPEN_QUESTIONS.md` — know what needs Jordan's input
5. Check `FIX_TRACKER.md` — know what's broken today
6. Check memory/ for recent context

**Never:** Build features not in MVP_SCOPE.md without Jordan's approval.
**Never:** Change the copy voice from SITE_COPY_V5.md without Jordan's approval.
**Never:** Touch Stripe, Resend, or domain settings without telling Jordan first.
