# Hermes Handover - Buying Buddy Web - 2026-05-06

Audience: Hermes, the next build agent.

Purpose: give you the current project truth, repo evidence, launch blockers, and page-by-page continuation plan without making you repeat the inspection work.

Do not deploy, change production env vars, change Stripe/Supabase/DNS, or send customer emails without explicit Jordan approval in the current thread. The command-center rule still applies.

---

## Project Reality Report

### 1. Project Identity

Product name: Buying Buddy, sometimes written as BuyingBuddy in code and UI.

Target user: everyday Australian used-car buyers, QLD-first, especially private-sale buyers coming from Facebook Marketplace or similar listings.

Main purpose: low-cost buyer-side tools that help a buyer check a listing, run a PPSR, inspect the car, and document the private-sale handover. This is not meant to be a premium buyer's-agent or concierge service.

Core launch journey:

1. User starts at `/` or `/check`.
2. User runs a free listing or manual vehicle check.
3. If serious, user buys a `$4.95` PPSR report through Stripe.
4. Jordan/admin manually or semi-manually processes the PPSR and emails a branded PDF.
5. User can use `/inspect`, `/contract-pack`, or buy the `$9.99` Deal Pack at `/deal`.
6. Deal Pack opens a shared Deal Room at `/deal/[id]` where buyer/seller details are recorded and a PDF can be generated.

Current stage: local repo is a working MVP/beta codebase, not a launch candidate. The code builds and typechecks, but launch-critical environment, Supabase schema, Stripe webhook, live deployment, off-scope route cleanup, and security gaps are not verified or not fixed.

Live production reality: `https://buyingbuddy.com.au` is stale. Vercel shows the latest production deploy is 14 days old. Live pages still expose old buyer-agent/Pullenvale/$997 drift. Local commits are ahead of `origin/main` and are not live.

### 2. Technical Stack

Framework: Next.js 15 App Router.

Language: TypeScript, React 19.

Package manager: npm.

UI/styling: Tailwind CSS plus custom global CSS in `src/app/globals.css`; lucide-react icons; some Radix/shadcn-adjacent dependencies.

Backend/server: Next.js route handlers under `src/app/api`.

Database: Supabase via `@supabase/supabase-js` in `src/lib/supabase.ts` and `src/lib/db.ts`. No Supabase migrations or schema files are in the repo.

Auth: simple admin password cookie in `src/lib/admin-auth.ts`. No user accounts. Deal Room is public by unguessable URL only.

Payments: Stripe Checkout and webhooks in `src/lib/stripe.ts`, `src/app/api/stripe/checkout/route.ts`, and `src/app/api/stripe/webhook/route.ts`.

Email: Resend in `src/lib/email.ts`, `src/app/api/free-kit/route.ts`, `src/app/api/docs/download/route.ts`, `src/app/api/ppi/route.ts`, and PPSR processing.

PDF/report generation: PDFKit in `src/lib/pdf.ts`, `src/lib/ppsr-pdf.ts`, `src/lib/deal-pdf.ts`, and `src/lib/handover-pdfs.ts`. Contract pack ZIP uses `archiver`.

Uploads: Vercel Blob via `src/lib/upload.ts`, but if Blob fails it falls back to storing base64 strings in Supabase fields.

Hosting/deploy target: Vercel, GitHub Actions deploy on push to `main` via `.github/workflows/deploy.yml`.

Third-party APIs: Stripe, Resend, Telegram Bot API, Supabase, OpenRouter/OpenAI/Google AI optional fallbacks, Vercel Blob, Vercel Analytics.

### 3. Repository Structure

```text
README.md
Purpose: top-level project summary.
Status: partially stale.
Notes: says "$4.95 PPSR Check - instant, automated, self-serve"; current product truth and code are manual/same-business-day. Do not treat README pricing/delivery copy as final without checking centre of truth.

AGENTS.md
Purpose: repo-level operating rules.
Status: important.
Notes: tells agents to read centre-of-truth and command-center docs first.

docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md
Purpose: current product positioning, pricing, scope, anti-drift rules.
Status: authoritative.
Notes: this file wins when other docs conflict.

docs/command-center/
Purpose: operational source for agents, release state, runbooks, platform status.
Status: active but not fully current after this audit.
Notes: this handover should be treated as the newest operational inspection.

src/app/
Purpose: Next.js pages, layouts, route handlers.
Status: working local build, but includes off-scope and experimental routes.
Notes: build generated 68 routes.

src/app/api/
Purpose: API surface for check, Stripe, admin, orders, Deal Room, PDFs, cron, shared links, PPI, Buddy chat.
Status: mixed. Some launch-critical, some off-scope leftovers.

src/lib/
Purpose: core business modules for DB, Stripe, email, PDF, Deal Room, analysis, scraping, uploads.
Status: usable but needs launch hardening.

src/components/
Purpose: forms, layout, inspection app, UI pieces.
Status: mostly working. Some unused placeholder/off-scope components remain.

content/posts/
Purpose: HTML blog content rendered by `src/lib/blog.ts`.
Status: useful content. Blog chrome is current; some post content mentions PPI generically.

tests/
Purpose: tests.
Status: very thin. Only `tests/stripe-webhook-safety.test.mjs` is wired to `npm test`.

scripts/
Purpose: local audit/PDF/PPSR automation scripts.
Status: partly experimental. PPSR automation has env mismatch and selectors are best-effort.

buyingbuddy-data/
Purpose: legacy local SQLite artifacts and sample PDF.
Status: tracked legacy artifacts.
Notes: current app DB layer is Supabase, not these SQLite files.

.env.example
Purpose: env template.
Status: stale/incomplete.
Notes: missing Supabase, admin, site URL, Telegram, AI, Blob, cron vars; includes unused `NEXT_PUBLIC_CONTRACT_PACK_CHECKOUT_URL`.

next.config.ts
Purpose: Next build config and redirects.
Status: builds, but quality gates are weakened.
Notes: `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors` are true; build skips validation.

.github/workflows/deploy.yml
Purpose: Vercel prod deploy on push to `main`.
Status: real deploy path.
Notes: pushing main can trigger production deploy.
```

