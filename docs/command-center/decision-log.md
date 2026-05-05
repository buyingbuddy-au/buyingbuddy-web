# Decision Log

**Status:** ACTIVE  
**Owner:** Jordan Lansbury  

Append decisions here when they change product, platform, release, agent, email, or operational control.

## 2026-05-05 - Repo-Local Command Center First

**Decision:** Build the Buying Buddy command center inside the `buyingbuddy-web` repo before creating a broader JordanOS hub.

**Reason:** Buying Buddy has active live-site drift and multiple agents/tools touching context. The repo is already tied to GitHub and Vercel, so it is the cleanest source of truth.

**Impact:** Agents must read command-center docs before using old terminal history, OpenClaw output, Hermes missions, or dashboard assumptions.

## 2026-05-05 - GitHub/Repo Wins Over Terminal History

**Decision:** Terminal history and local agent memories are evidence, not truth.

**Reason:** The local machine contains multiple stale experiments and archive folders.

**Impact:** Useful archive findings must be promoted through `docs/command-center/context-map.md` before becoming operational guidance.

## 2026-05-05 - Level 3 Actions Require Jordan Approval

**Decision:** Deploys, customer email sends, Stripe changes, Supabase production changes, DNS changes, Vercel env changes, and secret rotation require explicit Jordan approval.

**Reason:** These actions can affect money, customers, production data, or live availability.

**Impact:** Agents can prepare and verify, but they cannot mutate external production systems without current-thread approval.
