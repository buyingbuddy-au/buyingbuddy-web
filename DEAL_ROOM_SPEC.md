> ⚠️ **Pricing / positioning in this file may be outdated.**
> For current product truth see `/docs/buyingbuddy-product-plan.md` (locked 2026-04-16).
> This doc is kept for technical reference (design system, architecture, specs) only.

# DEAL ROOM — Full Build Spec

## Overview
A shared digital workspace between buyer and seller for a QLD private car sale.
NOT a contract. NOT legally binding. A timestamped "Deal Record" — a voluntary
record of what both parties agreed to.

Price: $39.95 to create a room. Seller access is free via shared link.

## Database Schema

### deals table (new, SQLite via better-sqlite3)
```sql
CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY,                    -- nanoid, e.g. "deal_abc123def"
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'draft',   -- draft | buyer_paid | buyer_complete | seller_invited | both_complete | finalised
  stripe_session_id TEXT,
  
  -- Vehicle
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year TEXT,
  vehicle_vin TEXT,
  vehicle_rego TEXT,
  
  -- Deal terms
  agreed_price TEXT,
  payment_method TEXT,                    -- cash | bank_transfer | payid
  conditions TEXT,                        -- free text for agreed conditions
  handover_date TEXT,
  handover_location TEXT,
  
  -- Buyer
  buyer_name TEXT,
  buyer_email TEXT,
  buyer_phone TEXT,
  buyer_licence_url TEXT,                 -- path to uploaded file
  buyer_completed_at TEXT,
  
  -- Seller
  seller_name TEXT,
  seller_email TEXT,
  seller_phone TEXT,
  seller_licence_url TEXT,
  seller_rego_papers_url TEXT,
  seller_safety_cert_url TEXT,
  seller_bank_bsb TEXT,
  seller_bank_account TEXT,
  seller_payid TEXT,
  seller_completed_at TEXT,
  seller_confirmed_price INTEGER DEFAULT 0,  -- 0 or 1
  seller_confirmed_conditions INTEGER DEFAULT 0,
  
  -- PDF
  summary_pdf_url TEXT,
  finalised_at TEXT
);
```

CONFIRMED: The codebase uses better-sqlite3 with file at buyingbuddy-data/buyingbuddy.db.
The db.ts file creates tables on init. Add the deals table to the same init function.
Follow the exact same pattern as the orders table in src/lib/db.ts.

For Stripe: Add 'deal_room' to PaidProductType in src/lib/types.ts and add the
product definition in src/lib/stripe.ts:
  deal_room: { product: 'deal_room', name: 'Deal Room', description: 'Digital handover workspace for QLD private car sales.', price_cents: 3995 }

Also update is_paid_product() to include deal_room.

For the webhook: In src/app/api/stripe/webhook/route.ts, add a handler for
product === 'deal_room' that creates the deal record and sends the buyer
their deal room link via Resend.

IMPORTANT: The success URL for deal_room checkouts should be /deal/[id] not
/order/success. Set it in the checkout session creation.

## File Upload Approach
Since we're on Vercel serverless, we can't store files on disk permanently.
Options (pick simplest that works):
1. Vercel Blob (if available) — ideal, built-in
2. Base64 in database — works for small files (licence photos), ugly but functional
3. /tmp storage — lost on cold start, not suitable

RECOMMENDED: Store uploads as base64 in the database for now. Licence photos
and rego papers are typically < 2MB each. It's ugly but it ships tonight.
For a future sprint, migrate to Vercel Blob or S3.

## API Routes

### POST /api/deal/create
- Auth: none (public)
- Body: { email: string }
- Creates a Stripe checkout session for $39.95
- On success returns { ok: true, checkout_url: string }
- Stripe metadata: { product: "deal_room", buyer_email: email }

### Stripe Webhook (existing /api/stripe/webhook)
- Add handler for deal_room product type
- On checkout.session.completed where product === "deal_room":
  - Create deal record in DB with status "buyer_paid"
  - Generate deal ID (nanoid)
  - Send buyer email with deal room link

