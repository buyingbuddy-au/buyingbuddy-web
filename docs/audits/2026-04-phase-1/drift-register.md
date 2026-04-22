# BuyingBuddy Drift Register — Phase 1 (April 2026)

**Source of truth:** `/docs/buyingbuddy-product-plan.md` (locked 2026-04-16)
**Audit date:** 2026-04-23
**Audit scope:** Every user-facing surface in the production app. Read-only — no copy/page/component/email/config was modified during this pass.

---

## Severity

- **P0** — Contradicts core positioning. Concierge/buyer's-agent, $997, $99 Quick Review surfaced publicly, premium tiers, first-person live-time promises, wrong core prices ($4.95 PPSR / $9.99 Deal Pack).
- **P1** — Misleading, inconsistent, or out-of-scope but not core-contradicting (duplicate free-tool pages, feature-spec mismatches, stale SEO framing, scope creep that still gates behind a form).
- **P2** — Polish, clarity, tone, stale planning-doc prose, internal-only notification strings.

## Drift Types

- **CONCIERGE** — Buyer's-agent / concierge / personal-shopper framing (public)
- **PRICING** — Wrong price, phantom price, or plan price missing
- **UPSELL-LEAK** — $99 Quick Review surfaced publicly (or analogous live-service upsell)
- **PHANTOM** — Page/product/feature that the plan explicitly removed or doesn't include
- **MISSING** — Plan mandates it and the site doesn't have it (e.g. $9.99 Deal Pack bundle)
- **SCOPE** — Out-of-plan service line (PPI booking, geographic SEO)
- **LEGAL** — Privacy/terms drift vs product posture
- **SEO** — Keywords, sitemap entries, structured data that contradicts the plan
- **COPY** — Plain copy mismatch (feature numbers, testimonials, stale badges, tier prose)

---

## Inventory

User-facing surfaces walked during this audit.

### Pages (app router)
- [x] `/` — `src/app/page.tsx`
- [x] `/check` — `src/app/check/page.tsx` (renders `FreeCheckForm`)
- [x] `/free-kit` — `src/app/free-kit/page.tsx`
- [x] `/ppsr` — `src/app/ppsr/page.tsx`
- [x] `/inspect` — `src/app/inspect/page.tsx`
- [x] `/inspect/full` — `src/app/inspect/full/page.tsx` (renders `InspectionApp`)
- [x] `/inspect/print` — `src/app/inspect/print/page.tsx`
- [x] `/deal` — `src/app/deal/page.tsx`
- [x] `/deal/[id]` — dynamic (skimmed; not copy-bearing at index layer)
- [x] `/deal/demo` — `src/app/deal/demo/page.tsx` (test-mode surface)
- [x] `/contract-pack` — `src/app/contract-pack/page.tsx`
- [x] `/pricing` — `src/app/pricing/page.tsx`
- [x] `/buddy` — `src/app/buddy/page.tsx` (PHANTOM page)
- [x] `/ppi` — `src/app/ppi/page.tsx` (OUT-OF-SCOPE service)
- [x] `/car-buyers-agent-pullenvale` — `src/app/car-buyers-agent-pullenvale/page.tsx` (PHANTOM SEO page)
- [x] `/blog` — `src/app/blog/page.tsx`
- [x] `/blog/[slug]` — renders HTML from `content/posts/**/*.html`
- [x] `/contact` — `src/app/contact/page.tsx`
- [x] `/privacy`, `/terms` — skimmed (boilerplate, no positioning drift)
- [x] `/order/success` — `src/app/order/success/page.tsx`
- [x] `/shared/[id]` — `src/app/shared/[id]/page.tsx`
- [x] `/not-found` — `src/app/not-found.tsx` (clean)

### Components (rendering copy)
- [x] `src/components/app-header.tsx` (desktop nav)
- [x] `src/components/bottom-nav.tsx` (mobile nav)
- [x] `src/components/site-footer.tsx`
- [x] `src/components/announcement-banner.tsx`
- [x] `src/components/checkout-cancelled-banner.tsx`
- [x] `src/components/free-check-form.tsx`
- [x] `src/components/free-kit-form.tsx` (skimmed)
- [x] `src/components/handover-pack-button.tsx`
- [x] `src/components/buddy-chat.tsx` (PHANTOM component)
- [x] `src/components/pricing-card.tsx`
- [x] `src/components/structured-data.tsx` (JSON-LD)
- [x] `src/components/header-cta.tsx` (legacy, not mounted in current layout)
- [x] `src/components/deal-room/deal-components.tsx`
- [x] `src/components/inspection-app.tsx` (skimmed via /inspect/full render)

### Copy libraries
- [x] `src/lib/site-content.ts` (centralised hero/trust/FAQ/pricing/testimonials)
- [x] `src/lib/free-check.ts` (free-check verdict generator — phantom upsells baked in)
- [x] `src/lib/email.ts` (transactional emails)
- [x] `src/lib/forms-email.ts` (free-kit + PPI mail)
- [x] `src/lib/blog.ts` (blog loader)
- [x] `src/lib/display.ts` (product label map)

