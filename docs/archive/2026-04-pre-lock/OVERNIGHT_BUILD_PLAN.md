# BuyingBuddy Build Plan — 6 April 2026

## Objective
Ship practical mobile-first fixes, tighten conversion flows, remove dead ends, and keep auditing until the core buyer journey feels clean.

## Active Workstreams

### 1) Inspection UX hardening
- Audit `/inspect`, `/inspect/full`, `/inspect/print`
- Verify every button, next/back state, share action, print action, results state
- Keep dark styling
- Keep the checklist practical for ordinary buyers
- Output: code fixes + `memory/inspection-night-audit.md`

### 2) Quick checklist rebuild
- Bring `/inspect/print` up to the same UX quality as guided inspection
- Tighten spacing, tap targets, summary layout, share/print behavior
- Remove any remaining checklist bloat
- Output: code fixes + `memory/inspect-print-night-audit.md`

### 3) Whole-app CTA + dead-end audit
- Audit homepage, `/check`, `/ppsr`, `/inspect`, `/deal`, `/pricing`, success pages
- Trace every primary CTA and identify broken paths, dead buttons, weak copy, awkward mobile states
- Output: targeted fixes + `memory/button-audit-night.md`

### 4) Free check results polish
- Improve verdict clarity, red flag scanability, upgrade card layout, mobile spacing
- Verify share flow
- Output: code fixes + `memory/free-check-night-audit.md`

### 5) Stripe test-mode + checkout usability
- Audit `/ppsr`, `/deal`, `/contract-pack`, Stripe checkout routes, success flow
- Identify blockers preventing Jordan testing everything safely
- Output: high-confidence fixes + `memory/stripe-test-mode-plan.md`

### 6) Product/mobile improvement stack
- PPSR page full mobile rewrite for conversion
- Deal Room mobile cleanup
- Buddy chat UX + prompt tightening
- Admin mobile operations audit
- Full checkout journey audit
- Primary CTA map across the app
- Output: code fixes + plans in memory files as needed

## Rules
- Prefer real fixes over theory
- Keep copy sharp and mobile-first
- Avoid pro-level checklist nonsense normal buyers won't do
- If a flow is awkward on a phone, treat it as broken
