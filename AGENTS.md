# Buying Buddy Agent Instructions

Before changing this project, read:

- `docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md`
- `docs/command-center/README.md`
- `docs/buyingbuddy-product-plan.md`
- `docs/audits/2026-04-phase-1/drift-register.md`

## Current launch truth

Buying Buddy is low-cost buyer-side help for private used-car buyers: a self-serve alternative to a traditional buyer's agent, starting QLD-first.

Public launch products:

- Free Listing Check
- $4.95 PPSR Report
- $9.99 Deal Pack
- Free inspection checklist and QLD contract pack

## Do not reintroduce drift

Allowed positioning:

- buyer-side used-car help
- self-serve buyer's-agent alternative
- generic car-buying help for Australians

Do not position Buying Buddy as:

- a traditional full-service buyer's agent
- a concierge service
- a car sourcing service
- a premium done-for-you product
- a $997 public offer
- a standalone AI chat destination

If public copy implies Buying Buddy will find the car, negotiate for the buyer, handle the whole purchase, or book a buyer's-agent call, treat it as a P0 bug and remove it.

## Release checks

Before saying the site is ready, run at least:

```bash
npm run typecheck
```

Prefer also running:

```bash
npm run build
```

If a check fails, report the exact failure and whether it appears related to your change.