### GET /api/deal/[id]
- Returns deal data (buyer and seller sections)
- No auth — anyone with the link can view (like Google Docs sharing)
- Sensitive fields (bank details) only visible to the party that submitted them

### PATCH /api/deal/[id]/buyer
- Updates buyer section
- Body: { buyer_name, buyer_email, buyer_phone, buyer_licence (base64),
          vehicle_make, vehicle_model, vehicle_year, vehicle_vin, vehicle_rego,
          agreed_price, payment_method, conditions, handover_date, handover_location }
- Sets buyer_completed_at if all required fields present

### PATCH /api/deal/[id]/seller
- Updates seller section
- Body: { seller_name, seller_email, seller_phone, seller_licence (base64),
          seller_rego_papers (base64), seller_safety_cert (base64),
          seller_bank_bsb, seller_bank_account, seller_payid,
          seller_confirmed_price (bool), seller_confirmed_conditions (bool) }
- Sets seller_completed_at if all required fields present

### POST /api/deal/[id]/finalise
- Generates Deal Summary PDF
- Sets status to "finalised"
- Sends PDF to both buyer and seller via Resend
- Returns { ok: true, pdf_url: string }

## Pages

### /deal (landing page — new)
- Explains what Deal Room is
- Pricing: $39.95
- "Create Deal Room" button → Stripe checkout
- Trust indicators
- Disclaimer

### /deal/[id] (the actual deal room — new)
- Dynamic page that loads deal data
- Two-column layout on desktop, stacked on mobile
- Left: Buyer section (editable if buyer hasn't completed)
- Right: Seller section (editable if seller hasn't completed)
- Status board at top showing completion progress
- "Finalise Deal" button when both sides complete
- Share link for seller visible at top

### /deal/[id]/summary (PDF view — optional, can just be downloadable)

## UI Design
Match existing app shell: teal (#0D9488), rounded cards, gray-50 backgrounds.

Status board at top of deal room:
```
┌─────────────────────────────────────┐
│ DEAL STATUS                         │
│                                     │
│ ✅ Buyer details      ✅ complete   │
│ ⚠️ Seller details     ⏳ pending   │
│ ✅ Price agreed        $18,500      │
│ ✅ Conditions          1 noted      │
│ ❌ Safety cert         not uploaded │
│ ⏳ Deal summary        pending      │
└─────────────────────────────────────┘
```

Each section is a form with:
- Text inputs (name, phone, email, VIN, rego, price)
- File upload areas (licence, rego papers, safety cert)
- Confirmation checkboxes (seller confirms price, conditions)
- Save button per section

## Disclaimer Text (appears on every deal page)
"This Deal Record is a voluntary summary of transaction details provided by
both parties. It is not a legal contract, does not constitute legal advice,
and is not a substitute for independent legal counsel. BuyingBuddy provides
this tool to help organise and document private vehicle transactions.
Both parties should seek their own legal advice where appropriate."

## PDF Template (Deal Summary)
Generated via existing pdfkit in the codebase.
- BuyingBuddy header
- "DEAL RECORD" title (NOT "contract")
- Vehicle details section
- Buyer details section
- Seller details section
- Agreed terms (price, payment, conditions, handover date/location)
- Timestamps: when each party completed their section
- Disclaimer at bottom
- Generated date + deal ID

## What NOT to build tonight
- Real-time live updates (polling on page load is fine)
- Chat between buyer and seller (just use the deal link + their own messaging)
- Payment escrow (way too complex, legal minefield)
- Digital signatures (implied consent via form submission is enough)
- Vercel Blob file storage (use base64 for now)

## Integration Points
- Stripe checkout: add "deal_room" as a product in src/lib/stripe.ts
- Stripe webhook: add deal_room handler in existing webhook route
- Resend: send deal room link to buyer, send deal summary to both
- Telegram: notify Jordan of new deal room purchases
- PDF: reuse existing pdfkit setup from contract pack

## Build Order
1. Database migration (add deals table)
2. API routes: create, get, buyer update, seller update, finalise
3. Stripe integration (checkout + webhook)
4. /deal landing page
5. /deal/[id] room page with forms
6. PDF generation
7. Email delivery
