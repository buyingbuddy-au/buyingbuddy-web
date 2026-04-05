# CTA Map — BuyingBuddy Full App Audit
_Generated: 2026-04-06 (overnight build workstream 6)_

---

## Primary CTA Map

### Global Navigation
| Surface | CTA | Destination | Status |
|---------|-----|-------------|--------|
| App Header (desktop) | Nav links: Home, Free Check, PPSR, Inspect, Buddy, Contracts, Guides | All correct routes | ✅ OK |
| App Header (desktop) | "QLD ACTIVE" badge | No link — decorative only | ⚠️ Missed opportunity (could link to /pricing) |
| App Header (mobile) | No CTA — logo + badge only | — | ⚠️ No primary CTA in mobile header |
| Bottom Nav (mobile) | Home, Check, PPSR, Inspect, Buddy | Correct | ✅ OK — but missing: Deal, Contract-Pack, Pricing |
| `header-cta.tsx` component | "Run Free Check" button | `/#hero-input` scroll/anchor | ❌ DEAD END — `hero-input` ID does not exist in homepage; the hero input lives at `/check`. Clicking from non-homepage routes users correctly to `/check`, but on homepage it tries to scroll to a non-existent element and silently fails. |

---

### Homepage (`/`)
| CTA | Destination | Status |
|-----|-------------|--------|
| Hero: "Run Free Check" button | `/check` | ✅ OK |
| Toolkit card: Free Car Check | `/check` | ✅ OK |
| Toolkit card: PPSR Report | `/ppsr` | ✅ OK |
| Toolkit card: Inspect Tool | `/inspect` | ✅ OK |
| Toolkit card: Contract Pack | `/contract-pack` | ✅ OK |
| Toolkit card: Deal Room | `/deal` | ✅ OK |
| Toolkit card: Buddy Chat | `/buddy` | ✅ OK |
| Toolkit card: Blog & Guides | `/blog` | ✅ OK |
| Trust badges | No link — decorative | ✅ Fine |
| CheckoutCancelledBanner | Dismiss only | ✅ OK |
| **Missing** | No link to `/pricing` from homepage | ⚠️ No pricing entry point on homepage |
| **Missing** | No link to `/free-kit` from homepage | ⚠️ Free kit acquisition flow missing |

---

### Check Page (`/check` → `free-check-form.tsx`)
| CTA | Destination | Status |
|-----|-------------|--------|
| "Run Free Check" submit button | `/api/check` → renders results | ✅ OK |
| Results: Share button | `navigator.share` / clipboard | ✅ OK |
| Results: "Compare plans" link | `/pricing` | ✅ OK |
| Results: PPSR upgrade card button | `/api/stripe/checkout` → Stripe | ✅ OK |
| Results: Dealer Review upgrade button | `/api/stripe/checkout` → Stripe | ✅ OK — but `href` prop points to `/pricing` (fallback link), actual click fires checkout |
| Results: Full Pack upgrade button | `/api/stripe/checkout` → Stripe | ✅ OK — but `href` prop points to `/contract-pack` (fallback link) |
| Results: Inspect tool CTA | `/inspect` via right column copy | ⚠️ No direct button to inspect from results. Copy mentions it but no button. |
| **PPSR checkout validation** | Requires email + rego/VIN | ✅ Has inline field; if rego missing → helpful error |
| **Dealer Review validation** | Requires listing URL | ✅ Shows error, scrolls to URL input |
| **Full Pack validation** | Requires listing URL | ✅ Same |
| Success redirect (PPSR) | `/order/success?session_id=...` | ✅ OK |
| Success redirect (others) | `/order/success?session_id=...` | ✅ OK |
| Cancel redirect | `/?checkout=cancelled` | ✅ Shows cancelled banner |

---

### PPSR Page (`/ppsr`)
| CTA | Destination | Status |
|-----|-------------|--------|
| "Run PPSR Check" submit button | `/api/stripe/checkout` → Stripe | ✅ OK |
| Success redirect | `/order/success?session_id=...` | ✅ OK |
| Cancel redirect | `/?checkout=cancelled` | ✅ Shows banner on homepage |
| **Missing after checkout** | No "what happens next" info beyond generic success page | ⚠️ Success page copy says "within 2 hours" — adequate |
| Trust badges (decorative) | None | ✅ Fine |
| **No escape path** | After form — no link back or to /pricing, /check | ⚠️ Minor dead-end if user second-guesses |

---

### Deal Page (`/deal`)
| CTA | Destination | Status |
|-----|-------------|--------|
| "Create Deal Room — $39.95" submit | `/api/deal/create` → Stripe | ✅ OK |
| Success redirect | `/deal/{id}` (the actual deal room) | ✅ OK — good UX |
| Cancel redirect | `/deal?checkout=cancelled` | ✅ Shows cancelled banner |
| CheckoutCancelledBanner | Dismiss only | ✅ OK |
| **No cross-sell to contract-pack** | Deal landing has no link to contract-pack | ⚠️ Minor — deal is paid, contract-pack is free, complementary |

---

