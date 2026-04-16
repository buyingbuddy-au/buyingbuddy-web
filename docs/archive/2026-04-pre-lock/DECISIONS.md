# DECISIONS.md — Buying Buddy

**Purpose:** Named, dated decisions that have been made. Prevents re-litigating resolved questions.

---

## [2026-03-31] Decision: SQLite is not used for the live product
**Context:** ENGINE_SPEC.md called for SQLite via better-sqlite3. Vercel serverless can't run it.
**Chosen:** All API routes rewritten to be stateless. No database file in production.
**Alternatives considered:** PlanetScale, Turso, Supabase — all add complexity and cost for MVP
**Owner:** Codex (resolved during initial build)
**Status:** ✅ RESOLVED

---

## [2026-03-31] Decision: Webhook is not configured
**Context:** Stripe checkout creates sessions but webhook secret wasn't added to Vercel env vars
**Chosen:** Orders must be created manually from Stripe dashboard until webhook is configured
**Alternatives considered:** Polling Stripe API — adds cost and latency
**Action required:** Jordan or agent with Stripe dashboard access must create webhook
**Status:** ❌ OPEN — this is the #1 blocker

---

## [2026-03-31] Decision: Email is a stub
**Context:** email.ts was written as a stub for Resend integration
**Chosen:** Resend was chosen as email provider (free tier: 3,000/month)
**Alternatives considered:** SendGrid, Brevo — Resend was chosen, key obtained
**Action required:** Wire Resend API key into email.ts, test with real email
**Status:** ❌ OPEN — second biggest blocker

---

## [2026-03-31] Decision: PDF is fully built — NOT a stub
**Context:** Audit incorrectly flagged pdf.ts as a stub
**Chosen:** Fully implemented using PDFKit. `generate_order_report(order)` produces a 3-page branded A4 PDF:
  - Page 1: Cover — vehicle summary table, market value bar (red/green), red flags checklist, quick verdict
  - Page 2: PPSR results — finance owing, stolen, write-off, security interests
  - Page 3: Dealer review verdict text
**Evidence:** `src/lib/pdf.ts` (full implementation) + `scripts/generate-test-pdf.ts` (imports and calls it)
**Status:** ✅ BUILT — remaining question is whether the /api/pdf-report endpoint calls it correctly

---

## [2026-03-31] Decision: Scraping is abandoned
**Context:** Automating Facebook Marketplace / Carsales scraping consistently hit bot protection
**Chosen:** "Smart Input" model — user pastes listing URL, server fetches metadata via web_fetch
**Alternatives considered:** Puppeteer with rotating proxies — cost and complexity too high
**Limitations:** web_fetch can't handle JS-heavy sites (Carsales, some FB Marketplace listings)
**Status:** ✅ RESOLVED — form updated to accept manual fields as fallback

---

## [2026-03-31] Decision: Domain stays at buyingbuddy.com.au
**Context:** Multiple domains owned (carsellingassistant.com.au, qldcarcheck.com.au, etc.)
**Chosen:** buyingbuddy.com.au is the primary. Others redirect or point to landing pages.
**Rationale:** Brand consistency matters more than domain variety
**Status:** ✅ RESOLVED

---

## [2026-03-31] Decision: Jordan IS the product
**Context:** AGENT-ROSTER.md described 7 AI agents running the business. Zero deployed.
**Chosen:** At V1, Jordan manually writes every dealer verdict. The "dealer review" tier is Jordan's time.
**Implication:** The $14.95 product can't scale without Jordan's involvement. Price accordingly.
**Status:** ✅ RESOLVED — this is the business model, not a limitation to fix

---

## [2026-03-31] Decision: Calculator is parked until V1 works
**Context:** STRATEGY.md calls the calculator the "#1 viral tool" and Week 2 priority
**Chosen:** Not built until the delivery pipeline works end-to-end
**Rationale:** No point driving traffic to a funnel that can't deliver
**Status:** ✅ RESOLVED — explicitly parked

---

## [2026-03-31] Decision: PPI inspection app is parked until V2
**Context:** buyingbuddy-inspection/ folder exists with camera components. $0.95 price doesn't cover AI vision cost.
**Chosen:** Archive the inspection folder. Revisit when calculator is live and driving traffic.
**Status:** ✅ DECIDED — not yet archived

---

## [2026-03-31] Decision: QLD is the geography
**Context:** PPSR and contract law are QLD-specific
**Chosen:** Site explicitly targets QLD private buyers. Content, contract, and PPSR are QLD-specific.
**Rationale:** Don't try to be everything to everyone in V1
**Status:** ✅ RESOLVED

---

## [2026-03-31] Decision: Facebook account attempt is abandoned
**Context:** Created account for BuyingBuddy, got to video selfie checkpoint, Jordan said "ban"
**Chosen:** Park Facebook social presence. Jordan's personal Facebook can be used later for a Business Page.
**Status:** ✅ RESOLVED

---

## [2026-03-31] Open Question: Stripe webhook endpoint
**What:** Which URL does the Stripe webhook point to?
**Options:**
- `https://buyingbuddy.com.au/api/stripe/webhook` (production)
- `https://buyingbuddy-web.vercel.app/api/stripe/webhook` (preview)
- Local tunnel for testing (ngrok or openclaw tunnel)
**Decision needed by:** Jordan or agent with Stripe dashboard access