### Meta / SEO
- [x] `src/app/layout.tsx` (root metadata — title/description/OG/keywords)
- [x] Per-page `export const metadata` on every page above
- [x] `src/app/sitemap.ts`
- [x] `src/app/robots.ts`
- [x] `src/components/structured-data.tsx`

### API routes that emit user-facing copy
- [x] `src/app/api/buddy/route.ts` (SYSTEM_PROMPT + canned fallbacks)
- [x] `src/app/api/cron/email-nurture/route.ts` (abandoned-cart email)
- [x] `src/app/api/ppi/route.ts` (PPI enquiry confirmation)
- [x] `src/app/api/free-kit/route.ts` (free-kit welcome email)
- [x] `src/app/api/stripe/webhook/route.ts` (skimmed; internal notifications only)
- [x] `src/app/api/shared/create/route.ts` (share link copy)

### Blog / content files
- [x] `content/posts/blog/*.html` (23 posts, grepped for P0 triggers)
- [x] `content/posts/*.html` (4 featured posts, grepped)
- [x] `content/email-nurture-sequence.md`, `content/social-posts-launch.md`, `content/google-ads-plan.md` (planning docs — flagged as P2)

---

## Register

Current-State quotes are ≤15 words; file paths + line numbers included. "Multiple" in Action means the same drift recurs in the same file and needs a one-pass rewrite/removal.

### P0 — CONCIERGE / BUYER'S-AGENT positioning (public)

