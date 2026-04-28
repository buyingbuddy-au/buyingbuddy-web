# Buying Buddy full local audit — 2026-04-28

## Scope

Audited the current local launch build after the positioning reset, plus a lightweight read-only check of the live site.

Tools used:

- `npm run typecheck`
- `npm run build`
- local `npm start` on `http://localhost:3000`
- safe HTTP/API probes
- headless Chrome CDP click audit (`scripts/cdp-click-audit.mjs`)
- local route/link/API crawl (`scripts/audit-local-site.mjs`)
- `web_fetch` for live public-page reads

Browser automation through OpenClaw was unavailable because of the Windows gateway ESM `C:` loader issue, so CDP/HTTP checks were used instead.

## Local results

### Passed

- Public launch routes returned `200` locally:
  - `/`
  - `/check`
  - `/ppsr`
  - `/pricing`
  - `/deal`
  - `/inspect`
  - `/contract-pack`
  - `/free-kit`
  - `/blog`
  - `/contact`
  - `/privacy`
  - `/terms`
- Redirects behaved as intended:
  - `/buddy` → `/check`
  - `/car-buyers-agent-pullenvale` → `/`
  - `/ppi` → `/inspect`
- Internal link crawl found `40` internal links and `0` broken links.
- Headless Chrome click audit verified:
  - home CTA routes to `/check`
  - pricing PPSR CTA routes to `/ppsr`
  - `/contact` now renders the contact page
  - `/admin` redirects to `/admin/login` when no admin password is configured in production mode
  - Deal Pack page now presents Stripe checkout copy and `$9.99` CTA
- API validation checks behaved as expected:
  - `/api/check` rejects empty/default demo input
  - `/api/check` returns `200` for a valid manual vehicle payload
  - `/api/stripe/checkout` rejects invalid/missing required fields
  - `/api/deal/create` now returns `410` to prevent bypassing paid checkout
  - `/api/docs/download` rejects invalid email
- Document generation works in the production build:
  - `/api/docs/download` with a valid email returns `200 application/zip`

### Environment-gated locally

These cannot fully pass without real env vars in the local shell:

- `/api/stripe/checkout` with valid paid-product data returns `500` locally because `STRIPE_SECRET_KEY` is not configured.
- `/api/free-kit` returns `500` locally because `RESEND_API_KEY` is not configured.
- Deal Room/database-backed flows require Supabase env vars.

Those are expected local blockers, not proof of production failure. They must be verified after env is present in deployment.

## Bugs found and fixed

1. `/contact` was unreachable because `next.config.ts` redirected it to `/buddy`.
   - Fixed by removing the `/contact` redirect.

2. Production admin opened when `ADMIN_PASSWORD` was missing.
   - Fixed so missing password only auto-opens in non-production development.
   - Production now redirects `/admin` to `/admin/login` unless configured/authenticated.

3. Built production PDF/ZIP generation failed looking for `.next/server/chunks/data/Helvetica.afm`.
   - Fixed PDFKit font path patch to resolve bundled/moved AFM font paths by basename and fallback to `node_modules/pdfkit/js/data`.

4. `/api/orders` product filter omitted `deal_room`.
   - Fixed by adding `deal_room` to allowed product filters.

5. Deal Pack was advertised as `$9.99`, but the public `/deal` form created Deal Rooms directly through `/api/deal/create` without payment.
   - Fixed `/deal` form to open Stripe checkout for `deal_room` with email and rego/VIN.
   - Fixed checkout route to support `deal_room` using email + vehicle identifier and generated `deal_id` metadata.
   - Disabled public `/api/deal/create` with `410` so it cannot bypass checkout.

## Live-site read-only check

Live site still showed the old deployed state at audit time:

- homepage title: `Car Buyer’s Agent Brisbane | BuyingBuddy`
- homepage includes `$997`, buyer's-agent service, booking-call framing, and done-for-you claims
- `/pricing` still shows old Dealer Review / Full Pack products
- `/ppsr` title still includes Brisbane car buyer's-agent wording
- `/contact` redirects to `/buddy`, and `/buddy` is still public Buddy Chat

This is expected because the corrected local commits have not been pushed/deployed yet.

## Verification gates

After fixes:

- `npm run typecheck` passed
- `npm run build` passed
- `npm start` production server started successfully
- Route/link/API/CDP audit passed locally except env-gated Stripe/Resend/Supabase flows

## Deploy checklist

Before public deploy, confirm production env vars:

- `ADMIN_PASSWORD`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- Supabase URL/key used by the app
- `NEXT_PUBLIC_SITE_URL` or `SITE_URL`
- `TELEGRAM_BOT_TOKEN` if Telegram order notifications should work

After deploy, re-audit live:

- public pages: `/`, `/pricing`, `/ppsr`, `/check`, `/deal`, `/free-kit`, `/contact`
- redirects: `/buddy`, `/car-buyers-agent-pullenvale`, `/ppi`
- admin login gate
- Stripe checkout creation for PPSR and Deal Pack
- Stripe webhook order/deal creation
- Resend customer/admin emails
- document download and Deal Summary PDF generation
