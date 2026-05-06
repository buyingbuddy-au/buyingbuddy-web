# Claude Architect Plan - Buying Buddy Web - 2026-05-06

Status: DRAFT / Level 1 planning artifact.
Owner: Jordan Lansbury.
Prepared by: Claude Code via Hermes orchestration.
Claude session: 9b131160-a25a-4d8e-9fc2-460c86dc55d7.
Mode: read-only architecture/planning pass. No repo code edits, deploys, env changes, Stripe/Supabase/DNS changes, pushes, or customer emails were performed.

Primary inputs read by Claude:

- AGENTS.md
- docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md
- docs/command-center/README.md
- docs/buyingbuddy-product-plan.md
- docs/audits/2026-04-phase-1/drift-register.md
- docs/command-center/hermes-handover-2026-05-06.md

---

## 1. Executive architecture judgement

Continue from this repo. Do not rebuild.

Claude's judgement: the repo is a working MVP/beta, and the remaining work is mostly hardening, gating, schema/env verification, and production drift cleanup. Rebuilding would throw away working PPSR fulfilment, Deal Room PDF generation, contract-pack ZIP generation, Stripe checkout scaffolding, and useful content.

Current blockers are operational and launch-safety related:

- Production is stale and still shows old $997 / Pullenvale / concierge drift.
- Vercel Production is missing launch-critical env vars including STRIPE_WEBHOOK_SECRET and ADMIN_PASSWORD.
- Supabase schema is not represented in repo migrations.
- Off-scope APIs remain callable even where pages redirect.
- Stripe checkout accepts hidden/legacy product types by direct POST.
- Deal Room is weakly protected by unguessable link only.
- Upload fallback can store base64 identity data in Supabase.

Recommended strategy: harden, gate, verify, then deploy only after Jordan approves.

---

## 2. Launch architecture principles

1. Roll back copy, not product. Do not redesign the business or rebuild working flows.
2. Delete or hard-gate off-scope surfaces rather than rewriting them into half-products.
3. Treat public launch surface as a whitelist: PPSR and Deal Pack only for paid checkout.
4. Keep the paid product stack to exactly $4.95 PPSR and $9.99 Deal Pack unless Jordan approves otherwise.
5. Fail closed on missing secrets in production.
6. Avoid personal-time promises in customer-facing copy.
7. Put Supabase schema/migrations in the repo before relying on production data.
8. Production proof beats local confidence: live drift scans must pass after deploy.

---

## 3. Risk-reducing sequence

### Phase A - Resolve repo base and launch dependencies

1. Audit local main vs origin/main. Local main is ahead by 15 commits.
2. Get Jordan's explicit decision: push, branch, or hold those commits.
3. Verify Supabase production schema for orders, email_captures, deals, and known_issues_cache.
4. Add a checked-in Supabase migration/schema file.
5. Verify/set Vercel Production envs: STRIPE_WEBHOOK_SECRET, ADMIN_PASSWORD, CRON_SECRET, and BLOB_READ_WRITE_TOKEN if Deal Room uploads launch.
6. Verify Stripe Dashboard webhook endpoint and signing secret.
7. Remove placeholder Supabase fallback in production.

### Phase B - Remove or lock off-scope surfaces

1. Disable/delete direct APIs for Buddy, PPI, shared result links, and pdf-report unless explicitly retained.
2. Delete unused PPI/Buddy/editorial components where they are not part of launch.
3. Move /buddy, /ppi, and /car-buyers-agent-pullenvale behavior to explicit next.config.ts redirects.
4. Remove or production-gate /deal/demo.
5. Strip dealer_review and full_pack from product types, email labels, display maps, PDFs, and admin filters.

### Phase C - Harden paid flows

1. Restrict public checkout to ppsr and deal_room.
2. Use configured SITE_URL/NEXT_PUBLIC_SITE_URL for checkout success/cancel URLs in production, not request Origin.
3. Wire Stripe refund events to DB status updates.
4. Add tests for checkout whitelist and refund behavior.

### Phase D - Deal Room MVP decision

Jordan needs to decide whether link-only Deal Room access is acceptable for MVP.

Option 1: keep link-only for friends-and-family beta with explicit warning that anyone with the link can edit.
Option 2: implement separate buyer/seller magic/token links before public launch.

