# Supabase Health Runbook

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  

Use this before relying on app data flows.

## Safety Rule

Do not change Supabase production data, policies, or schema without explicit Jordan approval.

## Code Inspection

Run:

```powershell
npm ls @supabase/supabase-js
Get-Content src\lib\supabase.ts
rg -n "\.from\(" src
```

Known app tables from code inspection:

- `orders`
- `email_captures`
- `deals`
- `known_issues_cache`

## Env Check

Run:

```powershell
vercel env ls | Select-String "SUPABASE"
```

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Dashboard Check

In Supabase dashboard, verify:

- Which project is production.
- Tables exist for launch-critical flows.
- Row-level security and policies are understood before exposing new client writes.
- Recent order/email/deal writes exist if production has live traffic.
- No manual destructive changes are pending.

## Launch-Critical Data Flows

- Free Listing Check email capture.
- Stripe order creation or update.
- Deal Pack room creation.
- Admin stats if admin dashboard is used.

If any launch-critical flow is not backed by a real table or reliable fallback, record it in `docs/command-center/open-questions.md`.
