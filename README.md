# Buying Buddy — QLD Private Car Buyer Toolkit

**Live:** https://buyingbuddy.com.au
**Repo:** https://github.com/buyingbuddy-au/buyingbuddy-web
**Stack:** Next.js 15, TypeScript, Tailwind, Stripe, Resend

---

## Start here

**Product truth:** `/docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md` - current positioning, pricing, scope, and anti-drift rules.

**Ops truth:** `/docs/command-center/README.md` - current agent, release, platform, email, and runbook control.

**Locked product plan:** `/docs/buyingbuddy-product-plan.md` - original locked product plan from 16 April 2026.

Anything else in this repo is either (a) a technical spec that may pre-date the plan, (b) command-center operational guidance, or (c) archived in `/docs/archive/2026-04-pre-lock/`.

---

## Product at a glance

- **$4.95 PPSR Check** — instant, automated, self-serve.
- **$9.99 Deal Pack** — PPSR + QLD contract + inspection checklist + Deal Room.
- **Hidden $99 Quick Review** — post-purchase upsell only. Not advertised on public pages.

Not a buyer's agent. Not a concierge. Low-cost, self-serve toolkit.

---

## Architecture

```
src/app/          — Next.js pages (homepage, admin, product pages)
src/app/api/      — API routes (check, stripe, orders, pdf-report, free-kit, ppi)
src/lib/          — Core modules (engine, db, stripe, email, pdf, scraper, analysis)
```

Full technical reference: `BUILD_SPEC.md`, `ENGINE_SPEC.md`, `DEAL_ROOM_SPEC.md`, `DIRECTORY_ARCHITECTURE.md`. These may contain outdated pricing — the plan wins on conflict.

---

## Credentials

All in `.env.local` — **never commit this file**

- Stripe live keys
- Resend API key
- Admin password

---

## Deploy

Push to `main` branch → Vercel auto-deploys.

To deploy manually:
```bash
cd projects/buyingbuddy-web
vercel --prod
```

---

## Local dev

```bash
cd projects/buyingbuddy-web
npm install
npm run dev
```

---

*Last updated: 2026-04-16*
