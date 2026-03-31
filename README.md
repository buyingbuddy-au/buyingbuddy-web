# Buying Buddy — QLD Private Car Buyer Protection

**Live:** https://buyingbuddy.com.au
**Repo:** https://github.com/buyingbuddy-au/buyingbuddy-web
**Stack:** Next.js 15, TypeScript, Tailwind, Stripe, Resend

---

## Start here

1. Read `PRODUCT_TRUTH.md` — what this is
2. Read `MVP_SCOPE.md` — what's V1
3. Read `DECISIONS.md` — what's already been decided
4. Read `OPEN_QUESTIONS.md` — what's waiting on Jordan
5. Read `CONTEXT_SOURCES.md` — where everything lives

---

## V1 blockers (fix before anything else)

| # | Blocker | Owner |
|---|---|---|
| 1 | Stripe webhook not configured | Jordan |
| 2 | email.ts is a stub | Agent |
| 3 | pdf.ts is a stub | Agent |
| 4 | End-to-end test never run | Jordan |

See `FIX_TRACKER.md` for full list.

---

## Architecture

```
src/app/          — Next.js pages (homepage, admin, product pages)
src/app/api/      — API routes (check, stripe, orders, pdf-report, free-kit, ppi)
src/lib/          — Core modules (engine, db, stripe, email, pdf, scraper, analysis)
```

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

## Jordan's role

Jordan is the product on paid tiers. Every $14.95 Dealer Review requires Jordan to open the listing, write a verdict, and click "Send Report" in the admin panel. The business cannot scale beyond Jordan's time without rearchitecting.

---

*Last updated: 2026-03-31*
