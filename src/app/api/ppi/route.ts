import { NextResponse } from "next/server";
import { Resend } from "resend";
import { escape_html, rate_limit_response } from "@/lib/security";

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
  const limited = rate_limit_response(req, { key: "ppi", limit: 5, windowMs: 10 * 60 * 1000 });
  if (limited) return limited;

  try {
    const body = await req.json() as {
      name?: string; phone?: string; email?: string;
      carYear?: string; carMake?: string; carModel?: string;
      location?: string; preferredDate?: string; notes?: string;
    };

    const { name, phone, email, carYear, carMake, carModel, location, preferredDate, notes } = body;
    const safeEmail = email?.trim() ?? "";

    if (!safeEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    const clean = (value: string | undefined, fallback: string) =>
      escape_html((value?.trim() || fallback).slice(0, 500));

    const carRaw = [carYear, carMake, carModel].map((part) => part?.trim()).filter(Boolean).join(" ") || "Not specified";
    const car = escape_html(carRaw.slice(0, 180));
    const nameText = (name?.trim() || safeEmail).slice(0, 120);
    const nameHtml = escape_html(nameText);
    const phoneHtml = clean(phone, "Not provided");
    const emailHtml = escape_html(safeEmail);
    const locationHtml = clean(location, "Not provided");
    const preferredDateHtml = clean(preferredDate, "Not specified");
    const notesHtml = clean(notes, "None");
    const firstName = escape_html((nameText.split(" ")[0] || "there").slice(0, 80));

    const resend = getResend();

    // Notify Jordan
    await resend.emails.send({
      from: FROM,
      to: NOTIFY_EMAIL,
      subject: `New PPI Enquiry: ${carRaw.slice(0, 120)} — ${nameText}`,
      html: `
<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
  <h2 style="color:#0D9488;">New PPI Enquiry</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:6px 0;color:#6B7280;width:140px;">Name</td><td style="padding:6px 0;font-weight:600;">${nameHtml}</td></tr>
    <tr><td style="padding:6px 0;color:#6B7280;">Phone</td><td style="padding:6px 0;font-weight:600;">${phoneHtml}</td></tr>
    <tr><td style="padding:6px 0;color:#6B7280;">Email</td><td style="padding:6px 0;font-weight:600;">${emailHtml}</td></tr>
    <tr><td style="padding:6px 0;color:#6B7280;">Car</td><td style="padding:6px 0;font-weight:600;">${car}</td></tr>
    <tr><td style="padding:6px 0;color:#6B7280;">Location</td><td style="padding:6px 0;">${locationHtml}</td></tr>
    <tr><td style="padding:6px 0;color:#6B7280;">Preferred date</td><td style="padding:6px 0;">${preferredDateHtml}</td></tr>
    <tr><td style="padding:6px 0;color:#6B7280;">Notes</td><td style="padding:6px 0;">${notesHtml}</td></tr>
  </table>
</div>`,
    });

    // Confirm to user
    await resend.emails.send({
      from: FROM,
      to: safeEmail,
      subject: "PPI Enquiry Received — Buying Buddy",
      html: `
<div style="font-family:sans-serif;max-width:500px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <div style="background:#0D9488;padding:28px 40px;"><h1 style="color:#fff;margin:0;font-size:20px;">Buying Buddy</h1><p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px;">Pre-Purchase Inspection Enquiry</p></div>
  <div style="padding:32px 40px;">
    <p style="font-size:15px;color:#374151;">Hey ${firstName},</p>
    <p style="font-size:15px;color:#374151;">Got your enquiry for the <strong>${car}</strong>. We&apos;ll be in touch within a few hours to confirm availability, timing, and cost.</p>
    <p style="font-size:14px;color:#6B7280;margin-top:20px;">While you wait — if you haven&apos;t already run a PPSR check, it&apos;s worth doing now:</p>
    <a href="https://buyingbuddy.com.au" style="display:inline-block;background:#0D9488;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;margin-top:12px;">PPSR Check from $4.95</a>
  </div>
  <div style="background:#F3F4F6;padding:16px 40px;text-align:center;"><p style="color:#6B7280;font-size:12px;margin:0;">© 2026 Buying Buddy · <a href="https://buyingbuddy.com.au" style="color:#0D9488;">buyingbuddy.com.au</a></p></div>
</div>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("ppi route error:", err);
    return NextResponse.json({ error: "Failed to submit. Try again." }, { status: 500 });
  }
}
