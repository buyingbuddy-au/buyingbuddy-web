import { NextResponse } from "next/server";
import { Resend } from "resend";
import { validateQldRego } from "@/lib/qld-rego/normalise";

export const runtime = "nodejs";

const FROM = "Buying Buddy <info@buyingbuddy.com.au>";
const NOTIFY_EMAIL = "info@buyingbuddy.com.au";

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sellerScriptHtml(rego: string) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:620px;margin:0 auto;padding:24px;color:#111827;">
      <h1 style="margin:0 0 8px;font-size:24px;">Your seller question script</h1>
      <p style="color:#4B5563;line-height:1.6;">We’ll keep trying the QLD rego check for <strong>${rego}</strong>. In the meantime, send this to the seller before you drive out:</p>
      <div style="background:#F0FDFA;border:1px solid #99F6E4;border-radius:14px;padding:18px;margin:20px 0;">
        <p style="margin:0 0 12px;font-weight:700;color:#134E4A;">Copy/paste this:</p>
        <p style="white-space:pre-line;color:#134E4A;line-height:1.7;margin:0;">Hey, before I come inspect it, can you send me:
1. A photo of the VIN plate
2. A current odometer photo
3. Service history photos
4. Whether there’s any finance owing
5. Whether it has ever been written off, repaired after accident damage, used for rideshare/delivery, or sold through auction?</p>
      </div>
      <p style="color:#4B5563;line-height:1.6;">A current rego is useful, but it does not replace a PPSR or inspection. It’s just the first filter.</p>
      <p><a href="https://buyingbuddy.com.au/ppsr" style="display:inline-block;background:#0D9488;color:white;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">Get the PPSR next</a></p>
    </div>`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { rego?: string; email?: string; reason?: string };
    const email = (body.email ?? "").trim();
    const validation = validateQldRego(body.rego ?? "");

    if (!validation.ok) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
    }
    if (!validEmail(email)) {
      return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && apiKey !== "re_your_resend_api_key_here") {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: `Your QLD rego follow-up for ${validation.rego}`,
        html: sellerScriptHtml(validation.rego),
      });
      await resend.emails.send({
        from: FROM,
        to: NOTIFY_EMAIL,
        subject: `QLD rego fallback lead: ${validation.rego}`,
        html: `<p><strong>Rego:</strong> ${validation.rego}</p><p><strong>Email:</strong> ${email}</p><p><strong>Reason:</strong> ${body.reason ?? "not supplied"}</p>`,
      });
    } else {
      console.info("rego capture stored without email provider", { rego: validation.rego, email, reason: body.reason });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("rego capture route error", error);
    return NextResponse.json({ ok: false, error: "Could not save that email. Try again." }, { status: 500 });
  }
}
