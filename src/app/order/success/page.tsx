import Link from "next/link";
import { get_order_by_stripe_session_id } from "@/lib/db";
import { build_vehicle_summary, format_product, format_status } from "@/lib/display";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const session_id = params.session_id ?? "";
  const order = session_id ? get_order_by_stripe_session_id(session_id) : null;

  return (
    <section className="section">
      <div className="container admin-auth-wrap">
        <div className="admin-card admin-auth-card">
          <p className="eyebrow">Payment Received</p>
          <h1 className="section-title">Your order is in the queue</h1>
          <p className="section-intro">
            Payment succeeded. Buying Buddy will process the order and send the report once it
            clears review.
          </p>
          {order ? (
            <div className="admin-success-summary">
              <p>
                <strong>{format_product(order.product)}</strong>
              </p>
              <p>{build_vehicle_summary(order)}</p>
              <p>Status: {format_status(order.status)}</p>
            </div>
          ) : session_id ? (
            <p className="admin-copy-block">Session ID: {session_id}</p>
          ) : null}
          <div className="admin-button-row">
            <Link className="button button-primary" href="/">
              Back to site
            </Link>
            <Link className="button button-secondary" href="/blog">
              Read guides
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
