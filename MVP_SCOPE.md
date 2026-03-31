# MVP_SCOPE.md — Buying Buddy V1

**Last updated:** 2026-03-31
**Based on:** PRODUCT_TRUTH.md
**Purpose:** Ruthless list of what V1 contains. Everything else is not V1.

---

## V1 — What Gets Built

### Must work (blockers)
- [ ] **Stripe webhook** — orders auto-create on payment, not manually
- [ ] **Email delivery** — Resend wired in email.ts, real emails send
- [ ] **PDF generation** — real branded PDF, not placeholder text
- [ ] **End-to-end test** — Jordan buys a $4.95 product and receives it in his inbox

### Must exist on site
- [ ] **Homepage** — already working, keeps as-is
- [ ] **Free listing check** — already working
- [ ] **Stripe checkout** — 3 tiers already wired
- [ ] **Free kit form** → real email with PDF attachment sent
- [ ] **PPI inquiry form** → real email sent to Jordan + confirmation to customer
- [ ] **Admin order list** — shows all orders by status
- [ ] **Admin order detail** — shows vehicle info, customer email, listing URL
- [ ] **"Send Report" button** — generates PDF, emails to customer, marks order complete
- [ ] **Order status timeline** — customer sees where their order is

### Must exist in docs
- [ ] This file
- [ ] PRODUCT_TRUTH.md
- [ ] BUYING_BUDDY_HANDOVER.md (so any agent can work on this)

---

## V1 — What Does NOT Get Built

These are explicitly not V1. Do not build them until V1 works end-to-end.

| Feature | Why not V1 | Revisit when |
|---|---|---|
| "Is This a Good Deal?" calculator | No traffic yet. No point building demand gen when delivery is broken. | V1 orders working |
| Guided PPI inspection app | $0.95 price can't cover AI vision analysis cost. Complex build. | Calculator driving traffic |
| Email nurture sequence (5 emails) | Resend not wired, can't send. | Email delivery working |
| SEO blog posting cadence | Same as above — nothing to nurture. | Email working |
| Google Ads campaigns | Don't spend money driving traffic to a broken funnel. | Full flow tested |
| 7-agent AI team | Premature architecture. Zero agents deployed. | V1 delivered first |
| Referral program | Needs email system. | Month 3+ |
| YouTube content | Jordan's time. Not a coding task. | Later |
| Facebook Business Page | Requires Jordan to set up from personal account. | Jordan's call |
| Concierge tier ($299) | Can't upsell if base product doesn't work. | Month 3+ |
| Calculator as traffic engine | Good theory, zero implementation, SPEC IN STRATEGY but not in FIX_TRACKER. | V1 done |

---

## V1 Delivery Checklist

Before announcing V1 launch or spending any marketing money:

- [ ] Stripe webhook confirmed working — order appears in /admin within 60s of payment
- [ ] PDF arrives in Jordan's inbox when he clicks "Send Report"
- [ ] Free kit sends real PDF to a real email address
- [ ] PPI inquiry arrives in Jordan's email inbox
- [ ] Jordan has personally completed one full $14.95 Dealer Review from start to finish
- [ ] No TypeScript errors visible in Vercel build (currently hidden by `ignoreBuildErrors: true`)

---

## V1 Feature Tiers (for reference, not scope)

**Tier 0 — Free**
- Listing URL → instant snapshot verdict
- Lead capture (email collected)

**Tier 1 — $4.95-$9.95**
- PPSR Report (PDF, manual lookup by Jordan)
- Contract Pack (PDF template, instant)

**Tier 2 — $14.95**
- Dealer Review: PPSR + Jordan's written verdict (PDF)
- Jordan's time: ~15-20 min per review

**Tier 3 — $34.95**
- Full Confidence Pack: Dealer Review + Negotiation Script + Contract Pack bundle

---

## What to Build vs Buy

| Component | Decision | Rationale |
|---|---|---|
| Email sending | Buy Resend ($0/month for 3K emails) | Already have key, works at scale |
| PDF generation | Build with jspdf (free) | Custom template, no per-use cost |
| Stripe payments | Already working | Don't fix what works |
| Hosting | Already on Vercel | Already deployed |
| Customer support | Jordan answers emails | Can't afford to automate this yet |

---

## V1 is done when:

1. A stranger can pay $14.95 and receive a branded PDF in their inbox with zero manual intervention from Pablo
2. Jordan can complete a dealer review in under 30 minutes using only the admin panel
3. No coding knowledge required to fulfil an order — only car industry knowledge

**That's it. Ship that. Then add features.**
