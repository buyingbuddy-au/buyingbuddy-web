# BuyingBuddy — Business Strategy & Operating Model
## "Help everyday Australians buy cars without getting ripped off"

**Author:** AI Strategy Team (overnight 29 Mar 2026)
**For:** Jordan Ladsbury, Chairman
**Status:** DRAFT — awaiting Jordan's review

---

## 1. THE PROBLEM (Why This Business Exists)

Every year, hundreds of thousands of Queenslanders buy a used car privately. Most of them:
- Don't know what a fair price is
- Don't know how to spot a lemon
- Don't know they need a PPSR check (or what it is)
- Don't have a proper contract of sale
- Get ripped off by dodgy sellers, or overpay at dealers out of fear

**QLD is the wild west of used car sales.** No cooling-off period on private sales. No mandatory roadworthy for seller (unlike VIC). Minimal consumer protection. Buyers are on their own.

**Jordan's unfair advantage:** 15 years in the auto industry (Lexus, BMW, Audi). Knows wholesale AND retail. Has the moral compass to actually help people instead of exploit them. This isn't a tech bro building a car app — this is a car guy building a trust brand.

---

## 2. THE CUSTOMER (Who We're Serving)

**Primary persona: "First-Time Private Buyer"**
- Age 25-45, QLD-based
- Buying a $10K-$40K used car privately (Facebook Marketplace, Gumtree)
- Anxious about getting scammed
- Googles things like "how to buy a used car QLD", "PPSR check QLD", "private car sale contract QLD"
- Willing to spend $10-$50 on peace of mind if they trust the source
- Wants simple, no-bullshit advice — not a 47-page guide

**Secondary persona: "Dealer-Wary Upgrader"**
- Has bought from dealers before, felt ripped off
- Looking at private sale to "cut out the middleman"
- Needs hand-holding through the process
- Higher willingness to pay ($50-$200 for a full service)

---

## 3. THE REVENUE MODEL (How We Make Money)

### Tier 0: FREE (Lead Generation)
| Product | Purpose | Delivery |
|---------|---------|----------|
| Pre-Purchase Checklist PDF | Email capture. Gets them into our world. | Auto-download + email drip |
| "Is This a Good Deal?" Calculator | Viral tool. Shareability. SEO juice. | Web app on buyingbuddy.com.au |
| Blog articles (SEO) | Organic traffic from Google | Static content |

### Tier 1: $4.95 - $9.95 (Impulse Buys)
| Product | Price | Delivery | Margin |
|---------|-------|----------|--------|
| QLD Contract of Sale (template) | $4.95 | Instant PDF download | ~100% |
| PPSR Check | $9.95 | Manual lookup, delivered within 1hr | ~$7 margin |
| Vehicle Receipt Template | $4.95 | Instant PDF download | ~100% |

### Tier 2: $19.95 - $29.95 (The Sweet Spot)
| Product | Price | Delivery | Margin |
|---------|-------|----------|--------|
| Private Sale Contract Pack | $19.95 | Instant PDF bundle (Contract + Receipt + Condition Report + Checklist) | ~100% |
| Negotiation Script Pack | $14.95 | Instant PDF | ~100% |
| Dealer Review Report | $29.95 | Manual research, delivered within 24hr | ~$25 margin |

### Tier 3: $49.95 - $99.95 (High Value)
| Product | Price | Delivery | Margin |
|---------|-------|----------|--------|
| BuyingBuddy Complete Bundle | $49.95 | All Tier 1+2 products + phone consult | ~$40 margin |
| PPI Booking Service | $99.95 | Jordan books and coordinates PPI inspection | ~$50 margin (after inspector fee) |

### Tier 4: $199+ (Concierge)
| Product | Price | Delivery | Margin |
|---------|-------|----------|--------|
| BuyingBuddy Concierge | $299 | Jordan personally reviews the deal, negotiates price, arranges PPI, handles paperwork | ~$200 margin |

### Revenue Target: $100K/year
| Scenario | Monthly Sales Needed |
|----------|---------------------|
| All Contract Packs ($19.95) | 418/month = 14/day ❌ Too many |
| Mix of products (avg $35) | 238/month = 8/day 🟡 Possible with traffic |
| Contract Pack + PPI + Concierge (avg $65) | 128/month = 4/day ✅ Realistic |
| 50% Concierge at $299 + 50% packs at $20 | 63/month = 2/day ✅ Very achievable |

**The math says: you don't need massive volume. You need 2-4 sales per day of a product mix, which requires ~200 daily visitors to the site at a 1-2% conversion rate.**

---

## 4. THE FUNNEL (How Strangers Become Customers)

