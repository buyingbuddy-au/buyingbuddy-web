type VehicleBriefInput = {
  make: string;
  model: string;
  year: number;
  rego?: string;
  asking_price?: number;
};

export type VehicleReport = {
  known_issues: string[];
  what_to_check: string[];
  fair_price_range: string;
  red_flags: string[];
  verdict: string;
  source: "claude" | "openai" | "gemini" | "fallback";
};

const reportCache = new Map<string, VehicleReport>();

const MAKE_FALLBACKS: Record<string, Partial<VehicleReport>> = {
  toyota: {
    known_issues: [
      "Usually reliable, but neglect shows up fast in cooling systems and dirty service history.",
      "CVT or auto shudder can show up if fluid changes were ignored.",
      "Higher-km examples often wear suspension bushes and engine mounts before they look rough.",
    ],
    what_to_check: [
      "Cold start, idle quality, and any rattle in the first 30 seconds.",
      "Transmission shift quality and whether the service book looks real, not half-complete.",
      "Signs of previous front-end damage, cheap tyres, or overdue suspension work.",
    ],
    red_flags: [
      "Overheating history or coolant staining.",
      "Jerky CVT/auto behaviour.",
      "Patchy service history on a car marketed as 'Toyota reliable'.",
    ],
    verdict: "Usually a safe buy if the history is clean, but don't let the badge make you lazy.",
  },
  hyundai: {
    known_issues: [
      "Some engines are sensitive to missed servicing and poor-quality oil.",
      "Timing chain noise or top-end rattle can be a warning sign on neglected cars.",
      "Paint, trim, and interior wear can age quicker than the odometer suggests.",
    ],
    what_to_check: [
      "Cold-start rattle, smoke, and any warning lights after a long test drive.",
      "Gearbox behaviour in traffic and under load.",
      "Full service history with proof, not just stamps.",
    ],
    red_flags: [
      "Engine ticking or chain noise.",
      "Heavy oil consumption claims like 'needs top-ups'.",
      "Cheap repairs after a front-end hit.",
    ],
    verdict: "Can be strong value, but condition matters more than price on Hyundai stock.",
  },
  mazda: {
    known_issues: [
      "Suspension and front-end wear can creep in on rough-road cars.",
      "Some petrol engines can show coil, sensor, or carbon build-up issues with age.",
      "Interior trim and infotainment niggles are common on higher-km examples.",
    ],
    what_to_check: [
      "Steering feel, front suspension knocks, and uneven tyre wear.",
      "Engine smoothness at idle and under acceleration.",
      "Every button, screen, and reverse camera function.",
    ],
    red_flags: [
      "Knocking front end.",
      "Hesitation under throttle.",
      "Evidence of poor crash repair around the nose or quarters.",
    ],
    verdict: "Usually a sensible private buy if it drives tight and the service history stacks up.",
  },
  ford: {
    known_issues: [
      "Automatic gearbox behaviour can be a weak point depending on model and maintenance.",
      "Turbo and cooling issues show up on neglected examples.",
      "Electrical faults and warning lights are more common than buyers expect.",
    ],
    what_to_check: [
      "Shift quality from cold and hot.",
      "Cooling fans, coolant level, and any overheating history.",
      "Scan for warning lights and test every electrical feature.",
    ],
    red_flags: [
      "Harsh or delayed shifts.",
      "Cooling system leaks.",
      "Seller saying 'just a sensor'.",
    ],
    verdict: "Can be good buying, but walk fast if the transmission or cooling story feels fuzzy.",
  },
  volkswagen: {
    known_issues: [
      "DSG and turbo-related issues can get expensive fast once maintenance slips.",
      "Cooling system leaks and water pump problems are common talking points.",
      "Electrical gremlins and warning lights are not rare on ageing cars.",
    ],
    what_to_check: [
      "Gearbox response in stop-start driving.",
      "Cold start, coolant smell, and any misfire under load.",
      "Documented servicing by someone who actually knows VWs.",
    ],
    red_flags: [
      "Jerky DSG behaviour.",
      "Multiple warning lights.",
      "No evidence of proper specialist servicing.",
    ],
    verdict: "Nice when sorted, but not the car to buy on hope and a clean detail alone.",
  },
};

function cacheKey(input: VehicleBriefInput) {
  return `${input.year}:${input.make.trim().toLowerCase()}:${input.model.trim().toLowerCase()}`;
}

function sanitiseArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 5);
  return cleaned.length > 0 ? cleaned : fallback;
}

function parseJsonObject(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response was not valid JSON.");
  }
  return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
}

const EXTERNAL_API_TIMEOUT_MS = 3000;

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = EXTERNAL_API_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function buildPrompt(input: VehicleBriefInput) {
  const askingPrice = input.asking_price ? ` Asking price: AUD ${input.asking_price}.` : "";
  const rego = input.rego ? ` Rego supplied: ${input.rego}.` : "";

  return [
    `You are an experienced Australian used car dealer with 15+ years in the QLD market.`,
    `Give a concise buyer brief for a ${input.year} ${input.make} ${input.model}.${rego}${askingPrice}`,
    `Reply as JSON only with keys: known_issues, what_to_check, fair_price_range, red_flags, verdict.`,
    `Rules: known_issues 3-5 short strings, what_to_check exactly 3 short strings, red_flags 3-5 short strings, verdict one sentence, under 300 words total, practical and direct, be honest if uncertain on pricing.`
  ].join(" ");
}

async function generateWithClaude(input: VehicleBriefInput): Promise<VehicleReport | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: buildPrompt(input),
        },
      ],
      system: "You output concise, valid JSON only. No markdown, no code fences, just the raw JSON object.",
    }),
  }, 8000);

  if (!response.ok) throw new Error(`Claude request failed: ${response.status}`);

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const content = data.content?.find((b) => b.type === "text")?.text;
  if (!content) throw new Error("Claude returned an empty response.");

  const parsed = parseJsonObject(content);
  return {
    known_issues: sanitiseArray(parsed.known_issues, []),
    what_to_check: sanitiseArray(parsed.what_to_check, []),
    fair_price_range:
      typeof parsed.fair_price_range === "string" && parsed.fair_price_range.trim()
        ? parsed.fair_price_range.trim()
        : "Price varies by condition; compare several recent QLD private sales before you jump.",
    red_flags: sanitiseArray(parsed.red_flags, []),
    verdict:
      typeof parsed.verdict === "string" && parsed.verdict.trim()
        ? parsed.verdict.trim()
        : `Worth considering if the ${input.make} ${input.model} has clean history, drives properly, and the numbers make sense.`,
    source: "claude",
  };
}

async function generateWithOpenAI(input: VehicleBriefInput): Promise<VehicleReport | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 350,
      messages: [
        {
          role: "system",
          content: "You output concise, valid JSON only.",
        },
        {
          role: "user",
          content: buildPrompt(input),
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`);

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned an empty response.");

  const parsed = parseJsonObject(content);
  return {
    known_issues: sanitiseArray(parsed.known_issues, []),
    what_to_check: sanitiseArray(parsed.what_to_check, []),
    fair_price_range:
      typeof parsed.fair_price_range === "string" && parsed.fair_price_range.trim()
        ? parsed.fair_price_range.trim()
        : "Price varies by condition; compare several recent QLD private sales before you jump.",
    red_flags: sanitiseArray(parsed.red_flags, []),
    verdict:
      typeof parsed.verdict === "string" && parsed.verdict.trim()
        ? parsed.verdict.trim()
        : `Worth considering if the ${input.make} ${input.model} has clean history, drives properly, and the numbers make sense.`,
    source: "openai",
  };
}

async function generateWithGemini(input: VehicleBriefInput): Promise<VehicleReport | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return null;

  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 350,
          responseMimeType: "application/json",
        },
        contents: [{ parts: [{ text: buildPrompt(input) }] }],
      }),
    },
  );

  if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`);

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("Gemini returned an empty response.");

  const parsed = parseJsonObject(content);
  return {
    known_issues: sanitiseArray(parsed.known_issues, []),
    what_to_check: sanitiseArray(parsed.what_to_check, []),
    fair_price_range:
      typeof parsed.fair_price_range === "string" && parsed.fair_price_range.trim()
        ? parsed.fair_price_range.trim()
        : "Price varies by condition; compare several recent QLD private sales before you jump.",
    red_flags: sanitiseArray(parsed.red_flags, []),
    verdict:
      typeof parsed.verdict === "string" && parsed.verdict.trim()
        ? parsed.verdict.trim()
        : `Worth considering if the ${input.make} ${input.model} has clean history, drives properly, and the numbers make sense.`,
    source: "gemini",
  };
}

