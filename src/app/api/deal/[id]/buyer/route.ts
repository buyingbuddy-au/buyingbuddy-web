import { NextResponse } from "next/server";
import { get_public_deal_by_id, update_buyer_deal_section } from "@/lib/deals";
import type { DealBuyerUpdateInput } from "@/lib/types";
import { uploadBase64Image } from "@/lib/upload";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as DealBuyerUpdateInput;

    // Process massive base64 uploads into Vercel Blob URLs
    if (body.buyer_licence?.startsWith("data:")) {
      body.buyer_licence = await uploadBase64Image(body.buyer_licence, `deal-${id}-buyer-licence`) || body.buyer_licence;
    }

    await update_buyer_deal_section(id, body);
    const deal = await get_public_deal_by_id(id);

    if (!deal) {
      return NextResponse.json(
        { ok: false, error: "Deal Room not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, deal });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to save buyer details.",
      },
      { status: 400 },
    );
  }
}
