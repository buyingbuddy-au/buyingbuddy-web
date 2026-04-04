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
  paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)",
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
    description: "Nothing obvious here.",
    tone: "border-teal-200 bg-teal-50 text-teal-900 shadow-[0_0_0_2px_rgba(13,148,136,0.2)]",
  },
  {
    value: "amber",
    label: "Concern",
    description: "Something to dig into.",
    tone: "border-amber-200 bg-amber-50 text-amber-900 shadow-[0_0_0_2px_rgba(245,158,11,0.2)]",
  },
  {
    value: "red",
    label: "Problem",
    description: "This can kill the deal.",
    tone: "border-rose-200 bg-rose-50 text-rose-900 shadow-[0_0_0_2px_rgba(225,29,72,0.2)]",
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
      (checkpointState) =>
        checkpointState.flag !== null || checkpointState.note.trim().length > 0,
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

  if (!Number.isFinite(amount) || amount <= 0) {
    return "No price entered";
  }

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

  function renderTopBar() {
    const subtitle = session.stage === "intro"
      ? "20 checks, one by one. Saved locally."
      : session.stage === "results"
        ? "Inspection complete"
        : `Checkpoint ${session.currentStep + 1} of ${TOTAL_CHECKPOINTS}`;

    return (
      <header className={`${session.stage === "inspection" ? "sticky top-14 z-20 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm" : "relative bg-transparent"} px-4 pb-4 lg:top-16 transition-all duration-300`} style={safeTopStyle}>
        <div className="mx-auto max-w-3xl pt-2">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600">BuyingBuddy</p>
              <h1 className="font-display text-xl font-bold text-gray-900 mt-1">Guided Inspection</h1>
              <p className="mt-1 truncate text-sm font-medium text-gray-500">{formatVehicleLabel(session.vehicle)}</p>
            </div>
            {savedProgressExists && (
              <button onClick={startFresh} className="shrink-0 rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200">
                Reset
              </button>
            )}
          </div>
          <div className="mt-4 grid gap-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
              <span>{subtitle}</span>
              <span>{formatPrice(session.vehicle.price)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-teal-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </header>
    );
  }

  function renderIntro() {
    return (
      <section className="grid gap-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-teal-700">
            Mobile-first flow
          </div>
          <h2 className="mt-4 font-display text-3xl font-black leading-tight text-gray-900">
            Walk the car, flag what you see, and get a straight verdict.
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-600">
            Enter the car details, move through 20 practical checkpoints one at a time, and finish with a score out of 10 plus a buy, caution, or walk away call.
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-gray-700">Year</span>
              <input
                className="min-h-[3.5rem] rounded-2xl border border-gray-300 bg-white px-4 text-base text-gray-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                inputMode="numeric"
                maxLength={4}
                onChange={(e) => updateVehicleField("year", e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
                placeholder="2019"
                value={session.vehicle.year}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-gray-700">Make</span>
              <input
                className="min-h-[3.5rem] rounded-2xl border border-gray-300 bg-white px-4 text-base text-gray-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                onChange={(e) => updateVehicleField("make", e.target.value)}
                placeholder="Toyota"
                value={session.vehicle.make}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-gray-700">Model</span>
              <input
                className="min-h-[3.5rem] rounded-2xl border border-gray-300 bg-white px-4 text-base text-gray-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                onChange={(e) => updateVehicleField("model", e.target.value)}
                placeholder="Yaris"
                value={session.vehicle.model}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-gray-700">Price</span>
              <input
                className="min-h-[3.5rem] rounded-2xl border border-gray-300 bg-white px-4 text-base text-gray-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                inputMode="numeric"
                onChange={(e) => updateVehicleField("price", e.target.value.replace(/[^\d]/g, ""))}
                placeholder="18950"
                value={session.vehicle.price}
              />
            </label>
          </div>

          {entryError && <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{entryError}</div>}
          
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
      selectedFlag === "ok" ? "Marked OK. Keep moving." :
      selectedFlag === "amber" ? "Marked as a concern. Add a note to remember why." :
      selectedFlag === "red" ? "Marked as a problem. Add a note so the result screen explains why." :
      "Pick OK, Concern, or Problem to unlock the next checkpoint.";

    return (
      <section className="flex flex-col gap-6 rounded-3xl bg-white pb-8">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-teal-600">{currentCheckpoint.section}</p>
          <h2 className="mt-2 font-display text-4xl font-black leading-tight text-gray-900">{currentCheckpoint.title}</h2>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6">
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">What to check</p>
          <p className="mt-3 text-lg leading-relaxed text-gray-800 font-medium">{currentCheckpoint.instructions}</p>
        </div>

        <div className="grid gap-3">
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">Your call</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {flagOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFlag(option.value)}
                className={`min-h-[6rem] rounded-2xl border px-5 py-4 text-left transition ${
                  selectedFlag === option.value
                    ? option.tone
                    : "border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <span className="block text-xl font-black">{option.label}</span>
                <span className={`mt-1 block text-sm font-medium ${selectedFlag === option.value ? "" : "text-gray-500"}`}>
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-blue-50 px-5 py-4 text-sm font-medium text-blue-800">{helperText}</div>

        <label className="grid gap-3">
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">Add a Note (Optional)</span>
          <textarea
            className="min-h-[8rem] rounded-2xl border border-gray-300 bg-white px-5 py-4 text-base text-gray-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 shadow-sm"
            onChange={(e) => setNote(e.target.value)}
            placeholder={currentCheckpoint.notePlaceholder}
            value={currentCheckpointState.note}
          />
        </label>

        <div className="grid gap-3 pt-4 sm:grid-cols-2">
          <button
            className="min-h-[4rem] rounded-2xl border border-gray-200 bg-white px-4 text-lg font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 shadow-sm"
            disabled={session.currentStep === 0}
            onClick={goBack}
          >
            ← Back
          </button>
          <button
            className="min-h-[4rem] rounded-2xl bg-teal-600 px-4 text-lg font-bold text-white transition hover:bg-teal-700 disabled:opacity-50 shadow-md"
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
      summary.verdict === "Buy" ? "text-teal-600 bg-teal-50 border-teal-200" :
      summary.verdict === "Caution" ? "text-amber-600 bg-amber-50 border-amber-200" :
      "text-rose-600 bg-rose-50 border-rose-200";

    function handleShare() {
      const shareData = {
        type: "inspection_result",
        vehicle: formatVehicleLabel(session.vehicle),
        verdict: summary.verdict,
        score: summary.score,
        issues: totalIssues,
        savings: estimatedSavings,
        flags: summary.flaggedItems.map(f => ({ title: f.checkpoint.title, note: f.note, severity: f.severity }))
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
        <div className={`rounded-3xl border p-8 text-center shadow-sm ${riskColor}`}>
          <p className="text-xs font-black uppercase tracking-widest opacity-80">Final result</p>
          <h2 className="mt-3 font-display text-5xl font-black">{summary.verdict}</h2>
          <p className="mt-4 text-lg font-bold opacity-90">{summary.verdictDetail}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Score</p>
            <p className="mt-2 text-4xl font-black text-gray-900">{summary.score}<span className="text-xl text-gray-400">/10</span></p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Issues</p>
            <p className="mt-2 text-4xl font-black text-gray-900">{totalIssues}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
            <a href="/ppi" className="flex items-center justify-center min-h-[4rem] rounded-2xl bg-teal-600 px-4 text-lg font-bold text-white transition hover:bg-teal-700 shadow-md">
              Book a Pro PPI
            </a>
            <a href="/ppsr" className="flex items-center justify-center min-h-[4rem] rounded-2xl border border-gray-300 bg-white px-4 text-lg font-bold text-gray-900 transition hover:bg-gray-50 shadow-sm">
              Get PPSR Report
            </a>
        </div>
        
        <button
          className="w-full min-h-[4rem] rounded-2xl border border-gray-300 bg-gray-100 px-4 text-lg font-bold text-gray-700 transition hover:bg-gray-200"
          onClick={handleShare}
        >
          Share Results
        </button>

        <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-black text-gray-900">Detailed Findings</h3>
            {summary.flaggedItems.length === 0 ? (
              <div className="mt-4 rounded-2xl bg-teal-50 p-5 text-base font-bold text-teal-800">
                Every checkpoint was marked OK.
              </div>
            ) : (
              <div className="mt-4 grid gap-4">
                {summary.flaggedItems.map((item) => (
                  <div className={`rounded-2xl border p-5 ${item.severity === 'red' ? 'border-rose-200 bg-rose-50' : 'border-amber-200 bg-amber-50'}`} key={item.checkpoint.id}>
                    <p className={`font-black ${item.severity === 'red' ? 'text-rose-900' : 'text-amber-900'}`}>{item.checkpoint.title}</p>
                    <p className={`mt-2 font-medium ${item.severity === 'red' ? 'text-rose-800' : 'text-amber-800'}`}>{item.note || 'No notes provided.'}</p>
                  </div>
                ))}
              </div>
            )}
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-[100svh] bg-white text-gray-900 font-sans">
      {renderTopBar()}
      <main className="mx-auto max-w-3xl px-4 pt-6 pb-12" style={safeBottomStyle}>
        {!hydrated ? (
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-8 text-center font-bold text-gray-500">Loading...</div>
        ) : session.stage === "intro" ? renderIntro() : session.stage === "results" ? renderResults() : renderInspectionStep()}
        
        {storageError && <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800 text-center">{storageError}</div>}
      </main>
    </div>
  );
}