---

## Verification Evidence

Commands run from `C:\Users\jrl-j\Projects\Active\buyingbuddy-web`.

```powershell
git status --short --branch
```

Result before writing this handover:

```text
## main...origin/main [ahead 15]
```

This local `main` is ahead of `origin/main`. Earlier command-center work is also on PR #1: `cofounder/buyingbuddy-command-center-preflight`.

```powershell
npm test
```

Result:

```text
pass 2, fail 0
```

Only two Node tests ran, both checking webhook-secret fail-closed behavior.

```powershell
npm run build
```

Result:

```text
Compiled successfully
Skipping validation of types
Skipping linting
Generated static pages (68/68)
```

Build passes, but Next build is configured to skip lint and TypeScript errors.

```powershell
npm run typecheck
```

Result: passed.

```powershell
npm run lint
```

Result: failed because no `lint` script exists.

```powershell
npm ls @playwright/test
```

Result: empty. `tests/checkout.spec.ts` imports `@playwright/test`, but the root project does not install it and no script runs it.

```powershell
vercel env ls
```

Observed env names:

```text
SITE_URL
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
TELEGRAM_BOT_TOKEN
OPENROUTER_API_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
RESEND_API_KEY
```

Missing launch-critical env names:

```text
STRIPE_WEBHOOK_SECRET
ADMIN_PASSWORD
CRON_SECRET
BLOB_READ_WRITE_TOKEN
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
TELEGRAM_CHAT_ID
```

Notes:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is only used for test-mode banner detection on `/ppsr`. It is not required for server checkout, but the current code checks it.
- `TELEGRAM_CHAT_ID` has a hardcoded fallback in code.
- `CRON_SECRET` is important because the nurture cron route is public if it is unset.
- `BLOB_READ_WRITE_TOKEN` is needed if Deal Room uploads should go to Vercel Blob instead of base64 fallback.

```powershell
vercel ls buyingbuddy-web
```

Observed latest production deployment: Ready, Production, 14 days old.

Live route check:

```powershell
$routes = @('/','/check','/ppsr','/pricing','/deal','/inspect','/contract-pack','/free-kit','/blog','/buddy','/ppi','/car-buyers-agent-pullenvale','/deal/demo','/sitemap.xml','/robots.txt')
foreach ($route in $routes) {
  $url = "https://buyingbuddy.com.au$route"
  curl.exe -L -s -o NUL -w "%{http_code} %{url_effective}" $url
}
```

Observed live results:

- All checked routes returned `200`.
- `/buddy`, `/ppi`, and `/car-buyers-agent-pullenvale` did not redirect live.
- `/deal/demo` is public live.
- `/sitemap.xml` live still contains `/buddy` and `/ppi`.

Live drift snippets confirmed on `https://buyingbuddy.com.au/`:

- Structured data contains `Brisbane Car Buyer's Agent Service` priced at `997`.
- Structured data contains `Pullenvale`.
- Structured data contains `QLD Contract Pack` priced at `9.95`.
- Homepage body links to `/car-buyers-agent-pullenvale`.

Browser Use note: the in-app browser automation was not usable in this desktop session because the Codex app-server failed to start with a missing path error. Live checks above used Vercel CLI and direct HTTP/curl instead.

---

## What Works Now

- Local repo builds successfully with `npm run build`.
- TypeScript passes with `npm run typecheck`.
- Root public routes are implemented: `/`, `/check`, `/ppsr`, `/pricing`, `/deal`, `/inspect`, `/contract-pack`, `/free-kit`, `/blog`, `/contact`, `/privacy`, `/terms`.
- Stripe Checkout creation exists for PPSR and Deal Pack.
- Stripe webhook now fails closed in production if `STRIPE_WEBHOOK_SECRET` is missing.
- PPSR admin webhook now rejects before bearer comparison if its secret is missing.
- Supabase-backed DB module exists for orders, captures, deals, and known issues.
- Admin area exists and is gated by `ADMIN_PASSWORD` in production.
- Manual PPSR processing route exists: paste raw PPSR text, generate branded PDF, email customer, update order, Telegram notify.
- Deal Room has a real buyer/seller form, status logic, PDF generation, and email finalisation path.
- Contract pack generates four PDFs and returns a ZIP.
- Free Check has both URL and manual vehicle-entry flows.
- Command-center docs and runbooks exist.

---

## What Is Broken, Unfinished, Fake, Or Risky

### Production is stale

The live site is not the local branch. Live production still shows old buyer-agent, Pullenvale, `$997`, and `$9.95` drift.

### Launch env is incomplete

Vercel Production is missing `STRIPE_WEBHOOK_SECRET` and `ADMIN_PASSWORD`. Without these:

- Stripe paid orders will not be processed by the webhook in production.
- Admin cannot be used in production.

### Supabase schema is not in the repo

No SQL migrations or schema files were found. Code expects:

- `orders`
- `email_captures`
- `deals`
- `known_issues_cache`

Do not assume those tables exist or match `src/lib/types.ts`. Verify in Supabase before launch.

### `.env.example` is stale

