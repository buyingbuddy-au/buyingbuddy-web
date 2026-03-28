import type { FreeCheckApiResponse } from "@/lib/types";

/**
 * Stateless free listing check for MVP.
 * Extracts what we can from the URL itself and returns a useful placeholder analysis.
 * No database, no scraping API — just smart URL parsing and helpful guidance.
 */
export function run_placeholder_free_check({
  email,
  listing_url,
}: {
  email: string;
  listing_url: string;
}): FreeCheckApiResponse {
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

  // Try to extract info from the URL path
  const path = decodeURIComponent(url.pathname).replace(/[-_/]+/g, " ").trim();

  // Generate a helpful response
  const red_flags: string[] = [];

  if (platform === "Facebook Marketplace") {
    red_flags.push(
      "Facebook Marketplace has no seller verification — always check the seller's profile age and activity"
    );
    red_flags.push(
      "Request the VIN before inspecting — if they refuse, walk away"
    );
  }

  if (platform === "Gumtree") {
    red_flags.push(
      "Check how long the ad has been listed — if it's been months, ask why it hasn't sold"
    );
  }

  red_flags.push(
    "Always run a PPSR check before committing — finance owing and write-off history won't show in photos"
  );
  red_flags.push(
    "If the price seems too good to be true, it usually is"
  );

  return {
    listing_title: `${platform} Listing Analysis`,
    market_value_estimate:
      "Request a Dealer Review ($14.95) for an accurate market value estimate based on make, model, year, and condition.",
    days_listed: 0,
    red_flags,
    verdict:
      platform !== "Unknown"
        ? `This listing is from ${platform}. Before making any offer, we strongly recommend running a PPSR check ($4.95) to check for finance owing, stolen vehicle status, and write-off history. For a complete dealer-level opinion including what to offer, upgrade to a Dealer Review ($14.95).`
        : "We couldn't identify the listing platform. Make sure you paste a direct link from Facebook Marketplace, Carsales, or Gumtree. A PPSR check ($4.95) is the minimum due diligence before any private purchase.",
  };
}
