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
    tone:
      "border-emerald-400/40 bg-emerald-500/14 text-emerald-50 shadow-[0_0_0_1px_rgba(16,185,129,0.18)]",
  },
  {
    value: "amber",
    label: "Concern",
    description: "Something to dig into.",
    tone:
      "border-amber-400/40 bg-amber-500/12 text-amber-50 shadow-[0_0_0_1px_rgba(251,191,36,0.16)]",
  },
  {
    value: "red",
    label: "Problem",
    description: "This can kill the deal.",
    tone:
      "border-rose-400/40 bg-rose-500/12 text-rose-50 shadow-[0_0_0_1px_rgba(248,113,113,0.16)]",
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
  if (stage === "intro") {
    return 0;
  }

  if (stage === "results") {
    return 100;
  }

  return ((currentStep + 1) / TOTAL_CHECKPOINTS) * 100;
}

function getVerdictTone(verdict: "Buy" | "Caution" | "Walk Away"): string {
  switch (verdict) {
    case "Buy":
      return "border-emerald-400/28 bg-emerald-500/14 text-emerald-50";
    case "Caution":
      return "border-amber-400/30 bg-amber-500/14 text-amber-50";
    default:
      return "border-rose-400/30 bg-rose-500/14 text-rose-50";
  }
}

