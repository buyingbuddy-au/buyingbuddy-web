export const CONFIDENCE_REPORT_LINK =
  "https://buy.stripe.com/9B614o8Qa1212ks8Jo7Zu01";

export const FULL_BUNDLE_LINK =
  "https://buy.stripe.com/dRmbJ27M6fWVcZ6f7M7Zu02";

export const NAV_LINKS = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Trust", href: "/#trust" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/#faq" },
] as const;

export const HERO_FEATURES = [
  "✅ PPSR Check: See if there's finance owing",
  "✅ Rego History: Spot accident damage",
  "✅ Theft Check: Make sure it's not stolen",
  "✅ Write-off Status: Avoid insurance nightmares",
];

export const PROBLEM_CARDS = [
  {
    title: "🚨 Facebook Marketplace is Full of Dodgy Bastards",
    copy:
      "Stolen cars, accident write-offs, finance owing... the lot. One bad buy and you're out $15k with no comeback.",
  },
  {
    title: "✅ Know Before You Go",
    copy:
      "Our reports show you everything: PPSR checks, rego history, finance owing, even if it's been flooded. Don't rock up blind.",
  },
  {
    title: "💰 Save Thousands, Sleep Easy",
    copy: "Spend $9.95 to avoid a $15,000 mistake. Fair dinkum.",
  },
];

export const TRUST_BADGES = [
  {
    title: "✓ OFFICIAL PPSR DATABASE ACCESS",
    copy:
      "We use the same government databases as licensed dealers - no dodgy third-party data",
  },
  {
    title: "⚡ PDF DELIVERED IN 30 SECONDS",
    copy: "Report hits your inbox before you finish your coffee",
  },
  {
    title: "🔒 SECURE STRIPE PAYMENTS",
    copy:
      "Bank-level security used by Netflix, Uber, and millions of Aussie businesses",
  },
  {
    title: "💰 100% SATISFACTION GUARANTEE",
    copy: "Not happy? Full refund, no questions asked",
  },
  {
    title: "🇦🇺 PROUDLY AUSTRALIAN OWNED",
    copy: "Local business supporting local car buyers",
  },
];

export const VERIFICATION_POINTS = [
  "Our reports pull directly from official Australian government databases including PPSR, NEVDIS, and state transport authorities. Same data, fraction of the dealer price.",
  "Your personal information stays in Australia and is never shared with third parties. We're not here to spam you - just help you buy smart.",
  "Developed by former car dealers and automotive finance experts who know every trick in the book.",
];

export const DELIVERY_POINTS = [
  "Report delivered to your email within 30 seconds of payment confirmation",
  "PDF formatted for easy reading on your phone while you're at the car yard",
  "Keep your report forever - handy for insurance claims or resale",
];

export const TESTIMONIALS = [
  {
    name: "Sarah M.",
    location: "Redcliffe QLD",
    quote:
      "Saved me from buying a flood-damaged Camry in Brisbane. The seller swore black and blue it was perfect. Buying Buddy showed it had been written off twice. Dodged a $12k bullet!",
  },
  {
    name: "Emma K.",
    location: "Gold Coast QLD",
    quote:
      "First time buying a car in Australia as a backpacker. This report showed me exactly what to look for and gave me confidence to negotiate. Got $2k off the asking price!",
  },
  {
    name: "Michelle T.",
    location: "Toowoomba QLD",
    quote:
      "The PPSR check alone was worth it. Car had $8k finance owing that the seller 'forgot' to mention. Would've been my problem if I'd bought it.",
  },
];

export const FAQS = [
  {
    question: "How quick do I get my report?",
    answer:
      "Instant mate. Soon as your payment goes through, you'll get a PDF in your inbox. Usually takes about 30 seconds.",
  },
  {
    question: "What if the car's clean but I still don't want it?",
    answer:
      "No worries. The report's yours to keep. Use it to negotiate or just walk away knowing you made a smart choice.",
  },
  {
    question: "Is this legit or some dodgy overseas mob?",
    answer:
      "100% Aussie owned and operated. We use official government databases - same ones the dealers use, just without the dealer markup.",
  },
  {
    question: "What's this PPSR thing anyway?",
    answer:
      "Personal Property Securities Register. Shows if there's finance owing, if it's stolen, written off, or used as security for a loan. Basically tells you if you'll actually own the car after you buy it.",
  },
  {
    question: "Can I use this for any car in Australia?",
    answer:
      "Yep, any registered vehicle. Cars, utes, bikes, caravans - if it's got a VIN or rego, we can check it.",
  },
  {
    question: "What if I'm buying from a dealer?",
    answer:
      "Even more reason to check! Some dealers are dodgier than private sellers. At least with Facebook Marketplace, you know what you're getting into.",
  },
];

export const COMPARISON_ROWS = [
  { label: "Price", values: ["Free", "$9.95", "$39"] },
  { label: "PPSR Check", values: ["❌", "✅", "✅"] },
  { label: "Rego History", values: ["❌", "✅", "✅"] },
  { label: "Basic Contract", values: ["✅", "✅", "✅"] },
  { label: "Negotiation Scripts", values: ["❌", "❌", "✅"] },
  { label: "Advanced Templates", values: ["❌", "❌", "✅"] },
  { label: "Inspection Guide", values: ["✅ Basic", "❌", "✅ Detailed"] },
];

export const PRICING_PLANS = [
  {
    name: "FREE CHECKLIST",
    price: "Free",
    ctaLabel: "Download Free",
    ctaHref: "#checklist",
    featured: false,
  },
  {
    name: "CONFIDENCE REPORT",
    price: "$9.95",
    ctaLabel: "Get Report Now",
    ctaHref: CONFIDENCE_REPORT_LINK,
    featured: true,
  },
  {
    name: "FULL BUNDLE",
    price: "$39",
    ctaLabel: "Get Everything",
    ctaHref: FULL_BUNDLE_LINK,
    featured: false,
  },
];

export const LEAD_MAGNET_BULLETS = [
  "✓ 47-Point Inspection Guide",
  "✓ Negotiation Scripts That Work",
  "✓ Red Flags Every Aussie Should Know",
];
