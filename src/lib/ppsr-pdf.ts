import "@/lib/pdfkit-compat";
import PDFDocument from "pdfkit";
import type { PPSRExtractedData, PPSRVerdict } from "@/lib/types";

type PPSRDoc = InstanceType<typeof PDFDocument>;

const NAVY = "#1A237E";
const LIME = "#00C853";
const DARK_TEXT = "#1F2937";
const MUTED_TEXT = "#4B5563";
const FOOTER_TEXT = "#6B7280";
const LIGHT_GRAY = "#F3F4F6";
const BORDER_GRAY = "#D1D5DB";
const ALERT_RED = "#DC2626";
const CAUTION_AMBER = "#D97706";
const PAGE_WIDTH = 595.28;
const MARGIN = 50;
const TOP_OFFSET = 100;
const BOTTOM_GUARD = 70;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const STATUS_WIDTH = 50;
const LABEL_WIDTH = 140;
const DETAIL_X = MARGIN + STATUS_WIDTH + LABEL_WIDTH + 14;
const DETAIL_WIDTH = CONTENT_WIDTH - STATUS_WIDTH - LABEL_WIDTH - 14;

const VERDICT_COLOR: Record<PPSRVerdict, string> = {
  CLEAR: LIME,
  CAUTION: CAUTION_AMBER,
  ALERT: ALERT_RED,
};

const VERDICT_BG: Record<PPSRVerdict, string> = {
  CLEAR: "#F0FFF4",
  CAUTION: "#FFFBEB",
  ALERT: "#FEF2F2",
};

function clean_pdf_text(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/(?:\u2022|â€¢)/g, "-")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\s+/g, " ")
    .trim();
}

function safe_report_filename(filename: string): string {
  const raw = filename || `ppsr-report-${Date.now()}.pdf`;
  const base = raw.split(/[\\/]/).pop()!.replace(/[^a-zA-Z0-9._-]/g, "_");

  if (!base || base === "." || base === "..") {
    return `ppsr-report-${Date.now()}.pdf`;
  }

  return base.toLowerCase().endsWith(".pdf") ? base : `${base}.pdf`;
}

function draw_box(
  doc: PPSRDoc,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  stroke = BORDER_GRAY,
) {
  doc.save();
  doc.lineWidth(0.7);
  doc.rect(x, y, width, height).fillAndStroke(fill, stroke);
  doc.restore();
}

function draw_footer(doc: PPSRDoc, page_num: number, total_pages: number) {
  doc
    .fontSize(9)
    .fillColor(FOOTER_TEXT)
    .text("buyingbuddy.com.au | info@buyingbuddy.com.au", MARGIN, doc.page.height - 40, {
      align: "center",
      width: CONTENT_WIDTH,
    });
  doc.text(`Page ${page_num} of ${total_pages}`, MARGIN, doc.page.height - 28, {
    align: "center",
    width: CONTENT_WIDTH,
  });
}

function draw_header(doc: PPSRDoc) {
  doc.rect(0, 0, PAGE_WIDTH, 80).fillColor(NAVY).fill();

  doc.fillColor("#FFFFFF").fontSize(24).text("Buying Buddy", MARGIN, 20, {
    align: "left",
    width: CONTENT_WIDTH,
  });
  doc.fillColor(LIME).fontSize(13).text("PPSR Vehicle Report", MARGIN, 50, {
    align: "left",
    width: CONTENT_WIDTH,
  });
}

function start_new_page(doc: PPSRDoc): number {
  doc.addPage();
  draw_header(doc);
  return TOP_OFFSET;
}

function ensure_page_space(doc: PPSRDoc, y: number, required_height: number): number {
  if (y + required_height <= doc.page.height - BOTTOM_GUARD) {
    return y;
  }

  return start_new_page(doc);
}

function draw_section_heading(doc: PPSRDoc, title: string, y: number): number {
  y = ensure_page_space(doc, y, 32);
  doc.fontSize(13).fillColor(NAVY).text(title, MARGIN, y);
  y += 4;
  doc
    .moveTo(MARGIN, y + 14)
    .lineTo(PAGE_WIDTH - MARGIN, y + 14)
    .strokeColor(LIME)
    .lineWidth(2)
    .stroke();
  return y + 22;
}

