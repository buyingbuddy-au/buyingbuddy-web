import PDFDocument from "pdfkit";

const TEAL = "#0D9488";
const TEAL_RGB: [number, number, number] = [13, 148, 136];
const DARK = "#1F2937";
const MID = "#4B5563";
const LIGHT = "#F3F4F6";
const BORDER = "#D1D5DB";
const PAGE_W = 595.28;
const MARGIN = 50;
const CW = PAGE_W - MARGIN * 2;

function rgb(r: number, g: number, b: number) {
  return `rgb(${r},${g},${b})` as unknown as string;
}

function header(doc: InstanceType<typeof PDFDocument>, subtitle: string) {
  doc.fillColor(rgb(...TEAL_RGB)).fontSize(22).font("Helvetica-Bold").text("Buying Buddy", MARGIN, 40, { width: CW });
  doc.fillColor(MID).fontSize(11).font("Helvetica").text(subtitle, MARGIN, 68, { width: CW });
  doc.moveTo(MARGIN, 86).lineTo(PAGE_W - MARGIN, 86).strokeColor(rgb(...TEAL_RGB)).lineWidth(2).stroke();
}

function footer(doc: InstanceType<typeof PDFDocument>) {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    doc.fontSize(8).fillColor("#9CA3AF").font("Helvetica")
      .text("buyingbuddy.com.au  ·  info@buyingbuddy.com.au  ·  QLD, Australia", MARGIN, doc.page.height - 36, { align: "center", width: CW })
      .text(`Page ${i + 1} of ${range.count}`, MARGIN, doc.page.height - 24, { align: "center", width: CW });
  }
}

function sectionTitle(doc: InstanceType<typeof PDFDocument>, text: string, y: number): number {
  doc.rect(MARGIN, y, CW, 24).fillColor(LIGHT).fill();
  doc.fillColor(rgb(...TEAL_RGB)).fontSize(11).font("Helvetica-Bold").text(text, MARGIN + 8, y + 6, { width: CW - 16 });
  return y + 30;
}

function fieldRow(doc: InstanceType<typeof PDFDocument>, label: string, y: number, wide = false): number {
  const h = wide ? 36 : 22;
  doc.rect(MARGIN, y, CW, h).fillColor("#FFFFFF").fill();
  doc.rect(MARGIN, y, CW, h).strokeColor(BORDER).lineWidth(0.5).stroke();
  doc.fillColor(MID).fontSize(9).font("Helvetica").text(label, MARGIN + 6, y + 4, { width: 160 });
  // underline for writing space
  doc.moveTo(MARGIN + 170, y + h - 4).lineTo(MARGIN + CW - 6, y + h - 4).strokeColor(BORDER).lineWidth(0.5).stroke();
  return y + h;
}

function checkRow(doc: InstanceType<typeof PDFDocument>, label: string, y: number): number {
  doc.rect(MARGIN, y, CW, 20).fillColor("#FFFFFF").fill();
  doc.rect(MARGIN, y, CW, 20).strokeColor(BORDER).lineWidth(0.3).stroke();
  // checkbox
  doc.rect(MARGIN + 6, y + 4, 12, 12).strokeColor(BORDER).lineWidth(0.8).stroke();
  doc.fillColor(DARK).fontSize(9).font("Helvetica").text(label, MARGIN + 24, y + 5, { width: CW - 30 });
  return y + 20;
}

function noteRow(doc: InstanceType<typeof PDFDocument>, y: number): number {
  doc.rect(MARGIN, y, CW, 28).fillColor("#FAFAFA").fill();
  doc.rect(MARGIN, y, CW, 28).strokeColor(BORDER).lineWidth(0.3).stroke();
  doc.fillColor("#9CA3AF").fontSize(8).font("Helvetica").text("Notes:", MARGIN + 6, y + 4);
  return y + 28;
}

function checkHeight(doc: InstanceType<typeof PDFDocument>, needed: number, y: number): number {
  if (y + needed > doc.page.height - 60) {
    doc.addPage();
    return 100;
  }
  return y;
}

