import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are BuyingBuddy, a friendly AI assistant built by a licensed QLD car dealer with 15+ years experience. Help buyers with: QLD transfer rules, negotiation tips, red flag identification, used car buying advice. Keep answers concise and practical. You are not a lawyer or financial advisor.`;

const QUICK_REPLY_CONTEXT: Record<string, string> = {
  "Is this car overpriced?": "The user wants help assessing whether a used car is overpriced. Give practical market-checking tips specific to Australia (Carsales, RedBook, comparing listings) and what signals to look for.",
  "What should I look for?": "The user wants a quick inspection checklist for a used car. Cover the most important visual and mechanical checks a buyer can do themselves.",
  "How do I negotiate?": "The user wants negotiation tips for buying a used car privately. Give practical, Australian-specific advice on making offers and handling seller pushback.",
  "What are the red flags?": "The user wants to know common red flags when buying a used car privately in Australia. Cover listing red flags, seller behaviour, and paperwork issues.",
  "QLD transfer rules": "The user wants to know about Queensland-specific vehicle registration transfer rules. Cover timelines, costs, forms, and common mistakes.",
  "Help with paperwork": "The user needs help with the paperwork side of a private car sale in Queensland. Cover contracts, receipts, transfer forms, and what to document.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage: string = body.message;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json(
        { ok: false, error: "Please include a message to ask Buddy." },
        { status: 400 }
      );
    }

    // Determine context for quick-reply shortcuts
    const contextHint = QUICK_REPLY_CONTEXT[userMessage.trim()] ?? "";

    const userContent = contextHint
      ? `${userMessage}\n\n(Context for assistant: ${contextHint})`
      : userMessage;

    // Try OpenRouter first, then OpenAI, then Google AI, then canned fallback
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const googleKey = process.env.GOOGLE_AI_API_KEY;

    let reply: string;

    if (openrouterKey) {
      reply = await callOpenRouter(openrouterKey, userContent);
    } else if (openaiKey) {
      reply = await callOpenAI(openaiKey, userContent);
    } else if (googleKey) {
      reply = await callGoogleAI(googleKey, userContent);
    } else {
      // Fallback: return a helpful canned response so the feature isn't dead
      reply = getCannedResponse(userMessage);
    }

    return NextResponse.json({ ok: true, reply });
  } catch (err) {
    console.error("[Buddy API] Error:", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Buddy is having a brain fade right now. Try again in a sec, or check our Free Check tool for instant listing analysis.",
      },
      { status: 500 }
    );
  }
}

async function callOpenRouter(apiKey: string, userContent: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://buyingbuddy.com.au",
      "X-Title": "BuyingBuddy",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[Buddy API] OpenRouter error:", res.status, text);
    throw new Error(`OpenRouter request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "I couldn't come up with a response. Try rephrasing your question.";
}

async function callOpenAI(apiKey: string, userContent: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[Buddy API] OpenAI error:", res.status, text);
    throw new Error(`OpenAI request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "I couldn't come up with a response. Try rephrasing your question.";
}

async function callGoogleAI(apiKey: string, userContent: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${SYSTEM_PROMPT}\n\nUser question: ${userContent}` }],
          },
        ],
        generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("[Buddy API] Google AI error:", res.status, text);
    throw new Error(`Google AI request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "I couldn't come up with a response. Try rephrasing your question.";
}

/** Fallback responses when no AI API key is configured */
function getCannedResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("overpriced") || lower.includes("price") || lower.includes("worth")) {
    return "Quick price check: Look up the car on Carsales and filter by same make/model/year/kms. Compare 5-10 listings and you'll see the real market range. If this one sits way below, ask why — could be a red flag. If it's above, you've got negotiation room. RedBook gives a rough guide but real listings are more useful.";
  }

  if (lower.includes("look for") || lower.includes("inspect") || lower.includes("check")) {
    return "Top inspection checks: 1) Panel gaps & paint mismatch (crash repair). 2) Fluid leaks under the car. 3) All electrics work (windows, AC, lights). 4) Cold start — listen for knocks/ticks. 5) Tyre wear pattern (alignment issues). 6) Service logbook history. 7) Check the oil cap for white residue (head gasket). Take your time — never rush an inspection.";
  }

  if (lower.includes("negotiate") || lower.includes("offer") || lower.includes("haggle")) {
    return "Negotiation basics: Always start lower than what you'd pay — but not insulting. Point to specific comparable listings as your evidence. Mention any issues you found at inspection. Be ready to walk away — that's your strongest card. Never show excitement about the car. And always have cash or proof of funds ready so you can close fast if they accept.";
  }

  if (lower.includes("red flag") || lower.includes("scam") || lower.includes("dodgy")) {
    return "Big red flags: Seller won't let you inspect at their home. No logbook or service history. Price way below market. Won't do a PPSR check. Pressure to pay a deposit before you've seen the car. VIN doesn't match rego papers. Fresh paint on an old car. Multiple owners in a short time. Trust your gut — if it feels off, walk away.";
  }

  if (lower.includes("qld") || lower.includes("transfer") || lower.includes("rego")) {
    return "QLD transfer rules: You have 14 days to transfer registration after purchase. Both buyer and seller sign the transfer form (back of rego certificate). You'll need a current safety certificate (roadworthy) from the seller. Transfer duty applies — check the TMR website for current rates. Don't forget to update your CTP insurance.";
  }

  if (lower.includes("paperwork") || lower.includes("contract") || lower.includes("receipt")) {
    return "Paperwork essentials: Get a written receipt with both names, car details, price, and date. Use a sale contract (our QLD contract pack covers this). Make sure the seller signs the transfer form. Keep copies of everything. Get the safety certificate and PPSR clearance before you hand over money. If you're in QLD, our contract pack has everything you need for $9.95.";
  }

  return "Good question! For the most accurate answer, try our Free Check tool — paste a listing URL and get an instant dealer-style read on the car. For QLD-specific rules, PPSR checks, or contract help, check out our paid tools starting at $4.95. If you need something specific, rephrase and ask me again!";
}