function draw_vehicle_summary(doc: PPSRDoc, data: PPSRExtractedData): number {
  let y = draw_section_heading(doc, "Vehicle Summary", TOP_OFFSET);

  const rows: [string, string][] = [
    ["VIN", data.vin ?? "Not provided"],
    ["Registration", data.rego ?? "Not provided"],
    ["Make", data.make ?? "Not provided"],
    ["Model", data.model ?? "Not provided"],
    ["Year", data.year?.toString() ?? "Not provided"],
    ["Rego Status", data.registration_status ?? "Not available"],
    ["Rego Expiry", data.registration_expiry ?? "Not available"],
  ];

  for (const [label, value] of rows) {
    doc.fontSize(10);
    const row_height = Math.max(
      24,
      doc.heightOfString(value, { width: CONTENT_WIDTH - 146 }) + 12,
    );
    y = ensure_page_space(doc, y, row_height + 2);

    draw_box(doc, MARGIN, y, CONTENT_WIDTH, row_height, LIGHT_GRAY);
    doc.fillColor(MUTED_TEXT).fontSize(10).text(label, MARGIN + 8, y + 7, { width: 130 });
    doc.fillColor(DARK_TEXT).text(clean_pdf_text(value), MARGIN + 140, y + 7, {
      width: CONTENT_WIDTH - 150,
    });
    y += row_height;
  }

  return y + 14;
}

function draw_verdict_box(doc: PPSRDoc, data: PPSRExtractedData, start_y: number): number {
  const verdict_color = VERDICT_COLOR[data.verdict];
  const verdict_bg = VERDICT_BG[data.verdict];
  const summary = clean_pdf_text(data.summary || "PPSR check completed.");

  doc.fontSize(11);
  const summary_height = doc.heightOfString(summary, {
    width: CONTENT_WIDTH - 170,
    lineGap: 2,
  });
  const box_height = Math.max(58, summary_height + 24);

  let y = ensure_page_space(doc, start_y, box_height + 40);
  y = draw_section_heading(doc, "Verdict", y);

  doc.rect(MARGIN, y, CONTENT_WIDTH, box_height).fillColor(verdict_bg).fill();
  doc.rect(MARGIN, y, 6, box_height).fillColor(verdict_color).fill();
  doc.fillColor(verdict_color).fontSize(20).text(data.verdict, MARGIN + 18, y + 12, {
    width: 130,
  });
  doc.fillColor(DARK_TEXT).fontSize(11).text(summary, MARGIN + 150, y + 12, {
    width: CONTENT_WIDTH - 170,
    lineGap: 2,
  });

  return y + box_height + 14;
}

function draw_check_row(
  doc: PPSRDoc,
  label: string,
  flagged: boolean,
  details: string,
  y: number,
  flagged_color = ALERT_RED,
  flagged_label = "FLAG",
): number {
  const status = flagged ? flagged_label : "CLEAR";
  const status_color = flagged ? flagged_color : LIME;
  const detail_text = clean_pdf_text(details);

  doc.fontSize(10);
  const detail_height = doc.heightOfString(detail_text, {
    width: DETAIL_WIDTH,
    lineGap: 2,
  });
  const row_height = Math.max(24, detail_height + 10);
  y = ensure_page_space(doc, y, row_height + 4);

  draw_box(doc, MARGIN, y, CONTENT_WIDTH, row_height, "#FFFFFF");
  doc.fillColor(status_color).fontSize(10).text(status, MARGIN + 8, y + 7, {
    width: STATUS_WIDTH - 12,
  });
  doc.fillColor(DARK_TEXT).text(label, MARGIN + STATUS_WIDTH, y + 7, {
    width: LABEL_WIDTH,
  });
  doc.fillColor(MUTED_TEXT).text(detail_text, DETAIL_X, y + 7, {
    width: DETAIL_WIDTH,
    lineGap: 2,
  });

  return y + row_height + 8;
}