| # | Page / Location | Drift Type | Current State | Should Be | Severity | Action | Status |
|---|---|---|---|---|---|---|---|
| 1 | `src/app/page.tsx:42` | CONCIERGE | "Flat $997 to handle the whole buy." | Tools-first framing, no $997 service line | P0 | Rewrite (multiple) | Open |
| 2 | `src/app/page.tsx:66` | CONCIERGE | Tier tag "$997 flat" | Remove tier entirely | P0 | Remove | Open |
| 3 | `src/app/page.tsx:69` | CONCIERGE | "Full buyer's agent service. We find the car…" | Remove buyer's-agent tile | P0 | Remove | Open |
| 4 | `src/app/page.tsx:166` | CONCIERGE | "a flat-fee buyer's agent service" (FAQ) | Rewrite: tools-only product | P0 | Rewrite | Open |
| 5 | `src/app/page.tsx:171` | PRICING | "The $997 is the fee" | Remove | P0 | Remove | Open |
| 6 | `src/app/page.tsx:189` | PRICING | "Is the $997 fee really flat?" | Remove FAQ entry | P0 | Remove | Open |
| 7 | `src/app/page.tsx:211` | CONCIERGE | meta description: "flat-fee buyer's agent service in Brisbane & SEQ" | Rewrite meta | P0 | Rewrite | Open |
| 8 | `src/app/page.tsx:213-222` | SEO | keywords array contains "car buyers agent Brisbane" | Strip buyer's-agent keywords | P0 | Rewrite | Open |
| 9 | `src/app/page.tsx:229` | CONCIERGE | OG description: "flat-fee buyer's agent service for Aussies" | Rewrite | P0 | Rewrite | Open |
| 10 | `src/app/page.tsx:239` | CONCIERGE | Twitter description: "flat-fee buyer's agent service" | Rewrite | P0 | Rewrite | Open |
| 11 | `src/app/page.tsx:291-295` | UPSELL-LEAK | CTA "Get the full buy handled" | Remove — only tools CTAs | P0 | Remove | Open |
| 12 | `src/app/page.tsx:348` | CONCIERGE | "Book the buyer's agent service" | Remove section | P0 | Remove | Open |
| 13 | `src/app/page.tsx:388-437` | CONCIERGE | Entire "How the full buy service works" section (3-step + $997) | Delete section | P0 | Remove | Open |
| 14 | `src/app/page.tsx:426` | PRICING | "$997 — same price whether the car is $15k or $75k." | Remove | P0 | Remove | Open |
| 15 | `src/app/page.tsx:433` | UPSELL-LEAK | "Book the 15-min call" CTA | Remove | P0 | Remove | Open |
| 16 | `src/app/page.tsx:195-206` | SCOPE | SERVICE_AREAS (Pullenvale, Kenmore, Moggill, etc.) | Remove service-area list | P0 | Remove | Open |
| 17 | `src/app/page.tsx:491-527` | SCOPE | Entire "Where we work" concierge footprint section | Remove section | P0 | Remove | Open |
| 18 | `src/app/page.tsx:509-513` | CONCIERGE | Link "See local page" → /car-buyers-agent-pullenvale | Remove link | P0 | Remove | Open |
| 19 | `src/app/page.tsx:24-29` | CONCIERGE | TRUST_PILLS: "Flat fee, buyer-only", "Lexus & BMW award winner" | Rewrite to tools-first trust copy | P0 | Rewrite | Open |
| 20 | `src/app/page.tsx:94-115` | COPY | TRUST_REASONS block foregrounds Jordan (Lexus/BMW award-winning) | Jordan = background, not foreground | P0 | Rewrite | Open |
| 21 | `src/app/page.tsx:608-612` | UPSELL-LEAK | "book a 15-minute call and get a real person on your side" | Remove | P0 | Remove | Open |
| 22 | `src/app/layout.tsx:14` | CONCIERGE | title default: "Brisbane Car Buyer's Agent + Used Car Tools" | Rewrite: tools-only title | P0 | Rewrite | Open |
| 23 | `src/app/layout.tsx:17-18` | CONCIERGE | description: "Brisbane car buyer's agent service, free AI car checks…" | Rewrite | P0 | Rewrite | Open |
| 24 | `src/app/layout.tsx:24-26` | CONCIERGE | OG title/desc repeat buyer's-agent | Rewrite | P0 | Rewrite | Open |
| 25 | `src/app/layout.tsx:29-32` | CONCIERGE | Twitter title/desc repeat buyer's-agent | Rewrite | P0 | Rewrite | Open |
| 26 | `src/app/layout.tsx:34-45` | SEO | keywords: "car buyers agent Brisbane", "used car buyer's agent Brisbane" | Strip buyer's-agent keywords | P0 | Rewrite | Open |
| 27 | `src/components/structured-data.tsx:9-10` | CONCIERGE | WebSite description: "Brisbane car buyer's agent service, free checks…" | Rewrite | P0 | Rewrite | Open |
| 28 | `src/components/structured-data.tsx:18-19` | CONCIERGE | LocalBusiness description: find/negotiate/inspect/close deals | Rewrite to tools-only | P0 | Rewrite | Open |
| 29 | `src/components/structured-data.tsx:20-27` | SCOPE | areaServed: Brisbane + 5 west-side suburbs | QLD-wide tools (drop concierge footprint) | P0 | Rewrite | Open |
| 30 | `src/components/structured-data.tsx:34-42` | PRICING | makesOffer: "Brisbane Car Buyer's Agent Service" price 997 | Remove offer | P0 | Remove | Open |
| 31 | `src/components/structured-data.tsx:59-64` | PRICING | makesOffer: "QLD Contract Pack" price 9.95 | Either free (standalone) or $9.99 Deal Pack; fix | P0 | Rewrite | Open |
| 32 | `src/components/structured-data.tsx:67-85` | CONCIERGE | Service block serviceType: "Used car buyer's agent" | Remove Service block | P0 | Remove | Open |
| 33 | `src/components/site-footer.tsx:26-28` | CONCIERGE | Footer link "Pullenvale" → /car-buyers-agent-pullenvale | Remove footer link | P0 | Remove | Open |
| 34 | `src/app/car-buyers-agent-pullenvale/page.tsx` (whole file) | CONCIERGE | Entire Pullenvale SEO landing page, $997 hero, "Car Buyer's Agent" H1 | Delete page | P0 | Remove | Open |
| 35 | `src/app/car-buyers-agent-pullenvale/page.tsx:50-71` | SEO | Page metadata: "Car Buyer's Agent Pullenvale" title + keywords | Deleted with page | P0 | Remove | Open |
| 36 | `src/app/car-buyers-agent-pullenvale/page.tsx:127` | PRICING | "$997" hero price | Deleted with page | P0 | Remove | Open |

### P0 — PHANTOM (Ask Buddy should be gone per plan)

| # | Page / Location | Drift Type | Current State | Should Be | Severity | Action | Status |
|---|---|---|---|---|---|---|---|
| 37 | `src/app/buddy/page.tsx` (whole file) | PHANTOM | Standalone /buddy chat route still live | Delete page per plan "Parked Products" | P0 | Remove | Open |
| 38 | `src/components/buddy-chat.tsx` (whole file) | PHANTOM | Chat UI component | Delete component | P0 | Remove | Open |
| 39 | `src/app/api/buddy/route.ts` (whole file) | PHANTOM | Chat API endpoint with multi-provider fallback | Delete route | P0 | Remove | Open |
| 40 | `src/app/page.tsx:149-153` | PHANTOM | TOOLKIT_CARDS entry: "AI Chat" → /buddy | Remove tile | P0 | Remove | Open |
| 41 | `src/app/sitemap.ts:19` | SEO | sitemap entry for `/buddy` | Remove sitemap URL | P0 | Remove | Open |

### P0 — PRICING (phantom products + wrong core prices)

