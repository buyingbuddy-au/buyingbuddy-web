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
  buyerLicense?: string;
  sellerName?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerAddress?: string;
  sellerLicense?: string;
  vehicleMakeModel?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleRego?: string;
  vehicleRegoExpiry?: string;
  vehicleVin?: string;
  vehicleColour?: string;
  vehicleBodyType?: string;
  odometer?: string;
  salePrice?: string;
  salePriceWords?: string;
  saleDate?: string;
  saleTime?: string;
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
const FIELD_BORDER = "#94A3B8";
const FIELD_BG = "#FFFFFF";
const WARNING = "#92400E";
const WARNING_BG = "#FFF7ED";
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 50;
const CW = PAGE_W - MARGIN * 2;
const FILENAME = "buying-buddy-private-sale-contract.pdf";

type Doc = InstanceType<typeof PDFDocument>;

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

function splitVehicle(input: Partial<ContractPackInput>) {
  const suppliedMake = clean(input.vehicleMake);
  const suppliedModel = clean(input.vehicleModel);
  if (suppliedMake || suppliedModel) {
    return { make: suppliedMake, model: suppliedModel };
  }

  const summary = clean(input.vehicleMakeModel);
  const [make = "", ...modelParts] = summary.split(" ");
  return { make, model: modelParts.join(" ") };
}

