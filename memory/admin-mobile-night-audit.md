# Admin Mobile Operations Audit — 6 April 2026

## Scope
Admin section: `/admin`, `/admin/orders`, `/admin/orders/[id]`, login page.

## Issues Found & Fixed

### globals.css — admin mobile CSS

1. **`admin-topbar` — missing `flex-wrap`**
   - Was: no `flex-wrap`, could overflow on narrow screens with "Buying Buddy Admin / Order engine" + logout button
   - Fix: Added `flex-wrap: wrap`, reduced gap to `12px`

2. **`admin-stats-grid` — single column on mobile**
   - Was: `minmax(220px, 1fr)` collapses to 1 column at 375px (only 335px usable width)
   - Fix: Mobile uses `repeat(2, 1fr)` for a 2×2 layout; 768px+ switches to `repeat(4, 1fr)`

3. **`admin-nav a` — touch target below 44px**
   - Was: `min-height: 38px`
   - Fix: Bumped to `44px`, padding to `0 16px`

4. **`admin-back-link` — touch target missing**
   - Was: no `min-height`, no vertical centering
   - Fix: Added `min-height: 44px`, `align-items: center`

5. **`admin-code-block` (pre) — horizontal overflow on mobile**
   - Was: `overflow: auto` but no `max-width`, long JSON lines could break layout
   - Fix: Added `max-width: 100%`, `overflow-x: auto`, `word-break: break-word`

6. **`admin-detail-list dd` — UUIDs/paths don't wrap**
   - Fix: Added `word-break: break-word; overflow-wrap: anywhere` — Order IDs, report paths, emails now wrap properly

7. **`admin-filter-btn` — button not full-width on mobile**
   - Was: no class, renders as `inline-flex`; in a grid column it stretched but button text looked odd
   - Fix: Added `.admin-filter-btn { width: 100% }` for mobile, `width: auto` at 768px+

8. **`admin-card` padding — 20px too tight on 375px**
   - Fix: Reduced to `16px` on mobile, restores `20px` at 480px+

9. **`admin-detail-grid` minmax — 220px too narrow**
   - Fix: Bumped to `minmax(280px, 1fr)` so two-column layout only kicks in at ≥600px

### display.ts — missing product label (TypeScript error + runtime bug)

- `PRODUCT_LABELS` was missing `deal_room` entry
- TS error: `Property 'deal_room' is missing in type Record<ProductType, string>`
- Runtime: `format_product("deal_room")` would return `undefined` in any order list/detail view
- Fix: Added `deal_room: "Deal Room"` to the map

### orders/page.tsx — missing Deal Room filter option

- `PRODUCT_OPTIONS` didn't include `deal_room` product
- Fix: Added `{ label: "Deal Room", value: "deal_room" }` to the filter select

## What Was NOT Changed

- Admin login page — already clean, single card, `hero-input` handles 100% width
- Order detail page JSX — structure is solid; flex-wrap already on all row elements
- PPSRProcessForm — textarea/button interaction is fine, no mobile friction
- Actions (save_review_action, send_report_action) — unchanged

## Pre-existing TS Errors Not in Scope

- `scripts/ppsr-automation/runner.ts` — playwright not installed (expected)
- `tests/checkout.spec.ts` — @playwright/test not installed (expected)
- `src/lib/deals.ts` — nullable `value` access (pre-existing, low risk)

## Commit

`b2de819` — `fix(admin): mobile UX fixes — touch targets, stats grid, code block overflow, filter btn, deal_room product label`

Files changed:
- `src/app/globals.css`
- `src/lib/display.ts`
- `src/app/admin/(protected)/orders/page.tsx`

## Verification Steps for Jordan

1. Open `/admin` on phone — stats should show as 2×2 grid
2. Check `/admin/orders` — filter button should be full-width, selects should be easy to tap
3. Open any order detail — UUID should wrap, JSON code block should scroll horizontally without breaking layout
4. "Back to orders" link should be easy to tap (44px height)
5. If any Deal Room orders exist, they should show "Deal Room" label (not undefined)
