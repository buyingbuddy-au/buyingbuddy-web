import type { PPSRExtractedData, PPSRVerdict } from "@/lib/types";

const OPENAI_MODEL = process.env.OPENAI_PPSR_MODEL?.trim() || "gpt-4o-mini";
const GEMINI_MODEL = process.env.GOOGLE_AI_PPSR_MODEL?.trim() || "gemini-1.5-flash";
const REQUEST_TIMEOUT_MS = 45_000;

const EXTRACTION_SYSTEM_PROMPT = `You are a PPSR (Personal Property Securities Register) data extraction specialist for the Australian used car market.
Extract structured data from raw PPSR certificate text and return ONLY valid JSON - no markdown, no explanation, just the JSON object.`;

const NEGATIVE_FINANCE_PATTERNS = [
  /there is no security interest or other registration kind registered on the ppsr/i,
  /finance\s*\/\s*security interests\s*:\s*none found/i,
  /no current security interests? (?:are|is) registered/i,
];

const POSITIVE_FINANCE_PATTERNS = [
  /registration kind\s*:\s*security interest/i,
  /finance\s*\/\s*security interests\s*:\s*security interest registered/i,
  /a security interest is registered against this vehicle/i,
  /\bencumbrance\b/i,
  /\blien\b/i,
];

const STOLEN_CLEAR_PATTERNS = [
  /stolen vehicle check\s*:\s*not reported stolen/i,
  /not recorded as stolen/i,
  /has not been reported as stolen/i,
  /no stolen vehicle record(?:s)? found/i,
  /no stolen notification(?:s)? recorded/i,
];

const WRITE_OFF_CLEAR_PATTERNS = [
  /write-?off history\s*:\s*no write-?off recorded/i,
  /not recorded as written off/i,
  /no write-?off or total loss record found/i,
  /no written-?off vehicle record(?:s)? found/i,
  /no nevdis written-?off notification(?:s)? recorded/i,
];

const STOLEN_HIT_PATTERNS = [
  /\breported stolen\b/i,
  /\bstolen notification\b/i,
  /\bdate stolen\b/i,
  /\bpolice reference\b/i,
];

const WRITE_OFF_HIT_PATTERNS = [
  /repairable write-?off/i,
  /statutory write-?off/i,
  /\bwrite-?off record(?:ed)?\b/i,
  /\bwritten-?off vehicle\b/i,
];

const NO_DATA_LINE_PATTERN =
  /(?:^|:\s*)(?:no data recorded|not provided|n\/a|null|none found|not recorded as stolen|not reported stolen|no stolen vehicle record(?:s)? found|no stolen notification(?:s)? recorded|not recorded as written off|no write-?off recorded|no write-?off or total loss record found|no written-?off vehicle record(?:s)? found|no nevdis written-?off notification(?:s)? recorded)\s*$/i;

const REGISTRATION_STATUS_RULES: Array<{ pattern: RegExp; status: string }> = [
  { pattern: /\bEXPIRED\b/i, status: "EXPIRED" },
  {
    pattern: /\b(?:NOT\s+CURRENTLY\s+REGISTERED|UNREGISTERED|NOT\s+REGISTERED|DE-?REGISTERED)\b/i,
    status: "UNREGISTERED",
  },
  {
    pattern: /\b(?:CURRENTLY\s+REGISTERED|REGISTERED)\b/i,
    status: "REGISTERED",
  },
  { pattern: /\bNOT\s+RECORDED\b/i, status: "NOT RECORDED" },
];

const SECTION_STOP_MARKERS = [
  "---",
  "SEARCH RESULTS SUMMARY",
  "VEHICLE DETAILS",
  "PPSR Registration Details",
  "Additional Motor Vehicle Details",
  "NEVDIS Written-off Vehicle Notification",
  "NEVDIS Stolen Vehicle Notification",
  "Stolen Vehicle Check",
  "Write-Off History",
  "Registration Status",
  "This certificate confirms",
  "IMPORTANT:",
  "Privacy and Terms and Conditions",
  "End of search result",
];