export function normaliseContractPackInput(input: Partial<ContractPackInput>): NormalisedContractPackInput {
  const { make, model } = splitVehicle(input);
  return {
    email: clean(input.email),
    buyerName: clean(input.buyerName),
    buyerPhone: clean(input.buyerPhone),
    buyerAddress: clean(input.buyerAddress),
    buyerLicense: clean(input.buyerLicense),
    sellerName: clean(input.sellerName),
    sellerPhone: clean(input.sellerPhone),
    sellerEmail: clean(input.sellerEmail),
    sellerAddress: clean(input.sellerAddress),
    sellerLicense: clean(input.sellerLicense),
    vehicleMakeModel: clean(input.vehicleMakeModel),
    vehicleMake: make,
    vehicleModel: model,
    vehicleYear: clean(input.vehicleYear),
    vehicleRego: clean(input.vehicleRego).toUpperCase(),
    vehicleRegoExpiry: clean(input.vehicleRegoExpiry),
    vehicleVin: clean(input.vehicleVin).toUpperCase(),
    vehicleColour: clean(input.vehicleColour),
    vehicleBodyType: clean(input.vehicleBodyType),
    odometer: clean(input.odometer),
    salePrice: clean(input.salePrice),
    salePriceWords: clean(input.salePriceWords),
    saleDate: clean(input.saleDate),
    saleTime: clean(input.saleTime),
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

function vehicleLabel(input: NormalisedContractPackInput) {
  return display(
    input.vehicleMakeModel || [input.vehicleMake, input.vehicleModel].filter(Boolean).join(" "),
    "your private-sale vehicle",
  );
}

function financeStatus(input: NormalisedContractPackInput) {
  if (input.financePayoutRequired === "yes") {
    const payout = display(input.financePayoutAmount, "amount to be confirmed");
    const recipient = display(input.financePayoutRecipient, "finance provider to be confirmed");
    const sellerBalance = display(input.sellerBalanceAmount, "seller balance to be confirmed");
    return `${payout} to ${recipient}; ${sellerBalance} to seller unless varied in writing.`;
  }

  if (input.financePayoutRequired === "no") {
    return "Seller records that no finance payout is required. Buyer should still complete PPSR before payment.";
  }

  return "Finance payout status not recorded. Pause payment until PPSR and payout status are clear.";
}

function paymentSummary(input: NormalisedContractPackInput) {
  const parts = [
    input.depositAmount ? `Deposit: ${input.depositAmount}` : "",
    input.balanceDue ? `Balance: ${input.balanceDue}` : "",
    input.paymentMethod ? `Method: ${input.paymentMethod}` : "",
    input.financePayoutRequired !== "unknown" ? `Finance payout: ${financeStatus(input)}` : "",
  ].filter(Boolean);
  return parts.join(" | ");
}

function saleDate(input: NormalisedContractPackInput) {
  return input.saleDate || input.handoverDate;
}

function drawHeader(doc: Doc, pageNo: 1 | 2) {
  doc
    .font("Helvetica-Bold")
    .fontSize(17)
    .fillColor(DARK)
    .text("PRIVATE VEHICLE SALE CONTRACT", MARGIN, 34, { width: 330 });
  doc.font("Helvetica").fontSize(9).fillColor(MUTED).text("Queensland, Australia", MARGIN, 56, { width: 180 });
  doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(`Page ${pageNo} of 2`, PAGE_W - MARGIN - 92, 38, {
    align: "right",
    width: 92,
  });
  doc.roundedRect(PAGE_W - MARGIN - 116, 58, 116, 22, 8).fillColor(TEAL_LIGHT).fill();
  doc.font("Helvetica-Bold").fontSize(8).fillColor(TEAL_DARK).text("PPSR-READY", PAGE_W - MARGIN - 104, 65, {
    align: "center",
    width: 92,
  });
  doc.moveTo(MARGIN, 86).lineTo(PAGE_W - MARGIN, 86).strokeColor("#CCFBF1").lineWidth(1.2).stroke();
}

function drawFooter(doc: Doc) {
  doc.moveTo(MARGIN, PAGE_H - 70).lineTo(PAGE_W - MARGIN, PAGE_H - 70).strokeColor("#E2E8F0").lineWidth(0.7).stroke();
  doc
    .font("Helvetica-Bold")
    .fontSize(7.6)
    .fillColor(TEAL_DARK)
    .text("Template provided by Buying Buddy", MARGIN, PAGE_H - 60, { width: 210, lineBreak: false });
  doc
    .font("Helvetica")
    .fontSize(7.2)
    .fillColor(MUTED)
    .text("Private sale use only — not legal advice or a dealer warranty.", PAGE_W - MARGIN - 280, PAGE_H - 60, {
      align: "right",
      width: 280,
      lineBreak: false,
    });
}

function section(doc: Doc, title: string, y: number) {
  doc.roundedRect(MARGIN, y, CW, 22, 7).fillColor(LIGHT).fill();
  doc.font("Helvetica-Bold").fontSize(9).fillColor(TEAL_DARK).text(title.toUpperCase(), MARGIN + 10, y + 7, {
    width: CW - 20,
  });
}

function label(doc: Doc, text: string, x: number, y: number, w: number) {
  doc.font("Helvetica-Bold").fontSize(6.9).fillColor(MUTED).text(text, x, y, { width: w, lineBreak: false });
}

function formText(doc: Doc, name: string, labelText: string, x: number, y: number, w: number, h: number, value: string, options: { multiline?: boolean } = {}) {
  label(doc, labelText, x, y - 11, w);
  doc.roundedRect(x, y, w, h, 2.5).fillColor(FIELD_BG).fillAndStroke(FIELD_BG, FIELD_BORDER);
  doc.formText(name, x + 1, y + 1, w - 2, h - 2, {
    value,
    defaultValue: value,
    fontSize: options.multiline ? 7.2 : 8,
    backgroundColor: FIELD_BG,
    borderColor: FIELD_BORDER,
    multiline: options.multiline,
  });
}

function formCheckbox(doc: Doc, name: string, x: number, y: number, text: string) {
  doc.formCheckbox(name, x, y, 14, 14, {
    backgroundColor: FIELD_BG,
    borderColor: FIELD_BORDER,
  });
  doc.font("Helvetica").fontSize(8.2).fillColor(DARK).text(text, x + 22, y + 1, { width: CW - 22, lineGap: 2 });
}

function paragraph(doc: Doc, title: string, text: string, x: number, y: number, w: number, titleColor = DARK) {
  doc.font("Helvetica-Bold").fontSize(8.4).fillColor(titleColor).text(title, x, y, { width: w });
  doc.font("Helvetica").fontSize(7.8).fillColor(MID).text(text, x, y + 12, { width: w, lineGap: 2 });
}

function warningBox(doc: Doc, title: string, text: string, y: number) {
  doc.roundedRect(MARGIN, y, CW, 54, 8).fillColor(WARNING_BG).fill();
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(WARNING).text(title, MARGIN + 10, y + 9, { width: CW - 20 });
  doc.font("Helvetica").fontSize(7.8).fillColor(WARNING).text(text, MARGIN + 10, y + 22, { width: CW - 20, lineGap: 2 });
}

function drawPageOne(doc: Doc, input: NormalisedContractPackInput) {
  drawHeader(doc, 1);

  section(doc, "Seller details", 96);
  formText(doc, "seller_full_name", "Full Legal Name", 60, 124, 475, 18, input.sellerName);
  formText(doc, "seller_license", "Driver Licence Number", 60, 161, 200, 18, input.sellerLicense);
  formText(doc, "seller_phone", "Phone Number", 280, 161, 150, 18, input.sellerPhone);
  formText(doc, "seller_email", "Email Address", 450, 161, 95, 18, input.sellerEmail);
  formText(doc, "seller_address", "Residential Address (Street, City, State, Postcode)", 60, 198, 475, 18, input.sellerAddress);

  section(doc, "Buyer details", 242);
  formText(doc, "buyer_full_name", "Full Legal Name", 60, 270, 475, 18, input.buyerName);
  formText(doc, "buyer_license", "Driver Licence Number", 60, 307, 200, 18, input.buyerLicense);
  formText(doc, "buyer_phone", "Phone Number", 280, 307, 150, 18, input.buyerPhone);
  formText(doc, "buyer_email", "Email Address", 450, 307, 95, 18, input.email);
  formText(doc, "buyer_address", "Residential Address (Street, City, State, Postcode)", 60, 344, 475, 18, input.buyerAddress);

  section(doc, "Vehicle details", 388);
  formText(doc, "vehicle_make", "Make (e.g. Toyota, Ford)", 60, 416, 180, 18, input.vehicleMake);
  formText(doc, "vehicle_model", "Model (e.g. RAV4, Ranger)", 260, 416, 180, 18, input.vehicleModel);
  formText(doc, "vehicle_year", "Year", 460, 416, 80, 18, input.vehicleYear);
  formText(doc, "vehicle_vin", "VIN / Chassis Number", 60, 453, 200, 18, input.vehicleVin);
  formText(doc, "vehicle_rego_number", "Registration Number", 280, 453, 130, 18, input.vehicleRego);
  formText(doc, "vehicle_rego_expiry", "Registration Expiry", 430, 453, 110, 18, input.vehicleRegoExpiry);
  formText(doc, "vehicle_colour", "Colour", 60, 490, 120, 18, input.vehicleColour);
  formText(doc, "vehicle_body_type", "Body Type (e.g. Sedan, SUV)", 200, 490, 180, 18, input.vehicleBodyType);
  formText(doc, "vehicle_odometer", "Odometer Reading (km)", 400, 490, 140, 18, input.odometer);

  doc.roundedRect(MARGIN, 526, CW, 48, 8).fillColor(TEAL_LIGHT).fill();
  doc.font("Helvetica-Bold").fontSize(8.6).fillColor(TEAL_DARK).text("ODOMETER DECLARATION", MARGIN + 10, 536, { width: CW - 20 });
  doc
    .font("Helvetica")
    .fontSize(7.6)
    .fillColor(TEAL_DARK)
    .text(
      "Providing false or misleading odometer information can be a serious offence. Buyer and seller should photograph the odometer at handover.",
      MARGIN + 10,
      550,
      { width: CW - 20, lineGap: 2 },
    );

  section(doc, "Sale details", 596);
  formText(doc, "sale_price_numbers", "Purchase Price in Numbers ($AUD)", 60, 624, 180, 18, input.salePrice);
  formText(doc, "sale_date", "Date of Sale", 260, 624, 130, 18, saleDate(input));
  formText(doc, "sale_time", "Time of Sale", 410, 624, 130, 18, input.saleTime);
  formText(doc, "sale_price_words", "Purchase Price in Words", 60, 661, 475, 18, input.salePriceWords);
  formText(doc, "payment_method", "Payment Method / Split / Payout Instructions", 60, 698, 475, 32, paymentSummary(input) || input.paymentMethod, {
    multiline: true,
  });
  formCheckbox(doc, "payment_received", 60, 746, "Payment received in full before vehicle possession transfers");

  drawFooter(doc);
}

function drawPageTwo(doc: Doc, input: NormalisedContractPackInput) {
  doc.addPage();
  drawHeader(doc, 2);

  section(doc, "Legal & safety disclosures", 96);
  paragraph(
    doc,
    "Warranty disclosure",
    "This vehicle is sold as is, where is, with no warranties or guarantees implied or expressed by the seller unless written in the special conditions. The buyer acknowledges they have inspected the vehicle, or had it inspected, and is satisfied before payment.",
    60,
    124,
    475,
  );
  paragraph(
    doc,
    "PPSR declaration",
    "The buyer should check the PPSR before payment and pause if finance, security interests, stolen, written-off, VIN, registration or seller details do not match.",
    60,
    178,
    475,
    TEAL_DARK,
  );
  formCheckbox(doc, "ppsr_checked", 60, 222, "PPSR checked before payment and outcome accepted by buyer");
  formText(doc, "ppsr_notes", "PPSR notes / certificate reference", 60, 253, 475, 24, input.ppsrStatus, { multiline: true });

  paragraph(
    doc,
    "Roadworthy certificate / safety certificate",
    "In Queensland, a valid safety certificate is normally required to transfer vehicle registration. Keep a copy with the signed contract.",
    60,
    302,
    475,
  );
  formCheckbox(doc, "roadworthy_included", 60, 343, "Valid roadworthy / safety certificate included with sale");
  formText(doc, "roadworthy_notes", "Roadworthy / safety certificate notes", 60, 372, 475, 24, input.roadworthyStatus, {
    multiline: true,
  });

  paragraph(
    doc,
    "Service history and accessories",
    "Record service books, spare keys, accessories, number plates, chargers, manuals and any items promised by the seller.",
    60,
    421,
    475,
  );
  formCheckbox(doc, "service_history_available", 60, 462, "Service history records available and provided to buyer");
  formText(doc, "accessories_notes", "Included accessories / known faults", 60, 491, 475, 30, [input.includedAccessories, input.knownFaults].filter(Boolean).join(" | "), {
    multiline: true,
  });

  warningBox(
    doc,
    "IMPORTANT: NO COOLING-OFF PERIOD",
    "Queensland private vehicle sales generally do not provide a cooling-off period. Treat signing and payment as final unless a written condition says otherwise.",
    522,
  );

  section(doc, "Receipt of payment & transfer agreement", 586);
  doc
    .font("Helvetica")
    .fontSize(7.2)
    .fillColor(MID)
    .text(
      "The seller acknowledges payment and agrees to provide the documents required for transfer. Possession transfers only when full payment and written conditions are satisfied.",
      60,
      612,
      { width: 475, lineGap: 1.5 },
    );

  formText(doc, "special_conditions", "Special conditions / subject to", 60, 640, 475, 32, input.specialConditions, {
    multiline: true,
  });

  section(doc, "Signatures", 678);
  const colW = 150;
  const startY = 700;
  const columns = [
    { title: "Seller Signature", x: 60, nameField: "seller_signature_name", dateField: "seller_signature_date", value: input.sellerName },
    { title: "Buyer Signature", x: 222, nameField: "buyer_signature_name", dateField: "buyer_signature_date", value: input.buyerName },
    { title: "Witness Signature", x: 384, nameField: "witness_signature_name", dateField: "witness_signature_date", value: "" },
  ];

  for (const column of columns) {
    doc.font("Helvetica-Bold").fontSize(7.2).fillColor(DARK).text(column.title, column.x, startY, { width: colW });
    doc.moveTo(column.x, startY + 18).lineTo(column.x + colW - 8, startY + 18).strokeColor(DARK).lineWidth(0.6).stroke();
    formText(doc, column.nameField, "Printed Name", column.x, startY + 31, colW - 8, 14, column.value);
    formText(doc, column.dateField, "Date", column.x, startY + 59, colW - 8, 14, saleDate(input));
  }

  drawFooter(doc);
}

export async function generatePrivateSaleContractPdf(input: Partial<ContractPackInput>): Promise<Buffer> {
  const data = normaliseContractPackInput(input);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: MARGIN, bufferPages: true, compress: false, autoFirstPage: false });
    doc.info.Title = "Buying Buddy Private Vehicle Sale Contract";
    doc.info.Subject = "Editable private sale contract and handover record";
    doc.info.Author = "Buying Buddy";
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.addPage();
    doc.font("Helvetica");
    doc.initForm();
    drawPageOne(doc, data);
    drawPageTwo(doc, data);
    doc.end();
  });
}

