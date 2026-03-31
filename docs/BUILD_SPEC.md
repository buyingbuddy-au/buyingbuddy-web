# Buying Buddy V4 — Enterprise Rebuild Spec

## Design Direction
Competitor reference: carify.com.au and carhistory.com.au
Both are white-dominant, clean, modern sans-serif, with a VIN/rego input in the hero.
We are building something that feels MORE premium than both.

## Design System

### Colours
- Background: #FFFFFF (primary), #F9FAFB (section alternate)
- Text primary: #111827
- Text secondary: #6B7280
- Accent: #0D9488 (teal — trust, premium, not cheap)
- Accent hover: #0F766E
- Accent light bg: #F0FDFA
- Border: #E5E7EB
- Dark section bg: #111827 (near-black, not navy blue)
- Dark section text: #F9FAFB
- Success green: #10B981 (for checkmarks)
- DO NOT USE: #1A237E (navy), #00C853 (lime green) — these are banned

### Typography
- All text: system font stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- NO serif fonts anywhere. Not Georgia. Not Times. Pure sans-serif.
- Headings: font-weight 800, tracking -0.02em
- Body: font-weight 400, 15px, line-height 1.6
- Labels/badges: font-weight 600, 11px, uppercase, letter-spacing 0.08em
- Prices: font-weight 800, tabular-nums

### Spacing
- Section padding mobile: 48px 20px
- Section padding desktop: 72px 24px
- Max content width: 960px
- Card border-radius: 12px
- Button border-radius: 8px
- Card shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)
- Card hover shadow: 0 4px 12px rgba(0,0,0,0.1)

### Buttons
- Primary: bg #0D9488, text white, height 48px, px 24px, font 14px weight 600
- Secondary: bg white, border 1.5px #E5E7EB, text #111827, same dimensions
- On dark bg: bg white, text #111827

## Page Structure (6 sections only)

### 1. HEADER (sticky, 56px)
- White background, subtle bottom border (#E5E7EB)
- Left: "Buying Buddy" text logo (no coloured badge, just text, weight 800, size 16px, color #111827)
- Right: "Get Report — $9.95" teal button (small, 36px height)
- Clean, minimal, Apple-level restraint

### 2. HERO
- White background (NOT dark)
- Left-aligned on mobile, can be two-col on desktop
- Overline: "Vehicle History Reports" — label style, teal colour
- H1: "Know the full story before you buy." — 32px mobile, 44px desktop, weight 800, color #111827
- Subtext: "Search any car by VIN or rego. We check PPSR, stolen vehicle register, write-off status, and rego history — then send you a clear PDF report in under 30 seconds." — 15px, color #6B7280
- INPUT FIELD: A search-style input with placeholder "Enter VIN or rego number" and a teal "Check Now — $9.95" button beside it. On mobile the button goes below the input. Both have 48px height, 12px radius.
- Trust badges below input: "✓ Official PPSR data · ✓ 30-second delivery · ✓ Money-back guarantee" — 12px, color #9CA3AF, inline

### 3. WHAT'S INCLUDED
- Alternate bg (#F9FAFB)
- Label: "What's in the report"
- H2: "Everything a licensed dealer checks."
- 6 items in a 2-column grid on mobile (3-col desktop)
- Each item: icon (use simple text symbols, NOT emoji), bold title (13px, #111827), description (12px, #6B7280)
- Items: PPSR Check, Stolen Vehicle, Write-Off Status, Rego History, Vehicle Identity, Plain-English Summary
- Below grid: a subtle bordered box showing "Sample report preview coming soon" placeholder (for now)

### 4. SOCIAL PROOF
- Dark section bg (#111827)
- One stat: "$93.5M lost to vehicle scams in 2023 — ACCC" — stat number in teal, large (36px), text in white/60%
- One testimonial quote with name, location, stars
- Tight. 3 lines. No cards. No avatars.

### 5. PRICING
- White bg
- H2: "Simple pricing. No subscriptions."
- TWO cards side by side (stacked on mobile)
- Card 1 (primary, teal border): "Confidence Report" / $9.95 / feature list with checkmarks / teal CTA button
- Card 2 (secondary, grey border): "Full Bundle" / $39 / feature list / dark CTA button
- Below cards: small text link "Looking for free resources? Visit our blog →"
- Primary card has a small "Most Popular" badge

### 6. FAQ
- Alternate bg (#F9FAFB)
- H2: "Questions"
- 4 items. Clean accordion. Header: #111827 bg (not navy), white text, 14px
- Max width 600px

### 7. FINAL CTA
- Dark bg (#111827)
- H2: "Check before you buy." — white
- Subtext — white/60%
- One white button: "Get Report — $9.95"
- Tight. 5 lines total.

### 8. FOOTER
- #111827 bg, small text, minimal
- © 2026 Buying Buddy · Brisbane, Australia
- 4 links: Report, Pricing, Blog, FAQ

### STICKY MOBILE BAR
- White bg, subtle top border, small shadow
- Left: "Check before you buy" (12px, bold)
- Right: teal button "$9.95"
- Hidden on desktop (768px+)

## File Output
Rewrite these 3 files completely:
1. src/app/globals.css — full CSS, no Tailwind classes needed, pure CSS
2. src/app/layout.tsx — header + footer + metadata
3. src/app/page.tsx — all 6 sections + sticky bar

## Rules
- No emoji icons. Use text symbols (→, ✓, ✕) or nothing.
- No serif fonts.
- No navy blue (#1A237E).
- No lime green (#00C853).
- No glassmorphism or gradients on cards.
- No oversized cards. Keep padding tight (20px max on mobile).
- Every section earns its place. If it doesn't build trust or drive action, cut it.
- The VIN/rego input in the hero is the centrepiece. Even if it just links to Stripe for now.
- Mobile-first. 390px is the primary design target.
