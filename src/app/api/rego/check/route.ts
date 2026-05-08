import { NextResponse } from "next/server";
import { runQldOfficialRegoCheck } from "@/lib/qld-rego/official";
import { validateQldRego } from "@/lib/qld-rego/normalise";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { rego?: string; state?: string };
    const state = (body.state ?? "QLD").trim().toUpperCase();

    if (state && state !== "QLD") {
      return NextResponse.json(
        {
          ok: false,
          status: "not_qld",
          error: "qld_only",
          userMessage: "This beta checks QLD regos only. We can still help manually if you send us the listing.",
          checkedAt: new Date().toISOString(),
          retryable: false,
        },
        { status: 400 },
      );
    }

    const validation = validateQldRego(body.rego ?? "");
    if (!validation.ok) {
      return NextResponse.json(
        {
          ok: false,
          status: "input_error",
          error: "invalid_input",
          userMessage: validation.error,
          checkedAt: new Date().toISOString(),
          retryable: false,
        },
        { status: 400 },
      );
    }

    const result = await runQldOfficialRegoCheck(validation.rego);
    const statusCode = result.ok
      ? 200
      : result.status === "input_error" || result.status === "not_qld"
        ? 400
        : result.status === "busy"
          ? 429
          : result.status === "timeout"
            ? 504
            : 502;

    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: "error",
        error: error instanceof Error ? error.message : "unknown_error",
        userMessage: "The rego checker had a wobble. Try again or leave your email and we’ll send the result.",
        checkedAt: new Date().toISOString(),
        retryable: true,
      },
      { status: 500 },
    );
  }
}
