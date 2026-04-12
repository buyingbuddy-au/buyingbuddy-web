import { supabase } from "@/lib/supabase";
import { to_sqlite_datetime } from "@/lib/time";
import type {
  DashboardPayload,
  DashboardStats,
  DealPublicRecord,
  DealRecord,
  EmailCaptureRecord,
  OrderFilters,
  OrderRecord,
} from "@/lib/types";

// ── Orders ────────────────────────────────────────────────────────

export async function insert_order(
  input: Partial<OrderRecord> &
    Pick<OrderRecord, "id" | "product" | "customer_email">,
) {
  const row = {
    id: input.id,
    product: input.product,
    customer_email: input.customer_email,
    customer_name: input.customer_name ?? null,
    status: input.status ?? "pending",
    price_cents: input.price_cents ?? 0,
    stripe_session_id: input.stripe_session_id ?? null,
    stripe_payment_intent: input.stripe_payment_intent ?? null,
    listing_url: input.listing_url ?? null,
    vehicle_identifier: input.vehicle_identifier ?? null,
    vehicle_make: input.vehicle_make ?? null,
    vehicle_model: input.vehicle_model ?? null,
    vehicle_year: input.vehicle_year ?? null,
    vehicle_rego: input.vehicle_rego ?? null,
    vehicle_vin: input.vehicle_vin ?? null,
    vehicle_mileage: input.vehicle_mileage ?? null,
    vehicle_price_listed: input.vehicle_price_listed ?? null,
    market_value_low: input.market_value_low ?? null,
    market_value_high: input.market_value_high ?? null,
    days_listed: input.days_listed ?? null,
    red_flags: input.red_flags ?? [],
    listing_verdict: input.listing_verdict ?? null,
    ppsr_result: input.ppsr_result ?? null,
    ppsr_checked_at: input.ppsr_checked_at ?? null,
    dealer_verdict: input.dealer_verdict ?? null,
    dealer_reviewed_at: input.dealer_reviewed_at ?? null,
    report_pdf_path: input.report_pdf_path ?? null,
    report_sent_at: input.report_sent_at ?? null,
    negotiation_script: input.negotiation_script ?? null,
    contract_included: input.contract_included ?? 0,
  };

  await supabase.from("orders").insert(row);
  return get_order_by_id(input.id);
}

export async function update_order(id: string, updates: Partial<OrderRecord>) {
  const clean: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [key, value] of Object.entries(updates)) {
    if (key === "id" || key === "created_at" || value === undefined) continue;
    clean[key] = value;
  }

  if (Object.keys(clean).length <= 1) return get_order_by_id(id);

  await supabase.from("orders").update(clean).eq("id", id);
  return get_order_by_id(id);
}

export async function get_order_by_id(id: string) {
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as OrderRecord | null) ?? null;
}

export async function get_order_by_stripe_session_id(session_id: string) {
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_session_id", session_id)
    .maybeSingle();
  return (data as OrderRecord | null) ?? null;
}

export async function get_order_by_payment_intent(intent: string) {
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_payment_intent", intent)
    .maybeSingle();
  return (data as OrderRecord | null) ?? null;
}

export async function list_orders(filters: OrderFilters = {}) {
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.product && filters.product !== "all") {
    query = query.eq("product", filters.product);
  }
  if (filters.search) {
    query = query.or(
      `customer_email.ilike.%${filters.search}%,listing_url.ilike.%${filters.search}%,vehicle_make.ilike.%${filters.search}%,vehicle_model.ilike.%${filters.search}%`,
    );
  }
  if (typeof filters.limit === "number" && Number.isFinite(filters.limit)) {
    query = query.limit(filters.limit);
  }

  const { data } = await query;
  return (data as OrderRecord[] | null) ?? [];
}

// ── Email Captures ────────────────────────────────────────────────

