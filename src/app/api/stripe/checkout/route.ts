import { NextResponse } from "next/server";
import { get_product_definition, get_stripe, is_paid_product } from "@/lib/stripe";

export const runtime = "nodejs";

function is_valid_email(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function resolve_base_url(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    return origin;
  }

  const forwarded_host = request.headers.get("x-forwarded-host");
  const host = forwarded_host || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      customer_name?: string;
      email?: string;
      listing_url?: string;
      product?: string;
      url?: string;
    };
    const customer_email = body.email?.trim() ?? "";
    const customer_name = body.customer_name?.trim() ?? null;
    const listing_url = body.listing_url?.trim() || body.url?.trim() || "";
    const product = body.product?.trim() ?? "";

    if (!is_paid_product(product)) {
      return NextResponse.json(
        { ok: false, error: "Unsupported product type." },
        { status: 400 },
      );
    }

    if (customer_email && !is_valid_email(customer_email)) {
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

    const stripe = get_stripe();
    const definition = get_product_definition(product);
    const metadata = {
      customer_email,
      customer_name: customer_name ?? "",
      listing_url,
      product,
    };
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ...(customer_email ? { customer_email } : {}),
      success_url: `${resolve_base_url(request)}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${resolve_base_url(request)}/?checkout=cancelled`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "aud",
            unit_amount: definition.price_cents,
            product_data: {
              name: definition.name,
              description: definition.description,
            },
          },
        },
      ],
      metadata,
      payment_intent_data: {
        metadata,
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return NextResponse.json({
      ok: true,
      session_id: session.id,
      checkout_url: session.url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to create checkout session.",
      },
      { status: 500 },
    );
  }
}
