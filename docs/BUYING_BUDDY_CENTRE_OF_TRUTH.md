# Buying Buddy Centre of Truth

**Status:** ACTIVE — this is the operational source of truth for all website, product, copy, and launch work.

**Last updated:** 2026-04-28
**Owner:** Jordan
**Primary goal:** get a clean, truthful, generic buyer-side Buying Buddy offer to market quickly.

---

## 1. The one-sentence business

Buying Buddy is low-cost buyer-side help for everyday Australian used-car buyers: a self-serve alternative to paying for a traditional buyer's agent, starting QLD-first with checks, PPSR, inspection guidance, and private-sale paperwork.

---

## 2. Non-negotiable positioning

Buying Buddy is:

- Buyer-side used-car help for everyday Australians.
- A practical self-serve alternative to a traditional buyer's agent.
- Built for private-sale buyers, especially Facebook Marketplace / Gumtree / Carsales buyers.
- Generic enough for Australian used-car buyers, with QLD-first paperwork support.
- Plain-English, cheap, fast, and useful.
- Jordan's car-trade expertise productised into tools, checklists, reports, and guided flows.

Buying Buddy is **not**:

- A traditional full-service buyer's agent.
- A concierge service.
- A car sourcing business.
- A premium $997 front-door service.
- A marketplace.
- A generic AI chatbot destination.
- A business that requires Jordan to personally fulfil every order.

The buyer's-agent angle is allowed as a broad comparison/search frame only: "buyer-side help", "self-serve buyer's-agent alternative", "car-buying help". If a page says or implies "we find the car", "we negotiate for you", "we handle the whole buy", "book a buyer's agent", "$997", or "concierge", it is drift and must be removed from public surfaces.

---

## 3. Product stack for launch

### Free tools

1. **Free Listing Check**
   - User pastes a listing URL or enters details.
   - Returns a quick sanity check: obvious red flags, platform risk, next step.
   - Goal: trust + email capture + PPSR upsell.

2. **Inspection Checklist**
   - Mobile-first checklist to use beside the car.
   - Should feel like a practical companion, not a glossy report.

3. **Contract Pack**
   - QLD private sale contract.
   - Receipt of payment.
   - Vehicle condition report.
   - Transfer guide.
   - Free/email-gated lead magnet.

### Paid products

1. **PPSR Report — $4.95**
   - Finance owing / security interest.
   - Stolen status.
   - Written-off status.
   - Plain-English explanation.
   - Delivery promise while manual/semi-manual: **same business day, usually within 2 hours**.

2. **Deal Pack — $9.99**
   - PPSR Report.
   - Deal Room.
   - Contract Pack.
   - Guided handover structure.

### Hidden/future only

- **$99 Quick Review** may exist later as a post-purchase upsell only.
- It must not appear on homepage, nav, pricing, SEO pages, footer, public metadata, or blog CTAs.

---

## 4. Launch homepage promise

The homepage should say, in plain language:

> Buyer-side help for your next used car, without the traditional buyer's-agent price tag. Run a free check, get a cheap PPSR, use the inspection checklist, and sort the paperwork before money changes hands.

Primary CTA:

- **Run a free check**

Secondary CTA:

- **Get a PPSR report — $4.95**

Do not make the homepage about Jordan, a Brisbane suburb SEO page, a $997 service, or a phone call. The buyer's-agent angle should stay generic and self-serve.

---

## 5. Brand voice

- Direct, Australian, practical.
- Calm confidence, not hype.
- Anti-corporate but not sloppy.
- Short copy beats long explanations.
- Use examples from real private-sale risk: finance owing, fake profiles, pressure deposits, write-offs, no safety certificate, bad paperwork.
- Jordan's credibility is background proof, not the offer.

Good phrasing:

- "Buyer-side help before you hand over cash."
- "A self-serve alternative to a traditional buyer's agent."
- "Check the car before you chase it."
- "Know if money is owing before you pay a stranger."
- "Private sales are messy. Buying Buddy gives you the steps."
- "Same official PPSR data, explained in plain English."
- "Cheap tools for expensive mistakes."