| # | Page / Location | Drift Type | Current State | Should Be | Severity | Action | Status |
|---|---|---|---|---|---|---|---|
| 42 | `src/app/pricing/page.tsx:54-66` | PHANTOM | Product tier "Dealer Review" at $14.95 | Remove tier | P0 | Remove | Open |
| 43 | `src/app/pricing/page.tsx:68-80` | PHANTOM | Product tier "Full Pack" at $34.95 | Remove tier | P0 | Remove | Open |
| 44 | `src/app/pricing/page.tsx` (whole page) | MISSING | No $9.99 Deal Pack tier anywhere | Add Deal Pack = PPSR + Deal Room + Contract Pack | P0 | Add | Open |
| 45 | `src/app/pricing/page.tsx:106`, 146-175 | PRICING | 5-column tier framing (Free/PPSR/Contract/Dealer/Full) | Two tiers only: $4.95 PPSR, $9.99 Deal Pack | P0 | Rewrite | Open |
| 46 | `src/app/pricing/page.tsx:5-6` | COPY | meta: "Choose your level of car buying protection. From free tools to complete buyer bundles." | Rewrite without tier prose | P0 | Rewrite | Open |
| 47 | `src/app/pricing/page.tsx:97-102` | COPY | Hero: "Pick the protection that matches the risk" | Rewrite tools-first | P0 | Rewrite | Open |
| 48 | `src/app/pricing/page.tsx:84-90` | COPY | COMPARISON table references dealer + full tiers | Rewrite to two-tier comparison | P0 | Rewrite | Open |
| 49 | `src/lib/site-content.ts:131` | PRICING | COMPARISON_ROWS price row: `["Free", "$9.95", "$39"]` | Two tiers: Free, $4.95, $9.99 (or rebuild) | P0 | Rewrite | Open |
| 50 | `src/lib/site-content.ts:140-162` | PHANTOM | PRICING_PLANS: "CONFIDENCE REPORT" $9.95, "FULL BUNDLE" $39 | Rebuild for plan tiers | P0 | Rewrite | Open |
| 51 | `src/lib/site-content.ts:1-5` | PRICING | Hardcoded Stripe buy links for phantom Confidence Report + Full Bundle SKUs | Repoint to $4.95 PPSR and $9.99 Deal Pack | P0 | Rewrite | Open |
| 52 | `src/app/api/buddy/route.ts:10` | PHANTOM | Chat system prompt: "Dealer Review ($14.95) — Jordan personally reviews the listing" | Deleted with /buddy route | P0 | Remove | Open |
| 53 | `src/app/api/buddy/route.ts:11` | PHANTOM | "Full Pack ($34.95) — Dealer review + QLD contract + negotiation guide" | Deleted with /buddy | P0 | Remove | Open |
| 54 | `src/app/api/buddy/route.ts:12` | PRICING | "Deal Room ($39.95) — shared buyer/seller workspace" | Plan price is $9.99 (Deal Pack bundle) | P0 | Rewrite or remove with /buddy | Open |
| 55 | `src/app/api/buddy/route.ts:35` | PHANTOM | Canned context: "Mention the Full Pack ($34.95)" | Deleted with /buddy | P0 | Remove | Open |
| 56 | `src/lib/free-check.ts:143` | PHANTOM | Verdict string: "Request a Dealer Review ($14.95) and we'll tell you…" | Rewrite upsell to $4.95 PPSR / $9.99 Deal Pack | P0 | Rewrite | Open |
| 57 | `src/lib/free-check.ts:145` | PHANTOM | "A Dealer Review ($14.95) will give you an accurate market value estimate" | Rewrite | P0 | Rewrite | Open |
| 58 | `src/lib/free-check.ts:176` | PHANTOM | "…upgrade to a Dealer Review ($14.95)." | Rewrite upsell | P0 | Rewrite | Open |
| 59 | `src/lib/free-check.ts:178` | PHANTOM | "For a full dealer opinion, upgrade to a Dealer Review ($14.95)." | Rewrite | P0 | Rewrite | Open |
| 60 | `src/lib/free-check.ts:180` | PHANTOM | "…upgrade to a Dealer Review ($14.95)." | Rewrite | P0 | Rewrite | Open |
| 61 | `src/lib/free-check.ts:206` | PHANTOM | Placeholder path: "Request a Dealer Review ($14.95) for an accurate market value estimate." | Rewrite | P0 | Rewrite | Open |
| 62 | `src/components/free-check-form.tsx:429-436` | PRICING | Next-step tile "Start Deal Room" price "$39.95" | Either free (standalone) or $9.99 Deal Pack | P0 | Rewrite | Open |
| 63 | `src/app/api/shared/create/route.ts:61` | PRICING | Share CTA: "Get Contract Pack — $9.95" | Plan: free lead-gen OR bundled in $9.99 Deal Pack | P0 | Rewrite | Open |
| 64 | `src/lib/email.ts:178-179` | PHANTOM | product_labels: `dealer_review: "Dealer Review"`, `full_pack: "Full Confidence Pack"` | Remove phantom entries | P0 | Remove | Open |
| 65 | `src/lib/email.ts:186-187` | PHANTOM | product_descriptions for dealer_review / full_pack | Remove | P0 | Remove | Open |
| 66 | `src/lib/display.ts:6-7` | PHANTOM | display-label map entries for dealer_review + full_pack | Remove | P0 | Remove | Open |
| 67 | `src/lib/stripe.ts:13,19-20` | PHANTOM | Stripe product config: "Dealer Review", "Full Confidence Pack" | Remove SKUs | P0 | Remove | Open |
| 68 | `src/lib/pdf.ts:326,341,388` | PHANTOM | PDF generator renders "Dealer Review" section | Remove section from PDF | P0 | Remove | Open |
| 69 | `src/app/admin/(protected)/orders/page.tsx:22-23` | PHANTOM | Admin filter options: Dealer Review, Full Confidence Pack | Remove (admin but reflects bad type system) | P0 | Remove | Open |