Claude recommends Option 1 for a very small MVP/beta only, and Option 2 before paid acquisition.

Also in this phase:

- Disable base64 upload fallback for identity documents.
- Add file size and MIME type validation.
- Fail loudly if Blob storage is unavailable.

### Phase E - Verification and deploy gate

Before deploy:

- npm test
- npm run typecheck
- npm run build
- Supabase schema drift check
- Stripe test checkout for PPSR
- Stripe test checkout for Deal Pack
- Admin PPSR processing smoke test
- Email/Telegram notification verification if approved

Deploy only after explicit Jordan approval.

After deploy:

- Run live route status check.
- Run live drift scan for old copy/prices/routes.
- Confirm buyingbuddy.com.au no longer exposes stale buyer-agent/Pullenvale/$997 surfaces.

---

## 4. Agent/workstream topology

Claude as head planner/architect:

- Read-only architecture, planning, review, acceptance criteria.
- Reviews implementation plans and PR summaries.
- Does not mutate production systems.

Hermes:

- Operations controller and evidence collector.
- Verifies Vercel, Supabase, Stripe, Resend, live route/drift state.
- Maintains command-center docs and runbooks.
- Must ask Jordan before any Level 3 external action.

Implementation agent, e.g. Codex or a dedicated Claude Code session:

- Performs code/doc changes in small approved branches.
- One phase per branch where possible.
- Runs tests/typecheck/build and reports exact outcomes.

Reviewer agent:

- Read-only review of each branch against product truth, security, and launch gates.

Conflict rules:

- Do not run multiple writers over the same files.
- Do not push main or deploy without Jordan approval.
- Resolve local main +15 state before starting branches.
- Do not edit centre-of-truth/product-plan without approval.

---

## 5. Recommended first implementation sprint

### Task 1 - Resolve local main vs origin/main

Objective: understand and intentionally handle the 15 local commits ahead of origin/main.

Likely commands:

```bash
git log origin/main..main --oneline --stat
git diff --stat origin/main..main
git status --short --branch
```

Acceptance:

- Jordan chooses whether to push, branch, or hold.
- No accidental production deploy.

### Task 2 - Supabase schema verification and migration

Objective: make DB expectations real and repeatable.

Likely files:

- supabase/migrations/0001_init.sql
- docs/command-center/runbooks/supabase-health.md
- possibly src/lib/types.ts if mismatch is found and approved

Acceptance:

- Migration/schema exists in repo.
- Live schema comparison is documented.
- RLS posture is documented.

### Task 3 - Environment hardening

Objective: make production fail closed and make env surface explicit.

Likely files:

- .env.example
- src/lib/supabase.ts
- docs/command-center/platform-status.md

External action requires Jordan approval:

- Vercel env changes.

Acceptance:

- Required env names are complete in docs/example.
- Production no longer relies on placeholder Supabase values.

### Task 4 - Off-scope API/route kill switch

Objective: remove callable off-scope launch surfaces.

Likely files:

- src/app/api/buddy/route.ts
- src/app/api/ppi/route.ts
- src/app/api/shared/create/route.ts
- src/app/shared/[id]/page.tsx
- src/app/api/pdf-report/route.ts
- src/app/deal/demo/page.tsx
- src/components/buddy-chat.tsx
- src/components/ppi-form.tsx
- src/components/blog/editorial-blog-post-page.tsx
- next.config.ts
- src/app/sitemap.ts or sitemap-related code

Acceptance:

- Removed/gated surfaces are not callable in production.
- Typecheck passes.
- Sitemap does not list off-scope routes.

### Task 5 - Stripe checkout whitelist and refund handling

Objective: make public payments match launch scope.

Likely files:

