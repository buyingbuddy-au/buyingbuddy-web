# Stripe Test-Mode Readiness & Checkout Journey Audit

**Date:** 6 April 2026  
**Scope:** Workstream 5 + checkout parts of Workstream 6

---

## 🔴 BLOCKER: Live Stripe keys in local .env.local

The `.env.local` file contains **live Stripe keys** (`sk_live_...`, `pk_live_...`).

This means:
- Any local `npm run dev` testing hits **real Stripe** and charges real money
- Jordan cannot safely test the full checkout flow without switching to test keys
- The Vercel deployment likely also uses live keys (needs checking on Vercel dashboard)

### Fix Required (Jordan must action)
1. Log into [Stripe Dashboard → Developers → API Keys](https://dashboard.stripe.com/test/apikeys)
2. Toggle to **Test mode** (top-right toggle)
3. Copy the **test** publishable key (`pk_test_...`) and secret key (`sk_test_...`)
4. Update `.env.local` locally:
   ```
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```
5. For Vercel: update the env vars in Vercel dashboard → Settings → Environment Variables
6. **Do NOT switch to live until Jordan explicitly approves**

### Stripe Webhook Secret
- `.env.local` is **missing** `STRIPE_WEBHOOK_SECRET`
- The webhook handler in `src/app/api/stripe/webhook/route.ts` gracefully falls back to `JSON.parse` when no secret is set — this works for testing but is **insecure for production**
- For test mode: create a webhook endpoint in Stripe Test dashboard pointing to `https://buyingbuddy.com.au/api/stripe/webhook` and use the provided `whsec_...` secret
- Or use `stripe listen --forward-to localhost:3000/api/stripe/webhook` for local dev

---

## ✅ What's Working Well

| Area | Status | Notes |
|------|--------|-------|
| PPSR checkout flow (`/ppsr`) | ✅ Clean | Form validates email + VIN/rego, hits `/api/stripe/checkout`, redirects to Stripe |
| Deal Room flow (`/deal`) | ✅ Clean | Creates deal in DB first, then redirects to Stripe. Success redirects to `/deal/{id}` |
| Stripe checkout session creation | ✅ Solid | `src/lib/stripe.ts` correctly builds sessions with metadata, success/cancel URLs |
| Webhook handler | ✅ Idempotent | Checks for existing orders/deals before creating. Handles both PPSR and Deal Room |
| Success page (`/order/success`) | ✅ Works | Loads order by session_id, shows product-specific messaging |
| Product definitions | ✅ Consistent | 4 paid products defined: ppsr ($4.95), dealer_review ($14.95), full_pack ($34.95), deal_room ($39.95) |
| Upgrade cards in free check | ✅ Smart | PPSR, Dealer Review, Full Pack upsells after free check results |
| Telegram notifications | ✅ Good | PPSR orders and Deal Room creation both notify Jordan |
| Email confirmations | ✅ Good | PPSR and Deal Room both send confirmation emails |

---

## ⚠️ Issues Found (Ordered by Impact)

### 1. Cancel URL is a dead end (Medium)
**What:** When a user cancels Stripe checkout, they're sent to `/?checkout=cancelled` or `/deal?checkout=cancelled`. Neither page reads or displays this parameter — the user just sees the homepage/deal page with zero feedback.

**Fix:** Add a toast/banner on homepage and deal page that detects `?checkout=cancelled` and shows "Checkout cancelled. You weren't charged." Simple client component or useSearchParams check.

**Status:** Plan only — needs a small client component or wrapper.

### 2. Contract Pack has no Stripe checkout (Low — by design)
**What:** `/contract-pack` is now a **free download** via email gate (HandoverPackButton component). The pricing page still shows it at $9.95 and links to `/contract-pack`.

**Assessment:** This is intentional — the contract pack moved to a free lead-gen model. The pricing page copy is stale though.

**Fix needed:** Update pricing page: either remove the $9.95 price or change the card to say "Free" with updated copy. Currently misleading.

### 3. Dealer Review and Full Pack have no dedicated purchase pages (Low)
**What:** Pricing page links Dealer Review to `/check` and Full Pack to `/check`. These products are only purchasable through the upgrade cards shown after a free check result. No standalone purchase pages exist.

**Assessment:** This is workable but means a user who lands on `/pricing` and clicks "Start Review" ends up on the free check page with no direct way to buy. The upgrade path only appears after running a check.

**Fix:** Either create dedicated purchase pages, or add a note on the pricing page that these are available after running a free check.

### 4. Publishable key unused in frontend (Info)
**What:** `STRIPE_PUBLISHABLE_KEY` is set in `.env.local` but never referenced in client code. The app uses server-side checkout sessions (redirect to Stripe-hosted checkout), so no Stripe.js client SDK is needed. This env var is harmless but unnecessary.

### 5. `RESEND_API_KEY` is placeholder (Info)
**What:** Local `.env.local` has `re_placeholder_replace_with_real_key`. Emails won't send from local dev. Vercel likely has the real key.

---

## Checkout Journey Map

```
Homepage → /check (Free Check) → Results → Upgrade Cards
                                              ├─ PPSR → /api/stripe/checkout → Stripe → /order/success
                                              ├─ Dealer Review → /api/stripe/checkout → Stripe → /order/success
                                              └─ Full Pack → /api/stripe/checkout → Stripe → /order/success

Homepage → /ppsr (Direct) → Form → /api/stripe/checkout → Stripe → /order/success

Homepage → /deal (Direct) → Form → /api/deal/create → /api/stripe/checkout → Stripe → /deal/{id}

Homepage → /contract-pack → Free download (email gate, no Stripe)

Pricing → Links to /ppsr, /check, /contract-pack, /free-kit
```

### Cancel flows:
- PPSR/Dealer/Full Pack cancel → `/?checkout=cancelled` (dead end, no feedback)
- Deal Room cancel → `/deal?checkout=cancelled` (dead end, no feedback)

### Webhook flow:
```
Stripe → /api/stripe/webhook
  ├─ checkout.session.completed + product=deal_room → create_deal_from_checkout_session → email + Telegram
  ├─ checkout.session.completed + product=ppsr → create_order → email + Telegram  
  ├─ checkout.session.completed + other → create_order → email to info@
  └─ charge.refunded → log only (no order status update)
```

---

## Test-Mode Testing Checklist (for Jordan)

Once test keys are in place:

1. **PPSR checkout:** Go to `/ppsr`, enter a rego + email, submit → should redirect to Stripe test checkout → use card `4242 4242 4242 4242` → should land on `/order/success` with order details
2. **Deal Room checkout:** Go to `/deal`, enter email, submit → Stripe test checkout → should redirect to `/deal/{id}` with empty deal room
3. **Upgrade from free check:** Go to `/check`, paste any listing URL + email → run check → click PPSR/Dealer/Full Pack upgrade → Stripe test checkout → `/order/success`
4. **Cancel flow:** Start any checkout, click back/cancel → should return to origin page
5. **Webhook:** Check Stripe test dashboard → Webhooks → verify events are received (or use `stripe listen` locally)
6. **Contract pack:** Go to `/contract-pack` → enter email → should download ZIP (no Stripe involved)
7. **Admin dashboard:** Check `/admin` shows the test orders

---

## Recommended Priority

| Priority | Action | Owner |
|----------|--------|-------|
| 🔴 P0 | Switch to Stripe test keys (local + Vercel) | Jordan |
| 🔴 P0 | Add STRIPE_WEBHOOK_SECRET to Vercel env vars | Jordan |
| 🟡 P1 | Fix cancel URL dead-end (add cancelled banner) | Agent |
| 🟡 P1 | Update pricing page — Contract Pack is now free | Agent |
| 🟢 P2 | Consider standalone purchase pages for Dealer Review / Full Pack | Future |
| 🟢 P2 | Clean up unused STRIPE_PUBLISHABLE_KEY | Tidy-up |