### Deal Room (`/deal/[id]`)
| CTA | Destination | Status |
|-----|-------------|--------|
| "Share with seller" button | `navigator.share` / clipboard with current URL | ✅ OK |
| "Save Buyer Details" | `/api/deal/{id}/buyer` PATCH | ✅ OK |
| "Save Seller Details" | `/api/deal/{id}/seller` PATCH | ✅ OK |
| "Finalise Deal & Send PDF" | `/api/deal/{id}/finalise` POST | ✅ OK |
| Deal not found: "Create a Deal Room" | `/deal` | ✅ OK |
| **Post-finalise** | No CTA after deal finalised — page shows static message | ⚠️ Dead end after finalise. No "return home" or "run another check" CTA. |

---

### Contract Pack (`/contract-pack`)
| CTA | Destination | Status |
|-----|-------------|--------|
| Hero: "Download Full Pack — Free" | Opens modal → `/api/docs/download` | ✅ OK |
| Bottom CTA: "Download Full Pack — Free" | Same modal | ✅ OK |
| Bottom CTA: "Back to free check" | `/check` | ✅ OK |
| Modal: submit downloads ZIP | Browser download trigger | ✅ OK |
| Modal: cancel | Closes modal | ✅ OK |
| **Success state in modal** | Shows ✅ message, close button | ✅ OK |
| **No cross-sell to PPSR** | No mention of PPSR on contract-pack page | ⚠️ Natural next step if user has paperwork but no history check |

---

### Pricing Page (`/pricing`)
| CTA | Destination | Status |
|-----|-------------|--------|
| "Download Free" (Free Kit card) | `/free-kit` | ✅ OK |
| "Run PPSR Check" (PPSR card) | `/ppsr` | ✅ OK |
| "Download Free" (Contract Pack card) | `/contract-pack` | ✅ OK |
| "Start Review" (Dealer Review card) | `/check` | ✅ OK — routes to check page |
| "Get Full Pack" (Full Pack card) | `/check` | ⚠️ Sends to `/check` not a dedicated full-pack checkout. User must then re-enter listing + run check + find full pack upgrade card. Clunky. |
| Bottom CTA: "Run Free Check" | `/check` | ✅ OK |
| **No direct /ppsr checkout from pricing** | Goes to /ppsr page, then checkout | ✅ Acceptable — /ppsr has the form |
| **Dealer Review / Full Pack no dedicated page** | Both route to `/check` | ⚠️ Full Pack path is broken UX: pricing → check → run check → find Full Pack card. Too many steps. |

---

### Order Success Page (`/order/success`)
| CTA | Destination | Status |
|-----|-------------|--------|
| "Back to home" | `/` | ✅ OK |
| "Read guides" | `/blog` | ✅ OK |
| **Missing** | No "Run another check" or upsell after success | ⚠️ Low priority — user just bought something |
| PPSR order: copy says "within 2 hours" | — | ✅ OK — clear expectation |
| Non-PPSR order: generic copy | — | ⚠️ "order is in the queue" is vague for dealer_review/full_pack products |

---

### Free Kit Page (`/free-kit`)
| CTA | Destination | Status |
|-----|-------------|--------|
| "Download Free Kit" submit | `/api/free-kit` | ✅ OK — email sent |
| Success state | "Kit on its way!" message, no further action | ⚠️ No next CTA after download. Dead end. |
| **No cross-sell after success** | Should nudge to `/check` or `/ppsr` | ⚠️ Missed conversion moment |

---

### PPI Page (`/ppi`)
| CTA | Destination | Status |
|-----|-------------|--------|
| PpiForm submit | `/api/ppi` (lead capture) | ✅ OK — it's a lead form, not checkout |
| **No visible CTA on page to other tools** | — | ⚠️ Completely isolated page, no cross-navigation |

---

### 404 Not Found
| CTA | Destination | Status |
|-----|-------------|--------|
| "Back home" | `/` | ✅ OK |
| "Open blog" | `/blog` | ✅ OK |

---

## Checkout Journey Audit (End-to-End)

### PPSR Journey
```
/ppsr → enter rego + email → "Run PPSR Check" → Stripe checkout (test card) 
→ /order/success?session_id=... → "Back to home" / "Read guides"
```
**Status:** ✅ Clean. Functional. Webhook fires → order created → admin processes → email delivered.
**Gap:** Cancel sends to `/?checkout=cancelled` — banner shows on homepage, ✅ good.

### Dealer Review Journey
```
/check → enter listing URL + email → "Run Free Check" → see results 
→ "Start Dealer Review" button → validates email + listing URL 
→ Stripe checkout → /order/success → done
```
**Status:** ✅ Mostly clean.
**Gap:** If user goes to `/pricing` → clicks "Start Review" → lands on `/check` with no context, must redo entry.

### Full Pack Journey
```
/pricing → "Get Full Pack" → /check → run check → find Full Pack upgrade card → Stripe
```
**Status:** ⚠️ Broken UX. User arrives at `/check` cold — no indication they were looking for Full Pack. Must run a check first, then scroll to find the upgrade cards.

