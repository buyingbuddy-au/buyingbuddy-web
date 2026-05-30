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

type TestStore = {
  orders: Map<string, OrderRecord>;
  deals: Map<string, DealRecord>;
  emailCaptures: Map<string, EmailCaptureRecord>;
};

declare global {
  var __buyingBuddyTestStore: TestStore | undefined;
}

function has_live_stripe_key_configured() {
  const liveKeyPrefixes = ["sk" + "_live_", "pk" + "_live_"];
  const configuredStripeKeys = [
    process.env.STRIPE_SECRET_KEY,
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  ];

  return configuredStripeKeys.some((key) => {
    const trimmed = key?.trim();
    return Boolean(trimmed && liveKeyPrefixes.some((prefix) => trimmed.startsWith(prefix)));
  });
}

function is_memory_test_store_enabled() {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.BUYINGBUDDY_TEST_DATA_STORE !== "memory") return false;
  return !has_live_stripe_key_configured();
}

function testStore() {
  globalThis.__buyingBuddyTestStore ??= {
    orders: new Map<string, OrderRecord>(),
    deals: new Map<string, DealRecord>(),
    emailCaptures: new Map<string, EmailCaptureRecord>(),
  };
  return globalThis.__buyingBuddyTestStore;
}

function build_test_order(
  input: Partial<OrderRecord> & Pick<OrderRecord, "id" | "product" | "customer_email">,
): OrderRecord {
  const now = new Date().toISOString();
  return {
    id: input.id,
    created_at: input.created_at ?? now,
    updated_at: input.updated_at ?? now,
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
}

function build_test_deal(
  input: Partial<DealRecord> & Pick<DealRecord, "id" | "status">,
): DealRecord {
  const now = new Date().toISOString();
  return {
    id: input.id,
    created_at: input.created_at ?? now,
    updated_at: input.updated_at ?? now,
    status: input.status,
    stripe_session_id: input.stripe_session_id ?? null,
    vehicle_make: input.vehicle_make ?? null,
    vehicle_model: input.vehicle_model ?? null,
    vehicle_year: input.vehicle_year ?? null,
    vehicle_vin: input.vehicle_vin ?? null,
    vehicle_rego: input.vehicle_rego ?? null,
    vehicle_km: input.vehicle_km ?? null,
    vehicle_colour: input.vehicle_colour ?? null,
    vehicle_transmission: input.vehicle_transmission ?? null,
    asking_price: input.asking_price ?? null,
    offered_price: input.offered_price ?? null,
    agreed_price: input.agreed_price ?? null,
    deposit_amount: input.deposit_amount ?? null,
    payment_method: input.payment_method ?? null,
    conditions: input.conditions ?? null,
    handover_date: input.handover_date ?? null,
    handover_location: input.handover_location ?? null,
    notes: input.notes ?? null,
    buyer_name: input.buyer_name ?? null,
    buyer_email: input.buyer_email ?? null,
    buyer_phone: input.buyer_phone ?? null,
    buyer_address: input.buyer_address ?? null,
    buyer_licence_url: input.buyer_licence_url ?? null,
    buyer_completed_at: input.buyer_completed_at ?? null,
    seller_name: input.seller_name ?? null,
    seller_email: input.seller_email ?? null,
    seller_phone: input.seller_phone ?? null,
    seller_address: input.seller_address ?? null,
    seller_licence_url: input.seller_licence_url ?? null,
    seller_rego_papers_url: input.seller_rego_papers_url ?? null,
    seller_safety_cert_url: input.seller_safety_cert_url ?? null,
    seller_bank_bsb: input.seller_bank_bsb ?? null,
    seller_bank_account: input.seller_bank_account ?? null,
    seller_payid: input.seller_payid ?? null,
    seller_completed_at: input.seller_completed_at ?? null,
    seller_confirmed_price: input.seller_confirmed_price ?? 0,
    seller_confirmed_conditions: input.seller_confirmed_conditions ?? 0,
    summary_pdf_url: input.summary_pdf_url ?? null,
    finalised_at: input.finalised_at ?? null,
  };
}

// ── Orders ────────────────────────────────────────────────────────

export async function insert_order(
  input: Partial<OrderRecord> &
    Pick<OrderRecord, "id" | "product" | "customer_email">,
) {
  if (is_memory_test_store_enabled()) {
    const row = build_test_order(input);
    testStore().orders.set(row.id, row);
    return row;
  }

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
  if (is_memory_test_store_enabled()) {
    const existing = testStore().orders.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, id, updated_at: new Date().toISOString() };
    testStore().orders.set(id, updated);
    return updated;
  }

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
  if (is_memory_test_store_enabled()) {
    return testStore().orders.get(id) ?? null;
  }

  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as OrderRecord | null) ?? null;
}

