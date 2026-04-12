import { NextResponse } from "next/server";
import { is_admin_request } from "@/lib/admin-auth";
import { get_order_by_id } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!is_admin_request(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const order = await get_order_by_id(id);

  if (!order) {
    return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    order,
  });
}
