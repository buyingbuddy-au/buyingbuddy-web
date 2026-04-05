import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Buddy — the AI inside BuyingBuddy, built by Jordan Lansbury, a licensed QLD car dealer with 15+ years of wholesale and retail experience across Lexus, BMW, and Audi.

You speak like a sharp, direct Australian dealer. No fluff. No corporate speak. No "great question!" energy. If a car sounds like a lemon, say so. If someone's about to overpay, tell them straight.

You know all the BuyingBuddy products:
- Free Check (paste a listing URL or describe the car, get a dealer-style read)
- PPSR Report ($4.95) — official stolen/finance/write-off check, government data
- Dealer Review ($14.95) — Jordan personally reviews the listing
- Full Pack ($34.95) — Dealer review + QLD contract + negotiation guide
- Deal Room ($39.95) — shared buyer/seller workspace with timestamped Deal Record PDF

QLD rules you know: 14-day transfer window, safety cert required for private sale, CTP insurance on transfer, PPSR before any money changes hands.

Rules:
- Keep answers under 150 words unless the question genuinely needs more
- Never give legal or financial advice — redirect to a professional if needed
- If someone describes a listing that sounds dangerous, tell them to walk
- Recommend PPSR when finance, history, or title is uncertain
- Recommend the Deal Room when a deal is closing and needs documentation
- After answering, suggest a natural next step — either another question or a relevant BuyingBuddy tool
- When recommending a tool, name it and briefly say what it does — don't just say "check out our tools"
- Keep the tone helpful and Australian — like a mate who knows cars, not a chatbot`;

type ChatMessage = { role: "user" | "assistant"; content: string };

const QUICK_REPLY_CONTEXT: Record<string, string> = {
  "Is this car overpriced?": "The user wants help assessing whether a used car is overpriced. Give practical market-checking tips specific to Australia (Carsales, RedBook, comparing listings) and what signals to look for.",
  "What should I look for?": "The user wants a quick inspection checklist for a used car. Cover the most important visual and mechanical checks a buyer can do themselves at the car.",
  "How do I negotiate?": "The user wants negotiation tips for buying a used car privately. Give practical, Australian-specific advice on making offers and handling seller pushback.",
  "What are the red flags?": "The user wants to know common red flags when buying a used car privately in Australia. Cover listing language, seller behaviour, and paperwork issues.",
  "QLD transfer rules": "The user wants to know about Queensland-specific vehicle registration transfer rules. Cover timelines, costs, forms, and common mistakes.",
  "Do I need a PPSR check?": "The user is asking if they need a PPSR check. Explain what PPSR catches (finance owing, stolen, write-off, encumbered) and when it is essential — always before private sale money changes hands. Mention they can run one on BuyingBuddy for $4.95.",
  "Help with paperwork": "The user wants to know what paperwork is needed for a QLD private car sale. Cover: signed transfer form (back of rego cert), safety certificate, PPSR check, CTP insurance, and the 14-day transfer window. Mention the Full Pack ($34.95) includes a QLD contract template.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage: string = body.message;
    const history: ChatMessage[] = Array.isArray(body.history) ? body.history.slice(-8) : [];

    if (!userMessage || typeof userMessage !== "string" || userMessage.trim().length === 0) {
      return NextResponse.json({ ok: false, error: "Please include a message." }, { status: 400 });
    }

    const contextHint = QUICK_REPLY_CONTEXT[userMessage.trim()] ?? "";
    const userContent = contextHint
      ? `${userMessage}\n\n(Context: ${contextHint})`
      : userMessage;

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const googleKey = process.env.GOOGLE_AI_API_KEY;

    let reply: string | null = null;

    // Try providers in order, cascade on failure
    if (openrouterKey && !reply) {
      try {
        reply = await callOpenRouter(openrouterKey, userContent, history);
      } catch (err) {
        console.warn("[Buddy] OpenRouter failed, cascading:", err);
      }
    }

    if (openaiKey && !reply) {
      try {
        reply = await callOpenAI(openaiKey, userContent, history);
      } catch (err) {
        console.warn("[Buddy] OpenAI failed, cascading:", err);
      }
    }

    if (googleKey && !reply) {
      try {
        reply = await callGoogleAI(googleKey, userContent, history);
      } catch (err) {
        console.warn("[Buddy] Google AI failed, falling back to canned:", err);
      }
    }

    if (!reply) {
      reply = getCannedResponse(userMessage);
    }

    return NextResponse.json({ ok: true, reply });
  } catch (err) {
    console.error("[Buddy API] Unhandled error:", err);
    return NextResponse.json(
      { ok: false, error: "Buddy hit a snag. Try again in a sec, or use the Free Check tool for instant listing analysis." },
      { status: 500 }
    );
  }
}

async function callOpenRouter(apiKey: string, userContent: string, history: ChatMessage[]): Promise<string> {
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
        ...history,
        { role: "user", content: userContent },
      ],
      max_tokens: 400,
      temperature: 0.6,
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned empty content");
  return content;
}

async function callOpenAI(apiKey: string, userContent: string, history: ChatMessage[]): Promise<string> {
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
        ...history,
        { role: "user", content: userContent },
      ],
      max_tokens: 400,
      temperature: 0.6,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty content");
  return content;
}

async function callGoogleAI(apiKey: string, userContent: string, history: ChatMessage[]): Promise<string> {
  const historyContents = history.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          ...historyContents,
          { role: "user", parts: [{ text: userContent }] },
        ],
        generationConfig: { maxOutputTokens: 400, temperature: 0.6 },
      }),
    }
  );

  if (!res.ok) throw new Error(`Google AI ${res.status}`);
  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("Google AI returned empty content");
  return content;
}

function getCannedResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("overpriced") || lower.includes("price") || lower.includes("worth")) {
    return "Pull up Carsales and filter for same make/model/year/kms. Compare 5–10 listings. That's your real market range. If this one is below market, ask why. If it's above, you've got negotiation room. RedBook gives a rough guide but live listings are more accurate.";
  }

  if (lower.includes("look for") || lower.includes("inspect") || lower.includes("check")) {
    return "Top 5 at the car: 1) Panel gaps for crash repair evidence. 2) Oil cap — white residue means head gasket trouble. 3) All electrics — windows, AC, locks. 4) Cold start — knocks or ticks are expensive. 5) Service logbook — no stamps, walk away.";
  }

  if (lower.includes("negotiate") || lower.includes("offer") || lower.includes("haggle")) {
    return "Start lower than you'd actually pay — not insulting, but firm. Cite specific comparable listings. Mention any issues from the inspection. Never show excitement. Always be willing to walk — it's your strongest card.";
  }

  if (lower.includes("red flag") || lower.includes("scam") || lower.includes("dodgy")) {
    return "Walk away if: seller won't meet at their home, no logbook, price is weirdly cheap, they refuse PPSR, pressure to pay a deposit before inspection. Fresh paint on an old car is always suspicious. Trust your gut.";
  }

  if (lower.includes("ppsr")) {
    return "PPSR is $4.95 and checks whether the car has finance owing, has been reported stolen, or is a write-off. Run it on every private sale before any money changes hands. It's government data — not a third-party database. Available right here on BuyingBuddy.";
  }

  if (lower.includes("qld") || lower.includes("transfer") || lower.includes("rego")) {
    return "QLD: 14 days to transfer after purchase. Both buyer and seller sign the transfer form on the back of the rego cert. Seller must provide a current safety certificate. Transfer duty applies — check TMR for rates. Update your CTP insurance.";
  }

  return "Good question — I’m best with used-car buying stuff: pricing, inspections, red flags, QLD rego rules, and negotiating. Try asking one of those, or paste a listing URL into the Free Check for an instant dealer-style read.";
}
