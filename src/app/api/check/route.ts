import { NextResponse } from "next/server";
import { run_free_listing_check } from "@/lib/engine";
import { generateVehicleReport } from "@/lib/free-check-report";

export const runtime = "nodejs";

function is_valid_email(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normaliseString(value?: string) {
  return value?.trim() ?? "";
}

function parseOptionalNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/[^\d.]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      listing_url?: string;
      url?: string;
      make?: string;
      model?: string;
      year?: string | number;
      rego?: string;
      asking_price?: string | number;
    };

    const email = normaliseString(body.email);
    const listing_url = normaliseString(body.listing_url) || normaliseString(body.url);
    const make = normaliseString(body.make);
    const model = normaliseString(body.model);
    const year = parseOptionalNumber(body.year);
    const rego = normaliseString(body.rego);
    const asking_price = parseOptionalNumber(body.asking_price);

    if (listing_url) {
      if (!email) {
        return NextResponse.json(
          { ok: false, error: "Email is required to receive the report." },
          { status: 400 },
        );
      }

      if (!is_valid_email(email)) {
        return NextResponse.json(
          { ok: false, error: "Email must be valid." },
          { status: 400 },
        );
      }

      try {
        new URL(listing_url);
      } catch {
        return NextResponse.json(
          { ok: false, error: "Listing URL must be a valid URL." },
          { status: 400 },
        );
      }

      const result = await run_free_listing_check({ email, listing_url });

      const market_low = result.analysis.market_value_low;
      const market_high = result.analysis.market_value_high;
      const market_value_estimate =
        market_low && market_high
          ? `$${market_low.toLocaleString("en-AU")} - $${market_high.toLocaleString("en-AU")}`
          : "Pending review";

      return NextResponse.json({
        ok: true,
        listing_title: result.vehicle_summary || "Listing Summary",
        market_value_estimate,
        days_listed: result.analysis.days_listed ?? 0,
        red_flags: result.analysis.red_flags ?? [],
        verdict: result.analysis.listing_verdict || "Pending",
        negotiation_script: result.analysis.negotiation_script,
        vehicle: {
          make: result.listing.vehicle_make ?? undefined,
          model: result.listing.vehicle_model ?? undefined,
          year: result.listing.vehicle_year ?? undefined,
          rego: result.listing.vehicle_rego ?? undefined,
          asking_price: result.listing.vehicle_price_listed ?? undefined,
          source: "listing",
        },
      });
    }

    if (!make || !model || !year) {
      return NextResponse.json(
        { ok: false, error: "Enter at least make, model, and year for a useful snapshot." },
        { status: 400 },
      );
    }

    const report = await generateVehicleReport({
      make,
      model,
      year,
      rego: rego || undefined,
      asking_price: asking_price ?? undefined,
    });

    const listingTitle = `${year} ${make} ${model}`;

    return NextResponse.json({
      ok: true,
      listing_title: listingTitle,
      market_value_estimate: report.fair_price_range,
      days_listed: 0,
      red_flags: report.red_flags,
      verdict: report.verdict,
      report,
      vehicle: {
        make,
        model,
        year,
        rego: rego || undefined,
        asking_price: asking_price ?? undefined,
        source: "manual",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to process the listing check.",
      },
      { status: 500 },
    );
  }
}
