import "@/lib/pdfkit-compat";
import { createRequire } from "node:module";

const requireFromThisFile = createRequire(__filename);
const PDFDocument = requireFromThisFile("pdfkit") as any;

export type FinancePayoutRequired = "yes" | "no" | "unknown";

export type ContractPackInput = {
  email: string;
  buyerName?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  sellerName?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerAddress?: string;
  vehicleMakeModel?: string;
  vehicleYear?: string;
  vehicleRego?: string;
  vehicleVin?: string;
  vehicleColour?: string;
  odometer?: string;
  salePrice?: string;
  depositAmount?: string;
  balanceDue?: string;
  paymentMethod?: string;
  financePayoutRequired?: FinancePayoutRequired | string;
  financePayoutAmount?: string;
  financePayoutRecipient?: string;
  sellerBalanceAmount?: string;
  handoverDate?: string;
  handoverLocation?: string;
  includedAccessories?: string;
  roadworthyStatus?: string;
  ppsrStatus?: string;
  specialConditions?: string;
  knownFaults?: string;
};

export type NormalisedContractPackInput = Required<ContractPackInput> & {
  financePayoutRequired: FinancePayoutRequired;
};

const TEAL = "#0D9488";
const TEAL_DARK = "#0F766E";
const DARK = "#111827";
const MID = "#4B5563";
const MUTED = "#6B7280";
const LIGHT = "#F8FAFC";
const TEAL_LIGHT = "#ECFDF5";
const BORDER = "#CBD5E1";
const WARNING = "#92400E";
const WARNING_BG = "#FFF7ED";
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 44;
const CW = PAGE_W - MARGIN * 2;
const FILENAME = "buying-buddy-private-sale-contract.pdf";

function clean(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, 700);
}

function cleanLong(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().slice(0, 1800);
}

function normaliseFinance(value: unknown): FinancePayoutRequired {
  const cleaned = clean(value).toLowerCase();
  if (cleaned === "yes" || cleaned === "no") return cleaned;
  return "unknown";
}

export function normaliseContractPackInput(input: Partial<ContractPackInput>): NormalisedContractPackInput {
  return {
    email: clean(input.email),
    buyerName: clean(input.buyerName),
    buyerPhone: clean(input.buyerPhone),
    buyerAddress: clean(input.buyerAddress),
    sellerName: clean(input.sellerName),
    sellerPhone: clean(input.sellerPhone),
    sellerEmail: clean(input.sellerEmail),
    sellerAddress: clean(input.sellerAddress),
    vehicleMakeModel: clean(input.vehicleMakeModel),
    vehicleYear: clean(input.vehicleYear),
    vehicleRego: clean(input.vehicleRego).toUpperCase(),
    vehicleVin: clean(input.vehicleVin).toUpperCase(),
    vehicleColour: clean(input.vehicleColour),
    odometer: clean(input.odometer),
    salePrice: clean(input.salePrice),
    depositAmount: clean(input.depositAmount),
    balanceDue: clean(input.balanceDue),
    paymentMethod: clean(input.paymentMethod),
    financePayoutRequired: normaliseFinance(input.financePayoutRequired),
    financePayoutAmount: clean(input.financePayoutAmount),
    financePayoutRecipient: clean(input.financePayoutRecipient),
    sellerBalanceAmount: clean(input.sellerBalanceAmount),
    handoverDate: clean(input.handoverDate),
    handoverLocation: clean(input.handoverLocation),
    includedAccessories: cleanLong(input.includedAccessories),
    roadworthyStatus: cleanLong(input.roadworthyStatus),
    ppsrStatus: cleanLong(input.ppsrStatus),
    specialConditions: cleanLong(input.specialConditions),
    knownFaults: cleanLong(input.knownFaults),
  };
}

export function contractPdfFilename() {
  return FILENAME;
}

function display(value: string, fallback = "Not recorded") {
  return value.trim() || fallback;
}

function labelValue(label: string, value: string) {
  return `${label}: ${display(value, "____________________________")}`;
}

function financeStatus(input: NormalisedContractPackInput) {
  if (input.financePayoutRequired === "yes") {
    const payout = display(input.financePayoutAmount, "amount to be confirmed");
    const recipient = display(input.financePayoutRecipient, "finance provider to be confirmed");
    const sellerBalance = display(input.sellerBalanceAmount, "seller balance to be confirmed");
    return `Finance payout required. Buyer and seller record that ${payout} is to be paid to ${recipient}, with ${sellerBalance} to the seller unless varied in writing before handover.`;
  }

  if (input.financePayoutRequired === "no") {
    return "Seller records that no finance payout is required before handover. Buyer should still complete an independent PPSR check before payment.";
  }

  return "Finance payout status not recorded. Buyer should pause before payment until PPSR and payout status are clear.";
}

