"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  FileSearch,
  Loader2,
  Package,
  Shield,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import type { FreeCheckApiResponse } from "@/lib/types";

type UpgradeProduct = "ppsr" | "dealer_review" | "full_pack";

type BusyAction =
  | { type: "check" }
  | { type: "checkout"; product: UpgradeProduct }
  | null;

type FreeCheckResult = FreeCheckApiResponse & {
  negotiation_script?: string | null;
};

type FreeCheckResponse =
  | ({ ok: true } & FreeCheckResult)
  | { ok: false; error?: string };

const URL_INPUT_ID = "free-check-listing-url";
const PPSR_IDENTIFIER_ID = "ppsr-upgrade-identifier";

const UPGRADE_PRODUCTS = [
  {
    product: "ppsr" as const,
    title: "PPSR Report",
    price: "$4.95",
    summary: "Finance, stolen, and write-off history from official PPSR data.",
    buttonLabel: "Run PPSR Checkout",
    href: "/ppsr",
    icon: ShieldCheck,
  },
  {
    product: "dealer_review" as const,
    title: "Dealer Review",
    price: "$14.95",
    summary: "A sharper read on price, faults, and whether the car is worth chasing.",
    buttonLabel: "Start Dealer Review",
    href: "/pricing",
    icon: BadgeCheck,
  },
  {
    product: "full_pack" as const,
    title: "Full Pack",
    price: "$34.95",
    summary: "Dealer review plus QLD paperwork and negotiation guidance.",
    buttonLabel: "Get Full Pack",
    href: "/contract-pack",
    icon: Package,
  },
] as const;

function formatCurrency(value: string) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Not supplied";
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getListingSource(listingUrl: string) {
  try {
    return new URL(listingUrl).hostname.replace(/^www\./, "");
  } catch {
    return "Manual snapshot";
  }
}

