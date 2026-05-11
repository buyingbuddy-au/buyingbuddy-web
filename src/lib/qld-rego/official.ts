import { classifyQldRego, getPurposeEducation } from "./education";
import { validateQldRego } from "./normalise";
import type { QldRegoCheckResponse, QldRegoData } from "./types";

const START_URL = "https://www.service.transport.qld.gov.au/checkrego/application/VehicleSearch.xhtml";
const SOURCE = "qld-transport-check-rego" as const;
const TIMEOUT_MS = Number(process.env.REGO_CHECK_TIMEOUT_MS ?? 12_000);
const SUCCESS_CACHE_MS = Number(process.env.REGO_CHECK_CACHE_SUCCESS_MS ?? 24 * 60 * 60 * 1000);
const NO_RESULT_CACHE_MS = Number(process.env.REGO_CHECK_NO_RESULT_CACHE_MS ?? 60 * 60 * 1000);

type CacheEntry = { expiresAt: number; value: QldRegoCheckResponse };
const cache = new Map<string, CacheEntry>();
let inFlight = false;
const hourlyHits: number[] = [];

type FailureOptions = {
  rateLimitScope?: "instance";
};

function nowIso() {
  return new Date().toISOString();
}

function failure(
  status: Exclude<QldRegoCheckResponse["status"], "success">,
  error: string,
  userMessage: string,
  retryable: boolean,
  startedAt?: number,
  options: FailureOptions = {},
): QldRegoCheckResponse {
  return {
    ok: false,
    status,
    error,
    userMessage,
    retryable,
    checkedAt: nowIso(),
    durationMs: startedAt ? Date.now() - startedAt : undefined,
    ...options,
  };
}

function htmlDecode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function stripHtml(html: string) {
  return htmlDecode(html.replace(/<script[\s\S]*?<\/script>/gi, "\n").replace(/<style[\s\S]*?<\/style>/gi, "\n").replace(/<[^>]+>/g, "\n"))
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function inputValue(html: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`name=["']${escaped}["'][^>]*value=["']([^"']*)["']`, "i");
  return htmlDecode(pattern.exec(html)?.[1] ?? "");
}

const RESULT_LABELS = new Set(
  ["Registration number", "Vehicle Identification Number (VIN)", "Description", "Purpose of use", "Status", "Expiry"].map((label) =>
    label.toLowerCase(),
  ),
);

function lineAfter(lines: string[], label: string) {
  const idx = lines.findIndex((line) => line.toLowerCase() === label.toLowerCase());
  const value = idx >= 0 ? lines[idx + 1] : undefined;
  if (!value || RESULT_LABELS.has(value.toLowerCase())) return undefined;
  return value;
}

function parseResult(rego: string, html: string): QldRegoData | null {
  const lines = stripHtml(html);
  if (!lines.some((line) => line.toLowerCase() === "registration details")) return null;

  const data: QldRegoData = {
    rego: lineAfter(lines, "Registration number") ?? rego,
    vin: lineAfter(lines, "Vehicle Identification Number (VIN)"),
    description: lineAfter(lines, "Description"),
    purpose: lineAfter(lines, "Purpose of use"),
    registrationStatus: lineAfter(lines, "Status"),
    expiry: lineAfter(lines, "Expiry"),
  };

  if (!data.expiry || !data.vin || !data.registrationStatus) return null;
  return data;
}

function looksLikeNoResult(html: string) {
  const text = stripHtml(html).join(" ").toLowerCase();
  return (
    text.includes("could not") ||
    text.includes("not found") ||
    text.includes("no registration") ||
    text.includes("invalid") ||
    text.includes("unable to find")
  );
}

class CookieJar {
  private cookies = new Map<string, string>();

  store(setCookie: string | null) {
    if (!setCookie) return;
    const parts = setCookie.split(/,(?=\s*[^;,]+=)/);
    for (const part of parts) {
      const [kv] = part.trim().split(";");
      const idx = kv.indexOf("=");
      if (idx > 0) this.cookies.set(kv.slice(0, idx), kv.slice(idx + 1));
    }
  }

  header() {
    return Array.from(this.cookies).map(([key, value]) => `${key}=${value}`).join("; ");
  }
}

async function requestWithJar(url: string, jar: CookieJar, init: RequestInit = {}, signal: AbortSignal) {
  const res = await fetch(url, {
    ...init,
    redirect: "manual",
    signal,
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; BuyingBuddyQLDCheck/1.0)",
      accept: "text/html,application/xhtml+xml",
      origin: "https://www.service.transport.qld.gov.au",
      cookie: jar.header(),
      ...(init.headers ?? {}),
    },
  });
  jar.store(res.headers.get("set-cookie"));
  return res;
}

async function follow(url: string, jar: CookieJar, signal: AbortSignal) {
  let current = url;
  for (let i = 0; i < 10; i += 1) {
    const res = await requestWithJar(current, jar, {}, signal);
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      current = new URL(location, current).href;
      continue;
    }
    return { url: current, html: await res.text(), status: res.status };
  }
  throw new Error("Too many redirects from QLD Transport.");
}

