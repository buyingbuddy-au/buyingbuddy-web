# Buying Buddy — QLD Private Car Buyer Toolkit

**Live:** https://buyingbuddy.com.au
**Repo:** https://github.com/buyingbuddy-au/buyingbuddy-web
**Stack:** Next.js 15, TypeScript, Tailwind, Stripe, Resend

---

## Start here

**→ `/docs/buyingbuddy-product-plan.md`** — the locked product plan (16 April 2026). This is the single source of truth for positioning, pricing, scope, and anti-drift rules.

Anything else in this repo is either (a) a technical spec that pre-dates the plan (banner at top points back here), or (b) archived in `/docs/archive/2026-04-pre-lock/`.

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
