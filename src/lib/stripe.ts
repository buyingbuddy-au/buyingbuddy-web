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
    name: "Hidden Quick Review",
    description: "Post-purchase listing review. Not a public launch product.",
    price_cents: 9900,
  },
  full_pack: {
    product: "full_pack",
    name: "Legacy Pack",
    description: "Legacy product retained for existing order compatibility.",
    price_cents: 999,
  },
  pdf: {
    product: "pdf",
    name: "PDF",
    description: "PPSR next-step guidance, QLD paperwork, and guided handover record.",
    price_cents: 999,
  },
  deal_room: {
    product: "deal_room",
    name: "Legacy PDF alias",
    description: "Legacy checkout slug retained for existing order compatibility.",
    price_cents: 999,
  },
};

let stripe_client: Stripe | null = null;

export type StripeKeyMode = "live" | "test" | "unknown";

export function get_stripe_key_mode(key: string | null | undefined): StripeKeyMode {
  const trimmed = key?.trim() ?? "";
  if (trimmed.startsWith("sk_live_") || trimmed.startsWith("pk_live_")) return "live";
  if (trimmed.startsWith("sk_test_") || trimmed.startsWith("pk_test_")) return "test";
  return "unknown";
}

export function get_configured_stripe_mode(): StripeKeyMode {
  const secret_mode = get_stripe_key_mode(process.env.STRIPE_SECRET_KEY);
  const publishable_mode = get_stripe_key_mode(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  if (secret_mode !== "unknown" && publishable_mode !== "unknown" && secret_mode !== publishable_mode) {
    throw new Error(
      `Stripe key mode mismatch: STRIPE_SECRET_KEY is ${secret_mode} but NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is ${publishable_mode}. Refusing to create checkout sessions.`,
    );
  }

  return secret_mode !== "unknown" ? secret_mode : publishable_mode;
}

export function get_stripe() {
  const secret_key = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secret_key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  get_configured_stripe_mode();

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

function is_pdf_product(product: PaidProductType) {
  return product === "pdf" || product === "deal_room";
}

export function normalise_public_product(product: PaidProductType): PaidProductType {
  return product === "deal_room" ? "pdf" : product;
}

export async function create_checkout_session({
  base_url,
  customer_email,
  customer_name,
  deal_id,
  listing_url,
  product,
  vehicle_identifier,
}: {
  base_url: string;
  customer_email: string;
  customer_name?: string | null;
  deal_id?: string | null;
  listing_url?: string | null;
  product: PaidProductType;
  vehicle_identifier?: string | null;
}) {
  const stripe = get_stripe();
  const normalized_product = normalise_public_product(product);
  const definition = get_product_definition(normalized_product);
  const pdf_product = is_pdf_product(normalized_product);

  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email,
    success_url:
      pdf_product && deal_id
        ? `${base_url}/pdf/${deal_id}`
        : `${base_url}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:
      pdf_product
        ? `${base_url}/pdf?checkout=cancelled`
        : `${base_url}/?checkout=cancelled`,
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
      buyer_email: pdf_product ? customer_email : "",
      customer_email,
      customer_name: customer_name ?? "",
      deal_id: deal_id ?? "",
      listing_url: listing_url ?? "",
      product: normalized_product,
      vehicle_identifier: vehicle_identifier?.trim() ?? "",
    },
    payment_intent_data: {
      metadata: {
        buyer_email: pdf_product ? customer_email : "",
        customer_email,
        customer_name: customer_name ?? "",
        deal_id: deal_id ?? "",
        listing_url: listing_url ?? "",
        product: normalized_product,
        vehicle_identifier: vehicle_identifier?.trim() ?? "",
      },
    },
  });
}
