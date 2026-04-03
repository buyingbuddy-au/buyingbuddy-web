# APP SHELL REBUILD SPEC

## Objective
Transform buyingbuddy.com.au from a traditional scrolling website into a mobile-first web app with bottom navigation, toolkit cards, and screen-based views. Keep ALL existing API routes and backend logic untouched.

## Design Reference
Jordan approved a purple app-like version with these characteristics:
- Bottom nav bar with 5 icons (Home, Check, PPSR, Inspect, Chat)
- "BuyingBuddy." wordmark top-left + "QLD ACTIVE" status badge top-right
- "YOUR TOOLKIT" section with stacked cards (icon + title + description + chevron)
- Each toolkit card links to a real feature screen
- Clean, compact, mobile-first layout
- NO traditional website sections (hero banners, long scroll, footer)

## Colour Scheme (TEAL, not purple)
- Primary: #0D9488 (teal-600)
- Primary hover: #0f766e (teal-700)
- Background: #FFFFFF (white)
- Card backgrounds: #F9FAFB (gray-50)
- Text primary: #111827 (gray-900)
- Text secondary: #6B7280 (gray-500)
- Active nav icon: #0D9488
- Inactive nav icon: #9CA3AF (gray-400)
- Success/positive: #16A34A (green-600)
- Warning/risk: #DC2626 (red-600)
- DO NOT use navy (#1A237E) or lime (#00C853) anywhere

## Layout Structure

### Root Layout (src/app/layout.tsx)
```
<html>
  <body>
    <div class="flex flex-col min-h-screen">
      <!-- Top bar: minimal -->
      <header class="sticky top-0 z-50 bg-white border-b px-4 py-3 flex justify-between items-center">
        <span class="text-lg font-black text-gray-900">BuyingBuddy.</span>
        <span class="text-xs font-bold bg-teal-50 text-teal-700 px-3 py-1 rounded-full">QLD ACTIVE</span>
      </header>
      
      <!-- Main content area -->
      <main class="flex-1 pb-20">{children}</main>
      
      <!-- Bottom nav: fixed -->
      <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t grid grid-cols-5 py-2">
        <!-- Home, Check, PPSR, Inspect, Chat -->
      </nav>
    </div>
  </body>
</html>
```

### Bottom Navigation Component (src/components/bottom-nav.tsx)
- 5 items: Home, Free Check, PPSR, Inspect, Buddy
- Icons: Home, Search, Shield, ClipboardCheck, MessageCircle (from lucide-react)
- Active state: teal icon + teal label text
- Inactive: gray-400 icon + gray-500 label
- Use Next.js usePathname() to determine active state
- Links: /, /check, /ppsr, /inspect, /buddy

### Home Screen (src/app/page.tsx) — COMPLETE REWRITE
Top section:
- Greeting: "Buy your next car without the risk."
- Subtitle: "Instant PPSR checks, AI-powered inspections, and QLD-compliant paperwork."
- One big teal CTA button: "Run Free Check" → /check

YOUR TOOLKIT section:
- Section heading: "YOUR TOOLKIT" (small caps, gray-500)
- Stacked cards, each with:
  - Left: teal icon in rounded bg
  - Middle: bold title + gray description
  - Right: chevron arrow
- Cards:
  1. "Free Car Check" → /check — "AI-powered listing check. Paste a URL or enter make/model/year."
  2. "PPSR Report" → /ppsr — "Finance, stolen, write-off checks. From $4.95."  
  3. "Inspect Tool" → /inspect — "25-point guided inspection checklist. Use at the car."
  4. "Contract Pack" → /contract-pack — "QLD private sale paperwork. From $9.95."
  5. "Buddy Chat" → /buddy — "Ask anything about buying a used car in QLD."
  6. "Blog & Guides" → /blog — "28 guides on scams, PPSR, inspections, and QLD process."

Trust section (bottom of home):
- Three small trust badges in a row:
  - "Licensed QLD Dealer" with Shield icon
  - "15+ Years Experience" with Clock icon  
  - "Australian Built" with Flag icon

### Free Check Screen (src/app/check/page.tsx) — NEW PAGE
- Move the existing free check form logic from current page.tsx
- Clean form: Listing URL input, OR make/model/year inputs, email, asking price
- Big teal "Run Free Check" button
- Results appear below the form (same as current)
- Upsell cards after results: "Want deeper checks?" → PPSR, Dealer Review, Full Pack

### PPSR Screen (src/app/ppsr/page.tsx) — NEW PAGE
- Hero: "Check if a car has finance, theft, or write-off history."
- VIN/Rego input + email input
- Price: "$4.95 per check"
- Teal "Run PPSR Check" button → existing /api/stripe/checkout
- Trust badges: "Official PPSR data", "Results in minutes", "Plain English report"

### Inspect Screen — KEEP EXISTING (src/app/inspect/page.tsx)
- Already built with 25 checkpoints
- Just needs minor styling update to match teal theme

### Buddy Chat Screen (src/app/buddy/page.tsx) — NEW PAGE
- Full-screen chat layout
- Move existing BuddyChat component here
- Make it the primary view, not a floating widget

### Blog — KEEP EXISTING (src/app/blog/)
- No changes needed, accessible from toolkit

## Files to Create
1. src/components/bottom-nav.tsx — Bottom navigation bar
2. src/components/app-header.tsx — Minimal top bar (BuyingBuddy. + QLD ACTIVE)
3. src/app/check/page.tsx — Free check screen (moved from homepage)
4. src/app/ppsr/page.tsx — PPSR check screen
5. src/app/buddy/page.tsx — Full buddy chat screen

## Files to Modify
1. src/app/layout.tsx — New app shell layout with bottom nav + minimal header
2. src/app/page.tsx — COMPLETE REWRITE to home screen with toolkit cards

## Files to NOT TOUCH
- src/app/api/** — ALL API routes
- src/app/admin/** — Admin panel
- src/app/blog/** — Blog pages
- src/app/order/** — Order flow
- src/app/inspect/** — Inspection tool (minor style tweaks OK)
- src/app/contract-pack/** — Contract pack page
- src/app/free-kit/** — Free kit page
- src/app/ppi/** — PPI page
- src/lib/** — Library code (except adding new utils if needed)
- .env files, .github/, next.config.ts

## Key Technical Notes
- The free check form logic is complex (847 lines in current page.tsx). Extract the form + result display into a component, then use it in /check
- BuddyChat component already exists at src/components/buddy-chat.tsx — reuse it
- The existing Stripe checkout logic must work exactly as before
- All internal links must update to new routes
- pb-20 on main content to account for bottom nav height
- Bottom nav should hide on desktop (lg:hidden) and show traditional nav instead

## Quality Rules
- Must compile with npm run build
- Mobile-first: must look great at 375px
- No console errors
- All links resolve
- Bottom nav active states work correctly
- Forms submit to correct API routes