// ─── DOCUMENT 1: VEHICLE SALES AGREEMENT ────────────────────────────────────
export function generateVehicleSalesAgreement(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: MARGIN, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    header(doc, "QLD Private Vehicle Sale Agreement");

    let y = 100;

    doc.fillColor(DARK).fontSize(10).font("Helvetica-Bold").text("VEHICLE SALE AGREEMENT — PRIVATE SALE", MARGIN, y, { align: "center", width: CW });
    y += 16;
    doc.fillColor(MID).fontSize(8).font("Helvetica").text("This agreement is made under Queensland law between the Seller and Buyer identified below.", MARGIN, y, { align: "center", width: CW });
    y += 20;

    // SELLER
    y = sectionTitle(doc, "SELLER DETAILS", y);
    y = fieldRow(doc, "Full Legal Name", y);
    y = fieldRow(doc, "Residential Address", y, true);
    y = fieldRow(doc, "Suburb / State / Postcode", y);
    y = fieldRow(doc, "Phone Number", y);
    y = fieldRow(doc, "Email Address", y);
    y = fieldRow(doc, "Driver Licence No.", y);
    y = fieldRow(doc, "Licence State", y);
    y += 10;

    // BUYER
    y = sectionTitle(doc, "BUYER DETAILS", y);
    y = fieldRow(doc, "Full Legal Name", y);
    y = fieldRow(doc, "Residential Address", y, true);
    y = fieldRow(doc, "Suburb / State / Postcode", y);
    y = fieldRow(doc, "Phone Number", y);
    y = fieldRow(doc, "Email Address", y);
    y = fieldRow(doc, "Driver Licence No.", y);
    y = fieldRow(doc, "Licence State", y);
    y += 10;

    // VEHICLE
    y = checkHeight(doc, 180, y);
    y = sectionTitle(doc, "VEHICLE DETAILS", y);
    y = fieldRow(doc, "Make", y);
    y = fieldRow(doc, "Model", y);
    y = fieldRow(doc, "Year of Manufacture", y);
    y = fieldRow(doc, "Colour", y);
    y = fieldRow(doc, "Body Type", y);
    y = fieldRow(doc, "Registration No. (Rego)", y);
    y = fieldRow(doc, "VIN (Vehicle Identification No.)", y);
    y = fieldRow(doc, "Engine No.", y);
    y = fieldRow(doc, "Odometer Reading (km)", y);
    y = fieldRow(doc, "Transmission", y);
    y = fieldRow(doc, "Fuel Type", y);
    y += 10;

    // SALE TERMS
    y = checkHeight(doc, 120, y);
    y = sectionTitle(doc, "SALE TERMS", y);
    y = fieldRow(doc, "Agreed Sale Price ($)", y);
    y = fieldRow(doc, "Deposit Paid ($)", y);
    y = fieldRow(doc, "Balance Owing ($)", y);
    y = fieldRow(doc, "Payment Method", y);
    y = fieldRow(doc, "Settlement / Handover Date", y);
    y = fieldRow(doc, "Settlement / Handover Location", y, true);
    y += 10;

    // INCLUSIONS
    y = checkHeight(doc, 80, y);
    y = sectionTitle(doc, "INCLUSIONS & ACCESSORIES", y);
    y = fieldRow(doc, "Number of Keys", y);
    y = fieldRow(doc, "Service History / Books", y);
    y = fieldRow(doc, "Other Items Included", y, true);
    y += 10;

    // DISCLOSURES
    y = checkHeight(doc, 120, y);
    y = sectionTitle(doc, "SELLER DISCLOSURES", y);
    const disclosures = [
      "The vehicle is free of all finance and encumbrances",
      "The vehicle has not been written off or recorded as a statutory write-off",
      "The odometer reading is accurate to the best of the seller's knowledge",
      "The seller is the legal owner and has the right to sell the vehicle",
      "All known defects and damage have been disclosed to the buyer",
    ];
    for (const d of disclosures) {
      y = checkHeight(doc, 22, y);
      y = checkRow(doc, d, y);
    }
    y += 6;
    doc.fillColor(MID).fontSize(8).font("Helvetica").text("Additional Disclosures / Known Defects:", MARGIN, y);
    y += 14;
    for (let i = 0; i < 4; i++) {
      doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor(BORDER).lineWidth(0.5).stroke();
      y += 16;
    }
    y += 10;

    // WARRANTIES
    y = checkHeight(doc, 80, y);
    y = sectionTitle(doc, "CONDITION & WARRANTIES", y);
    doc.fillColor(DARK).fontSize(9).font("Helvetica").text(
      "The vehicle is sold as a PRIVATE SALE. Unless otherwise stated in writing, no statutory warranties apply. The buyer acknowledges they have had the opportunity to inspect the vehicle and obtain an independent inspection prior to purchase.",
      MARGIN, y, { width: CW, lineGap: 3 }
    );
    y += 50;

    // SIGNATURES
    y = checkHeight(doc, 120, y);
    y = sectionTitle(doc, "SIGNATURES", y);
    y += 8;

    const halfW = (CW - 20) / 2;

    // Seller signature block
    doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold").text("SELLER", MARGIN, y);
    y += 14;
    doc.moveTo(MARGIN, y + 30).lineTo(MARGIN + halfW, y + 30).strokeColor(DARK).lineWidth(0.8).stroke();
    doc.fillColor(MID).fontSize(8).font("Helvetica").text("Signature", MARGIN, y + 33);
    doc.moveTo(MARGIN, y + 54).lineTo(MARGIN + halfW, y + 54).strokeColor(DARK).lineWidth(0.8).stroke();
    doc.text("Date", MARGIN, y + 57);
    doc.moveTo(MARGIN, y + 74).lineTo(MARGIN + halfW, y + 74).strokeColor(DARK).lineWidth(0.8).stroke();
    doc.text("Print Name", MARGIN, y + 77);

    // Buyer signature block
    const bx = MARGIN + halfW + 20;
    doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold").text("BUYER", bx, y - 14);
    doc.moveTo(bx, y + 30).lineTo(bx + halfW, y + 30).strokeColor(DARK).lineWidth(0.8).stroke();
    doc.fillColor(MID).fontSize(8).font("Helvetica").text("Signature", bx, y + 33);
    doc.moveTo(bx, y + 54).lineTo(bx + halfW, y + 54).strokeColor(DARK).lineWidth(0.8).stroke();
    doc.text("Date", bx, y + 57);
    doc.moveTo(bx, y + 74).lineTo(bx + halfW, y + 74).strokeColor(DARK).lineWidth(0.8).stroke();
    doc.text("Print Name", bx, y + 77);
    y += 90;

    // Legal note
    y = checkHeight(doc, 50, y);
    y += 10;
    doc.rect(MARGIN, y, CW, 40).fillColor("#F0FDF4").fill();
    doc.fillColor("#065F55").fontSize(8).font("Helvetica").text(
      "IMPORTANT: Both parties should retain a signed copy of this agreement. This document does not replace a PPSR check. Buyers are strongly advised to conduct a PPSR search at ppsr.gov.au before settlement. For legal advice, contact a QLD solicitor.",
      MARGIN + 8, y + 6, { width: CW - 16, lineGap: 2 }
    );

    footer(doc);
    doc.end();
  });
}

