"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, ShieldCheck, Timer, FileText } from "lucide-react";

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Official PPSR data" },
  { icon: Timer, label: "Results in minutes" },
  { icon: FileText, label: "Plain English report" },
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
        setError(data.error ?? "Could not open PPSR checkout. Try again.");
        return;
      }

      window.location.href = data.checkout_url;
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
            PPSR check
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-black tracking-[-0.06em] text-gray-900 sm:text-6xl">
            Check if a car has finance, theft, or write-off history.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-gray-500">
            Get the official status before you send a deposit or transfer funds.
          </p>

          <div className="mt-8 inline-flex items-end gap-2 rounded-[1.75rem] bg-white px-5 py-4 shadow-sm">
            <span className="text-4xl font-black tracking-[-0.05em] text-gray-900">
              $4.95
            </span>
            <span className="pb-1 text-sm font-bold text-gray-500">
              per check
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <label className="grid gap-2" htmlFor="ppsr-identifier">
            <span className="text-sm font-bold text-gray-900">VIN or Rego</span>
            <input
              id="ppsr-identifier"
              type="text"
              value={vehicleIdentifier}
              onChange={(event) =>
                setVehicleIdentifier(event.target.value.toUpperCase())
              }
              placeholder="ABC123 or JM0DK2W7601234567"
              className="rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm uppercase text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
            />
          </label>

          <label className="mt-4 grid gap-2" htmlFor="ppsr-email">
            <span className="text-sm font-bold text-gray-900">Email</span>
            <input
              id="ppsr-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
            />
          </label>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading || !vehicleIdentifier.trim() || !email.trim()}
            className="mt-6 inline-flex min-h-[3.75rem] w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 text-base font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Opening checkout...
              </>
            ) : (
              "Run PPSR Check"
            )}
          </button>

          <div className="mt-6 grid gap-3">
            {TRUST_BADGES.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-4"
                >
                  <Icon className="h-5 w-5 text-teal-600" aria-hidden="true" />
                  <span className="text-sm font-bold text-gray-900">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-start gap-2 rounded-2xl bg-teal-50 px-4 py-4 text-sm leading-6 text-teal-800">
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span>
              Delivered after checkout using the existing Stripe and report flow.
            </span>
          </div>
        </form>
      </section>
    </div>
  );
}
