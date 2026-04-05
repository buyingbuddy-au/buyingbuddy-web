import Link from "next/link";
import { list_orders } from "@/lib/db";
import {
  build_vehicle_summary,
  format_product,
  format_status,
  format_timestamp,
} from "@/lib/display";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Awaiting review", value: "awaiting_review" },
  { label: "Complete", value: "complete" },
  { label: "Refunded", value: "refunded" },
] as const;

const PRODUCT_OPTIONS = [
  { label: "All products", value: "all" },
  { label: "PPSR Report", value: "ppsr" },
  { label: "Dealer Review", value: "dealer_review" },
  { label: "Full Confidence Pack", value: "full_pack" },
  { label: "Deal Room", value: "deal_room" },
] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const selected_status = params.status ?? "all";
  const selected_product = params.product ?? "all";
  const search = params.search?.trim() ?? "";
  const orders = list_orders({
    status: selected_status as "all",
    product: selected_product as "all",
    search: search || undefined,
  });

  return (
    <div className="admin-stack">
      <div className="admin-panel-header">
        <div>
          <h2 className="admin-panel-title">Orders</h2>
          <p className="admin-panel-copy">
            {orders.length} order{orders.length !== 1 ? "s" : ""} matching current filters.
          </p>
        </div>
      </div>

      <form className="admin-card admin-filters" method="get">
        <label className="admin-field">
          <span>Status</span>
          <select className="hero-input" defaultValue={selected_status} name="status">
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          <span>Product</span>
          <select className="hero-input" defaultValue={selected_product} name="product">
            {PRODUCT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field admin-field-wide">
          <span>Search</span>
          <input
            className="hero-input"
            defaultValue={search}
            name="search"
            placeholder="Email, make, model, listing URL"
          />
        </label>
        <button className="button button-primary admin-filter-btn" type="submit">
          Apply filters
        </button>
      </form>

      <div className="admin-list">
        {orders.length === 0 ? (
          <article className="admin-card">
            <p className="admin-empty-state">
              {search || selected_status !== "all" || selected_product !== "all"
                ? "No orders match the current filters."
                : "No orders yet."}
            </p>
          </article>
        ) : (
          orders.map((order) => {
            const vehicle = build_vehicle_summary(order);
            const hasVehicle = vehicle && vehicle !== "Unknown vehicle";
            return (
              <Link
                className="admin-card admin-order-card"
                href={`/admin/orders/${order.id}`}
                key={order.id}
              >
                {/* Vehicle first — most useful identifier on mobile */}
                <div className="admin-order-row">
                  <div className="min-w-0 flex-1">
                    {hasVehicle && (
                      <h3 className="admin-order-title truncate">{vehicle}</h3>
                    )}
                    <p className={`admin-order-email truncate ${hasVehicle ? "admin-order-copy" : "admin-order-title"}`}>
                      {order.customer_email}
                    </p>
                  </div>
                  <span className={`admin-badge admin-badge-${order.status} shrink-0`}>
                    {format_status(order.status)}
                  </span>
                </div>
                <div className="admin-order-meta-row">
                  <span className="truncate">{format_product(order.product)}</span>
                  <span>{format_timestamp(order.created_at)}</span>
                </div>
                <div className="admin-order-meta-row">
                  <span className="text-xs text-gray-400">
                    {order.listing_url ? (
                      <span className="text-teal-600 font-medium">Listing ↗</span>
                    ) : (
                      "No listing"
                    )}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">{order.id.slice(0, 8)}</span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
