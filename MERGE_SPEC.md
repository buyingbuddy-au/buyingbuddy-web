# MERGE SPEC: Repo B Design → Repo A Backend

## Objective
Port Repo B's navy/lime branding, Shadcn UI components, Aussie copy, and content pages into Repo A's working Next.js codebase. DO NOT touch Repo A's API routes, Stripe logic, or backend functionality.

## Source (Repo B - design/copy only)
Location: C:\Users\jrl-j\OneDrive\Desktop\Buying buddy 2.0\buying_buddy\app

## Target (Repo A - working backend)
Location: C:\Users\jrl-j\.openclaw\workspace69\projects\buyingbuddy-web

## What to Port

### 1. Tailwind Config
Replace Repo A's tailwind.config.ts with Repo B's config. Key changes:
- Add darkMode: ["class"]
- Add Shadcn/UI CSS variable-based color system (border, input, ring, background, foreground, primary, secondary, destructive, muted, accent, popover, card)
- Add navy color palette (navy-700: #1A237E as main)
- Add lime color palette (lime-500: #00C853 as main)
- Add borderRadius with CSS variable
- Add accordion keyframes for Radix
- Add tailwindcss-animate plugin
- Keep existing content paths pointing to ./src/**

### 2. Global CSS (src/app/globals.css)
Replace with Repo B's globals.css. Key additions:
- CSS custom properties: --navy, --lime, --navy-light, --lime-light, gray scale
- Shadcn @layer base rules
- Component classes: .btn-primary (lime bg), .btn-secondary (navy bg), .btn-outline, .section-container, .card
- Custom scrollbar styling (navy thumb)
- Smooth scrolling
- fadeInUp and slideInLeft animations
- KEEP any existing Repo A styles that are used by backend pages (check before removing)

### 3. Dependencies to Add (package.json)
Install these from Repo B:
- @radix-ui/react-accordion, @radix-ui/react-dialog, @radix-ui/react-slot, @radix-ui/react-tabs, @radix-ui/react-tooltip (only the ones actually used)
- class-variance-authority
- clsx (already in Repo A)
- lucide-react
- tailwindcss-animate
- framer-motion (if content pages use it)
- next-themes (if dark mode is used)

DO NOT install: prisma, next-auth, plotly, mapbox, recharts, or other Repo B deps not needed.

### 4. Shadcn UI Components
Copy from Repo B's components/ui/ directory to src/components/ui/ in Repo A:
- button.tsx
- card.tsx
- badge.tsx (if used)
- accordion.tsx (if used by content pages)
- tabs.tsx (if used)
- dialog.tsx (if used)
Only copy components actually imported by the pages being ported.

### 5. Layout Components
Port from Repo B's components/ to src/components/:
- header.tsx → New navy/lime header with mobile menu. Update nav links to match Repo A's actual pages (blog, free-kit, inspect, contract-pack, ppi) PLUS new content pages
- footer.tsx → Navy footer with lime accents. Update links to match actual pages. Change email to info@buyingbuddy.com.au
- cta-section.tsx → Reusable CTA component
- sticky-cta.tsx → Mobile sticky CTA
- pricing-card.tsx → Pricing card component

### 6. Content Pages to Port (as new pages in src/app/)
From Repo B's app/ directory:
- about/page.tsx → src/app/about/page.tsx
- pricing/page.tsx → src/app/pricing/page.tsx
- how-it-works/page.tsx → src/app/how-it-works/page.tsx
- free-checklist/page.tsx → src/app/free-checklist/page.tsx
- second-opinion/page.tsx → src/app/second-opinion/page.tsx
- contact/page.tsx → src/app/contact/page.tsx

Update all imports to match Repo A's src/ directory structure.
Update all links to point to real Repo A pages where applicable.
Replace any fake form actions (setTimeout) with real API routes from Repo A where they exist.

### 7. Homepage
Repo A's homepage (src/app/page.tsx) should be RESKINNED with Repo B's homepage design:
- Navy/lime hero section with the killer copy ("Don't Be the Mug Who Gets Scammed")
- Trust indicators
- How it works section
- Pricing cards
- CTA sections
BUT keep links pointing to Repo A's working pages (free-kit, blog, inspect, etc.)

### 8. Repo A Layout (src/app/layout.tsx)
Update to use Repo B's design approach:
- Import Inter font
- Add new header and footer components
- Remove old header/footer
- Keep metadata relevant to Repo A's SEO

## DO NOT TOUCH
- src/app/api/** (all API routes)
- src/app/admin/** (admin panel)
- src/app/blog/** (blog pages)
- src/app/order/** (order flow)
- src/app/inspect/** (inspection tool)
- src/app/contract-pack/** (contract pack page)
- src/app/free-kit/** (free kit page)
- src/app/ppi/** (PPI page)
- Any server-side logic, database code, or Stripe integration
- .env files
- .github/ directory
- next.config.ts

## Design Tokens
- Primary navy: #1A237E
- Primary lime: #00C853
- Background: white/gray-50 for content, navy for hero/footer
- Text: navy for headings, gray-700/800 for body
- Accents: lime for CTAs, links, icons

## Quality Rules
- Must compile with `npm run build` (or `next build`)
- Mobile-first: all pages must work at 375px
- No console errors
- All internal links must resolve to real pages
- No dead imports
