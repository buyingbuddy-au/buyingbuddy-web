# Buying Buddy — Deployment Readiness Audit
## Date: 25 March 2026, 11:34 PM

---

## ❌ BLOCKERS (Cannot deploy until fixed)

### 1. BANNED COLOURS STILL IN TAILWIND CONFIG
**Severity: CRITICAL — Rule violation**
- `brand.navy: #1A237E` — BANNED, must be removed
- `brand.lime: #00C853` — BANNED, must be removed
- `brand.cream: #F5F7FF` — Not in the approved palette
- `brand.ink: #0F164A` — Not the approved ink (#111827)
- Missing: `brand.teal: #0D9488` — THE primary accent colour
- Homepage and globals.css are using the old navy palette
**Fix: Replace entire tailwind config colour set with approved palette: teal (#0D9488), ink (#111827), white**

### 2. HOMEPAGE USES OLD COLOUR PALETTE
**Severity: CRITICAL — Rule violation**
- Background: navy gradient
- CTAs: navy blue
- Stats bar: navy background
- Every coloured element uses the BANNED navy/lime palette
**Fix: Homepage needs full colour overhaul to white/teal/ink**

### 3. STRIPE WEBHOOK SECRET NOT CONFIGURED
**Severity: CRITICAL — Payments won't work**
- .env.local has STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY
- Missing: STRIPE_WEBHOOK_SECRET (line 32 of stripe.ts falls back to "WHATEVER")
- Without this, Stripe webhooks won't verify, no orders will be created
**Fix: Create webhook in Stripe Dashboard, add WH_SECRET to .env.local**

### 4. EMAIL IS A STUB
**Severity: CRITICAL — Nothing gets delivered**
- `email.ts` — both functions just do `console.info()`, no actual email sending
- No RESEND_API_KEY or email provider configured
- Customer pays → order created → nobody gets any email
**Fix: Set up Resend (free tier, 100 emails/day) or Brevo, wire into email.ts**

### 5. PDF GENERATION IS A STUB
**Severity: CRITICAL — Reports don't exist**
- `pdf.ts` — `generate_order_pdf()` returns placeholder text, not a real PDF
- The "send report" admin action will send... nothing
**Fix: Implement real PDF generation with @react-pdf/renderer or pdfkit**

---

## ⚠️ ISSUES (Not blocking, but need fixing)

### 6. `typescript: { ignoreBuildErrors: true }` in next.config.ts
**Severity: HIGH — Hides bugs**
- TypeScript errors won't stop builds
- Should be `false` before deployment
- Run `npx tsc --noEmit` first, fix any errors, then set to `false`

### 7. `eslint: { ignoreDuringBuilds: true }` in next.config.ts
**Severity: MEDIUM — Hides lint issues**
- Same principle as above

### 8. `cpus: 1` in experimental config
**Severity: MEDIUM — Performance impact**
- Limits Next.js to 1 CPU core
- Should be removed or set to auto for deployment

### 9. Missing `validate_email_captures` / `validate_product_type` in lib/db.ts
**Severity: MEDIUM — Type safety**
- Functions exist but don't validate against the actual schema
- Edge case: could cause runtime errors if database schema drifts

### 10. Homepage CTAs Not Connected to Engine
**Severity: MEDIUM — Revenue impact**
- The V4 homepage hero has "Check My Listing" and "Get Started" buttons
- These are NOT wired to POST /api/check or Stripe checkout
- They probably just scroll to anchors
- Customer clicks button → nothing happens → leaves

### 11. No `.env.example` file
**Severity: LOW — Developer experience**
- No template showing which env vars are needed
- Should include: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY, ADMIN_PASSWORD, DATABASE_PATH

### 12. Homepage NOT using SITE_COPY_V5.md
**Severity: MEDIUM — Content mismatch**
- SITE_COPY_V5.md has the approved 4-tier product copy
- Homepage is still showing the old V4 content
- Needs homepage rebuild with approved copy

### 13. No CSS for the new V5 content
**Severity: MEDIUM — Styling missing**
- The globals.css was updated with hero/product/navbar styles, but these are for the OLD design
- New homepage sections (How It Works, Product Tiers, Testimonials, FAQ) have no styles
- A new homepage build will need fresh CSS

---

## ✅ WHAT'S ACTUALLY GOOD

- **All 8 API routes exist and TypeScript passes** — architecture is solid
- **Database schema is complete** — orders table, email captures, proper types
- **Engine module is comprehensive** — order creation, product validation, admin auth, all wired up
- **Admin dashboard structure** — login page, protected routes, order list, order detail with review form
- **Stripe checkout flow** — proper input validation, URL resolution, session creation
- **Scraping module** — handles Facebook Marketplace, Carsales, Gumtree (with Puppeteer fallback for Facebook)
- **Analysis module** — red flag detection, market value estimation, days listed tracking
- **Git repo is clean** — .env.local excluded from git, buyingbuddy-data excluded

---

## DEPLOYMENT READINESS SCORE: 4/10

The ARCHITECTURE is good. The IMPLEMENTATION is incomplete.

What's ready:
- Database schema ✅
- API route structure ✅
- Stripe checkout flow ✅
- Admin dashboard skeleton ✅
- Listing analysis logic ✅
- Scraping infrastructure ✅

What's NOT ready:
- Homepage (banned colours, old copy) ❌
- Email delivery (stub) ❌
- PDF generation (stub) ❌
- Stripe webhooks (no secret) ❌
- Homepage CTAs (not wired to engine) ❌

---

## RECOMMENDED FIX ORDER

1. Fix Tailwind colours (10 min)
2. Rebuild homepage with SITE_COPY_V5.md colours (2-3 hours)
3. Wire homepage CTAs to /api/check and Stripe checkout (1 hour)
4. Implement real PDF generation (1-2 hours)
5. Implement real email delivery with Resend (30 min)
6. Create Stripe webhook, add to .env.local (15 min)
7. Set typescript.ignoreBuildErrors and eslint to false, fix errors (1 hour)
8. Remove cpus: 1 from config
9. Test full payment flow end-to-end

**Total estimated work to deployment: 6-8 hours**