// ─── DOCUMENT 2: TRANSFER OF REGISTRATION GUIDE ─────────────────────────────
export function generateTransferGuide(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: MARGIN, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    header(doc, "QLD Transfer of Registration — Your Step-by-Step Guide");

    let y = 100;

    doc.fillColor(DARK).fontSize(13).font("Helvetica-Bold").text("How to Transfer a Vehicle Registration in Queensland", MARGIN, y, { width: CW });
    y += 22;
    doc.fillColor(MID).fontSize(10).font("Helvetica").text(
      "When you buy a private vehicle in QLD, both the buyer and seller must complete the transfer of registration. This must be done within 3 business days of the sale. Failure to transfer can leave the previous owner liable for the vehicle.",
      MARGIN, y, { width: CW, lineGap: 3 }
    );
    y += 45;

    const steps = [
      {
        num: "STEP 1",
        title: "Seller Completes Their Section of Form 13",
        body: "The seller fills out their details on the Transfer of Registration (Form 13), available from Transport and Main Roads offices or online at tmr.qld.gov.au. The seller must sign and date the form.",
      },
      {
        num: "STEP 2",
        title: "Confirm Vehicle Details Match",
        body: "Before signing, verify that the registration plate, VIN, make, model, and year on the form match the physical vehicle and the registration certificate. Do NOT proceed if details don't match.",
      },
      {
        num: "STEP 3",
        title: "Buyer Completes Their Section",
        body: "The buyer fills in their full name, address, date of birth, and contact details. The buyer must also sign the form. Both parties must sign — an incomplete form will be rejected.",
      },
      {
        num: "STEP 4",
        title: "Pay the Transfer Fee",
        body: "A transfer fee applies. As of 2026, standard passenger vehicles are approximately $34.05. Fees change — confirm the current fee at tmr.qld.gov.au or at the Queensland Transport counter.",
      },
      {
        num: "STEP 5",
        title: "Submit the Form Within 3 Business Days",
        body: "Submit the completed Form 13 at a Queensland Transport and Main Roads customer service centre, or online at tmr.qld.gov.au (if eligible). Online transfer is available 24/7 for eligible transactions.",
      },
      {
        num: "STEP 6",
        title: "Obtain Your New Registration Certificate",
        body: "You will receive a new certificate showing your name as the registered operator. Keep this in the vehicle. If the vehicle has a roadworthy or safety certificate requirement, ensure it is current.",
      },
    ];

    for (const step of steps) {
      y = checkHeight(doc, 90, y);
      doc.rect(MARGIN, y, CW, 80).fillColor(LIGHT).fill();
      doc.rect(MARGIN, y, 4, 80).fillColor(rgb(...TEAL_RGB)).fill();
      doc.fillColor(rgb(...TEAL_RGB)).fontSize(9).font("Helvetica-Bold").text(step.num, MARGIN + 12, y + 8, { width: 60 });
      doc.fillColor(DARK).fontSize(11).font("Helvetica-Bold").text(step.title, MARGIN + 12, y + 20, { width: CW - 20 });
      doc.fillColor(MID).fontSize(9).font("Helvetica").text(step.body, MARGIN + 12, y + 36, { width: CW - 20, lineGap: 2 });
      y += 88;
    }

    // IMPORTANT DATES SECTION
    y = checkHeight(doc, 80, y);
    y += 10;
    y = sectionTitle(doc, "KEY DATES TO RECORD", y);
    y = fieldRow(doc, "Date of Sale / Handover", y);
    y = fieldRow(doc, "Transfer Submitted Date", y);
    y = fieldRow(doc, "Transfer Confirmation / Receipt No.", y);
    y = fieldRow(doc, "New Rego Expiry Date", y);
    y += 10;

    // ONLINE LINK PANEL
    y = checkHeight(doc, 80, y);
    doc.rect(MARGIN, y, CW, 70).fillColor("#F0FDF4").fill();
    doc.rect(MARGIN, y, CW, 70).strokeColor("#0D9488").lineWidth(1).stroke();
    doc.fillColor("#065F55").fontSize(11).font("Helvetica-Bold").text("Get the Official QLD Form 13", MARGIN + 12, y + 10);
    doc.fillColor("#065F55").fontSize(9).font("Helvetica").text(
      "The Transfer of Registration (Form 13) is an official Queensland Government document. You must use the official form — not a copy.\n\nDownload or order the form at:  tmr.qld.gov.au  →  Registration  →  Transfer registration",
      MARGIN + 12, y + 26, { width: CW - 24, lineGap: 3 }
    );
    y += 78;

    // CHECKLIST
    y = checkHeight(doc, 120, y);
    y = sectionTitle(doc, "TRANSFER CHECKLIST", y);
    const checks = [
      "Form 13 — both buyer and seller sections completed and signed",
      "Vehicle registration certificate on hand (seller provides)",
      "Buyer photo ID ready (driver's licence)",
      "Payment for transfer fee arranged",
      "PPSR search completed and clear",
      "Vehicle condition report completed and signed",
      "Receipt of payment signed and copies held by both parties",
      "CTP insurance transferred or new policy arranged",
    ];
    for (const c of checks) {
      y = checkHeight(doc, 22, y);
      y = checkRow(doc, c, y);
    }
    y += 12;

    doc.rect(MARGIN, y, CW, 38).fillColor("#FFF7ED").fill();
    doc.fillColor("#92400E").fontSize(8).font("Helvetica-Bold").text("IMPORTANT:", MARGIN + 8, y + 6);
    doc.fillColor("#92400E").fontSize(8).font("Helvetica").text(
      "Until the transfer is complete, the SELLER remains the registered operator and may be liable for traffic infringements and incidents involving the vehicle. Complete the transfer immediately after handover.",
      MARGIN + 58, y + 6, { width: CW - 66, lineGap: 2 }
    );

    footer(doc);
    doc.end();
  });
}

