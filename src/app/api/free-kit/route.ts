import { NextResponse } from "next/server";
import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === "re_placeholder_replace_with_real_key") {
    throw new Error("RESEND_API_KEY not configured");
  }
  return new Resend(key);
}
const FROM = "Buying Buddy <info@buyingbuddy.com.au>";
const NOTIFY_EMAIL = "info@buyingbuddy.com.au";

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json() as { name?: string; email?: string };

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    const firstName = name?.split(" ")[0] ?? "there";

    const resend = getResend();

    // Send kit email to user
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Your QLD Car Buyer's Protection Kit — Buying Buddy",
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F9FAFB;margin:0;padding:0;">
  <div style="max-width:600px;margin:40px auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <div style="background:#0D9488;padding:28px 40px;">
      <h1 style="color:#FFFFFF;margin:0;font-size:22px;font-weight:700;">Buying Buddy</h1>
      <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px;">Your QLD Car Buyer's Protection Kit</p>
    </div>
    <div style="padding:32px 40px;">
      <p style="font-size:15px;color:#374151;">Hey ${firstName},</p>
      <p style="font-size:15px;color:#374151;">Thanks for grabbing the kit. Here's what you've got:</p>
      <div style="background:#F0FDF9;border-left:4px solid #0D9488;border-radius:0 6px 6px 0;padding:14px 18px;margin:20px 0;">
        <p style="margin:4px 0;font-size:14px;color:#065F55;"><strong>01 — Pre-Purchase Checklist</strong><br/>20 checks before you make any offer.</p>
        <p style="margin:12px 0 4px;font-size:14px;color:#065F55;"><strong>02 — PPSR Check Guide</strong><br/>What it shows, how to read it, what to do.</p>
        <p style="margin:12px 0 4px;font-size:14px;color:#065F55;"><strong>03 — Private Sale Contract Essentials</strong><br/>What QLD law requires sellers to include.</p>
        <p style="margin:12px 0 4px;font-size:14px;color:#065F55;"><strong>04 — Negotiation Scripts</strong><br/>5 real scripts for real situations.</p>
        <p style="margin:12px 0 4px;font-size:14px;color:#065F55;"><strong>05 — Walk-Away Red Flags</strong><br/>The signs to kill the deal immediately.</p>
      </div>
      <p style="font-size:14px;color:#6B7280;">The full kit is available on our website — bookmark it for your next search:</p>
      <a href="https://buyingbuddy.com.au/free-kit" style="display:inline-block;background:#0D9488;color:#FFFFFF;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;margin-top:16px;">Access Your Kit</a>
      <p style="font-size:13px;color:#9CA3AF;margin-top:24px;">Want a PPSR check or a full dealer-level review of a specific car? <a href="https://buyingbuddy.com.au" style="color:#0D9488;">buyingbuddy.com.au</a> — starts at $4.95.</p>
    </div>
    <div style="background:#F3F4F6;padding:20px 40px;text-align:center;">
      <p style="color:#6B7280;font-size:12px;margin:0;">© 2026 Buying Buddy · <a href="https://buyingbuddy.com.au" style="color:#0D9488;">buyingbuddy.com.au</a></p>
    </div>
  </div>
</body>
</html>`,
    });

    // Notify Jordan
    await resend.emails.send({
      from: FROM,
      to: NOTIFY_EMAIL,
      subject: `New kit download: ${email}`,
      html: `<p>New lead from free kit download.</p><p><strong>Name:</strong> ${name ?? "Not provided"}<br/><strong>Email:</strong> ${email}</p>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("free-kit route error:", err);
    return NextResponse.json({ error: "Failed to send email. Try again." }, { status: 500 });
  }
}