### P0 — UPSELL-LEAK / LIVE-TIME PROMISES

| # | Page / Location | Drift Type | Current State | Should Be | Severity | Action | Status |
|---|---|---|---|---|---|---|---|
| 70 | `src/app/order/success/page.tsx:14-17` | PHANTOM | Branches on `is_dealer_review` / `is_full_pack` | Remove phantom branches | P0 | Remove | Open |
| 71 | `src/app/order/success/page.tsx:29-31` | PHANTOM | Headings: "Your Dealer Review is in the queue" / "Your Full Pack is in the queue" | Remove | P0 | Remove | Open |
| 72 | `src/app/order/success/page.tsx:39` | UPSELL-LEAK | "Jordan will review the listing and send you a straight verdict by email" | Remove live-time promise | P0 | Remove | Open |
| 73 | `src/app/order/success/page.tsx:41` | UPSELL-LEAK | "Jordan will review the listing, prepare your QLD paperwork…" | Remove | P0 | Remove | Open |
| 74 | `src/app/contact/page.tsx:34` | UPSELL-LEAK | "drop a note and I'll get back to you" | Rewrite to passive: "email info@buyingbuddy.com.au" | P0 | Rewrite | Open |

### P0 — PPSR delivery promise stricter than plan

| # | Page / Location | Drift Type | Current State | Should Be | Severity | Action | Status |
|---|---|---|---|---|---|---|---|
| 75 | `src/app/ppsr/page.tsx:34` | COPY | Trust badge: "Report delivered in under 2 hours" | "Same business day, usually within 2 hours" | P0 | Rewrite | Open |
| 76 | `src/app/ppsr/page.tsx:252-254` | COPY | "prepared by a licensed dealer and emailed within 2 hours" | Match plan phrasing | P0 | Rewrite | Open |
| 77 | `src/lib/email.ts:144` | COPY | PPSR confirmation: "Delivery window: Within 2 hours" | "Same business day, usually within 2 hours" | P0 | Rewrite | Open |
| 78 | `src/lib/email.ts:148` | COPY | Body: "Your PPSR report will be emailed to you within 2 hours." | Match plan phrasing | P0 | Rewrite | Open |

### P0 — Blog posts (published HTML) contain concierge / phantom-bundle copy

| # | Page / Location | Drift Type | Current State | Should Be | Severity | Action | Status |
|---|---|---|---|---|---|---|---|
| 79 | `content/posts/blog/buying-interstate.html:20` | CONCIERGE | "Our Concierge service helps coordinate interstate buys…" | Remove paragraph | P0 | Remove | Open |
| 80 | `content/posts/blog/can-you-trust-roadworthies.html:20` | PHANTOM | "Pro tip: our Full Bundle includes photo reviews…" | Remove Full Bundle reference | P0 | Remove | Open |
| 81 | `content/posts/blog/hidden-flood-damage.html:17` | PHANTOM | "Our Full Bundle includes photo reviews…" | Remove | P0 | Remove | Open |
| 82 | `content/posts/blog/write-off-vs-statutory-write-off.html:17` | PHANTOM | "The Full Bundle includes personal advice on specific listings." | Remove | P0 | Remove | Open |

### P1 — MISSING / SCOPE / FEATURE-SPEC

