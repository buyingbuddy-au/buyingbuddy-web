import type Stripe from "stripe";
import { generate_deal_summary_pdf } from "@/lib/deal-pdf";
import {
  get_deal_by_id,
  get_deal_by_stripe_session_id,
  get_deals_by_email,
  get_deal_by_email_and_rego,
  insert_deal,
  to_public_deal_record,
  to_sqlite_datetime,
  update_deal,
} from "@/lib/db";
import { send_deal_summary_email } from "@/lib/email";
import type {
  DealBuyerUpdateInput,
  DealListItem,
  DealPublicRecord,
  DealRecord,
  DealSellerUpdateInput,
  DealStatus,
} from "@/lib/types";

function normalise_text(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalise_upload(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalise_flag(value: boolean | number | null | undefined) {
  if (value === undefined) return undefined;
  return value ? 1 : 0;
}

function has_value(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function buyer_is_complete(deal: DealRecord) {
  return [
    deal.buyer_name,
    deal.buyer_email,
    deal.buyer_phone,
    deal.buyer_licence_url,
    deal.vehicle_make,
    deal.vehicle_model,
    deal.vehicle_year,
    deal.vehicle_vin,
    deal.vehicle_rego,
    deal.agreed_price,
    deal.payment_method,
    deal.conditions,
    deal.handover_date,
    deal.handover_location,
  ].every(has_value);
}

function seller_payment_ready(deal: DealRecord) {
  if (deal.payment_method === "bank_transfer") {
    return has_value(deal.seller_bank_bsb) && has_value(deal.seller_bank_account);
  }
  if (deal.payment_method === "payid") {
    return has_value(deal.seller_payid);
  }
  return true;
}

function seller_is_complete(deal: DealRecord) {
  return (
    [
      deal.seller_name,
      deal.seller_email,
      deal.seller_phone,
      deal.seller_licence_url,
      deal.seller_rego_papers_url,
      deal.seller_safety_cert_url,
    ].every(has_value) &&
    deal.seller_confirmed_price === 1 &&
    deal.seller_confirmed_conditions === 1 &&
    seller_payment_ready(deal)
  );
}

function resolve_deal_status({
  buyer_complete,
  current_status,
  seller_complete,
}: {
  buyer_complete: boolean;
  current_status: DealStatus;
  seller_complete: boolean;
}) {
  if (current_status === "finalised") return "finalised";
  if (buyer_complete && seller_complete) return "both_complete";
  if (buyer_complete) return "buyer_complete";
  if (seller_complete) return "seller_invited";
  return current_status === "draft" ? "draft" : "buyer_paid";
}

function with_completion_state(
  current_deal: DealRecord,
  updates: Partial<DealRecord>,
) {
  const merged_deal = { ...current_deal };
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      Object.assign(merged_deal, { [key]: value });
    }
  }

  const buyer_complete = buyer_is_complete(merged_deal);
  const seller_complete = seller_is_complete(merged_deal);
  const completion_updates: Partial<DealRecord> = {
    buyer_completed_at: buyer_complete
      ? current_deal.buyer_completed_at ?? to_sqlite_datetime()
      : null,
    seller_completed_at: seller_complete
      ? current_deal.seller_completed_at ?? to_sqlite_datetime()
      : null,
    status: resolve_deal_status({
      buyer_complete,
      current_status: current_deal.status,
      seller_complete,
    }),
  };

  return { ...updates, ...completion_updates };
}

function ensure_deal_editable(deal: DealRecord) {
  if (deal.status === "finalised") {
    throw new Error("Deal is already finalised.");
  }
}

export async function get_public_deal_by_id(id: string): Promise<DealPublicRecord | null> {
  const deal = await get_deal_by_id(id);
  return deal ? to_public_deal_record(deal) : null;
}

export async function create_deal_from_checkout_session(
  session: Stripe.Checkout.Session,
) {
  const existing_deal = await get_deal_by_stripe_session_id(session.id);
  if (existing_deal) return existing_deal;

  const deal_id =
    session.metadata?.deal_id?.trim() ||
    `deal_${crypto.randomUUID().slice(0, 12)}`;
  const buyer_email =
    session.customer_details?.email?.trim() ||
    session.metadata?.buyer_email?.trim() ||
    session.metadata?.customer_email?.trim() ||
    null;

  const deal_by_id = await get_deal_by_id(deal_id);
  if (deal_by_id) {
    return (await update_deal(deal_by_id.id, {
      buyer_email: buyer_email ?? deal_by_id.buyer_email,
      status: deal_by_id.status === "draft" ? "buyer_paid" : deal_by_id.status,
      stripe_session_id: session.id,
    }))!;
  }

  return (await insert_deal({
    id: deal_id,
    status: "buyer_paid",
    stripe_session_id: session.id,
    buyer_email,
  }))!;
}

export async function update_buyer_deal_section(
  deal_id: string,
  input: DealBuyerUpdateInput,
) {
  const deal = await get_deal_by_id(deal_id);
  if (!deal) throw new Error("Deal not found.");
  ensure_deal_editable(deal);

  const updates: Partial<DealRecord> = {
    buyer_name: normalise_text(input.buyer_name),
    buyer_email: normalise_text(input.buyer_email),
    buyer_phone: normalise_text(input.buyer_phone),
    buyer_address: normalise_text(input.buyer_address),
    buyer_licence_url: normalise_upload(input.buyer_licence),
    vehicle_make: normalise_text(input.vehicle_make),
    vehicle_model: normalise_text(input.vehicle_model),
    vehicle_year: normalise_text(input.vehicle_year),
    vehicle_vin: normalise_text(input.vehicle_vin),
    vehicle_rego: normalise_text(input.vehicle_rego),
    vehicle_km: normalise_text(input.vehicle_km),
    vehicle_colour: normalise_text(input.vehicle_colour),
    vehicle_transmission: normalise_text(input.vehicle_transmission),
    asking_price: normalise_text(input.asking_price),
    offered_price: normalise_text(input.offered_price),
    agreed_price: normalise_text(input.agreed_price),
    deposit_amount: normalise_text(input.deposit_amount),
    payment_method: normalise_text(input.payment_method),
    conditions: normalise_text(input.conditions),
    handover_date: normalise_text(input.handover_date),
    handover_location: normalise_text(input.handover_location),
    notes: normalise_text(input.notes),
  };

  const updated_deal = await update_deal(deal.id, with_completion_state(deal, updates));
  if (!updated_deal) throw new Error("Deal not found.");
  return updated_deal;
}

export async function update_seller_deal_section(
  deal_id: string,
  input: DealSellerUpdateInput,
) {
  const deal = await get_deal_by_id(deal_id);
  if (!deal) throw new Error("Deal not found.");
  ensure_deal_editable(deal);

  const updates: Partial<DealRecord> = {
    seller_name: normalise_text(input.seller_name),
    seller_email: normalise_text(input.seller_email),
    seller_phone: normalise_text(input.seller_phone),
    seller_address: normalise_text(input.seller_address),
    seller_licence_url: normalise_upload(input.seller_licence),
    seller_rego_papers_url: normalise_upload(input.seller_rego_papers),
    seller_safety_cert_url: normalise_upload(input.seller_safety_cert),
    seller_bank_bsb: normalise_text(input.seller_bank_bsb),
    seller_bank_account: normalise_text(input.seller_bank_account),
    seller_payid: normalise_text(input.seller_payid),
    seller_confirmed_price: normalise_flag(input.seller_confirmed_price),
    seller_confirmed_conditions: normalise_flag(input.seller_confirmed_conditions),
  };

  const updated_deal = await update_deal(deal.id, with_completion_state(deal, updates));
  if (!updated_deal) throw new Error("Deal not found.");
  return updated_deal;
}

export async function finalise_deal_record({
  base_url,
  deal_id,
}: {
  base_url: string;
  deal_id: string;
}) {
  const deal = await get_deal_by_id(deal_id);
  if (!deal) throw new Error("Deal not found.");
  if (deal.status === "finalised") return deal;

  if (!buyer_is_complete(deal) || !seller_is_complete(deal)) {
    throw new Error("Both buyer and seller sections must be complete before finalising.");
  }
  if (!deal.buyer_email || !deal.seller_email) {
    throw new Error("Both buyer and seller emails are required before finalising.");
  }

  const report = await generate_deal_summary_pdf({
    ...deal,
    finalised_at: to_sqlite_datetime(),
  });
  const deal_url = `${base_url}/deal/${deal.id}`;

  await send_deal_summary_email({
    buyer_email: deal.buyer_email,
    deal_id: deal.id,
    deal_url,
    report_buffer: report.buffer,
    report_filename: report.filename,
    seller_email: deal.seller_email,
  });

  const finalised_deal = await update_deal(deal.id, {
    finalised_at: to_sqlite_datetime(),
    status: "finalised",
    summary_pdf_url: report.filename,
  });
  if (!finalised_deal) throw new Error("Deal not found.");
  return finalised_deal;
}

export async function list_deals_for_email(email: string): Promise<DealListItem[]> {
  const deals = await get_deals_by_email(email);
  return deals.map((d) => ({
    id: d.id,
    created_at: d.created_at,
    updated_at: d.updated_at,
    status: d.status,
    vehicle_make: d.vehicle_make,
    vehicle_model: d.vehicle_model,
    vehicle_year: d.vehicle_year,
    vehicle_rego: d.vehicle_rego,
    agreed_price: d.agreed_price,
  }));
}

export async function find_or_create_deal(email: string, rego: string): Promise<DealRecord> {
  const existing = await get_deal_by_email_and_rego(email, rego);
  if (existing) return existing;

  const deal_id = `deal_${crypto.randomUUID().slice(0, 12)}`;
  const deal = await insert_deal({
    id: deal_id,
    status: "buyer_paid",
    buyer_email: email,
    vehicle_rego: rego.toUpperCase(),
  });
  if (!deal) throw new Error("Could not create deal room.");
  return deal;
}
