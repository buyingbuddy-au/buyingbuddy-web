import { NextResponse } from "next/server";
import { get_public_deal_by_id, update_seller_deal_section } from "@/lib/deals";
import type { DealSellerUpdateInput } from "@/lib/types";
import { uploadBase64Image } from "@/lib/upload";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as DealSellerUpdateInput;

    // Process massive base64 uploads into Vercel Blob URLs
    if (body.seller_licence?.startsWith("data:")) {
      body.seller_licence = await uploadBase64Image(body.seller_licence, `deal-${id}-seller-licence`) || body.seller_licence;
    }
    if (body.seller_rego_papers?.startsWith("data:")) {
      body.seller_rego_papers = await uploadBase64Image(body.seller_rego_papers, `deal-${id}-seller-rego`) || body.seller_rego_papers;
    }
    if (body.seller_safety_cert?.startsWith("data:")) {
      body.seller_safety_cert = await uploadBase64Image(body.seller_safety_cert, `deal-${id}-seller-safety`) || body.seller_safety_cert;
    }

    await update_seller_deal_section(id, body);
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
            : "Unable to save seller details.",
      },
      { status: 400 },
    );
  }
}
