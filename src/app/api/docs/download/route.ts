import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import archiver from "archiver";
import { Resend } from "resend";
import {
  generateVehicleSalesAgreement,
  generateTransferGuide,
  generateConditionReport,
  generateReceiptOfPayment,
} from "@/lib/handover-pdfs";
import { upsert_email_capture } from "@/lib/db";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === "re_placeholder_replace_with_real_key") return null;
  return new Resend(key);
}

async function buildZip(pdfs: Array<{ name: string; buffer: Buffer }>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver("zip", { zlib: { level: 6 } });
    const chunks: Buffer[] = [];

    archive.on("data", (c: Buffer) => chunks.push(c));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);

    for (const { name, buffer } of pdfs) {
      archive.append(buffer, { name });
    }

    archive.finalize().catch(reject);
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as { email?: string };
    const email = body?.email?.trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    // Capture lead
    try {
      upsert_email_capture({
        id: randomUUID(),
        email,
        listing_url: null,
        vehicle_summary: "QLD Handover Pack download",
        converted_to_order: null,
      });
    } catch {
      // non-fatal — continue
    }

    // Generate all 4 PDFs in parallel
    const [salesAgreement, transferGuide, conditionReport, receipt] = await Promise.all([
      generateVehicleSalesAgreement(),
      generateTransferGuide(),
      generateConditionReport(),
      generateReceiptOfPayment(),
    ]);

    const pdfs = [
      { name: "01_Vehicle_Sales_Agreement.pdf", buffer: salesAgreement },
      { name: "02_Transfer_of_Registration_Guide.pdf", buffer: transferGuide },
      { name: "03_Vehicle_Condition_Report.pdf", buffer: conditionReport },
      { name: "04_Receipt_of_Payment.pdf", buffer: receipt },
    ];

    const zip = await buildZip(pdfs);

    // Notify Jordan (fire and forget)
    const resend = getResend();
    if (resend) {
      resend.emails.send({
        from: "Buying Buddy <info@buyingbuddy.com.au>",
        to: "info@buyingbuddy.com.au",
        subject: `New QLD Handover Pack download: ${email}`,
        html: `<p>Someone downloaded the QLD Handover Pack.</p><p><strong>Email:</strong> ${email}</p>`,
      }).catch(() => {}); // non-fatal
    }

    return new Response(zip as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="BuyingBuddy_QLD_Handover_Pack.zip"',
        "Content-Length": String(zip.length),
      },
    });
  } catch (err) {
    console.error("docs/download error:", err);
    return NextResponse.json({ error: "Failed to generate documents. Please try again." }, { status: 500 });
  }
}
