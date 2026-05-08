# Buying Buddy Homepage Hook Strategy

Purpose: reduce feature/message bloat and organise the launch site around high-intent buyer jobs.

## Core Direction

Buying Buddy should feel like a calm buyer-side teammate for QLD used-car buyers.

Primary message:

> Check the rego before you chase the car. Then PPSR before money. Then inspect and hand over properly.

This is stronger than a broad "used-car tools" homepage because it gives people a first action.

## Top 4 Hooks To Push

### 1. Free QLD Rego Check

Best for:

- Facebook Marketplace ads
- Reddit comments/posts where allowed
- organic SEO
- homepage hero
- short-form content

Why it works:

- free
- instant-ish
- high intent
- people already have the plate
- leads naturally into seller questions and PPSR

Ad angles:

- "Found a car on Marketplace? Check the QLD rego before you drive out."
- "Before you ask 'is this car legit?', check whether the rego story lines up."
- "Private, commercial, dealer use - one plate check can change what you ask next."

SEO pages:

- `/rego-check` - free QLD rego check
- `/qld-rego-check` - optional synonym landing page or redirect
- blog: "What does PRIVATE mean on a QLD rego check?"
- blog: "Commercial use on a QLD rego: should buyers worry?"
- blog: "QLD rego check vs PPSR: what each one tells you"

### 2. PPSR Check / Finance Owing

Best for:

- bottom-of-funnel search
- conversion after rego check
- deposit warnings

Why it works:

- money-risk keyword
- clear paid conversion
- buyers understand finance owing/stolen/written-off risk

Ad angles:

- "A current rego does not mean the car is debt-free."
- "Before the deposit, run the PPSR."
- "If the seller rushes you, slow down and check the PPSR."

SEO pages:

- `/ppsr` - PPSR report
- blog: "How to check if finance is owing on a used car"
- blog: "Can you buy a car with finance owing in Queensland?"
- blog: "PPSR written-off status explained for used-car buyers"

### 3. Facebook Marketplace Car Scam / Listing Sanity Check

Best for:

- top-of-funnel content
- Reddit/Facebook community value posts
- nervous buyers who do not know which tool they need

Why it works:

- strong emotional search intent
- people ask scam questions constantly
- lets Buying Buddy be useful before asking for payment

Ad angles:

- "Before you waste Saturday on a Marketplace car, do the 3-minute buyer-side check."
- "No VIN, vague roadworthy, rushed deposit? Slow down."
- "Paste the listing and get a second set of eyes."

SEO pages:

- `/check` - free listing check
- blog: "Facebook Marketplace car scams Australia"
- blog: "Questions to ask before inspecting a private-sale car"
- blog: "Used-car red flags before sending a deposit"

### 4. QLD Handover: Rego Transfer / Roadworthy / Contract

Best for:

- SEO spider web
- post-PPSR upsell
- buyer confidence near purchase

Why it works:

- QLD-specific searches are less competitive than generic car-buying terms
- paperwork pain is real
- naturally supports contract pack / deal pack

Ad angles:

- "Buying privately in QLD? Don't leave transfer and roadworthy until the driveway."
- "The boring paperwork is where expensive mistakes hide."
- "Use a simple QLD handover checklist before money changes hands."

SEO pages:

- `/contract-pack` - paperwork product
- blog: "QLD rego transfer checklist for private car buyers"
- blog: "Roadworthy certificate QLD private sale: what buyers should ask"
- blog: "Private car sale receipt QLD: what to include"
- blog: "Buying a used car privately in Queensland checklist"

## Recommended Homepage Shape

1. Hero: Rego-first action.
2. Four hook cards: Rego, PPSR, Listing Check, Paperwork.
3. Simple buying flow: Rego -> PPSR -> Inspect -> Handover.
4. Marketplace risk block.
5. SEO spider web block.
6. Final CTA: check the rego.

Avoid adding every future idea to the homepage until there is traffic proof.

## Tone

Use teammate doubt, not fear-selling.

Good:

- "This is useful, but it is only one layer."
- "If the seller story does not match the result, ask why."
- "PPSR before money. Paperwork before handover."

Avoid:

- "Don't get scammed!!!"
- "This one mistake could ruin you"
- overclaiming that a rego/PPSR/roadworthy proves the car is mechanically safe

## Next RALPH Loop

Audit:

- mobile homepage scroll length
- CTA visibility above fold
- homepage to rego-check click path
- rego-check to PPSR click path
- missing pages for SEO web

Act:

- build specific SEO pages one by one
- add internal links between rego/PPSR/contract pages
- add event tracking for hook cards
- keep removing unsupported feature clutter

Gate:

- `npm run typecheck`
- `npm run build`
- live page fetch smoke
- mobile nav sanity check
