"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  FileSearch,
  Handshake,
  Info,
  Loader2,
  Shield,
  Sparkles,
  Wrench,
} from "lucide-react";

/* ── Types ── */

interface KnownIssue {
  text: string;
}

interface CheckResult {
  listing_title: string;
  market_value_estimate: string;
  days_listed: number;
  red_flags: string[];
  verdict: string;
  report?: {
    known_issues: string[];
    what_to_check: string[];
    fair_price_range: string;
    verdict: string;
  };
  negotiation_script?: string | null;
  vehicle?: {
    make?: string;
    model?: string;
    year?: number;
    rego?: string;
    asking_price?: number;
    source?: string;
  };
}

/* ── Helpers ── */

function formatKm(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-AU");
}

function parseKm(formatted: string): string {
  return formatted.replace(/[^\d]/g, "");
}

function estimateMarketRange(
  year: number,
  km: number,
  _trans: string,
): { low: number; high: number } | null {
  const age = new Date().getFullYear() - year;
  if (age < 0) return null;

  // Rough base price estimate by age (assumes ~$30k new average)
  let base = 30000;
  for (let i = 0; i < age; i++) {
    if (i === 0) base *= 0.85;
    else if (i === 1) base *= 0.88;
    else if (i < 5) base *= 0.92;
    else if (i < 10) base *= 0.95;
    else base *= 0.97;
  }

  // KM adjustment: ~15k/year average
  const avgKm = age * 15000;
  const kmDiff = km - avgKm;
  base -= (kmDiff / 10000) * 500;

  base = Math.max(base, 2000);
  const low = Math.round(base * 0.85 / 100) * 100;
  const high = Math.round(base * 1.15 / 100) * 100;
  return { low, high };
}

function getPricePosition(asking: number, low: number, high: number): { percent: number; label: string; color: string } {
  if (asking <= low) return { percent: 10, label: "Below market", color: "text-green-600" };
  if (asking >= high) {
    const over = Math.min(90, 50 + ((asking - high) / (high - low)) * 40);
    return { percent: over, label: "Above market", color: "text-red-600" };
  }
  const pct = 10 + ((asking - low) / (high - low)) * 80;
  return { percent: pct, label: "Fair range", color: "text-green-600" };
}

function getVerdictFromResult(result: CheckResult, askingPrice: number, marketRange: { low: number; high: number } | null) {
  const flags = result.red_flags.length;
  const priceHigh = marketRange ? askingPrice > marketRange.high * 1.1 : false;
  const priceWayHigh = marketRange ? askingPrice > marketRange.high * 1.3 : false;

  if (priceWayHigh || flags >= 4) {
    return { text: "Proceed with Caution", bg: "bg-red-50 border-red-200", color: "text-red-700", icon: "red" as const };
  }
  if (priceHigh || flags >= 2) {
    return { text: "Some Concerns", bg: "bg-amber-50 border-amber-200", color: "text-amber-700", icon: "amber" as const };
  }
  return { text: "Looks Good", bg: "bg-green-50 border-green-200", color: "text-green-700", icon: "green" as const };
}

function isDemoEntry(make: string, model: string, year: string, rego: string, price: string) {
  return (
    make.trim().toLowerCase() === "toyota" &&
    model.trim().toLowerCase() === "yaris" &&
    year.trim() === "2019" &&
    rego.trim().toUpperCase() === "123ABC" &&
    price.trim() === "24500"
  );
}

const CHECK_TIMEOUT_MS = 15000;

/* ── Component ── */