// ─── DOCUMENT 3: VEHICLE CONDITION REPORT ───────────────────────────────────
export function generateConditionReport(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: MARGIN, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    header(doc, "Vehicle Condition Report — Handover Day Checklist");

    let y = 100;

    doc.fillColor(MID).fontSize(9).font("Helvetica").text(
      "Complete this report at the time of handover with both buyer and seller present. Both parties should sign and retain a copy.",
      MARGIN, y, { width: CW }
    );
    y += 22;

    // Vehicle & parties
    y = sectionTitle(doc, "VEHICLE & PARTIES", y);
    y = fieldRow(doc, "Make / Model / Year", y);
    y = fieldRow(doc, "Rego / VIN", y);
    y = fieldRow(doc, "Odometer at Handover (km)", y);
    y = fieldRow(doc, "Date of Handover", y);
    y = fieldRow(doc, "Seller Name", y);
    y = fieldRow(doc, "Buyer Name", y);
    y += 10;

    const sections: Array<{ title: string; items: string[] }> = [
      {
        title: "EXTERIOR",
        items: [
          "Front bumper — no damage",
          "Rear bumper — no damage",
          "Bonnet — no dents / scratches",
          "Driver door — no dents / scratches",
          "Passenger door(s) — no dents / scratches",
          "Roof — no damage",
          "Boot lid / tailgate — no damage",
          "All glass (windscreen, windows, mirrors) — intact",
          "Headlights — working and undamaged",
          "Tail lights — working and undamaged",
          "Indicators — all working",
          "Paintwork — consistent colour, no significant fade/rust",
        ],
      },
      {
        title: "TYRES & WHEELS",
        items: [
          "Front tyres — adequate tread (>1.5mm)",
          "Rear tyres — adequate tread (>1.5mm)",
          "Spare tyre / repair kit present",
          "Alloys / wheel covers — no significant damage",
          "Tyre pressure checked",
        ],
      },
      {
        title: "INTERIOR",
        items: [
          "Dashboard — no warning lights active",
          "Driver's seat — no tears / damage",
          "Passenger seat(s) — no tears / damage",
          "Rear seats — no tears / damage",
          "Carpet / floor mats — present and undamaged",
          "Seatbelts — all present and retracting properly",
          "Steering wheel — no excessive wear",
          "All windows — fully operational",
          "Central locking — working",
          "Air conditioning — working and cooling",
          "Heater — working",
          "Radio / media system — working",
          "Boot / cargo area — clean and undamaged",
        ],
      },
      {
        title: "ENGINE & MECHANICAL",
        items: [
          "Engine — starts first time, no warning lights",
          "Engine bay — no visible leaks (oil, coolant)",
          "Oil level — checked and within range",
          "Coolant level — checked and within range",
          "Brake fluid — at correct level",
          "Brakes — no pulling, grinding, or unusual noise",
          "Clutch (manual) — engaging smoothly",
          "Gearbox — all gears selecting correctly",
          "Exhaust — no excessive smoke or unusual noise",
          "Suspension — no clunks or excessive body roll",
        ],
      },
      {
        title: "ELECTRICAL",
        items: [
          "Battery — charge holding",
          "Starter motor — no hesitation",
          "Wipers (front and rear) — working",
          "Horn — working",
          "Internal lights (cabin, boot) — working",
          "Power windows — all functional",
          "Heated seats (if fitted) — working",
          "Bluetooth / connectivity (if fitted) — working",
        ],
      },
      {
        title: "DOCUMENTS & KEYS",
        items: [
          "Registration certificate handed over",
          "All keys / key fobs handed over",
          "Service history / logbook handed over",
          "Owner's manual handed over",
          "RWC / Safety Certificate (if applicable) provided",
        ],
      },
    ];

    for (const section of sections) {
      y = checkHeight(doc, 40 + section.items.length * 21, y);
      y = sectionTitle(doc, section.title, y);
      for (const item of section.items) {
        y = checkHeight(doc, 22, y);
        // Checkbox + item + condition columns
        doc.rect(MARGIN, y, CW, 20).fillColor("#FFFFFF").fill();
        doc.rect(MARGIN, y, CW, 20).strokeColor(BORDER).lineWidth(0.3).stroke();
        doc.rect(MARGIN + 6, y + 4, 12, 12).strokeColor(BORDER).lineWidth(0.8).stroke();
        doc.fillColor(DARK).fontSize(8.5).font("Helvetica").text(item, MARGIN + 24, y + 5, { width: CW - 130 });
        // Condition: OK / Defect / N/A boxes
        const bw = 28;
        const labels = ["OK", "Defect", "N/A"];
        let bx = MARGIN + CW - bw * 3 - 6;
        for (const lbl of labels) {
          doc.rect(bx, y + 3, bw - 2, 14).strokeColor(BORDER).lineWidth(0.5).stroke();
          doc.fillColor(MID).fontSize(7).font("Helvetica").text(lbl, bx + 1, y + 6, { width: bw - 4, align: "center" });
          bx += bw;
        }
        y += 20;
      }
      y = noteRow(doc, y);
      y += 4;
    }

    // Known defects
    y = checkHeight(doc, 100, y);
    y = sectionTitle(doc, "KNOWN DEFECTS / AGREED ITEMS", y);
    doc.fillColor(MID).fontSize(8).font("Helvetica").text(
      "List any known defects, damage, or issues agreed between buyer and seller:",
      MARGIN, y, { width: CW }
    );
    y += 14;
    for (let i = 0; i < 6; i++) {
      doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor(BORDER).lineWidth(0.5).stroke();
      y += 18;
    }
    y += 10;

    // Signatures
    y = checkHeight(doc, 100, y);
    y = sectionTitle(doc, "SIGNATURES", y);
    y += 6;
    const hw = (CW - 20) / 2;
    doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold").text("SELLER", MARGIN, y);
    doc.moveTo(MARGIN, y + 28).lineTo(MARGIN + hw, y + 28).strokeColor(DARK).lineWidth(0.8).stroke();
    doc.fillColor(MID).fontSize(8).font("Helvetica").text("Signature / Date", MARGIN, y + 31);
    const bx2 = MARGIN + hw + 20;
    doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold").text("BUYER", bx2, y);
    doc.moveTo(bx2, y + 28).lineTo(bx2 + hw, y + 28).strokeColor(DARK).lineWidth(0.8).stroke();
    doc.fillColor(MID).fontSize(8).font("Helvetica").text("Signature / Date", bx2, y + 31);
    y += 44;

    doc.rect(MARGIN, y, CW, 32).fillColor("#F0FDF4").fill();
    doc.fillColor("#065F55").fontSize(8).font("Helvetica").text(
      "Both parties should sign two copies of this report and retain one each. Photographs of the vehicle at handover are strongly recommended. Attach photos to this report where possible.",
      MARGIN + 8, y + 6, { width: CW - 16, lineGap: 2 }
    );

    footer(doc);
    doc.end();
  });
}