```
AWARENESS (They find us)
    │
    ├── Google search → SEO blog posts → lands on buyingbuddy.com.au
    ├── Facebook groups → helpful comment with link → lands on site
    ├── Reddit r/CarsAustralia → value post → lands on site
    ├── Google Ads → "PPSR check QLD" → landing page
    │
CAPTURE (We get their email)
    │
    ├── Free Checklist Download (email required)
    ├── "Is This a Good Deal?" Calculator (email for full report)
    │
NURTURE (We build trust over 5 days)
    │
    ├── Day 0: Welcome + checklist delivered
    ├── Day 1: "The 3 things scammers don't want you to know"
    ├── Day 3: "Why a $10 PPSR check saves you $10,000"
    ├── Day 5: "Ready to buy? Here's your Contract Pack (20% off)"
    │
CONVERT (They buy something)
    │
    ├── Contract Pack / PPSR check / Bundle
    │
UPSELL (They buy more)
    │
    ├── "Want me to personally review this deal?" → Concierge
    ├── "Need a PPI? I'll book it for you" → PPI Service
    │
REFER (They tell friends)
    │
    └── "Share your checklist link, earn $5 credit"
```

---

## 5. THE TEAM (Who Does What)

### Human Roles

| Role | Person | Hours/Week | Responsibilities |
|------|--------|------------|-----------------|
| **Chairman / Brand Voice** | Jordan | 2-3 hrs | Final approval on content tone, video content, personal consults, concierge deals |
| **PPI Coordinator** | Jordan | As needed | Books PPI inspections, coordinates with mechanics, delivers reports |
| **Concierge Service** | Jordan | As needed | High-value personal deal reviews ($299) |

### AI Agent Roles

| Agent | Name | Model | Schedule | Daily Output |
|-------|------|-------|----------|--------------|
| **Content Director** | Pablo | gemini-3.1-pro | On-demand | SEO blog posts, social content, email copy. Writes in Jordan's voice (blunt, experienced, no BS). |
| **SEO Analyst** | Scout | gemini-flash-lite | Weekly | Keyword research, competitor analysis, content gap identification. Reports: "Write about X, it gets Y searches/month." |
| **Email Ops** | Drip | gpt-5.4-nano | Daily 6 AM | Monitors email list health, triggers nurture sequences, reports opens/clicks to Jordan via Telegram. |
| **Site Ops** | Ship | codex/gpt-5.4 | On-demand | Deploys code changes, builds new landing pages, fixes bugs. The builder. |
| **Analytics** | Pulse | gpt-5.4-nano | Daily 7 AM | Checks Vercel analytics, Stripe revenue, email signups. Sends Jordan a daily dashboard via Telegram. |
| **Lead Triage** | Grab | gpt-5.4-nano | Daily 6 AM | Runs AutoGrab extraction, filters deals, sends morning deal list to Jordan. (Already partially built.) |
| **Customer Support** | Buddy | sonnet | On-demand | Answers customer emails at info@buyingbuddy.com.au. Drafts responses for Jordan to approve before sending. |

### The Operating Rhythm

| Time | What Happens | Who |
|------|-------------|-----|
| 6:00 AM | Grab extracts today's AutoGrab deals → Telegram | AI |
| 6:30 AM | Drip checks email list, triggers sequences | AI |
| 7:00 AM | Pulse sends daily dashboard (visitors, revenue, signups) | AI |
| 7:30 AM | Jordan reviews morning brief + deal list on phone | Jordan |
| 8:00-12:00 | Jordan does The Grind (messaging sellers, phone calls) | Jordan |
| 12:00-1:00 | Jordan reviews any customer emails (Buddy has drafts ready) | Jordan |
| 1:00-3:00 | Jordan does concierge/PPI work if any orders came in | Jordan |
| Weekly (Sun) | Scout delivers SEO report: "Publish these 3 articles this week" | AI |
| Weekly | Pablo writes 2-3 blog posts based on Scout's recommendations | AI |
| Weekly | Ship deploys any site improvements | AI |

---

## 6. GAP ANALYSIS (What's Missing & What To Spend On)

### GAP 1: No Traffic Source ⚠️ CRITICAL
**Problem:** The site is live but nobody knows it exists. Zero visitors = zero revenue.
**Solution:** 
- **Immediate (free):** Publish 10 SEO-targeted blog posts this week. Target long-tail keywords like "private car sale contract QLD template", "PPSR check Brisbane", "how to buy a used car QLD."
- **Immediate (free):** Post helpful answers in Facebook groups (QLD car buy/sell groups) and Reddit (r/CarsAustralia, r/brisbane) with natural links back to buyingbuddy.com.au.
- **Week 2 ($50-100/month):** Start Google Ads on highest-intent keywords: "PPSR check QLD" (people searching this are READY to buy). Even $3/day gets you 5-10 clicks/day.
**Investment:** $50-100/month Google Ads budget
**Business case:** At $3/click and 5% conversion on a $20 product = $1 revenue per click. Break-even at 5 clicks/day. Profit above that.