| # | Page / Location | Drift Type | Current State | Should Be | Severity | Action | Status |
|---|---|---|---|---|---|---|---|
| 83 | `src/app/deal/page.tsx` (whole file) | MISSING | Deal Room shown as free standalone, no $9.99 Deal Pack framing | Deal Room should be part of $9.99 Deal Pack bundle | P1 | Rewrite | Open |
| 84 | `src/app/ppi/page.tsx` (whole file) | SCOPE | Pre-Purchase Inspection booking flow ($150-250) — live referral service | Not in plan; either park or remove entirely | P1 | Remove | Open |
| 85 | `src/app/api/ppi/route.ts:63` | UPSELL-LEAK | PPI user email: "We'll be in touch within a few hours…" | Remove with /ppi | P1 | Remove | Open |
| 86 | `src/components/app-header.tsx:8`, `src/components/bottom-nav.tsx:15` | SCOPE | Header nav label "Free Check" → `/check`; `/free-kit` lives separately | Decide canonical Free Check surface; consolidate or clearly differentiate | P1 | Verify | Open |
| 87 | `src/app/free-kit/page.tsx` vs `src/app/check/page.tsx` | SCOPE | Two free-tool surfaces — one AI analyser, one email-gated PDF pack | Plan has one "Free Check" (listing URL → sanity check, email capture); free-kit is a separate email-gated download | P1 | Verify / relocate | Open |
| 88 | `src/app/page.tsx:51` | COPY | "Use the 25-point inspection tool" | Plan = 14-point | P1 | Rewrite | Open |
| 89 | `src/app/page.tsx:133` | COPY | TOOLKIT_CARDS: "25-point guided inspection checklist" | 14-point | P1 | Rewrite | Open |
| 90 | `src/app/page.tsx:166` | COPY | FAQ: "a 25-point inspection" | 14-point | P1 | Rewrite | Open |
| 91 | `src/lib/site-content.ts:165` | COPY | LEAD_MAGNET_BULLETS: "✓ 47-Point Inspection Guide" | 14-point | P1 | Rewrite | Open |
| 92 | `src/lib/forms-email.ts:136` | COPY | Free-kit email: "A 20-point pre-purchase checklist" | 14-point | P1 | Rewrite | Open |
| 93 | `src/app/pricing/page.tsx:18,84` | COPY | "20-point inspection checklist" | 14-point | P1 | Rewrite | Open |
| 94 | `src/app/free-kit/page.tsx:14` | COPY | Kit item: "20 checks to run before you even consider making an offer" | 14-point | P1 | Rewrite | Open |
| 95 | `src/app/api/free-kit/route.ts:45` | COPY | Welcome email: "20 checks before you make any offer" | 14-point | P1 | Rewrite | Open |
| 96 | `src/components/structured-data.tsx:86-94` | COPY | WebApplication description uses generic / AI-chat framing | Align to tools-first | P1 | Rewrite | Open |
| 97 | `src/app/sitemap.ts:22` | SEO | Sitemap lists `/ppi` | Remove with /ppi | P1 | Remove | Open |
| 98 | `src/app/sitemap.ts` (missing) | SEO | No `/deal` URL in sitemap | Add Deal Room / Deal Pack surface | P1 | Add | Open |

### P1 — TIER / PREMIUM framing

| # | Page / Location | Drift Type | Current State | Should Be | Severity | Action | Status |
|---|---|---|---|---|---|---|---|
| 99 | `src/components/pricing-card.tsx:2,40-47` | COPY | isPremium + Crown icon + "Complete Bundle" label | Remove premium affordance; no Crown tier | P1 | Rewrite | Open |
| 100 | `src/components/pricing-card.tsx:31-37` | COPY | isPopular "Most Popular" star ribbon | OK to keep neutrally, but audit copy | P1 | Verify | Open |
| 101 | `src/lib/site-content.ts:39-62` | COPY | TRUST_BADGES: "PDF DELIVERED IN 30 SECONDS", Netflix/Uber ref, "100% SATISFACTION GUARANTEE" | Rewrite — 30s contradicts manual PPSR; badges read SaaS-templated | P1 | Rewrite | Open |
| 102 | `src/lib/site-content.ts:22-37` | PRICING | PROBLEM_CARDS: "Spend $9.95 to avoid a $15,000 mistake" | Wrong price ($4.95) and stale framing | P1 | Rewrite | Open |
| 103 | `src/lib/site-content.ts:76-95` | COPY | Three fabricated TESTIMONIALS with names + suburbs | Remove if not real, or mark clearly | P1 | Remove | Open |
| 104 | `src/lib/site-content.ts:64-75` | COPY | VERIFICATION_POINTS + DELIVERY_POINTS promise 30-second PDF auto-delivery | Rewrite — matches manual-now fulfilment plan | P1 | Rewrite | Open |
| 105 | `src/lib/site-content.ts:97-128` | COPY | FAQS: "Instant mate…usually takes about 30 seconds" (PPSR) | Same-business-day language | P1 | Rewrite | Open |
| 106 | `src/lib/site-content.ts:15-20` | COPY | HERO_FEATURES: "Rego History", "Theft Check", "Write-off Status" emoji list | Aligns loosely but tone is SaaS-templated; rewrite plainer | P1 | Rewrite | Open |
| 107 | `src/components/handover-pack-button.tsx:65` | COPY | Button: "Download Full Pack — Free" | Relabel "Download Contract Pack — Free" (Full Pack is a phantom paid SKU elsewhere) | P1 | Rewrite | Open |
| 108 | `src/components/handover-pack-button.tsx:115` | COPY | Modal: "Enter your email and we'll send you the pack" | Acceptable, but plan disallows "we'll review"; verify this one is transactional (it is — low risk) | P2 | Verify | Open |

### P1 — Jordan-as-foreground and live-time framing

