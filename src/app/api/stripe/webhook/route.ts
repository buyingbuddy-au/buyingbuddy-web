import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { get_stripe } from "@/lib/stripe";
import { Resend } from "resend";

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
        return NextResponse.json({ ok: false, error: "Missing Stripe signature." }, { status: 400 });
      }
      event = stripe.webhooks.constructEvent(raw_body, signature, webhook_secret);
    } else {
      event = JSON.parse(raw_body) as Stripe.Event;
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Unable to verify Stripe webhook." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const product = session.metadata?.product ?? "unknown";
      const email = session.customer_details?.email ?? "unknown";
      const listing_url = session.metadata?.listing_url ?? "none";
      
      console.info(`[BuyingBuddy] NEW ORDER: Product: ${product}, Email: ${email}, Listing: ${listing_url}`);
      
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Buying Buddy <info@buyingbuddy.com.au>",
        to: "info@buyingbuddy.com.au",
        subject: `NEW ORDER PAID: ${product.toUpperCase()}`,
        html: `<h2>New Order Received!</h2>
               <p><strong>Product:</strong> ${product}</p>
               <p><strong>Customer Email:</strong> ${email}</p>
               <p><strong>Listing URL:</strong> <a href="${listing_url}">${listing_url}</a></p>
               <p><strong>Action required:</strong> This is a manual MVP order. Please review the listing, run the necessary checks, and email the customer directly.</p>`
      });
    }

    return NextResponse.json({ ok: true, received: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Webhook error" }, { status: 500 });
  }
}
