import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { get_stripe } from "@/lib/stripe";
import { create_deal_from_checkout_session } from "@/lib/deals";
import { create_order_from_checkout_session } from "@/lib/engine";
import {
  send_deal_room_buyer_email,
  send_ppsr_confirmation_email,
} from "@/lib/email";
import { Resend } from "resend";

export const runtime = "nodejs";

async function send_telegram_ppsr_notification({
  order_id,
  customer_email,
  vehicle_identifier,
}: {
  order_id: string;
  customer_email: string;
  vehicle_identifier: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();

  if (!token) {
    console.warn("[BuyingBuddy] TELEGRAM_BOT_TOKEN missing. PPSR notification skipped.");
    return;
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: "1296786949",
      text:
        `🔔 NEW PPSR ORDER\nVIN/Rego: ${vehicle_identifier}\nCustomer: ${customer_email}\nOrder ID: ${order_id}\n\nDo the $2 PPSR search at ppsr.gov.au and email the result to the customer.`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram notification failed: ${response.status} ${body}`);
  }
}

async function send_telegram_deal_room_notification({
  buyer_email,
  deal_id,
  deal_url,
}: {
  buyer_email: string;
  deal_id: string;
  deal_url: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();

  if (!token) {
    console.warn("[BuyingBuddy] TELEGRAM_BOT_TOKEN missing. Deal Room notification skipped.");
    return;
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: "1296786949",
      text:
        `NEW DEAL ROOM\nDeal ID: ${deal_id}\nBuyer: ${buyer_email}\nRoom: ${deal_url}`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram notification failed: ${response.status} ${body}`);
  }
}

function resolve_public_base_url() {
  const configured_url =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "https://buyingbuddy.com.au";

  if (configured_url.startsWith("http://") || configured_url.startsWith("https://")) {
    return configured_url;
  }

  return `https://${configured_url}`;
}

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
      try {
        const session_product = session.metadata?.product?.trim() ?? "";

        if (session_product === "deal_room") {
          const deal = await create_deal_from_checkout_session(session);
          const buyer_email = deal.buyer_email?.trim() ?? "";
          const deal_url = `${resolve_public_base_url()}/deal/${deal.id}`;

          if (!buyer_email) {
            throw new Error("Stripe Deal Room session is missing buyer email.");
          }

          await send_deal_room_buyer_email({
            buyer_email,
            deal_id: deal.id,
            deal_url,
          });

          await send_telegram_deal_room_notification({
            buyer_email,
            deal_id: deal.id,
            deal_url,
          });

          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: "Buying Buddy <info@buyingbuddy.com.au>",
            to: "info@buyingbuddy.com.au",
            subject: "NEW DEAL ROOM PAID",
            html: `<h2>New Deal Room Created</h2>
                   <p><strong>Deal ID:</strong> ${deal.id}</p>
                   <p><strong>Buyer Email:</strong> ${buyer_email}</p>
                   <p><strong>Room Link:</strong> <a href="${deal_url}">${deal_url}</a></p>`,
          });

          console.info(
            `[BuyingBuddy] NEW DEAL ROOM SAVED: Deal ID: ${deal.id}, Buyer: ${buyer_email}`,
          );
          return NextResponse.json({ ok: true, received: true });
        }

        const order = await create_order_from_checkout_session(session);
        const product = order.product;
        
        const email = order.customer_email;
        const listing_url = order.listing_url ?? "none";
        
        if (product === "ppsr") {
          const vehicle_identifier =
            order.vehicle_identifier ||
            order.vehicle_vin ||
            order.vehicle_rego ||
            session.metadata?.vehicle_identifier?.trim() ||
            "Not supplied";

          await send_telegram_ppsr_notification({
            order_id: order.id,
            customer_email: email,
            vehicle_identifier,
          });

          await send_ppsr_confirmation_email({
            email,
            order_id: order.id,
            vehicle_identifier,
          });
        }
        
        console.info(`[BuyingBuddy] NEW ORDER SAVED: Product: ${product}, Email: ${email}, Listing: ${listing_url}`);
        
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Buying Buddy <info@buyingbuddy.com.au>",
          to: "info@buyingbuddy.com.au",
          subject: `NEW ORDER PAID: ${product.toUpperCase()}`,
          html: `<h2>New Order Received & Saved!</h2>
                 <p><strong>Order ID:</strong> ${order.id}</p>
                 <p><strong>Product:</strong> ${product}</p>
                 <p><strong>Customer Email:</strong> ${email}</p>
                 <p><strong>Listing URL:</strong> <a href="${listing_url}">${listing_url}</a></p>
                 <p><strong>Action required:</strong> Please review the listing, run the necessary checks, and fulfill the order via the Admin Dashboard.</p>`
        });
      } catch (e) {
        console.error("Failed to create order from session:", e);
        throw e;
      }
    }

    return NextResponse.json({ ok: true, received: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Webhook error" }, { status: 500 });
  }
}