function draw_checks_section(doc: PPSRDoc, data: PPSRExtractedData, start_y: number): number {
  let y = draw_section_heading(doc, "Finance Check", start_y);
  y = draw_check_row(
    doc,
    "Finance Owing",
    data.finance_owing,
    data.finance_details ?? "No finance/security interest detected in the parsed PPSR text.",
    y,
  );

  y = draw_section_heading(doc, "Stolen Check", y + 4);
  y = draw_check_row(
    doc,
    "Stolen Vehicle",
    data.stolen,
    data.stolen_details ?? "Not recorded as stolen in the parsed PPSR text.",
    y,
  );

  y = draw_section_heading(doc, "Write-Off History", y + 4);
  const repairable_writeoff = /repairable write-?off/i.test(data.writeoff_details ?? "");
  y = draw_check_row(
    doc,
    "Write-Off Recorded",
    data.writeoff,
    data.writeoff_details ?? "No write-off record detected in the parsed PPSR text.",
    y,
    repairable_writeoff ? CAUTION_AMBER : ALERT_RED,
    repairable_writeoff ? "CAUTION" : "FLAG",
  );

  y = draw_section_heading(doc, "Registration Status", y + 4);
  const rego_status = data.registration_status ?? "Not available";
  const rego_details = data.registration_expiry
    ? `${rego_status} | Expiry: ${data.registration_expiry}`
    : rego_status;
  const rego_flagged =
    /(expired|unregistered|not currently registered|not registered|de-?registered)/i.test(
      rego_status,
    );

  return (
    draw_check_row(
      doc,
      "Registration",
      rego_flagged,
      rego_details,
      y,
      CAUTION_AMBER,
      "CAUTION",
    ) + 6
  );
}

function draw_caution_banner(
  doc: PPSRDoc,
  verdict: PPSRExtractedData["verdict"],
  start_y: number,
): number {
  if (verdict === "CLEAR") {
    return start_y;
  }

  const is_alert = verdict === "ALERT";
  const bg = is_alert ? "#FEF2F2" : "#FFFBEB";
  const border = is_alert ? ALERT_RED : CAUTION_AMBER;
  const text = is_alert
    ? "ACTION REQUIRED: Do not purchase this vehicle until the flagged PPSR issues are fully resolved."
    : "CAUTION: Review the PPSR history and registration details carefully before making an offer.";

  doc.fontSize(10);
  const text_height = doc.heightOfString(text, { width: CONTENT_WIDTH - 24, lineGap: 2 });
  const box_height = text_height + 20;
  const y = ensure_page_space(doc, start_y, box_height + 10);

  doc.rect(MARGIN, y, CONTENT_WIDTH, box_height).fillColor(bg).fill();
  doc.rect(MARGIN, y, 4, box_height).fillColor(border).fill();
  doc.fontSize(10).fillColor(border).text(text, MARGIN + 14, y + 10, {
    width: CONTENT_WIDTH - 28,
    lineGap: 2,
  });

  return y + box_height + 14;
}

function draw_text_section(doc: PPSRDoc, title: string, body: string, start_y: number): number {
  const clean_body = clean_pdf_text(body || "No details available.");

  doc.fontSize(11);
  const text_height = doc.heightOfString(clean_body, {
    width: CONTENT_WIDTH,
    lineGap: 4,
  });

  let y = ensure_page_space(doc, start_y, text_height + 60);
  y = draw_section_heading(doc, title, y);
  doc.fontSize(11).fillColor("#374151").text(clean_body, MARGIN, y, {
    width: CONTENT_WIDTH,
    lineGap: 4,
  });

  return doc.y + 16;
}

export async function generate_ppsr_pdf(
  data: PPSRExtractedData,
  filename: string,
): Promise<{ buffer: Buffer; filename: string }> {
  const safe_filename = safe_report_filename(filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: MARGIN,
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => {
      resolve({ buffer: Buffer.concat(chunks), filename: safe_filename });
    });
    doc.on("error", reject);

    draw_header(doc);

    let y = draw_vehicle_summary(doc, data);
    y = draw_verdict_box(doc, data, y + 6);
    y = draw_checks_section(doc, data, y + 6);
    y = draw_caution_banner(doc, data.verdict, y);
    y = draw_text_section(doc, "What This Means", data.what_this_means, y + 4);
    draw_text_section(doc, "What To Do Next", data.what_to_do_next, y + 4);

    const total_pages = doc.bufferedPageRange().count;
    for (let page_index = 0; page_index < total_pages; page_index += 1) {
      doc.switchToPage(page_index);
      draw_footer(doc, page_index + 1, total_pages);
    }

    doc.end();
  });
}
