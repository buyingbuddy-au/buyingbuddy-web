import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { Resend } from "resend";
import {
  buildContractLeadSummary,
  contractPackBuyerEmailHtml,
  contractPackEmailSubject,
  contractPackInternalEmailHtml,
  contractPdfFilename,
  generatePrivateSaleContractPdf,
  normaliseContractPackInput,
  type ContractPackInput,
} from "@/lib/contract-pack-pdf";
import { upsert_email_capture } from "@/lib/db";

export const runtime = "nodejs";

const FROM = "Buying Buddy <info@buyingbuddy.com.au>";
const INFO_EMAIL = "info@buyingbuddy.com.au";

function json(payload: Record<string, unknown>, status: number) {
  return NextResponse.json(payload, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function readJson(req: Request) {
  try {
    return { ok: true as const, body: await req.json() as unknown };
  } catch {
    return { ok: false as const, error: "invalid_json" };
  }
}

function getResendClient() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key || key === "re_placeholder_replace_with_real_key") return null;
  return new Resend(key);
}

function buildVehicleSummary(input: ContractPackInput) {
  return buildContractLeadSummary(input);
}

export async function POST(req: Request) {
  const parsed = await readJson(req);
  if (!parsed.ok) {
    return json({ ok: false, error: parsed.error, message: "Send the contract details as valid JSON." }, 400);
  }

  if (!isRecord(parsed.body)) {
    return json({ ok: false, error: "invalid_body", message: "Send the contract details as a JSON object." }, 400);
  }

  const input = normaliseContractPackInput(parsed.body as Partial<ContractPackInput>);

  if (!isValidEmail(input.email)) {
    return json({ ok: false, error: "invalid_email", message: "Enter a valid email so we can send the contract PDF." }, 400);
  }

  const resend = getResendClient();
  if (!resend) {
    return json({ ok: false, error: "email_not_configured", message: "Email delivery is not configured yet. Please try again shortly." }, 503);
  }

  try {
    const pdf = await generatePrivateSaleContractPdf(input);
    const filename = contractPdfFilename();

    await resend.emails.send({
      from: FROM,
      to: input.email,
      subject: contractPackEmailSubject(input),
      html: contractPackBuyerEmailHtml(input),
      attachments: [
        {
          filename,
          content: pdf,
          contentType: "application/pdf",
        },
      ],
    });

    try {
      await upsert_email_capture({
        id: randomUUID(),
        email: input.email,
        listing_url: null,
        vehicle_summary: buildVehicleSummary(input),
        converted_to_order: null,
      });
    } catch (error) {
      console.warn("[contract-pack] lead capture failed", error);
    }

    try {
      await resend.emails.send({
        from: FROM,
        to: INFO_EMAIL,
        subject: `New contract PDF lead: ${input.email}`,
        html: contractPackInternalEmailHtml(input),
      });
    } catch (error) {
      console.warn("[contract-pack] internal notification failed", error);
    }

    return json({ ok: true, delivery: "email", filename, email: input.email }, 200);
  } catch (error) {
    console.error("[contract-pack] send failed", error);
    return json({ ok: false, error: "contract_send_failed", message: "We could not email the contract PDF. Please try again." }, 502);
  }
}