- src/lib/stripe.ts
- src/app/api/stripe/checkout/route.ts
- src/app/api/stripe/webhook/route.ts
- src/lib/engine.ts
- src/lib/email.ts
- src/lib/display.ts
- src/lib/pdf.ts
- src/app/admin/(protected)/orders/page.tsx
- tests/*.test.mjs

Acceptance:

- Only ppsr and deal_room can create public checkout sessions.
- Hidden/legacy product POSTs return 400.
- Refund events update order status.
- Tests cover both.

### Task 6 - Cron route fail-closed

Objective: prevent public triggering of nurture emails.

Likely files:

- src/app/api/cron/email-nurture/route.ts
- tests/cron-secret-required.test.mjs

Acceptance:

- Production without a valid CRON_SECRET returns 401.
- No Vercel cron schedule is added unless Jordan approves nurture emails.

### Task 7 - Deal Room upload hardening

Objective: prevent sensitive base64 data from landing in Supabase rows.

Likely files:

- src/lib/upload.ts
- src/app/api/deal/[id]/buyer/route.ts
- src/app/api/deal/[id]/seller/route.ts
- tests/deal-upload-validation.test.mjs

Acceptance:

- Upload type and size limits exist.
- Blob failures return an error instead of base64 fallback.
- Tests cover oversized and unsupported files.

### Task 8 - Codify live drift scan

Objective: make drift detection repeatable after each deploy.

Likely files:

- scripts/live-drift-scan.sh
- scripts/live-drift-scan.ps1
- docs/command-center/runbooks/live-drift-check.md

Acceptance:

- Script exits non-zero if old drift terms appear.
- Terms include 997, Pullenvale, concierge, /buddy, /ppi, dealer review, full pack, 39, 9.95.

---

## 6. Key decisions needed before code changes

1. Supabase source of truth: reverse-engineer live schema or build clean schema from TypeScript types.
   Recommendation: reverse-engineer live first, then check it in.

2. Stripe cleanup: code whitelist only, or also delete dormant Stripe Dashboard products.
   Recommendation: both, with Jordan approval for Dashboard changes.

3. Deal Room access: link-only MVP or role-token/magic-link access.
   Recommendation: link-only only for small beta; role tokens before public paid acquisition.

4. Upload storage: Vercel Blob or Supabase Storage.
   Recommendation: keep Vercel Blob since code already uses it, but fail closed if unavailable.

5. Cron/nurture: locked route only or activate schedule.
   Recommendation: lock and park until nurture copy is explicitly approved.

6. PPSR automation: keep experimental Playwright runner or remove.
   Recommendation: keep but mark experimental; do not run real PPSR purchases without approval.

7. Free Check vs Free Kit naming.
   Recommendation: keep both, but distinguish clearly:
   - /check = Free Listing Check
   - /free-kit = Free Inspection + Contract Pack lead magnet

---

## 7. Test and verification architecture

Minimum tests/checks before launch:

- Existing webhook-secret fail-closed test.
- Checkout whitelist route test.
- Stripe refund handler test.
- Cron secret required test.
- Deal upload validation test.
- Free Check manual validation test.
- Order success delayed-webhook fallback test.
- Supabase schema drift script.
- Live drift scan script.

Pre-deploy gate:

```bash
npm test
npm run typecheck
npm run build
node scripts/check-supabase-schema.mjs
```

Post-deploy gate:

```bash
bash scripts/live-drift-scan.sh
```

Manual paid-flow smoke tests after env/webhook verification:

- PPSR checkout -> webhook -> Supabase order -> email -> admin PPSR processing -> PDF email.
- Deal Pack checkout -> webhook -> deal row -> buyer email -> Deal Room load/save/finalise -> PDFs emailed.

---

## 8. Non-goals and approval gates

Non-goals:

- No new products.
- No new pricing tiers.
- No PPSR API integration.
- No standalone AI Buddy.
- No public PPI booking service.
- No nationwide expansion copy.
- No redesign/design-system overhaul.
- No marketing site rebuild.

Jordan approval required before:

- Production deploy.
- git push origin main if it triggers production workflow.
- Vercel env changes.
- Stripe product, price, webhook, refund, or live/test-mode changes.
- Supabase production schema/data changes.
- DNS/mail/Resend domain changes.
- Sending customer or nurture emails.
- Choosing Deal Room access model for real users.
- Reintroducing Buddy, PPI, $99 Quick Review, or any $997 offer.

---

## 9. Highest-leverage next action

Resolve local main vs origin/main before anything else.

Run:

```bash
git log origin/main..main --oneline --stat
git diff --stat origin/main..main
git status --short --branch
```

Then ask Jordan for one decision:

- push local main intentionally,
- branch current local main into a launch-hardening branch,
- or hold/rework before pushing.

Claude's reasoning: until the +15 commit state is resolved, every new branch or deploy action risks either redoing already-fixed work or accidentally pushing unverified production changes.