function getRiskTone(redFlags: string[]) {
  if (redFlags.length >= 3) {
    return {
      label: "High caution",
      className: "border-red-200 bg-red-50 text-red-600",
    };
  }

  if (redFlags.length >= 1) {
    return {
      label: "Proceed carefully",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Cleaner listing",
    className: "border-green-200 bg-green-50 text-green-600",
  };
}

function getProductLabel(product: UpgradeProduct) {
  switch (product) {
    case "ppsr":
      return "PPSR Report";
    case "dealer_review":
      return "Dealer Review";
    case "full_pack":
      return "Full Pack";
  }
}

function scrollToElement(id: string) {
  const node = document.getElementById(id);
  node?.scrollIntoView({ behavior: "smooth", block: "center" });
  node?.focus();
}

export default function FreeCheckForm() {
  const [listingUrl, setListingUrl] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleRego, setVehicleRego] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [email, setEmail] = useState("");
  const [ppsrIdentifier, setPpsrIdentifier] = useState("");
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [formError, setFormError] = useState("");
  const [checkResult, setCheckResult] = useState<FreeCheckResult | null>(null);

  const resultsRef = useRef<HTMLDivElement | null>(null);
  const canRunCheck = Boolean(
    listingUrl.trim() ||
      (vehicleMake.trim() && vehicleModel.trim() && vehicleYear.trim()),
  );
  const requiresEmail = Boolean(listingUrl.trim());
  const isChecking = busyAction?.type === "check";

  const vehicleHeading =
    checkResult?.listing_title ||
    [vehicleYear.trim(), vehicleMake.trim(), vehicleModel.trim()]
      .filter(Boolean)
      .join(" ") ||
    "this car";

  const riskTone = checkResult ? getRiskTone(checkResult.red_flags) : null;
  const resolvedPpsrIdentifier =
    ppsrIdentifier.trim() ||
    vehicleRego.trim() ||
    checkResult?.vehicle?.rego?.trim() ||
    "";

  useEffect(() => {
    if (checkResult) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [checkResult]);

  async function runFreeCheck() {
    if (!canRunCheck) {
      return;
    }

    setBusyAction({ type: "check" });
    setFormError("");
    setCheckResult(null);

    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_url: listingUrl.trim() || undefined,
          email: email.trim() || undefined,
          make: vehicleMake.trim() || undefined,
          model: vehicleModel.trim() || undefined,
          year: vehicleYear.trim() || undefined,
          rego: vehicleRego.trim() || undefined,
          asking_price: askingPrice.trim() || undefined,
        }),
      });

      const data = (await response.json()) as FreeCheckResponse;

      if (!response.ok || !data.ok) {
        setFormError(
          "error" in data && data.error
            ? data.error
            : "Could not run the check. Try again.",
        );
        return;
      }

      setPpsrIdentifier(
        vehicleRego.trim() ||
          data.vehicle?.rego?.trim() ||
          ppsrIdentifier.trim() ||
          "",
      );
      setCheckResult(data);
    } catch {
      setFormError("Network error. Check your connection and try again.");
    } finally {
      setBusyAction(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runFreeCheck();
  }

  async function handleUpgrade(product: UpgradeProduct) {
    setFormError("");

    if (product === "ppsr") {
      if (!email.trim()) {
        setFormError("Enter your email first so the PPSR report can be delivered.");
        scrollToElement("check-email");
        return;
      }

      if (!resolvedPpsrIdentifier) {
        setFormError("Enter a rego or VIN in the PPSR card below.");
        scrollToElement(PPSR_IDENTIFIER_ID);
        return;
      }
    } else if (!listingUrl.trim()) {
      setFormError(
        `Paste the listing URL above first so the ${getProductLabel(
          product,
        )} checkout has the right car attached.`,
      );
      scrollToElement(URL_INPUT_ID);
      return;
    }

    setBusyAction({ type: "checkout", product });

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_url: listingUrl.trim(),
          email: email.trim() || `upgrade-${Date.now()}@buyingbuddy.local`,
          product,
          vehicle_identifier:
            product === "ppsr" ? resolvedPpsrIdentifier.toUpperCase() : undefined,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        checkout_url?: string;
        error?: string;
      };

      if (!response.ok || !data.ok || !data.checkout_url) {
        setFormError(data.error ?? "Could not open checkout. Try again.");
        return;
      }

      window.location.href = data.checkout_url;
    } catch {
      setFormError("Network error. Try again.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-teal-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Free car check
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-gray-900 sm:text-4xl">
            Paste a listing or enter the car manually.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            URL checks need an email so the report can attach to a lead. Manual
            make/model/year checks can run without one.
          </p>

          <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
            <label className="grid gap-2" htmlFor={URL_INPUT_ID}>
              <span className="text-sm font-bold text-gray-900">Listing URL</span>
              <input
                id={URL_INPUT_ID}
                type="url"
                value={listingUrl}
                onChange={(event) => {
                  setListingUrl(event.target.value);
                  setFormError("");
                }}
                placeholder="Marketplace, Carsales, or Gumtree link"
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
              />
            </label>

            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.16em] text-gray-400">
              <span className="h-px flex-1 bg-gray-200" />
              Or enter details manually
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid gap-2" htmlFor="vehicle-make">
                <span className="text-sm font-bold text-gray-900">Make</span>
                <input
                  id="vehicle-make"
                  type="text"
                  value={vehicleMake}
                  onChange={(event) => setVehicleMake(event.target.value)}
                  placeholder="Toyota"
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                />
              </label>

              <label className="grid gap-2" htmlFor="vehicle-model">
                <span className="text-sm font-bold text-gray-900">Model</span>
                <input
                  id="vehicle-model"
                  type="text"
                  value={vehicleModel}
                  onChange={(event) => setVehicleModel(event.target.value)}
                  placeholder="Yaris"
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                />
              </label>

              <label className="grid gap-2" htmlFor="vehicle-year">
                <span className="text-sm font-bold text-gray-900">Year</span>
                <input
                  id="vehicle-year"
                  type="number"
                  inputMode="numeric"
                  value={vehicleYear}
                  onChange={(event) => setVehicleYear(event.target.value)}
                  placeholder="2019"
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid gap-2" htmlFor="vehicle-rego">
                <span className="text-sm font-bold text-gray-900">Rego</span>
                <input
                  id="vehicle-rego"
                  type="text"
                  value={vehicleRego}
                  onChange={(event) => {
                    const nextValue = event.target.value.toUpperCase();
                    setVehicleRego(nextValue);
                    setPpsrIdentifier((current) => current || nextValue);
                  }}
                  placeholder="123ABC"
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm uppercase text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                />
              </label>

              <label className="grid gap-2" htmlFor="asking-price">
                <span className="text-sm font-bold text-gray-900">Asking price</span>
                <input
                  id="asking-price"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={askingPrice}
                  onChange={(event) => setAskingPrice(event.target.value)}
                  placeholder="24500"
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                />
              </label>

              <label className="grid gap-2" htmlFor="check-email">
                <span className="text-sm font-bold text-gray-900">
                  Email {requiresEmail ? "(required)" : "(optional)"}
                </span>
                <input
                  id="check-email"
                  type="email"
                  required={requiresEmail}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setFormError("");
                  }}
                  placeholder="you@example.com"
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                />
              </label>
            </div>

            {!checkResult && formError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {formError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isChecking || !canRunCheck || (requiresEmail && !email.trim())}
              className="inline-flex min-h-[3.75rem] items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 text-base font-black text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Checking...
                </>
              ) : (
                "Run Free Check"
              )}
            </button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
            What you get
          </p>
          <div className="mt-6 grid gap-4">
            {[
              {
                icon: FileSearch,
                title: "Fast listing verdict",
                copy:
                  "Get the ad-level red flags, price context, and whether the listing is worth your time.",
              },
              {
                icon: Wrench,
                title: "Inspection checklist",
                copy:
                  "If the car still stacks up, jump into the 25-point inspection flow before handover.",
              },
              {
                icon: Shield,
                title: "Upgrade path",
                copy:
                  "Escalate to PPSR, dealer review, or the QLD paperwork pack when the deal gets real.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-5"
              >
                <div className="inline-flex rounded-2xl bg-teal-50 p-3 text-teal-600">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-lg font-black tracking-[-0.04em] text-gray-900">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">{item.copy}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {checkResult ? (
        <section ref={resultsRef} className="mt-8 grid gap-6">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                Your snapshot
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-gray-900 sm:text-3xl">
                Dealer-style read on {vehicleHeading}.
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {riskTone ? (
                <span
                  className={`inline-flex rounded-full border px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] ${riskTone.className}`}
                >
                  {riskTone.label}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  const riskLevel = checkResult.red_flags.length >= 3 ? "high" : checkResult.red_flags.length >= 1 ? "medium" : "low";
                  const shareData = {
                    type: "free_check" as const,
                    created_at: new Date().toISOString(),
                    vehicle_heading: vehicleHeading,
                    verdict: checkResult.verdict,
                    risk_level: riskLevel,
                    summary_points: checkResult.red_flags.length > 0
                      ? checkResult.red_flags.slice(0, 5)
                      : ["No obvious red flags found."],
                    upsell_message: "Want the full picture before you hand over money?",
                    upsell_href: "/pricing",
                    upsell_cta: "See paid check options",
                  };
                  const jsonStr = JSON.stringify(shareData);
                  // Use base64url encoding to match /shared/[id] decoder
                  const encoded = btoa(jsonStr).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
                  const shareUrl = `${window.location.origin}/shared/${encoded}`;
                  if (navigator.share) {
                    void navigator.share({ title: `BuyingBuddy — ${vehicleHeading}`, text: checkResult.verdict, url: shareUrl });
                  } else {
                    void navigator.clipboard.writeText(shareUrl);
                    alert("Link copied!");
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-teal-50 hover:text-teal-700"
              >
                📤 Share
              </button>
            </div>
          </div>

          {formError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {formError}
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
            <article className="rounded-[2rem] bg-gradient-to-br from-teal-700 via-teal-700 to-teal-900 p-6 text-white shadow-xl sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-100/80">
                {vehicleHeading}
              </p>
              <p className="mt-4 text-2xl font-black leading-snug tracking-[-0.04em] sm:text-3xl">
                {checkResult.verdict}
              </p>
              <div className="mt-3 h-1 w-16 rounded-full bg-white/30" />

              <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
                {[
                  ["Seller asking", formatCurrency(askingPrice)],
                  ["Market estimate", checkResult.market_value_estimate],
                  [
                    "Days listed",
                    checkResult.days_listed > 0
                      ? `${checkResult.days_listed} days live`
                      : "Fresh or unknown",
                  ],
                  ["Listing source", getListingSource(listingUrl)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/10 bg-white/10 p-4 sm:rounded-[1.5rem] sm:p-5"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70 sm:text-xs">
                      {label}
                    </span>
                    <strong className="mt-2 block text-lg font-black text-white sm:mt-3 sm:text-xl">
                      {value}
                    </strong>
                  </div>
                ))}
              </div>
            </article>

            <div className="grid gap-6">
              <article className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <h3 className="text-xl font-black tracking-[-0.04em] text-gray-900">
                  Red flags
                  {checkResult.red_flags.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-black text-red-700">
                      {checkResult.red_flags.length}
                    </span>
                  )}
                </h3>

                {checkResult.red_flags.length > 0 ? (
                  <ul className="mt-5 grid gap-3">
                    {checkResult.red_flags.map((flag) => (
                      <li
                        key={flag}
                        className="flex gap-3 rounded-xl border border-red-100 bg-red-50/60 px-4 py-3 text-sm leading-6 text-gray-800"
                      >
                        <AlertTriangle
                          className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
                          aria-hidden="true"
                        />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-4 flex gap-3 rounded-xl border border-green-100 bg-green-50/60 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" aria-hidden="true" />
                    <p className="text-sm leading-6 text-gray-600">
                      No obvious ad-level red flags surfaced. That still doesn&apos;t
                      replace a PPSR check or proper inspection.
                    </p>
                  </div>
                )}
              </article>

              {checkResult.report ? (
                <article className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                  <h3 className="text-xl font-black tracking-[-0.04em] text-gray-900">
                    What to inspect next
                  </h3>

                  <ul className="mt-5 grid gap-3 text-sm leading-6 text-gray-700">
                    {checkResult.report.what_to_check.map((item) => (
                      <li key={item} className="flex gap-3">
                        <CheckCircle2
                          className="mt-0.5 h-5 w-5 shrink-0 text-teal-600"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-teal-600">
                    Known issues
                  </p>
                  <ul className="mt-4 grid gap-3 text-sm leading-6 text-gray-700">
                    {checkResult.report.known_issues.map((item) => (
                      <li key={item} className="flex gap-3">
                        <Wrench
                          className="mt-0.5 h-5 w-5 shrink-0 text-gray-900"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ) : null}
            </div>
          </div>

          {checkResult.negotiation_script ? (
            <article className="rounded-[2rem] border border-teal-200 bg-teal-50 p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">
                Opening offer strategy
              </p>
              <p className="mt-4 text-sm leading-7 text-teal-900">
                {checkResult.negotiation_script}
              </p>
            </article>
          ) : null}

          <section className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                  Want deeper checks?
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-[-0.05em] text-gray-900">
                  Add the paid layer before you send money.
                </h3>
              </div>

              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 text-sm font-black text-teal-600"
              >
                Compare plans
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {UPGRADE_PRODUCTS.map((item, index) => {
                const checkoutPending =
                  busyAction?.type === "checkout" &&
                  busyAction.product === item.product;
                const isRecommended = index === 1;

                return (
                  <article
                    key={item.product}
                    className={`rounded-[1.75rem] border bg-white p-5 shadow-sm ${
                      isRecommended
                        ? "border-teal-300 ring-2 ring-teal-100"
                        : "border-gray-200"
                    }`}
                  >
                    {isRecommended && (
                      <span className="mb-3 inline-flex rounded-full bg-teal-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                        Most popular
                      </span>
                    )}
                    <div className="inline-flex rounded-2xl bg-teal-50 p-3 text-teal-600">
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h4 className="mt-4 text-xl font-black tracking-[-0.05em] text-gray-900">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-gray-900">
                      {item.price}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-gray-500">
                      {item.summary}
                    </p>

                    {item.product === "ppsr" ? (
                      <label className="mt-5 grid gap-2" htmlFor={PPSR_IDENTIFIER_ID}>
                        <span className="text-sm font-bold text-gray-900">
                          Rego or VIN
                        </span>
                        <input
                          id={PPSR_IDENTIFIER_ID}
                          type="text"
                          value={ppsrIdentifier}
                          onChange={(event) =>
                            setPpsrIdentifier(event.target.value.toUpperCase())
                          }
                          placeholder="ABC123 or VIN"
                          className="rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm uppercase text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                        />
                      </label>
                    ) : (
                      <Link
                        href={item.href}
                        className="mt-5 inline-flex text-sm font-bold text-gray-500 underline decoration-gray-300 underline-offset-4 transition hover:text-teal-600"
                      >
                        View details
                      </Link>
                    )}

                    <button
                      type="button"
                      disabled={busyAction !== null}
                      onClick={() => void handleUpgrade(item.product)}
                      className={`mt-5 inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        isRecommended
                          ? "bg-teal-600 hover:bg-teal-700 shadow-md"
                          : "bg-gray-800 hover:bg-gray-900"
                      }`}
                    >
                      {checkoutPending ? (
                        <>
                          <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden="true"
                          />
                          Opening...
                        </>
                      ) : (
                        item.buttonLabel
                      )}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        </section>
      ) : null}
    </div>
  );
}