function paymentSummary(input: NormalisedContractPackInput) {
  const price = display(input.salePrice, "price to be completed");
  const deposit = display(input.depositAmount, "deposit not recorded");
  const balance = display(input.balanceDue, "balance to be completed");
  const method = display(input.paymentMethod, "payment method to be completed");
  return `Agreed sale price: ${price}. Deposit: ${deposit}. Balance due: ${balance}. Payment method: ${method}.`;
}

type Doc = InstanceType<typeof PDFDocument>;

function addPageNumberFooters(doc: Doc) {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i += 1) {
    doc.switchToPage(range.start + i);
    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor("#94A3B8")
      .text("Prepared with Buying Buddy — buyer-side tools for private car sales. Not legal advice.", MARGIN, PAGE_H - 38, {
        align: "center",
        width: CW,
      })
      .text(`Page ${i + 1} of ${range.count}`, MARGIN, PAGE_H - 25, { align: "center", width: CW });
  }
}

function ensureSpace(doc: Doc, y: number, needed: number) {
  if (y + needed <= PAGE_H - 56) return y;
  doc.addPage();
  return 58;
}

function drawTopBrand(doc: Doc, subtitle = "Private Sale Contract + Handover Record") {
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(TEAL_DARK)
    .text("Buying Buddy", MARGIN, 30, { width: 150 });
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(MUTED)
    .text("You’re in control", PAGE_W - MARGIN - 160, 30, { align: "right", width: 160 });
  doc.moveTo(MARGIN, 48).lineTo(PAGE_W - MARGIN, 48).strokeColor("#CCFBF1").lineWidth(1).stroke();
  doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(subtitle, MARGIN, 54, { width: CW });
}

function section(doc: Doc, title: string, y: number) {
  y = ensureSpace(doc, y, 34);
  doc.roundedRect(MARGIN, y, CW, 25, 7).fillColor(LIGHT).fill();
  doc
    .font("Helvetica-Bold")
    .fontSize(9.5)
    .fillColor(TEAL_DARK)
    .text(title.toUpperCase(), MARGIN + 12, y + 8, { width: CW - 24 });
  return y + 34;
}

function twoColumnRows(doc: Doc, rows: Array<[string, string]>, y: number) {
  const gap = 12;
  const colW = (CW - gap) / 2;
  const rowH = 34;
  for (let i = 0; i < rows.length; i += 2) {
    y = ensureSpace(doc, y, rowH + 6);
    for (let c = 0; c < 2; c += 1) {
      const item = rows[i + c];
      if (!item) continue;
      const x = MARGIN + c * (colW + gap);
      doc.roundedRect(x, y, colW, rowH, 6).strokeColor(BORDER).lineWidth(0.5).stroke();
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor(MUTED).text(item[0], x + 8, y + 6, { width: colW - 16 });
      doc.font("Helvetica").fontSize(9).fillColor(DARK).text(display(item[1], "—"), x + 8, y + 18, { width: colW - 16 });
    }
    y += rowH + 6;
  }
  return y;
}

function paragraph(doc: Doc, text: string, y: number, options: { color?: string; bold?: boolean; size?: number } = {}) {
  y = ensureSpace(doc, y, 48);
  const height = doc.heightOfString(text, { width: CW, lineGap: 3 });
  doc
    .font(options.bold ? "Helvetica-Bold" : "Helvetica")
    .fontSize(options.size ?? 9)
    .fillColor(options.color ?? MID)
    .text(text, MARGIN, y, { width: CW, lineGap: 3 });
  return y + height + 10;
}

function boxedParagraph(doc: Doc, title: string, text: string, y: number, fill = TEAL_LIGHT, color = TEAL_DARK) {
  const titleH = 13;
  const bodyH = doc.heightOfString(text, { width: CW - 24, lineGap: 3 });
  const h = Math.max(52, titleH + bodyH + 24);
  y = ensureSpace(doc, y, h + 8);
  doc.roundedRect(MARGIN, y, CW, h, 10).fillColor(fill).fill();
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(color)
    .text(title, MARGIN + 12, y + 10, { width: CW - 24 });
  doc.font("Helvetica").fontSize(8.5).fillColor(color).text(text, MARGIN + 12, y + 26, { width: CW - 24, lineGap: 3 });
  return y + h + 12;
}

