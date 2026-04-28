# Buying Buddy Launch Plan

**Status:** deploy-prep
**Source of truth:** `docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md`

## Positioning

Buying Buddy is buyer-side used-car help for everyday Australians: a self-serve alternative to a traditional buyer's agent, not a done-for-you sourcing or concierge service.

Allowed language:

- buyer-side used-car help
- self-serve buyer's-agent alternative
- car-buying help before money changes hands
- cheap tools for expensive used-car mistakes

Avoid language:

- full-service buyer's agent
- we find/negotiate/handle the purchase for you
- concierge
- $997 service
- Brisbane/Pullenvale local buyer-agent SEO positioning

## Launch offer

1. **Free Listing Check** — first touch / trust builder.
2. **PPSR Report — $4.95** — minimum paid verification before deposit or handover.
3. **Deal Pack — $9.99** — PPSR next-step guidance, contract pack, and guided handover flow.
4. **Free Inspection Checklist / Contract Pack** — useful lead magnets and supporting tools.

Hidden/future only:

- $99 Quick Review — post-purchase/support experiment only; not public front-door copy.

## Public routes for launch

Primary:

- `/`
- `/check`
- `/ppsr`
- `/pricing`
- `/deal`
- `/inspect`
- `/contract-pack`
- `/free-kit`
- `/blog`

Redirected legacy/off-scope routes:

- `/buddy` -> `/check`
- `/car-buyers-agent-pullenvale` -> `/`
- `/ppi` -> `/inspect`

## Deployment checklist

Before deploy:

- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] Drift scan for old buyer-agent/local/$997/service copy
- [ ] Confirm sitemap excludes redirected legacy routes
- [ ] Confirm Stripe product labels/prices match launch offer

After deploy:

- [ ] Fetch live homepage title/copy
- [ ] Fetch live `/pricing`
- [ ] Fetch live `/ppsr`
- [ ] Confirm `/buddy` redirects to `/check`
- [ ] Confirm `/car-buyers-agent-pullenvale` redirects to `/`
- [ ] Confirm `/ppi` redirects to `/inspect`
- [ ] Run a test checkout only in test mode, or avoid checkout if live Stripe mode is active

## Fast launch sequence

1. Commit the cleaned repositioning work.
2. Push/deploy.
3. Re-audit live public pages immediately.
4. Fix any remaining copy drift as a hotfix.
5. Then focus traffic on Free Listing Check -> PPSR -> Deal Pack.
