# Email Ops

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  
**Last verified:** 2026-05-05  

Buying Buddy has two email lanes: transactional app email and human/customer conversation email.

## Lanes

### Transactional Lane

Purpose:

- Order confirmations.
- PPSR or Deal Pack delivery messages.
- Free-kit delivery.
- System notifications.

Current technical path:

- App code sends through Resend.
- Env name: `RESEND_API_KEY`.
- Customer promises must match `docs/BUYING_BUDDY_CENTRE_OF_TRUTH.md`.

Rules:

- Do not change delivery promises without checking product truth.
- Do not expose API keys in docs or logs.
- If transactional delivery fails, treat it as a launch/blocking reliability issue.

### Conversation Lane

Purpose:

- Customer replies.
- Support.
- Refund or payment questions.
- Supplier or partner emails.
- Manual fulfilment coordination.

Current observed mail routing:

- DNS MX records pointed to Google-hosted mail during audit.
- Exact mailbox ownership must be verified before relying on inbox automation.

Rules:

- Agents may classify emails.
- Agents may draft replies.
- Jordan approves sends by default.
- Refund, complaint, legal, safety, payment, chargeback, or angry customer messages escalate to Jordan.
- Do not promise same-hour delivery unless Jordan explicitly approves that message.

## Customer Promise Baseline

Allowed baseline promise for launch:

- PPSR delivery is same business day, usually within 2 hours, while fulfilment is manual or supervised.
- Deal Pack is low-cost self-serve buyer-side support.
- Buying Buddy does not find cars, negotiate for buyers, or handle the whole purchase.

## Drafting Rules

Email drafts should be:

- Short.
- Plain English.
- Direct.
- Australian tone.
- Specific about next step.
- Consistent with launch pricing and scope.

Do not include:

- $997 offers.
- Concierge claims.
- "We find the car" promises.
- Legal advice positioning.
- Mechanical inspection guarantees.
- Secret links, tokens, or internal dashboard URLs.

## Inbox Triage Buckets

- `urgent-money` - payment, refund, duplicate charge, failed order.
- `urgent-safety` - scam risk, finance owing, unsafe handover, seller pressure.
- `needs-reply` - normal customer question.
- `fulfilment` - PPSR/report/deal-pack delivery work.
- `supplier` - platform, vendor, partner, or tool provider.
- `fyi` - no action unless Jordan asks.

## Before Any Agent Reads Mail

Confirm:

- Which mailbox to search.
- Date range or search query.
- Whether the agent may draft only or draft and send.
- Whether attachments may be opened.
