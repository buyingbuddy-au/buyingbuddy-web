"use client";

import { Suspense, useState } from "react";
import { CheckCircle2, FileText, Handshake, Loader2, Lock, Shield, Users } from "lucide-react";
import { CheckoutCancelledBanner } from "@/components/checkout-cancelled-banner";

const FEATURES = [
  { icon: Users, title: "Shared workspace", description: "Both buyer and seller fill in their details in one place." },
  { icon: FileText, title: "Timestamped record", description: "Everything is recorded with dates. Useful if anything goes sideways." },
  { icon: Lock, title: "Document uploads", description: "Licence, rego papers, safety cert — all uploaded and stored." },
  { icon: Shield, title: "Deal Summary PDF", description: "When both sides complete, get a professional Deal Record document." },
] as const;

const INCLUDED = [
  "Buyer details section (name, licence, contact)",
  "Seller details section (name, licence, bank details)",
  "Vehicle details (make, model, VIN, rego)",
  "Agreed price and payment method",
  "Conditions and handover arrangements",
  "Document uploads (licence, rego papers, safety cert)",
  "Real-time status board",
  "Timestamped Deal Summary PDF",
  "Emailed to both parties on completion",
] as const;

export default function DealLandingPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateDeal(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/deal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = (await res.json()) as { ok?: boolean; checkout_url?: string; error?: string };

      if (!res.ok || !data.ok || !data.checkout_url) {
        setError(data.error ?? "Could not create Deal Room. Try again.");
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
      <Suspense><CheckoutCancelledBanner /></Suspense>
      {/* Hero */}
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Deal Room</p>
          <h1 className="mt-4 max-w-xl text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-5xl">
            Document the handover properly. Both sides. One place.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-gray-500">
            A shared digital workspace where buyer and seller record the deal details,
            upload documents, and get a timestamped Deal Record when it&apos;s done.
          </p>

          <div className="mt-8 inline-flex items-end gap-2 rounded-[1.75rem] bg-white px-5 py-4 shadow-sm">
            <span className="text-4xl font-black tracking-[-0.05em] text-gray-900">$39.95</span>
            <span className="pb-1 text-sm font-bold text-gray-500">one-time</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl bg-white p-4 shadow-sm">
                  <Icon className="h-5 w-5 text-teal-600" />
                  <p className="mt-2 text-sm font-black text-gray-900">{f.title}</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Purchase form */}
        <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="inline-flex rounded-full bg-teal-50 p-3 text-teal-600">
            <Handshake className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-[-0.05em] text-gray-900">Create your Deal Room</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Pay once. Share the link with the seller. Both sides fill in their details.
            Get a Deal Record PDF when complete.
          </p>

          <form onSubmit={handleCreateDeal} className="mt-6 grid gap-4">
            <label className="grid gap-2" htmlFor="deal-email">
              <span className="text-sm font-bold text-gray-900">Your email</span>
              <input
                id="deal-email"
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="you@example.com"
                className="rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="inline-flex min-h-[3.75rem] w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 text-base font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Opening checkout...</>
              ) : (
                "Create Deal Room — $39.95"
              )}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">What&apos;s included</p>
            <ul className="mt-3 grid gap-2">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 rounded-2xl bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-500">
            This Deal Record is a voluntary summary of transaction details. Not a legal contract. Not legal advice.
          </div>
        </div>
      </section>
    </div>
  );
}
