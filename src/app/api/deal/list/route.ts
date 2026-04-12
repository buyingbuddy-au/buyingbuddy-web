import { NextResponse } from "next/server";
import { list_deals_for_email } from "@/lib/deals";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim() ?? "";

    if (!email) {
      return NextResponse.json({ ok: true, deals: [] });
    }

    const deals = await list_deals_for_email(email);
    return NextResponse.json({ ok: true, deals });
  } catch {
    return NextResponse.json({ ok: true, deals: [] });
  }
}
