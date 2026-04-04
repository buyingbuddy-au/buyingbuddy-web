import { NextResponse } from "next/server";

// Simple in-memory store for shared results (Vercel serverless functions
// don't share memory, so this only works within a single function invocation.
// For production, this should be in the DB. For tonight's sprint, use the
// same SQLite DB file as everything else.)

// For now, we generate a short hash of the result data and store it
// as a query parameter. The shared page can reconstruct the result
// from the API that generated it.

// This is a quick-and-dirty approach that works without DB changes.

interface CreateShareRequest {
  type: "free_check" | "ppsr" | "inspect";
  vehicle_heading?: string;
  verdict?: string;
  risk_level?: "low" | "medium" | "high";
  summary_points?: string[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateShareRequest;

    if (!body.type || !body.verdict) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: type and verdict." },
        { status: 400 },
      );
    }

    // Generate a short unique ID
    const id = generateShareId();

    const result = {
      id,
      type: body.type,
      created_at: new Date().toISOString(),
      vehicle_heading: body.vehicle_heading ?? "Used car",
      verdict: body.verdict,
      risk_level: body.risk_level ?? "medium",
      summary_points: body.summary_points ?? [],
      upsell_message:
        body.type === "free_check"
          ? "Want to check if this car has finance owing or has been written off?"
          : body.type === "ppsr"
            ? "Now run the inspection tool to check the car in person."
            : "Get the full PPSR report and QLD contract pack.",
      upsell_href:
        body.type === "free_check"
          ? "/ppsr"
          : body.type === "ppsr"
            ? "/inspect"
            : "/contract-pack",
      upsell_cta:
        body.type === "free_check"
          ? "Run PPSR Check — $4.95"
          : body.type === "ppsr"
            ? "Open Inspect Tool — Free"
            : "Get Contract Pack — $9.95",
    };

    // For now, encode the result as base64 in the URL.
    // The shared page decodes it. No DB needed.
    // In production, store in DB and query by ID.
    // Encode-safe base64
    const encoded = Buffer.from(JSON.stringify(result)).toString("base64url");

    return NextResponse.json({
      ok: true,
      id: encoded,
      share_url: `/shared/${encoded}`,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Failed to create shared result." },
      { status: 500 },
    );
  }
}

function generateShareId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