function checklist(doc: Doc, items: string[], y: number) {
  for (const item of items) {
    y = ensureSpace(doc, y, 23);
    doc.rect(MARGIN, y + 2, 10, 10).strokeColor(BORDER).lineWidth(0.7).stroke();
    doc.font("Helvetica").fontSize(8.5).fillColor(DARK).text(item, MARGIN + 18, y, { width: CW - 18, lineGap: 2 });
    y += 19;
  }
  return y + 4;
}

function signatureBlocks(doc: Doc, y: number) {
  y = ensureSpace(doc, y, 132);
  const gap = 18;
  const colW = (CW - gap) / 2;
  const top = y;

  for (const pair of [
    [0, "SELLER"],
    [1, "BUYER"],
  ] as const) {
    const [idx, title] = pair;
    const x = MARGIN + idx * (colW + gap);
    doc.roundedRect(x, top, colW, 98, 8).strokeColor(BORDER).lineWidth(0.6).stroke();
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(DARK).text(title, x + 10, top + 10, { width: colW - 20 });
    doc.moveTo(x + 10, top + 42).lineTo(x + colW - 10, top + 42).strokeColor(DARK).lineWidth(0.7).stroke();
    doc.font("Helvetica").fontSize(7.5).fillColor(MUTED).text("Signature", x + 10, top + 46);
    doc.moveTo(x + 10, top + 66).lineTo(x + colW - 10, top + 66).strokeColor(DARK).lineWidth(0.7).stroke();
    doc.text("Print name", x + 10, top + 70);
    doc.moveTo(x + 10, top + 88).lineTo(x + colW - 10, top + 88).strokeColor(DARK).lineWidth(0.7).stroke();
    doc.text("Date", x + 10, top + 91);
  }

  y = top + 112;
  doc.moveTo(MARGIN, y + 22).lineTo(PAGE_W - MARGIN, y + 22).strokeColor(DARK).lineWidth(0.7).stroke();
  doc.font("Helvetica").fontSize(7.5).fillColor(MUTED).text("Witness name/signature if either party wants an independent witness", MARGIN, y + 26, { width: CW });
  return y + 45;
}

function addDocumentHeader(doc: Doc, input: NormalisedContractPackInput) {
  drawTopBrand(doc);
  let y = 82;
  doc
    .font("Helvetica-Bold")
    .fontSize(21)
    .fillColor(DARK)
    .text("Private Sale Contract + Handover Record", MARGIN, y, { width: CW - 130, lineGap: 2 });
  doc
    .roundedRect(PAGE_W - MARGIN - 104, y, 104, 34, 9)
    .fillColor(TEAL_LIGHT)
    .fill();
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(TEAL_DARK)
    .text("EMAIL READY", PAGE_W - MARGIN - 92, y + 12, { align: "center", width: 80 });
  y += 58;
  y = boxedParagraph(
    doc,
    "Buyer control note",
    "You’re in control. It’s easier to live with walking away than dealing with problems. Use this record to slow the deal down before money changes hands.",
    y,
  );
  y = twoColumnRows(
    doc,
    [
      ["Buyer", input.buyerName],
      ["Seller", input.sellerName],
      ["Vehicle", input.vehicleMakeModel],
      ["Rego / VIN", [input.vehicleRego, input.vehicleVin].filter(Boolean).join(" / ")],
      ["Sale price", input.salePrice],
      ["Handover", [input.handoverDate, input.handoverLocation].filter(Boolean).join(" — ")],
    ],
    y,
  );
  return y + 2;
}