function buildFallbackReport(input: VehicleBriefInput): VehicleReport {
  const makeKey = input.make.trim().toLowerCase();
  const fallback = MAKE_FALLBACKS[makeKey];
  const fairPriceBase = input.asking_price
    ? `Seller wants about $${input.asking_price.toLocaleString("en-AU")}. Compare it against recent QLD private sales and similar-km stock; clean history and kilometres usually swing the real number hard.`
    : "Price depends heavily on kilometres, trim, service history, and condition. Check at least 3 recent QLD private sales before treating any ask as fair.";

  return {
    known_issues:
      fallback?.known_issues ?? [
        `${input.make} ${input.model} buyers should chase proof of servicing, not just a clean ad and a polished bonnet.`,
        "Neglected cooling, transmission, and suspension maintenance are common reasons a cheap car becomes an expensive one.",
        "Electrical faults and warning lights are often cleared for sale, then come straight back after handover.",
      ],
    what_to_check:
      fallback?.what_to_check ?? [
        "Cold start, idle quality, and whether it smokes, rattles, or shows warning lights.",
        "Gearbox behaviour on a proper test drive, not just around the block.",
        "Full service history, tyre condition, and signs of crash repair or paint mismatch.",
      ],
    fair_price_range: fallback?.fair_price_range ?? fairPriceBase,
    red_flags:
      fallback?.red_flags ?? [
        "No service history or vague answers about maintenance.",
        "Fresh detail hiding worn tyres, oil leaks, or accident repair.",
        "Seller pushing for deposit before inspection, PPSR, or mechanic check.",
      ],
    verdict:
      fallback?.verdict ?? `Could be worth chasing, but only if the ${input.year} ${input.make} ${input.model} has clean history, no nasty noises, and the price stacks up.`,
    source: "fallback",
  };
}

function normaliseReport(input: VehicleBriefInput, report: VehicleReport): VehicleReport {
  return {
    known_issues: sanitiseArray(report.known_issues, buildFallbackReport(input).known_issues),
    what_to_check: sanitiseArray(report.what_to_check, buildFallbackReport(input).what_to_check).slice(0, 3),
    fair_price_range: report.fair_price_range?.trim() || buildFallbackReport(input).fair_price_range,
    red_flags: sanitiseArray(report.red_flags, buildFallbackReport(input).red_flags),
    verdict: report.verdict?.trim() || buildFallbackReport(input).verdict,
    source: report.source,
  };
}

async function generateWithOpenRouter(input: VehicleBriefInput): Promise<VehicleReport | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const response = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://buyingbuddy.com.au",
      "X-Title": "BuyingBuddy",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      temperature: 0.4,
      max_tokens: 350,
      messages: [
        {
          role: "system",
          content: "You output concise, valid JSON only.",
        },
        {
          role: "user",
          content: buildPrompt(input),
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`OpenRouter request failed: ${response.status}`);

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned an empty response.");

  const parsed = parseJsonObject(content);
  return {
    known_issues: sanitiseArray(parsed.known_issues, []),
    what_to_check: sanitiseArray(parsed.what_to_check, []),
    fair_price_range:
      typeof parsed.fair_price_range === "string" && parsed.fair_price_range.trim()
        ? parsed.fair_price_range.trim()
        : "Price varies by condition; compare several recent QLD private sales before you jump.",
    red_flags: sanitiseArray(parsed.red_flags, []),
    verdict:
      typeof parsed.verdict === "string" && parsed.verdict.trim()
        ? parsed.verdict.trim()
        : `Worth considering if the ${input.make} ${input.model} has clean history, drives properly, and the numbers make sense.`,
    source: "openai" as const,
  };
}

export async function generateVehicleReport(input: VehicleBriefInput): Promise<VehicleReport> {
  const key = cacheKey(input);
  const cached = reportCache.get(key);
  if (cached) return cached;

  let report: VehicleReport | null = null;

  // Try Claude Sonnet first, then OpenRouter, OpenAI, Gemini, then fallback
  const providers = [generateWithClaude, generateWithOpenRouter, generateWithOpenAI, generateWithGemini];
  for (const provider of providers) {
    if (report) break;
    try {
      report = await provider(input);
    } catch {
      report = null;
    }
  }

  const finalReport = normaliseReport(input, report ?? buildFallbackReport(input));
  reportCache.set(key, finalReport);
  return finalReport;
}
