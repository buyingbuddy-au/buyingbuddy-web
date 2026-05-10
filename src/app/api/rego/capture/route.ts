import { NextResponse } from "next/server";
import { Resend } from "resend";
import { validateQldRego } from "@/lib/qld-rego/normalise";

export const runtime = "nodejs";

const FROM = "Buying Buddy <info@buyingbuddy.com.au>";
const NOTIFY_EMAIL = "info@buyingbuddy.com.au";

type RegoCaptureRequest = {
  rego?: unknown;
  email?: unknown;
  reason?: unknown;
};

type RegoCaptureParseResult =
  | { ok: true; body: RegoCaptureRequest }
  | { ok: false; error: string; userMessage: string };

function inputErrorResponse(error: string, userMessage: string) {
  return NextResponse.json(
    {
      ok: false,
      status: "input_error",
      error,
      userMessage,
      checkedAt: new Date().toISOString(),
      retryable: false,
    },
    { status: 400 },
  );
}

function isObjectBody(value: unknown): value is RegoCaptureRequest {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function parseRegoCaptureRequest(request: Request): Promise<RegoCaptureParseResult> {
  try {
    const body = await request.json();
    if (!isObjectBody(body)) {
      return {
        ok: false,
        error: "invalid_body",
        userMessage: "Send rego capture details as a JSON object.",
      };
    }

    return { ok: true, body };
  } catch {
    return {
      ok: false,
      error: "invalid_json",
      userMessage: "We couldn't read that rego capture request. Try again.",
    };
  }
}

const CAPTURE_RATE_LIMIT_SCOPE = "instance" as const;
const CAPTURE_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const captureHourlyHits: number[] = [];

function captureMaxPerHour() {
  const value = Number(process.env.REGO_CAPTURE_MAX_PER_HOUR ?? 6);
  return Number.isFinite(value) && value >= 0 ? value : 6;
}

function registerCaptureHit() {
  const cutoff = Date.now() - CAPTURE_RATE_LIMIT_WINDOW_MS;
  while (captureHourlyHits.length && captureHourlyHits[0] < cutoff) captureHourlyHits.shift();

  if (captureHourlyHits.length >= captureMaxPerHour()) return false;

  captureHourlyHits.push(Date.now());
  return true;
}

function captureRateLimitResponse() {
  return NextResponse.json(
    {
      ok: false,
      status: "busy",
      error: "hourly_limit",
      userMessage: "We’re pacing rego follow-up emails for the moment. Try again shortly.",
      checkedAt: new Date().toISOString(),
      retryable: true,
      rateLimitScope: CAPTURE_RATE_LIMIT_SCOPE,
    },
    { status: 429, headers: { "x-rego-rate-limit-scope": CAPTURE_RATE_LIMIT_SCOPE } },
  );
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: unknown) {
  return String(value).replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

function sellerScriptHtml(rego: string) {
  const escapedRego = escapeHtml(rego);

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:620px;margin:0 auto;padding:24px;color:#111827;">
      <h1 style="margin:0 0 8px;font-size:24px;">Your seller question script</h1>
      <p style="color:#4B5563;line-height:1.6;">We’ll keep trying the QLD rego check for <strong>${escapedRego}</strong>. In the meantime, send this to the seller before you drive out:</p>
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
    const parsed = await parseRegoCaptureRequest(request);
    if (parsed.ok === false) {
      return inputErrorResponse(parsed.error, parsed.userMessage);
    }

    const body = parsed.body;
    const rawEmail = body.email;
    if (rawEmail !== undefined && typeof rawEmail !== "string") {
      return inputErrorResponse("invalid_email", "Enter a valid email address.");
    }

    const rawRego = body.rego;
    if (rawRego !== undefined && typeof rawRego !== "string") {
      return inputErrorResponse("invalid_rego", "Enter a valid QLD rego.");
    }

    const rawReason = body.reason;
    if (rawReason !== undefined && typeof rawReason !== "string") {
      return inputErrorResponse("invalid_reason", "Enter a reason as text.");
    }

    const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
    const reason = typeof rawReason === "string" ? rawReason : undefined;
    const validation = validateQldRego(typeof rawRego === "string" ? rawRego : "");

    if (!validation.ok) {
      return inputErrorResponse("invalid_rego", validation.error);
    }
    if (!validEmail(email)) {
      return inputErrorResponse("invalid_email", "Enter a valid email address.");
    }

    if (!registerCaptureHit()) {
      return captureRateLimitResponse();
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
      const reasonHtml = escapeHtml(reason ?? "not supplied");
      const regoHtml = escapeHtml(validation.rego);
      const emailHtml = escapeHtml(email);

      await resend.emails.send({
        from: FROM,
        to: NOTIFY_EMAIL,
        subject: `QLD rego fallback lead: ${validation.rego}`,
        html: `<p><strong>Rego:</strong> ${regoHtml}</p><p><strong>Email:</strong> ${emailHtml}</p><p><strong>Reason:</strong> ${reasonHtml}</p>`,
      });
    } else {
      console.info("rego capture stored without email provider", { rego: validation.rego, email, reason });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("rego capture route error", error);
    return NextResponse.json({ ok: false, error: "Could not save that email. Try again." }, { status: 500 });
  }
}
