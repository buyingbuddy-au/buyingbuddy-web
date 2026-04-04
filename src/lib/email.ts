import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
import type { ProductType } from "@/lib/types";

function get_resend() {
  return new Resend(process.env.RESEND_API_KEY ?? "");
}

const FROM = "Buying Buddy <info@buyingbuddy.com.au>";
const BRAND_TEAL = "#0D9488";

function base_styles() {
  return `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F9FAFB; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .header { background: ${BRAND_TEAL}; padding: 28px 40px; }
    .header h1 { color: #FFFFFF; margin: 0; font-size: 22px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px; }
    .body { padding: 32px 40px; }
    .footer { background: #F3F4F6; padding: 20px 40px; text-align: center; }
    .footer p { color: #6B7280; font-size: 12px; margin: 0; }
    .footer a { color: ${BRAND_TEAL}; text-decoration: none; }
    .section-title { font-size: 14px; font-weight: 700; color: #1F2937; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px; }
    .verdict-box { background: #F0FDF9; border-left: 4px solid ${BRAND_TEAL}; border-radius: 0 6px 6px 0; padding: 14px 18px; margin: 20px 0; font-size: 14px; color: #065F55; line-height: 1.6; }
    .cta { display: inline-block; background: ${BRAND_TEAL}; color: #FFFFFF !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin-top: 24px; }
    .vehicle-card { background: #F9FAFB; border-radius: 8px; padding: 16px 20px; margin: 16px 0; }
    .vehicle-card p { margin: 4px 0; font-size: 14px; color: #374151; }
    .vehicle-card strong { color: #111827; }
    .red-flag { color: #DC2626; font-size: 14px; margin: 4px 0; }
    .market-bar { background: #E5E7EB; border-radius: 4px; height: 12px; margin: 8px 0; position: relative; overflow: visible; }
    .market-bar-fill { background: ${BRAND_TEAL}; height: 100%; border-radius: 4px; }
    .product-badge { display: inline-block; background: ${BRAND_TEAL}; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  `;
}

