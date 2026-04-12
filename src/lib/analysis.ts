import type { ListingAnalysis, ScrapedListing } from "@/lib/types";

// Three-tier red flag system
// 🔴 CRITICAL — walk-away signals, structural/legal/safety issues
// 🟡 WARNING  — investigate before committing
// 🔵 INFO     — worth noting, not a dealbreaker

const RED_FLAG_RULES: Array<{
  pattern: RegExp;
  message: string;
  tier: "critical" | "warning" | "info";
}> = [
  // CRITICAL — walk away unless resolved
  { pattern: /\bwrite[- ]?off\b/i, message: "🔴 Write-off history mentioned — run PPSR immediately.", tier: "critical" },
  { pattern: /\brebuilt\b/i, message: "🔴 'Rebuilt' in the listing — structural damage history likely.", tier: "critical" },
  { pattern: /\bflood.?damage\b/i, message: "🔴 Flood damage mentioned — electrical and rust risk is severe.", tier: "critical" },
  { pattern: /\bsalvage\b/i, message: "🔴 Salvage title — may not be legally roadworthy.", tier: "critical" },
  { pattern: /\bfinance owing\b/i, message: "🔴 Finance owing disclosed — PPSR check is non-negotiable.", tier: "critical" },
  { pattern: /\bno roadworthy\b/i, message: "🔴 No roadworthy — QLD transfer legally requires a safety cert.", tier: "critical" },
  { pattern: /\bencumbered\b/i, message: "🔴 Listed as encumbered — debt may transfer to buyer.", tier: "critical" },

  // WARNING — dig deeper before committing
  { pattern: /\bfinance\b/i, message: "🟡 Finance mentioned — verify via PPSR that it's been cleared.", tier: "warning" },
  { pattern: /\bno rego\b/i, message: "🟡 Unregistered — budget for rego, safety cert, and possible defects.", tier: "warning" },
  { pattern: /\bunregistered\b/i, message: "🟡 Unregistered — additional costs before driving legally.", tier: "warning" },
  { pattern: /\bsold as is\b/i, message: "🟡 'Sold as is' — seller disclaims all responsibility, inspect carefully.", tier: "warning" },
  { pattern: /\bneeds work\b/i, message: "🟡 Admitted mechanical issues — get a quote before agreeing on price.", tier: "warning" },
  { pattern: /\bhigh km\b/i, message: "🟡 High kilometres flagged by seller — check maintenance history.", tier: "warning" },
  { pattern: /\bminor damage\b/i, message: "🟡 Minor damage disclosed — inspect for underquoted repair scope.", tier: "warning" },
  { pattern: /\brepair\b/i, message: "🟡 Repair history mentioned — check for panel gaps or paint mismatch.", tier: "warning" },
  { pattern: /\bno service history\b/i, message: "🟡 No service history — high-risk for engine and gearbox condition.", tier: "warning" },
  { pattern: /\bimported\b/i, message: "🟡 Imported vehicle — verify compliance plate and PPSR separately.", tier: "warning" },

  // INFO — note it but don't panic
  { pattern: /\bno time wasters\b/i, message: "🔵 Aggressive seller tone — be prepared for a difficult negotiation.", tier: "info" },
  { pattern: /\burgent sale\b/i, message: "🔵 Urgency language — seller may be motivated, use it as negotiating leverage.", tier: "info" },
  { pattern: /\bfirst to see will buy\b/i, message: "🔵 Pressure language — don't rush, take your time on inspection.", tier: "info" },
  { pattern: /\bprice drop\b/i, message: "🔵 Price has been dropped — listing has been sitting for a while.", tier: "info" },
  { pattern: /\brelisted\b/i, message: "🔵 Relisted — previous buyer may have found issues, worth asking why.", tier: "info" },
  { pattern: /\bneeds (?:nothing|minor work)\b/i, message: "🔵 Downplayed condition — 'needs nothing' claims warrant inspection.", tier: "info" },
  { pattern: /\bwon'?t reply\b/i, message: "🔵 Seller signals low cooperation — expect friction.", tier: "info" },
  { pattern: /\bcash only\b/i, message: "🔵 Cash only — ensure you can verify title before handing over money.", tier: "info" },
  { pattern: /\binterstate\b/i, message: "🔵 Interstate vehicle — check QLD inspection/compliance requirements.", tier: "info" },
  { pattern: /\brecently serviced\b/i, message: "🔵 Vague 'recently serviced' — ask for receipts, not just their word.", tier: "info" },
  { pattern: /\bone owner\b/i, message: "🔵 'One owner' claim — verify against PPSR ownership history.", tier: "info" },
  { pattern: /\bno swap\b/i, message: "🔵 Not open to swap — seller wants clean cash exit, which is fine.", tier: "info" },
];

// Weighted scoring: critical flags cost 3 points, warnings cost 1, info costs 0
function calculate_risk_score(flags: Array<{ tier: "critical" | "warning" | "info" }>) {
  return flags.reduce((score, flag) => {
    if (flag.tier === "critical") return score + 3;
    if (flag.tier === "warning") return score + 1;
    return score;
  }, 0);
}

const MARKET_BASELINES: Array<{ pattern: RegExp; low: number; high: number }> = [
  { pattern: /toyota\s*yaris/i, low: 10000, high: 19000 },
  { pattern: /toyota\s*corolla/i, low: 12000, high: 24000 },
  { pattern: /toyota\s*camry/i, low: 14000, high: 28000 },
  { pattern: /toyota\s*rav\s*4/i, low: 22000, high: 48000 },
  { pattern: /toyota\s*hilux/i, low: 28000, high: 65000 },
  { pattern: /toyota\s*land\s*cruiser/i, low: 45000, high: 120000 },
  { pattern: /mazda\s*3/i, low: 12000, high: 22000 },
  { pattern: /mazda\s*cx-?5/i, low: 18000, high: 38000 },
  { pattern: /mazda\s*cx-?3/i, low: 14000, high: 28000 },
  { pattern: /ford\s*ranger/i, low: 25000, high: 65000 },
  { pattern: /ford\s*escape/i, low: 14000, high: 28000 },
  { pattern: /holden\s*commodore/i, low: 8000, high: 22000 },
  { pattern: /honda\s*civic/i, low: 12000, high: 24000 },
  { pattern: /honda\s*cr-?v/i, low: 16000, high: 35000 },
  { pattern: /hyundai\s*i30/i, low: 10000, high: 20000 },
  { pattern: /hyundai\s*tucson/i, low: 18000, high: 36000 },
  { pattern: /mitsubishi\s*outlander/i, low: 16000, high: 34000 },
  { pattern: /mitsubishi\s*eclipse\s*cross/i, low: 20000, high: 32000 },
  { pattern: /nissan\s*patrol/i, low: 25000, high: 70000 },
  { pattern: /nissan\s*x-?trail/i, low: 14000, high: 30000 },
  { pattern: /subaru\s*outback/i, low: 16000, high: 35000 },
  { pattern: /volkswagen\s*golf/i, low: 12000, high: 26000 },
  { pattern: /haval\s*jolion/i, low: 18000, high: 28000 },
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function estimate_market_range(listing: ScrapedListing) {
  const summary = `${listing.vehicle_make ?? ""} ${listing.vehicle_model ?? ""}`.trim();
  const baseline = MARKET_BASELINES.find((entry) => entry.pattern.test(summary)) ?? null;

  if (!baseline && listing.vehicle_price_listed) {
    const low = Math.round(listing.vehicle_price_listed * 0.9);
    const high = Math.round(listing.vehicle_price_listed * 1.1);
    return { low, high };
  }

  if (!baseline) {
    return { low: null, high: null };
  }

  let low = baseline.low;
  let high = baseline.high;

  if (listing.vehicle_year) {
    const age = new Date().getFullYear() - listing.vehicle_year;
    const adjustment = clamp(age * 700, 0, 9000);
    low = Math.max(3500, low - adjustment);
    high = Math.max(low + 1500, high - adjustment);
  }

  if (listing.vehicle_mileage) {
    const mileagePenalty = clamp(Math.floor(listing.vehicle_mileage / 20000) * 500, 0, 5000);
    low = Math.max(3000, low - mileagePenalty);
    high = Math.max(low + 1500, high - mileagePenalty);
  }

  return { low, high };
}

function estimate_days_listed(listing: ScrapedListing, risk_score: number) {
  if (/relisted|price drop|reduced/i.test(listing.description)) return 21;
  if (risk_score >= 6) return 14;
  if (listing.vehicle_price_listed && listing.vehicle_price_listed < 10000) return 5;
  return 7;
}

function build_listing_verdict(
  risk_score: number,
  critical_count: number,
  listing: ScrapedListing,
  market_value_low: number | null,
  market_value_high: number | null,
) {
  if (critical_count >= 1) {
    return "Walk-away risk. One or more critical issues found — do not commit money until these are cleared via PPSR or a mechanic.";
  }
  if (risk_score >= 4) {
    return "High-friction listing. Multiple warning signs require investigation before paying a deposit.";
  }
  if (listing.vehicle_price_listed && market_value_low && listing.vehicle_price_listed < market_value_low) {
    return "Below-market asking price. Good opportunity if PPSR and inspection come back clean — but below-market always warrants a closer look.";
  }
  if (listing.vehicle_price_listed && market_value_high && listing.vehicle_price_listed > market_value_high) {
    return "Above-market asking price. Comparable listings are cheaper — negotiate hard or find a better-value option.";
  }
  return "Listing looks broadly normal on first pass. Still verify title, PPSR, and seller consistency before committing.";
}

function build_negotiation_script(
  listing: ScrapedListing,
  risk_score: number,
  critical_count: number,
  market_value_low: number | null,
  market_value_high: number | null,
) {
  if (!listing.vehicle_price_listed) return null;

  const price = listing.vehicle_price_listed;
  const make = listing.vehicle_make ?? "this car";
  const isOverpriced = market_value_high && price > market_value_high;
  const isBelowMarket = market_value_low && price < market_value_low;

  // Critical flags → walk away script
  if (critical_count >= 1) {
    return `Don't negotiate yet. Tell the seller you need the PPSR result and/or a mechanic's report before you'll discuss price. If they push back, walk away — that's your answer.`;
  }

  // High risk → aggressive discount
  if (risk_score >= 4) {
    const target = Math.round(price * 0.85);
    return `Open at $${target.toLocaleString("en-AU")} and cite the specific concerns in the ad. Make it clear you've done your research. If they won't move more than 5%, ask for a fresh safety cert or PPSR certificate to offset the risk.`;
  }

  // Overpriced → strong position
  if (isOverpriced) {
    const target = market_value_low
      ? Math.round((market_value_low + price) / 2)
      : Math.round(price * 0.92);
    return `Ask price is above market. Reference at least 2 comparable ${make} listings at lower prices and open at $${target.toLocaleString("en-AU")}. Condition and missing history are your main leverage points.`;
  }

  // Below market → softer approach, don't blow a good deal
  if (isBelowMarket) {
    const target = Math.round(price * 0.97);
    return `This is priced below market — don't lowball aggressively or you'll lose it. A small offer around $${target.toLocaleString("en-AU")} is reasonable. Focus negotiation on getting a current safety cert or any outstanding service work covered.`;
  }

  // Standard
  const discountRate = risk_score >= 2 ? 0.92 : 0.94;
  const target = Math.round(price * discountRate);
  return `Start around $${target.toLocaleString("en-AU")}. Point to comparable ${make} listings and any vague details in the ad. If they don't budge, ask them to cover the cost of a pre-purchase inspection or safety cert.`;
}

export function analyse_listing(listing: ScrapedListing): ListingAnalysis {
  const inspection_text = `${listing.title} ${listing.description}`;

  const matched_flags = RED_FLAG_RULES.filter((rule) =>
    rule.pattern.test(inspection_text)
  );

  const red_flags = matched_flags.map((rule) => rule.message);
  const risk_score = calculate_risk_score(matched_flags);
  const critical_count = matched_flags.filter((f) => f.tier === "critical").length;
  const market_range = estimate_market_range(listing);
  const days_listed = estimate_days_listed(listing, risk_score);

  const listing_verdict = build_listing_verdict(
    risk_score,
    critical_count,
    listing,
    market_range.low,
    market_range.high,
  );

  const negotiation_script = build_negotiation_script(
    listing,
    risk_score,
    critical_count,
    market_range.low,
    market_range.high,
  );

  return {
    market_value_low: market_range.low,
    market_value_high: market_range.high,
    days_listed,
    red_flags,
    listing_verdict,
    negotiation_script,
  };
}
