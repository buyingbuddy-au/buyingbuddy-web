# OPEN_QUESTIONS.md — Buying Buddy

**Last updated:** 2026-03-31
**Purpose:** Questions that need Jordan's answer before work can proceed. No coding until these are resolved.

---

## Stripe Webhook Setup
**Owner: Jordan**
**What needs to happen:**
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://buyingbuddy.com.au/api/stripe/webhook`
3. Events to listen for: `checkout.session.completed`, `charge.refunded`
4. Copy the webhook signing secret (starts with `whsec_`)
5. Add to Vercel environment variables: `STRIPE_WEBHOOK_SECRET=whsec_xxx`

**Why it matters:** Without this, no orders auto-create when someone pays. Jordan has to manually create orders from the Stripe dashboard — which means customers wait and the system doesn't feel automated.

**Blocker for:** Everything in the delivery pipeline.

---

## Resend Domain Verification
**Owner: Jordan (has access)**
**What needs to happen:**
1. Log into Resend dashboard with buyingbuddy-au account
2. Confirm domain `buyingbuddy.com.au` is verified (DNS propagated per memory 2026-03-28)
3. Verify API key `re_N78vbUP6_25JC9NdZvimraNB5adGJ5i4o` has send permissions
4. Test by submitting free-kit form with a real email address

**Why it matters:** The free kit form captures leads but doesn't send them anything. Every lead that downloads and leaves with no email is lost forever.

**Blocker for:** Email nurture sequence (5 emails written, can't send them).

---

## Real Product Test — Who Goes First?
**Owner: Jordan**
**What needs to happen:**
Jordan needs to buy his own $4.95 or $14.95 product — not to use it, but to stress-test the full pipeline and find what breaks.

Questions this test answers:
- Does the webhook fire and create an order?
- Does the order appear in /admin?
- When Jordan clicks "Send Report", what actually happens?
- Does a PDF arrive in the customer's inbox?
- What does the PDF actually look like?

**Why it matters:** Every assumption about what's working is unverified until a real purchase has been made.

---

## What Happens When Jordan Gets a Dealer Review Order?
**Owner: Jordan**
**Workflow question:** When a $14.95 Dealer Review order comes in, what does Jordan actually do?

Questions:
- Does he get a Telegram notification? (ENGINE_SPEC.md says yes, but is it wired?)
- Does he open the listing URL from the admin panel?
- How does he send his verdict? (Voice note? Text? Admin text field?)
- What format does the PDF take his verdict? (Is there a text field? Does he paste a paragraph?)

**Current state:** ENGINE_SPEC.md has a Telegram notification spec but it's not confirmed implemented.

---

## Dealer Review Verdict Format
**Owner: Jordan**
Jordan is the product. But what does he actually write?

Questions:
- Does he write a free-text paragraph?
- Is there a structured template? (Price opinion / Known issues / Inspection checklist)
- Does he record a voice note and someone transcribes it?
- How long should a $14.95 verdict take him?
- Does he have a text or voice channel to submit it?

**Why it matters:** If a dealer review takes Jordan 60 minutes to write, the product is priced wrong. If it takes 15 minutes, the economics work.

---

## Free Kit PDF Content
**Owner: Jordan**
**What needs to happen:**
The free kit is described as a "QLD Used Car Buyer's Complete Protection Kit" — but does the actual PDF exist?

Questions:
- Is there a PDF file that gets attached to the email?
- What does it contain?
- Who creates/maintains it?

**Current state:** Memory says the page was built, but the actual PDF may be a placeholder.

---

## Calculator — Yes or No?
**Owner: Jordan (needs to decide)**
The STRATEGY.md calls the calculator "#1 viral tool" and Week 2 priority. It's not in FIX_TRACKER. It doesn't exist.

Questions:
- Does Jordan want the calculator built?
- What does it do? (Year/make/model/km → market value range?)
- Does it capture email before showing the result?
- Is it worth building before the delivery pipeline works?

**Why it matters:** It's the biggest traffic driver in the strategy doc. But building it before V1 works is building a storefront for a shop that can't serve customers.

---

## Product Pricing Tiers
**Owner: Jordan**
SITE_COPY_V5.md shows:
- PPSR: $4.95
- Dealer Review: $14.95
- Contract Pack: $9.95
- Full Pack: $34.95

ENGINE_SPEC.md shows:
- PPSR: $4.95
- Dealer Review: $14.95
- Full Pack: $34.95

FIX_TRACKER shows 3 Stripe products:
- $4.95 PPSR
- $14.95 Dealer Review
- $34.95 Full Pack

**Questions:**
- Where does Contract Pack ($9.95) sit in Stripe? Is it a separate product?
- Is the "Full Pack" the same as "Contract Pack + everything"?
- What does the customer actually get at each tier? (Exact deliverables per tier)

---

## Domain Email — Who Owns It?
**Owner: Jordan**
info@buyingbuddy.com.au is used for:
- Resend email sending (from address)
- Stripe account (login email)
- GitHub account (login)
- GoDaddy domain management

**Question:** Who has the password? Is it stored anywhere?
**Status from memory:** Password stored in buyingbuddy-web/.env.local. Jordan knows the GoDaddy password separately.

**Risk:** If Jordan loses access to info@buyingbuddy.com.au, Stripe and Resend become inaccessible. This needs a recovery plan.

---

## When Does Jordan Actually Do Dealer Reviews?
**Owner: Jordan**
**Question:** Jordan does The Grind (car trading) from 8am-12pm. When does he do dealer reviews?
- Same window? (Unlikely — he's on the phone)
- Lunch break?
- After hours?
- Weekends?

**Why it matters:** If a customer pays $14.95 at 9pm Tuesday and gets their report at 9pm Wednesday, that's probably fine. If they get it at 9pm Thursday, they may have already bought the car from someone else.

**Implication:** A 24-hour turnaround SLA on Dealer Reviews needs to be communicated clearly on the site.