export function buildContractLeadSummary(input: Partial<ContractPackInput>) {
  const data = normaliseContractPackInput(input);
  const vehicle = vehicleLabel(data);
  const rego = data.vehicleRego ? ` (${data.vehicleRego})` : "";
  return `Contract PDF requested for ${vehicle}${rego}`;
}

export function contractPackEmailSubject(input: Partial<ContractPackInput>) {
  const data = normaliseContractPackInput(input);
  const vehicle = vehicleLabel(data) ? ` — ${vehicleLabel(data)}` : "";
  return `Your Buying Buddy private sale contract PDF${vehicle}`;
}

export function contractPackBuyerEmailHtml(input: Partial<ContractPackInput>) {
  const data = normaliseContractPackInput(input);
  const vehicle = vehicleLabel(data);
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
        <h1 style="margin:0;font-size:24px;line-height:1.15;">Your editable private sale contract PDF is attached</h1>
      </div>
      <div style="padding:28px 30px;">
        <p style="font-size:15px;line-height:1.65;margin:0 0 16px;">Hi${data.buyerName ? ` ${data.buyerName}` : ""},</p>
        <p style="font-size:15px;line-height:1.65;margin:0 0 16px;">Your Buying Buddy private vehicle sale contract for <strong>${escapeHtml(vehicle)}</strong> is attached as an editable PDF.</p>
        <div style="background:#ecfdf5;border:1px solid #ccfbf1;border-radius:14px;padding:18px;margin:20px 0;">
          <p style="margin:0;font-size:15px;line-height:1.6;"><strong>You’re in control.</strong> Review every field before signing. If the PPSR, ID, payment, safety certificate or vehicle details do not add up, pause before money changes hands.</p>
        </div>
        <p style="font-size:15px;line-height:1.65;margin:0 0 16px;">Before you sign, use the Deal Room workspace to keep the listing, inspection notes, PPSR, paperwork and seller messages in one sale-control record.</p>
        <p style="margin:24px 0;"><a href="${dealUrl}" style="display:inline-block;background:#0D9488;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:999px;">Open Deal Room</a></p>
        <p style="font-size:12px;line-height:1.6;color:#6b7280;margin:0;">This template is a practical private-sale record, not legal advice. Buying Buddy is not a party to the sale.</p>
      </div>
    </div>
  </body>
</html>`;
}

export function contractPackInternalEmailHtml(input: Partial<ContractPackInput>) {
  const data = normaliseContractPackInput(input);
  return `<!DOCTYPE html><html lang="en"><body style="font-family:Arial,Helvetica,sans-serif;"><h1>New contract PDF lead</h1><p><strong>Email:</strong> ${escapeHtml(data.email)}</p><p><strong>Buyer:</strong> ${escapeHtml(display(data.buyerName))}</p><p><strong>Vehicle:</strong> ${escapeHtml(display(vehicleLabel(data)))}</p><p><strong>Rego:</strong> ${escapeHtml(display(data.vehicleRego))}</p></body></html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
