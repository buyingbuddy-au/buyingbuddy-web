# CTA & Button Audit — Night Run

## What Was Fixed (Safe Changes)
1. **Shared Results Page (`/shared/[id]`) Crashing:** The page crashed when rendering inspection app and quick-print share links due to missing fields (e.g., `summary_points.map` would throw, `vehicle_heading` was missing, and invalid dates). I added defensive null-checks and graceful fallbacks for all fields. Also patched the decoder to handle both standard `base64` and `base64url` safely.
2. **Contract Pack Pricing Contradiction:** `pricing/page.tsx` was fixed (by another workstream) to list the Contract Pack as "Free", but `contract-pack/page.tsx` still displayed "$9.95" in the hero while offering a "Free Download" button. I updated the hero price on `contract-pack/page.tsx` to read "Free" to eliminate the contradiction.

## Remaining Issues (Prioritized)

### P1 (High Friction / Dead Ends)
- **Dealer Review & Full Pack CTAs (Pricing Page):** The "Start Review" ($14.95) and "Get Full Pack" ($34.95) buttons on the `/pricing` page both route users to `/check`. There is no direct purchase flow for these products. 
- **Upgrade Dead End on `/check`:** If a user runs a free check by manually entering Make/Model/Year (without a listing URL), they cannot upgrade to the Dealer Review or Full Pack products. The Stripe checkout route requires a `listing_url` for those products, so clicking the upgrade button simply throws an error asking them to paste a URL.

### P2 (Discoverability & Polish)
- **`/ppi` Page is Orphaned:** The Pre-Purchase Inspection booking page is functional but is only linked at the very end of the full inspection flow (`/inspect/full`). It is entirely missing from the top navigation (`app-header.tsx`) and bottom navigation (`bottom-nav.tsx`), meaning most users will never find it.
- **PPSR Form Validation:** The VIN/Rego input on the `/ppsr` page lacks a `required` HTML attribute. While the JavaScript correctly disables the submit button if the field is empty, adding standard HTML validation improves accessibility and mobile UX.
- **Dead Code (`header-cta.tsx`):** This component is completely unused. It references legacy CSS classes (`button button-primary`) and attempts to scroll to an element (`#hero-input`) that no longer exists on the homepage. Safe to delete.