| # | Page / Location | Drift Type | Current State | Should Be | Severity | Action | Status |
|---|---|---|---|---|---|---|---|
| 109 | `src/app/page.tsx:447-452` | COPY | "Jordan Lansbury ran used-car floors for 15 years at Lexus, BMW…" | Jordan = background; demote from trust headline | P1 | Rewrite | Open |
| 110 | `src/app/free-kit/page.tsx:49-51` | COPY | "15 years in the car industry. This is everything I wish everyday buyers knew…" | Plain third-person product framing | P1 | Rewrite | Open |
| 111 | `src/app/ppi/page.tsx:43-46` | COPY | "In 15 years in the car industry — Lexus, BMW, Audi — I've seen every trick." | Remove with /ppi | P1 | Remove | Open |
| 112 | `src/app/api/cron/email-nurture/route.ts:32,42` | UPSELL-LEAK | Sender "Jordan @ BuyingBuddy" + sign-off "Cheers, Jordan" | Automated email should not claim Jordan personalisation | P1 | Rewrite | Open |
| 113 | `src/app/api/free-kit/route.ts:53` | PHANTOM | Welcome-email footer: "a full dealer-level review of a specific car" | Remove phantom reference | P1 | Rewrite | Open |
| 114 | `src/components/announcement-banner.tsx:15` | COPY | "Facebook Marketplace Scams Up 300% This Year - Protect Yourself" | Fictitious stat; verify or rewrite. Also check if banner is mounted (layout.tsx does NOT mount it currently — dormant component) | P1 | Verify / rewrite | Open |
| 115 | `src/components/header-cta.tsx` (whole file) | COPY | "Run Free Check" anchored to #hero-input that no longer exists | Delete unused component | P2 | Remove | Open |

### P2 — Polish / tone / planning-doc prose

| # | Page / Location | Drift Type | Current State | Should Be | Severity | Action | Status |
|---|---|---|---|---|---|---|---|
| 116 | `content/email-nurture-sequence.md:47` | PHANTOM | Draft copy references "$14.95 Dealer Review" and "Jordan personally review" | Rewrite draft before use | P2 | Rewrite | Open |
| 117 | `content/social-posts-launch.md:175` | PHANTOM | "Buying Buddy Dealer Review — $14.95" in draft social | Rewrite | P2 | Rewrite | Open |
| 118 | `content/google-ads-plan.md:117` | PHANTOM | "Average order value: $12 (mix of $4.95 + $14.95 + $19.95)" | Recalc for plan tiers | P2 | Rewrite | Open |
| 119 | `src/lib/site-content.ts:4` | COPY | `FULL_BUNDLE_LINK` env-less Stripe URL named for a phantom product | Remove with PRICING_PLANS rewrite | P2 | Remove | Open |
| 120 | `src/components/deal-room/deal-components.tsx:8` | COPY | Dev comment "I'll build out the subcomponents…" — not user-visible | Remove dev comment | P2 | Remove | Open |
| 121 | `src/app/api/stripe/webhook/route.ts:36` | COPY | Telegram admin notification: "Do the $2 PPSR search at ppsr.gov.au…" | Internal-only, not rendered to users — OK to keep but note mismatch vs plan fulfilment wording | P2 | Verify | Open |
| 122 | `src/app/check/page.tsx:5-6` | COPY | Meta description: "fast dealer-style verdict" | OK, verify tone against plan's "Direct, not desperate" | P2 | Verify | Open |
| 123 | `src/app/blog/page.tsx:7-8` | COPY | Blog meta OK | Low-risk baseline | P2 | Verify | Open |
| 124 | `src/app/deal/demo/page.tsx` | SCOPE | Public `/deal/demo` route exists — test-mode demo | Confirm intended public exposure; add noindex if internal-only | P2 | Verify | Open |

---

## Rollup

### Counts
- **P0:** 82 rows
- **P1:** 31 rows
- **P2:** 11 rows
- **Total inventoried drift rows:** 124
- **User-facing surfaces walked:** 27 pages + 14 components + 6 copy libraries + 6 API routes + 27 blog/content files = 80 surfaces

### Top 5 P0 fixes (ranked by reach × severity)

1. **Homepage rebuild (`src/app/page.tsx`)** — 21 P0 rows. The entire page pitches a "$997 buyer's agent service" as a co-equal offering to the tools. Every concierge tile, service-area list, trust-pill, FAQ about $997, and "Book the 15-min call" CTA must go, plus the meta / OG / Twitter / keywords blocks. This is the single highest-leverage fix.

2. **Root layout + structured data (`src/app/layout.tsx`, `src/components/structured-data.tsx`)** — 11 P0 rows. Site-wide title, description, OG, Twitter, and JSON-LD all brand the site as "Brisbane Car Buyer's Agent Service" with a priced Offer node at AUD 997 and a Service node with `serviceType: "Used car buyer's agent"`. Google is actively being told the wrong thing about the business.

