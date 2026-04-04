import { NextResponse } from "next/server";
import { get_public_deal_by_id } from "@/lib/deals";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const deal = get_public_deal_by_id(id);

  if (!deal) {
    return NextResponse.json(
      { ok: false, error: "Deal Room not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, deal });
}