function build_extraction_prompt(raw_text: string): string {
  return `Extract all relevant fields from the following PPSR certificate text. Return ONLY a JSON object with these exact fields:

{
  "vin": string or null,
  "rego": string or null,
  "make": string or null,
  "model": string or null,
  "year": number or null,
  "finance_owing": boolean (true if any security interest / finance is registered),
  "finance_details": string or null (lender name, loan type, registration number, end date if available),
  "stolen": boolean (true if reported stolen),
  "stolen_details": string or null,
  "writeoff": boolean (true if any write-off record exists),
  "writeoff_details": string or null (write-off type, date, state, reason if available),
  "registration_status": string or null ("REGISTERED", "EXPIRED", "UNREGISTERED", "NOT RECORDED", or exact text from certificate),
  "registration_expiry": string or null (expiry date as text),
  "verdict": "CLEAR" | "CAUTION" | "ALERT" (CLEAR = no issues; CAUTION = repairable write-off or expired/unregistered rego; ALERT = finance owing, statutory write-off, or stolen),
  "summary": string (1-2 sentence plain-English summary of findings),
  "what_this_means": string (2-3 sentences explaining what the result means for a private buyer in Australia),
  "what_to_do_next": string (2-3 actionable sentences - what the buyer should do before purchasing)
}

Rules:
- Use the exact boolean meaning above, especially for negative phrases like "Not recorded as stolen" and "There is no security interest..."
- finance_owing = true if ANY security interest is registered, even if described as a lien or encumbrance
- verdict = "ALERT" if finance_owing is true, stolen is true, or writeoff is true and the record is statutory or unspecified
- verdict = "CAUTION" if writeoff is true and the record is repairable, or if registration is expired/unregistered
- verdict = "CLEAR" only if finance_owing = false, stolen = false, writeoff = false, and registration is not expired/unregistered
- Keep summary, what_this_means, and what_to_do_next practical and Australian-specific

PPSR CERTIFICATE TEXT:
${raw_text}`;
}

function is_record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clean_text_value(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/(?:\u2022|â€¢)/g, "-")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function strip_no_data(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const cleaned = clean_text_value(value)
    .replace(/\s*This search reflects the data contained in the PPSR at.*$/i, "")
    .replace(/\s+State vehicle registered\s*:.*$/i, "")
    .replace(/\s+Registration expiry\s*:.*$/i, "")
    .replace(/\s+Year of manufacture\s*:.*$/i, "")
    .replace(/\s+Year\/Month of compliance\s*:.*$/i, "")
    .replace(/\s+Model\s*:.*$/i, "")
    .replace(/[.;:,]+$/g, "")
    .trim();

  if (!cleaned || /^(?:no data recorded|not provided|n\/a|null)$/i.test(cleaned)) {
    return null;
  }

  return cleaned;
}

function coerce_string(value: unknown): string | null {
  if (typeof value === "string") {
    return strip_no_data(value);
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function coerce_year(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value >= 1886 && value <= 2100) {
    return value;
  }

  if (typeof value === "string") {
    const match = value.match(/\b(19\d{2}|20\d{2})\b/);
    if (match) {
      const parsed = Number.parseInt(match[1], 10);
      if (Number.isInteger(parsed) && parsed >= 1886 && parsed <= 2100) {
        return parsed;
      }
    }
  }

  return null;
}

function coerce_boolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalised = value.trim().toLowerCase();
    if (
      ["false", "no", "n", "0", "clear", "none", "not recorded"].includes(normalised) ||
      /\b(?:not\s+recorded|not\s+reported|none\s+found|no\s+(?:security\s+interest|write-?off|stolen)|clear)\b/i.test(
        normalised,
      )
    ) {
      return false;
    }
    if (
      ["true", "yes", "y", "1", "registered", "found", "on record"].includes(
        normalised,
      ) ||
      /\b(?:registered|on\s+record|reported\s+stolen|write-?off|security\s+interest|encumbrance|lien)\b/i.test(
        normalised,
      )
    ) {
      return true;
    }
  }

  return false;
}

