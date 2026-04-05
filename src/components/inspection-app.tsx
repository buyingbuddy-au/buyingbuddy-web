"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  STORAGE_KEY,
  TOTAL_CHECKPOINTS,
  checkpoints,
  createEmptySession,
  getInspectionSummary,
  restoreSession,
  type Flag,
  type InspectionSession,
  type VehicleDetails,
} from "@/lib/inspection-data";

const safeTopStyle: CSSProperties = {
  paddingTop: "calc(env(safe-area-inset-top) + 0.35rem)",
};

const safeBottomStyle: CSSProperties = {
  paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)",
};

const priceFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const flagOptions: Array<{
  value: Exclude<Flag, null>;
  label: string;
  description: string;
  tone: string;
}> = [
  {
    value: "ok",
    label: "OK",
    description: "Looks fine.",
    tone: "border-teal-400/40 bg-teal-500/14 text-teal-50 shadow-[0_0_0_1px_rgba(13,148,136,0.18)]",
  },
  {
    value: "amber",
    label: "Concern",
    description: "Worth digging into.",
    tone: "border-amber-400/40 bg-amber-500/12 text-amber-50 shadow-[0_0_0_1px_rgba(251,191,36,0.16)]",
  },
  {
    value: "red",
    label: "Problem",
    description: "Could kill the deal.",
    tone: "border-rose-400/40 bg-rose-500/12 text-rose-50 shadow-[0_0_0_1px_rgba(248,113,113,0.16)]",
  },
];

function hasSavedProgress(session: InspectionSession): boolean {
  return (
    session.startedAt !== null ||
    session.vehicle.year.length > 0 ||
    session.vehicle.make.length > 0 ||
    session.vehicle.model.length > 0 ||
    session.vehicle.price.length > 0 ||
    session.checkpoints.some(
      (checkpointState) => checkpointState.flag !== null || checkpointState.note.trim().length > 0,
    )
  );
}

function formatVehicleLabel(vehicle: VehicleDetails): string {
  const label = [vehicle.year, vehicle.make, vehicle.model]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" ");

  return label || "Vehicle details pending";
}