export default function FreeCheckForm() {
  const [listingUrl, setListingUrl] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [km, setKm] = useState("");
  const [rego, setRego] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [transmission, setTransmission] = useState("Automatic");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [knownIssues, setKnownIssues] = useState<KnownIssue[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(false);

  const resultsRef = useRef<HTMLDivElement | null>(null);

  const hasManual = Boolean(make.trim() && model.trim() && year.trim());
  const canRun = Boolean(listingUrl.trim() || hasManual);
  const requiresEmail = Boolean(listingUrl.trim());

  // Scroll to results
  useEffect(() => {
    if (result) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  // Fetch known issues when result arrives
  useEffect(() => {
    if (!result) return;
    const vehicleMake = result.vehicle?.make || make.trim();
    const vehicleModel = result.vehicle?.model || model.trim();
    const vehicleYear = result.vehicle?.year || Number(year.trim());
    if (!vehicleMake || !vehicleModel || !vehicleYear) return;

    setIssuesLoading(true);
    fetch("/api/check/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        make: vehicleMake,
        model: vehicleModel,
        year: vehicleYear,
        transmission,
      }),
    })
      .then((res) => res.json())
      .then((data: { ok?: boolean; issues?: string[] }) => {
        if (data.ok && Array.isArray(data.issues)) {
          setKnownIssues(data.issues.map((text: string) => ({ text })));
        }
      })
      .catch(() => { /* silently fail — known issues are a bonus */ })
      .finally(() => setIssuesLoading(false));
  }, [result, make, model, year, transmission]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canRun) {
      setError("Enter a listing URL or make, model, and year.");
      return;
    }
    if (hasManual && isDemoEntry(make, model, year, rego, parseKm(askingPrice))) {
      setError("Replace the demo values with the actual car details.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setKnownIssues([]);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          listing_url: listingUrl.trim() || undefined,
          email: email.trim() || undefined,
          make: make.trim() || undefined,
          model: model.trim() || undefined,
          year: year.trim() || undefined,
          rego: rego.trim() || undefined,
          asking_price: askingPrice.trim() ? parseKm(askingPrice) : undefined,
          kilometres: km.trim() ? parseKm(km) : undefined,
          transmission: transmission || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not run the check. Try again.");
        return;
      }

      setResult(data as CheckResult);

      // Persist email in session cookie for cross-feature flow
      if (email.trim()) {
        document.cookie = `bb_email=${encodeURIComponent(email.trim())};path=/;max-age=${60 * 60 * 24 * 90};SameSite=Lax`;
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("The check timed out. Try again.");
      } else {
        setError("Network error. Check your connection and try again.");
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }

  function resetForm() {
    setResult(null);
    setKnownIssues([]);
    setError("");
    setListingUrl("");
    setMake("");
    setModel("");
    setYear("");
    setKm("");
    setRego("");
    setAskingPrice("");
    setTransmission("Automatic");
  }

  // Computed values for results
  const numYear = Number(year.trim());
  const numKm = Number(parseKm(km));
  const numPrice = Number(parseKm(askingPrice));
  const marketRange = numYear && numKm ? estimateMarketRange(numYear, numKm, transmission) : null;
  const pricePos = marketRange && numPrice ? getPricePosition(numPrice, marketRange.low, marketRange.high) : null;
  const verdictBadge = result ? getVerdictFromResult(result, numPrice, marketRange) : null;
  const vehicleSubtitle = [
    year.trim(),
    make.trim(),
    model.trim(),
    km.trim() ? `${formatKm(km)} km` : null,
    transmission,
  ].filter(Boolean).join(" · ");

  /* ── Results View ── */
  if (result) {
    return (
      <div ref={resultsRef} className="mx-auto w-full max-w-3xl px-4 pb-12 pt-4 sm:px-6">
        {/* Section 1: Quick Verdict */}
        <section className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${verdictBadge?.bg}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className={`inline-flex rounded-full border px-4 py-1.5 text-sm font-bold ${verdictBadge?.bg} ${verdictBadge?.color}`}>
                {verdictBadge?.text}
              </span>
              <p className="mt-3 text-base font-bold leading-snug text-gray-900 sm:text-lg">
                {result.verdict}
              </p>
              <p className="mt-1 text-sm text-gray-500">{vehicleSubtitle}</p>
            </div>
          </div>
        </section>

        {/* Section 2: Price Analysis */}
        {marketRange && numPrice > 0 && (
          <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">Price Analysis</p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-sm text-gray-500">Asking price</p>
                <p className="text-2xl font-black text-gray-900">${numPrice.toLocaleString("en-AU")}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Market estimate</p>
                <p className="text-lg font-bold text-gray-700">
                  ${marketRange.low.toLocaleString("en-AU")} – ${marketRange.high.toLocaleString("en-AU")}
                </p>
              </div>
            </div>

            {/* Price bar */}
            {pricePos && (
              <div className="mt-4">
                <div className="relative h-3 rounded-full bg-gradient-to-r from-green-100 via-green-50 to-red-100">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full border-2 border-white bg-gray-900 shadow-md transition-all"
                    style={{ left: `${pricePos.percent}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] font-bold text-gray-400">
                  <span>Low</span>
                  <span className={`${pricePos.color} font-bold`}>{pricePos.label}</span>
                  <span>High</span>
                </div>
              </div>
            )}

            <p className="mt-3 text-xs text-gray-400">Estimated based on typical depreciation and mileage. Compare with live listings.</p>
          </section>
        )}

        {/* Section 3: Known Issues */}
        <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">
            What to watch for on a {result.listing_title}
          </p>

          {issuesLoading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
              Checking known issues...
            </div>
          ) : knownIssues.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {knownIssues.map((issue, i) => (
                <div key={i} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  <span>{issue.text}</span>
                </div>
              ))}
            </div>
          ) : result.report?.known_issues && result.report.known_issues.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {result.report.known_issues.map((issue, i) => (
                <div key={i} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">No specific issues found for this model.</p>
          )}

          {result.report?.what_to_check && result.report.what_to_check.length > 0 && (
            <>
              <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-gray-400">What to inspect</p>
              <div className="mt-3 grid gap-2">
                {result.report.what_to_check.map((item, i) => (
                  <div key={i} className="flex gap-3 text-sm leading-6 text-gray-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Red flags (if any) */}
        {result.red_flags.length > 0 && (
          <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-900">
              Red Flags
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                {result.red_flags.length}
              </span>
            </p>
            <div className="mt-4 grid gap-2">
              {result.red_flags.map((flag, i) => (
                <div key={i} className="flex gap-3 rounded-xl border border-red-100 bg-red-50/60 px-4 py-3 text-sm leading-6 text-gray-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Negotiation script */}
        {result.negotiation_script && (
          <section className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">Opening Offer Strategy</p>
            <p className="mt-3 text-sm leading-7 text-teal-900">{result.negotiation_script}</p>
          </section>
        )}

        {/* Section 4: Next Steps */}
        <section className="mt-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">Next steps</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Link
              href={`/ppsr${rego.trim() ? `?rego=${encodeURIComponent(rego.trim().toUpperCase())}` : ""}`}
              className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:border-teal-200 hover:shadow-md active:scale-[0.98]"
            >
              <Shield className="h-6 w-6 text-teal-600" />
              <span className="text-sm font-bold text-gray-900">Run PPSR Check</span>
              <span className="text-xs text-gray-500">$4.95</span>
            </Link>
            <Link
              href="/inspect/full"
              className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:border-teal-200 hover:shadow-md active:scale-[0.98]"
            >
              <ClipboardCheck className="h-6 w-6 text-teal-600" />
              <span className="text-sm font-bold text-gray-900">Inspection Checklist</span>
              <span className="text-xs text-gray-500">Free</span>
            </Link>
            <Link
              href={`/deal${rego.trim() ? `?rego=${encodeURIComponent(rego.trim().toUpperCase())}` : ""}`}
              className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:border-teal-200 hover:shadow-md active:scale-[0.98]"
            >
              <Handshake className="h-6 w-6 text-teal-600" />
              <span className="text-sm font-bold text-gray-900">Start Deal Room</span>
              <span className="text-xs text-gray-500">$39.95</span>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            This is a free preliminary check, not a substitute for a professional inspection.
          </p>
          <button
            type="button"
            onClick={resetForm}
            className="mt-3 text-sm font-bold text-teal-600 transition hover:text-teal-700"
          >
            Check another car
          </button>
        </div>
      </div>
    );
  }

  /* ── Form View ── */
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-12 pt-4 sm:px-6">
      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-teal-700">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Free car check
        </div>

        <h1 className="mt-4 text-2xl font-black tracking-[-0.05em] text-gray-900 sm:text-3xl">
          Paste a listing or enter the car details.
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
          Get a quick read on price, known issues, and red flags before you waste a Saturday.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          {/* Listing URL */}
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-gray-900">Listing URL</span>
            <input
              type="url"
              value={listingUrl}
              onChange={(e) => { setListingUrl(e.target.value); setError(""); }}
              placeholder="Facebook Marketplace, Carsales, or Gumtree link"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 sm:text-sm"
            />
          </label>

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.16em] text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            Or enter details manually
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Make / Model / Year */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-gray-900">Make</span>
              <input
                type="text"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="Hyundai"
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 sm:text-sm"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-gray-900">Model</span>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Kona"
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 sm:text-sm"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-gray-900">Year</span>
              <input
                type="number"
                inputMode="numeric"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2019"
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 sm:text-sm"
              />
            </label>
          </div>

          {/* Km / Rego / Price */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-gray-900">Kilometres</span>
              <input
                type="text"
                inputMode="numeric"
                value={km}
                onChange={(e) => setKm(formatKm(e.target.value))}
                placeholder="85,000"
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 sm:text-sm"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-gray-900">Rego</span>
              <input
                type="text"
                value={rego}
                onChange={(e) => setRego(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-base uppercase text-gray-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 sm:text-sm"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-gray-900">Asking Price</span>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(formatKm(e.target.value))}
                  placeholder="19,000"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-8 pr-4 text-base text-gray-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 sm:text-sm"
                />
              </div>
            </label>
          </div>

          {/* Transmission / Email */}
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-gray-900">Transmission</span>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 sm:text-sm"
              >
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-gray-900">
                Email {requiresEmail ? "(required)" : "(optional)"}
              </span>
              <input
                type="email"
                required={requiresEmail}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="you@example.com"
                autoComplete="email"
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 sm:text-sm"
              />
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !canRun || (requiresEmail && !email.trim())}
            className="min-h-[3.25rem] w-full rounded-xl bg-teal-600 px-6 text-base font-bold text-white shadow-sm transition active:scale-[0.98] hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Checking...
              </span>
            ) : (
              "Run Free Check"
            )}
          </button>
        </form>
      </section>

      {/* What you get */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">What you get</p>
        <div className="mt-4 grid gap-3">
          {[
            { icon: FileSearch, title: "Quick verdict", copy: "Price context, red flags, and whether the listing is worth your time." },
            { icon: Wrench, title: "Known issues", copy: "Common problems specific to this exact make, model, and year." },
            { icon: Shield, title: "Next steps", copy: "Links to PPSR check, inspection checklist, and deal room." },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <div className="shrink-0 rounded-lg bg-teal-50 p-2 text-teal-600">
                <item.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-500">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
