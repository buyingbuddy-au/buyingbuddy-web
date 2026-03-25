import type { ListingAnalysis, ScrapedListing } from "@/lib/types";

const RED_FLAG_RULES: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /\bno time wasters\b/i, message: "Aggressive seller language." },
  { pattern: /\burgent sale\b/i, message: "Urgency used to force a quick decision." },
  { pattern: /\bfirst to see will buy\b/i, message: "Pressure language in the listing." },
  { pattern: /\bwon'?t reply\b/i, message: "Seller signals low cooperation." },
  { pattern: /\bno rego\b/i, message: "Vehicle may need extra inspection before transfer." },
  { pattern: /\bunregistered\b/i, message: "Vehicle is listed as unregistered." },
  { pattern: /\bwrite[ -]?off\b/i, message: "Write-off history is mentioned in the ad." },
  { pattern: /\bfinance\b/i, message: "Finance is mentioned and should be cleared via PPSR." },
  { pattern: /\bneeds (?:nothing|minor work)\b/i, message: "Downplayed mechanical condition." },
  { pattern: /\bsold as is\b/i, message: "Seller is disclaiming responsibility." },
];

const MARKET_BASELINES = [
  { pattern: /mazda\s*3/i, low: 12000, high: 22000 },
  { pattern: /toyota\s*yaris/i, low: 10000, high: 19000 },
  { pattern: /haval\s*jolion/i, low: 18000, high: 28000 },
  { pattern: /mitsubishi\s*eclipse\s*cross/i, low: 20000, high: 32000 },
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function estimate_market_range(listing: ScrapedListing) {
  const summary = `${listing.vehicle_make ?? ""} ${listing.vehicle_model ?? ""}`.trim();
  const baseline =
    MARKET_BASELINES.find((entry) => entry.pattern.test(summary)) ?? null;

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

function estimate_days_listed(listing: ScrapedListing, red_flags: string[]) {
  if (/relisted|price drop|reduced/i.test(listing.description)) {
    return 21;
  }

  if (red_flags.length >= 3) {
    return 14;
  }

  if (listing.vehicle_price_listed && listing.vehicle_price_listed < 10000) {
    return 5;
  }

  return 7;
}

function build_listing_verdict(
  listing: ScrapedListing,
  red_flags: string[],
  market_value_low: number | null,
  market_value_high: number | null,
) {
  if (red_flags.length >= 3) {
    return "High-friction listing. Treat it as a manual review candidate before paying a deposit.";
  }

  if (
    listing.vehicle_price_listed &&
    market_value_low &&
    listing.vehicle_price_listed < market_value_low
  ) {
    return "The asking price is below the expected market band. Good opportunity if the PPSR and inspection come back clean.";
  }

  if (
    listing.vehicle_price_listed &&
    market_value_high &&
    listing.vehicle_price_listed > market_value_high
  ) {
    return "The asking price is above the expected market band. Push hard on condition and comparable sales before moving forward.";
  }

  return "The listing looks broadly normal on first pass. Still verify title, PPSR, and seller consistency before committing.";
}

function build_negotiation_script(
  listing: ScrapedListing,
  market_value_low: number | null,
) {
  if (!listing.vehicle_price_listed) {
    return null;
  }

  const target_price =
    market_value_low !== null
      ? Math.min(
          listing.vehicle_price_listed,
          Math.round((listing.vehicle_price_listed + market_value_low) / 2),
        )
      : Math.round(listing.vehicle_price_listed * 0.94);

  return [
    `Open by referencing similar ${listing.vehicle_make ?? "cars"} listed in the same price band.`,
    `Anchor near $${target_price.toLocaleString("en-AU")} and point to any missing history or vague wording in the ad.`,
    "If the seller pushes back, ask for service records, PPSR certificate, and roadworthy evidence before moving higher.",
  ].join(" ");
}

export function analyse_listing(listing: ScrapedListing): ListingAnalysis {
  const inspection_text = `${listing.title} ${listing.description}`;
  const red_flags = RED_FLAG_RULES.filter((rule) => rule.pattern.test(inspection_text)).map(
    (rule) => rule.message,
  );
  const market_range = estimate_market_range(listing);
  const days_listed = estimate_days_listed(listing, red_flags);
  const listing_verdict = build_listing_verdict(
    listing,
    red_flags,
    market_range.low,
    market_range.high,
  );

  return {
    market_value_low: market_range.low,
    market_value_high: market_range.high,
    days_listed,
    red_flags,
    listing_verdict,
    negotiation_script: build_negotiation_script(listing, market_range.low),
  };
}
