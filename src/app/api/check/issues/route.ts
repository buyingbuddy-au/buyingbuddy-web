import { NextResponse } from "next/server";

export const runtime = "nodejs";

const TIMEOUT_MS = 5000;

const SYSTEM_PROMPT =
  "You are an experienced Australian mechanic. Given a car's make, model, year, and transmission, list exactly 4 common issues or things a buyer should specifically check on this vehicle. Be specific to this exact model — not generic car advice. Each point should be one sentence. Respond with ONLY a JSON array of 4 strings, no other text.";

function buildUserMessage(make: string, model: string, year: number, transmission: string) {
  return `${year} ${make} ${model} ${transmission}`;
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function parseJsonArray(raw: string): string[] {
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("No JSON array found");
  const parsed = JSON.parse(raw.slice(start, end + 1));
  if (!Array.isArray(parsed)) throw new Error("Not an array");
  return parsed
    .map((item: unknown) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 4);
}

// In-memory cache to avoid redundant API calls
const cache = new Map<string, string[]>();

async function tryOpenRouter(make: string, model: string, year: number, transmission: string): Promise<string[] | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const res = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://buyingbuddy.com.au",
      "X-Title": "BuyingBuddy",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      temperature: 0.3,
      max_tokens: 500,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(make, model, year, transmission) },
      ],
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  return parseJsonArray(content);
}

async function tryOpenAI(make: string, model: string, year: number, transmission: string): Promise<string[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const res = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 500,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(make, model, year, transmission) },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  return parseJsonArray(content);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      make?: string;
      model?: string;
      year?: number | string;
      transmission?: string;
    };

    const make = (body.make ?? "").trim();
    const model = (body.model ?? "").trim();
    const year = Number(body.year);
    const transmission = (body.transmission ?? "Automatic").trim();

    if (!make || !model || !year) {
      return NextResponse.json({ ok: false, error: "Make, model, and year required." }, { status: 400 });
    }

    const cacheKey = `${year}:${make.toLowerCase()}:${model.toLowerCase()}:${transmission.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ok: true, issues: cached });
    }

    let issues: string[] | null = null;

    try {
      issues = await tryOpenRouter(make, model, year, transmission);
    } catch { /* fall through */ }

    if (!issues) {
      try {
        issues = await tryOpenAI(make, model, year, transmission);
      } catch { /* fall through */ }
    }

    if (!issues || issues.length === 0) {
      return NextResponse.json({ ok: true, issues: [] });
    }

    cache.set(cacheKey, issues);
    return NextResponse.json({ ok: true, issues });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to fetch known issues." }, { status: 500 });
  }
}
