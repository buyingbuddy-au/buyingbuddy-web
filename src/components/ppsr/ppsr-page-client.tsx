"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Loader2,
  Lock,
  ShieldCheck,
  Timer,
  FileText,
  Car,
  DollarSign,
  Ban,
} from "lucide-react";
import {
  buildUrlWithoutSensitiveHandoffParams,
  hasSensitiveHandoffParams,
  readFunnelHandoffParams,
} from "@/lib/funnel-context";

/* ── Test-mode detection (build-time inlined) ── */
const IS_TEST_MODE =
  process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true" ||
  (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "").startsWith("pk_test_");

/* ── What's included list ── */
const INCLUDED = [
  { icon: Ban, text: "Finance owing (encumbrances)" },
  { icon: AlertTriangle, text: "Stolen vehicle check" },
  { icon: Car, text: "Written-off status" },
  { icon: FileText, text: "Plain-English summary — no jargon" },
] as const;

/* ── Trust signals ── */
const TRUST_BADGES = [
  { icon: ShieldCheck, label: "PPSR-sourced status explained plainly" },
  { icon: Timer, label: "Same business day, usually within 2 hours" },
  { icon: Lock, label: "Secure Stripe checkout" },
] as const;

const GUIDE_PREVIEW = [
  {
    icon: DollarSign,
    title: "Finance owing",
    status: "Caution before payment",
    tone: "caution",
    plain: "A PPSR security interest is registered. Treat this as money owing until the lender payout is confirmed.",
    action: "Pay the lender directly at settlement, then pay the seller any remaining balance.",
    proof: "Official certificate shows a registered security interest.",
  },
  {
    icon: Ban,
    title: "Stolen status",
    status: "No stolen record",
    tone: "clear",
    plain: "The sample certificate does not show a stolen vehicle notification.",
    action: "Still match the VIN and plate on the car before sending a deposit.",
    proof: "NEVDIS stolen section: not recorded.",
  },
  {
    icon: Car,
    title: "Write-off history",
    status: "No write-off record",
    tone: "clear",
    plain: "The sample certificate does not show a written-off vehicle notification.",
    action: "Use this as a good sign, not a replacement for inspecting the car properly.",
    proof: "NEVDIS written-off section: not recorded.",
  },
  {
    icon: FileText,
    title: "VIN and paperwork",
    status: "Verify before handover",
    tone: "neutral",
    plain: "PPSR is a point-in-time certificate. The VIN on the certificate must match the car and seller paperwork.",
    action: "Check VIN, rego, seller ID, QLD safety certificate and transfer details before settlement.",
    proof: "Search criteria: VIN / serial-number certificate.",
  },
] as const;

const GUIDE_STATUS_CARDS = [
  {
    label: "Finance found",
    tone: "caution",
    text: "Security interest registered",
  },
  {
    label: "No stolen record",
    tone: "clear",
    text: "No stolen notification shown",
  },
  {
    label: "No write-off record",
    tone: "clear",
    text: "No written-off notification shown",
  },
] as const;

const GUIDE_NEXT_STEPS = [
  "Ask the seller for a current lender payout letter.",
  "Check the payout letter matches the vehicle and VIN.",
  "Pay the lender directly at settlement where possible.",
  "Keep the PPSR certificate, payout receipt and seller receipt together.",
] as const;

