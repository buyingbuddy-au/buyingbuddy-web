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
          <p className="admin-panel-copy">Filter by status, product, or customer details.</p>
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
        <button className="button button-primary" type="submit">
          Apply filters
        </button>
      </form>

      <div className="admin-list">
        {orders.length === 0 ? (
          <article className="admin-card">
            <p className="admin-empty-state">No orders match the current filters.</p>
          </article>
        ) : (
          orders.map((order) => (
            <Link className="admin-card admin-order-card" href={`/admin/orders/${order.id}`} key={order.id}>
              <div className="admin-order-row">
                <div>
                  <h3 className="admin-order-title">{order.customer_email}</h3>
                  <p className="admin-order-copy">
                    {format_product(order.product)} | {build_vehicle_summary(order)}
                  </p>
                </div>
                <span className={`admin-badge admin-badge-${order.status}`}>
                  {format_status(order.status)}
                </span>
              </div>
              <div className="admin-order-meta-row">
                <span>Created {format_timestamp(order.created_at)}</span>
                <span>{order.listing_url ? "Listing attached" : "No listing URL"}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
