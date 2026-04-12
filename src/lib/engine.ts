import { randomUUID } from "node:crypto";
import type Stripe from "stripe";
import { analyse_listing } from "@/lib/analysis";
import {
  get_dashboard_payload,
  get_order_by_id,
  get_order_by_stripe_session_id,
  insert_order,
  link_email_capture_to_order,
  mark_order_refunded,
  to_sqlite_datetime,
  update_order,
  upsert_email_capture,
} from "@/lib/db";
import { send_free_check_email, send_order_report_email } from "@/lib/email";
import { generate_order_report } from "@/lib/pdf";
import { scrape_listing } from "@/lib/scraper";
import { get_product_definition, is_paid_product } from "@/lib/stripe";
import type {
  FreeCheckResult,
  JsonValue,
  OrderRecord,
  OrderReviewInput,
} from "@/lib/types";

function build_vehicle_summary(order: {
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vehicle_price_listed?: number | null;
  vehicle_mileage?: number | null;
}) {
  const parts = [order.vehicle_year, order.vehicle_make, order.vehicle_model]
    .filter(Boolean)
    .join(" ");
  const details = [
    order.vehicle_price_listed ? `$${order.vehicle_price_listed.toLocaleString("en-AU")}` : null,
    order.vehicle_mileage ? `${order.vehicle_mileage.toLocaleString("en-AU")} km` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  if (!parts && !details) {
    return "Vehicle details pending";
  }

  return [parts || "Vehicle details pending", details].filter(Boolean).join(" | ");
}

function normalise_ppsr_result(value: JsonValue | null | string | undefined) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as JsonValue;
  } catch {
    return { notes: trimmed } satisfies JsonValue;
  }
}

export async function run_free_listing_check({
  email,
  listing_url,
}: {
  email: string;
  listing_url: string;
}) {
  const listing = await scrape_listing(listing_url);
  const analysis = analyse_listing(listing);
  const vehicle_summary = build_vehicle_summary({
    vehicle_make: listing.vehicle_make,
    vehicle_model: listing.vehicle_model,
    vehicle_year: listing.vehicle_year,
    vehicle_price_listed: listing.vehicle_price_listed,
    vehicle_mileage: listing.vehicle_mileage,
  });

  let capture: Awaited<ReturnType<typeof upsert_email_capture>> = null;
  try {
    capture = await upsert_email_capture({
      id: randomUUID(),
      email,
      listing_url,
      vehicle_summary,
    });
  } catch {
    // DB write failed — continue without persisting
  }

  try {
    await send_free_check_email({
      email,
      listing_url,
      verdict: analysis.listing_verdict,
      vehicle_summary,
      market_value_low: analysis.market_value_low,
      market_value_high: analysis.market_value_high,
      red_flags: analysis.red_flags,
    });
  } catch {
    // Email send failed — don't block the check result
  }

  return {
    capture: capture!,
    listing,
    analysis,
    vehicle_summary,
  } satisfies FreeCheckResult;
}

export async function create_order_from_checkout_session(session: Stripe.Checkout.Session) {
  const existing_order = await get_order_by_stripe_session_id(session.id);
  if (existing_order) {
    return existing_order;
  }

  const product = session.metadata?.product ?? "";
  if (!is_paid_product(product)) {
    throw new Error(`Unsupported product type in checkout session: ${product}`);
  }

  const listing_url = session.metadata?.listing_url?.trim() || null;
  const vehicle_identifier = session.metadata?.vehicle_identifier?.trim() || null;
  const customer_email =
    session.customer_details?.email?.trim() ||
    session.metadata?.customer_email?.trim() ||
    "";

  if (!customer_email) {
    throw new Error("Stripe session is missing a customer email.");
  }

  const customer_name =
    session.customer_details?.name?.trim() ||
    session.metadata?.customer_name?.trim() ||
    null;

  const scraped_listing = listing_url ? await scrape_listing(listing_url) : null;
  const analysis = scraped_listing ? analyse_listing(scraped_listing) : null;
  const looks_like_vin = vehicle_identifier
    ? /^[A-HJ-NPR-Z0-9]{11,17}$/i.test(vehicle_identifier.replace(/\s+/g, ""))
    : false;
  const definition = get_product_definition(product);
  const order = await insert_order({
    id: randomUUID(),
    status: "awaiting_review",
    product,
    price_cents: session.amount_total ?? definition.price_cents,
    customer_email,
    customer_name,
    stripe_session_id: session.id,
    stripe_payment_intent:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
    listing_url,
    vehicle_identifier,
    vehicle_make: scraped_listing?.vehicle_make ?? null,
    vehicle_model: scraped_listing?.vehicle_model ?? null,
    vehicle_year: scraped_listing?.vehicle_year ?? null,
    vehicle_rego: scraped_listing?.vehicle_rego ?? (!looks_like_vin ? vehicle_identifier : null),
    vehicle_vin: scraped_listing?.vehicle_vin ?? (looks_like_vin ? vehicle_identifier : null),
    vehicle_mileage: scraped_listing?.vehicle_mileage ?? null,
    vehicle_price_listed: scraped_listing?.vehicle_price_listed ?? null,
    market_value_low: analysis?.market_value_low ?? null,
    market_value_high: analysis?.market_value_high ?? null,
    days_listed: analysis?.days_listed ?? null,
    red_flags: analysis?.red_flags ?? [],
    listing_verdict: analysis?.listing_verdict ?? null,
    negotiation_script: analysis?.negotiation_script ?? null,
    contract_included: product === "full_pack" ? 1 : 0,
  });

  await link_email_capture_to_order(customer_email, order!.id);

  return order!;
}

export async function get_dashboard_data() {
  return get_dashboard_payload();
}

export async function save_order_review(order_id: string, input: OrderReviewInput) {
  const existing_order = await get_order_by_id(order_id);

  if (!existing_order) {
    throw new Error("Order not found.");
  }

  const dealer_verdict = input.dealer_verdict?.trim() || null;
  const ppsr_result = normalise_ppsr_result(
    input.ppsr_result as JsonValue | null | string | undefined,
  );
  const updates: Partial<OrderRecord> = {
    status:
      existing_order.status === "complete" || existing_order.status === "refunded"
        ? existing_order.status
        : "awaiting_review",
  };

  if (dealer_verdict !== undefined) {
    updates.dealer_verdict = dealer_verdict;
    updates.dealer_reviewed_at = dealer_verdict ? to_sqlite_datetime() : null;
  }

  if (ppsr_result !== undefined) {
    updates.ppsr_result = ppsr_result;
    updates.ppsr_checked_at = ppsr_result ? to_sqlite_datetime() : null;
  }

  return update_order(order_id, updates);
}

export async function send_order_deliverables(order_id: string) {
  const order = await get_order_by_id(order_id);

  if (!order) {
    throw new Error("Order not found.");
  }

  const report = await generate_order_report(order);
  await send_order_report_email({
    email: order.customer_email,
    order_id: order.id,
    report_buffer: report.buffer,
    report_filename: report.filename,
    product: order.product,
  });

  return update_order(order.id, {
    status: "complete",
    report_pdf_path: report.filename,
    report_sent_at: to_sqlite_datetime(),
  });
}

export async function handle_refund(payment_intent: string) {
  return mark_order_refunded(payment_intent);
}