export async function upsert_email_capture(
  input: Partial<EmailCaptureRecord> & Pick<EmailCaptureRecord, "id" | "email">,
) {
  await supabase.from("email_captures").upsert(
    {
      id: input.id,
      email: input.email,
      listing_url: input.listing_url ?? null,
      vehicle_summary: input.vehicle_summary ?? null,
      converted_to_order: input.converted_to_order ?? null,
    },
    { onConflict: "email" },
  );
  return get_email_capture_by_email(input.email);
}

export async function get_email_capture_by_email(email: string) {
  const { data } = await supabase
    .from("email_captures")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  return (data as EmailCaptureRecord | null) ?? null;
}

// ── Deals ─────────────────────────────────────────────────────────

export async function insert_deal(
  input: Partial<DealRecord> & Pick<DealRecord, "id" | "status">,
) {
  const row: Record<string, unknown> = { id: input.id, status: input.status };
  for (const [key, value] of Object.entries(input)) {
    if (key === "id" || key === "status" || value === undefined) continue;
    row[key] = value;
  }

  await supabase.from("deals").insert(row);
  return get_deal_by_id(input.id);
}

export async function update_deal(id: string, updates: Partial<DealRecord>) {
  const clean: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [key, value] of Object.entries(updates)) {
    if (key === "id" || key === "created_at" || value === undefined) continue;
    clean[key] = value;
  }

  if (Object.keys(clean).length <= 1) return get_deal_by_id(id);

  await supabase.from("deals").update(clean).eq("id", id);
  return get_deal_by_id(id);
}

export async function get_deal_by_id(id: string) {
  const { data } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as DealRecord | null) ?? null;
}

export async function get_deals_by_email(email: string): Promise<DealRecord[]> {
  const { data } = await supabase
    .from("deals")
    .select("*")
    .eq("buyer_email", email)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data as DealRecord[] | null) ?? [];
}

export async function get_deal_by_email_and_rego(email: string, rego: string) {
  const { data } = await supabase
    .from("deals")
    .select("*")
    .eq("buyer_email", email)
    .eq("vehicle_rego", rego.toUpperCase())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as DealRecord | null) ?? null;
}

export async function get_deal_by_stripe_session_id(session_id: string) {
  const { data } = await supabase
    .from("deals")
    .select("*")
    .eq("stripe_session_id", session_id)
    .maybeSingle();
  return (data as DealRecord | null) ?? null;
}

export function to_public_deal_record(deal: DealRecord): DealPublicRecord {
  return {
    id: deal.id,
    created_at: deal.created_at,
    updated_at: deal.updated_at,
    status: deal.status,
    stripe_session_id: deal.stripe_session_id,
    vehicle_make: deal.vehicle_make,
    vehicle_model: deal.vehicle_model,
    vehicle_year: deal.vehicle_year,
    vehicle_vin: deal.vehicle_vin,
    vehicle_rego: deal.vehicle_rego,
    vehicle_km: deal.vehicle_km,
    vehicle_colour: deal.vehicle_colour,
    vehicle_transmission: deal.vehicle_transmission,
    asking_price: deal.asking_price,
    offered_price: deal.offered_price,
    agreed_price: deal.agreed_price,
    deposit_amount: deal.deposit_amount,
    payment_method: deal.payment_method,
    conditions: deal.conditions,
    handover_date: deal.handover_date,
    handover_location: deal.handover_location,
    notes: deal.notes,
    buyer_name: deal.buyer_name,
    buyer_email: deal.buyer_email,
    buyer_phone: deal.buyer_phone,
    buyer_address: deal.buyer_address,
    buyer_completed_at: deal.buyer_completed_at,
    seller_name: deal.seller_name,
    seller_email: deal.seller_email,
    seller_phone: deal.seller_phone,
    seller_address: deal.seller_address,
    seller_bank_bsb: deal.seller_bank_bsb,
    seller_payid: deal.seller_payid,
    seller_completed_at: deal.seller_completed_at,
    seller_confirmed_price: deal.seller_confirmed_price,
    seller_confirmed_conditions: deal.seller_confirmed_conditions,
    summary_pdf_url: deal.summary_pdf_url,
    finalised_at: deal.finalised_at,
    buyer_licence_uploaded: Boolean(deal.buyer_licence_url),
    seller_licence_uploaded: Boolean(deal.seller_licence_url),
    seller_rego_papers_uploaded: Boolean(deal.seller_rego_papers_url),
    seller_safety_cert_uploaded: Boolean(deal.seller_safety_cert_url),
    seller_bank_account_last4: deal.seller_bank_account
      ? deal.seller_bank_account.slice(-4)
      : null,
  };
}

