"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import type { FreeCheckApiResponse } from "@/lib/types";

type SecondOpinionResponse =
  | ({ ok: true; negotiation_script?: string | null } & FreeCheckApiResponse)
  | { ok: false; error?: string };

export function SecondOpinionForm() {
  const [listingUrl, setListingUrl] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<
    ({ negotiation_script?: string | null } & FreeCheckApiResponse) | null
  >(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!listingUrl.trim() || !email.trim()) {
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_url: listingUrl.trim(),
          email: email.trim(),
        }),
      });

      const data = (await response.json()) as SecondOpinionResponse;

      if (!response.ok || !data.ok) {
        setError(
          "error" in data && data.error
            ? data.error
            : "Could not check that listing. Try again.",
        );
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="card p-8">
      <div className="mb-8 text-center">
        <div className="mx-auto inline-flex rounded-2xl bg-lime-500 p-4">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h2 className="mt-4 text-2xl font-black text-navy-700">Share the listing</h2>
        <p className="mt-2 text-sm leading-7 text-gray-600">
          We'll run the existing free listing-check engine and show you the quick verdict here.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-bold text-navy-700" htmlFor="second-opinion-url">
            Car listing URL
          </label>
          <input
            id="second-opinion-url"
            type="url"
            required
            value={listingUrl}
            onChange={(event) => setListingUrl(event.target.value)}
            placeholder="https://facebook.com/marketplace/item/..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-lime-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-navy-700" htmlFor="second-opinion-email">
            Email address
          </label>
          <input
            id="second-opinion-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-lime-500"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex w-full items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Checking...
            </>
          ) : (
            "Get My Second Opinion"
          )}
        </button>
      </form>

      {result && (
        <div className="mt-8 rounded-2xl border border-lime-500/25 bg-lime-500/5 p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-500">
            Snapshot Ready
          </p>
          <h3 className="mt-3 text-2xl font-black text-navy-700">{result.listing_title}</h3>
          <p className="mt-4 text-sm leading-7 text-gray-700">{result.verdict}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-white p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-500">
                Market estimate
              </p>
              <p className="mt-2 text-lg font-black text-navy-700">
                {result.market_value_estimate}
              </p>
            </div>
            <div className="rounded-xl bg-white p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-500">
                Listing age
              </p>
              <p className="mt-2 text-lg font-black text-navy-700">
                {result.days_listed > 0 ? `${result.days_listed} days listed` : "Fresh or unknown"}
              </p>
            </div>
          </div>

          {result.red_flags.length > 0 && (
            <div className="mt-6 rounded-xl bg-white p-4">
              <p className="text-sm font-black text-navy-700">Red flags</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
                {result.red_flags.map((flag) => (
                  <li key={flag} className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-lime-500" />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.negotiation_script && (
            <div className="mt-6 rounded-xl bg-navy-700 p-4 text-white">
              <p className="text-sm font-black text-lime-500">Opening offer strategy</p>
              <p className="mt-3 text-sm leading-7 text-white/85">
                {result.negotiation_script}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
