import { NextResponse } from "next/server";
import { find_or_create_deal } from "@/lib/deals";

export const runtime = "nodejs";

function is_valid_email(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function resolve_base_url(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) return origin;

  const forwarded_host = request.headers.get("x-forwarded-host");
  const host = forwarded_host || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "http";

  if (host) return `${protocol}://${host}`;
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; rego?: string };
    const email = body.email?.trim() ?? "";
    const rego = body.rego?.trim().toUpperCase() ?? "";

    if (!email || !is_valid_email(email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (!rego || rego.length < 2) {
      return NextResponse.json(
        { ok: false, error: "Please enter the vehicle rego number." },
        { status: 400 },
      );
    }

    const deal = await find_or_create_deal(email, rego);
    const base = resolve_base_url(request);

    return NextResponse.json({
      ok: true,
      deal_id: deal.id,
      room_url: `${base}/deal/${deal.id}`,
      is_existing: Boolean(deal.buyer_name),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create Deal Room.",
      },
      { status: 500 },
    );
  }
}