Bad phrasing:

- "Full-service buyer's agent."
- "Concierge."
- "We handle the whole buy."
- "We find and negotiate the car for you."
- "Book a free call."
- "$997 flat fee."
- "AI trained on Jordan" as a standalone public product.

---

## 6. Competitive angle

The immediate competitors are data-report companies and generic car-buying-help/buyer's-agent-alternative searches, not premium done-for-you agents.

- CarHistory: established, comprehensive, roughly premium-price report positioning.
- Carify: polished report product, visual damage report, automated finance updates.
- PPSR.gov.au: official and cheapest, but raw and confusing for normal buyers.

Buying Buddy should not try to look bigger than them. It wins by being:

- Cheaper to start.
- Easier to understand.
- More action-oriented.
- QLD-private-sale specific.
- Better at explaining what to do next, not just dumping data.

Core competitive line:

> They sell reports. Buying Buddy helps you avoid the expensive mistake.

---

## 7. Public surface rules

Before any release, check these surfaces for drift:

- Homepage.
- Root metadata and OpenGraph/Twitter metadata.
- Structured data JSON-LD.
- Header and footer.
- Pricing page.
- PPSR page.
- Free Check results and upsells.
- Stripe product names/prices.
- Order success emails/pages.
- Sitemap and robots.
- Blog CTAs.
- Any old SEO pages.

Public routes that should **not** exist for launch:

- `/buddy` as a standalone AI chat destination.
- `/car-buyers-agent-pullenvale`.
- `/ppi` as a public service line unless it is explicitly repositioned as an affiliate/referral experiment later.

---

## 8. Launch sprint priority

### P0 — today / next release

- Replace local/full-service buyer's-agent and $997 language with generic buyer-side / buyer's-agent-alternative positioning.
- Remove `/buddy` from homepage/nav/sitemap and ideally delete or redirect it.
- Remove `/car-buyers-agent-pullenvale` or redirect it to `/`.
- Fix root metadata and structured data so Google stops seeing a buyer's-agent business.
- Replace pricing with only: Free tools, $4.95 PPSR, $9.99 Deal Pack.
- Fix PPSR promise to "same business day, usually within 2 hours".
- Fix Stripe products so public paid products match the launch stack.

### P1 — next 24–48 hours

- Make every tool endpoint point to the next purchase step.
- Free Check → PPSR.
- PPSR → Deal Pack.
- Inspection checklist → PPSR + Contract Pack.
- Contract Pack → Deal Pack.
- Add after-hours copy/auto-reply for PPSR fulfilment.
- Add webhook/order alert reliability check.

### P2 — after clean launch

- Add more blog/SEO content around high-intent queries.
- Add make/model red flag guidance.
- Improve PPSR automation from manual to supervised automation.
- Test $99 Quick Review only after purchase, not before.

---

## 9. Definition of done for "market ready"

The site is market-ready when:

- A stranger can land on the homepage and understand the offer in 10 seconds.
- Public buyer's-agent language is generic and self-serve only: no concierge, $997, sourcing, negotiation-for-you, or "we handle the whole buy" claims.
- Prices are consistent everywhere: $4.95 PPSR, $9.99 Deal Pack, free tools.
- The Free Check works.
- Stripe checkout works for PPSR and Deal Pack.
- Order confirmation copy sets the correct delivery expectation.
- The site can take real traffic without Jordan needing to manually explain what the business is.

---

## 10. Agent brief

Any AI/coding/copy agent working on Buying Buddy must:

1. Read this file first.
2. Treat full-service buyer's-agent, concierge, sourcing, $997, and done-for-you language as a P0 bug; generic buyer-side / buyer's-agent-alternative language is allowed.
3. Prefer deletion over clever rewrites when a feature is off-scope.
4. Keep launch scope small.
5. Preserve working checkout/report flows.
6. Run at least `npm run typecheck` before claiming technical readiness, and report any existing unrelated failures honestly.

Do not invent new products, tiers, services, regions, or calls-to-action without Jordan explicitly approving them.