function addContractBody(doc: Doc, input: NormalisedContractPackInput, y: number) {
  y = section(doc, "Private sale agreement", y);
  y = paragraph(
    doc,
    "This agreement records the private sale of the vehicle described in this document between the seller and buyer. Both parties should review the details, complete any blank fields, and sign only when they are satisfied the vehicle, payment, identity and handover details are correct.",
    y,
  );
  y = twoColumnRows(
    doc,
    [
      ["Buyer name", input.buyerName],
      ["Buyer phone", input.buyerPhone],
      ["Buyer address", input.buyerAddress],
      ["Buyer email", input.email],
      ["Seller name", input.sellerName],
      ["Seller phone", input.sellerPhone],
      ["Seller address", input.sellerAddress],
      ["Seller email", input.sellerEmail],
      ["Vehicle make/model", input.vehicleMakeModel],
      ["Year / colour", [input.vehicleYear, input.vehicleColour].filter(Boolean).join(" / ")],
      ["Registration", input.vehicleRego],
      ["VIN", input.vehicleVin],
      ["Odometer", input.odometer],
      ["Payment method", input.paymentMethod],
    ],
    y,
  );

  y = section(doc, "Sale price, payment and finance", y + 4);
  y = paragraph(doc, paymentSummary(input), y, { bold: true, color: DARK });
  y = paragraph(doc, financeStatus(input), y);
  y = boxedParagraph(
    doc,
    "Special conditions",
    display(input.specialConditions, "No special conditions recorded. Complete this section before signing if the sale depends on finance payout, inspection items, accessories, repairs, roadworthy status, timing, or any other promise."),
    y,
    WARNING_BG,
    WARNING,
  );

  y = section(doc, "Seller records and buyer checks", y);
  y = checklist(
    doc,
    [
      "Seller confirms they are entitled to sell the vehicle and will provide truthful identity and ownership details.",
      "Buyer records whether an independent PPSR check has been completed before payment.",
      "Buyer has had the opportunity to inspect the vehicle and record known faults before handover.",
      "Roadworthy / safety certificate status is recorded before money and keys change hands.",
      "All included accessories, keys, service books and agreed items are recorded below.",
    ],
    y,
  );
  y = twoColumnRows(
    doc,
    [
      ["PPSR status", input.ppsrStatus],
      ["Roadworthy / safety certificate", input.roadworthyStatus],
      ["Included accessories", input.includedAccessories],
      ["Known faults / notes", input.knownFaults],
    ],
    y,
  );

  y = section(doc, "Private sale condition", y + 4);
  y = paragraph(
    doc,
    "Unless otherwise recorded in writing, this is a private sale. The buyer acknowledges they have had the opportunity to inspect the vehicle, arrange independent checks, and decide whether to proceed before payment. Any promises, repairs, included items or payout conditions should be written in this document before signing.",
    y,
  );
  y = signatureBlocks(doc, y + 4);
  return y;
}

function addReceiptAndChecklist(doc: Doc, input: NormalisedContractPackInput) {
  doc.addPage();
  drawTopBrand(doc, "Receipt, condition notes and transfer checklist");
  let y = 82;

  y = section(doc, "Receipt of payment", y);
  y = paragraph(
    doc,
    `This receipt records payment for the vehicle once money changes hands. ${paymentSummary(input)}`,
    y,
    { color: DARK },
  );
  y = twoColumnRows(
    doc,
    [
      ["Amount received today", input.balanceDue || input.salePrice],
      ["Deposit already paid", input.depositAmount],
      ["Payment method", input.paymentMethod],
      ["Transaction reference", ""],
      ["Date/time paid", input.handoverDate],
      ["Payment location", input.handoverLocation],
    ],
    y,
  );

  y = section(doc, "Condition and handover notes", y + 4);
  y = twoColumnRows(
    doc,
    [
      ["Odometer at handover", input.odometer],
      ["Keys/accessories", input.includedAccessories],
      ["Known faults", input.knownFaults],
      ["Roadworthy status", input.roadworthyStatus],
    ],
    y,
  );
  y = boxedParagraph(
    doc,
    "Handover note",
    "Take photos of the vehicle, odometer, VIN plate, keys, service books, any defects and the signed pages before anyone leaves. A clear record is cheaper than an argument later.",
    y,
  );

  y = section(doc, "Transfer checklist", y);
  y = checklist(
    doc,
    [
      "Confirm buyer and seller names, phone numbers and licence/identity details before signing.",
      "Confirm registration number and VIN match the physical car and paperwork.",
      "Complete or verify the official Queensland transfer process through TMR requirements.",
      "Complete a PPSR check before payment, especially if any finance payout is mentioned.",
      "Confirm the agreed payment split before keys are handed over.",
      "Keep signed copies of this PDF, payment receipt, PPSR report and transfer evidence.",
      "If anything does not add up, pause or walk away before settlement.",
    ],
    y,
  );
  y = boxedParagraph(
    doc,
    "Next step: Deal Pack",
    "Before you sign, use a Buying Buddy Deal Pack to keep the listing, inspection notes, PPSR, paperwork and seller messages in one sale-control workspace.",
    y,
    "#EFF6FF",
    "#1D4ED8",
  );
  y = boxedParagraph(
    doc,
    "Important disclaimer",
    "This template is a practical private-sale record, not legal advice. Buying Buddy is not a party to the sale. Check current Queensland TMR requirements, complete an independent PPSR search, and seek professional advice if you are unsure.",
    y,
    WARNING_BG,
    WARNING,
  );
  return y;
}

