"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clipboard,
  Clock3,
  HelpCircle,
  Loader2,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { buyingBuddyEvents, trackBuyingBuddyEvent } from "@/lib/analytics-events";
import { normaliseQldRego } from "@/lib/qld-rego/normalise";
import type { QldRegoCheckResponse, QldRegoCheckSuccess } from "@/lib/qld-rego/types";

const WAIT_CARDS = [
  {
    title: "What we’re checking",
    copy: "Status, expiry, VIN, vehicle description, and whether the current purpose looks private, commercial, or dealer-related.",
  },
  {
    title: "Buyer tip",
    copy: "PRIVATE rego is useful, but it does not prove the car was never fleet, courier, rideshare, or business-used.",
  },
  {
    title: "Ask before you drive",
    copy: "Get the VIN, current odometer photo, and service history before you spend Saturday chasing the wrong car.",
  },
] as const;

function classificationStyle(result: QldRegoCheckSuccess) {
  if (result.classification === "pass") {
    return {
      icon: CheckCircle2,
      label: "Looks normal so far",
      className: "border-emerald-200 bg-emerald-50 text-emerald-900",
    };
  }
  if (result.classification === "watch") {
    return {
      icon: AlertTriangle,
      label: "Worth a closer look",
      className: "border-amber-200 bg-amber-50 text-amber-900",
    };
  }
  return {
    icon: XCircle,
    label: "Stop and verify before proceeding",
    className: "border-red-200 bg-red-50 text-red-900",
  };
}

function copySellerQuestions(result?: QldRegoCheckSuccess | null) {
  const rego = result?.data.rego ?? "the car";
  return `Hey, before I come inspect ${rego}, can you send me:\n\n1. A photo of the VIN plate\n2. Current odometer photo\n3. Service history photos\n4. Whether there is any finance owing\n5. Whether it has ever been written off, repaired after accident damage, used for rideshare/delivery, or sold through auction?`;
}

type QldRegoCheckerProps = {
  initialRego?: string;
  autoRun?: boolean;
};