function getFlagTone(flag: Exclude<Flag, null | "ok">): string {
  return flag === "red"
    ? "border-rose-400/28 bg-rose-500/10 text-rose-50"
    : "border-amber-400/28 bg-amber-500/10 text-amber-50";
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

      if (restored) {
        setSession(restored);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setStorageError(null);
    } catch {
      setStorageError(
        "Could not save progress to local storage on this phone. Finish the inspection before refreshing.",
      );
    }
  }, [hydrated, session]);

  const summary = useMemo(() => getInspectionSummary(session), [session]);
  const savedProgressExists = hasSavedProgress(session);
  const currentCheckpoint = checkpoints[session.currentStep];
  const currentCheckpointState = session.checkpoints[session.currentStep];
  const canAdvance = currentCheckpointState.flag !== null;
  const progress = getProgress(session.stage, session.currentStep);
  const inspectionComplete =
    session.checkpoints.filter((checkpointState) => checkpointState.flag !== null).length ===
    TOTAL_CHECKPOINTS;

  function updateVehicleField(field: keyof VehicleDetails, value: string) {
    setSession((current) => ({
      ...current,
      vehicle: {
        ...current.vehicle,
        [field]: value,
      },
    }));
  }

  function updateCheckpoint(
    updater: (
      checkpointState: InspectionSession["checkpoints"][number],
    ) => InspectionSession["checkpoints"][number],
  ) {
    setSession((current) => {
      const nextCheckpoints = current.checkpoints.slice();
      nextCheckpoints[current.currentStep] = updater(nextCheckpoints[current.currentStep]);

      return {
        ...current,
        checkpoints: nextCheckpoints,
      };
    });
  }

  function setFlag(flag: Exclude<Flag, null>) {
    updateCheckpoint((checkpointState) => ({
      ...checkpointState,
      flag,
    }));
  }

  function setNote(note: string) {
    updateCheckpoint((checkpointState) => ({
      ...checkpointState,
      note,
    }));
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
      vehicle: {
        ...current.vehicle,
        year,
        make,
        model,
        price,
      },
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
    if (session.currentStep === 0) {
      return;
    }

    goToStep(session.currentStep - 1);
  }

  function goNext() {
    if (!canAdvance) {
      return;
    }

    if (session.currentStep === TOTAL_CHECKPOINTS - 1) {
      setSession((current) => ({
        ...current,
        stage: "results",
      }));
      return;
    }

    goToStep(session.currentStep + 1);
  }

  function startFresh() {
    const confirmed = window.confirm(
      "Clear the saved inspection on this phone and start again?",
    );

    if (!confirmed) {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    setEntryError(null);
    setStorageError(null);
    setSession(createEmptySession());
  }

  function editVehicleDetails() {
    setEntryError(null);
    setSession((current) => ({
      ...current,
      stage: "intro",
    }));
  }

  function renderTopBar() {
    const subtitle =
      session.stage === "intro"
        ? "25 checkpoints, one screen at a time. Saved on this phone."
        : session.stage === "results"
          ? "Inspection complete"
          : `Checkpoint ${session.currentStep + 1} of ${TOTAL_CHECKPOINTS}`;

    return (
      <header className="sticky top-0 z-20 px-4 pb-4 backdrop-blur-xl" style={safeTopStyle}>
        <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-white/10 bg-slate-950/72 px-4 py-4 shadow-panel">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-emerald-300/80">
                BuyingBuddy
              </p>
              <h1 className="font-display text-lg font-semibold text-white">
                Guided Pre-Purchase Inspection
              </h1>
              <p className="mt-1 truncate text-sm text-slate-300">
                {formatVehicleLabel(session.vehicle)}
              </p>
            </div>

            {savedProgressExists ? (
              <button
                className="shrink-0 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                onClick={startFresh}
                type="button"
              >
                Start fresh
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-2">
            <div className="flex items-center justify-between gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <span>{subtitle}</span>
              <span>{formatPrice(session.vehicle.price)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400 transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>
    );
  }

  function renderIntro() {
    return (
      <section className="grid gap-5">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/68 p-6 shadow-panel">
          <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-emerald-200">
            Mobile-first flow
          </div>

          <h2 className="mt-4 font-display text-4xl font-semibold leading-none text-white">
            Walk the car, flag what you see, and get a straight verdict.
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-300">
            Enter the car details, move through 25 checkpoints one at a time, and finish with a
            score out of 10 plus a buy, caution, or walk away call.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              "25 inspection checkpoints",
              "Simple OK / Concern / Problem flags",
              "Auto-saved locally on this phone",
            ].map((item) => (
              <div
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-slate-100"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[#10192f]/84 p-6 shadow-panel">
          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-200">Year</span>
              <input
                className="min-h-[3.5rem] rounded-2xl border border-white/10 bg-slate-950/72 px-4 text-base text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                inputMode="numeric"
                maxLength={4}
                onChange={(event) =>
                  updateVehicleField("year", event.target.value.replace(/[^\d]/g, "").slice(0, 4))
                }
                placeholder="2019"
                type="text"
                value={session.vehicle.year}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-200">Make</span>
              <input
                className="min-h-[3.5rem] rounded-2xl border border-white/10 bg-slate-950/72 px-4 text-base text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                onChange={(event) => updateVehicleField("make", event.target.value)}
                placeholder="Toyota"
                type="text"
                value={session.vehicle.make}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-200">Model</span>
              <input
                className="min-h-[3.5rem] rounded-2xl border border-white/10 bg-slate-950/72 px-4 text-base text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                onChange={(event) => updateVehicleField("model", event.target.value)}
                placeholder="Yaris"
                type="text"
                value={session.vehicle.model}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-200">Price</span>
              <input
                className="min-h-[3.5rem] rounded-2xl border border-white/10 bg-slate-950/72 px-4 text-base text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                inputMode="numeric"
                onChange={(event) =>
                  updateVehicleField("price", event.target.value.replace(/[^\d]/g, ""))
                }
                placeholder="18950"
                type="text"
                value={session.vehicle.price}
              />
            </label>
          </div>

          {entryError ? (
            <div className="mt-4 rounded-2xl border border-rose-400/24 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {entryError}
            </div>
          ) : null}

          {savedProgressExists ? (
            <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm leading-6 text-cyan-100">
              Progress is saved locally on this device. If you refresh, the inspection will still
              be here.
            </div>
          ) : null}

          <button
            className="mt-5 min-h-[3.75rem] w-full rounded-2xl bg-emerald-500 px-5 text-base font-semibold text-slate-950 transition hover:bg-emerald-400"
            onClick={startInspection}
            type="button"
          >
            Start the 25-point inspection
          </button>
        </div>

        <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 text-sm leading-6 text-slate-300 shadow-panel sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              Scoring
            </p>
            <p className="mt-2">
              Start at 10. Each red flag costs 2 points. Each amber flag costs 1 point.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              Verdicts
            </p>
            <p className="mt-2">
              8 to 10 = Buy. 5 to 7 = Caution / Get PPI. 0 to 4 = Walk Away.
            </p>
          </div>
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
          ? "Marked as a concern. Add a note if it needs context."
          : selectedFlag === "red"
            ? "Marked as a problem. Add a note so the result screen explains why."
            : "Pick OK, Concern, or Problem to unlock the next checkpoint.";

    return (
      <section className="step-shell flex min-h-[calc(100svh-12rem)] flex-col rounded-[2rem] border border-white/10 bg-[#0b1326]/84 p-5 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.26em] text-slate-400">
              Checkpoint {currentCheckpoint.id}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-white">
              {currentCheckpoint.title}
            </h2>
          </div>

          <div className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100">
            {currentCheckpoint.id}/{TOTAL_CHECKPOINTS}
          </div>
        </div>

        <div className="mt-5 rounded-[1.75rem] border border-white/10 bg-slate-950/68 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
            What to check
          </p>
          <p className="mt-3 text-base leading-7 text-slate-200">
            {currentCheckpoint.instructions}
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
            Your call
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {flagOptions.map((option) => {
              const selected = selectedFlag === option.value;

              return (
                <button
                  className={`min-h-[5.5rem] rounded-[1.5rem] border px-4 py-4 text-left transition ${
                    selected
                      ? option.tone
                      : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                  }`}
                  key={option.value}
                  onClick={() => setFlag(option.value)}
                  type="button"
                >
                  <span className="block text-base font-semibold">{option.label}</span>
                  <span className="mt-1 block text-sm text-slate-300">{option.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-cyan-400/18 bg-cyan-500/10 px-4 py-3 text-sm leading-6 text-cyan-100">
          {helperText}
        </div>

        <label className="mt-5 grid gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
            Note
          </span>
          <textarea
            className="min-h-[10rem] rounded-[1.5rem] border border-white/10 bg-slate-950/72 px-4 py-4 text-base leading-7 text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
            onChange={(event) => setNote(event.target.value)}
            placeholder={currentCheckpoint.notePlaceholder}
            value={currentCheckpointState.note}
          />
        </label>

        <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2" style={safeBottomStyle}>
          <button
            className="min-h-[3.5rem] rounded-2xl border border-white/12 bg-white/5 px-4 text-base font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={session.currentStep === 0}
            onClick={goBack}
            type="button"
          >
            Back
          </button>

          <button
            className="min-h-[3.5rem] rounded-2xl bg-emerald-500 px-4 text-base font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!canAdvance}
            onClick={goNext}
            type="button"
          >
            {session.currentStep === TOTAL_CHECKPOINTS - 1 ? "Finish inspection" : "Next checkpoint"}
          </button>
        </div>
      </section>
    );
  }

  function renderResults() {
    return (
      <section className="grid gap-5">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-[#0f172a] to-[#07111f] p-6 shadow-panel">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.26em] text-slate-400">
                Final result
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-white">
                {formatVehicleLabel(session.vehicle)}
              </h2>
              <p className="mt-2 text-sm text-slate-300">{formatPrice(session.vehicle.price)}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-4 text-center">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-400">
                  Score
                </p>
                <p className="mt-2 text-5xl font-semibold text-white">{summary.score}</p>
                <p className="text-sm text-slate-300">out of 10</p>
              </div>

              <div
                className={`rounded-[1.5rem] border px-4 py-3 text-sm font-semibold ${getVerdictTone(
                  summary.verdict,
                )}`}
              >
                {summary.verdict}
              </div>
            </div>
          </div>

          <p className="mt-5 text-base leading-7 text-slate-200">{summary.verdictDetail}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[1.5rem] border border-rose-400/18 bg-rose-500/10 px-4 py-4 text-center">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-rose-100/80">
              Problem
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">{summary.redCount}</p>
          </div>

          <div className="rounded-[1.5rem] border border-amber-400/18 bg-amber-500/10 px-4 py-4 text-center">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-amber-100/80">
              Concern
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">{summary.amberCount}</p>
          </div>

          <div className="rounded-[1.5rem] border border-emerald-400/18 bg-emerald-500/10 px-4 py-4 text-center">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-emerald-100/80">
              OK
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">{summary.okCount}</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-slate-400">
                Flagged items
              </p>
              <h3 className="mt-1 text-xl font-semibold text-white">
                {summary.flaggedItems.length === 0
                  ? "No flagged items"
                  : `${summary.flaggedItems.length} checkpoints need attention`}
              </h3>
            </div>

            <div className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100">
              {inspectionComplete ? "25 of 25 checked" : "Incomplete"}
            </div>
          </div>

          {summary.flaggedItems.length === 0 ? (
            <div className="mt-4 rounded-[1.5rem] border border-emerald-400/18 bg-emerald-500/10 px-4 py-4 text-sm leading-6 text-emerald-50">
              Every checkpoint was marked OK. That does not replace a full mechanical inspection,
              but this quick walkaround did not surface obvious problems.
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {summary.flaggedItems.map((item) => (
                <div
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4"
                  key={item.checkpoint.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.checkpoint.id}. {item.checkpoint.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        {item.note || "No note added."}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getFlagTone(
                        item.severity,
                      )}`}
                    >
                      {item.label}
                    </span>
                  </div>

                  <button
                    className="mt-4 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                    onClick={() => goToStep(item.checkpoint.id - 1)}
                    type="button"
                  >
                    Review checkpoint
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <button
            className="min-h-[3.5rem] rounded-2xl border border-white/12 bg-white/5 px-4 text-base font-semibold text-white transition hover:bg-white/10"
            onClick={editVehicleDetails}
            type="button"
          >
            Edit car details
          </button>

          <button
            className="min-h-[3.5rem] rounded-2xl border border-white/12 bg-white/5 px-4 text-base font-semibold text-white transition hover:bg-white/10"
            onClick={() => goToStep(TOTAL_CHECKPOINTS - 1)}
            type="button"
          >
            Back to last step
          </button>

          <button
            className="min-h-[3.5rem] rounded-2xl bg-emerald-500 px-4 text-base font-semibold text-slate-950 transition hover:bg-emerald-400"
            onClick={startFresh}
            type="button"
          >
            New inspection
          </button>
        </div>
      </section>
    );
  }

  function renderBody() {
    if (!hydrated) {
      return (
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/72 px-6 py-8 text-center text-sm text-slate-300 shadow-panel">
          Loading saved inspection...
        </div>
      );
    }

    if (session.stage === "intro") {
      return renderIntro();
    }

    if (session.stage === "results") {
      return renderResults();
    }

    return renderInspectionStep();
  }

  return (
    <div className="min-h-[100svh] text-bb-ink">
      {renderTopBar()}

      <main className="inspection-grid px-4 pb-8" style={safeBottomStyle}>
        <div className="mx-auto flex max-w-3xl flex-col gap-5">{renderBody()}</div>

        {storageError ? (
          <div className="mx-auto mt-5 max-w-3xl rounded-[1.5rem] border border-amber-400/18 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-50">
            {storageError}
          </div>
        ) : null}
      </main>
    </div>
  );
}
