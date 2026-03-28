import type { FreeCheckApiResponse } from "@/lib/types";

/**
 * Attempt to fetch and extract real listing data from the URL.
 * Falls back to generic analysis if fetch fails (blocked, timeout, etc).
 */
async function scrape_listing_data(listing_url: string): Promise<{
  title: string | null;
  price: string | null;
  description: string | null;
  location: string | null;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(listing_url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!res.ok) return { title: null, price: null, description: null, location: null };

    const html = await res.text();

    // Extract OpenGraph and meta tags
    const og_title = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)?.[1] ??
                     html.match(/<meta\s+content="([^"]+)"\s+property="og:title"/i)?.[1];
    const og_desc = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i)?.[1] ??
                    html.match(/<meta\s+content="([^"]+)"\s+property="og:description"/i)?.[1];
    const page_title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];

    // Try to extract price from common patterns
    const price_match = html.match(/\$[\d,]+(?:\.\d{2})?/) ??
                       og_desc?.match(/\$[\d,]+(?:\.\d{2})?/) ??
                       og_title?.match(/\$[\d,]+(?:\.\d{2})?/);
    const price = price_match?.[0] ?? null;

    // Try location from common patterns
    const location_match = og_desc?.match(/(?:in|at|from|near)\s+([A-Z][a-zA-Z\s]+(?:QLD|NSW|VIC|SA|WA|TAS|NT|ACT))/i) ??
                          html.match(/<span[^>]*>([^<]*(?:QLD|NSW|VIC|SA|WA|TAS|NT|ACT)[^<]*)<\/span>/i);
    const location = location_match?.[1]?.trim() ?? null;

    const title = og_title ?? page_title ?? null;
    const description = og_desc ?? null;

    return { title, price, description, location };
  } catch {
    return { title: null, price: null, description: null, location: null };
  }
}

/**
 * Extract car details from a title string
 */
function parse_car_from_title(title: string): {
  year: string | null;
  make: string | null;
  model: string | null;
} {
  const year_match = title.match(/\b(19|20)\d{2}\b/);
  const year = year_match?.[0] ?? null;

  const makes = [
    "Toyota", "Mazda", "Hyundai", "Kia", "Honda", "Mitsubishi", "Nissan",
    "Ford", "Holden", "Subaru", "Suzuki", "Volkswagen", "BMW", "Mercedes",
    "Audi", "Lexus", "Isuzu", "Jeep", "Land Rover", "Range Rover",
    "Volvo", "Peugeot", "Renault", "Skoda", "MG", "GWM", "BYD",
    "Haval", "LDV", "Great Wall", "Chrysler", "Dodge", "RAM",
  ];

  const title_lower = title.toLowerCase();
  let make: string | null = null;
  for (const m of makes) {
    if (title_lower.includes(m.toLowerCase())) {
      make = m;
      break;
    }
  }

  // Try to grab the word after the make as the model
  let model: string | null = null;
  if (make) {
    const after_make = title_lower.split(make.toLowerCase())[1]?.trim();
    if (after_make) {
      model = after_make.split(/[\s,\-–|·]+/)[0]?.trim() ?? null;
      if (model) model = model.charAt(0).toUpperCase() + model.slice(1);
    }
  }

  return { year, make, model };
}

