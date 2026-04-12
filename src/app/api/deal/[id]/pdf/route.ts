import { NextResponse } from "next/server";
import { get_deal_by_id } from "@/lib/db";
import { generate_deal_summary_pdf } from "@/lib/deal-pdf";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const deal = await get_deal_by_id(id);

  if (!deal) {
    return NextResponse.json({ error: "Deal not found." }, { status: 404 });
  }

  const { buffer, filename } = await generate_deal_summary_pdf(deal);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
