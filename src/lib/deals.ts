import type Stripe from "stripe";
import { generate_deal_summary_pdf } from "@/lib/deal-pdf";
import {
  get_deal_by_id,
  get_deal_by_stripe_session_id,
  insert_deal,
  to_public_deal_record,
  to_sqlite_datetime,
  update_deal,
} from "@/lib/db";
import { send_deal_summary_email } from "@/lib/email";
import type {
  DealBuyerUpdateInput,
  DealPublicRecord,
  DealRecord,
  DealSellerUpdateInput,
  DealStatus,
} from "@/lib/types";

function normalise_text(value: string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalise_upload(value: string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalise_flag(value: boolean | number | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

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
  if (current_status === "finalised") {
    return "finalised";
  }

  if (buyer_complete && seller_complete) {
    return "both_complete";
  }

  if (buyer_complete) {
    return "buyer_complete";
  }

  if (seller_complete) {
    return "seller_invited";
  }

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

  return {
    ...updates,
    ...completion_updates,
  };
}

function ensure_deal_editable(deal: DealRecord) {
  if (deal.status === "finalised") {
    throw new Error("Deal is already finalised.");
  }
}

export function get_public_deal_by_id(id: string): DealPublicRecord | null {
  const deal = get_deal_by_id(id);
  return deal ? to_public_deal_record(deal) : null;
}

export async function create_deal_from_checkout_session(
  session: Stripe.Checkout.Session,
) {
  const existing_deal = get_deal_by_stripe_session_id(session.id);
  if (existing_deal) {
    return existing_deal;
  }

  const deal_id =
    session.metadata?.deal_id?.trim() ||
    `deal_${crypto.randomUUID().slice(0, 12)}`;
  const buyer_email =
    session.customer_details?.email?.trim() ||
    session.metadata?.buyer_email?.trim() ||
    session.metadata?.customer_email?.trim() ||
    null;

  const deal_by_id = get_deal_by_id(deal_id);
  if (deal_by_id) {
    return update_deal(deal_by_id.id, {
      buyer_email: buyer_email ?? deal_by_id.buyer_email,
      status: deal_by_id.status === "draft" ? "buyer_paid" : deal_by_id.status,
      stripe_session_id: session.id,
    })!;
  }

  return insert_deal({
    id: deal_id,
    status: "buyer_paid",
    stripe_session_id: session.id,
    buyer_email,
  })!;
}

export function update_buyer_deal_section(
  deal_id: string,
  input: DealBuyerUpdateInput,
) {
  const deal = get_deal_by_id(deal_id);

  if (!deal) {
    throw new Error("Deal not found.");
  }

  ensure_deal_editable(deal);

  const updates: Partial<DealRecord> = {
    buyer_name: normalise_text(input.buyer_name),
    buyer_email: normalise_text(input.buyer_email),
    buyer_phone: normalise_text(input.buyer_phone),
    buyer_licence_url: normalise_upload(input.buyer_licence),
    vehicle_make: normalise_text(input.vehicle_make),
    vehicle_model: normalise_text(input.vehicle_model),
    vehicle_year: normalise_text(input.vehicle_year),
    vehicle_vin: normalise_text(input.vehicle_vin),
    vehicle_rego: normalise_text(input.vehicle_rego),
    agreed_price: normalise_text(input.agreed_price),
    payment_method: normalise_text(input.payment_method),
    conditions: normalise_text(input.conditions),
    handover_date: normalise_text(input.handover_date),
    handover_location: normalise_text(input.handover_location),
  };

  const updated_deal = update_deal(deal.id, with_completion_state(deal, updates));

  if (!updated_deal) {
    throw new Error("Deal not found.");
  }

  return updated_deal;
}

export function update_seller_deal_section(
  deal_id: string,
  input: DealSellerUpdateInput,
) {
  const deal = get_deal_by_id(deal_id);

  if (!deal) {
    throw new Error("Deal not found.");
  }

  ensure_deal_editable(deal);

  const updates: Partial<DealRecord> = {
    seller_name: normalise_text(input.seller_name),
    seller_email: normalise_text(input.seller_email),
    seller_phone: normalise_text(input.seller_phone),
    seller_licence_url: normalise_upload(input.seller_licence),
    seller_rego_papers_url: normalise_upload(input.seller_rego_papers),
    seller_safety_cert_url: normalise_upload(input.seller_safety_cert),
    seller_bank_bsb: normalise_text(input.seller_bank_bsb),
    seller_bank_account: normalise_text(input.seller_bank_account),
    seller_payid: normalise_text(input.seller_payid),
    seller_confirmed_price: normalise_flag(input.seller_confirmed_price),
    seller_confirmed_conditions: normalise_flag(
      input.seller_confirmed_conditions,
    ),
  };

  const updated_deal = update_deal(deal.id, with_completion_state(deal, updates));

  if (!updated_deal) {
    throw new Error("Deal not found.");
  }

  return updated_deal;
}

export async function finalise_deal_record({
  base_url,
  deal_id,
}: {
  base_url: string;
  deal_id: string;
}) {
  const deal = get_deal_by_id(deal_id);

  if (!deal) {
    throw new Error("Deal not found.");
  }

  if (deal.status === "finalised") {
    return deal;
  }

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
    report_path: report.absolute_path,
    seller_email: deal.seller_email,
  });

  const finalised_deal = update_deal(deal.id, {
    finalised_at: to_sqlite_datetime(),
    status: "finalised",
    summary_pdf_url: report.relative_path,
  });

  if (!finalised_deal) {
    throw new Error("Deal not found.");
  }

  return finalised_deal;
}
