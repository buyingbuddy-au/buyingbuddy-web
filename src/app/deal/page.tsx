"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Handshake,
  Loader2,
  Lock,
  Shield,
  Users,
} from "lucide-react";
import type { DealListItem, DealStatus } from "@/lib/types";

const FEATURES = [
  { icon: Users, title: "Shared workspace", description: "Both buyer and seller fill in their details in one place." },
  { icon: FileText, title: "Timestamped record", description: "Everything is recorded with dates. Useful if anything goes sideways." },
  { icon: Lock, title: "Document uploads", description: "Licence, rego papers, safety cert — all uploaded and stored." },
  { icon: Shield, title: "Deal Summary PDF", description: "When both sides complete, get a professional Deal Record document." },
] as const;

const STATUS_LABELS: Record<DealStatus, string> = {
  draft: "Draft",
  buyer_paid: "In progress",
  buyer_complete: "Buyer done",
  seller_invited: "Seller started",
  both_complete: "Ready to finalise",
  finalised: "Finalised",
};

function getSessionEmail(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|; )bb_email=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function setSessionEmail(email: string) {
  document.cookie = `bb_email=${encodeURIComponent(email)};path=/;max-age=${60 * 60 * 24 * 90};SameSite=Lax`;
}

export default function DealLandingPageWrapper() {
  return (
    <Suspense>
      <DealLandingPage />
    </Suspense>
  );
}

function DealLandingPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [rego, setRego] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Returning user deals
  const [deals, setDeals] = useState<DealListItem[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(false);

  // Pre-fill rego from URL params (cross-feature flow from free check)
  useEffect(() => {
    const urlRego = searchParams.get("rego");
    if (urlRego) setRego(urlRego.toUpperCase());
  }, [searchParams]);

  useEffect(() => {
    const saved = getSessionEmail();
    if (saved) {
      setEmail(saved);
      setLoadingDeals(true);
      fetch("/api/deal/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: saved }),
      })
        .then((r) => r.json())
        .then((data: { ok?: boolean; deals?: DealListItem[] }) => {
          if (data.ok && data.deals) setDeals(data.deals);
        })
        .catch(() => {})
        .finally(() => setLoadingDeals(false));
    }
  }, []);

  async function handleCreateDeal(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !rego.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/deal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), rego: rego.trim() }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        room_url?: string;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not create Deal Room. Try again.");
        return;
      }

      setSessionEmail(email.trim());

      if (data.room_url) {
        window.location.href = data.room_url;
        return;
      }

      setError("Could not create Deal Room. Try again.");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        {/* Left — info */}
        <div className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Deal Room</p>
          <h1 className="mt-4 max-w-xl text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-5xl">
            Document the handover properly. Both sides. One place.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-gray-500">
            A shared digital workspace where buyer and seller record the deal details,
            upload documents, and get a timestamped Deal Record when it&apos;s done.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
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

        {/* Right — create form */}
        <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="inline-flex rounded-full bg-teal-50 p-3 text-teal-600">
            <Handshake className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-[-0.05em] text-gray-900">
            {deals.length > 0 ? "Start another deal" : "Create your Deal Room"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Enter your email and the car&apos;s rego. If you already have a deal for that rego, you&apos;ll go straight to it.
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
                className="rounded-2xl border border-gray-300 bg-white px-4 py-4 text-base sm:text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
              />
            </label>

            <label className="grid gap-2" htmlFor="deal-rego">
              <span className="text-sm font-bold text-gray-900">Vehicle rego</span>
              <input
                id="deal-rego"
                type="text"
                required
                value={rego}
                onChange={(e) => { setRego(e.target.value.toUpperCase()); setError(""); }}
                placeholder="123ABC"
                className="rounded-2xl border border-gray-300 bg-white px-4 py-4 text-base sm:text-sm font-mono uppercase text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim() || !rego.trim()}
              className="inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 text-base font-black text-white transition hover:bg-teal-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Opening room...</>
              ) : (
                "Open Deal Room"
              )}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-500">
            This Deal Record is a voluntary summary of transaction details. Not a legal contract. Not legal advice.
          </div>
        </div>
      </section>

      {/* Returning user — existing deals */}
      {(deals.length > 0 || loadingDeals) && (
        <section className="mt-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Your Deal Rooms</p>
          {loadingDeals ? (
            <div className="mt-4 flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {deals.map((deal) => {
                const label = [deal.vehicle_year, deal.vehicle_make, deal.vehicle_model].filter(Boolean).join(" ") || "Untitled";
                return (
                  <Link
                    key={deal.id}
                    href={`/deal/${deal.id}`}
                    className="group flex items-center gap-3 rounded-[1.75rem] border border-gray-200 bg-gray-50 p-4 shadow-sm transition active:scale-[0.98] hover:border-teal-200 hover:bg-white hover:shadow-md"
                  >
                    <div className="inline-flex shrink-0 rounded-[1.25rem] bg-teal-50 p-3 text-teal-600">
                      <Handshake className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-black tracking-[-0.04em] text-gray-900">{label}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                        {deal.vehicle_rego && (
                          <span className="font-mono font-bold">{deal.vehicle_rego}</span>
                        )}
                        <span className="flex items-center gap-1">
                          {deal.status === "finalised" ? (
                            <CheckCircle2 className="h-3 w-3 text-teal-600" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {STATUS_LABELS[deal.status] ?? deal.status}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:text-teal-600" />
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
