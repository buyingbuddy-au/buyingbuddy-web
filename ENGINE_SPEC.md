# Buying Buddy Engine — Technical Specification
# Lead Architect: Main Agent (Opus)
# Build Team: Codex GPT 5.4 (primary), Gemini Pro (review), Sonnet 4.6 (fallback)

## Overview
The backend system that powers Buying Buddy's product delivery pipeline.
Customer pays → system processes → deliverable sent → Jordan reviews (if needed).

## Architecture

### Stack
- **Runtime:** Next.js 15 App Router (same project as the website)
- **Database:** SQLite via better-sqlite3 (local file, zero config)
- **Payments:** Stripe Checkout + Webhooks
- **Email:** Resend (free tier: 100 emails/day, then Brevo fallback)
- **PDF Generation:** @react-pdf/renderer or jspdf
- **File Storage:** Local filesystem (workspace69/buyingbuddy-data/)

### Database Schema (SQLite)

```sql
-- Orders
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'pending',
  -- pending | processing | awaiting_review | complete | refunded
  product TEXT NOT NULL,
  -- free_check | ppsr | dealer_review | full_pack
  price_cents INTEGER NOT NULL DEFAULT 0,
  
  -- Customer
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  
  -- Stripe
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  
  -- Vehicle
  listing_url TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  vehicle_rego TEXT,
  vehicle_vin TEXT,
  vehicle_mileage INTEGER,
  vehicle_price_listed INTEGER,
  
  -- Listing analysis (free check data)
  market_value_low INTEGER,
  market_value_high INTEGER,
  days_listed INTEGER,
  red_flags TEXT, -- JSON array of flag strings
  listing_verdict TEXT,
  
  -- PPSR data (paid)
  ppsr_result TEXT, -- JSON blob of PPSR data
  ppsr_checked_at TEXT,
  
  -- Dealer review (Jordan's input)
  dealer_verdict TEXT, -- Jordan's transcribed voice note
  dealer_reviewed_at TEXT,
  
  -- Deliverables
  report_pdf_path TEXT,
  report_sent_at TEXT,
  
  -- Negotiation & contract (full pack)
  negotiation_script TEXT,
  contract_included INTEGER DEFAULT 0
);

-- Email captures from free checks
CREATE TABLE email_captures (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  email TEXT NOT NULL UNIQUE,
  listing_url TEXT,
  vehicle_summary TEXT,
  converted_to_order TEXT -- FK to orders.id if they upgrade
);
```

### API Routes

```
POST /api/check          — Free listing check (accepts URL + email)
POST /api/stripe/checkout — Creates Stripe Checkout session for paid products
POST /api/stripe/webhook  — Receives Stripe payment confirmation
GET  /api/orders          — Admin: list all orders
GET  /api/orders/[id]     — Admin: single order detail
POST /api/orders/[id]/review — Admin: submit Jordan's dealer verdict
POST /api/orders/[id]/send   — Admin: generate PDF and send to customer
GET  /api/admin           — Admin dashboard data
```

### Flow: Free Listing Check

1. Customer submits URL + email to POST /api/check
2. Server fetches the listing URL via web scraping
3. Extracts: make, model, year, price, mileage, description, seller info
4. Runs red flag analysis on description text
5. Estimates market value (cross-ref logic TBD — start with hardcoded ranges by make/model)
6. Saves to email_captures table
7. Returns JSON response with the listing snapshot
8. Sends email with results + upsell CTAs via Resend

### Flow: PPSR Check ($4.95)

1. Stripe webhook fires with payment confirmation
2. Server creates order record with product = 'ppsr'
3. For MVP: order status set to 'awaiting_review' (Jordan manually runs PPSR at ppsr.gov.au)
4. Jordan enters PPSR data via admin dashboard
5. System generates PDF report
6. System sends PDF via email to customer
7. Order status → 'complete'

Future: automate PPSR lookup via API when volume justifies the cost.

### Flow: Dealer Review ($14.95)

1. Stripe webhook fires
2. Order created with product = 'dealer_review'
3. Jordan gets Telegram notification: "New dealer review order — [listing URL]"
4. Jordan opens listing, sends voice note via Telegram
5. Voice note transcribed (whisper API) → saved as dealer_verdict
6. System generates PDF: listing snapshot + PPSR data + Jordan's verdict
7. PDF emailed to customer
8. Order status → 'complete'

### Flow: Full Confidence Pack ($34.95)

1. Same as Dealer Review, plus:
2. System generates negotiation script based on listing data + Jordan's verdict
3. QLD private sale contract template attached (pre-filled with vehicle details)
4. Pre-inspection checklist for that make/model included
5. Customer gets Jordan's phone number/text contact for 48hr support
6. All deliverables bundled into single PDF + contract as separate attachment

### Admin Dashboard (Page: /admin)

Simple, functional, mobile-friendly. NOT a design showcase — just works.

**Dashboard view:**
- New orders count (badge)
- Orders awaiting review
- Orders completed today
- Revenue today / this week / this month

**Order list:**
- Filterable by status and product type
- Each order shows: customer email, product, vehicle summary, status, created time

**Order detail:**
- Full vehicle info
- Listing URL (clickable)
- Free check results
- PPSR data (if entered)
- Dealer verdict input (text area + submit)
- "Generate & Send Report" button
- Status timeline

