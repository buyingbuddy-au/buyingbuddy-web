import "@/lib/pdfkit-compat";
import PDFDocument from "pdfkit";
import type { DealRecord } from "@/lib/types";

const TEAL = "#0D9488";
const DARK = "#1F2937";
const MID = "#4B5563";
const LIGHT = "#F3F4F6";
const BORDER = "#D1D5DB";
const PAGE_WIDTH = 595.28;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const DISCLAIMER =
  "This Deal Record is a voluntary summary of transaction details. Not a legal contract. Not legal advice.";

type DealPdfDocument = InstanceType<typeof PDFDocument>;

function format_value(value: string | number | null | undefined) {
  const string_value = String(value ?? "").trim();
  return string_value ? string_value : "Not supplied";
}

function format_price(value: string | null) {
  const cleaned = value?.replace(/[^\d.]/g, "") ?? "";
  const parsed = Number(cleaned);

  if (!cleaned || Number.isNaN(parsed)) {
    return format_value(value);
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(parsed);
}

function payment_label(value: string | null) {
  if (value === "bank_transfer") {
    return "Bank transfer";
  }

  if (value === "payid") {
    return "PayID";
  }

  if (value === "cash") {
    return "Cash";
  }

  return format_value(value);
}

function draw_footer(doc: DealPdfDocument) {
  const range = doc.bufferedPageRange();

  for (let i = 0; i < range.count; i += 1) {
    doc.switchToPage(range.start + i);
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#6B7280")
      .text(DISCLAIMER, MARGIN, doc.page.height - 42, {
        align: "center",
        width: CONTENT_WIDTH,
      })
      .text(`Page ${i + 1} of ${range.count}`, MARGIN, doc.page.height - 24, {
        align: "center",
        width: CONTENT_WIDTH,
      });
  }
}

function draw_header(doc: DealPdfDocument, deal: DealRecord) {
  doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(24).text("Buying Buddy", MARGIN, 44);
  doc.fillColor(MID).font("Helvetica").fontSize(10).text(`Deal ID: ${deal.id}`, MARGIN, 74);
  doc
    .moveTo(MARGIN, 95)
    .lineTo(PAGE_WIDTH - MARGIN, 95)
    .strokeColor(TEAL)
    .lineWidth(2)
    .stroke();
}

function section_title(doc: DealPdfDocument, label: string, y: number) {
  doc.rect(MARGIN, y, CONTENT_WIDTH, 24).fillColor(LIGHT).fill();
  doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(11).text(label, MARGIN + 10, y + 6);
  return y + 34;
}

function ensure_space(doc: DealPdfDocument, y: number, needed = 70) {
  if (y + needed <= doc.page.height - 70) {
    return y;
  }

  doc.addPage();
  return 50;
}

function detail_row(doc: DealPdfDocument, y: number, label: string, value: string) {
  doc.rect(MARGIN, y, CONTENT_WIDTH, 28).fillColor("#FFFFFF").fill();
  doc.rect(MARGIN, y, CONTENT_WIDTH, 28).strokeColor(BORDER).lineWidth(0.5).stroke();
  doc.fillColor(MID).font("Helvetica").fontSize(9).text(label, MARGIN + 8, y + 9, { width: 150 });
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(value, MARGIN + 165, y + 8, { width: CONTENT_WIDTH - 175, ellipsis: true });
  return y + 28;
}

export function generate_deal_summary_pdf(
  deal: DealRecord,
): Promise<{ buffer: Buffer; filename: string }> {
  const filename = `${deal.id}-deal-summary.pdf`;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: MARGIN,
      bufferPages: true,
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => {
      resolve({ buffer: Buffer.concat(chunks), filename });
    });
    doc.on("error", reject);

    draw_header(doc, deal);

    doc
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("DEAL RECORD", MARGIN, 120, { width: CONTENT_WIDTH, align: "center" });
    doc
      .fillColor(MID)
      .font("Helvetica")
      .fontSize(9)
      .text(`Generated ${new Date().toLocaleString("en-AU")}`, MARGIN, 146, {
        width: CONTENT_WIDTH,
        align: "center",
      });

    let y = 180;

    y = section_title(doc, "VEHICLE DETAILS", y);
    y = detail_row(
      doc,
      y,
      "Vehicle",
      [deal.vehicle_year, deal.vehicle_make, deal.vehicle_model].filter(Boolean).join(" ") ||
        "Not supplied",
    );
    y = detail_row(doc, y, "VIN", format_value(deal.vehicle_vin));
    y = detail_row(doc, y, "Rego", format_value(deal.vehicle_rego));
    y += 14;

    y = ensure_space(doc, y, 220);
    y = section_title(doc, "AGREED TERMS", y);
    y = detail_row(doc, y, "Agreed price", format_price(deal.agreed_price));
    y = detail_row(doc, y, "Payment method", payment_label(deal.payment_method));
    y = detail_row(doc, y, "Handover date", format_value(deal.handover_date));
    y = detail_row(doc, y, "Handover location", format_value(deal.handover_location));
    y = detail_row(doc, y, "Conditions", format_value(deal.conditions));
    y += 14;

    y = ensure_space(doc, y, 200);
    y = section_title(doc, "BUYER DETAILS", y);
    y = detail_row(doc, y, "Name", format_value(deal.buyer_name));
    y = detail_row(doc, y, "Email", format_value(deal.buyer_email));
    y = detail_row(doc, y, "Phone", format_value(deal.buyer_phone));
    y = detail_row(
      doc,
      y,
      "Licence uploaded",
      deal.buyer_licence_url ? "Yes" : "No",
    );
    y = detail_row(
      doc,
      y,
      "Completed at",
      format_value(deal.buyer_completed_at),
    );
    y += 14;

    y = ensure_space(doc, y, 240);
    y = section_title(doc, "SELLER DETAILS", y);
    y = detail_row(doc, y, "Name", format_value(deal.seller_name));
    y = detail_row(doc, y, "Email", format_value(deal.seller_email));
    y = detail_row(doc, y, "Phone", format_value(deal.seller_phone));
    y = detail_row(
      doc,
      y,
      "Licence uploaded",
      deal.seller_licence_url ? "Yes" : "No",
    );
    y = detail_row(
      doc,
      y,
      "Rego papers uploaded",
      deal.seller_rego_papers_url ? "Yes" : "No",
    );
    y = detail_row(
      doc,
      y,
      "Safety cert uploaded",
      deal.seller_safety_cert_url ? "Yes" : "No",
    );
    y = detail_row(doc, y, "BSB", format_value(deal.seller_bank_bsb));
    y = detail_row(
      doc,
      y,
      "Account",
      deal.seller_bank_account
        ? `Ending ${deal.seller_bank_account.slice(-4)}`
        : "Not supplied",
    );
    y = detail_row(doc, y, "PayID", format_value(deal.seller_payid));
    y = detail_row(
      doc,
      y,
      "Price confirmed",
      deal.seller_confirmed_price ? "Yes" : "No",
    );
    y = detail_row(
      doc,
      y,
      "Conditions confirmed",
      deal.seller_confirmed_conditions ? "Yes" : "No",
    );
    y = detail_row(
      doc,
      y,
      "Completed at",
      format_value(deal.seller_completed_at),
    );
    y += 14;

    y = ensure_space(doc, y, 120);
    y = section_title(doc, "TIMESTAMPS", y);
    y = detail_row(doc, y, "Created at", format_value(deal.created_at));
    y = detail_row(doc, y, "Updated at", format_value(deal.updated_at));
    y = detail_row(doc, y, "Finalised at", format_value(deal.finalised_at));

    draw_footer(doc);
    doc.end();
  });
}