// ─── DOCUMENT 4: RECEIPT OF PAYMENT ─────────────────────────────────────────
export function generateReceiptOfPayment(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: MARGIN, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    header(doc, "Receipt of Payment — Private Vehicle Sale");

    let y = 100;

    // Receipt header box
    doc.rect(MARGIN, y, CW, 36).fillColor(rgb(...TEAL_RGB)).fill();
    doc.fillColor("#FFFFFF").fontSize(16).font("Helvetica-Bold").text("RECEIPT OF PAYMENT", MARGIN, y + 10, { align: "center", width: CW });
    y += 42;

    doc.fillColor(MID).fontSize(9).font("Helvetica").text(
      "This receipt confirms that payment has been received for the vehicle described below. Both parties should retain a signed copy.",
      MARGIN, y, { width: CW, align: "center" }
    );
    y += 24;

    y = sectionTitle(doc, "RECEIPT DETAILS", y);
    y = fieldRow(doc, "Receipt Number", y);
    y = fieldRow(doc, "Date of Payment", y);
    y = fieldRow(doc, "Time of Payment", y);
    y += 10;

    y = sectionTitle(doc, "SELLER (RECEIVING PAYMENT)", y);
    y = fieldRow(doc, "Full Legal Name", y);
    y = fieldRow(doc, "Address", y, true);
    y = fieldRow(doc, "Phone / Email", y);
    y = fieldRow(doc, "Bank Account (last 4 digits)", y);
    y += 10;

    y = sectionTitle(doc, "BUYER (MAKING PAYMENT)", y);
    y = fieldRow(doc, "Full Legal Name", y);
    y = fieldRow(doc, "Address", y, true);
    y = fieldRow(doc, "Phone / Email", y);
    y += 10;

    y = sectionTitle(doc, "VEHICLE DETAILS", y);
    y = fieldRow(doc, "Make / Model / Year", y);
    y = fieldRow(doc, "Registration No. (Rego)", y);
    y = fieldRow(doc, "VIN", y);
    y = fieldRow(doc, "Odometer at Sale (km)", y);
    y = fieldRow(doc, "Colour", y);
    y += 10;

    y = sectionTitle(doc, "PAYMENT DETAILS", y);
    y = fieldRow(doc, "Total Agreed Sale Price ($)", y);
    y = fieldRow(doc, "Deposit Previously Paid ($)", y);
    y = fieldRow(doc, "Amount Received Today ($)", y);
    y = fieldRow(doc, "Balance Remaining ($)", y);
    y = fieldRow(doc, "Payment Method", y);

    // Payment method checkboxes
    y += 6;
    const methods = ["Bank Transfer (EFT)", "Cash", "Bank Cheque", "Other"];
    let mx = MARGIN;
    for (const m of methods) {
      doc.rect(mx, y, 12, 12).strokeColor(BORDER).lineWidth(0.8).stroke();
      doc.fillColor(DARK).fontSize(9).font("Helvetica").text(m, mx + 16, y + 1);
      mx += 110;
    }
    y += 22;

    // BSB / Reference
    y = sectionTitle(doc, "TRANSACTION REFERENCE (if applicable)", y);
    y = fieldRow(doc, "Bank Reference / Transfer ID", y);
    y = fieldRow(doc, "BSB", y);
    y = fieldRow(doc, "Account Name", y);
    y += 10;

    // Condition at payment
    y = sectionTitle(doc, "VEHICLE CONDITION AT PAYMENT", y);
    y = checkRow(doc, "Buyer has inspected the vehicle and accepts it in its current condition", y);
    y = checkRow(doc, "Seller confirms no outstanding finance, encumbrances, or hidden defects", y);
    y = checkRow(doc, "All keys, documents, and agreed accessories have been handed over", y);
    y = checkRow(doc, "Vehicle condition report has been completed and signed by both parties", y);
    y += 10;

    // Signatures
    y = checkHeight(doc, 110, y);
    y = sectionTitle(doc, "SIGNATURES", y);
    y += 8;
    const hw = (CW - 20) / 2;

    doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold").text("SELLER", MARGIN, y);
    doc.moveTo(MARGIN, y + 30).lineTo(MARGIN + hw, y + 30).strokeColor(DARK).lineWidth(0.8).stroke();
    doc.fillColor(MID).fontSize(8).font("Helvetica").text("Signature", MARGIN, y + 33);
    doc.moveTo(MARGIN, y + 52).lineTo(MARGIN + hw, y + 52).strokeColor(DARK).lineWidth(0.8).stroke();
    doc.text("Print Name", MARGIN, y + 55);
    doc.moveTo(MARGIN, y + 72).lineTo(MARGIN + hw, y + 72).strokeColor(DARK).lineWidth(0.8).stroke();
    doc.text("Date", MARGIN, y + 75);

    const bx3 = MARGIN + hw + 20;
    doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold").text("BUYER", bx3, y);
    doc.moveTo(bx3, y + 30).lineTo(bx3 + hw, y + 30).strokeColor(DARK).lineWidth(0.8).stroke();
    doc.fillColor(MID).fontSize(8).font("Helvetica").text("Signature", bx3, y + 33);
    doc.moveTo(bx3, y + 52).lineTo(bx3 + hw, y + 52).strokeColor(DARK).lineWidth(0.8).stroke();
    doc.text("Print Name", bx3, y + 55);
    doc.moveTo(bx3, y + 72).lineTo(bx3 + hw, y + 72).strokeColor(DARK).lineWidth(0.8).stroke();
    doc.text("Date", bx3, y + 75);
    y += 88;

    // Note
    y = checkHeight(doc, 50, y);
    doc.rect(MARGIN, y, CW, 40).fillColor("#FFF7ED").fill();
    doc.fillColor("#92400E").fontSize(8).font("Helvetica").text(
      "KEEP THIS RECEIPT: This document is proof of payment and ownership transfer. Retain it with your Vehicle Sale Agreement and Vehicle Condition Report. You will need it if any dispute arises regarding the sale.",
      MARGIN + 8, y + 6, { width: CW - 16, lineGap: 2 }
    );

    footer(doc);
    doc.end();
  });
}
