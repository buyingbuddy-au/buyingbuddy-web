import Stripe from "stripe";
import type { PaidProductType, ProductDefinition } from "@/lib/types";

const PRODUCT_DEFINITIONS: Record<PaidProductType, ProductDefinition> = {
  ppsr: {
    product: "ppsr",
    name: "PPSR Report",
    description: "Manual PPSR review and report delivered by Buying Buddy.",
    price_cents: 495,
  },
  dealer_review: {
    product: "dealer_review",
    name: "Dealer Review",
    description: "Jordan reviews the listing and sends a straight verdict.",
    price_cents: 1495,
  },
  full_pack: {
    product: "full_pack",
    name: "Full Confidence Pack",
    description: "Dealer review, negotiation guidance, and confidence pack.",
    price_cents: 3495,
  },
};

let stripe_client: Stripe | null = null;

export function get_stripe() {
  const secret_key = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secret_key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  if (!stripe_client) {
    stripe_client = new Stripe(secret_key);
  }

  return stripe_client;
}

export function get_product_definition(product: PaidProductType) {
  return PRODUCT_DEFINITIONS[product];
}

export function is_paid_product(product: string): product is PaidProductType {
  return product in PRODUCT_DEFINITIONS;
}

export async function create_checkout_session({
  base_url,
  customer_email,
  customer_name,
  listing_url,
  product,
}: {
  base_url: string;
  customer_email: string;
  customer_name?: string | null;
  listing_url: string;
  product: PaidProductType;
}) {
  const stripe = get_stripe();
  const definition = get_product_definition(product);

  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email,
    success_url: `${base_url}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base_url}/?checkout=cancelled`,
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
    metadata: {
      customer_email,
      customer_name: customer_name ?? "",
      listing_url,
      product,
    },
    payment_intent_data: {
      metadata: {
        customer_email,
        customer_name: customer_name ?? "",
        listing_url,
        product,
      },
    },
  });
}
