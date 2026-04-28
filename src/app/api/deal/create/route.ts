import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { ok: false, error: "Deal Packs must be opened through checkout." },
    { status: 410 },
  );
}