It misses required envs and includes unused/old vars. Update it after the real env surface is final.

### Public/off-scope routes and APIs remain

Pages `/buddy`, `/ppi`, and `/car-buyers-agent-pullenvale` redirect locally, but their API/components still exist:

- `src/app/api/buddy/route.ts`
- `src/app/api/ppi/route.ts`
- `src/components/ppi-form.tsx`

Also experimental/public:

- `src/app/deal/demo/page.tsx`
- `src/app/api/shared/create/route.ts`
- `src/app/shared/[id]/page.tsx`
- `src/app/api/pdf-report/route.ts`

### Blog has an unused stale component

`src/components/blog/editorial-blog-post-page.tsx` is not imported, but it still promotes PPI booking. It is dead code but still a drift risk.

### Deal Room security is weak for real users

Deal Rooms are editable by anyone with the URL. There is no buyer token, seller token, email magic link, role lock, upload auth, or audit-grade consent. This may be acceptable for a low-risk MVP only if Jordan explicitly accepts it.

### Deal Room uploads can store base64 in DB

`src/lib/upload.ts` falls back to returning the base64 data URL if Vercel Blob fails. That can bloat Supabase rows and store sensitive licence images in the wrong place.

### Hidden/legacy Stripe products are still callable

`src/lib/stripe.ts` defines `dealer_review` and `full_pack`. `src/app/api/stripe/checkout/route.ts` accepts any product passing `is_paid_product()`. A user cannot click those from current public UI, but a direct POST can create hidden/legacy checkout sessions.

### Stripe checkout base URL trusts request origin

`src/app/api/stripe/checkout/route.ts` uses the request `Origin` header for success/cancel URLs. In production, prefer configured `SITE_URL`/`NEXT_PUBLIC_SITE_URL` to avoid spoofed origins.

### Stripe refund handling does not update order status

`src/lib/engine.ts` has `handle_refund()`, but `src/app/api/stripe/webhook/route.ts` only logs `charge.refunded`.

### Cron route is unsafe if enabled publicly

`src/app/api/cron/email-nurture/route.ts` only checks auth if `CRON_SECRET` exists. Vercel env currently does not include `CRON_SECRET`. If the route is deployed, anyone can trigger it.

### Inspection app has coming-soon actions

`src/components/inspection-app.tsx` has buttons for Save Inspection, Download PDF, and Attach to Deal Room, but they only show "coming soon" toasts. The localStorage autosave works, but server save/PDF/Deal Room attachment do not.

### Shared result links are not production-safe

`src/app/api/shared/create/route.ts` encodes the entire result into a base64url path and says production should use DB. It also contains stale "Get Contract Pack - $9.95" copy.

### Tests are not enough

Only webhook-secret safety is tested by `npm test`. No route smoke tests, checkout tests, Supabase tests, admin tests, PDF tests, or email tests are wired.

### Lint is absent

There is no `npm run lint`. Next build is configured to skip linting.

---

## Launch Blockers

P0 means do not launch until handled or explicitly accepted by Jordan.

### P0 - Stripe webhook

Set and verify `STRIPE_WEBHOOK_SECRET` in Vercel Production. Confirm the Stripe Dashboard endpoint points to:

```text
https://buyingbuddy.com.au/api/stripe/webhook
```

Then run a Stripe test checkout and confirm:

- webhook receives `checkout.session.completed`
- Supabase `orders` row is created for PPSR
- PPSR confirmation email sends
- Telegram notification sends or intentionally skips

### P0 - Admin access

Set `ADMIN_PASSWORD` in Vercel Production and verify `/admin/login` works after deploy. Without admin, PPSR fulfilment is blocked.

### P0 - Supabase schema verification

Verify or create the production schema for `orders`, `email_captures`, `deals`, and `known_issues_cache`. There are no migrations in the repo. Build one before relying on prod data.

### P0 - Production drift

The live site is stale. Do not send traffic until PR/local cleanup is merged/deployed and live drift is rechecked.

### P0 - Off-scope public surfaces

Either remove, hard-disable, or noindex these before serious launch:

- `src/app/api/buddy/route.ts`
- `src/app/api/ppi/route.ts`
- `src/components/ppi-form.tsx`
- `src/components/blog/editorial-blog-post-page.tsx`
- `src/app/deal/demo/page.tsx`
- `src/app/api/shared/create/route.ts` and `/shared/[id]`, unless fixed
- `src/app/api/pdf-report/route.ts`, unless explicitly retained as internal

### P0 - Public checkout product whitelist

Restrict public checkout to `ppsr` and `deal_room` unless Jordan explicitly wants hidden products callable.

### P1 - Deal Room upload/security

Before sharing Deal Rooms with real sellers, add at least one of:

- signed role tokens
- separate buyer/seller links
- email verification/magic links
- explicit warning that anyone with the link can edit

Also disable base64 fallback for uploaded identity documents.

### P1 - Cron protection

Add `CRON_SECRET`, configure Vercel cron only if wanted, and make the route reject if the secret is missing in production.

### P1 - `.env.example` and docs

Update `.env.example`, `README.md`, and command-center platform docs after the final env and product state are confirmed.

---

## Page-By-Page Handover

### `/`

Files:

- `src/app/page.tsx`
- `src/components/structured-data.tsx`
- `src/app/layout.tsx`

Current local status: mostly aligned with centre truth. Public products are Free Check, `$4.95` PPSR, `$9.99` Deal Pack. Generic buyer-agent-alternative language remains, which centre truth allows if it does not imply concierge/done-for-you.

Works:

- Primary CTAs point to `/check`, `/ppsr`, `/deal`, `/contract-pack`.
- Metadata and JSON-LD are locally aligned to Free/PPSR/Deal Pack.

Risks:

- Live production is stale and still shows old structured data.
- Homepage is card-heavy, but not a launch blocker.

Hermes next:

1. After deploy, run live drift scan against homepage structured data.
2. Keep product truth: no `$997`, no concierge, no "we find/negotiate/handle it".

### `/check`

Files:

- `src/app/check/page.tsx`
- `src/components/free-check-form.tsx`
- `src/app/api/check/route.ts`
- `src/app/api/check/issues/route.ts`
- `src/lib/free-check-report.ts`
- `src/lib/engine.ts`
- `src/lib/scraper.ts`
- `src/lib/analysis.ts`

Current local status: functional MVP.

Works:

- Manual vehicle snapshot path works from code.
- Listing URL path validates URL and email.
- Free-check result UI links to PPSR, inspection, and Deal Pack with current prices.
- Known-issues API uses OpenRouter/OpenAI if available and otherwise returns empty issues.

Risks:

- Listing scraper is fragile and not proven against Facebook Marketplace live pages.
- `run_free_listing_check()` returns `capture: capture!` even if Supabase capture failed. The current API does not use `capture`, but this is a latent bug.
- Email capture and free-check email depend on Supabase and Resend.

Hermes next:

1. Add a Node route test for manual check validation and demo-value rejection.
2. Add a smoke test for `/api/check` using manual input.
3. If URL scraping is launch-critical, test against real accessible listing pages and document limitations.

### `/ppsr`

Files:

- `src/app/ppsr/page.tsx`
- `src/app/api/stripe/checkout/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/api/ppsr/process/route.ts`
- `src/lib/ppsr-report-generator.ts`
- `src/lib/ppsr-pdf.ts`

Current local status: key paid route exists, but production payment fulfilment is blocked by env.

Works:

- Client collects VIN/rego and email.
- Calls Stripe checkout with product `ppsr`.
- Copy says same business day, usually within 2 hours, which matches centre truth.
- Admin PPSR process can generate and email a branded report.

Broken/blockers:

- Vercel is missing `STRIPE_WEBHOOK_SECRET`.
- Vercel is missing `ADMIN_PASSWORD`.
- Stripe Dashboard webhook endpoint/secret was not verified.
- The test-mode banner checks `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, but Vercel only shows `STRIPE_PUBLISHABLE_KEY`.

Hermes next:

1. Fix/verify env and Stripe webhook.
2. Run a Stripe test checkout.
3. Confirm Supabase order insert.
4. Confirm `/admin/orders/[id]` can process and email PPSR.
5. Decide whether to add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` or remove the test-mode banner logic.

### `/pricing`

Files:

- `src/app/pricing/page.tsx`

Current local status: aligned.

Works:

- Shows Free Tools, `$4.95` PPSR, `$9.99` Deal Pack.
- No old `$997`, `$39`, or `$9.95` public pricing in this page locally.

Risks:

- Live production is stale.
- Hidden server-side products remain callable by direct API POST.

Hermes next:

1. Keep this page as the public pricing source.
2. After deployment, verify live pricing and JSON-LD pricing.

### `/deal`

Files:

- `src/app/deal/page.tsx`
- `src/app/api/stripe/checkout/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/lib/deals.ts`

Current local status: checkout entry exists.

Works:

- Buyer enters email and rego.
- Calls Stripe checkout with product `deal_room`.
- Existing deals are loaded from cookie email through `/api/deal/list`.

Blockers:

- Deal creation depends on successful Stripe webhook and Supabase `deals` table.
- Vercel is missing `STRIPE_WEBHOOK_SECRET`.

Hermes next:

1. Verify Stripe checkout and webhook create a `deals` row.
2. Verify buyer receives Deal Room email.
3. Add a checkout test or route-level test.

### `/deal/[id]`

Files:

- `src/app/deal/[id]/page.tsx`
- `src/app/api/deal/[id]/route.ts`
- `src/app/api/deal/[id]/buyer/route.ts`
- `src/app/api/deal/[id]/seller/route.ts`
- `src/app/api/deal/[id]/pdf/route.ts`
- `src/app/api/deal/[id]/finalise/route.ts`
- `src/lib/deals.ts`
- `src/lib/deal-pdf.ts`
- `src/lib/upload.ts`

Current local status: substantial MVP, not launch-hardened.

Works:

- Public deal load by ID.
- Buyer autosave.
- Seller manual save.
- Status updates based on completion.
- PDF download.
- Finalise sends PDF to buyer/seller.

Risks:

- Anyone with the link can read/edit both buyer and seller sections.
- Seller bank account is stored in DB; public response only returns last4, but backend still stores full value.
- Licence uploads are public Blob URLs if Blob succeeds.
- Blob failure stores base64 in Supabase.
- SMS updates button is a coming-soon toast.
- No audit trail beyond current fields.

Hermes next:

1. Decide with Jordan whether link-only access is acceptable for MVP.
2. If not acceptable, add buyer/seller role tokens before launch.
3. Disable base64 fallback for identity documents.
4. Add file-size/type validation before upload.
5. Add tests for status transitions and finalise errors.

### `/deal/demo`

Files:

- `src/app/deal/demo/page.tsx`

Current local status: public test/demo page.

Works:

- No Stripe or email.
- Useful for UX testing.

Launch risk:

- Public test page should not be indexable or linked for real launch.

Hermes next:

1. Remove this route, gate it by `NODE_ENV !== "production"`, or add `noindex` and hide from public.

### `/inspect`

Files:

- `src/app/inspect/page.tsx`

