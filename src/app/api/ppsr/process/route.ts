import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { is_admin_request } from "@/lib/admin-auth";
import { get_order_by_id, to_sqlite_datetime, update_order } from "@/lib/db";
import { generate_ppsr_pdf } from "@/lib/ppsr-pdf";
import { build_ppsr_customer_guide, type PPSRCustomerGuide } from "@/lib/ppsr-customer-guide";
import { extract_ppsr_data } from "@/lib/ppsr-report-generator";
import type { JsonValue, OrderRecord, PPSRExtractedData } from "@/lib/types";

export const runtime = "nodejs";

const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID?.trim() || "1296786949";
const TELEGRAM_TIMEOUT_MS = 15_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_PPSR_FULFILMENT_EMAIL = "info@buyingbuddy.com.au";
const MAX_CERTIFICATE_PDF_BYTES = 8 * 1024 * 1024;

class PPSRProcessRouteError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PPSRProcessRouteError";
    this.status = status;
  }
}

function escape_html(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

function get_resend_client() {
  const api_key = process.env.RESEND_API_KEY?.trim();
  if (!api_key) {
    throw new PPSRProcessRouteError("RESEND_API_KEY is not configured.", 500);
  }

  return new Resend(api_key);
}

function get_ppsr_fulfilment_email(): string {
  const configured = process.env.PPSR_FULFILMENT_EMAIL?.trim();
  if (configured && EMAIL_RE.test(configured)) {
    return configured;
  }

  return DEFAULT_PPSR_FULFILMENT_EMAIL;
}

function get_resend_reply_to(): string {
  const configured = process.env.RESEND_REPLY_TO?.trim();
  if (configured && EMAIL_RE.test(configured)) {
    return configured;
  }

  return DEFAULT_PPSR_FULFILMENT_EMAIL;
}

function html_to_text(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function safe_attachment_filename(filename: string | null, fallback: string): string {
  const cleaned = (filename ?? "")
    .replace(/[/\\]/g, "-")
    .replace(/[^a-zA-Z0-9._ -]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || fallback;
}

function normalise_base64_payload(value: string): string {
  const comma_index = value.indexOf(",");
  const without_data_url = value.startsWith("data:") && comma_index >= 0
    ? value.slice(comma_index + 1)
    : value;

  return without_data_url.replace(/\s+/g, "");
}

function decode_optional_certificate_pdf({
  base64,
  filename,
}: {
  base64: string | null;
  filename: string | null;
}): { buffer: Buffer; filename: string } | null {
  if (!base64) {
    return null;
  }

  const normalised = normalise_base64_payload(base64);
  if (!normalised || !/^[a-zA-Z0-9+/]+={0,2}$/.test(normalised)) {
    throw new PPSRProcessRouteError("certificatePdfBase64 must be valid base64.", 400);
  }

  const buffer = Buffer.from(normalised, "base64");
  if (buffer.length === 0) {
    throw new PPSRProcessRouteError("certificatePdfBase64 decoded to an empty file.", 400);
  }

  if (buffer.length > MAX_CERTIFICATE_PDF_BYTES) {
    throw new PPSRProcessRouteError("certificatePdfBase64 exceeds the 8MB upload limit.", 400);
  }

  if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new PPSRProcessRouteError("certificatePdfBase64 must decode to a PDF file.", 400);
  }

  return {
    buffer,
    filename: safe_attachment_filename(filename, "official-ppsr-certificate.pdf"),
  };
}

function guide_to_json(guide: PPSRCustomerGuide): JsonValue {
  return JSON.parse(JSON.stringify(guide)) as JsonValue;
}

function serialise_ppsr_result(data: PPSRExtractedData, guide: PPSRCustomerGuide): JsonValue {
  return JSON.parse(JSON.stringify({
    ...data,
    customer_guide: guide_to_json(guide),
  })) as JsonValue;
}

function build_report_filename(order_id: string | null) {
  const base = order_id?.trim() || `manual-${Date.now()}`;
  return `ppsr_${base}_${Date.now()}.pdf`;
}

function parse_optional_string_field(
  value: unknown,
  field_name: string,
): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new PPSRProcessRouteError(
      `${field_name} must be a string when provided.`,
      400,
    );
  }

  return value.trim();
}

function resolve_next_status_after_fulfilment(order: OrderRecord): OrderRecord["status"] {
  if (order.status === "complete" || order.status === "refunded") {
    return order.status;
  }

  return "awaiting_review";
}