export async function run_free_check({
  email,
  listing_url,
}: {
  email: string;
  listing_url: string;
}): Promise<FreeCheckApiResponse> {
  const url = new URL(listing_url);
  const hostname = url.hostname.toLowerCase();

  // Detect platform
  let platform = "Unknown";
  if (hostname.includes("facebook.com") || hostname.includes("fb.com")) {
    platform = "Facebook Marketplace";
  } else if (hostname.includes("carsales.com.au")) {
    platform = "Carsales";
  } else if (hostname.includes("gumtree.com.au")) {
    platform = "Gumtree";
  } else if (hostname.includes("autotrader.com.au")) {
    platform = "AutoTrader";
  }

  // Try to scrape real data
  const scraped = await scrape_listing_data(listing_url);
  const car = scraped.title ? parse_car_from_title(scraped.title) : { year: null, make: null, model: null };

  const has_real_data = !!(scraped.title && scraped.title.length > 5);
  const car_name = [car.year, car.make, car.model].filter(Boolean).join(" ") || null;

  // Build listing title
  let listing_title: string;
  if (has_real_data && car_name) {
    listing_title = car_name;
  } else if (has_real_data && scraped.title) {
    listing_title = scraped.title.slice(0, 80);
  } else {
    listing_title = `${platform} Listing Analysis`;
  }

  // Build market value section
  let market_value_estimate: string;
  if (scraped.price) {
    market_value_estimate = `Listed at ${scraped.price}. Request a Dealer Review ($14.95) and we'll tell you if that's fair, overpriced, or a bargain based on current market data.`;
  } else {
    market_value_estimate = "Price not visible in the listing. A Dealer Review ($14.95) will give you an accurate market value estimate based on make, model, year, and condition.";
  }

  // Build red flags
  const red_flags: string[] = [];

  if (platform === "Facebook Marketplace") {
    red_flags.push("Facebook Marketplace has no seller verification — always check the seller's profile age and activity");
    red_flags.push("Request the VIN before inspecting — if they refuse, walk away");
  }
  if (platform === "Gumtree") {
    red_flags.push("Check how long the ad has been listed — if it's been months, ask why it hasn't sold");
    red_flags.push("Gumtree ads can be relisted to reset the date — ask the seller directly how long they've had it for sale");
  }
  if (scraped.price) {
    const price_num = parseInt(scraped.price.replace(/[$,]/g, ""));
    if (price_num < 5000) {
      red_flags.push(`At ${scraped.price}, this is a low-price listing — be extra cautious about mechanical condition, rego status, and hidden defects`);
    }
    if (price_num > 30000) {
      red_flags.push(`At ${scraped.price}, this is a significant purchase — a full PPSR check and mechanical inspection are essential before committing`);
    }
  }
  red_flags.push("Always run a PPSR check before committing — finance owing and write-off history won't show in photos");
  if (!red_flags.some(f => f.includes("too good"))) {
    red_flags.push("If the price seems too good to be true, it usually is");
  }

  // Build verdict
  let verdict: string;
  if (has_real_data && car_name && scraped.price) {
    verdict = `This ${car_name} is listed at ${scraped.price} on ${platform}.${scraped.location ? ` Located in ${scraped.location}.` : ""} Before making any offer, run a PPSR check ($4.95) to check for finance owing, stolen vehicle status, and write-off history. For a complete dealer-level opinion including what you should offer, upgrade to a Dealer Review ($14.95).`;
  } else if (has_real_data && scraped.title) {
    verdict = `This listing on ${platform} is for "${scraped.title.slice(0, 60)}".${scraped.price ? ` Listed at ${scraped.price}.` : ""} We recommend a PPSR check ($4.95) as a minimum before any private purchase. For a full dealer opinion, upgrade to a Dealer Review ($14.95).`;
  } else {
    verdict = `This listing is from ${platform !== "Unknown" ? platform : "an unrecognised platform"}. Before making any offer, we strongly recommend running a PPSR check ($4.95) to check for finance owing, stolen vehicle status, and write-off history. For a complete dealer-level opinion including what to offer, upgrade to a Dealer Review ($14.95).`;
  }

  return {
    listing_title,
    market_value_estimate,
    days_listed: 0,
    red_flags,
    verdict,
  };
}

// Keep old sync export for backwards compat during transition
export function run_placeholder_free_check(args: {
  email: string;
  listing_url: string;
}): FreeCheckApiResponse {
  const url = new URL(args.listing_url);
  const hostname = url.hostname.toLowerCase();
  let platform = "Unknown";
  if (hostname.includes("facebook.com") || hostname.includes("fb.com")) platform = "Facebook Marketplace";
  else if (hostname.includes("carsales.com.au")) platform = "Carsales";
  else if (hostname.includes("gumtree.com.au")) platform = "Gumtree";

  return {
    listing_title: `${platform} Listing Analysis`,
    market_value_estimate: "Request a Dealer Review ($14.95) for an accurate market value estimate.",
    days_listed: 0,
    red_flags: ["Always run a PPSR check before committing", "If the price seems too good to be true, it usually is"],
    verdict: `This listing is from ${platform}. Run a PPSR check ($4.95) before making any offer.`,
  };
}
