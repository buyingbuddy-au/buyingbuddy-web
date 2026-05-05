# Open Questions

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  
**Last verified:** 2026-05-05  

Only unresolved operational questions belong here.

## Platform

- Is SiteGround still attached to Buying Buddy in any active way, or is it old context only?
- Which exact Google mailbox handles `info@buyingbuddy.com.au` customer conversations?
- Should Vercel deploys happen only through GitHub push, or is manual `vercel --prod` approved as a backup path?
- Which production env vars are required for launch versus future/legacy routes?

## Stripe

- Is Stripe currently in test mode, live mode, or mixed across local and production?
- What is the current production webhook endpoint in Stripe?
- Has `STRIPE_WEBHOOK_SECRET` been added to Vercel production env?
- Which Stripe products/prices are live and customer-facing?

## Supabase

- Which Supabase project is production?
- Which tables are required for launch-critical flows?
- Does any production table need backup/export before deploy?

## Email

- Should agents be allowed to draft only, or can Jordan approve send-on-command for specific inbox tasks?
- Which transactional email templates need a launch copy audit?
- What customer support SLA should be used for paid PPSR/Deal Pack customers?

## Agents

- Should Claude CLI and OpenClaw have write access to this repo, or read/draft only?
- Should Hermes missions stay outside this repo unless promoted through the context map?
- Should a future JordanOS index include DealPilot and Buying Buddy, or stay separate until Buying Buddy is stable?
