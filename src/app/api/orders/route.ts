import { NextResponse } from "next/server";
import { is_admin_request } from "@/lib/admin-auth";
import { list_orders } from "@/lib/db";
import type { OrderStatus, ProductType } from "@/lib/types";

export const runtime = "nodejs";

const ORDER_STATUSES: Array<OrderStatus | "all"> = [
  "all",
  "pending",
  "processing",
  "awaiting_review",
  "complete",
  "refunded",
];

const PRODUCT_TYPES: Array<ProductType | "all"> = [
  "all",
  "free_check",
  "ppsr",
  "dealer_review",
  "full_pack",
];

export async function GET(request: Request) {
  if (!is_admin_request(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const status_param = url.searchParams.get("status") ?? "all";
  const product_param = url.searchParams.get("product") ?? "all";
  const orders = list_orders({
    status: ORDER_STATUSES.includes(status_param as OrderStatus | "all")
      ? (status_param as OrderStatus | "all")
      : "all",
    product: PRODUCT_TYPES.includes(product_param as ProductType | "all")
      ? (product_param as ProductType | "all")
      : "all",
    search: url.searchParams.get("search") ?? undefined,
    limit: url.searchParams.get("limit")
      ? Number.parseInt(url.searchParams.get("limit") ?? "0", 10)
      : undefined,
  });

  return NextResponse.json({
    ok: true,
    orders,
  });
}