function formatPrice(rawPrice: string): string {
  const amount = Number(rawPrice.replace(/[^\d]/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return priceFormatter.format(amount);
}

function getProgress(stage: InspectionSession["stage"], currentStep: number): number {
  if (stage === "intro") return 0;
  if (stage === "results") return 100;
  return ((currentStep + 1) / TOTAL_CHECKPOINTS) * 100;
}

export function InspectionApp() {
  const [session, setSession] = useState<InspectionSession>(createEmptySession);
  const [hydrated, setHydrated] = useState(false);
  const [entryError, setEntryError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const restored = restoreSession(raw);
      if (restored) setSession(restored);
      else window.localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setStorageError(null);
    } catch {
      setStorageError("Could not save progress to local storage. Finish the inspection before refreshing.");
    }
  }, [hydrated, session]);

  const summary = useMemo(() => getInspectionSummary(session), [session]);
  const savedProgressExists = hasSavedProgress(session);
  const currentCheckpoint = checkpoints[session.currentStep];
  const currentCheckpointState = session.checkpoints[session.currentStep];
  const canAdvance = currentCheckpointState.flag !== null;
  const progress = getProgress(session.stage, session.currentStep);
  const vehicleLabel = formatVehicleLabel(session.vehicle);
  const priceLabel = formatPrice(session.vehicle.price);

  function updateVehicleField(field: keyof VehicleDetails, value: string) {
    setSession((current) => ({
      ...current,
      vehicle: { ...current.vehicle, [field]: value },
    }));
  }

  function updateCheckpoint(
    updater: (cp: InspectionSession["checkpoints"][number]) => InspectionSession["checkpoints"][number],
  ) {
    setSession((current) => {
      const nextCheckpoints = current.checkpoints.slice();
      nextCheckpoints[current.currentStep] = updater(nextCheckpoints[current.currentStep]);
      return { ...current, checkpoints: nextCheckpoints };
    });
  }

  function setFlag(flag: Exclude<Flag, null>) {
    updateCheckpoint((cp) => ({ ...cp, flag }));
  }

  function setNote(note: string) {
    updateCheckpoint((cp) => ({ ...cp, note }));
  }

  function startInspection() {
    const year = session.vehicle.year.trim();
    const make = session.vehicle.make.trim();
    const model = session.vehicle.model.trim();
    const price = session.vehicle.price.replace(/[^\d]/g, "");

    if (!/^\d{4}$/.test(year)) {
      setEntryError("Enter a valid 4-digit year.");
      return;
    }
    if (!make || !model) {
      setEntryError("Enter the make and model before you start.");
      return;
    }
    if (!price) {
      setEntryError("Enter the price before you start.");
      return;
    }

    setEntryError(null);
    setSession((current) => ({
      ...current,
      stage: "inspection",
      startedAt: current.startedAt ?? new Date().toISOString(),
      currentStep: Math.max(0, Math.min(TOTAL_CHECKPOINTS - 1, current.currentStep)),
      vehicle: { ...current.vehicle, year, make, model, price },
    }));
  }

  function goToStep(nextStep: number) {
    setSession((current) => ({
      ...current,
      stage: "inspection",
      currentStep: Math.max(0, Math.min(TOTAL_CHECKPOINTS - 1, nextStep)),
    }));
  }

  function goBack() {
    if (session.currentStep > 0) goToStep(session.currentStep - 1);
  }

  function goNext() {
    if (!canAdvance) return;
    if (session.currentStep === TOTAL_CHECKPOINTS - 1) {
      setSession((current) => ({ ...current, stage: "results" }));
      return;
    }
    goToStep(session.currentStep + 1);
  }

  function startFresh() {
    if (!window.confirm("Clear the saved inspection on this phone and start again?")) return;
    window.localStorage.removeItem(STORAGE_KEY);
    setEntryError(null);
    setStorageError(null);
    setSession(createEmptySession());
  }

  function renderCompactHeader() {
    if (session.stage === "intro") return null;

    return (
      <header
        className="sticky top-0 z-20 border-b border-white/8 bg-slate-950/92 px-4 pb-3 backdrop-blur-xl"
        style={safeTopStyle}
      >
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.28em] text-teal-200/75">BuyingBuddy</p>
              <p className="truncate text-sm font-semibold text-white">
                {vehicleLabel}
                {priceLabel ? <span className="text-slate-400"> · {priceLabel}</span> : null}
              </p>
            </div>
            {savedProgressExists && (
              <button
                onClick={startFresh}
                className="shrink-0 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
              >
                Start fresh
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
            <span>
              {session.stage === "results" ? "Inspection complete" : `${session.currentStep + 1} of ${TOTAL_CHECKPOINTS}`}
            </span>
            <span>{currentCheckpoint?.section ?? "Results"}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-300 via-teal-500 to-teal-400 transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>
    );
  }

  function renderIntro() {
    return (
      <section className="grid gap-5">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/68 p-6 shadow-panel">
          <div className="inline-flex rounded-full border border-teal-400/20 bg-teal-500/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-teal-200">
            Guided inspection
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
            A dead-simple buyer checklist you can actually use at the car.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Just 14 real-world checks. No mechanic theatre. No pro-level gear. Just enough to spot obvious problems before you waste money.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[#10192f]/84 p-6 shadow-panel">
          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-200">Year</span>
              <input
                className="min-h-[3.5rem] rounded-2xl border border-white/10 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
                inputMode="numeric"
                maxLength={4}
                onChange={(e) => updateVehicleField("year", e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
                placeholder="2019"
                value={session.vehicle.year}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-200">Make</span>
              <input
                className="min-h-[3.5rem] rounded-2xl border border-white/10 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
                onChange={(e) => updateVehicleField("make", e.target.value)}
                placeholder="Toyota"
                value={session.vehicle.make}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-200">Model</span>
              <input
                className="min-h-[3.5rem] rounded-2xl border border-white/10 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
                onChange={(e) => updateVehicleField("model", e.target.value)}
                placeholder="Yaris"
                value={session.vehicle.model}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-200">Price</span>
              <input
                className="min-h-[3.5rem] rounded-2xl border border-white/10 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
                inputMode="numeric"
                onChange={(e) => updateVehicleField("price", e.target.value.replace(/[^\d]/g, ""))}
                placeholder="18950"
                value={session.vehicle.price}
              />
            </label>
          </div>

          {entryError && (
            <div className="mt-4 rounded-2xl border border-rose-400/24 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {entryError}
            </div>
          )}

          <button
            className="mt-6 min-h-[4rem] w-full rounded-2xl bg-teal-600 px-5 text-lg font-bold text-white transition hover:bg-teal-700 shadow-md"
            onClick={startInspection}
          >
            Start Inspection →
          </button>
        </div>
      </section>
    );
  }

  function renderInspectionStep() {
    const selectedFlag = currentCheckpointState.flag;
    const helperText =
      selectedFlag === "ok"
        ? "Marked OK. Keep moving."
        : selectedFlag === "amber"
          ? "Marked as a concern. Add a quick note if needed."
          : selectedFlag === "red"
            ? "Marked as a problem. Add a quick note so you remember why."
            : "Pick OK, Concern, or Problem to unlock the next step.";

    return (
      <section className="flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-[#0b1326]/84 p-5 shadow-panel min-h-[calc(100svh-9rem)]">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.26em] text-slate-400">{currentCheckpoint.section}</p>
          <h2 className="mt-2 font-display text-4xl font-semibold leading-tight text-white">{currentCheckpoint.title}</h2>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/68 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">What to check</p>
          <p className="mt-3 text-lg leading-relaxed text-slate-200">{currentCheckpoint.instructions}</p>
        </div>

        <div className="grid gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Your call</p>
          <div className="grid gap-3">
            {flagOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFlag(option.value)}
                className={`min-h-[5.6rem] rounded-[1.5rem] border px-5 py-4 text-left transition ${
                  selectedFlag === option.value
                    ? option.tone
                    : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                }`}
              >
                <span className="block text-xl font-semibold">{option.label}</span>
                <span className={`mt-1 block text-sm ${selectedFlag === option.value ? "" : "text-slate-300"}`}>
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-cyan-400/18 bg-cyan-500/10 px-4 py-3 text-sm leading-6 text-cyan-100">
          {helperText}
        </div>

        <label className="grid gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Add a Note (Optional)</span>
          <textarea
            className="min-h-[7rem] rounded-[1.5rem] border border-white/10 bg-white px-5 py-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20"
            onChange={(e) => setNote(e.target.value)}
            placeholder={currentCheckpoint.notePlaceholder}
            value={currentCheckpointState.note}
          />
        </label>

        <div className="mt-auto grid gap-3 pt-2 sm:grid-cols-2">
          <button
            className="min-h-[3.75rem] rounded-2xl border border-white/12 bg-white/5 px-4 text-base font-semibold text-white transition hover:bg-white/10 disabled:opacity-45"
            disabled={session.currentStep === 0}
            onClick={goBack}
          >
            ← Back
          </button>
          <button
            className="min-h-[3.75rem] rounded-2xl bg-teal-600 px-4 text-base font-semibold text-white transition hover:bg-teal-700 disabled:opacity-45"
            disabled={!canAdvance}
            onClick={goNext}
          >
            {session.currentStep === TOTAL_CHECKPOINTS - 1 ? "Finish Inspection" : "Next Checkpoint →"}
          </button>
        </div>
      </section>
    );
  }

  function renderResults() {
    const totalIssues = summary.redCount + summary.amberCount;
    const estimatedSavings = totalIssues * 500;
    const riskColor =
      summary.verdict === "Buy" ? "text-teal-300" : summary.verdict === "Caution" ? "text-amber-400" : "text-rose-400";

    function handleShare() {
      const shareData = {
        type: "inspection_result",
        vehicle: vehicleLabel,
        verdict: summary.verdict,
        score: summary.score,
        issues: totalIssues,
        savings: estimatedSavings,
        flags: summary.flaggedItems.map((f) => ({ title: f.checkpoint.title, note: f.note, severity: f.severity })),
      };
      const encoded = btoa(JSON.stringify(shareData));
      const url = `${window.location.origin}/shared/${encoded}`;

      if (navigator.share) {
        void navigator.share({ title: "BuyingBuddy Inspection", url });
      } else {
        navigator.clipboard.writeText(url);
        alert("Link copied!");
      }
    }

    return (
      <section className="grid gap-6">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-[#0f172a] to-[#07111f] p-8 text-center shadow-panel">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.26em] text-slate-400">Final result</p>
          <h2 className={`mt-3 font-display text-5xl font-semibold ${riskColor}`}>{summary.verdict}</h2>
          <p className="mt-4 text-lg text-slate-200">{summary.verdictDetail}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-slate-400">Score</p>
            <p className="mt-2 text-4xl font-semibold text-white">{summary.score}<span className="text-xl text-slate-500">/10</span></p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-slate-400">Issues</p>
            <p className="mt-2 text-4xl font-semibold text-white">{totalIssues}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <a href="/ppi" className="flex items-center justify-center min-h-[4rem] rounded-2xl bg-teal-600 px-4 text-lg font-semibold text-white transition hover:bg-teal-700">
            Book a Pro PPI
          </a>
          <a href="/ppsr" className="flex items-center justify-center min-h-[4rem] rounded-2xl border border-white/12 bg-white/5 px-4 text-lg font-semibold text-white transition hover:bg-white/10">
            Get PPSR Report
          </a>
        </div>

        <button
          className="w-full min-h-[4rem] rounded-2xl border border-white/12 bg-white/5 px-4 text-lg font-semibold text-white transition hover:bg-white/10"
          onClick={handleShare}
        >
          Share Results
        </button>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-panel">
          <h3 className="text-2xl font-semibold text-white">Detailed Findings</h3>
          {summary.flaggedItems.length === 0 ? (
            <div className="mt-4 rounded-[1.5rem] border border-teal-400/18 bg-teal-500/10 p-5 text-base text-teal-50">
              Nothing major jumped out in the basic checklist.
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              {summary.flaggedItems.map((item) => (
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5" key={item.checkpoint.id}>
                  <p className={`font-semibold ${item.severity === "red" ? "text-rose-400" : "text-amber-400"}`}>{item.checkpoint.title}</p>
                  <p className="mt-2 text-slate-300">{item.note || "No notes provided."}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-[100svh] text-bb-ink">
      {renderCompactHeader()}
      <main className="mx-auto max-w-3xl px-4 pt-4 pb-12" style={safeBottomStyle}>
        {!hydrated ? (
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/72 p-8 text-center text-slate-300">Loading...</div>
        ) : session.stage === "intro" ? (
          renderIntro()
        ) : session.stage === "results" ? (
          renderResults()
        ) : (
          renderInspectionStep()
        )}

        {storageError && (
          <div className="mt-6 rounded-2xl border border-amber-400/18 bg-amber-500/10 p-4 text-center text-sm text-amber-50">
            {storageError}
          </div>
        )}
      </main>
    </div>
  );
}