3. **Delete `/car-buyers-agent-pullenvale`, `/buddy`, `/ppi`** — 9 P0 rows across three parked/phantom routes. These entire pages + their API handlers + their sitemap entries + the footer link + the TOOLKIT_CARDS entry need to come out. Deletion is cleaner than rewrite.

4. **Pricing rebuild (`src/app/pricing/page.tsx` + `src/lib/site-content.ts`)** — 12 P0 rows. Pricing page has five tiers including phantom "Dealer Review" $14.95 and "Full Pack" $34.95, and is missing the $9.99 Deal Pack bundle that the plan specifies. `site-content.ts` carries a parallel set of phantom plans ("Confidence Report" $9.95, "Full Bundle" $39) with hardcoded Stripe links. Needs a two-tier rebuild ($4.95 PPSR / $9.99 Deal Pack).

5. **Free Check verdict generator (`src/lib/free-check.ts`) + order success page + email templates** — 18 P0 rows. Every free-check result string, every order-success branch, and the email product-label map bake in "Dealer Review $14.95" / "Full Pack $34.95" upsells and "Jordan will review the listing… within a few hours" live-time promises. Users who hit the tools today get phantom-product upsells and live-service promises the plan explicitly rules out.

### Blockers surfaced

- **`src/lib/stripe.ts` + `src/lib/site-content.ts` Stripe buy links.** The phantom "Dealer Review", "Full Confidence Pack", "Confidence Report", and "Full Bundle" SKUs are hardcoded. Before rollback, confirm with Jordan whether to (a) delete the SKUs server-side, (b) keep them and just hide them, or (c) repoint the buy links to a new $9.99 Deal Pack SKU that may not yet exist in Stripe.
- **`$9.99 Deal Pack` bundle doesn't exist in code or Stripe.** The plan mandates it as the main paid offer. Creating it is a build task, not a copy rollback — flagging as a dependency for the Phase 1 rewrite to land cleanly.
- **Two free-tool surfaces (`/check` and `/free-kit`)** — plan describes one "Free Check" tool. Decide which is canonical before rewriting copy. `/check` is the AI-powered listing analyser (matches plan); `/free-kit` is an email-gated PDF download (adjacent but distinct). Probably both stay but need clear differentiation — flag for Jordan.
- **`/deal/demo` public route** — exists without noindex. If intentional demo, fine; if internal-only, needs robots/meta treatment.
- **Blog HTML files live in `content/posts/blog/*.html` as pre-rendered HTML.** Rewriting them means editing HTML directly (not a rich editor), and the loader caches. Rewrite approach needs a plan.
- **`pricing-card.tsx` ships Crown icon + isPremium prop.** No current page uses `isPremium` (pricing/page.tsx uses a simpler `highlight` pattern), but the component is imported as public API and could be reused. Decide: delete props or keep as unused.
- **Jordan-as-foreground appears in 6+ places.** Plan says "background, not foreground." Mechanical find-and-rewrite; but check for any marketing commitments (Lexus/BMW award) that need to stay for credibility — surface to Jordan.

---

## Anti-drift sanity check

After the Phase 1 rollback lands, the following must be true. This audit confirms NONE of these are currently true (every box fails):

- [ ] No page/email/meta contains "buyer's agent", "concierge", or "$997"
      *(Audit finding: present in 20+ surfaces — homepage, layout, structured-data, Pullenvale page, blog post, site footer.)*
- [ ] $99 Quick Review not surfaced publicly
      *(Audit finding: Not surfaced. **This one passes.** Grep for `\$99\b` returned zero matches on public pages.)*
- [ ] All pricing $4.95 (PPSR) / $9.99 (Deal Pack) only
      *(Audit finding: $9.95, $14.95, $34.95, $39, $39.95, $997 all appear publicly. Plan's $9.99 Deal Pack does not appear anywhere.)*
- [ ] No "I'll", "I will", "we'll review" anywhere (user-facing)
      *(Audit finding: `/contact` uses "I'll get back to you"; `/order/success` uses "Jordan will review… within a few hours"; `/ppi` confirmation uses "We'll be in touch within a few hours".)*
- [ ] Inspection Checklist clearly free
      *(Audit finding: **Passes** on `/inspect`, `/inspect/full`, `/inspect/print` — all present as free tools. Related drift: point-count is inconsistent (14 on inspect pages, 20 in free-kit, 25 on homepage, 47 in site-content.ts).)*
- [ ] Free Check positioned as free lead tool
      *(Audit finding: `/check` is free and correctly positioned — **passes**. Concurrent `/free-kit` is a separate free PDF-download lead-magnet; also free but adjacent. Not a drift but worth aligning naming.)*

**Summary:** 2 of 6 anti-drift checks pass; 4 fail. Phase 1 rollback scope is substantive but well-contained to copy and route deletion — no underlying product logic needs rebuilding, consistent with the plan's "Roll back copy, not product" rule.
