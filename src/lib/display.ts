import type { OrderRecord, OrderStatus, ProductType } from "@/lib/types";

const PRODUCT_LABELS: Record<ProductType, string> = {
  free_check: "Free Check",
  ppsr: "PPSR Report",
  dealer_review: "Dealer Review",
  full_pack: "Full Confidence Pack",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  awaiting_review: "Awaiting Review",
  complete: "Complete",
  refunded: "Refunded",
};

function parse_timestamp(value: string) {
  return value.includes("T") ? new Date(value) : new Date(`${value.replace(" ", "T")}Z`);
}

export function format_product(product: ProductType) {
  return PRODUCT_LABELS[product];
}

export function format_status(status: OrderStatus) {
  return STATUS_LABELS[status];
}

export function format_currency_cents(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value / 100);
}

export function format_currency(value: number | null) {
  if (value === null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function format_timestamp(value: string | null) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parse_timestamp(value));
}

export function build_vehicle_summary(order: Pick<
  OrderRecord,
  | "vehicle_make"
  | "vehicle_model"
  | "vehicle_year"
  | "vehicle_price_listed"
  | "vehicle_mileage"
>) {
  const heading = [order.vehicle_year, order.vehicle_make, order.vehicle_model]
    .filter(Boolean)
    .join(" ");
  const details = [
    order.vehicle_price_listed ? format_currency(order.vehicle_price_listed) : null,
    order.vehicle_mileage ? `${order.vehicle_mileage.toLocaleString("en-AU")} km` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  return [heading || "Vehicle details pending", details].filter(Boolean).join(" | ");
}