export default function PpsrPageClient() {
  const searchParams = useSearchParams();
  const prefillApplied = useRef(false);
  const [vehicleIdentifier, setVehicleIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [activeGuideStep, setActiveGuideStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const activeGuide = GUIDE_PREVIEW[activeGuideStep];
  const ActiveGuideIcon = activeGuide.icon;

  useEffect(() => {
    if (prefillApplied.current) return;
    prefillApplied.current = true;

    const context = readFunnelHandoffParams(searchParams);
    if (context.identifier) {
      setVehicleIdentifier(context.identifier);
    }
    if (context.email) {
      setEmail(context.email);
    }

    if (hasSensitiveHandoffParams(searchParams)) {
      window.history.replaceState(
        window.history.state,
        "",
        buildUrlWithoutSensitiveHandoffParams(window.location.href),
      );
    }
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: "ppsr",
          vehicle_identifier: vehicleIdentifier.trim().toUpperCase(),
          email: email.trim(),
          listing_url: "",
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        checkout_url?: string;
        error?: string;
      };

      if (!response.ok || !data.ok || !data.checkout_url) {
        setError(data.error ?? "Could not open checkout. Please try again.");
        return;
      }

      window.location.href = data.checkout_url;
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-clip px-4 pb-12 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-12">
      {/* ── Test-mode banner ── */}
      {IS_TEST_MODE && (
        <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-800">
          🧪 Test mode — no real charges. Use card{" "}
          <span className="font-mono">4242 4242 4242 4242</span>
        </div>
      )}

      {/* ── Mobile: form first, value prop second ── */}
      <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start">
        {/* ── Value prop panel (appears second on mobile, first on desktop) ── */}
        <div className="order-2 rounded-[2rem] border border-gray-200 bg-gray-50 p-5 shadow-sm sm:p-8 lg:order-1">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
            PPSR Check
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-gray-950 sm:text-5xl">
            Know what you&apos;re buying before you hand over cash.
          </h1>
          <p className="mt-3 text-base leading-7 text-gray-500">
            Finance owing? Stolen? Written off? Get the official PPSR status
            before you send a deposit or sign anything.
          </p>

          {/* Price block */}
          <div className="mt-6 inline-flex items-end gap-2 rounded-2xl bg-white px-5 py-3 shadow-sm">
            <span className="text-3xl font-semibold text-gray-950">
              $4.95
            </span>
            <span className="pb-0.5 text-sm font-bold text-gray-400">
              per check
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Fixed price. No subscription or upsell hidden behind checkout.
          </p>

          {/* What's included */}
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
              What&apos;s included
            </p>
            <div className="mt-3 grid gap-2">
              {INCLUDED.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex items-center gap-3">
                    <Icon
                      className="h-4 w-4 shrink-0 text-teal-600"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Form panel (appears first on mobile) ── */}
        <form
          onSubmit={handleSubmit}
          className="order-1 min-w-0 rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm sm:p-8 lg:order-2"
        >
          <div className="mb-5 flex items-center gap-2">
            <FileSearch
              className="h-5 w-5 text-teal-600"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold text-gray-950">
              Run a PPSR check
            </span>
          </div>

          {/* VIN / Rego */}
          <label className="grid min-w-0 gap-1.5" htmlFor="ppsr-identifier">
            <span className="text-sm font-bold text-gray-900">
              VIN (best) or QLD rego
            </span>
            <input
              id="ppsr-identifier"
              type="text"
              value={vehicleIdentifier}
              onChange={(event) =>
                setVehicleIdentifier(event.target.value.toUpperCase())
              }
              placeholder="e.g. ABC123 or JM0DK2W7601234567"
              autoComplete="off"
              className="w-full min-w-0 rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-base uppercase text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
            />
            <span className="text-xs text-gray-500">
              VIN is best if you have it. QLD rego still works to start — we’ll confirm the VIN before fulfilment if needed.
            </span>
          </label>

          {/* Email */}
          <label className="mt-4 grid min-w-0 gap-1.5" htmlFor="ppsr-email">
            <span className="text-sm font-bold text-gray-900">
              Your email
            </span>
            <input
              id="ppsr-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full min-w-0 rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
            />
            <span className="text-xs text-gray-400">
              We send the report here. No spam, ever.
            </span>
          </label>

          {/* Error state */}
          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          ) : null}

          {/* Trust badges — above CTA */}
          <div className="mt-5 grid gap-2">
            {TRUST_BADGES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2.5"
                >
                  <Icon
                    className="h-4 w-4 shrink-0 text-teal-600"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-bold text-gray-600">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Primary CTA */}
          <button
            type="submit"
            disabled={loading || !vehicleIdentifier.trim() || !email.trim()}
            className="mt-5 inline-flex min-h-[3.5rem] w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 px-6 text-base font-semibold text-white shadow-md transition hover:bg-teal-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Opening checkout…
              </>
            ) : (
              <>
                <DollarSign className="h-5 w-5" aria-hidden="true" />
                Get PPSR Report — $4.95
              </>
            )}
          </button>

          {/* Post-CTA reassurance */}
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-teal-50 px-3 py-3 text-xs leading-5 text-teal-800">
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span>
              Pay securely via Stripe. Buying Buddy prepares the plain-English
              guide and emails it same business day, usually within 2 hours.
            </span>
          </div>
        </form>
      </section>

      <section className="mt-8 rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
              Customer guide preview
            </p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-gray-950 sm:text-3xl">
              You can still buy it — but only after the finance is cleared.
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              This sample shows how Buying Buddy turns a finance-hit PPSR
              certificate into a short buyer action room: status, plain-English
              meaning, proof cue and the next safe step.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {GUIDE_STATUS_CARDS.map((card) => {
                const toneClass =
                  card.tone === "caution"
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-emerald-200 bg-emerald-50 text-emerald-900";

                return (
                  <div
                    className={`rounded-2xl border px-4 py-3 ${toneClass}`}
                    key={card.label}
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.12em]">
                      {card.label}
                    </p>
                    <p className="mt-1 text-sm font-medium">{card.text}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">
                What the buyer should do next
              </p>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
                {GUIDE_NEXT_STEPS.map((step, index) => (
                  <li className="flex gap-3" key={step}>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <article className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-5 sm:p-6">
            <div className="flex flex-wrap gap-2">
              {GUIDE_PREVIEW.map((step, index) => {
                const selected = activeGuideStep === index;
                return (
                  <button
                    aria-pressed={selected}
                    className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                      selected
                        ? "border-teal-700 bg-teal-700 text-white shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-teal-200 hover:text-teal-800"
                    }`}
                    key={step.title}
                    onClick={() => setActiveGuideStep(index)}
                    type="button"
                  >
                    {step.title}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-[1.25rem] border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    activeGuide.tone === "caution"
                      ? "bg-amber-100 text-amber-800"
                      : activeGuide.tone === "clear"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <ActiveGuideIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p
                    className={`text-xs font-bold uppercase tracking-[0.14em] ${
                      activeGuide.tone === "caution"
                        ? "text-amber-700"
                        : activeGuide.tone === "clear"
                          ? "text-emerald-700"
                          : "text-slate-600"
                    }`}
                  >
                    {activeGuide.status}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-gray-950">
                    {activeGuide.title}
                  </h3>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                    Plain English
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    {activeGuide.plain}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                    Buyer action
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    {activeGuide.action}
                  </p>
                </div>
              </div>

              <p className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-xs font-medium leading-5 text-gray-600">
                <span className="font-semibold text-gray-900">Proof cue:</span>{" "}
                {activeGuide.proof}
              </p>
            </div>
          </article>
          <p className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-xs leading-5 text-gray-500 lg:col-span-2">
            Buying Buddy is not affiliated with, endorsed by, or acting for the PPSR, NEVDIS, TMR, or any government agency. PPSR results are point-in-time information; always match the VIN, seller ID, certificate and vehicle before paying.
          </p>
        </div>
      </section>
    </div>
  );
}