async function parse_request_payload(req: NextRequest): Promise<{
  raw_ppsr_text: string;
  customer_email: string | null;
  order_id: string | null;
  certificate_pdf: { buffer: Buffer; filename: string } | null;
}> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new PPSRProcessRouteError("Invalid JSON request body.", 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new PPSRProcessRouteError("Request body must be a JSON object.", 400);
  }

  const record = body as Record<string, unknown>;
  const raw_ppsr_text =
    typeof record.rawPPSRText === "string" ? record.rawPPSRText.trim() : "";

  if (!raw_ppsr_text) {
    throw new PPSRProcessRouteError("rawPPSRText is required.", 400);
  }

  const customer_email = parse_optional_string_field(
    record.customerEmail,
    "customerEmail",
  );
  if (customer_email && !EMAIL_RE.test(customer_email)) {
    throw new PPSRProcessRouteError("customerEmail must be a valid email address.", 400);
  }

  const order_id = parse_optional_string_field(record.orderId, "orderId");
  if (record.orderId !== undefined && record.orderId !== null && !order_id) {
    throw new PPSRProcessRouteError(
      "orderId must be a non-empty string when provided.",
      400,
    );
  }

  const certificate_pdf = decode_optional_certificate_pdf({
    base64: parse_optional_string_field(
      record.certificatePdfBase64,
      "certificatePdfBase64",
    ),
    filename: parse_optional_string_field(
      record.certificateFilename,
      "certificateFilename",
    ),
  });

  return { raw_ppsr_text, customer_email, order_id, certificate_pdf };
}

function guide_sections_html(guide: PPSRCustomerGuide): string {
  return guide.sections
    .map((section) => {
      const color = section.status_tone === "clear"
        ? "#047857"
        : section.status_tone === "caution"
          ? "#B45309"
          : "#B91C1C";
      const actions = section.actions
        .map((action) => `<li>${escape_html(action)}</li>`)
        .join("");

      return `<div class="card">
        <div class="card-top">
          <span>${escape_html(section.kicker)}</span>
          <strong style="color:${color}">${escape_html(section.status_label)}</strong>
        </div>
        <h3>${escape_html(section.title)}</h3>
        <p>${escape_html(section.summary)}</p>
        <ul>${actions}</ul>
      </div>`;
    })
    .join("");
}