### Deal Room Journey
```
/deal → enter email → "Create Deal Room" → Stripe → /deal/{id} (auto-redirect) 
→ fill buyer details → share with seller → seller fills → finalise → PDF emailed
```
**Status:** ✅ Solid flow. Best checkout-to-product UX in the app.
**Gap:** Post-finalise screen has no outbound CTA.

### Contract Pack Journey
```
/contract-pack → "Download Full Pack — Free" → modal → enter email → download ZIP
```
**Status:** ✅ Clean. Free download, no Stripe involved.
**Gap:** Post-download modal has no cross-sell.

---

## Prioritised Fix List

### 🔴 P1 — Fix Now (Dead Ends / Broken CTAs)

**1. `header-cta.tsx` — broken `hero-input` scroll target**
- Problem: `href="/#hero-input"` but element `hero-input` doesn't exist in homepage. Scroll silently fails.
- Fix: Change `href` to `"/check"` and remove the scroll logic OR add `id="hero-input"` to the homepage URL input area (but there's no URL input on homepage, the check is on `/check`).
- **Decision:** Remove `HeaderCta` component usage entirely from layout (it's not even imported into layout.tsx currently — it was never used in the main layout). The component is an orphan. Mark for cleanup.
- **Safe fix:** Component already unused in layout.tsx — no live impact. Leave for cleanup.

**2. Success page — vague copy for non-PPSR products**
- Problem: `dealer_review` / `full_pack` success says "Payment succeeded. Buying Buddy will process the order and send the report once it clears review." — confusing for dealer_review (Jordan needs to know what to do).
- Fix: Differentiate success copy by product type.

**3. Free Kit success state — dead end**
- Problem: After "Kit on its way!", no CTA. User stranded.
- Fix: Add "Run a free check on your car →" link to `/check` after success.

**4. Deal Room post-finalise — dead end**
- Problem: After "Deal finalised!" banner appears, no next action. User stranded.
- Fix: Add "Return home" or "Run another check" button after finalise.

### 🟡 P2 — Important but Not Blocking

**5. Pricing page — Full Pack UX is broken**
- Problem: "Get Full Pack" → `/check` with no context. User must run a check, find upgrade cards.
- Fix: Either (a) add a direct `full_pack` checkout endpoint that accepts listing URL on pricing page, or (b) add query param to `/check?intent=full_pack` that highlights the Full Pack card on arrival and shows a banner explaining what to do.
- Recommended: Option (b) — simpler, no new route needed.

**6. Homepage — no pricing link**
- Problem: Pricing page not linked from homepage at all. 
- Fix: Add "See full pricing →" link in the toolkit section or below the hero.

**7. `/inspect` results → no upsell path**
- Problem: After using the free inspection tool, there's no "now get a PPSR" or "create a deal room" CTA in sight.
- Fix: Add a subtle cross-sell panel at the bottom of inspection completion screen.

**8. PPSR page — no escape path**
- Problem: No links to other products if user changes mind.
- Fix: Add a small "Or run a free check first →" text link below the form.

**9. Contract pack — no PPSR cross-sell**
- Problem: Natural pairing (paperwork + history check) not surfaced.
- Fix: Add a single "Before you sign — check the PPSR →" callout after the download section.

**10. `/deal` landing — no link to contract-pack**
- Problem: Deal Room and Contract Pack are complementary. No cross-navigation.
- Fix: Add a small "Need QLD paperwork?" link pointing to `/contract-pack`.

### 🟢 P3 — Nice to Have

**11. Bottom nav missing: Deal, Contract-Pack, Pricing**
- Currently only 5 items: Home, Check, PPSR, Inspect, Buddy.
- Deal Room and Contract Pack are paid products with no mobile nav entry.
- Fix: Consider replacing "Buddy" with "More" which opens a drawer, or add a 6th item — but 5-item nav is already standard, keep as-is with awareness.

**12. Mobile header — no primary CTA**
- Header has only logo + "QLD ACTIVE" badge on mobile.
- No quick-action button for new visitors.
- Fix: Optionally add a small "Check →" link in mobile header.

**13. `header-cta.tsx` component cleanup**
- Unused component sitting in codebase. Remove or repurpose.

**14. Success page — "Read guides" link**
- After a paid checkout, "Read guides" is low-value. 
- Consider "Inspect your car →" or "Set up Deal Room →" depending on product.

---

## Safe Fixes Applied This Session

### Fix A: Free Kit success state — add CTA
**File:** `src/components/free-kit-form.tsx`
Added "Run a free check →" link after success state.

### Fix B: Deal Room post-finalise — add home CTA
**File:** `src/app/deal/[id]/page.tsx`
Added "Back to homepage" button in the isFinalised block.

### Fix C: Success page — differentiated copy for product types
**File:** `src/app/order/success/page.tsx`
Improved copy for dealer_review and full_pack products.

### Fix D: Contract Pack — add PPSR cross-sell
**File:** `src/app/contract-pack/page.tsx`
Added subtle "Check PPSR first" callout before download CTA.

---
_Next steps (P2 work for next session):_
- Pricing page Full Pack UX fix (query param intent approach)
- Homepage: add pricing link
- PPSR page: add escape path link