Current local status: working landing page for inspection modes.

Works:

- Links to full interactive and print checklist.
- Copy aligns with free inspection-tool positioning.

Hermes next:

1. Keep.
2. Verify mobile layout after deploy.

### `/inspect/full`

Files:

- `src/app/inspect/full/page.tsx`
- `src/components/inspection-app.tsx`
- `src/lib/inspection-data.ts`

Current local status: useful localStorage inspection app with unfinished actions.

Works:

- 14 guided checkpoints.
- Notes/status/risk score.
- Debounced localStorage save.

Unfinished:

- Save Inspection button shows "Save & PDF coming soon".
- Download PDF shows "PDF download coming soon".
- Attach to Deal Room shows "Deal Room attachment coming soon".

Hermes next:

1. Either remove unfinished buttons for launch or implement them.
2. If implementing PDF, use existing PDFKit patterns and add tests.
3. If attaching to Deal Room, define auth/linking before building.

### `/inspect/print`

Files:

- `src/app/inspect/print/page.tsx`

Current local status: working checklist.

Works:

- Tap-to-rate checklist.
- Print button.
- Share/copy summary.
- Links to PPSR and Deal Room.

Risks:

- Uses browser print/share only; acceptable for MVP.

Hermes next:

1. Keep.
2. Verify mobile and print styles in browser after deploy.

### `/contract-pack`

Files:

- `src/app/contract-pack/page.tsx`
- `src/components/handover-pack-button.tsx`
- `src/app/api/docs/download/route.ts`
- `src/lib/handover-pdfs.ts`

Current local status: functional free ZIP generator.

Works:

- Generates four PDFs.
- Returns ZIP download.
- Captures email to Supabase if possible.
- Sends non-fatal Resend admin notification if configured.

Risks:

- Modal has inline styles and mojibake in terminal display, but source encoding may be fine.
- Legal wording should be reviewed before serious traffic.
- Supabase capture failure is swallowed.

Hermes next:

1. Test download locally and live after deploy.
2. Verify generated PDFs content.
3. Confirm legal disclaimer language.

### `/free-kit`

Files:

- `src/app/free-kit/page.tsx`
- `src/components/free-kit-form.tsx`
- `src/app/api/free-kit/route.ts`

Current local status: email lead magnet, not instant file download.

Works:

- Form sends to `/api/free-kit`.
- Route sends kit email and admin notification via Resend.

Risks:

- Page says "Download instantly" but the component says "Kit on its way" and route emails a link back to `/free-kit`, not an actual attached kit.
- Depends on Resend.

Hermes next:

1. Decide whether this is an email link, immediate download, or contract-pack ZIP.
2. Make copy and behavior match.
3. Add a no-send local test with mocked Resend or route validation test.

### `/blog`

Files:

- `src/app/blog/page.tsx`
- `src/app/blog/[slug]/page.tsx`
- `src/lib/blog.ts`
- `content/posts/**`

Current local status: working static blog.

Works:

- Generates static params for posts.
- Current live route list includes 24+ blog paths.
- Current blog page chrome sends users to `/check`, not `/ppi`.

Risks:

- `content/posts/blog/how-to-buy-a-car-privately-in-qld.html` mentions PPI generically. That can be legitimate buyer advice, but do not turn it into a Buying Buddy PPI service line.
- Unused `src/components/blog/editorial-blog-post-page.tsx` still promotes booking PPI through Buying Buddy.

Hermes next:

1. Delete or rewrite unused editorial component.
2. Scan rendered blog posts for service-line drift after deploy.

### `/contact`

Files:

- `src/app/contact/page.tsx`

Current local status: mailto form only.

Works:

- Opens user's email client with subject/body.

Risks:

- No server-side lead capture.
- Copy says "I'll get back to you"; this is a human promise, not a blocker but be consistent.

Hermes next:

1. Decide whether mailto is acceptable for launch.
2. If replacing, use Resend/contact route and spam protection.

### `/privacy` and `/terms`

Files:

- `src/app/privacy/page.tsx`
- `src/app/terms/page.tsx`

Current local status: basic plain-English pages.

Works:

- Present and aligned with self-serve tools.

Risks:

- Not legal-reviewed.
- Deal Room collects sensitive identity/payment details; current privacy wording may be too light.

Hermes next:

1. Update privacy/terms if Deal Room handles real licence images, seller bank details, or paid reports at launch.

### `/order/success`

Files:

- `src/app/order/success/page.tsx`

Current local status: post-checkout display.

Works:

- Looks up order by Stripe session ID.
- Shows PPSR and Deal Pack specific copy.

Risks:

- If webhook is delayed/missing, session ID is shown and no order details appear.
- Deal Pack success usually redirects directly to `/deal/[id]`, so this branch is less used.

Hermes next:

1. Verify after real test checkout.
2. Add fallback copy for delayed webhook.

### `/shared/[id]`

Files:

- `src/app/shared/[id]/page.tsx`
- `src/app/api/shared/create/route.ts`

Current local status: experimental.

Works:

- Decodes base64url payload from URL and renders summary.

Launch risks:

- Not DB-backed.
- Stale `$9.95` copy in API.
- Full result payload is exposed in URL.
- Not linked by current main UI from inspection.

Hermes next:

1. Remove/disable for launch, or rebuild with DB-backed share IDs and current pricing.

### `/buddy`

Files:

- `src/app/buddy/page.tsx`
- `src/app/api/buddy/route.ts`
- `src/components/buddy-chat.tsx`

Current local status: page redirects to `/check`; API still exists.

Works:

- Local page redirect intent is correct.

Risks:

- API is still callable.
- Standalone AI Buddy is not launch scope.
- Live production still serves `/buddy` as 200.

Hermes next:

1. Delete or hard-disable `/api/buddy` unless Jordan re-approves public AI Buddy.
2. After deploy, verify `/buddy` redirect status and sitemap.

### `/ppi`

Files:

- `src/app/ppi/page.tsx`
- `src/app/api/ppi/route.ts`
- `src/components/ppi-form.tsx`
- `src/lib/forms-email.ts`

Current local status: page redirects to `/inspect`; API/component remain.

Works:

- Local page redirect intent is correct.

Risks:

- PPI booking as a Buying Buddy service is off-scope for launch.
- API still emails PPI enquiry confirmations.
- Unused component still posts to API.
- Live production still serves `/ppi` as 200.

Hermes next:

1. Delete or hard-disable PPI API/component for launch.
2. Keep generic blog advice about getting a PPI only if it does not present Buying Buddy as the booking provider.
3. After deploy, verify `/ppi` redirects and is absent from sitemap.

### `/car-buyers-agent-pullenvale`

Files:

- `src/app/car-buyers-agent-pullenvale/page.tsx`

Current local status: page redirects to `/`.

Works:

- Local page redirect intent is correct.

Risks:

- Live production still serves Pullenvale buyer-agent page as 200.
- Buyer-agent suburb SEO is off-scope.

Hermes next:

1. Prefer a `next.config.ts` redirect for this route instead of page-level redirect only.
2. After deploy, verify status and absence from sitemap.

### `/admin`

Files:

- `src/app/admin/login/page.tsx`
- `src/app/admin/(protected)/layout.tsx`
- `src/app/admin/(protected)/page.tsx`
- `src/app/admin/(protected)/orders/page.tsx`
- `src/app/admin/(protected)/orders/[id]/page.tsx`
- `src/app/admin/actions.ts`
- `src/lib/admin-auth.ts`

Current local status: functional admin scaffold, blocked in production by missing env.

Works:

- Password cookie auth.
- Dashboard and orders list use Supabase.
- Order detail has review form, send report form, and PPSR process form.

Blockers:

- Vercel missing `ADMIN_PASSWORD`.
- Supabase schema unknown.
- Some admin text still says "email stub triggered" even though email sending exists.

Hermes next:

1. Add/verify `ADMIN_PASSWORD`.
2. Verify `/admin/login` after deploy.
3. Verify order list loads.
4. Process a test PPSR order end-to-end.
5. Update stale admin copy.

---

## API And Integration Handover

### Stripe

Files:

- `src/lib/stripe.ts`
- `src/app/api/stripe/checkout/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `tests/stripe-webhook-safety.test.mjs`

Current:

- Checkout supports all `PaidProductType` values.
- Public intended products are `ppsr` and `deal_room`.
- Webhook handles `checkout.session.completed`.
- Webhook fails closed in production if signing secret missing.
- Refunds are logged, not applied to DB.

Hermes tasks:

1. Add public checkout whitelist.
2. Use configured site URL in production checkout redirects.
3. Add refund status update.
4. Verify Stripe webhook secret and endpoint in dashboard.
5. Add test coverage for product whitelist and refund handling.

### Supabase

Files:

- `src/lib/supabase.ts`
- `src/lib/db.ts`
- `src/lib/types.ts`
- `docs/command-center/runbooks/supabase-health.md`

Current:

- Code expects Supabase but no migrations exist.
- `src/lib/supabase.ts` falls back to placeholder URL/key instead of failing.

Hermes tasks:

1. Verify production tables.
2. Create migrations/schema docs in repo.
3. Make production fail loudly if Supabase env is missing.
4. Confirm RLS posture. Current app uses anon key server-side; understand policy implications before exposing writes.

### Resend

Files:

- `src/lib/email.ts`
- `src/app/api/free-kit/route.ts`
- `src/app/api/docs/download/route.ts`
- `src/app/api/ppi/route.ts`
- `src/app/api/ppsr/process/route.ts`

Current:

- Vercel has `RESEND_API_KEY`.
- Domain/DNS/from-address deliverability was not verified.
- Some routes throw on missing Resend, others treat notification as non-fatal.

Hermes tasks:

1. Verify Resend domain and sender.
2. Test to a controlled email address.
3. Remove or disable off-scope PPI emails.
4. Standardize missing-Resend behavior.

### Telegram

Files:

- `src/app/api/stripe/webhook/route.ts`
- `src/app/api/ppsr/process/route.ts`
- `src/app/api/admin/ppsr/webhook/route.ts`

Current:

- Vercel has `TELEGRAM_BOT_TOKEN`.
- Chat ID is hardcoded as `1296786949` in multiple places or fallback.

Hermes tasks:

1. Move chat ID to `TELEGRAM_CHAT_ID`.
2. Verify notifications on test checkout/PPSR process.
3. Ensure Telegram failure does not repeatedly break idempotent webhooks if email/order already succeeded.

### PPSR automation script

Files:

- `scripts/ppsr-automation/runner.ts`
- `scripts/ppsr-automation/package.json`

Current:

- Separate Playwright worker intended for Jordan's Surface laptop.
- Uses `WEBHOOK_SECRET` when posting to `/api/admin/ppsr/webhook`.
- Server expects `STRIPE_WEBHOOK_SECRET` as bearer secret.
- Selectors are generic approximations for PPSR site.

Hermes tasks:

1. Decide whether this automation is still part of launch.
2. Align env names if retained.
3. Test in a separate safe environment.
4. Do not run real PPSR purchases without Jordan approval.

### AI

Files:

- `src/app/api/check/issues/route.ts`
- `src/app/api/buddy/route.ts`
- `src/lib/free-check-report.ts`
- `src/lib/ppsr-report-generator.ts`

Current:

- OpenRouter is present in Vercel env.
- Other AI keys are optional/missing.
- PPSR extraction has fallback.
- Buddy API is off-scope but callable.

Hermes tasks:

1. Keep AI optional for launch-critical flows.
2. Disable off-scope Buddy API.
3. Test PPSR extraction fallback with sample raw text.

### Cron

Files:

- `src/app/api/cron/email-nurture/route.ts`
- `content/email-nurture-sequence.md`

Current:

- No `vercel.json` cron config found.
- `CRON_SECRET` missing in Vercel env.
- Route is public if `CRON_SECRET` is absent.
- Email copy uses personal Jordan-style nurture.

Hermes tasks:

1. Disable route or require secret in production.
2. Only configure Vercel Cron after Jordan approves nurture emails.
3. Rewrite nurture copy to current product truth before use.

---

## Environment Variable Matrix

```text
NEXT_PUBLIC_SUPABASE_URL
Needed by: src/lib/supabase.ts
Vercel: present
Launch: verify value/project and schema

