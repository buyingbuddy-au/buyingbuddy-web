import { to_sqlite_datetime } from "@/lib/time";
import type { JsonValue, ScrapedListing } from "@/lib/types";

const KNOWN_MAKES = [
  "Toyota",
  "Mazda",
  "Mitsubishi",
  "Haval",
  "Hyundai",
  "Kia",
  "Ford",
  "Holden",
  "Honda",
  "Nissan",
  "Volkswagen",
  "Subaru",
  "BMW",
  "Mercedes-Benz",
  "Audi",
];

function strip_html(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function decode_html_entities(value: string) {
  return value
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extract_meta(html: string, key: string) {
  const property_match = html.match(
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i",
    ),
  );
  const reversed_match = html.match(
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["'][^>]*>`,
      "i",
    ),
  );

  return decode_html_entities(property_match?.[1] ?? reversed_match?.[1] ?? "").trim();
}

function extract_title(html: string) {
  return decode_html_entities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim();
}

function extract_json_ld_objects(html: string) {
  const matches = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  const objects: JsonValue[] = [];

  for (const match of matches) {
    const raw = match[1]?.trim();
    if (!raw) {
      continue;
    }

    try {
      objects.push(JSON.parse(raw) as JsonValue);
    } catch {
      continue;
    }
  }

  return objects;
}

function flatten_json_ld(value: JsonValue): Array<Record<string, JsonValue>> {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => flatten_json_ld(entry));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, JsonValue>;
  const graph = record["@graph"];

  if (graph) {
    return [record, ...flatten_json_ld(graph)];
  }

  return [record];
}

function coerce_number(value: string | number | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const digits = value.replace(/[^\d]/g, "");
  if (!digits) {
    return null;
  }

  const number = Number.parseInt(digits, 10);
  return Number.isFinite(number) ? number : null;
}

function extract_year(text: string) {
  const match = text.match(/\b(19|20)\d{2}\b/);
  return match ? Number.parseInt(match[0], 10) : null;
}

function extract_mileage(text: string) {
  const match = text.match(/([\d,]{2,7})\s?(?:km|kms|kilometres?)/i);
  return match ? coerce_number(match[1]) : null;
}

function extract_price(text: string) {
  const match = text.match(/\$\s*([\d,]{3,7})/);
  return match ? coerce_number(match[1]) : null;
}

function extract_make_and_model(text: string) {
  const make = KNOWN_MAKES.find((candidate) =>
    new RegExp(`\\b${candidate.replace("-", "[- ]")}\\b`, "i").test(text),
  );

  if (!make) {
    return { vehicle_make: null, vehicle_model: null };
  }

  const tokens = text.replace(/\s+/g, " ").trim().split(" ");
  const make_index = tokens.findIndex((token) =>
    new RegExp(`^${make.replace("-", "[- ]")}$`, "i").test(token),
  );

  if (make_index === -1) {
    return { vehicle_make: make, vehicle_model: null };
  }

  const candidate_model = tokens.slice(make_index + 1, make_index + 4).join(" ").trim();
  const vehicle_model = candidate_model
    .replace(/\b(19|20)\d{2}\b/g, "")
    .replace(/\$[\d,]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    vehicle_make: make,
    vehicle_model: vehicle_model || null,
  };
}