// ── Email → Order link ────────────────────────────────────────────

export async function link_email_capture_to_order(email: string, order_id: string) {
  await supabase
    .from("email_captures")
    .update({ converted_to_order: order_id })
    .eq("email", email);
  return get_email_capture_by_email(email);
}

// ── Dashboard ─────────────────────────────────────────────────────

export async function get_dashboard_payload(): Promise<DashboardPayload> {
  const recent_orders = await list_orders({ limit: 8 });

  const today_start = new Date();
  today_start.setHours(0, 0, 0, 0);
  const today_iso = today_start.toISOString();

  const week_start = new Date();
  week_start.setDate(week_start.getDate() - 7);
  const week_iso = week_start.toISOString();

  const month_start = new Date();
  month_start.setDate(month_start.getDate() - 30);
  const month_iso = month_start.toISOString();

  const [newRes, reviewRes, todayRes, revTodayRes, revWeekRes, revMonthRes] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "awaiting_review"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "complete").gte("updated_at", today_iso),
    supabase.from("orders").select("price_cents").eq("status", "complete").gte("updated_at", today_iso),
    supabase.from("orders").select("price_cents").eq("status", "complete").gte("updated_at", week_iso),
    supabase.from("orders").select("price_cents").eq("status", "complete").gte("updated_at", month_iso),
  ]);

  const sum = (rows: { price_cents: number }[] | null) =>
    (rows ?? []).reduce((acc, r) => acc + (r.price_cents ?? 0), 0);

  const stats: DashboardStats = {
    new_orders_count: newRes.count ?? 0,
    awaiting_review_count: reviewRes.count ?? 0,
    completed_today_count: todayRes.count ?? 0,
    revenue_today_cents: sum(revTodayRes.data as { price_cents: number }[] | null),
    revenue_week_cents: sum(revWeekRes.data as { price_cents: number }[] | null),
    revenue_month_cents: sum(revMonthRes.data as { price_cents: number }[] | null),
  };

  return { stats, recent_orders };
}

// ── Refunds ───────────────────────────────────────────────────────

export async function mark_order_refunded(stripe_payment_intent: string) {
  const existing_order = await get_order_by_payment_intent(stripe_payment_intent);
  if (!existing_order) return null;
  return update_order(existing_order.id, { status: "refunded" });
}

// ── Known Issues Cache ────────────────────────────────────────────

export async function get_cached_issues(make: string, model: string, year: number | null, transmission: string) {
  let query = supabase
    .from("known_issues_cache")
    .select("issues")
    .eq("make", make.toLowerCase())
    .eq("model", model.toLowerCase());

  if (year) query = query.eq("year", year);
  if (transmission) query = query.eq("transmission", transmission.toLowerCase());

  const { data } = await query.maybeSingle();
  return data ? (data.issues as string[]) : null;
}

export async function cache_issues(
  make: string, model: string, year: number | null, transmission: string, issues: string[],
) {
  const id = `${year ?? ""}:${make}:${model}:${transmission}`.toLowerCase();
  await supabase.from("known_issues_cache").upsert({
    id,
    make: make.toLowerCase(),
    model: model.toLowerCase(),
    year,
    transmission: transmission.toLowerCase(),
    issues,
  }, { onConflict: "id" });
}

// ── Compat ────────────────────────────────────────────────────────

export function touch_database() {
  // No-op — Supabase is always available
}

export { to_sqlite_datetime };
