import Link from "next/link";
import { notFound } from "next/navigation";
import { save_review_action, send_report_action } from "@/app/admin/actions";
import { get_order_by_id } from "@/lib/db";
import { PPSRProcessForm } from "./ppsr-process-form";
import {
  build_vehicle_summary,
  format_currency,
  format_currency_cents,
  format_product,
  format_status,
  format_timestamp,
} from "@/lib/display";

function build_timeline(order: NonNullable<ReturnType<typeof get_order_by_id>>) {
  return [
    { label: "Order created", value: order.created_at },
    { label: "PPSR entered", value: order.ppsr_checked_at },
    { label: "Dealer verdict saved", value: order.dealer_reviewed_at },
    { label: "Report sent", value: order.report_sent_at },
  ].filter((entry) => entry.value);
}

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const order = get_order_by_id(id);

  if (!order) {
    notFound();
  }

  const timeline = build_timeline(order);

  return (
    <div className="admin-stack">
      <div className="admin-panel-header">
        <div>
          <Link className="admin-back-link" href="/admin/orders">
            Back to orders
          </Link>
          <h2 className="admin-panel-title">{build_vehicle_summary(order)}</h2>
          <p className="admin-panel-copy">
            {format_product(order.product)} | {order.customer_email}
          </p>
        </div>
        <span className={`admin-badge admin-badge-${order.status}`}>
          {format_status(order.status)}
        </span>
      </div>

      {query.updated ? (
        <p className="admin-inline-alert">
          {query.updated === "sent"
            ? "Report generated and email stub triggered."
            : "Dealer review saved."}
        </p>
      ) : null}

      <div className="admin-grid admin-detail-grid">
        <article className="admin-card">
          <h3 className="admin-panel-title">Order summary</h3>
          <dl className="admin-detail-list">
            <div>
              <dt>Order ID</dt>
              <dd>{order.id}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{format_timestamp(order.created_at)}</dd>
            </div>
            <div>
              <dt>Customer</dt>
              <dd>{order.customer_email}</dd>
            </div>
            <div>
              <dt>Price paid</dt>
              <dd>{format_currency_cents(order.price_cents)}</dd>
            </div>
            <div>
              <dt>Listing URL</dt>
              <dd>
                {order.listing_url ? (
                  <a href={order.listing_url} rel="noreferrer" target="_blank">
                    Open listing
                  </a>
                ) : (
                  "N/A"
                )}
              </dd>
            </div>
            <div>
              <dt>Report path</dt>
              <dd>{order.report_pdf_path ?? "Not generated yet"}</dd>
            </div>
          </dl>
        </article>

        <article className="admin-card">
          <h3 className="admin-panel-title">Vehicle info</h3>
          <dl className="admin-detail-list">
            <div>
              <dt>Make</dt>
              <dd>{order.vehicle_make ?? "N/A"}</dd>
            </div>
            <div>
              <dt>Model</dt>
              <dd>{order.vehicle_model ?? "N/A"}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{order.vehicle_year ?? "N/A"}</dd>
            </div>
            <div>
              <dt>Rego</dt>
              <dd>{order.vehicle_rego ?? "N/A"}</dd>
            </div>
            <div>
              <dt>VIN</dt>
              <dd>{order.vehicle_vin ?? "N/A"}</dd>
            </div>
            <div>
              <dt>Mileage</dt>
              <dd>{order.vehicle_mileage ? `${order.vehicle_mileage.toLocaleString("en-AU")} km` : "N/A"}</dd>
            </div>
            <div>
              <dt>Listed price</dt>
              <dd>{format_currency(order.vehicle_price_listed)}</dd>
            </div>
            <div>
              <dt>Market range</dt>
              <dd>
                {format_currency(order.market_value_low)} - {format_currency(order.market_value_high)}
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <div className="admin-grid admin-detail-grid">
        <article className="admin-card">
          <h3 className="admin-panel-title">Free check results</h3>
          <p className="admin-copy-block">{order.listing_verdict ?? "No verdict saved yet."}</p>
          <div className="admin-chip-row">
            {order.red_flags.length === 0 ? (
              <span className="admin-chip">No red flags found</span>
            ) : (
              order.red_flags.map((flag) => (
                <span className="admin-chip" key={flag}>
                  {flag}
                </span>
              ))
            )}
          </div>
          <p className="admin-copy-block">Days listed estimate: {order.days_listed ?? "N/A"}</p>
        </article>

        <article className="admin-card">
          <h3 className="admin-panel-title">Status timeline</h3>
          <ul className="admin-timeline">
            {timeline.length === 0 ? (
              <li>No lifecycle events recorded yet.</li>
            ) : (
              timeline.map((entry) => (
                <li key={entry.label}>
                  <strong>{entry.label}</strong>
                  <span>{format_timestamp(entry.value ?? null)}</span>
                </li>
              ))
            )}
          </ul>
        </article>
      </div>

      <article className="admin-card">
        <h3 className="admin-panel-title">PPSR Report Generator</h3>
        <p className="admin-copy-block">
          Paste the raw PPSR certificate text below. Clicking Generate Report will extract the data with AI,
          create a branded PDF, email it to the customer, and notify Jordan on Telegram.
        </p>
        <PPSRProcessForm customer_email={order.customer_email} order_id={order.id} />
      </article>

      <div className="admin-grid admin-detail-grid">
        <article className="admin-card">
          <h3 className="admin-panel-title">Review form</h3>
          <form action={save_review_action} className="admin-form">
            <input name="order_id" type="hidden" value={order.id} />
            <label className="admin-field">
              <span>Dealer verdict</span>
              <textarea
                className="hero-input admin-textarea"
                defaultValue={order.dealer_verdict ?? ""}
                name="dealer_verdict"
                placeholder="Jordan's review notes"
              />
            </label>
            <label className="admin-field">
              <span>PPSR result JSON or notes</span>
              <textarea
                className="hero-input admin-textarea admin-code-textarea"
                defaultValue={
                  order.ppsr_result ? JSON.stringify(order.ppsr_result, null, 2) : ""
                }
                name="ppsr_result"
                placeholder='{"finance_owing":false,"stolen_status":"clear"}'
              />
            </label>
            <button className="button button-primary" type="submit">
              Save review
            </button>
          </form>
        </article>

        <article className="admin-card">
          <h3 className="admin-panel-title">Generate and send</h3>
          <p className="admin-copy-block">
            This MVP generates a simple PDF file locally and logs the email send step.
          </p>
          <form action={send_report_action} className="admin-form">
            <input name="order_id" type="hidden" value={order.id} />
            <button className="button button-dark" type="submit">
              Generate &amp; Send Report
            </button>
          </form>
          <div className="admin-subsection">
            <h4 className="admin-subtitle">Saved PPSR data</h4>
            <pre className="admin-code-block">
              {order.ppsr_result ? JSON.stringify(order.ppsr_result, null, 2) : "No PPSR data saved."}
            </pre>
          </div>
          <div className="admin-subsection">
            <h4 className="admin-subtitle">Negotiation script</h4>
            <p className="admin-copy-block">
              {order.negotiation_script ?? "No negotiation script generated."}
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