async function postForm(url: string, jar: CookieJar, params: Record<string, string>, signal: AbortSignal) {
  const res = await requestWithJar(
    url,
    jar,
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        referer: url,
      },
      body: new URLSearchParams(params),
    },
    signal,
  );

  const location = res.headers.get("location");
  if (res.status >= 300 && res.status < 400 && location) {
    return follow(new URL(location, url).href, jar, signal);
  }
  return { url, html: await res.text(), status: res.status };
}

function registerHit() {
  const cutoff = Date.now() - 60 * 60 * 1000;
  while (hourlyHits.length && hourlyHits[0] < cutoff) hourlyHits.shift();
  const max = Number(process.env.REGO_CHECK_MAX_PER_HOUR ?? 20);
  if (hourlyHits.length >= max) return false;
  hourlyHits.push(Date.now());
  return true;
}

export async function runQldOfficialRegoCheck(input: string): Promise<QldRegoCheckResponse> {
  const startedAt = Date.now();
  const validation = validateQldRego(input);
  if (!validation.ok) {
    return failure("input_error", "invalid_input", validation.error, false, startedAt);
  }

  const rego = validation.rego;
  const cached = cache.get(rego);
  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached.value, cached: true };
  }

  if (process.env.REGO_CHECK_ENABLED === "false") {
    return failure("official_unavailable", "feature_disabled", "The QLD rego checker is temporarily offline.", true, startedAt);
  }

  if (inFlight) {
    return failure("busy", "worker_busy", "The checker is busy for a moment. Try again shortly, or leave your email and we’ll send it.", true, startedAt, {
      rateLimitScope: "instance",
    });
  }

  if (!registerHit()) {
    return failure("busy", "hourly_limit", "We’re pacing the free checks so the QLD source stays happy. Leave your email and we’ll send yours shortly.", true, startedAt, {
      rateLimitScope: "instance",
    });
  }

  inFlight = true;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const jar = new CookieJar();
    let page = await follow(START_URL, jar, controller.signal);

    if (page.html.includes("tAndCForm:confirmButton")) {
      const viewState = inputValue(page.html, "javax.faces.ViewState");
      const clientWindow = inputValue(page.html, "javax.faces.ClientWindow");
      page = await postForm(
        page.url,
        jar,
        {
          tAndCForm: "tAndCForm",
          "tAndCForm:confirmButton": "",
          tAndCForm_SUBMIT: "1",
          "javax.faces.ViewState": viewState,
          "javax.faces.ClientWindow": clientWindow,
        },
        controller.signal,
      );
    }

    if (!page.html.includes("vehicleSearchForm:plateNumber")) {
      return failure("parse_error", "search_form_missing", "The QLD site changed its form. We’ll need to check this manually.", true, startedAt);
    }

    const viewState = inputValue(page.html, "javax.faces.ViewState");
    const clientWindow = inputValue(page.html, "javax.faces.ClientWindow");
    const resultPage = await postForm(
      page.url,
      jar,
      {
        vehicleSearchForm: "vehicleSearchForm",
        "vehicleSearchForm:plateNumber": rego,
        "vehicleSearchForm:referenceId": "",
        "vehicleSearchForm:confirmButton": "",
        vehicleSearchForm_SUBMIT: "1",
        "javax.faces.ViewState": viewState,
        "javax.faces.ClientWindow": clientWindow,
      },
      controller.signal,
    );

    const data = parseResult(rego, resultPage.html);
    if (!data) {
      const noResult = looksLikeNoResult(resultPage.html);
      const response = failure(
        noResult ? "no_result" : "parse_error",
        noResult ? "no_official_result" : "result_parse_failed",
        noResult
          ? "QLD Transport didn’t return a registration record for that plate. Check for typos, spaces, or whether it’s actually a QLD rego."
          : "We reached QLD Transport but couldn’t read the result reliably. We’ll need to check this manually.",
        !noResult,
        startedAt,
      );
      if (noResult) {
        cache.set(rego, { value: response, expiresAt: Date.now() + NO_RESULT_CACHE_MS });
      }
      return response;
    }

    const classification = classifyQldRego(data);
    const response: QldRegoCheckResponse = {
      ok: true,
      status: "success",
      classification,
      data,
      education: getPurposeEducation(data.purpose),
      checkedAt: nowIso(),
      durationMs: Date.now() - startedAt,
      source: SOURCE,
    };
    cache.set(rego, { value: response, expiresAt: Date.now() + SUCCESS_CACHE_MS });
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return failure("timeout", "official_timeout", "The QLD site took too long. Leave your email and we’ll send the result once it comes through.", true, startedAt);
    }
    const message = error instanceof Error ? error.message : String(error);
    if (/captcha|robot|blocked|access denied/i.test(message)) {
      return failure("blocked", "official_blocked", "The QLD site asked for manual verification. We’ll need to check this one manually.", true, startedAt);
    }
    console.error("[qld-rego] official lookup failed", error);
    return failure("official_unavailable", "official_fetch_failed", "The QLD check hit a technical snag. Leave your email and we’ll send the result when it clears.", false, startedAt);
  } finally {
    clearTimeout(timeout);
    inFlight = false;
  }
}