NEXT_PUBLIC_SUPABASE_ANON_KEY
Needed by: src/lib/supabase.ts
Vercel: present
Launch: verify policies and table writes

STRIPE_SECRET_KEY
Needed by: src/lib/stripe.ts
Vercel: present
Launch: verify live/test mode intentionally

STRIPE_PUBLISHABLE_KEY
Needed by: not used by checkout UI except not under NEXT_PUBLIC name
Vercel: present
Launch: either add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY or remove client test-mode dependency

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Needed by: src/app/ppsr/page.tsx test-mode banner
Vercel: missing
Launch: non-blocking but misleading banner risk

STRIPE_WEBHOOK_SECRET
Needed by: src/app/api/stripe/webhook/route.ts and admin PPSR webhook
Vercel: missing
Launch: P0 blocker

RESEND_API_KEY
Needed by: email routes
Vercel: present
Launch: verify sender/domain

ADMIN_PASSWORD
Needed by: src/lib/admin-auth.ts
Vercel: missing
Launch: P0 blocker

NEXT_PUBLIC_SITE_URL / SITE_URL
Needed by: webhook deal URLs and stable site URL
Vercel: present production
Launch: verify no whitespace/newline issue; code trims values

TELEGRAM_BOT_TOKEN
Needed by: notifications
Vercel: present
Launch: test notification

TELEGRAM_CHAT_ID
Needed by: better config hygiene
Vercel: missing
Launch: not blocker due hardcoded fallback, but fix

CRON_SECRET
Needed by: src/app/api/cron/email-nurture/route.ts
Vercel: missing
Launch: fix before enabling route

BLOB_READ_WRITE_TOKEN
Needed by: Vercel Blob uploads
Vercel: not listed
Launch: required before real Deal Room uploads

OPENROUTER_API_KEY
Needed by: AI known issues/Buddy/PPSR extraction fallback chain
Vercel: present
Launch: optional but useful

