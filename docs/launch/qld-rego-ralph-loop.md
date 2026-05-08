# QLD Rego Check RALPH Launch Loop

RALPH = Recursive Audit Launch Polish Harness.

Purpose: launch the QLD rego checker safely, then keep tightening it using real behaviour instead of guesses.

## Current Product Position

- QLD-only beta.
- Uses the official QLD Transport check-rego source.
- Low-volume, polite lookup policy. Target under 20 official lookups/hour.
- Current tone: relaxed buyer-side teammate, not fear-selling.
- Upsell path: rego result -> seller questions -> PPSR -> human second opinion / listing review.

## Why Not Fear-Sell

Do not lead with panic. It makes the product feel scammy and undermines trust.

Better frame:

- "This is useful, but it is only one layer."
- "Current rego does not prove clean title/history."
- "Here are the next two questions I would ask before driving out."
- "If this still looks good, PPSR is the next smart layer."

This creates useful doubt without sounding like a dark-pattern insurance checkout.

## Error Taxonomy

### input_error

User gave something structurally wrong.

Examples:

- empty input
- fewer than 3 characters
- more than 7 characters after cleanup
- unsupported characters if they survive cleanup

UX:

- show inline correction
- do not show email fallback
- do not blame QLD Transport

### no_result

The official source responded, but no matching QLD record was found.

Likely causes:

- typo
- old/cancelled plate
- not QLD
- plate is not in the expected lookup set

UX:

- say QLD Transport did not return a record
- ask user to check the plate and state
- optionally offer manual help if they have a listing

### not_qld

User explicitly selected/provided another state.

UX:

- explain beta is QLD-only
- offer manual listing check or future notification

### busy

Local worker is already doing a lookup, or hourly cap reached.

UX:

- collect email
- offer Seller Question Script as immediate value
- promise manual/async follow-up only if operationally true

### timeout / official_unavailable

Official site slow/down/network issue.

UX:

- collect email
- explain the government source is having a moment
- no panic, no fake certainty

### parse_error

Official site responded but markup changed or result could not be safely read.

UX:

- manual review path
- alert operator
- do not present partial data as truth

### blocked

CAPTCHA/manual verification/access block.

UX:

- stop automated retries
- switch to manual queue
- reduce rate limit before trying again

## Loop

### 1. Research

Inputs:

- latest production logs
- latest fallback captures
- support/user questions
- live rego smoke set
- build/typecheck status

Questions:

- Are people entering bad plates?
- Are no-result messages clear enough?
- Are real QLD lookups succeeding at expected latency?
- Are users clicking PPSR or asking follow-up questions?

### 2. Act

Make one small improvement per loop:

- copy clarification
- error-state fix
- validation tweak
- fallback capture tweak
- rate-limit/cache adjustment
- result card improvement
- CTA placement tweak

### 3. Launch Gate

Before deploying each change:

- `npm run typecheck`
- `npm run build`
- `node scripts/rego-api-smoke.mjs 091FC5 301JQ4 960AQ6 BAD!! 12`
- confirm `/rego-check` returns HTTP 200 locally or in preview

### 4. Probe Live

After deploy:

- open live `/rego-check`
- run 5-10 safe real QLD regos, paced at least 1 second apart
- run invalid input: `12`
- run no-result-ish input: `BAD!!` or another obvious fake
- run explicit non-QLD API case if state selector exists

Pass criteria:

- real QLD: >= 90% success in sample
- invalid input: inline correction, no email fallback
- no result: clear "not found/typo/non-QLD" wording
- technical failure: email fallback shown
- result card includes rego, VIN, description, status, expiry, purpose, source timestamp
- PPSR CTA visible but not predatory

### 5. Harden

If any gate fails:

- classify failure
- patch smallest fix
- rerun local gates
- redeploy preview
- retest only affected paths plus one happy path

### 6. Handoff

Record:

- deploy URL
- test regos
- success/failure counts
- median/max latency
- fixes applied
- remaining risks

## Sub-Agent / Model Use

Preferred delegation:

- `gpt-5.5` xhigh/high: architecture, official-source workflow, failure taxonomy, conversion strategy, code review.
- `gpt-5.4-mini` medium/high: repetitive QA, copy variants, smoke summaries, doc cleanup, fixture expansion.
- `gpt-5.4` medium/high: normal coding tasks, route/component patches, test additions.

Unavailable from live probes:

- `gpt-5.5-mini`
- `gpt-5.5-pro`
- `gpt-5.4-pro`

Available from live probes:

- `gpt-5.5`
- `gpt-5.4`
- `gpt-5.4-mini`

## Launch Checklist

- [ ] deploy preview created
- [ ] preview `/rego-check` loads
- [ ] preview API works for 3 known valid QLD regos
- [ ] invalid input state works
- [ ] no-result state works
- [ ] fallback capture works with Resend env configured
- [ ] production deploy completed
- [ ] production live smoke completed
- [ ] logs reviewed after first real traffic
