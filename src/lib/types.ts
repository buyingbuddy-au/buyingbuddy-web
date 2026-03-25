export type OrderStatus =
  | "pending"
  | "processing"
  | "awaiting_review"
  | "complete"
  | "refunded";

export type ProductType =
  | "free_check"
  | "ppsr"
  | "dealer_review"
  | "full_pack";

export type PaidProductType = Exclude<ProductType, "free_check">;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface OrderRecord {
  id: string;
  created_at: string;
  updated_at: string;
  status: OrderStatus;
  product: ProductType;
  price_cents: number;
  customer_email: string;
  customer_name: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  listing_url: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vehicle_rego: string | null;
  vehicle_vin: string | null;
  vehicle_mileage: number | null;
  vehicle_price_listed: number | null;
  market_value_low: number | null;
  market_value_high: number | null;
  days_listed: number | null;
  red_flags: string[];
  listing_verdict: string | null;
  ppsr_result: JsonValue | null;
  ppsr_checked_at: string | null;
  dealer_verdict: string | null;
  dealer_reviewed_at: string | null;
  report_pdf_path: string | null;
  report_sent_at: string | null;
  negotiation_script: string | null;
  contract_included: number;
}

export interface EmailCaptureRecord {
  id: string;
  created_at: string;
  email: string;
  listing_url: string | null;
  vehicle_summary: string | null;
  converted_to_order: string | null;
}

export interface OrderFilters {
  status?: OrderStatus | "all";
  product?: ProductType | "all";
  search?: string;
  limit?: number;
}

export interface DashboardStats {
  new_orders_count: number;
  awaiting_review_count: number;
  completed_today_count: number;
  revenue_today_cents: number;
  revenue_week_cents: number;
  revenue_month_cents: number;
}

export interface DashboardPayload {
  stats: DashboardStats;
  recent_orders: OrderRecord[];
}

export interface ScrapedListing {
  listing_url: string;
  title: string;
  description: string;
  seller_name: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vehicle_mileage: number | null;
  vehicle_price_listed: number | null;
  vehicle_rego: string | null;
  vehicle_vin: string | null;
  source_name: string | null;
  fetched_at: string;
}

export interface ListingAnalysis {
  market_value_low: number | null;
  market_value_high: number | null;
  days_listed: number | null;
  red_flags: string[];
  listing_verdict: string;
  negotiation_script: string | null;
}

export interface FreeCheckResult {
  capture: EmailCaptureRecord;
  listing: ScrapedListing;
  analysis: ListingAnalysis;
  vehicle_summary: string;
}

export interface OrderReviewInput {
  dealer_verdict?: string | null;
  ppsr_result?: JsonValue | null;
}

export interface ProductDefinition {
  product: PaidProductType;
  name: string;
  description: string;
  price_cents: number;
}