OPENAI_API_KEY / GOOGLE_AI_API_KEY / ANTHROPIC_API_KEY
Needed by: optional fallback AI providers
Vercel: not listed
Launch: optional
```

---

## What Hermes Should Do Next

### Phase 0 - Do not lose current truth

- [ ] Read `docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md`.
- [ ] Read `docs/command-center/README.md`.
- [ ] Read this handover.
- [ ] Run `git status --short --branch`.
- [ ] Confirm whether you are working on local `main`, PR #1 branch, or a new branch.
- [ ] Do not push `main` or deploy without explicit Jordan approval.

### Phase 1 - Make launch dependencies real

- [ ] Set/verify `STRIPE_WEBHOOK_SECRET` in Vercel Production after checking Stripe Dashboard.
- [ ] Set/verify `ADMIN_PASSWORD` in Vercel Production.
- [ ] Verify Supabase production project and required tables.
- [ ] Add Supabase schema/migrations to the repo.
- [ ] Verify Resend sender/domain.
- [ ] Decide whether `BLOB_READ_WRITE_TOKEN` is needed for Deal Room launch.

### Phase 2 - Remove or lock off-scope surfaces

- [ ] Disable or delete `/api/buddy`.
- [ ] Disable or delete `/api/ppi`.
- [ ] Delete unused `src/components/ppi-form.tsx` unless retained behind an approved experiment.
- [ ] Delete or rewrite `src/components/blog/editorial-blog-post-page.tsx`.
- [ ] Remove/gate `/deal/demo`.
- [ ] Remove/gate `/api/pdf-report`.
- [ ] Remove/gate `/shared/[id]` and `/api/shared/create`, or rebuild DB-backed with current copy.
- [ ] Add `next.config.ts` redirects for `/buddy`, `/ppi`, and `/car-buyers-agent-pullenvale` for clear HTTP-level behavior.

### Phase 3 - Harden paid flows

- [ ] Restrict public checkout to `ppsr` and `deal_room`.
- [ ] Use configured production site URL for checkout redirects.
- [ ] Update webhook refund handling to call `handle_refund`.
- [ ] Add route tests for checkout validation and webhook refund behavior.
- [ ] Test PPSR checkout with Stripe test mode.
- [ ] Test Deal Pack checkout with Stripe test mode.

### Phase 4 - Deal Room decision

- [ ] Get Jordan decision: link-only Deal Room is acceptable for MVP, or role-token auth is required.
- [ ] If role-token auth is required, implement separate buyer/seller links before launch.
- [ ] Disable base64 upload fallback for identity docs.
- [ ] Add file-size and file-type limits.
- [ ] Verify PDF finalise email to buyer and seller.

### Phase 5 - Page-level polish with proof

- [ ] `/free-kit`: make copy match behavior.
- [ ] `/inspect/full`: remove coming-soon buttons or implement them.
- [ ] `/privacy` and `/terms`: update for Deal Room identity/bank data if launching it.
- [ ] `/contact`: decide mailto vs server form.
- [ ] Blog: scan for service-line drift.
- [ ] Add or remove dead Playwright checkout spec.
- [ ] Add a `lint` script or remove expectation of lint from docs.

### Phase 6 - Deploy only after approval

- [ ] Run `npm test`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Run `vercel env ls`.
- [ ] Confirm worktree state.
- [ ] Ask Jordan for explicit production deploy approval.
- [ ] Prefer `git push origin main` only if PR/main status is intentionally resolved.
- [ ] After deploy, run live drift check.

---

## What Hermes Should Avoid Breaking

- Do not reintroduce `$997`, Pullenvale buyer-agent SEO, concierge, car sourcing, negotiation-for-you, or "we handle the whole buy" copy.
- Do not change public product prices without Jordan approval: Free, `$4.95` PPSR, `$9.99` Deal Pack.
- Do not remove webhook fail-closed safety.
- Do not expose admin APIs without `ADMIN_PASSWORD`.
- Do not assume Supabase schema exists just because code compiles.
- Do not store secrets in docs, commits, screenshots, or handover notes.
- Do not run real PPSR purchases or Stripe live payments without approval.
- Do not send nurture/customer emails without approval.
- Do not deploy from local `main` accidentally. It is ahead of `origin/main`.
- Do not treat archived docs under `docs/archive/2026-04-pre-lock/` as current product truth.

---

## Biggest Opportunities

1. The `$4.95` PPSR is the fastest credible revenue path. The manual fulfilment story is believable if admin and Stripe webhook are fixed.
2. The Deal Room is the most differentiated product, but it needs access/upload hardening before it handles real sellers.
3. Free Check plus Free Contract Pack can become the acquisition engine if Resend/Supabase capture is verified.
4. The command-center docs now give agents a shared operating base. Keep them current after each deployment or major decision.
5. There is enough code here to launch an MVP; this is not a rebuild-from-scratch situation.

---

## Biggest Weaknesses And Risks

1. Production drift is severe and current.
2. Launch depends on external systems that are not fully verified: Stripe webhook, Supabase schema, admin password, Resend deliverability.
3. No migrations means future agents can accidentally mismatch code and database.
4. Tests are too thin for paid flows.
5. Deal Room handles sensitive data with weak access controls.
6. Off-scope APIs still exist and can be called directly.
7. Cron route is public if `CRON_SECRET` is not set.
8. Root README and old docs still contain stale claims.
9. Build skips type/lint validation by config, so separate `typecheck` is mandatory.
10. Live deployment age means local confidence does not equal production confidence.

---

## Command Cheat Sheet For Hermes

Run these at the start:

```powershell
cd C:\Users\jrl-j\Projects\Active\buyingbuddy-web
git status --short --branch
git log --oneline --decorate -12
npm test
npm run typecheck
npm run build
vercel env ls
vercel ls buyingbuddy-web
```

Route/drift check after deploy:

```powershell
$routes = @('/','/check','/ppsr','/pricing','/deal','/inspect','/contract-pack','/free-kit','/blog','/buddy','/ppi','/car-buyers-agent-pullenvale','/sitemap.xml','/robots.txt')
foreach ($route in $routes) {
  $url = "https://buyingbuddy.com.au$route"
  $line = curl.exe -L -s -o NUL -w "%{http_code} %{url_effective}" $url
  "${route} ${line}"
}
```

Live copy drift scan:

```powershell
$terms = @('997','Pullenvale','concierge','we find','we negotiate','full-service buyer','/buddy','/ppi','car-buyers-agent-pullenvale','39.95','9.95')
$routes = @('/','/check','/ppsr','/pricing','/deal','/blog','/sitemap.xml')
foreach ($route in $routes) {
  $url = "https://buyingbuddy.com.au$route"
  $body = (Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 30).Content
  foreach ($term in $terms) {
    if ($body -match [regex]::Escape($term)) {
      "${route} contains ${term}"
    }
  }
}
```

Search repo for off-scope drift, excluding archives and build artifacts:

```powershell
rg -n "997|Pullenvale|concierge|we find|we negotiate|full-service buyer|/ppi|PPI|39\.95|9\.95|buyer.s agent" content src docs -g "!docs/archive/**" -g "!tsconfig.tsbuildinfo"
```

Check Supabase table usage:

```powershell
rg -n "\.from\(" src\lib src\app
```

Check env usage:

```powershell
rg -n "process\.env" src scripts tests .github
```

---

## Final State At Handover Creation

Verified:

- `npm test` passed.
- `npm run build` passed.
- `npm run typecheck` passed.
- `npm run lint` is missing.
- `@playwright/test` is not installed in root.
- Vercel env names were listed without exposing values.
- Latest production deployment is 14 days old.
- Live production still has old drift.

Not verified:

- Supabase table existence/schema.
- Stripe Dashboard webhook endpoint and actual secret.
- Stripe live/test mode intent.
- Resend domain deliverability.
- SiteGround/DNS settings.
- Vercel Blob availability.
- Real customer email delivery.
- In-app browser visual rendering.

Practical conclusion: continue from this repo, but do not launch until the P0 blockers are closed and live drift is rechecked after deployment.
