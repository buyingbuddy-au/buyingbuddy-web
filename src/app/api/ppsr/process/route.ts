import { readFileSync } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { is_admin_request } from "@/lib/admin-auth";
import { get_order_by_id, to_sqlite_datetime, update_order } from "@/lib/db";
import { generate_ppsr_pdf } from "@/lib/ppsr-pdf";
import { extract_ppsr_data } from "@/lib/ppsr-report-generator";
import type { JsonValue, OrderRecord, PPSRExtractedData } from "@/lib/types";

export const runtime = "nodejs";

const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID?.trim() || "1296786949";
const TELEGRAM_TIMEOUT_MS = 15_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function serialise_ppsr_result(data: PPSRExtractedData): JsonValue {
  return JSON.parse(JSON.stringify(data)) as JsonValue;
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

function resolve_next_status(order: OrderRecord): OrderRecord["status"] {
  if (order.status === "complete" || order.status === "refunded") {
    return order.status;
  }

  return order.product === "ppsr" ? "complete" : "awaiting_review";
}

async function parse_request_payload(req: NextRequest): Promise<{
  raw_ppsr_text: string;
  customer_email: string | null;
  order_id: string | null;
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

  return { raw_ppsr_text, customer_email, order_id };
}

async function send_ppsr_report_email({
  email,
  data,
  report_path,
}: {
  email: string;
  data: PPSRExtractedData;
  report_path: string;
}) {
  const resend = get_resend_client();
  const verdict_color =
    data.verdict === "CLEAR" ? "#00C853" : data.verdict === "CAUTION" ? "#D97706" : "#DC2626";
  const vehicle_label =
    [data.make, data.model, data.year ? String(data.year) : null]
      .filter((part): part is string => Boolean(part))
      .map((part) => escape_html(part))
      .join(" ") || "N/A";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F9FAFB; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .header { background: #1A237E; padding: 28px 40px; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.75); margin: 4px 0 0; font-size: 14px; }
    .body { padding: 32px 40px; }
    .verdict-pill { display: inline-block; background: ${verdict_color}; color: #fff; font-size: 18px; font-weight: 700; padding: 8px 24px; border-radius: 24px; margin: 12px 0 20px; letter-spacing: 1px; }
    .row { display: flex; justify-content: space-between; border-bottom: 1px solid #E5E7EB; padding: 10px 0; font-size: 14px; gap: 16px; }
    .row .label { color: #6B7280; }
    .row .val { color: #111827; font-weight: 500; text-align: right; }
    .section-title { font-size: 13px; font-weight: 700; color: #1A237E; text-transform: uppercase; letter-spacing: 0.5px; margin: 24px 0 8px; }
    .info-box { background: #F0F4FF; border-left: 4px solid #1A237E; padding: 14px 18px; font-size: 14px; color: #374151; line-height: 1.6; border-radius: 0 6px 6px 0; margin: 12px 0; }
    .footer { background: #F3F4F6; padding: 20px 40px; text-align: center; }
    .footer p { color: #6B7280; font-size: 12px; margin: 0; }
    .footer a { color: #1A237E; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Buying Buddy</h1>
      <p>Your PPSR Report is Ready</p>
    </div>
    <div class="body">
      <p style="font-size:15px; color:#374151;">Hi there,</p>
      <p style="font-size:15px; color:#374151;">Your PPSR report has been generated. The full PDF is attached to this email.</p>

      <p class="section-title">VERDICT</p>
      <span class="verdict-pill">${data.verdict}</span>
      <p style="font-size:14px; color:#374151; margin-top:8px;">${escape_html(data.summary)}</p>

      <p class="section-title">Vehicle</p>
      <div class="row"><span class="label">VIN</span><span class="val">${escape_html(data.vin ?? "N/A")}</span></div>
      <div class="row"><span class="label">Rego</span><span class="val">${escape_html(data.rego ?? "N/A")}</span></div>
      <div class="row"><span class="label">Make / Model</span><span class="val">${vehicle_label}</span></div>

      <p class="section-title">Check Results</p>
      <div class="row"><span class="label">Finance Owing</span><span class="val" style="color:${data.finance_owing ? "#DC2626" : "#00C853"}">${data.finance_owing ? "YES" : "CLEAR"}</span></div>
      <div class="row"><span class="label">Stolen</span><span class="val" style="color:${data.stolen ? "#DC2626" : "#00C853"}">${data.stolen ? "YES" : "CLEAR"}</span></div>
      <div class="row"><span class="label">Write-Off</span><span class="val" style="color:${data.writeoff ? "#D97706" : "#00C853"}">${data.writeoff ? "ON RECORD" : "CLEAR"}</span></div>
      <div class="row"><span class="label">Registration</span><span class="val">${escape_html(data.registration_status ?? "N/A")}</span></div>

      <p class="section-title">What This Means</p>
      <div class="info-box">${escape_html(data.what_this_means)}</div>

      <p class="section-title">What To Do Next</p>
      <div class="info-box">${escape_html(data.what_to_do_next)}</div>
    </div>
    <div class="footer">
      <p>(c) ${new Date().getFullYear()} Buying Buddy - <a href="https://buyingbuddy.com.au">buyingbuddy.com.au</a></p>
      <p>Questions? Email <a href="mailto:info@buyingbuddy.com.au">info@buyingbuddy.com.au</a></p>
    </div>
  </div>
</body>
</html>`;

  let attachment_content: Buffer;
  try {
    attachment_content = readFileSync(report_path);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown file read error.";
    throw new PPSRProcessRouteError(
      `Failed to read generated PDF attachment: ${message}`,
      500,
    );
  }

  let response: Awaited<ReturnType<typeof resend.emails.send>>;
  try {
    response = await resend.emails.send({
      from: "Buying Buddy <info@buyingbuddy.com.au>",
      to: email,
      subject: `Your PPSR Report - Verdict: ${data.verdict}`,
      html,
      attachments: [
        {
          content: attachment_content,
          filename: path.basename(report_path),
          contentType: "application/pdf",
        },
      ],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Resend error.";
    throw new PPSRProcessRouteError(
      `Failed to send PPSR report email: ${message}`,
      502,
    );
  }

  if (response.error) {
    throw new PPSRProcessRouteError(
      `Failed to send PPSR report email: ${response.error.message}`,
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
    const { raw_ppsr_text, customer_email, order_id } = await parse_request_payload(req);
    const order = order_id ? get_order_by_id(order_id) : null;

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
    const filename = build_report_filename(order?.id ?? order_id);
    const report = await generate_ppsr_pdf(data, filename);

    if (order) {
      update_order(order.id, {
        ppsr_result: serialise_ppsr_result(data),
        ppsr_checked_at: to_sqlite_datetime(),
        report_pdf_path: report.relative_path,
      });
    }

    await send_ppsr_report_email({
      email: resolved_email,
      data,
      report_path: report.absolute_path,
    });

    if (order) {
      update_order(order.id, {
        report_sent_at: to_sqlite_datetime(),
        status: resolve_next_status(order),
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
      reportPath: report.relative_path,
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
