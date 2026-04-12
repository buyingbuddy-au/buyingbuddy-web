import { NextResponse } from "next/server";
import { finalise_deal_record, get_public_deal_by_id } from "@/lib/deals";

export const runtime = "nodejs";

function resolve_base_url(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    return origin;
  }

  const forwarded_host = request.headers.get("x-forwarded-host");
  const host = forwarded_host || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  return new URL(request.url).origin;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const deal_record = await finalise_deal_record({
      base_url: resolve_base_url(request),
      deal_id: id,
    });
    const deal = await get_public_deal_by_id(deal_record.id);

    return NextResponse.json({
      ok: true,
      deal,
      pdf_url: deal_record.summary_pdf_url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to finalise Deal Room.",
      },
      { status: 400 },
    );
  }
}