function normalise_registration_status(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const cleaned = clean_text_value(value);
  if (/^REGISTERED\s*\(/i.test(cleaned)) {
    return cleaned;
  }

  for (const rule of REGISTRATION_STATUS_RULES) {
    if (rule.pattern.test(cleaned)) {
      return rule.status;
    }
  }

  return cleaned;
}

function derive_verdict({
  finance_owing,
  stolen,
  writeoff,
  writeoff_details,
  registration_status,
}: {
  finance_owing: boolean;
  stolen: boolean;
  writeoff: boolean;
  writeoff_details: string | null;
  registration_status: string | null;
}): PPSRVerdict {
  const writeoff_text = writeoff_details?.toLowerCase() ?? "";
  const registration_text =
    normalise_registration_status(registration_status)?.toLowerCase() ?? "";
  const repairable_writeoff = writeoff && writeoff_text.includes("repairable");
  const stat_writeoff = writeoff && (writeoff_text.includes("statutory") || !repairable_writeoff);
  const registration_issue =
    registration_text.includes("expired") || registration_text.includes("unregistered");

  if (finance_owing || stolen || stat_writeoff) {
    return "ALERT";
  }

  if (repairable_writeoff || registration_issue) {
    return "CAUTION";
  }

  return "CLEAR";
}

function default_summary(data: {
  finance_owing: boolean;
  stolen: boolean;
  writeoff: boolean;
  registration_status: string | null;
  verdict: PPSRVerdict;
}) {
  const summary_lines: string[] = [];

  if (data.finance_owing) {
    summary_lines.push("Finance is registered against this vehicle.");
  }
  if (data.stolen) {
    summary_lines.push("This vehicle has a stolen flag on the certificate.");
  }
  if (data.writeoff) {
    summary_lines.push("A write-off record exists for this vehicle.");
  }
  if (
    data.registration_status &&
    /(expired|unregistered)/i.test(data.registration_status)
  ) {
    summary_lines.push(`Registration status needs attention: ${data.registration_status}.`);
  }

  if (summary_lines.length > 0) {
    return summary_lines.join(" ");
  }

  return data.verdict === "CLEAR"
    ? "No finance, stolen, or write-off flags were found in this PPSR certificate."
    : "PPSR check completed. Review the detailed findings below.";
}

function default_what_this_means(verdict: PPSRVerdict): string {
  if (verdict === "ALERT") {
    return "The PPSR certificate shows a serious risk signal such as finance owing, a stolen flag, or a statutory write-off. Buying before resolving that issue can expose you to repossession risk or a vehicle you cannot legally put back on the road.";
  }

  if (verdict === "CAUTION") {
    return "The vehicle is not fully clean on PPSR. A repairable write-off or registration issue can be manageable, but it should materially change how you inspect the car, negotiate the price, and assess resale risk.";
  }

  return "No finance, stolen, or write-off issues were found in the parsed PPSR text. That is a positive sign, but you should still match the VIN/rego to the car in person and organise a pre-purchase inspection.";
}

function default_what_to_do_next(verdict: PPSRVerdict): string {
  if (verdict === "ALERT") {
    return "Do not buy this car until the issue is fully cleared and documented in writing. If finance is owing, require proof of payout/discharge from the lender; if stolen or statutory write-off data appears, walk away and verify with the relevant authority.";
  }

  if (verdict === "CAUTION") {
    return "Get a proper inspection and verify repair history, registration status, and identity documents before making an offer. Price the car below an equivalent clean-title vehicle to reflect the PPSR history.";
  }

  return "Cross-check the VIN, rego, and seller ID against the certificate and the car itself, then arrange an independent inspection. If everything matches, proceed with normal settlement and keep the PPSR certificate on file.";
}

function coerce_provider_payload(
  payload: unknown,
  source: PPSRExtractedData["source"],
): PPSRExtractedData {
  const record = is_record(payload) ? payload : {};

  const finance_owing = coerce_boolean(record.finance_owing);
  const stolen = coerce_boolean(record.stolen);
  const writeoff = coerce_boolean(record.writeoff);
  const finance_details = coerce_string(record.finance_details);
  const stolen_details = coerce_string(record.stolen_details);
  const writeoff_details = coerce_string(record.writeoff_details);
  const registration_status = normalise_registration_status(
    coerce_string(record.registration_status),
  );
  const registration_expiry = coerce_string(record.registration_expiry);
  const verdict = derive_verdict({
    finance_owing,
    stolen,
    writeoff,
    writeoff_details,
    registration_status,
  });

  return {
    vin: coerce_string(record.vin),
    rego: coerce_string(record.rego),
    make: coerce_string(record.make),
    model: coerce_string(record.model),
    year: coerce_year(record.year),
    finance_owing,
    finance_details,
    stolen,
    stolen_details,
    writeoff,
    writeoff_details,
    registration_status,
    registration_expiry,
    verdict,
    summary:
      coerce_string(record.summary) ??
      default_summary({ finance_owing, stolen, writeoff, registration_status, verdict }),
    what_this_means:
      coerce_string(record.what_this_means) ?? default_what_this_means(verdict),
    what_to_do_next:
      coerce_string(record.what_to_do_next) ?? default_what_to_do_next(verdict),
    extracted_at: new Date().toISOString(),
    source,
  };
}

function parse_provider_json(content: string): unknown {
  const cleaned = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end <= start) {
    throw new Error("Provider response did not contain a JSON object.");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}

async function call_openai(api_key: string, raw_text: string): Promise<PPSRExtractedData> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${api_key}`,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
        { role: "user", content: build_extraction_prompt(raw_text) },
      ],
      max_tokens: 900,
      temperature: 0.1,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI extraction failed: ${res.status} ${text}`);
  }

  const response_payload = (await res.json()) as {
    choices?: Array<{ message?: { content?: string | null } | null }>;
  };
  const content = response_payload.choices?.[0]?.message?.content ?? "";

  return coerce_provider_payload(parse_provider_json(content), "openai");
}