async function send_ppsr_fulfilment_email({
  fulfilment_email,
  customer_email,
  order_id,
  data,
  customer_guide,
  report_buffer,
  report_filename,
  certificate_pdf,
}: {
  fulfilment_email: string;
  customer_email: string;
  order_id: string | null;
  data: PPSRExtractedData;
  customer_guide: PPSRCustomerGuide;
  report_buffer: Buffer;
  report_filename: string;
  certificate_pdf: { buffer: Buffer; filename: string } | null;
}) {
  const resend = get_resend_client();
  const verdict_color =
    data.verdict === "CLEAR" ? "#047857" : data.verdict === "CAUTION" ? "#B45309" : "#B91C1C";
  const vehicle_label = escape_html(customer_guide.vehicle_label);
  const guide_html = guide_sections_html(customer_guide);
  const next_steps = customer_guide.next_steps
    .map((step) => `<li>${escape_html(step)}</li>`)
    .join("");
  const attachments = [
    {
      content: report_buffer,
      filename: report_filename,
      contentType: "application/pdf",
    },
    certificate_pdf
      ? {
          content: certificate_pdf.buffer,
          filename: certificate_pdf.filename,
          contentType: "application/pdf",
        }
      : null,
  ].filter((attachment): attachment is { content: Buffer; filename: string; contentType: string } => Boolean(attachment));

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F8FAFC; margin: 0; padding: 0; }
    .wrapper { max-width: 720px; margin: 32px auto; background: #fff; border-radius: 20px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08); }
    .header { background: #0F172A; padding: 30px 36px; color: #fff; }
    .header h1 { margin: 0; font-size: 22px; }
    .header p { margin: 8px 0 0; color: #CBD5E1; line-height: 1.5; }
    .body { padding: 30px 36px; }
    .warning { background: #FEF2F2; border: 1px solid #FCA5A5; color: #991B1B; border-radius: 14px; padding: 12px 14px; font-size: 13px; font-weight: 700; }
    .verdict { display: inline-block; margin: 18px 0 10px; border-radius: 999px; background: ${verdict_color}; color: #fff; padding: 8px 16px; font-size: 13px; font-weight: 900; letter-spacing: 0.08em; }
    .meta { display: grid; gap: 8px; margin: 18px 0; }
    .meta div { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; font-size: 14px; }
    .meta span { color: #64748B; }
    .meta strong { color: #0F172A; text-align: right; }
    .card { border: 1px solid #E5E7EB; border-radius: 16px; padding: 16px; margin: 12px 0; background: #F8FAFC; }
    .card-top { display: flex; justify-content: space-between; gap: 12px; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #64748B; }
    .card h3 { margin: 10px 0 6px; color: #0F172A; }
    .card p { margin: 0 0 10px; color: #334155; line-height: 1.55; }
    .card li { margin: 6px 0; color: #334155; }
    .section-title { color: #0F172A; font-size: 15px; font-weight: 900; margin: 26px 0 10px; }
    .footer { background: #F1F5F9; padding: 18px 36px; color: #64748B; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>PPSR ready for customer guide</h1>
      <p>Use the attached certificate/report to prepare the short interactive Buying Buddy explanation.</p>
    </div>
    <div class="body">
      <div class="warning">Do not forward this internal fulfilment email to the customer as-is.</div>
      <span class="verdict">${escape_html(data.verdict)}</span>
      <h2 style="margin:0;color:#0F172A;">${escape_html(customer_guide.headline)}</h2>
      <p style="color:#475569;line-height:1.6;">${escape_html(customer_guide.subheadline)}</p>

      <div class="meta">
        <div><span>Customer email</span><strong>${escape_html(customer_email)}</strong></div>
        <div><span>Order ID</span><strong>${escape_html(order_id ?? "manual")}</strong></div>
        <div><span>Vehicle</span><strong>${vehicle_label}</strong></div>
        <div><span>VIN / Rego</span><strong>${escape_html(data.vin ?? data.rego ?? "Check certificate")}</strong></div>
      </div>

      <p class="section-title">Customer guide cards</p>
      ${guide_html}

      <p class="section-title">Next-step script</p>
      <ul>${next_steps}</ul>

      <p style="font-size:13px;color:#64748B;line-height:1.6;">${escape_html(customer_guide.certificate_note)}</p>
    </div>
    <div class="footer">Buying Buddy fulfilment inbox: ${escape_html(fulfilment_email)}</div>
  </div>
</body>
</html>`;

  let response: Awaited<ReturnType<typeof resend.emails.send>>;
  try {
    response = await resend.emails.send({
      from: "Buying Buddy <info@buyingbuddy.com.au>",
      to: fulfilment_email,
      replyTo: get_resend_reply_to(),
      subject: `PPSR ready for customer guide - ${data.verdict}${order_id ? ` - ${order_id}` : ""}`,
      html,
      text: html_to_text(html),
      attachments,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Resend error.";
    throw new PPSRProcessRouteError(
      `Failed to send PPSR fulfilment email: ${message}`,
      502,
    );
  }

  if (response.error) {
    throw new PPSRProcessRouteError(
      `Failed to send PPSR fulfilment email: ${response.error.message}`,
      502,
    );
  }
}

async function send_telegram_notification({
  customer_email,
  order_id,
  data,
}: {
  customer_email: string;
  order_id: string | null;
  data: PPSRExtractedData;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    console.warn("[PPSR] TELEGRAM_BOT_TOKEN missing. Notification skipped.");
    return false;
  }

  const vehicle = [data.make, data.model, data.year ? String(data.year) : null]
    .filter(Boolean)
    .join(" ") || "Unknown vehicle";
  const text = [
    "PPSR REPORT GENERATED",
    `Verdict: ${data.verdict}`,
    `Vehicle: ${vehicle} (${data.vin ?? data.rego ?? "no VIN/rego"})`,
    `Customer: ${customer_email}`,
    order_id ? `Order ID: ${order_id}` : null,
    data.finance_owing ? "Finance owing" : null,
    data.stolen ? "Stolen flag" : null,
    data.writeoff ? "Write-off on record" : null,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");

  const response = await fetch(
    `https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
      signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram notification failed: ${response.status} ${body}`);
  }

  return true;
}

export async function POST(req: NextRequest) {
  if (!is_admin_request(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { raw_ppsr_text, customer_email, order_id, certificate_pdf } = await parse_request_payload(req);
    const order = order_id ? await get_order_by_id(order_id) : null;

    if (order_id && !order) {
      throw new PPSRProcessRouteError("Order not found.", 404);
    }

    if (order && customer_email && order.customer_email.toLowerCase() !== customer_email.toLowerCase()) {
      throw new PPSRProcessRouteError(
        "customerEmail does not match the selected order.",
        400,
      );
    }

    const resolved_email = order?.customer_email ?? customer_email;
    if (!resolved_email) {
      throw new PPSRProcessRouteError(
        "customerEmail is required when orderId is not provided.",
        400,
      );
    }

    const data = await extract_ppsr_data(raw_ppsr_text);
    const customer_guide = build_ppsr_customer_guide(data);
    const fulfilment_email = get_ppsr_fulfilment_email();
    const filename = build_report_filename(order?.id ?? order_id);
    const report = await generate_ppsr_pdf(data, filename);

    await send_ppsr_fulfilment_email({
      fulfilment_email,
      customer_email: resolved_email,
      order_id: order?.id ?? order_id,
      data,
      customer_guide,
      report_buffer: report.buffer,
      report_filename: report.filename,
      certificate_pdf,
    });

    if (order) {
      await update_order(order.id, {
        ppsr_result: serialise_ppsr_result(data, customer_guide),
        ppsr_checked_at: to_sqlite_datetime(),
        report_pdf_path: report.filename,
      });
      await update_order(order.id, {
        status: resolve_next_status_after_fulfilment(order),
      });
    }

    let telegram_sent = false;
    try {
      telegram_sent = await send_telegram_notification({
        customer_email: resolved_email,
        order_id: order?.id ?? order_id,
        data,
      });
    } catch (telegram_error) {
      console.warn("[PPSR] Telegram notification failed:", telegram_error);
    }

    return NextResponse.json({
      ok: true,
      data,
      customerGuide: customer_guide,
      customerEmail: resolved_email,
      sentTo: fulfilment_email,
      reportPath: report.filename,
      telegramSent: telegram_sent,
    });
  } catch (err) {
    const status = err instanceof PPSRProcessRouteError ? err.status : 500;
    const message =
      err instanceof Error
        ? err.message
        : "Failed to process PPSR report.";

    console.error("[PPSR] Process error:", err);
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
