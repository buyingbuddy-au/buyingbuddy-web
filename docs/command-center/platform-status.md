# Platform Status

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  
**Last verified:** 2026-05-05  

This file tracks external systems by purpose, project name, env var name, and verification status. Never store secret values here.

## Systems

| System | Current role | Recorded state | Verification |
| --- | --- | --- | --- |
| GitHub | Durable source of truth and repo history | `buyingbuddy-au/buyingbuddy-web`, branch `main` | `git remote -v`, GitHub UI |
| Vercel | Production hosting and deploy target | Project `buyingbuddy-web`, project id `prj_KiQaVrYyhPl5YhwAHnULoV3l6NIK` | `vercel whoami`, `vercel env ls`, Vercel dashboard |
| Supabase | App data layer used by code | URL/key env vars present by name on Vercel | Supabase dashboard and `src/lib/supabase.ts` |
| Stripe | Checkout and payment webhooks | Secret and publishable key env names present by name; webhook secret not observed in Vercel env listing | Stripe dashboard and webhook runbook |
| Resend | Transactional email | `RESEND_API_KEY` env name present by name on Vercel | Resend dashboard and app email routes |
| DNS | Domain routing | `buyingbuddy.com.au` points to Vercel during DNS check | DNS registrar and `nslookup` |
| Mail | Customer mailbox hosting | MX records point to Google-hosted mail during DNS check | Google Workspace/mail admin |
| Telegram | Operational alerts if still enabled | Bot token env name present by name; chat id must be verified before relying on alerts | Telegram integration code and Vercel env |
| SiteGround | Historical or unknown role | No current hosting role proven during audit | Confirm manually before treating as active |

## Vercel Env Names Observed

Observed by name only:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `TELEGRAM_BOT_TOKEN`
- `OPENROUTER_API_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SITE_URL` - Production
- `SITE_URL` - Production

Not observed during audit and must be checked before production reliance:

- `STRIPE_WEBHOOK_SECRET`
- `ADMIN_PASSWORD`

Additional names referenced by code or scripts that require route-specific verification before use:

- `TELEGRAM_CHAT_ID`
- `OPENAI_API_KEY`
- `GOOGLE_AI_API_KEY`
- `ANTHROPIC_API_KEY`
- `CRON_SECRET`
- `WEBHOOK_SECRET`
- PPSR automation card/payment variables referenced by scripts or legacy automation

## Secret Handling

- Secret values never go in repo docs.
- Env var names are allowed.
- Secret-looking values found in archive docs or terminal history must be treated as compromised until rotated or confirmed safe by Jordan.
- Agents may identify missing env names.
- Agents may not print, copy, rotate, or create secrets without explicit Jordan approval.

## Platform Verification Commands

Run from repo root:

```powershell
git remote -v
vercel whoami
vercel env ls
nslookup buyingbuddy.com.au
nslookup -type=mx buyingbuddy.com.au
```

Expected:

- GitHub remote points to `buyingbuddy-au/buyingbuddy-web`.
- Vercel user/team access is available.
- Env names are visible without values.
- Domain resolves to Vercel.
- Mail records are understood before changing email flows.
