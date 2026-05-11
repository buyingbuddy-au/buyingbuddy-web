import { NextResponse } from "next/server";
import { runQldOfficialRegoCheck } from "@/lib/qld-rego/official";
import { validateQldRego } from "@/lib/qld-rego/normalise";
import type { QldRegoCheckFailure } from "@/lib/qld-rego/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_TO_HTTP = {
  input_error: 400,
  not_qld: 400,
  no_result: 404,
  busy: 429,
  timeout: 504,
  official_unavailable: 502,
  parse_error: 502,
  blocked: 502,
  error: 502,
} satisfies Record<QldRegoCheckFailure["status"], number>;

type RegoCheckRequest = {
  rego: string;
  state: string;
};

type RegoCheckParseResult =
  | { ok: true; body: RegoCheckRequest }
  | { ok: false; error: string; userMessage: string };

function inputErrorResponse(error: string, userMessage: string) {
  return NextResponse.json(
    {
      ok: false,
      status: "input_error",
      error,
      userMessage,
      checkedAt: new Date().toISOString(),
      retryable: false,
    },
    { status: 400 },
  );
}

async function parseRegoCheckRequest(request: Request): Promise<RegoCheckParseResult> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      error: "invalid_json",
      userMessage: "We couldn't read that rego check request. Try again.",
    };
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      error: "invalid_body",
      userMessage: "Send the rego as a JSON object.",
    };
  }

  const record = body as Record<string, unknown>;
  if (typeof record.rego !== "string") {
    return {
      ok: false,
      error: "invalid_rego",
      userMessage: "Pop the QLD rego in first.",
    };
  }

  const state = record.state ?? "QLD";
  if (typeof state !== "string") {
    return {
      ok: false,
      error: "invalid_state",
      userMessage: "This beta checks QLD regos only. Choose QLD or leave the state blank.",
    };
  }

  return { ok: true, body: { rego: record.rego, state } };
}

export async function POST(request: Request) {
  try {
    const parsed = await parseRegoCheckRequest(request);
    if (parsed.ok === false) {
      return inputErrorResponse(parsed.error, parsed.userMessage);
    }

    const state = parsed.body.state.trim().toUpperCase();

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

    const validation = validateQldRego(parsed.body.rego);
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
    const statusCode = result.ok ? 200 : STATUS_TO_HTTP[result.status];

    const headers = !result.ok && result.status === "busy" && result.rateLimitScope
      ? { "x-rego-rate-limit-scope": result.rateLimitScope }
      : undefined;

    return NextResponse.json(result, { status: statusCode, headers });
  } catch (error) {
    console.error("[rego-check] unhandled", error);
    return NextResponse.json(
      {
        ok: false,
        status: "error",
        error: "route_unhandled",
        userMessage: "The rego checker had a technical snag. Leave your email and we’ll send the result.",
        checkedAt: new Date().toISOString(),
        retryable: false,
      },
      { status: 502 },
    );
  }
}