export default function QldRegoChecker({ initialRego = "", autoRun = false }: QldRegoCheckerProps) {
  const [rego, setRego] = useState(() => normaliseQldRego(initialRego));
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitIndex, setWaitIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<QldRegoCheckResponse | null>(null);
  const [result, setResult] = useState<QldRegoCheckSuccess | null>(null);
  const [captureSent, setCaptureSent] = useState(false);
  const [captureError, setCaptureError] = useState("");
  const resultRef = useRef<HTMLDivElement | null>(null);
  const autoRunStarted = useRef(false);

  const normalisedRego = useMemo(() => normaliseQldRego(rego), [rego]);
  const showFallback = Boolean(error && !error.ok && error.retryable);
  const showInputError = Boolean(error && !error.ok && !error.retryable);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setInterval(() => {
      setWaitIndex((idx) => (idx + 1) % WAIT_CARDS.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  async function runLookup(regoToCheck: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    setCaptureSent(false);
    setCaptureError("");
    setWaitIndex(0);

    trackBuyingBuddyEvent(buyingBuddyEvents.regoCheckStarted, {
      state: "QLD",
      regoLength: regoToCheck.length,
    });

    try {
      const response = await fetch("/api/rego/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rego: regoToCheck, state: "QLD" }),
      });
      const data = (await response.json()) as QldRegoCheckResponse;
      if (data.ok) {
        trackBuyingBuddyEvent(buyingBuddyEvents.regoCheckSuccess, {
          state: "QLD",
          classification: data.classification,
          cached: Boolean(data.cached),
          durationMs: data.durationMs ?? 0,
        });
        setResult(data);
      } else {
        trackBuyingBuddyEvent(buyingBuddyEvents.regoCheckFailed, {
          state: "QLD",
          status: data.status,
          retryable: data.retryable,
        });
        setError(data);
      }
    } catch {
      trackBuyingBuddyEvent(buyingBuddyEvents.regoCheckFailed, {
        state: "QLD",
        status: "network_error",
        retryable: true,
      });
      setError({
        ok: false,
        status: "error",
        error: "network_error",
        userMessage: "Network error. Try again, or leave your email for the free Seller Question Script and follow-up.",
        checkedAt: new Date().toISOString(),
        retryable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initial = normaliseQldRego(initialRego);
    if (!autoRun || autoRunStarted.current || initial.length < 3) return;
    autoRunStarted.current = true;
    setRego(initial);
    void runLookup(initial);
  }, [autoRun, initialRego]);

  async function runCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runLookup(normalisedRego);
  }

  async function sendCapture() {
    setCaptureError("");
    setCaptureSent(false);
    try {
      const response = await fetch("/api/rego/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rego: normalisedRego, email, reason: error?.ok === false ? error.status : "unknown" }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setCaptureError(data.error ?? "Could not save that email. Try again.");
        return;
      }
      trackBuyingBuddyEvent(buyingBuddyEvents.regoLeadCaptured, {
        state: "QLD",
        reason: error?.ok === false ? error.status : "unknown",
      });
      setCaptureSent(true);
    } catch {
      setCaptureError("Could not save that email. Try again.");
    }
  }

  async function copyQuestions() {
    await navigator.clipboard.writeText(copySellerQuestions(result));
    trackBuyingBuddyEvent(buyingBuddyEvents.sellerQuestionsCopied, {
      state: "QLD",
      classification: result?.classification ?? "none",
    });
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const currentWait = WAIT_CARDS[waitIndex];

  return (
    <section className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-8 sm:px-6 lg:px-8" id="qld-rego-check">
      <div className="rounded-[2rem] border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-white p-5 shadow-sm sm:p-8 lg:p-10">
        <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-teal-700 shadow-sm ring-1 ring-teal-100">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Queensland rego lookup
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.07em] text-gray-900 sm:text-5xl">
              Check a QLD rego before you check the car.
            </h1>
            <p className="mt-4 text-base leading-7 text-gray-700 sm:text-lg">
              Free QLD registration details, then plain-English prompts on what to ask next. No signup for the check — just the rego and a sensible next step.
            </p>
            <div className="mt-5 grid gap-3 text-sm text-gray-700 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <Search className="mb-2 h-5 w-5 text-teal-600" />
                Free, no signup
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <HelpCircle className="mb-2 h-5 w-5 text-teal-600" />
                Shows private, business or dealer use
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <Sparkles className="mb-2 h-5 w-5 text-teal-600" />
                Gives you the next question
              </div>
            </div>
          </div>

          <form onSubmit={runCheck} className="min-w-0 rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <label htmlFor="rego" className="text-sm font-black uppercase tracking-[0.16em] text-gray-500">
              QLD rego
            </label>
            <div className="mt-3 flex min-w-0 flex-col gap-3 sm:flex-row">
              <input
                id="rego"
                value={rego}
                onChange={(event) => setRego(normaliseQldRego(event.target.value))}
                placeholder="091FC5"
                inputMode="text"
                autoCapitalize="characters"
                maxLength={7}
                className="min-h-[3.5rem] w-full min-w-0 flex-1 rounded-2xl border border-gray-300 px-4 text-xl font-black uppercase tracking-[0.12em] outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-[3.5rem] w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 text-sm font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:shrink-0"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                {loading ? "Checking" : "Check QLD rego"}
              </button>
            </div>
            <p className="mt-3 text-xs font-semibold text-gray-500">
              Queensland plates only. Spaces are fine — we clean them up before checking.
            </p>

            {showInputError && error && !error.ok ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
                {error.userMessage}
              </div>
            ) : null}
          </form>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 rounded-[1.75rem] border border-teal-200 bg-white p-5 shadow-sm sm:p-6" aria-live="polite">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-teal-600" aria-hidden="true" />
            <div>
              <p className="font-black text-gray-900">Checking with QLD Transport…</p>
              <p className="text-sm text-gray-500">Usually 2–3 seconds. Sometimes 10. Hang tight.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["Pinging QLD Transport", "Reading the rego record", "Translating the result"].map((stage, idx) => (
              <div key={stage} className={`rounded-2xl border p-3 text-sm font-bold ${idx <= waitIndex ? "border-teal-200 bg-teal-50 text-teal-900" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                {stage}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">While we wait</p>
            <h2 className="mt-2 text-xl font-black text-gray-900">{currentWait.title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-700">{currentWait.copy}</p>
          </div>
        </div>
      ) : null}

      {showFallback && error && !error.ok ? (
        <div className="mt-6 rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6" aria-live="polite">
          <div className="flex gap-3">
            <Clock3 className="mt-1 h-6 w-6 shrink-0 text-amber-700" />
            <div>
              <h2 className="text-2xl font-black tracking-[-0.03em] text-amber-950">The QLD lookup is temporarily unavailable.</h2>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                Leave your email and we’ll send the free Seller Question Script, then follow up if we can recover the lookup result.
              </p>
            </div>
          </div>
          <div className="mt-4 flex min-w-0 flex-col gap-3 sm:flex-row">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              className="min-h-[3.25rem] w-full min-w-0 flex-1 rounded-2xl border border-amber-200 bg-white px-4 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            />
            <button type="button" onClick={sendCapture} className="inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 px-5 text-sm font-black text-white hover:bg-amber-700 sm:w-auto sm:shrink-0">
              <Mail className="h-4 w-4" /> Send it to me
            </button>
          </div>
          {captureSent ? <p className="mt-3 text-sm font-bold text-amber-950">Done — we’ll send the script and follow up.</p> : null}
          {captureError ? <p className="mt-3 text-sm font-bold text-red-700">{captureError}</p> : null}
        </div>
      ) : null}

      {result ? (
        <div ref={resultRef} className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
          <ResultCard result={result} onCopy={copyQuestions} copied={copied} />
          <aside className="space-y-4">
            <div className="rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">Next smart steps</p>
              <h3 className="mt-2 text-xl font-black text-gray-900">Rego is only the first layer.</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                This result checks current QLD registration details. Before you send money, check the listing, run the PPSR, inspect the car, and keep the handover paperwork tidy.
              </p>
            </div>
            {[
              ["/check", "Check the listing — free", "Get a quick read on price, red flags, and seller questions."],
              ["/ppsr", "Run PPSR — $4.95", "Check finance owing, stolen status, and written-off history before deposit."],
              ["/inspect", "Inspect the car — free", "Use the checklist beside the car before you fall for the photos."],
              ["/contract-pack", "Sort the paperwork — free", "Get the QLD contract, receipt, condition report, and transfer guide."],
              ["/deal", "Open Deal Pack — $9.99", "Bundle PPSR, paperwork, and a guided handover record in one place."],
            ].map(([href, title, copy]) => (
              <Link key={href} href={href} className="block rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md">
                <p className="text-sm font-black text-gray-900">{title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">{copy}</p>
              </Link>
            ))}
          </aside>
        </div>
      ) : null}
    </section>
  );
}

function ResultCard({ result, onCopy, copied }: { result: QldRegoCheckSuccess; onCopy: () => void; copied: boolean }) {
  const style = classificationStyle(result);
  const Icon = style.icon;

  return (
    <article className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className={`flex items-start gap-3 rounded-2xl border p-4 ${style.className}`}>
        <Icon className="mt-0.5 h-6 w-6 shrink-0" />
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em]">{style.label}</p>
          <p className="mt-1 text-sm leading-6">{result.education.headline}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label="Rego" value={result.data.rego} strong />
        <Field label="Status" value={result.data.registrationStatus ?? "Unknown"} />
        <Field label="Expiry" value={result.data.expiry ?? "Unknown"} />
        <Field label="Purpose/type" value={result.data.purpose ?? "Unknown"} />
        <Field label="Vehicle" value={result.data.description ?? "Unknown"} wide />
        <Field label="VIN" value={result.data.vin ?? "Not returned"} wide mono />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-black text-gray-900">What this means</h3>
        <p className="mt-2 text-sm leading-6 text-gray-700">{result.education.whatItMeans}</p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 p-5">
          <h3 className="text-base font-black text-gray-900">What to ask the seller</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
            {result.education.askSeller.map((item) => <li key={item}>• {item}</li>)}
          </ul>
          <button type="button" onClick={onCopy} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-xs font-black text-gray-800 hover:border-teal-300 hover:text-teal-700">
            <Clipboard className="h-4 w-4" /> {copied ? "Copied" : "Copy seller questions"}
          </button>
        </div>
        <div className="rounded-2xl border border-gray-200 p-5">
          <h3 className="text-base font-black text-gray-900">Common mistake</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
            {result.education.commonMistakes.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </div>
      </div>

      <p className="mt-5 text-xs font-semibold text-gray-500">
        Source: QLD Transport check-rego · Checked {new Date(result.checkedAt).toLocaleString("en-AU")} · Took {(result.durationMs / 1000).toFixed(1)}s{result.cached ? " · cached" : ""}
      </p>
    </article>
  );
}

function Field({ label, value, strong = false, wide = false, mono = false }: { label: string; value: string; strong?: boolean; wide?: boolean; mono?: boolean }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-gray-50 p-4 ${wide ? "sm:col-span-2" : ""}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-500">{label}</p>
      <p className={`mt-1 break-words text-sm text-gray-900 ${strong ? "text-xl font-black tracking-[0.08em]" : "font-bold"} ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