### GAP 2: No Email Capture Automation ⚠️ HIGH
**Problem:** The checklist download exists but doesn't trigger an email sequence. Every visitor who downloads and leaves is lost forever.
**Solution:** Wire Resend API to automatically:
1. Send the checklist PDF immediately
2. Start the 5-day nurture sequence (already written, sitting in buyingbuddy-content/)
3. Tag the lead in a simple email list
**Investment:** $0 (Resend free tier covers 3,000 emails/month — more than enough to start)
**Business case:** Email nurture sequences convert at 2-5%. If 100 people download the checklist and 3 buy a $20 Contract Pack, that's $60/month from a free tool. It compounds.

### GAP 3: No "Is This a Good Deal?" Calculator 🟡 MEDIUM
**Problem:** The single best viral tool for car buyers doesn't exist yet. Every car buyer wants someone to tell them "yes, that's a fair price" or "no, you're overpaying."
**Solution:** Build a simple web tool:
- User enters: Year, Make, Model, Kms, Asking Price
- We return: Fair market range, verdict (Good Deal / Fair / Overpriced), what to watch for on that model
- Capture their email to "save their report"
**Investment:** $0 (AI agent builds it overnight, data from RedBook/public sources)
**Business case:** This is the #1 shareable tool. People send it to friends. "Check if your car deal is good → buyingbuddy.com.au." Free traffic engine.

### GAP 4: Products Need Polish 🟡 MEDIUM
**Problem:** The Contract Pack page exists on the site but the actual PDF products haven't been created to professional standard.
**Solution:** Create polished, print-ready PDF templates:
- QLD Contract of Sale (legally sound, plain English)
- Vehicle Condition Report (checkbox-style, photo slots)
- Payment Receipt
- Handover Checklist
**Investment:** $0 (AI generates them) OR $50-100 for a Canva Pro subscription to make them look premium
**Business case:** These are 100% margin digital products. Build once, sell forever.

### GAP 5: No Facebook Presence 🟡 MEDIUM
**Problem:** Jordan's personal Facebook business account attempt got banned. BuyingBuddy has no social media presence.
**Solution:** Create a Facebook Business Page from Jordan's personal account (not a new account). No ban risk — Pages are different from accounts.
**Investment:** $0
**Business case:** Facebook is where the buyers ARE. A Page lets you post in marketplace groups, run ads later, and build credibility.

### GAP 6: No Analytics 🟢 LOW (but important)
**Problem:** We can't measure what we can't track. No idea how many people visit the site, where they come from, or what they click.
**Solution:** Add Vercel Analytics (free) + simple event tracking on key actions (checklist download, product page view, Stripe checkout).
**Investment:** $0
**Business case:** Without this, every decision is a guess.

---

## 7. THE 30-DAY LAUNCH PLAN

### Week 1: Foundation (Mon 31 Mar - Sun 6 Apr)
- [ ] Wire email automation (checklist download → nurture sequence)
- [ ] Create polished PDF products (Contract, Receipt, Condition Report)
- [ ] Add Vercel Analytics
- [ ] Publish 5 SEO blog posts
- [ ] Create Facebook Business Page from Jordan's account
- [ ] Post in 3 QLD car Facebook groups with genuine helpful content

### Week 2: Traffic (Mon 7 Apr - Sun 13 Apr)
- [ ] Publish 5 more SEO blog posts
- [ ] Build "Is This a Good Deal?" calculator
- [ ] Start Google Ads ($3/day on "PPSR check QLD")
- [ ] Post on Reddit r/CarsAustralia with value content
- [ ] First email sent to any captured leads

### Week 3: Conversion (Mon 14 Apr - Sun 20 Apr)
- [ ] Analyse first 2 weeks of traffic data
- [ ] Optimise highest-traffic pages for conversion
- [ ] Add testimonials section (even if it's Jordan's own deals as case studies)
- [ ] Launch Tier 3 products (Complete Bundle, PPI Booking)
- [ ] Create a "How to buy a car in QLD" YouTube video (Jordan on camera, 5 mins)

### Week 4: Scale (Mon 21 Apr - Sun 27 Apr)
- [ ] Double Google Ads budget if ROI positive
- [ ] Launch referral program ("Share your checklist, earn $5")
- [ ] Publish 5 more blog posts
- [ ] Review month 1 revenue vs targets
- [ ] Decide: increase ad spend, add products, or pivot

