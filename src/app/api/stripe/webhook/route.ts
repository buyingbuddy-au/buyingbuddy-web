import type Stripe from "stripe";
import { NextResponse } from "next/server";
import {
  create_order_from_checkout_session,
  handle_refund,
} from "@/lib/engine";
import { get_stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = get_stripe();
  const raw_body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhook_secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  let event: Stripe.Event;

  try {
    if (webhook_secret) {
      if (!signature) {
        return NextResponse.json(
          { ok: false, error: "Missing Stripe signature." },
          { status: 400 },
        );
      }

      event = stripe.webhooks.constructEvent(raw_body, signature, webhook_secret);
    } else {
      event = JSON.parse(raw_body) as Stripe.Event;
      console.warn(
        "[BuyingBuddy] STRIPE_WEBHOOK_SECRET is not configured. Webhook signature verification is disabled.",
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to verify Stripe webhook.",
      },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await create_order_from_checkout_session(
          event.data.object as Stripe.Checkout.Session,
        );
        console.info(
          "[BuyingBuddy] 🤑 NEW ORDER — Stripe checkout completed. " +
            `Product: ${(event.data.object as Stripe.Checkout.Session).metadata?.product ?? "unknown"}, ` +
            `Email: ${(event.data.object as Stripe.Checkout.Session).customer_details?.email ?? "unknown"}, ` +
            `Listing: ${(event.data.object as Stripe.Checkout.Session).metadata?.listing_url ?? "none"}`,
        );
        break;
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        if (typeof charge.payment_intent === "string") {
          handle_refund(charge.payment_intent);
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ ok: true, received: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to process Stripe webhook.",
      },
      { status: 500 },
    );
  }
}
