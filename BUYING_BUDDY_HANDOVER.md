# BUYING_BUDDY_HANDOVER.md — Buying Buddy

**Last updated:** 2026-03-31
**Author:** Pablo
**For:** Any agent or person taking over this project

---

## One-sentence summary

Buying Buddy sells QLD private car buyers PDF reports: PPSR data, a dealer verdict, and private sale paperwork — with Jordan writing the verdict on the paid tiers.

---

## What works right now

- **Homepage** — `buyingbuddy.com.au` — live, teal/white/ink design
- **Free listing check** — paste a URL, get a verdict instantly
- **Stripe checkout** — all 3 tiers create Stripe Checkout sessions ($4.95, $14.95, $34.95)
- **Domain** — buyingbuddy.com.au resolves to Vercel ✅
- **DNS** — all records propagated (GoDaddy) ✅
- **Email domain** — Resend verified ✅
- **GitHub auto-deploy** — push to main → Vercel deploys automatically
- **Admin panel** — `/admin` shows order list and detail pages

---

## What doesn't work (V1 blockers)

These must be fixed before the product actually delivers anything:

| Blocker | Where | Fix |
|---|---|---|
| Stripe webhook not configured | Stripe dashboard → Webhooks | Add endpoint, get secret, add to Vercel env vars |
| Email not wired | `buyingbuddy-web/src/lib/email.ts` | Replace `console.info()` with Resend API call |
| PDF is stub | `buyingbuddy-web/src/lib/pdf.ts` | Implement real PDF generation with jspdf |

---

## How the product is supposed to work

```
Customer lands on homepage
    ↓
Pastes listing URL → gets instant free verdict (this works ✅)
    ↓
Pays $14.95 for Dealer Review → Stripe Checkout (this works ✅)
    ↓
Stripe webhook fires → order created (BROKEN ❌)
    ↓
Order appears in /admin (BROKEN until webhook works)
    ↓
Jordan writes verdict, enters into admin
    ↓
Clicks "Send Report" → PDF generated + emailed to customer (BOTH BROKEN)
    ↓
Customer receives branded PDF in inbox
```

---

## Where things live

- **Live site:** https://buyingbuddy.com.au
- **Admin:** https://buyingbuddy.com.au/admin
- **Repo:** https://github.com/buyingbuddy-au/buyingbuddy-web
- **Source files:** `projects/buyingbuddy-web/src/`
- **API routes:** `src/app/api/` (check, stripe, orders, pdf-report, free-kit, ppi)
- **PDF lib:** `src/lib/pdf.ts` — STUB
- **Email lib:** `src/lib/email.ts` — STUB
- **Engine:** `src/lib/engine.ts` — order creation, product validation, admin auth
- **DB:** `src/lib/db.ts` — SQLite (partially migrated to stateless)
- **Stripe:** `src/lib/stripe.ts` — checkout session creation

---

## Jordan's role in V1

Jordan is THE product. He writes every dealer verdict. His name doesn't appear on the site but his expertise is the differentiator.

- **$14.95 Dealer Review:** Jordan opens the listing, writes a verdict (~15-20 min), enters it in admin, clicks send
- **$34.95 Full Pack:** Same as above, plus negotiation script and contract bundle

No AI writes the dealer verdict. No automation produces the report. Jordan's expertise is the thing being sold.

---

## Credentials

All stored in `buyingbuddy-web/.env.local` (NOT committed to git):

- `STRIPE_SECRET_KEY` — live key
- `STRIPE_PUBLISHABLE_KEY` — live key
- `RESEND_API_KEY` — re_N78vbUP6_25JC9NdZvimraNB5adGJ5i4o
- `ADMIN_PASSWORD` — set by Jordan on first admin login
- Info email: info@buyingbuddy.com.au
- Stripe/Resend/GitHub all use this email

---

## Today's priorities (2026-03-31)

1. Configure Stripe webhook (Jordan needs to do this in Stripe dashboard)
2. Wire Resend into email.ts (agent task, 15 min)
3. Implement pdf.ts (agent task, 30 min)
4. Jordan runs a real end-to-end test purchase
5. Archive stale folders (buyingbuddy-content/ and buyingbuddy-inspection/)

---

## What to ask Jordan

1. What is the URL for the Stripe webhook endpoint? (buyingbuddy.com.au/api/stripe/webhook or the Vercel preview URL?)
2. What is his admin password? (for /admin access)
3. When does he do dealer reviews? (what time window per day?)
4. What format does his verdict take? (structured template or free text?)

---

## What NOT to do without asking

- Do not change the Stripe product prices
- Do not modify the Resend API key
- Do not touch the domain DNS settings
- Do not delete any orders from the database
- Do not change the copy voice (see SITE_COPY_V5.md)
- Do not add new Stripe products without Jordan's approval
