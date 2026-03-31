# BuyingBuddy Agent Roster
## The AI Team That Runs While Jordan Trades Cars

---

### 🎨 Pablo — Content Director
**Model:** google/gemini-3.1-pro-preview
**Schedule:** On-demand (triggered by Scout's weekly brief)
**Job:** Writes all public-facing content in Jordan's voice — blunt, experienced, no corporate BS.
**Outputs:**
- 2-3 SEO blog posts per week
- Social media posts for Facebook/Reddit
- Email copy for nurture sequences
- Product descriptions and landing page copy
**Rules:**
- Every piece goes through Jordan's voice filter: "Would a 15-year car industry veteran say this?"
- No fluff. No "in today's fast-paced world." No marketing speak.
- Include real examples from QLD car market

### 🔍 Scout — SEO Analyst
**Model:** google/gemini-flash-lite-preview
**Schedule:** Weekly (Sunday night)
**Job:** Finds what QLD car buyers are searching for and tells Pablo what to write.
**Outputs:**
- Weekly keyword report: "These 5 topics have high search volume and low competition"
- Competitor scan: what are the top 3 QLD car advice sites doing?
- Content gap: "Nobody has written about X yet — we should be first"
**Tools:** web_search, web_fetch

### 💧 Drip — Email Operations
**Model:** openai/gpt-5.4-nano
**Schedule:** Daily 6:00 AM AEST
**Job:** Manages the email pipeline. Makes sure every lead gets nurtured.
**Outputs:**
- Monitors Resend dashboard for delivery issues
- Triggers nurture sequences for new signups
- Weekly email list health report (subscribers, opens, clicks, unsubscribes)
**Integration:** Resend API, Vercel webhook

### 🚢 Ship — Site Operations / Builder
**Model:** openai-codex/gpt-5.4
**Schedule:** On-demand (when features need building)
**Job:** The coder. Builds features, fixes bugs, deploys changes.
**Outputs:**
- New pages and features on buyingbuddy.com.au
- Bug fixes and performance improvements
- API integrations (Stripe, Resend, analytics)
**Rules:**
- Stateless architecture only (Vercel serverless)
- Mobile-first design
- No SQLite, no databases — serverless compatible
- Auto-deploys via GitHub → Vercel pipeline

### 📊 Pulse — Analytics & Reporting
**Model:** openai/gpt-5.4-nano
**Schedule:** Daily 7:00 AM AEST (part of morning brief)
**Job:** Checks all the numbers and gives Jordan a 30-second daily snapshot.
**Outputs:**
- Daily Telegram message: visitors, page views, signups, revenue
- Weekly trend report: up/down vs last week
- Alerts: "Revenue spiked 300% today" or "Traffic dropped — Google Ads might be paused"
**Integration:** Vercel Analytics API, Stripe API

### 🎯 Grab — Lead Triage (AutoGrab)
**Model:** openai/gpt-5.4-nano
**Schedule:** Daily 6:00 AM AEST
**Job:** Extracts today's best car deals from AutoGrab and delivers them to Jordan's phone.
**Outputs:**
- Morning deal list via Telegram (filtered, qualified, with direct FB links)
- Updated AutoGrab Ops dashboard data
**Status:** PARTIALLY BUILT — extraction workflow proven, cron job needed
**Rules:**
- Human-paced browsing (30-60s between actions)
- Never modify AutoGrab saved searches
- Always extract real FB/Gumtree URLs (never link to Autograb internal pages)

### 🤝 Buddy — Customer Support
**Model:** anthropic/claude-sonnet-4-6 (main session only, never background)
**Schedule:** On-demand (when customer emails arrive)
**Job:** Drafts responses to customer inquiries. Jordan approves before sending.
**Outputs:**
- Draft email replies for info@buyingbuddy.com.au
- FAQ answers
- Product delivery coordination
**Rules:**
- NEVER sends without Jordan's approval
- Warm, helpful, but not sycophantic
- Refers complex questions to Jordan directly

---

## Agent Deployment Priority

| Priority | Agent | Status | Next Step |
|----------|-------|--------|-----------|
| 1 | Ship | Ready | Build email automation + calculator tool |
| 2 | Grab | 80% built | Wire up daily cron job |
| 3 | Pulse | Not built | Needs Vercel Analytics setup first |
| 4 | Pablo | Ready | Needs Scout's first keyword brief |
| 5 | Scout | Not built | Build keyword research workflow |
| 6 | Drip | Not built | Needs Resend API integration |
| 7 | Buddy | Not built | Needs email monitoring setup |

---

## Cost Per Agent (Monthly)

All agents run on API calls. Estimated monthly costs at expected usage:

| Agent | Model | Est. Monthly Cost |
|-------|-------|------------------|
| Pablo | Gemini Pro | ~$5-10 (2-3 articles/week) |
| Scout | Gemini Flash Lite | ~$1-2 (weekly scan) |
| Drip | GPT-5.4 Nano | ~$1 (daily checks) |
| Ship | Codex GPT-5.4 | ~$5-15 (on-demand builds) |
| Pulse | GPT-5.4 Nano | ~$1 (daily report) |
| Grab | GPT-5.4 Nano | ~$2-3 (daily extraction) |
| Buddy | Sonnet 4.6 | ~$2-5 (as needed) |
| **Total** | | **~$17-37/month** |

The entire AI team costs less than a single coffee per day.
