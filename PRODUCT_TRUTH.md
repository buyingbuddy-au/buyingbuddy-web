# PRODUCT_TRUTH.md — Buying Buddy

**Last updated:** 2026-03-31
**Author:** Pablo (audit from evidence)
**Status:** ACTIVE — this is the working definition

---

## What Buying Buddy Is

Buying Buddy sells QLD private car buyers a PDF report bundle: official PPSR data, a dealer-written verdict on a specific listing, and QLD-specific private sale paperwork. The free listing check captures leads. Jordan delivers the dealer verdict. This is a manual-augmented digital product — it requires a human dealer to write real verdicts on the $14.95 tier and above.

**What it is not:** A fully automated AI service. A marketplace. A car listing site. A mechanic booking platform. A trust-building psychology engine (that's the marketing story, not the product).

---

## The 3 Things That Must Be True

Every decision about Buying Buddy is tested against these:

1. **Can a customer pay $14.95 and receive a real PDF in their inbox within 24 hours?**
   If yes: the product works.
   If no: fix the delivery pipeline first.

2. **Is Jordan the bottleneck on every paid order?**
   If yes: this is a service business, not a software business.
   Price accordingly and don't build automation that removes the human who is the product.

3. **Is the homepage clear enough that a nervous first-time buyer knows exactly what to do?**
   If no: don't add more pages. Fix the homepage.

---

## Current Live Product

| URL | Status | Notes |
|---|---|---|
| buyingbuddy.com.au | ✅ LIVE | Homepage + pricing |
| /free-kit | ✅ LIVE | Lead capture, email not wired |
| /ppi | ✅ LIVE | Inquiry form, email not wired |
| /contract-pack | ✅ LIVE | Landing page, no real products |
| /admin | ✅ LIVE | Order management, webhook broken |
| /api/check | ✅ LIVE | Free listing check, works |
| /api/stripe/checkout | ✅ LIVE | All 3 tiers create sessions |
| /api/stripe/webhook | ❌ BROKEN | Secret not configured |
| /api/orders | ⚠️ PARTIAL | Reads orders, webhook must fire first |
| /api/pdf-report | ❌ STUB | Returns placeholder text |
| /api/send | ❌ STUB | Calls pdf.ts, which is a stub |
| lib/email.ts | ❌ STUB | console.info() only |

---

## Revenue Model

| Product | Price | Jordan delivers | Status |
|---|---|---|---|
| Free listing check | Free | Snapshot verdict | ✅ Working |
| PPSR Report | $4.95 | Runs PPSR, emails PDF | ❌ Broken |
| Dealer Review | $14.95 | Writes verdict, emails PDF | ❌ Broken |
| Contract Pack | $9.95 | Contract template | ❌ Broken |
| Full Pack | $34.95 | Everything bundle | ❌ Broken |

**Jordan's real products:** Dealer Review ($14.95) and Full Pack ($34.95) are where the money is. PPSR and Contract Pack are commodity — competitors do these cheaper or free. The dealer verdict is the differentiator.

---

## Who This Is For

**Primary:** QLD resident, 25-45, first or second private car purchase, $10K-$30K range, Facebook Marketplace or Gumtree, anxious about being scammed.

**Secondary:** Has bought from dealers before, felt ripped off, wants private sale process without the risk.

**Not this:** Trade buyers (they have their own processes). Interstate buyers (QLD paperwork focus). Luxury car buyers (different risk profile).

---

## Copy Voice

From SITE_COPY_V5.md, approved:

- Never say "AI", "automated", "algorithm", "machine learning"
- Never say "instant" for paid products — say "within minutes" or "within a few hours"
- Jordan is "our specialist" or "our team" — never by name on public site
- Plain Australian English, direct, not blokey, not corporate
- No fake urgency, no countdown timers
- QLD-specific content is a feature

---

## What Success Looks Like

**Month 1:** 10 sales. Jordan has done 10 real dealer reviews. First real customer emails received.

**Month 3:** 50 sales/month. Email nurture sequence running. Calculator tool built and driving traffic.

**Month 6:** 150 sales/month. Calculator is the main traffic driver. Jordan approves email responses, reviews top-tier deals. The business runs without Jordan doing every delivery.

**Month 12:** $100K after-tax. Buying Buddy pays for itself. Jordan does concierge tier ($299) for high-value deals only.

---

*This file is the test. If a feature or decision doesn't serve these truths, it doesn't get built.*
