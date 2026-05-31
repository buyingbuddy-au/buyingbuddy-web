export const CONFIDENCE_REPORT_LINK = "/ppsr";

export const FULL_BUNDLE_LINK = "/deal";

export const NAV_LINKS = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Trust", href: "/#trust" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/#faq" },
] as const;

export const HERO_FEATURES = [
  "✅ Rego first: check QLD status before you waste a drive",
  "✅ PPSR next: finance, stolen and written-off status before deposit",
  "✅ Inspect properly: use a phone-friendly checklist beside the car",
  "✅ Paperwork last: keep the handover record tidy if the car survives",
];

export const PROBLEM_CARDS = [
  {
    title: "🚨 Private buying is messy",
    copy:
      "Listings can hide finance, write-off history, seller pressure, missing paperwork and expensive surprises. Slow it down before you pay.",
  },
  {
    title: "✅ Know before you go",
    copy:
      "Start with the rego, run PPSR only when the car is worth checking properly, then use the inspection and handover tools if it still stacks up.",
  },
  {
    title: "💰 Cheap checks before expensive mistakes",
    copy: "Start free. PPSR is $4.95. Deal Room is $9.99 when the car survives the checks.",
  },
];

export const TRUST_BADGES = [
  {
    title: "✓ PPSR-SOURCED STATUS EXPLAINED PLAINLY",
    copy:
      "Finance, stolen and written-off indicators explained in buyer language before deposit",
  },
  {
    title: "⚡ SAME BUSINESS DAY TARGET",
    copy: "PPSR report summaries are usually emailed within 2 hours when the supplied details are complete",
  },
  {
    title: "🔒 SECURE STRIPE PAYMENTS",
    copy:
      "Card payment is handled through Stripe checkout; Buying Buddy does not store full card details",
  },
  {
    title: "🇦🇺 AUSTRALIAN BUYER-SIDE SERVICE",
    copy: "Built for private used-car buyers who want the deal slowed down before money moves",
  },
];

export const VERIFICATION_POINTS = [
  "Buying Buddy is not affiliated with PPSR, NEVDIS, TMR or any government agency.",
  "PPSR, rego and listing checks are point-in-time information. Always match the VIN, seller ID, certificate and vehicle before payment.",
  "The tools are buyer-side information only — not legal, finance, mechanical or safety advice.",
];

export const DELIVERY_POINTS = [
  "PPSR summaries are emailed same business day, usually within 2 hours when details are complete",
  "Deal Room keeps private-sale paperwork and handover notes together",
  "Free tools stay available without forcing a checkout",
];

export const TESTIMONIALS = [
  {
    name: "Sarah M.",
    location: "Redcliffe QLD",
    quote:
      "The checklist slowed me down enough to ask better questions before I drove across Brisbane.",
  },
  {
    name: "Emma K.",
    location: "Gold Coast QLD",
    quote:
      "It made the process feel less chaotic. Rego first, PPSR next, paperwork only if the car still made sense.",
  },
  {
    name: "Michelle T.",
    location: "Toowoomba QLD",
    quote:
      "The plain-English next steps were what helped. I knew what to ask the seller before sending money.",
  },
];

export const FAQS = [
  {
    question: "How quick do I get my report?",
    answer:
      "Same business day, usually within 2 hours when the details are complete. If something needs manual confirmation, we will not pretend it is instant.",
  },
  {
    question: "Does a clear PPSR mean the car is safe to buy?",
    answer:
      "No. PPSR is the money/history check. You still need to inspect the car, match the VIN, check seller ID, and decide whether the condition and paperwork stack up.",
  },
  {
    question: "Is Buying Buddy a government service?",
    answer:
      "No. Buying Buddy is not affiliated with PPSR, NEVDIS, TMR or any government agency. It is a buyer-side tool that helps explain the checks and next steps.",
  },
  {
    question: "What's this PPSR thing anyway?",
    answer:
      "Personal Property Securities Register. It helps identify finance owing/security interests and can include stolen or written-off indicators. Treat it as essential before money changes hands.",
  },
  {
    question: "Can I use this for any car in Australia?",
    answer:
      "The workflow is built for Australian used-car buyers, with a strong QLD focus for rego and paperwork. VIN-based PPSR checks are the safer option where available.",
  },
];

export const COMPARISON_ROWS = [
  { label: "Price", values: ["Free", "$4.95", "$9.99"] },
  { label: "PPSR Check", values: ["❌", "✅", "❌"] },
  { label: "Rego First Filter", values: ["✅", "❌", "❌"] },
  { label: "Contract PDF", values: ["✅", "❌", "✅"] },
  { label: "Inspection Guide", values: ["✅", "❌", "✅"] },
  { label: "Handover Record", values: ["❌", "❌", "✅"] },
];

export const PRICING_PLANS = [
  {
    name: "FREE TOOLS",
    price: "Free",
    ctaLabel: "Start Free",
    ctaHref: "/rego-check",
    featured: false,
  },
  {
    name: "PPSR REPORT",
    price: "$4.95",
    ctaLabel: "Run PPSR Check",
    ctaHref: CONFIDENCE_REPORT_LINK,
    featured: true,
  },
  {
    name: "DEAL ROOM",
    price: "$9.99",
    ctaLabel: "Open Deal Room",
    ctaHref: FULL_BUNDLE_LINK,
    featured: false,
  },
];

export const LEAD_MAGNET_BULLETS = [
  "✓ 21-check inspection guide",
  "✓ Seller question prompts",
  "✓ Red flags every private buyer should slow down for",
];
