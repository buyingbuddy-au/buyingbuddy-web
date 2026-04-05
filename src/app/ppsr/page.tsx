"use client";

import { useState, type FormEvent } from "react";
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
  { icon: ShieldCheck, label: "Official PPSR data source" },
  { icon: Timer, label: "Report delivered in under 2 hours" },
  { icon: Lock, label: "Secure Stripe checkout" },
] as const;

export default function PpsrPage() {
  const [vehicleIdentifier, setVehicleIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-12">
      {/* ── Test-mode banner ── */}
      {IS_TEST_MODE && (
        <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-800">
          🧪 Test mode — no real charges. Use card{" "}
          <span className="font-mono">4242 4242 4242 4242</span>
        </div>
      )}

      {/* ── Mobile: form first, value prop second ── */}
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        {/* ── Value prop panel (appears second on mobile, first on desktop) ── */}
        <div className="order-2 rounded-[2rem] border border-gray-200 bg-gray-50 p-5 shadow-sm sm:p-8 lg:order-1">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
            PPSR Check
          </p>
          <h1 className="mt-3 text-3xl font-black leading-[1.1] tracking-[-0.04em] text-gray-900 sm:text-5xl">
            Know what you&apos;re buying before you hand over cash.
          </h1>
          <p className="mt-3 text-base leading-7 text-gray-500">
            Finance owing? Stolen? Written off? Get the official PPSR status
            before you send a deposit or sign anything.
          </p>

          {/* Price block */}
          <div className="mt-6 inline-flex items-end gap-2 rounded-2xl bg-white px-5 py-3 shadow-sm">
            <span className="text-3xl font-black tracking-[-0.04em] text-gray-900">
              $4.95
            </span>
            <span className="pb-0.5 text-sm font-bold text-gray-400">
              per check
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Dealers charge $30–$50 for the same data.
          </p>

          {/* What's included */}
          <div className="mt-6">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">
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
          className="order-1 rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm sm:p-8 lg:order-2"
        >
          <div className="mb-5 flex items-center gap-2">
            <FileSearch
              className="h-5 w-5 text-teal-600"
              aria-hidden="true"
            />
            <span className="text-sm font-black text-gray-900">
              Run a PPSR check
            </span>
          </div>

          {/* VIN / Rego */}
          <label className="grid gap-1.5" htmlFor="ppsr-identifier">
            <span className="text-sm font-bold text-gray-900">
              VIN or Rego
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
              className="rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-base uppercase text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
            />
            <span className="text-xs text-gray-400">
              VIN is on the compliance plate or driver&apos;s door jamb
            </span>
          </label>

          {/* Email */}
          <label className="mt-4 grid gap-1.5" htmlFor="ppsr-email">
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
              className="rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
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
            className="mt-5 inline-flex min-h-[3.5rem] w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 text-base font-black text-white shadow-md transition hover:bg-teal-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
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
              Pay securely via Stripe. Your report is prepared by a licensed
              dealer and emailed within 2 hours.
            </span>
          </div>
        </form>
      </section>
    </div>
  );
}
