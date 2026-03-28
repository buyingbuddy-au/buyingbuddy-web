import { NextResponse } from "next/server";
import { run_placeholder_free_check } from "@/lib/free-check";

export const runtime = "nodejs";

function is_valid_email(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      listing_url?: string;
      url?: string;
    };
    const email = body.email?.trim() ?? "";
    const listing_url = body.listing_url?.trim() || body.url?.trim() || "";

    if (email && !is_valid_email(email)) {
      return NextResponse.json(
        { ok: false, error: "Email must be valid if you include it." },
        { status: 400 },
      );
    }

    if (!listing_url) {
      return NextResponse.json(
        { ok: false, error: "A listing URL is required." },
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

    const result = run_placeholder_free_check({
      email,
      listing_url,
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to process the listing check.",
      },
      { status: 500 },
    );
  }
}
