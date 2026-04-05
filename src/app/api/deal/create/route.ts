import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BYPASS_DEAL_ROOM_PAYMENT = true;

function is_valid_email(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function resolve_base_url(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) return origin;

  const forwarded_host = request.headers.get("x-forwarded-host");
  const host = forwarded_host || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "http";

  if (host) return `${protocol}://${host}`;
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const customer_email = body.email?.trim() ?? "";

    if (!customer_email || !is_valid_email(customer_email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (BYPASS_DEAL_ROOM_PAYMENT) {
      return NextResponse.json({
        ok: true,
        bypassed_payment: true,
        room_url: `${resolve_base_url(request)}/deal/demo?email=${encodeURIComponent(customer_email)}`,
      });
    }

    return NextResponse.json(
      { ok: false, error: "Deal Room checkout is currently unavailable." },
      { status: 503 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create Deal Room.",
      },
      { status: 500 },
    );
  }
}