async function call_gemini(api_key: string, raw_text: string): Promise<PPSRExtractedData> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      GEMINI_MODEL,
    )}:generateContent?key=${encodeURIComponent(api_key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${EXTRACTION_SYSTEM_PROMPT}\n\n${build_extraction_prompt(raw_text)}`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 900,
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini extraction failed: ${res.status} ${text}`);
  }

  const response_payload = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string | null }> | null } | null }>;
  };
  const content = response_payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return coerce_provider_payload(parse_provider_json(content), "gemini");
}

function normalise_raw_text(raw_text: string): string {
  return clean_text_value(raw_text)
    .replace(/\r\n?/g, "\n")
    .replace(/This search reflects the data contained in the PPSR at[^\n]*/gi, "\n")
    .replace(/^Page \d+ of \d+$/gim, "")
    .replace(/^End of search result$/gim, "")
    .replace(/^\d{1,2}\/\d{1,2}\/\d{4}$/gim, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function extract_field(raw_text: string, regex: RegExp): string | null {
  const match = raw_text.match(regex);
  if (!match) {
    return null;
  }

  return strip_no_data(match[1] ?? "");
}

function build_stop_regex(excluded_marker: string) {
  return new RegExp(
    `(?:\\n\\s*(?:${SECTION_STOP_MARKERS.filter((marker) => marker !== excluded_marker)
      .map((marker) => marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")}))`,
    "i",
  );
}

function extract_section(raw_text: string, heading: string): string {
  const heading_regex = new RegExp(
    `(?:^|\\n)\\s*${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:?\\s*`,
    "i",
  );
  const heading_match = raw_text.match(heading_regex);

  if (!heading_match || heading_match.index === undefined) {
    return "";
  }

  const section_body = raw_text.slice(heading_match.index + heading_match[0].length);
  const stop_regex = build_stop_regex(heading);
  const stop_match = section_body.match(stop_regex);
  const end_index = stop_match?.index ?? section_body.length;

  return section_body.slice(0, end_index).trim();
}

function section_summary(section: string): string | null {
  const lines = section
    .split("\n")
    .map((line) =>
      strip_no_data(
        line.replace(/^(?:[*\u2022\-\s]|â€¢)+/, "").replace(/\s*[-:]\s*$/, ""),
      ),
    )
    .filter((line): line is string => Boolean(line))
    .filter(
      (line) =>
        !NO_DATA_LINE_PATTERN.test(line) &&
        !/^tasmanian stolen vehicle information is currently unavailable/i.test(line) &&
        !/^a stolen vehicle notification, or the absence of one/i.test(line) &&
        !/^if there is a stolen vehicle notification you wish to enquire about/i.test(line) &&
        !/^please note that there may be multiple stolen notifications shown/i.test(line) &&
        !/^vehicle information is requested from austroads nevdis database/i.test(line) &&
        !/^the nevdis data is intended to assist users/i.test(line) &&
        !/^state and territory road agencies are the source of nevdis data/i.test(line) &&
        !/^access to and use of data provided through the ppsr/i.test(line) &&
        !/^to the extent permitted by law/i.test(line) &&
        !/^privacy and terms and conditions/i.test(line),
    );

  return lines.slice(0, 4).join(" | ") || null;
}

function parse_vin(raw_text: string): string | null {
  const match = raw_text.match(
    /(?:^|\n)\s*(?:VIN|Motor vehicle|Identifier number|Serial number)\s*:\s*([A-HJ-NPR-Z0-9]{11,17})\b/i,
  );
  return match?.[1]?.toUpperCase() ?? null;
}

function parse_rego(raw_text: string, vehicle_section: string): string | null {
  const explicit_rego = extract_field(
    vehicle_section || raw_text,
    /(?:^|\n)\s*Registration Number\s*:\s*([A-Z0-9 -]{1,16})/i,
  );
  if (explicit_rego) {
    return explicit_rego.replace(/\s+/g, "").toUpperCase();
  }

  const plate_value = extract_field(
    raw_text,
    /(?:^|\n)\s*Registration plate number\s*:\s*([^\n]+)/i,
  );

  return plate_value ? plate_value.replace(/\s+/g, "").toUpperCase() : null;
}

function parse_registration_details(raw_text: string): {
  registration_status: string | null;
  registration_expiry: string | null;
} {
  const registration_expiry = extract_field(
    raw_text,
    /(?:^|\n)\s*Registration Expiry\s*:\s*([^\n]+)/i,
  );
  const explicit_status = extract_field(
    raw_text,
    /(?:^|\n)\s*Registration Status\s*:\s*([^\n]+)/i,
  );

  if (explicit_status) {
    return {
      registration_status: normalise_registration_status(explicit_status),
      registration_expiry,
    };
  }

  const state_registration = extract_field(
    raw_text,
    /(?:^|\n|[. ])\s*State vehicle registered\s*:\s*([^\n]+)/i,
  );

  if (state_registration) {
    return {
      registration_status: `REGISTERED (${state_registration.toUpperCase()})`,
      registration_expiry,
    };
  }

  if (
    /registration plate number\s*:\s*no data recorded/i.test(raw_text) &&
    /state vehicle registered\s*:\s*no data recorded/i.test(raw_text)
  ) {
    return { registration_status: "NOT RECORDED", registration_expiry };
  }

  return { registration_status: null, registration_expiry };
}

function parse_vehicle_identity(raw_text: string) {
  const vehicle_section = extract_section(raw_text, "VEHICLE DETAILS");
  const vehicle_source = vehicle_section || raw_text;
  const make = extract_field(vehicle_source, /(?:^|\n)\s*Make\s*:\s*([^\n]+)/i);
  const model =
    extract_field(vehicle_source, /(?:^|\n)\s*Model\s*:\s*([^\n]+)/i) ??
    extract_field(
      raw_text,
      /(?:^|\n|Body type:[^\n]*\s)Model\s*:\s*([^\n]+)/i,
    );
  const year =
    coerce_year(extract_field(vehicle_source, /(?:^|\n)\s*Year\s*:\s*([^\n]+)/i)) ??
    coerce_year(
      extract_field(raw_text, /(?:^|\n)\s*Year of manufacture\s*:\s*([^\n]+)/i),
    ) ??
    coerce_year(
      extract_field(raw_text, /(?:^|\n)\s*Year\/Month of compliance\s*:\s*([^\n]+)/i),
    );

  return {
    vin: parse_vin(raw_text),
    rego: parse_rego(raw_text, vehicle_section),
    make,
    model,
    year,
  };
}

function parse_finance(raw_text: string): {
  finance_owing: boolean;
  finance_details: string | null;
} {
  if (NEGATIVE_FINANCE_PATTERNS.some((pattern) => pattern.test(raw_text))) {
    return { finance_owing: false, finance_details: null };
  }

  const finance_section = extract_section(raw_text, "Finance / Security Interests");
  const ppsr_registration_section = extract_section(raw_text, "PPSR Registration Details");
  const finance_owing = POSITIVE_FINANCE_PATTERNS.some((pattern) => pattern.test(raw_text));

  if (!finance_owing) {
    return { finance_owing: false, finance_details: null };
  }

  const details = [
    extract_field(finance_section, /(?:^|\n)\s*Secured Party\s*:\s*([^\n]+)/i),
    extract_field(finance_section, /(?:^|\n)\s*Collateral Type\s*:\s*([^\n]+)/i),
    extract_field(
      finance_section,
      /(?:^|\n)\s*(?:Registration Number|PPSR Registration Number)\s*:\s*([^\n]+)/i,
    ),
    extract_field(finance_section, /(?:^|\n)\s*Description\s*:\s*([^\n]+)/i),
    extract_field(finance_section, /(?:^|\n)\s*End Date\s*:\s*([^\n]+)/i),
    extract_field(
      ppsr_registration_section,
      /(?:^|\n)\s*PPSR Registration number\s*:\s*([^\n]+)/i,
    ),
    extract_field(
      ppsr_registration_section,
      /(?:^|\n)\s*Registration end time\s*:\s*([^\n]+)/i,
    ),
  ]
    .filter((line): line is string => Boolean(line))
    .join(" | ");

  return {
    finance_owing: true,
    finance_details: details || "Security interest registered on PPSR. See source certificate for full lender details.",
  };
}

function parse_stolen(raw_text: string): {
  stolen: boolean;
  stolen_details: string | null;
} {
  if (STOLEN_CLEAR_PATTERNS.some((pattern) => pattern.test(raw_text))) {
    return { stolen: false, stolen_details: null };
  }

  const custom_section = extract_section(raw_text, "Stolen Vehicle Check");
  const nevdis_section = extract_section(raw_text, "NEVDIS Stolen Vehicle Notification");
  const custom_status = extract_field(
    raw_text,
    /(?:^|\n)\s*Stolen Vehicle Check\s*:\s*([^\n]+)/i,
  );
  const custom_details = section_summary(custom_section);
  const nevdis_details = section_summary(nevdis_section);

  const custom_positive = Boolean(
    coerce_boolean(custom_status) ||
      (custom_details &&
        STOLEN_HIT_PATTERNS.some((pattern) => pattern.test(custom_details))),
  );
  const nevdis_positive = Boolean(
    nevdis_details &&
      STOLEN_HIT_PATTERNS.some((pattern) =>
        pattern.test(`${nevdis_section}\n${nevdis_details}`),
      ),
  );
  const stolen = custom_positive || nevdis_positive;

  return {
    stolen,
    stolen_details: stolen
      ? custom_details ||
        nevdis_details ||
        "A stolen notification appears in the PPSR/NEVDIS section."
      : null,
  };
}

function parse_writeoff(raw_text: string): {
  writeoff: boolean;
  writeoff_details: string | null;
} {
  if (WRITE_OFF_CLEAR_PATTERNS.some((pattern) => pattern.test(raw_text))) {
    return { writeoff: false, writeoff_details: null };
  }

  const custom_section = extract_section(raw_text, "Write-Off History");
  const nevdis_section = extract_section(
    raw_text,
    "NEVDIS Written-off Vehicle Notification",
  );
  const custom_status = extract_field(
    raw_text,
    /(?:^|\n)\s*Write-Off History\s*:\s*([^\n]+)/i,
  );
  const details_source = custom_section || nevdis_section;
  const details_summary = section_summary(details_source);
  const has_repairable = /repairable write-?off/i.test(details_source);
  const has_statutory = /statutory write-?off/i.test(details_source);
  const writeoff =
    has_repairable ||
    has_statutory ||
    coerce_boolean(custom_status) ||
    Boolean(
      details_summary &&
        WRITE_OFF_HIT_PATTERNS.some((pattern) =>
          pattern.test(`${details_source}\n${details_summary}`),
        ),
    ) ||
    (/write-?off recorded/i.test(raw_text) &&
      !/no write-?off recorded|not recorded as written off/i.test(raw_text));

  if (!writeoff) {
    return { writeoff: false, writeoff_details: null };
  }

  const fallback_detail = has_repairable
    ? "Repairable write-off recorded."
    : has_statutory
      ? "Statutory write-off recorded."
      : "Write-off record present.";

  return {
    writeoff: true,
    writeoff_details: details_summary || fallback_detail,
  };
}

function hardcoded_fallback(raw_text: string): PPSRExtractedData {
  const cleaned_text = normalise_raw_text(raw_text);
  const vehicle = parse_vehicle_identity(cleaned_text);
  const registration = parse_registration_details(cleaned_text);
  const finance = parse_finance(cleaned_text);
  const stolen = parse_stolen(cleaned_text);
  const writeoff = parse_writeoff(cleaned_text);
  const verdict = derive_verdict({
    finance_owing: finance.finance_owing,
    stolen: stolen.stolen,
    writeoff: writeoff.writeoff,
    writeoff_details: writeoff.writeoff_details,
    registration_status: registration.registration_status,
  });

  const payload = {
    ...vehicle,
    ...finance,
    ...stolen,
    ...writeoff,
    ...registration,
    verdict,
    summary: default_summary({
      finance_owing: finance.finance_owing,
      stolen: stolen.stolen,
      writeoff: writeoff.writeoff,
      registration_status: registration.registration_status,
      verdict,
    }),
    what_this_means: default_what_this_means(verdict),
    what_to_do_next: default_what_to_do_next(verdict),
  };

  return coerce_provider_payload(payload, "fallback");
}

export async function extract_ppsr_data(raw_text: string): Promise<PPSRExtractedData> {
  const cleaned_text = normalise_raw_text(raw_text);
  if (!cleaned_text) {
    throw new Error("raw PPSR text is required.");
  }

  const openai_key = process.env.OPENAI_API_KEY?.trim();
  const google_key = process.env.GOOGLE_AI_API_KEY?.trim();

  if (openai_key) {
    try {
      return await call_openai(openai_key, cleaned_text);
    } catch (err) {
      console.warn("[PPSR] OpenAI extraction failed, trying Gemini:", err);
    }
  }

  if (google_key) {
    try {
      return await call_gemini(google_key, cleaned_text);
    } catch (err) {
      console.warn("[PPSR] Gemini extraction failed, using fallback:", err);
    }
  }

  console.warn("[PPSR] No AI keys configured or all providers failed - using hardcoded fallback.");
  return hardcoded_fallback(cleaned_text);
}
