import { NextResponse } from "next/server";
import { get_public_deal_by_id, update_seller_deal_section } from "@/lib/deals";
import type { DealSellerUpdateInput } from "@/lib/types";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as DealSellerUpdateInput;
    update_seller_deal_section(id, body);
    const deal = get_public_deal_by_id(id);

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
