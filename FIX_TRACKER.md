# Buying Buddy — Fix Tracker

## Status: NEARLY DONE — 1 blocker remains
## Last updated: 2026-03-31 (audit correction)
## Based on: code review of actual files

---

## The Real Status

| Component | Status | Evidence |
|---|---|---|
| Homepage + colours | ✅ LIVE | Deployed at buyingbuddy.com.au |
| Stripe checkout (3 tiers) | ✅ LIVE | `src/lib/stripe.ts` — sessions create |
| Free listing check API | ✅ LIVE | `src/app/api/check/route.ts` |
| PDF generation | ✅ BUILT | `src/lib/pdf.ts` — PDFKit, 3-page branded report |
| Email delivery | ✅ BUILT | `src/lib/email.ts` — Resend SDK, branded HTML |
| PDF test script | ✅ BUILT | `scripts/generate-test-pdf.ts` |
| Stripe webhook | ❌ BLOCKED | `STRIPE_WEBHOOK_SECRET` not configured |
| End-to-end test | ❌ NOT RUN | Never verified by Jordan or agent |

---

## ✅ Phase 1: Homepage Rebuild
**Status:** COMPLETE
Colours replaced, CTAs wired to checkout.

---

## ✅ Phase 2: PDF Generation
**Status:** COMPLETE (verified 31 Mar)
`src/lib/pdf.ts` — fully implemented with PDFKit. Generates professional 3-page A4 report:
- Page 1: Vehicle summary table, market value bar, red flags, quick verdict
- Page 2: PPSR results (finance owing, stolen, write-off, security interests)
- Page 3: Dealer review verdict
- Footer on all pages with `buyingbuddy.com.au`

---

## ✅ Phase 3: Email Delivery
**Status:** COMPLETE (verified 31 Mar)
`src/lib/email.ts` — fully implemented with Resend SDK.
- `send_free_check_email()` — branded HTML with market value, red flags, verdict, upsell CTA
- `send_order_report_email()` — branded HTML with order details, PDF attachment
- Both use `FROM = "Buying Buddy <info@buyingbuddy.com.au>"`
- API key: `re_N78vbUP6_25JC9NdZvimraNB5adGJ5i4o` in `.env.local`

---

## ⏳ Phase 4: Stripe Webhook (ONLY REAL BLOCKER)
**Status:** OPEN — Jordan must do this

1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://buyingbuddy.com.au/api/stripe/webhook`
3. Events: `checkout.session.completed`, `charge.refunded`
4. Copy the `whsec_...` signing secret
5. Add to Vercel: `STRIPE_WEBHOOK_SECRET=whsec_xxx`

**Why it matters:** Without this, orders DON'T auto-create when someone pays. Jordan has to manually enter every order from the Stripe dashboard.

---

## ⏳ Phase 5: Cleanup
**Status:** OPEN — agent task, 30 min
- [ ] Set `typescript: ignoreBuildErrors: false` in `next.config.ts` → fix any TypeScript errors first
- [ ] Set `eslint: ignoreDuringBuilds: false` in `next.config.ts`
- [ ] Remove `cpus: 1` from `next.config.ts`
- [ ] Create `.env.example` with all required vars

---

## ⏳ Phase 6: End-to-End Test
**Status:** OPEN — Jordan does this

Jordan buys his own $4.95 or $14.95 product. Tests full pipeline:
1. Payment completes → webhook fires → order in /admin
2. Jordan opens order → writes verdict → clicks "Send Report"
3. PDF generates → email sends → PDF arrives in inbox

**This is the only real acceptance test that matters.**

---

## Additional Audit Findings (31 Mar 2026)

### Found and catalogued:
- `products/instant-listing-check-spec.md` — detailed free check output spec (very good)
- `content/posts/` — 9 blog HTML posts for SEO (need to verify if deployed)
- `scripts/generate-test-pdf.ts` — working PDF test script
- `src/lib/email.ts` — ✅ fully built
- `src/lib/pdf.ts` — ✅ fully built

### Directory reorganised:
- `content/` — marketing content consolidated
- `docs/` — design specs consolidated
- `handover/archive/` — stale folders parked
- `buyingbuddy-inspection/` — archived (V2 product, not V1)
