import { NextResponse } from "next/server";
import { is_admin_request } from "@/lib/admin-auth";
import { save_order_review } from "@/lib/engine";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!is_admin_request(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      dealer_verdict?: string | null;
      ppsr_result?: string | null;
    };
    const review_input = {
      dealer_verdict:
        "dealer_verdict" in body ? (body.dealer_verdict ?? null) : undefined,
      ppsr_result: "ppsr_result" in body ? (body.ppsr_result ?? null) : undefined,
    };
    const order = save_order_review(id, review_input);

    return NextResponse.json({
      ok: true,
      order,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to save review.",
      },
      { status: 400 },
    );
  }
}