export async function get_order_by_stripe_session_id(session_id: string) {
  if (is_memory_test_store_enabled()) {
    return Array.from(testStore().orders.values()).find((order) => order.stripe_session_id === session_id) ?? null;
  }

  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_session_id", session_id)
    .maybeSingle();
  return (data as OrderRecord | null) ?? null;
}

export async function get_order_by_payment_intent(intent: string) {
  if (is_memory_test_store_enabled()) {
    return Array.from(testStore().orders.values()).find((order) => order.stripe_payment_intent === intent) ?? null;
  }

  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_payment_intent", intent)
    .maybeSingle();
  return (data as OrderRecord | null) ?? null;
}

export async function list_orders(filters: OrderFilters = {}) {
  if (is_memory_test_store_enabled()) {
    let rows = Array.from(testStore().orders.values()).sort((a, b) => b.created_at.localeCompare(a.created_at));

    if (filters.status && filters.status !== "all") {
      rows = rows.filter((order) => order.status === filters.status);
    }
    if (filters.product && filters.product !== "all") {
      rows = rows.filter((order) => order.product === filters.product);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      rows = rows.filter((order) =>
        [order.customer_email, order.listing_url, order.vehicle_make, order.vehicle_model, order.vehicle_identifier, order.vehicle_rego, order.vehicle_vin]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search)),
      );
    }
    if (typeof filters.limit === "number" && Number.isFinite(filters.limit)) {
      rows = rows.slice(0, filters.limit);
    }
    return rows;
  }

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
  if (is_memory_test_store_enabled()) {
    const existing = testStore().emailCaptures.get(input.email);
    const now = new Date().toISOString();
    const row: EmailCaptureRecord = {
      id: existing?.id ?? input.id,
      created_at: existing?.created_at ?? input.created_at ?? now,
      email: input.email,
      listing_url: input.listing_url ?? existing?.listing_url ?? null,
      vehicle_summary: input.vehicle_summary ?? existing?.vehicle_summary ?? null,
      converted_to_order: input.converted_to_order ?? existing?.converted_to_order ?? null,
    };
    testStore().emailCaptures.set(row.email, row);
    return row;
  }

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
  if (is_memory_test_store_enabled()) {
    return testStore().emailCaptures.get(email) ?? null;
  }

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
  if (is_memory_test_store_enabled()) {
    const row = build_test_deal(input);
    testStore().deals.set(row.id, row);
    return row;
  }

  const row: Record<string, unknown> = { id: input.id, status: input.status };
  for (const [key, value] of Object.entries(input)) {
    if (key === "id" || key === "status" || value === undefined) continue;
    row[key] = value;
  }

  await supabase.from("deals").insert(row);
  return get_deal_by_id(input.id);
}

export async function update_deal(id: string, updates: Partial<DealRecord>) {
  if (is_memory_test_store_enabled()) {
    const existing = testStore().deals.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, id, updated_at: new Date().toISOString() };
    testStore().deals.set(id, updated);
    return updated;
  }

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
  if (is_memory_test_store_enabled()) {
    return testStore().deals.get(id) ?? null;
  }

  const { data } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as DealRecord | null) ?? null;
}

export async function get_deals_by_email(email: string): Promise<DealRecord[]> {
  if (is_memory_test_store_enabled()) {
    return Array.from(testStore().deals.values())
      .filter((deal) => deal.buyer_email === email)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 20);
  }

  const { data } = await supabase
    .from("deals")
    .select("*")
    .eq("buyer_email", email)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data as DealRecord[] | null) ?? [];
}

export async function get_deal_by_email_and_rego(email: string, rego: string) {
  if (is_memory_test_store_enabled()) {
    return Array.from(testStore().deals.values())
      .filter((deal) => deal.buyer_email === email && deal.vehicle_rego === rego.toUpperCase())
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null;
  }

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
  if (is_memory_test_store_enabled()) {
    return Array.from(testStore().deals.values()).find((deal) => deal.stripe_session_id === session_id) ?? null;
  }

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
  if (is_memory_test_store_enabled()) {
    const existing = testStore().emailCaptures.get(email);
    if (!existing) return null;
    const updated = { ...existing, converted_to_order: order_id };
    testStore().emailCaptures.set(email, updated);
    return updated;
  }

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
