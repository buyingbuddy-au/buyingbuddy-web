const SENSITIVE_HANDOFF_KEYS = ["rego", "vin", "email"] as const;

export type FunnelHandoffSource =
  | "rego_result"
  | "listing_result"
  | "ppsr_success"
  | "contract_result"
  | string;

export type FunnelHandoffInput = {
  rego?: string | null;
  vin?: string | null;
  email?: string | null;
  source?: FunnelHandoffSource | null;
};

export type FunnelHandoffContext = {
  email: string;
  identifier: string;
  identifierType: "vin" | "rego" | "unknown";
  rego: string;
  source: string;
  vin: string;
};

function normaliseVehicleToken(value: string | null | undefined) {
  return (value ?? "")
    .toUpperCase()
    .replace(/[\s-]+/g, "")
    .trim();
}

function normaliseEmail(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function normaliseSource(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function buildPpsrHandoffHref(input: FunnelHandoffInput, pathname = "/ppsr") {
  const params = new URLSearchParams();
  const vin = normaliseVehicleToken(input.vin);
  const rego = normaliseVehicleToken(input.rego);
  const email = normaliseEmail(input.email);
  const source = normaliseSource(input.source);

  if (vin) params.set("vin", vin);
  if (rego) params.set("rego", rego);
  if (email) params.set("email", email);
  if (source) params.set("source", source);

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

type SearchParamsLike = Pick<URLSearchParams, "get" | "has">;

export function readFunnelHandoffParams(searchParams: SearchParamsLike): FunnelHandoffContext {
  const vin = normaliseVehicleToken(searchParams.get("vin"));
  const rego = normaliseVehicleToken(searchParams.get("rego"));
  const email = normaliseEmail(searchParams.get("email"));
  const source = normaliseSource(searchParams.get("source"));
  const identifier = vin || rego;
  const identifierType = vin ? "vin" : rego ? "rego" : "unknown";

  return {
    email,
    identifier,
    identifierType,
    rego,
    source,
    vin,
  };
}

export function buildUrlWithoutSensitiveHandoffParams(href: string) {
  const url = new URL(href);
  for (const key of SENSITIVE_HANDOFF_KEYS) {
    url.searchParams.delete(key);
  }

  const query = url.searchParams.toString();
  return `${url.origin}${url.pathname}${query ? `?${query}` : ""}${url.hash}`;
}

export function hasSensitiveHandoffParams(searchParams: SearchParamsLike) {
  return SENSITIVE_HANDOFF_KEYS.some((key) => searchParams.has(key));
}
