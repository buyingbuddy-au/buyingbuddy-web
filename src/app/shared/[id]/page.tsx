import Link from "next/link";
import { CheckCircle2, Shield, Clock } from "lucide-react";

type SharedData = {
  type: string;
  created_at?: string;
  vehicle_heading?: string;
  verdict?: string;
  risk_level?: "low" | "medium" | "high";
  summary_points?: string[];
  upsell_message?: string;
  upsell_href?: string;
  upsell_cta?: string;
};

function decodeSharedData(id: string): SharedData | null {
  try {
    // Accept both standard base64 and base64url encoded payloads
    const normalized = id.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf-8");
    const parsed = JSON.parse(json) as SharedData;
    // Must have at least a type field to be a valid share payload
    if (!parsed || typeof parsed !== "object" || !parsed.type) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getRiskBadge(level: string | undefined) {
  switch (level) {
    case "low":
      return { label: "Lower risk", className: "border-teal-200 bg-teal-50 text-teal-700" };
    case "medium":
      return { label: "Proceed with caution", className: "border-amber-200 bg-amber-50 text-amber-700" };
    case "high":
      return { label: "High caution", className: "border-red-200 bg-red-50 text-red-700" };
    default:
      return null;
  }
}

export default async function SharedResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = decodeSharedData(id);

  if (!result) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 pb-12 pt-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-gray-900">This link has expired or doesn&apos;t exist.</h1>
        <Link href="/check" className="mt-6 inline-flex min-h-[3rem] rounded-2xl bg-teal-600 px-6 text-sm font-bold text-white">
          Run your own free check
        </Link>
      </div>
    );
  }

  const badge = getRiskBadge(result.risk_level);
  const vehicleHeading = result.vehicle_heading ?? "Vehicle check";
  const verdict = result.verdict ?? "Result shared from BuyingBuddy";
  const summaryPoints = result.summary_points ?? [];
  const createdDate = result.created_at ? new Date(result.created_at).toLocaleDateString("en-AU") : null;
  const upsellMessage = result.upsell_message ?? "Want the full picture before you hand over money?";
  const upsellHref = result.upsell_href ?? "/pricing";
  const upsellCta = result.upsell_cta ?? "See check options";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-teal-700">
          <Shield className="h-3.5 w-3.5" /> BuyingBuddy
        </div>

        <h1 className="mt-5 text-3xl font-black tracking-[-0.06em] text-gray-900">
          {vehicleHeading}
        </h1>

        {badge ? (
          <span className={`mt-3 inline-flex rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${badge.className}`}>
            {badge.label}
          </span>
        ) : null}

        <p className="mt-5 text-xl font-black text-gray-900">{verdict}</p>

        {summaryPoints.length > 0 ? (
          <ul className="mt-6 grid gap-3">
            {summaryPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm leading-6 text-gray-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                {point}
              </li>
            ))}
          </ul>
        ) : null}

        {createdDate ? (
          <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            Checked {createdDate}
          </div>
        ) : null}

        <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <p className="text-sm font-bold text-gray-900">{upsellMessage}</p>
          <Link
            href={upsellHref}
            className="mt-3 inline-flex min-h-[3rem] w-full items-center justify-center rounded-2xl bg-teal-600 px-6 text-sm font-bold text-white transition hover:bg-teal-700"
          >
            {upsellCta}
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link href="/check" className="text-sm font-bold text-teal-600 underline decoration-teal-600/40 underline-offset-4">
            Run your own free check →
          </Link>
        </div>
      </div>
    </div>
  );
}