function extract_vehicle_data_from_json_ld(html: string) {
  const flattened = extract_json_ld_objects(html).flatMap((entry) => flatten_json_ld(entry));

  for (const entry of flattened) {
    const type_value = entry["@type"];
    const type_text = Array.isArray(type_value) ? type_value.join(" ") : String(type_value ?? "");

    if (!/vehicle|product/i.test(type_text)) {
      continue;
    }

    const brand = entry.brand;
    const brand_name =
      brand && typeof brand === "object" && "name" in brand
        ? String((brand as Record<string, JsonValue>).name ?? "")
        : String(brand ?? "");

    const title = String(entry.name ?? "");
    const description = String(entry.description ?? "");
    const model = String(entry.model ?? "");
    const mileage_value =
      entry.mileageFromOdometer && typeof entry.mileageFromOdometer === "object"
        ? (entry.mileageFromOdometer as Record<string, JsonValue>).value
        : entry.mileageFromOdometer;
    const offers =
      entry.offers && typeof entry.offers === "object"
        ? (entry.offers as Record<string, JsonValue>)
        : null;

    return {
      title,
      description,
      vehicle_make: brand_name || null,
      vehicle_model: model || null,
      vehicle_year: coerce_number(String(entry.vehicleModelDate ?? entry.releaseDate ?? "")),
      vehicle_mileage: coerce_number(
        typeof mileage_value === "number" ? mileage_value : String(mileage_value ?? ""),
      ),
      vehicle_price_listed: coerce_number(
        typeof offers?.price === "number" ? offers.price : String(offers?.price ?? ""),
      ),
      vehicle_rego:
        typeof entry.vehicleRegistrationPlate === "string"
          ? entry.vehicleRegistrationPlate
          : null,
      vehicle_vin:
        typeof entry.vehicleIdentificationNumber === "string"
          ? entry.vehicleIdentificationNumber
          : null,
    };
  }

  return null;
}

export function build_fallback_listing(listing_url: string): ScrapedListing {
  const url = new URL(listing_url);
  const path_summary = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() ?? "vehicle listing")
    .replace(/[-_]+/g, " ");
  const combined_text = `${url.hostname} ${path_summary}`;
  const make_and_model = extract_make_and_model(combined_text);

  return {
    listing_url,
    title: path_summary,
    description: `Listing snapshot unavailable. Review ${url.hostname} directly before making a purchase decision.`,
    seller_name: null,
    vehicle_make: make_and_model.vehicle_make,
    vehicle_model: make_and_model.vehicle_model,
    vehicle_year: extract_year(combined_text),
    vehicle_mileage: extract_mileage(combined_text),
    vehicle_price_listed: extract_price(combined_text),
    vehicle_rego: null,
    vehicle_vin: null,
    source_name: url.hostname,
    fetched_at: to_sqlite_datetime(),
  };
}

export async function scrape_listing(raw_listing_url: string): Promise<ScrapedListing> {
  const listing_url = raw_listing_url.trim();
  const url = new URL(listing_url);

  if (!/^https?:$/i.test(url.protocol)) {
    throw new Error("Only HTTP and HTTPS listing URLs are supported.");
  }

  try {
    const response = await fetch(listing_url, {
      cache: "no-store",
      headers: {
        "accept-language": "en-AU,en;q=0.9",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
      },
    });

    if (!response.ok) {
      return build_fallback_listing(listing_url);
    }

    const html = await response.text();
    const title = extract_meta(html, "og:title") || extract_title(html);
    const description =
      extract_meta(html, "og:description") ||
      extract_meta(html, "description") ||
      strip_html(html).slice(0, 1200);
    const json_ld_data = extract_vehicle_data_from_json_ld(html);
    const make_and_model = extract_make_and_model(`${title} ${description}`);

    return {
      listing_url,
      title: title || "Vehicle listing",
      description,
      seller_name: extract_meta(html, "author") || null,
      vehicle_make: json_ld_data?.vehicle_make || make_and_model.vehicle_make,
      vehicle_model: json_ld_data?.vehicle_model || make_and_model.vehicle_model,
      vehicle_year: json_ld_data?.vehicle_year ?? extract_year(`${title} ${description}`),
      vehicle_mileage:
        json_ld_data?.vehicle_mileage ?? extract_mileage(`${title} ${description}`),
      vehicle_price_listed:
        json_ld_data?.vehicle_price_listed ?? extract_price(`${title} ${description}`),
      vehicle_rego: json_ld_data?.vehicle_rego ?? null,
      vehicle_vin: json_ld_data?.vehicle_vin ?? null,
      source_name: extract_meta(html, "og:site_name") || url.hostname,
      fetched_at: to_sqlite_datetime(),
    };
  } catch {
    return build_fallback_listing(listing_url);
  }
}
