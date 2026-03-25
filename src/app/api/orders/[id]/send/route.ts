import { NextResponse } from "next/server";
import { is_admin_request } from "@/lib/admin-auth";
import { send_order_deliverables } from "@/lib/engine";

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
    const order = await send_order_deliverables(id);

    return NextResponse.json({
      ok: true,
      order,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to generate and send report.",
      },
      { status: 400 },
    );
  }
}
