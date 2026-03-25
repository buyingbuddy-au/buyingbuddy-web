import { NextResponse } from "next/server";
import { is_admin_request } from "@/lib/admin-auth";
import { get_dashboard_data } from "@/lib/engine";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!is_admin_request(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    ...get_dashboard_data(),
  });
}