### Stripe Integration

**Products to create in Stripe:**
- PPSR Report: $4.95 AUD
- Dealer Review: $14.95 AUD
- Full Confidence Pack: $34.95 AUD

**Checkout flow:**
1. Customer selects product on website
2. Frontend calls POST /api/stripe/checkout with product type + listing URL + email
3. Server creates Stripe Checkout Session
4. Customer redirected to Stripe hosted checkout
5. On success: redirect to /order/success?session_id=xxx
6. Webhook confirms payment and triggers order processing

**Webhook events to handle:**
- checkout.session.completed → create order
- charge.refunded → mark order as refunded

### PDF Report Template

**Page 1: Listing Snapshot**
- Vehicle summary (make, model, year, mileage, price)
- Market value range bar
- Red flags (if any)
- Quick verdict paragraph

**Page 2: PPSR Results** (paid tiers only)
- Finance owing: Yes/No
- Stolen status: Clear/Flagged
- Write-off status: None/Repairable/Statutory
- Security interests: count
- Search date and certificate number

**Page 3: Dealer Review** ($14.95+ only)
- Jordan's full verdict (transcribed from voice)
- Pricing opinion
- Known issues for this make/model/year
- "What to look for at inspection" checklist

**Page 4: Negotiation Script** ($34.95 only)
- Opening approach
- Key points to raise
- Suggested offer price
- Walk-away price
- What to say if they push back

**Branding:**
- Header: "Buying Buddy" logo + "Vehicle Report"
- Footer: "buyingbuddy.com.au | info@buyingbuddy.com.au"
- Colors: teal (#0D9488) accent, near-black text, white background
- Clean, professional, no clutter

### Telegram Integration (for Jordan)

When a new paid order comes in:
1. Send Telegram message to Jordan's chat:
   "🚗 New [product type] order
   Vehicle: [make model year]
   Price: $[listed price]
   Link: [listing URL]
   Customer: [email]
   → Review at: http://100.101.135.21:3003/admin/orders/[id]"

2. When Jordan sends a voice note in response:
   - Transcribe via Whisper API
   - Save transcript as dealer_verdict on the order
   - Notify Jordan: "Verdict saved. Ready to generate report."

### File Structure

```
src/
  app/
    page.tsx                    — Homepage (existing V4)
    admin/
      page.tsx                  — Admin dashboard
      orders/
        page.tsx                — Order list
        [id]/
          page.tsx              — Order detail + review form
    order/
      success/
        page.tsx                — Post-payment success page
    api/
      check/
        route.ts                — Free listing check endpoint
      stripe/
        checkout/
          route.ts              — Create Stripe Checkout session
        webhook/
          route.ts              — Stripe webhook handler
      orders/
        route.ts                — List orders (admin)
        [id]/
          route.ts              — Single order (admin)
          review/
            route.ts            — Submit dealer verdict
          send/
            route.ts            — Generate + send report
      admin/
        route.ts                — Dashboard stats
  lib/
    db.ts                       — SQLite connection + helpers
    scraper.ts                  — Listing URL scraper
    analysis.ts                 — Red flag detection + market analysis
    pdf.ts                      — PDF report generator
    email.ts                    — Email sending via Resend
    stripe.ts                   — Stripe helpers
    types.ts                    — TypeScript types

buyingbuddy-data/
  buyingbuddy.db                — SQLite database file
  reports/                      — Generated PDF files
```

### Environment Variables (.env.local)

```
STRIPE_SECRET_KEY=sk_live_xxx (already saved)
STRIPE_PUBLISHABLE_KEY=pk_live_xxx (already saved)
STRIPE_WEBHOOK_SECRET=whsec_xxx (need to create)
RESEND_API_KEY=re_xxx (need to sign up — free)
OPENAI_API_KEY=xxx (for Whisper transcription — already configured)
ADMIN_PASSWORD=xxx (simple auth for admin panel)
DATABASE_PATH=../../buyingbuddy-data/buyingbuddy.db
```

### Build Priority (for overnight agent swarm)

**Phase 1 — Database + API skeleton (Codex)**
- Set up SQLite with better-sqlite3
- Create all tables
- Implement CRUD routes for orders
- Basic admin page that lists orders

**Phase 2 — Stripe Integration (Codex)**
- Checkout session creation
- Webhook handler
- Order creation on payment success
- Success page

**Phase 3 — Free Listing Check (Codex)**
- URL scraper (web_fetch based)
- Red flag analysis
- Market value stub
- /api/check endpoint
- Homepage form integration

**Phase 4 — PDF Generation (Codex)**
- Report template
- Generate from order data
- Save to filesystem

**Phase 5 — Email Delivery (Codex)**
- Resend integration
- Send report PDF as attachment
- Send free check results as HTML email

**Phase 6 — Admin Dashboard (Codex)**
- Order list with filters
- Order detail with review form
- Generate + send button
- Basic stats

### MVP Scope
For tonight's build, we ship Phases 1-3 and Phase 6.
PDF generation (Phase 4) and email (Phase 5) can be stubs that log to console.
The goal is: a working order pipeline from customer → payment → admin review → completion.