---

## 8. SPEND RECOMMENDATIONS

| Item | Cost | Timing | ROI Justification |
|------|------|--------|-------------------|
| Google Ads | $100/month | Week 2 | Break-even at 5 sales/month. High-intent traffic. |
| Canva Pro | $18/month | Week 1 | Professional PDF templates = higher perceived value = more sales |
| Total Month 1 | ~$118 | | If we get 10 sales at avg $25 = $250 revenue. Net positive. |

**Note:** Everything else is $0. The AI team builds the site, writes the content, runs the emails, and monitors analytics. Jordan's time is the only other cost.

---

## 9. WHAT JORDAN DOES vs WHAT AI DOES

### Jordan's 3 Jobs:
1. **Be the face.** Record a welcome video. Show up in Facebook groups as a real person. Buyers trust a bloke with 15 years in the industry, not a faceless website.
2. **Deliver the premium services.** Concierge reviews and PPI bookings are where the real money is, and they require a human with expertise. That's Jordan.
3. **Approve and steer.** Review AI-drafted content before it publishes. Approve customer email replies. Make the business decisions. Be the chairman.

### AI Does Everything Else:
- Builds and maintains the website
- Writes all blog content and email sequences
- Manages SEO strategy
- Runs daily analytics and reporting
- Handles AutoGrab deal extraction
- Drafts customer support responses
- Creates marketing materials and social posts

---

## 10. THE HONEST TRUTH

This business will NOT make $100K in month one. Here's the realistic trajectory:

| Month | Revenue | What's Happening |
|-------|---------|-----------------|
| 1 | $50-200 | Building foundation. First sales trickle in from Google Ads + SEO. |
| 2 | $200-500 | SEO posts starting to rank. Email list growing. Word of mouth begins. |
| 3 | $500-1,500 | Calculator tool goes semi-viral. Concierge bookings start. |
| 6 | $2,000-5,000 | Organic traffic established. Repeat customers. Referrals. |
| 12 | $5,000-10,000/month | Brand established in QLD market. Multiple revenue streams compounding. |

**The compounding effect is the strategy.** Every blog post, every email subscriber, every happy customer compounds. Month 1 is planting seeds. Month 12 is harvest.

**Meanwhile, The Grind keeps the lights on.** Jordan trades cars with SEQ Automotive for immediate cash flow while BuyingBuddy grows in the background. The Grind funds The Dream. By month 12, The Dream starts funding itself.

---

*This document is the map. Jordan is the chairman. The AI team executes. Let's stop spinning wheels and start moving.*

---

## PRODUCT IDEA: Guided Pre-Purchase Inspection Checklist (.95)

**Captured: 29 Mar 2026 � Jordan's idea**

### The Concept
User pays .95, gets a guided walkaround experience on their phone:
- Step-by-step checklist (20-30 checkpoints)
- Camera prompts at each step: 'Photo the VIN plate', 'Photo under bonnet', 'Photo all 4 tyres'
- Service book check: 'How many stamps? What brand?'
- User answers questions + takes photos throughout

At the end, our system:
- Scores the car (Red Flag count)
- Gives a verdict: Buy / Caution / Walk Away
- Delivers a shareable PDF report with their photos + score
- Optionally upsells to a professional PPI if score is borderline

### Why It's Smart
- No mechanic needed for the .95 tier - it's GUIDED self-inspection
- The photos + data collected = AI can flag obvious red flags (rust, fluid leaks, tyre wear, panel gaps)
- Feels premium because it's interactive - not just a static checklist PDF
- Natural upsell: 'Your car scored 6/10. 3 amber flags found. Want a professional to verify?  PPI booking.'
- Differentiated from competitors (Carify etc.) who just do data reports - we guide the HUMAN

### Tech Requirements
- Mobile camera access (standard browser API - no app needed)
- Photo upload to storage (Cloudflare R2 or similar - cheap)
- AI image analysis for red flag detection (GPT-4o Vision or Gemini Vision - ~.02/photo)
- PDF generation (jsPDF or similar)
- Stripe payment gate

### Cost Per Use (estimated)
- 25 photos @ .02 AI analysis = .50
- Storage = .01
- PDF generation = free
- Stripe fee = .88 (on .95)
- **Total cost: ~.40**
- **Margin: ~.55 (93%)**

### Build Priority: MEDIUM
- Needs Jordan to test the flow (he knows what to look for)
- Jordan to define the 25-30 checkpoint list
- Build after email automation + PPSR automation are working