function email_html(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Buying Buddy</title>
  <style>${base_styles()}</style>
</head>
<body>
  <div class="wrapper">
    ${content}
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Buying Buddy — <a href="https://buyingbuddy.com.au">buyingbuddy.com.au</a></p>
    <p>Questions? Email <a href="mailto:info@buyingbuddy.com.au">info@buyingbuddy.com.au</a></p>
  </div>
</body>
</html>`;
}

export async function send_free_check_email({
  email,
  listing_url,
  verdict,
  vehicle_summary,
  market_value_low,
  market_value_high,
  red_flags,
}: {
  email: string;
  listing_url: string;
  verdict: string;
  vehicle_summary?: string | null;
  market_value_low?: number | null;
  market_value_high?: number | null;
  red_flags?: string[];
}) {
  const formatted_low = market_value_low
    ? new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(market_value_low)
    : "N/A";
  const formatted_high = market_value_high
    ? new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(market_value_high)
    : "N/A";

  const flags_html =
    red_flags && red_flags.length > 0
      ? red_flags.map((f) => `<p class="red-flag">⚠ ${f}</p>`).join("")
      : '<p style="font-size:14px; color:#16A34A;">✓ No red flags detected.</p>';

  const content = `
  <div class="header">
    <h1>Buying Buddy</h1>
    <p>Your Free Vehicle Listing Check</p>
  </div>
  <div class="body">
    <p class="section-title">Listing Check Result</p>
    ${vehicle_summary ? `<div class="vehicle-card"><p>${vehicle_summary}</p></div>` : ""}

    <p class="section-title">Market Value Range</p>
    <p style="font-size:16px; color:#1F2937;">${formatted_low} — ${formatted_high}</p>
    <p style="font-size:12px; color:#6B7280;">Based on comparable vehicles currently listed for sale.</p>

    <p class="section-title">Red Flags</p>
    ${flags_html}

    <p class="section-title">Our Verdict</p>
    <div class="verdict-box">${verdict}</div>

    <p style="font-size:13px; color:#6B7280; margin-top:8px;">
      Listing: <a href="${listing_url}" style="color:${BRAND_TEAL};">${listing_url}</a>
    </p>

    <a href="https://buyingbuddy.com.au" class="cta">Want the full picture? Get a PPSR Report for $4.95</a>
  </div>`;

  await get_resend().emails.send({
    from: FROM,
    to: email,
    subject: "Your Free Listing Check — Buying Buddy",
    html: email_html(content),
  });
}

export async function send_ppsr_confirmation_email({
  email,
  order_id,
  vehicle_identifier,
}: {
  email: string;
  order_id: string;
  vehicle_identifier: string;
}) {
  const content = `
  <div class="header">
    <h1>Buying Buddy</h1>
    <p>Your PPSR report is being prepared</p>
  </div>
  <div class="body">
    <p style="font-size:15px; color:#374151;">Hi there,</p>
    <p style="font-size:15px; color:#374151;">
      Thanks for ordering a <strong>PPSR Report</strong> from Buying Buddy. We&apos;ve received your payment and our team is now preparing your report.
    </p>

    <div class="vehicle-card">
      <p><strong>Order ID:</strong> ${order_id}</p>
      <p><strong>VIN / Rego:</strong> ${vehicle_identifier}</p>
      <p><strong>Delivery window:</strong> Within 2 hours</p>
    </div>

    <div class="verdict-box">
      Your PPSR report will be emailed to you within 2 hours. If anything urgent comes up, reply to this email or contact Jordan at <a href="mailto:info@buyingbuddy.com.au" style="color:${BRAND_TEAL};">info@buyingbuddy.com.au</a>.
    </div>

    <a href="https://buyingbuddy.com.au" class="cta">Visit Buying Buddy</a>
  </div>`;

  await get_resend().emails.send({
    from: FROM,
    to: email,
    subject: "Your PPSR Report is Being Prepared",
    html: email_html(content),
  });
}

export async function send_order_report_email({
  email,
  order_id,
  report_path,
  product,
}: {
  email: string;
  order_id: string;
  report_path: string;
  product: ProductType;
}) {
  const product_labels: Record<ProductType, string> = {
    free_check: "Free Check",
    ppsr: "PPSR Report",
    dealer_review: "Dealer Review",
    full_pack: "Full Confidence Pack",
    deal_room: "Deal Room",
  };

  const product_descriptions: Record<ProductType, string> = {
    free_check: "Your free vehicle listing check.",
    ppsr: "Official PPSR (Personal Properties Securities Register) check — confirms whether there's any finance owing, if the car has been reported stolen, or if it's a write-off.",
    dealer_review: "A detailed dealer review of the vehicle, drawing on 15 years of automotive industry experience.",
    full_pack: "The complete package — PPSR check plus expert dealer review, giving you maximum confidence before you buy.",
    deal_room: "A shared handover workspace for recording private vehicle sale details.",
  };

  const label = product_labels[product] ?? "Vehicle Report";
  const description = product_descriptions[product] ?? "";

  const content = `
  <div class="header">
    <h1>Buying Buddy</h1>
    <p>Your ${label} is Ready</p>
  </div>
  <div class="body">
    <p style="font-size:15px; color:#374151;">Hi there,</p>
    <p style="font-size:15px; color:#374151;">Your <strong>${label}</strong> has been generated. Here's what you ordered:</p>

    <div class="vehicle-card">
      <p><strong>Product:</strong> <span class="product-badge">${label}</span></p>
      <p><strong>Order ID:</strong> ${order_id}</p>
      <p>${description}</p>
    </div>

    <p style="font-size:14px; color:#6B7280; margin-top:20px;">
      Your full PDF report is attached to this email. We recommend reviewing it alongside the vehicle in person (or alongside a pre-purchase inspection) before making any decision.
    </p>

    <a href="https://buyingbuddy.com.au" class="cta">Visit Buying Buddy</a>
  </div>`;

  await get_resend().emails.send({
    from: FROM,
    to: email,
    subject: `Your ${label} — Buying Buddy`,
    html: email_html(content),
    attachments: [
      {
        path: report_path,
      },
    ],
  });
}

export async function send_deal_room_buyer_email({
  buyer_email,
  deal_id,
  deal_url,
}: {
  buyer_email: string;
  deal_id: string;
  deal_url: string;
}) {
  const content = `
  <div class="header">
    <h1>Buying Buddy</h1>
    <p>Your Deal Room is ready</p>
  </div>
  <div class="body">
    <p style="font-size:15px; color:#374151;">Your shared Deal Room is live.</p>

    <div class="vehicle-card">
      <p><strong>Deal ID:</strong> ${deal_id}</p>
      <p><strong>Seller share link:</strong> <a href="${deal_url}" style="color:${BRAND_TEAL};">${deal_url}</a></p>
    </div>

    <div class="verdict-box">
      This Deal Record is a voluntary summary of transaction details. Not a legal contract. Not legal advice.
    </div>

    <a href="${deal_url}" class="cta">Open Deal Room</a>
  </div>`;

  await get_resend().emails.send({
    from: FROM,
    to: buyer_email,
    subject: `Your Deal Room is Ready - ${deal_id}`,
    html: email_html(content),
  });
}

export async function send_deal_summary_email({
  buyer_email,
  deal_id,
  deal_url,
  report_path,
  seller_email,
}: {
  buyer_email: string;
  deal_id: string;
  deal_url: string;
  report_path: string;
  seller_email: string;
}) {
  const content = `
  <div class="header">
    <h1>Buying Buddy</h1>
    <p>Your Deal Record summary is attached</p>
  </div>
  <div class="body">
    <p style="font-size:15px; color:#374151;">The Deal Room has been finalised.</p>

    <div class="vehicle-card">
      <p><strong>Deal ID:</strong> ${deal_id}</p>
      <p><strong>Deal Room:</strong> <a href="${deal_url}" style="color:${BRAND_TEAL};">${deal_url}</a></p>
      <p><strong>Attached:</strong> Deal Record PDF summary</p>
    </div>

    <div class="verdict-box">
      This Deal Record is a voluntary summary of transaction details. Not a legal contract. Not legal advice.
    </div>

    <a href="${deal_url}" class="cta">Open Deal Room</a>
  </div>`;

  await get_resend().emails.send({
    from: FROM,
    to: [buyer_email, seller_email],
    subject: `Deal Record Finalised - ${deal_id}`,
    html: email_html(content),
    attachments: [
      {
        path: report_path,
      },
    ],
  });
}