export async function generatePrivateSaleContractPdf(input: Partial<ContractPackInput>): Promise<Buffer> {
  const data = normaliseContractPackInput(input);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: MARGIN, bufferPages: true, compress: false });
    doc.info.Title = "Buying Buddy Private Sale Contract";
    doc.info.Subject = "Private sale contract and handover record";
    doc.info.Author = "Buying Buddy";
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let y = addDocumentHeader(doc, data);
    y = addContractBody(doc, data, y);

    if (y > PAGE_H - 220) {
      doc.addPage();
    }

    addReceiptAndChecklist(doc, data);
    addPageNumberFooters(doc);
    doc.end();
  });
}

export function buildContractLeadSummary(input: Partial<ContractPackInput>) {
  const data = normaliseContractPackInput(input);
  const vehicle = display(data.vehicleMakeModel, "vehicle not recorded");
  const rego = data.vehicleRego ? ` (${data.vehicleRego})` : "";
  return `Contract PDF requested for ${vehicle}${rego}`;
}

export function contractPackEmailSubject(input: Partial<ContractPackInput>) {
  const data = normaliseContractPackInput(input);
  const vehicle = data.vehicleMakeModel ? ` — ${data.vehicleMakeModel}` : "";
  return `Your Buying Buddy private sale contract PDF${vehicle}`;
}

export function contractPackBuyerEmailHtml(input: Partial<ContractPackInput>) {
  const data = normaliseContractPackInput(input);
  const vehicle = display(data.vehicleMakeModel, "your private-sale vehicle");
  const dealUrl = "https://buyingbuddy.com.au/deal";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your Buying Buddy contract PDF</title>
  </head>
  <body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <div style="max-width:640px;margin:32px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
      <div style="padding:26px 30px;background:#0D9488;color:#ffffff;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;">Buying Buddy</p>
        <h1 style="margin:0;font-size:24px;line-height:1.15;">Your private sale contract PDF is attached</h1>
      </div>
      <div style="padding:28px 30px;">
        <p style="font-size:15px;line-height:1.65;margin:0 0 16px;">Hi${data.buyerName ? ` ${data.buyerName}` : ""},</p>
        <p style="font-size:15px;line-height:1.65;margin:0 0 16px;">Your Buying Buddy private sale contract and handover record for <strong>${escapeHtml(vehicle)}</strong> is attached as a single PDF.</p>
        <div style="background:#ecfdf5;border:1px solid #ccfbf1;border-radius:14px;padding:18px;margin:20px 0;">
          <p style="margin:0;font-size:15px;line-height:1.6;"><strong>You’re in control.</strong> It’s easier to live with walking away than dealing with problems. Use the PDF to slow the deal down before money changes hands.</p>
        </div>
        <p style="font-size:15px;line-height:1.65;margin:0 0 16px;">Before you sign, use a Deal Pack to keep the listing, inspection notes, PPSR, paperwork and seller messages in one sale-control workspace.</p>
        <p style="margin:24px 0;"><a href="${dealUrl}" style="display:inline-block;background:#0D9488;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:999px;">Open a Deal Pack</a></p>
        <p style="font-size:12px;line-height:1.6;color:#6b7280;margin:0;">This template is a practical private-sale record, not legal advice. Buying Buddy is not a party to the sale.</p>
      </div>
    </div>
  </body>
</html>`;
}

export function contractPackInternalEmailHtml(input: Partial<ContractPackInput>) {
  const data = normaliseContractPackInput(input);
  return `<!DOCTYPE html><html lang="en"><body style="font-family:Arial,Helvetica,sans-serif;"><h1>New contract PDF lead</h1><p><strong>Email:</strong> ${escapeHtml(data.email)}</p><p><strong>Buyer:</strong> ${escapeHtml(display(data.buyerName))}</p><p><strong>Vehicle:</strong> ${escapeHtml(display(data.vehicleMakeModel))}</p><p><strong>Rego:</strong> ${escapeHtml(display(data.vehicleRego))}</p></body></html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
