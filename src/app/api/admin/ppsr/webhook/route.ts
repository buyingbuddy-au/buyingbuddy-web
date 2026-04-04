import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/email";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.STRIPE_WEBHOOK_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { referenceId, vin, status, pdfBase64, timestamp, error } = body;

    console.log(`Received PPSR webhook for ${vin} [${status}]`);

    if (status === "failed") {
      console.error(`PPSR Automation failed for ${vin}:`, error);
      // Notify Jordan on Telegram
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: "1296786949",
          text: `🚨 PPSR Automation failed on Surface laptop!\nVIN: ${vin}\nError: ${error}`
        })
      });
      return NextResponse.json({ ok: true, msg: "Failure logged" });
    }

    if (!pdfBase64) {
      return NextResponse.json({ ok: false, error: "No PDF provided" }, { status: 400 });
    }

    // Convert back from base64
    const pdfBuffer = Buffer.from(pdfBase64, "base64");

    // Fetch the original buyer email from db based on referenceId/order
    // For now we'll just extract the email from the referenceId if encoded, or notify Jordan.
    const buyerEmail = referenceId.includes("@") ? referenceId : "info@buyingbuddy.com.au";

    await resend.emails.send({
      from: "BuyingBuddy <info@buyingbuddy.com.au>",
      to: [buyerEmail],
      bcc: ["info@buyingbuddy.com.au"],
      subject: `Your PPSR Certificate for ${vin}`,
      html: `<p>Hi there,</p><p>Your official PPSR certificate for VIN <strong>${vin}</strong> is attached.</p><p>Review the report carefully for finance owing, write-off history, or stolen status before handing over any cash.</p><p>Cheers,<br>Jordan<br>BuyingBuddy</p>`,
      attachments: [
        {
          filename: `PPSR-${vin}.pdf`,
          content: pdfBuffer,
        }
      ]
    });

    console.log(`Sent PPSR PDF to ${buyerEmail}`);
    
    // Notify Telegram success
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: "1296786949",
        text: `✅ PPSR Auto-delivered!\nVIN: ${vin}\nSent to: ${buyerEmail}`
      })
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("PPSR webhook processing failed:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
