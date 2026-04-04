import { NextResponse } from "next/server";
import { create_checkout_session } from "@/lib/stripe";
import { insert_deal } from "@/lib/db";

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
    const body = (await request.json()) as { email?: string };
    const customer_email = body.email?.trim() ?? "";

    if (!customer_email || !is_valid_email(customer_email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const id = "deal_" + crypto.randomUUID().slice(0, 12);

    // Create the deal BEFORE Stripe checkout so the room exists
    // even if the webhook is delayed after payment
    insert_deal({
      id,
      status: "draft",
      buyer_email: customer_email,
    });

    const session = await create_checkout_session({
      base_url: resolve_base_url(request),
      customer_email,
      deal_id: id,
      listing_url: "",
      product: "deal_room",
      vehicle_identifier: "",
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return NextResponse.json({
      ok: true,
      checkout_url: session.url,
      deal_id: id,
      session_id: session.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create Deal Room checkout.",
      },
      { status: 500 },
    );
  }
}
