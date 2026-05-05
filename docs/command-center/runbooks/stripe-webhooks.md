# Stripe Webhooks Runbook

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  

Use this before relying on paid flows.

## Safety Rule

Do not change Stripe products, prices, webhook endpoints, live/test mode, or refunds without explicit Jordan approval.

## Code Paths

Inspect:

```powershell
Get-Content src\lib\stripe.ts
Get-Content src\app\api\stripe\webhook\route.ts
```

Expected current launch products:

- PPSR Report - $4.95.
- Deal Pack - $9.99.
- Hidden/future Quick Review is not public front-door copy.

## Vercel Env Check

Run:

```powershell
vercel env ls | Select-String "STRIPE"
vercel env ls | Select-String "SITE_URL"
```

Required env names for production payment safety:

- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL` or `SITE_URL`

## Dashboard Check

In Stripe dashboard, verify:

- Account mode being inspected: test or live.
- Active products and prices match launch truth.
- Webhook endpoint is `https://buyingbuddy.com.au/api/stripe/webhook`.
- Webhook signing secret exists and is copied only into Vercel env, never docs.
- Events include `checkout.session.completed`.
- Refund handling expectations are documented before relying on automated refund state.

## Known Risk From Code Inspection

If `STRIPE_WEBHOOK_SECRET` is absent, webhook verification can fall back to parsing raw JSON. That is not acceptable for production payment reliability.

Required outcome before production reliance:

- `STRIPE_WEBHOOK_SECRET` present in Vercel production env.
- Webhook route verifies Stripe signatures in production.
- Email/Telegram failures do not create duplicate customer-facing payment problems.
