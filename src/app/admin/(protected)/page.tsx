import Link from "next/link";
import { get_dashboard_data } from "@/lib/engine";
import {
  build_vehicle_summary,
  format_currency_cents,
  format_product,
  format_status,
  format_timestamp,
} from "@/lib/display";

export default function AdminDashboardPage() {
  const { recent_orders, stats } = get_dashboard_data();

  return (
    <div className="admin-stack">
      <div className="admin-grid admin-stats-grid">
        <article className="admin-card admin-stat-card">
          <span className="admin-stat-label">New orders</span>
          <strong className="admin-stat-value">{stats.new_orders_count}</strong>
        </article>
        <article className="admin-card admin-stat-card">
          <span className="admin-stat-label">Awaiting review</span>
          <strong className="admin-stat-value">{stats.awaiting_review_count}</strong>
        </article>
        <article className="admin-card admin-stat-card">
          <span className="admin-stat-label">Completed today</span>
          <strong className="admin-stat-value">{stats.completed_today_count}</strong>
        </article>
        <article className="admin-card admin-stat-card">
          <span className="admin-stat-label">Revenue today</span>
          <strong className="admin-stat-value">
            {format_currency_cents(stats.revenue_today_cents)}
          </strong>
          <p className="admin-stat-meta">
            Week {format_currency_cents(stats.revenue_week_cents)} | Month{" "}
            {format_currency_cents(stats.revenue_month_cents)}
          </p>
        </article>
      </div>

      <div className="admin-panel-header">
        <div>
          <h2 className="admin-panel-title">Recent orders</h2>
          <p className="admin-panel-copy">Latest paid orders flowing through the engine.</p>
        </div>
        <Link className="button button-secondary button-small" href="/admin/orders">
          View all orders
        </Link>
      </div>

      <div className="admin-list">
        {recent_orders.length === 0 ? (
          <article className="admin-card">
            <p className="admin-empty-state">No paid orders yet.</p>
          </article>
        ) : (
          recent_orders.map((order) => (
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
              <p className="admin-order-meta">Created {format_timestamp(order.created_at)}</p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
