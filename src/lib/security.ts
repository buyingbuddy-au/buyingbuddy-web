import dns from "node:dns/promises";
import net from "node:net";
import { NextResponse } from "next/server";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateBucket = {
  count: number;
  resetAt: number;
};

type RateStore = Map<string, RateBucket>;

const LOCAL_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "ip6-loopback",
  "metadata.google.internal",
]);

const BLOCKED_HOSTNAMES = new Set([
  "169.254.169.254",
  "metadata",
  "metadata.google.internal",
]);

function get_rate_store(): RateStore {
  const globalStore = globalThis as typeof globalThis & { __buyingbuddy_rate_store?: RateStore };
  if (!globalStore.__buyingbuddy_rate_store) {
    globalStore.__buyingbuddy_rate_store = new Map();
  }
  return globalStore.__buyingbuddy_rate_store;
}

export function client_ip(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = request.headers.get("x-real-ip")?.trim();
  return forwarded || real || "unknown";
}

export function rate_limit_response(request: Request, options: RateLimitOptions) {
  const now = Date.now();
  const store = get_rate_store();
  const bucketKey = `${options.key}:${client_ip(request)}`;
  const bucket = store.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    store.set(bucketKey, { count: 1, resetAt: now + options.windowMs });
    return null;
  }

  if (bucket.count >= options.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return NextResponse.json(
      {
        ok: false,
        error: "Too many requests. Give it a minute and try again.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "X-RateLimit-Limit": String(options.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(bucket.resetAt / 1000)),
        },
      },
    );
  }

  bucket.count += 1;
  return null;
}

export function escape_html(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escape_attr(value: unknown) {
  return escape_html(value).replace(/`/g, "&#96;");
}

function is_ipv4_private_or_reserved(ip: string) {
  const parts = ip.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }

  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 0 && parts[2] === 2) ||
    (a === 198 && b >= 18 && b <= 19) ||
    (a === 198 && b === 51 && parts[2] === 100) ||
    (a === 203 && b === 0 && parts[2] === 113) ||
    a >= 224
  );
}

function is_ipv6_private_or_reserved(ip: string) {
  const normalized = ip.toLowerCase();
  if (normalized.startsWith("::ffff:")) {
    const maybeV4 = normalized.slice("::ffff:".length);
    if (net.isIP(maybeV4) === 4) return is_ipv4_private_or_reserved(maybeV4);
  }

  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  );
}

export function is_private_or_reserved_ip(ip: string) {
  const version = net.isIP(ip);
  if (version === 4) return is_ipv4_private_or_reserved(ip);
  if (version === 6) return is_ipv6_private_or_reserved(ip);
  return true;
}

function normalise_hostname(hostname: string) {
  return hostname.trim().replace(/\.$/, "").toLowerCase();
}

export function parse_public_http_url(rawUrl: string, label = "URL") {
  const value = rawUrl.trim();
  if (value.length > 2048) {
    throw new Error(`${label} is too long.`);
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }

  if (!/^https?:$/i.test(url.protocol)) {
    throw new Error(`${label} must start with http or https.`);
  }

  if (url.username || url.password) {
    throw new Error(`${label} must not include embedded credentials.`);
  }

  const hostname = normalise_hostname(url.hostname);
  if (!hostname || LOCAL_HOSTNAMES.has(hostname) || BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".localhost")) {
    throw new Error(`${label} must point to a public website.`);
  }

  if (net.isIP(hostname) && is_private_or_reserved_ip(hostname)) {
    throw new Error(`${label} must not point to a private or internal network.`);
  }

  return url;
}

export async function assert_public_fetch_url(rawUrl: string, label = "URL") {
  const url = parse_public_http_url(rawUrl, label);
  const hostname = normalise_hostname(url.hostname);

  if (!net.isIP(hostname)) {
    const records = await dns.lookup(hostname, { all: true, verbatim: true });
    if (records.length === 0 || records.some((record) => is_private_or_reserved_ip(record.address))) {
      throw new Error(`${label} resolves to a private or internal network.`);
    }
  }

  return url;
}
