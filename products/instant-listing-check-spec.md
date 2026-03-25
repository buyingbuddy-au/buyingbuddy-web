# Instant Listing Check — Product Spec

## What is it?
The free tool on the homepage. Customer pastes a car listing URL and gets a quick snapshot — no payment, no account.

## Purpose
1. Capture email addresses (require email to see results)
2. Build trust by giving genuine value upfront
3. Create natural upsell moment to paid products

## Input
- A URL from Facebook Marketplace, Carsales, Gumtree, or similar listing sites
- Customer's email address (required to deliver results)

## How it works (behind the scenes)
1. Customer pastes URL + email, clicks "Check Listing"
2. System fetches the listing page (using web_fetch or similar)
3. System extracts: make, model, year, mileage, asking price, seller type, location, description text
4. System cross-references against public data: RedBook value range, days listed (if detectable), common issues for that make/model/year
5. System generates a "Listing Snapshot" and emails it to the customer
6. Customer receives results with upsell prompts for paid products

## Output — The Listing Snapshot

### Section 1: Vehicle Summary
| Field | Value |
|-------|-------|
| Vehicle | 2019 Mazda CX-5 Touring |
| Listed Price | $22,000 |
| Mileage | 78,000 km |
| Location | Pullenvale, QLD |
| Source | Facebook Marketplace |

### Section 2: Market Value
| Metric | Value |
|--------|-------|
| Estimated market range | $20,500 — $23,500 |
| Where this listing sits | Mid-range ● |
| Days listed | ~12 days (estimated) |

Visual: a simple bar showing where $22,000 sits in the $20,500–$23,500 range.

### Section 3: Listing Red Flags
A checklist of potential concerns detected from the ad text and photos:

- ☐ Price significantly below market — possible red flag
- ☐ Vague description — lacks service history or rego details  
- ☐ Multiple cars from same seller — possible unlicensed dealer
- ☐ Interstate listing — verify in person before paying
- ☐ No visible rego plates in photos
- ✓ Price within expected range
- ✓ Location matches listing
- ✓ Description includes specific vehicle details

Show only the relevant flags (don't show 10 items if only 2 apply).

### Section 4: Quick Verdict
A one-paragraph summary:

"This 2019 CX-5 Touring is listed at $22,000 — right in the middle of the expected range for this model with 78,000km. The listing description is reasonably detailed. No obvious red flags in the ad. Worth inspecting — but before you commit, check the vehicle's PPSR status and consider a pre-purchase inspection."

### Section 5: Upsell Block
"Want to go deeper?"

- **PPSR Check — $4.95** — Find out if there's finance owing, stolen status, or write-off history. [Run PPSR Check →]
- **Dealer Review — $14.95** — Get a specialist's honest opinion on this specific car — pricing advice, known issues, and what to look for at inspection. [Get Dealer Review →]
- **Full Confidence Pack — $34.95** — Everything above plus a negotiation script, private sale contract, and 48-hour text support. [Get Full Pack →]

---

## Technical Notes

### URL parsing
- Facebook Marketplace: extract listing ID, scrape title/price/description
- Carsales: structured data available via meta tags
- Gumtree: similar to Facebook
- Fallback: if URL can't be parsed, ask customer to enter make/model/year/price manually

### Market value source
- RedBook API (if available/affordable)
- Fallback: CarsGuide price guide (web scrape)
- Fallback: Carsales similar listings comparison

### Red flag detection
Pattern matching on listing text:
- "must sell today" / "urgent" → urgency flag
- Multiple listings from same seller → curb-sider flag
- No rego mentioned → missing info flag
- Price >15% below market → underpriced flag
- "interstate" / "can deliver" / "deposit to hold" → scam risk flag

### Email delivery
- Send results as a clean HTML email from info@buyingbuddy.com.au
- Include Buying Buddy branding
- Upsell CTAs link directly to Stripe payment pages

### Data we do NOT provide in the free tier
- PPSR results
- Stolen vehicle status
- Write-off history
- Rego verification
- Human review

These are the paid upsells. The free tier gives enough value to be useful but leaves enough questions unanswered to drive conversion.

---

## Conversion Targets
- 30% of free check users provide their email
- 10% of email captures convert to $4.95 PPSR
- 5% of email captures convert to $14.95 review
- 2% of email captures convert to $34.95 full pack
- Average revenue per free check user: ~$1.50

At 100 free checks/day = $150/day = $4,500/month from upsells alone.
