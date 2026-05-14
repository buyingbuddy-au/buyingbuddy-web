"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronLeft,
  ClipboardCheck,
  FileText,
  Gauge,
  Printer,
  RotateCcw,
  Share2,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  INSPECTION_ITEMS as ALL_ITEMS,
  INSPECTION_SECTIONS as SECTIONS,
  TOTAL_INSPECTION_CHECKS as TOTAL,
  type ChecklistSection,
} from "@/lib/inspection-data";

/* ── Checklist state ── */

type Rating = "pass" | "concern" | "fail" | null;

const STORAGE_KEY = "buyingbuddy-inspection-v6";

interface ItemState {
  rating: Rating;
  note: string;
}

type InspectionState = Record<string, ItemState>;

function createEmptyState(): InspectionState {
  const state: InspectionState = {};
  for (const item of ALL_ITEMS) {
    state[item.id] = { rating: null, note: "" };
  }
  return state;
}

function getVerdict(state: InspectionState) {
  const rated = Object.values(state).filter((s) => s.rating !== null);
  if (rated.length === 0) return null;

  const fails = rated.filter((s) => s.rating === "fail").length;
  const concerns = rated.filter((s) => s.rating === "concern").length;

  if (fails >= 3) {
    return {
      text: "Walk Away",
      detail: "Too many red flags for a clean private-sale buy.",
      color: "text-red-600",
      border: "border-red-200",
      bg: "bg-red-50",
    };
  }

  if (fails >= 1 || concerns >= 3) {
    return {
      text: "Slow Down",
      detail: "Get a second opinion or a proper pre-purchase inspection before committing.",
      color: "text-amber-600",
      border: "border-amber-200",
      bg: "bg-amber-50",
    };
  }

  if (rated.length < TOTAL) {
    return {
      text: "Keep Checking",
      detail: `${TOTAL - rated.length} checks still to complete before calling it clean.`,
      color: "text-sky-600",
      border: "border-sky-200",
      bg: "bg-sky-50",
    };
  }

  return {
    text: "Looking Good",
    detail: "All visible checks look clean. Still run PPSR before money changes hands.",
    color: "text-emerald-600",
    border: "border-emerald-200",
    bg: "bg-emerald-50",
  };
}

function getSectionTally(section: ChecklistSection, state: InspectionState) {
  const passes = section.items.filter((i) => state[i.id]?.rating === "pass").length;
  const concerns = section.items.filter((i) => state[i.id]?.rating === "concern").length;
  const fails = section.items.filter((i) => state[i.id]?.rating === "fail").length;
  return { passes, concerns, fails, total: section.items.length };
}

function getSectionProgress(section: ChecklistSection, state: InspectionState) {
  const tally = getSectionTally(section, state);
  const complete = tally.passes + tally.concerns + tally.fails;
  return { ...tally, complete, pct: tally.total ? (complete / tally.total) * 100 : 0 };
}

function getSectionAnchorId(section: ChecklistSection) {
  return `section-${section.title.toLowerCase().replace(/\s+/g, "-")}`;
}

function restoreState(): { state: InspectionState; vehicle: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: createEmptyState(), vehicle: "" };
    const parsed = JSON.parse(raw) as { state?: InspectionState; vehicle?: string };
    const restored = createEmptyState();
    if (parsed.state) {
      for (const key of Object.keys(restored)) {
        if (parsed.state[key]) {
          const rating = parsed.state[key].rating;
          restored[key] = {
            rating: rating === "pass" || rating === "concern" || rating === "fail" ? rating : null,
            note: parsed.state[key].note ?? "",
          };
        }
      }
    }
    return { state: restored, vehicle: parsed.vehicle ?? "" };
  } catch {
    return { state: createEmptyState(), vehicle: "" };
  }
}

function ratingTone(rating: Rating) {
  if (rating === "pass") return "border-emerald-200 bg-emerald-50/80 ring-1 ring-emerald-100";
  if (rating === "concern") return "border-amber-200 bg-amber-50/80 ring-1 ring-amber-100";
  if (rating === "fail") return "border-red-200 bg-red-50/80 ring-1 ring-red-100";
  return "border-slate-200 bg-white hover:border-slate-300";
}

function printRatingGlyph(rating: Rating) {
  if (rating === "pass") return "✓";
  if (rating === "concern") return "!";
  if (rating === "fail") return "×";
  return "";
}

function getRatingLabel(rating: Rating) {
  if (rating === "pass") return "Pass";
  if (rating === "concern") return "Concern";
  if (rating === "fail") return "Fail";
  return "Not checked";
}

/* ── Component ── */

export function InspectionApp() {
  const [state, setState] = useState<InspectionState>(createEmptyState);
  const [vehicle, setVehicle] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [shareToast, setShareToast] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const restored = restoreState();
    setState(restored.state);
    setVehicle(restored.vehicle);
    setHydrated(true);
  }, []);

  const persist = useCallback((nextState: InspectionState, nextVehicle: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: nextState, vehicle: nextVehicle }));
      } catch {
        /* storage full — ignore */
      }
    }, 300);
  }, []);

  function setRating(id: string, rating: Rating) {
    setState((prev) => {
      const next = { ...prev, [id]: { ...prev[id], rating } };
      persist(next, vehicle);
      if (rating === "concern" || rating === "fail") {
        setExpandedNotes((s) => new Set(s).add(id));
      }
      return next;
    });
  }

  function setNote(id: string, note: string) {
    setState((prev) => {
      const next = { ...prev, [id]: { ...prev[id], note } };
      persist(next, vehicle);
      return next;
    });
  }

  function handleVehicleChange(v: string) {
    setVehicle(v);
    persist(state, v);
  }

  function toggleNote(id: string) {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function startFresh() {
    const empty = createEmptyState();
    setState(empty);
    setVehicle("");
    setExpandedNotes(new Set());
    localStorage.removeItem(STORAGE_KEY);
  }

  function handlePrint() {
    window.print();
  }

  function handleShare() {
    const parts: string[] = [];
    if (vehicle.trim()) parts.push(vehicle.trim());
    parts.push(`${rated}/${TOTAL} checked`);
    if (passes) parts.push(`${passes} pass`);
    if (concerns) parts.push(`${concerns} concern`);
    if (fails) parts.push(`${fails} fail`);
    if (verdict) parts.push(`Verdict: ${verdict.text}`);

    const shareText = `Buying Buddy inspection checklist\n${parts.join(" · ")}\n\nUse the 21-check list: ${window.location.origin}/inspect/full`;

    if (navigator.share) {
      void navigator.share({ title: "Buying Buddy inspection checklist", text: shareText });
    } else {
      void navigator.clipboard.writeText(shareText);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  }

  const rated = useMemo(() => Object.values(state).filter((s) => s.rating !== null).length, [state]);
  const passes = useMemo(() => Object.values(state).filter((s) => s.rating === "pass").length, [state]);
  const concerns = useMemo(() => Object.values(state).filter((s) => s.rating === "concern").length, [state]);
  const fails = useMemo(() => Object.values(state).filter((s) => s.rating === "fail").length, [state]);
  const verdict = useMemo(() => getVerdict(state), [state]);
  const progress = TOTAL > 0 ? (rated / TOTAL) * 100 : 0;

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-slate-500">
        Loading checklist...
      </div>
    );
  }

  return (
    <div className="inspection-print-root min-h-screen bg-slate-950 pb-24 text-slate-950 print:min-h-0 print:bg-white print:pb-0">
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          html, body { background: #fff !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .inspection-print-root { color: #0f172a !important; }
          .screen-only { display: none !important; }
          .print-shell { max-width: none !important; padding: 0 !important; }
          .print-card { border: 1px solid #cbd5e1 !important; background: #fff !important; box-shadow: none !important; }
          .print-hero { padding: 0 0 5mm 0 !important; border: 0 !important; }
          .print-section-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; column-gap: 7mm !important; row-gap: 4mm !important; }
          .print-section { break-inside: avoid; page-break-inside: avoid; margin: 0 !important; padding: 3mm !important; border-radius: 5mm !important; }
          .print-section-title { color: #0f172a !important; font-size: 10px !important; letter-spacing: .14em !important; }
          .print-section-summary { color: #475569 !important; font-size: 9px !important; line-height: 1.25 !important; }
          .print-row { min-height: 9mm !important; padding: 1.8mm 0 !important; border-bottom: 1px solid #e2e8f0 !important; }
          .print-row:last-child { border-bottom: 0 !important; }
          .print-row-label { color: #0f172a !important; font-size: 10px !important; line-height: 1.25 !important; }
          .print-note-line { display: block !important; margin-top: 1.5mm !important; border-bottom: 1px solid #cbd5e1 !important; height: 4mm !important; }
          .print-note-text { display: block !important; margin-top: 1mm !important; color: #475569 !important; font-size: 8px !important; line-height: 1.2 !important; max-height: 6mm !important; overflow: hidden !important; }
          .print-summary-strip { display: grid !important; grid-template-columns: repeat(4, minmax(0, 1fr)) !important; gap: 2mm !important; }
        }
      `}</style>

      <div className="print-shell mx-auto w-full max-w-6xl px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pt-8">
        <nav className="screen-only mb-4 flex items-center justify-between gap-3">
          <Link
            href="/inspect"
            className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" /> Inspection tools
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-400 sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> 21 practical checks
          </div>
        </nav>

        <section className="print-hero overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.28),transparent_34%),linear-gradient(135deg,#101827,#020617_65%)] p-5 shadow-2xl shadow-black/30 sm:p-8 print:bg-white">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-100 print:hidden">
                <ClipboardCheck className="h-3.5 w-3.5" /> Inspection Checklist
              </div>
              <h1 className="mt-4 max-w-3xl text-3xl font-black leading-[1.06] tracking-[-0.04em] text-white sm:text-5xl print:mt-0 print:text-2xl print:text-slate-950">
                21 checks, one buyer-side decision record.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base print:mt-1 print:text-xs print:leading-5 print:text-slate-600">
                Use it beside the car on your phone, then print or save the same completed checklist as a compact two-page PDF decision record.
              </p>
            </div>

            <div className="print-card rounded-3xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur print:p-3">
              <label htmlFor="vehicle-name" className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 print:text-slate-500">
                Vehicle / listing
              </label>
              <input
                id="vehicle-name"
                type="text"
                value={vehicle}
                onChange={(e) => handleVehicleChange(e.target.value)}
                placeholder="2019 Toyota Yaris (optional)"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-base font-bold text-white placeholder:text-slate-500 outline-none transition focus:border-teal-300/60 focus:ring-4 focus:ring-teal-300/10 print:border-slate-300 print:bg-white print:py-2 print:text-slate-950 print:placeholder:text-slate-400"
              />
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs print:hidden">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-teal-400 px-3 font-black text-slate-950 transition hover:bg-teal-300 active:scale-[0.98]"
                >
                  <Printer className="h-4 w-4" /> Print / PDF
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="relative inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 font-bold text-slate-100 transition hover:bg-white/[0.08] active:scale-[0.98]"
                >
                  <Share2 className="h-4 w-4" /> Share
                  {shareToast && (
                    <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-teal-300 px-2.5 py-1 text-[11px] font-bold text-slate-950 shadow-lg">
                      Copied
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="sticky top-14 z-20 -mx-4 border-b border-slate-200/10 bg-slate-950/92 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-16 lg:-mx-8 lg:px-8 print:static print:mx-0 print:border-0 print:bg-white print:px-0 print:py-3">
          <div className="print-summary-strip grid gap-2 sm:grid-cols-4">
            <div className="print-card rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 print:border-slate-300 print:bg-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 print:text-slate-500">Progress</p>
              <p className="mt-1 text-2xl font-black text-white print:text-lg print:text-slate-950">{rated}/{TOTAL}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10 print:hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-300 to-emerald-300 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="print-card rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 print:border-slate-300 print:bg-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-200 print:text-slate-500">Pass</p>
              <p className="mt-1 text-2xl font-black text-emerald-100 print:text-lg print:text-slate-950">{passes}</p>
            </div>
            <div className="print-card rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 print:border-slate-300 print:bg-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-100 print:text-slate-500">Concern</p>
              <p className="mt-1 text-2xl font-black text-amber-100 print:text-lg print:text-slate-950">{concerns}</p>
            </div>
            <div className="print-card rounded-2xl border border-red-300/20 bg-red-300/10 px-4 py-3 print:border-slate-300 print:bg-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-100 print:text-slate-500">Fail</p>
              <p className="mt-1 text-2xl font-black text-red-100 print:text-lg print:text-slate-950">{fails}</p>
            </div>
          </div>

          <div className="mt-3 min-h-[4.75rem] print:min-h-0">
            {verdict ? (
              <div className={`print-card rounded-2xl border px-4 py-3 ${verdict.border} ${verdict.bg} print:border-slate-300 print:bg-white`}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className={`text-sm font-black ${verdict.color} print:text-slate-950`}>Verdict: {verdict.text}</p>
                  <p className="text-xs leading-5 text-slate-600 print:text-slate-600">{verdict.detail}</p>
                </div>
              </div>
            ) : (
              <div
                aria-hidden="true"
                className="screen-only rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 opacity-0"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-black text-slate-300">Verdict: Keep Checking</p>
                  <p className="text-xs leading-5 text-slate-400">Complete a check to start the decision record.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[17rem_1fr] print:mt-3 print:block">
          <aside className="screen-only self-start rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-slate-300 shadow-xl shadow-black/20 lg:sticky lg:top-40">
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <Gauge className="h-4 w-4 text-teal-300" /> Section status
            </div>
            <div className="mt-4 grid gap-3">
              {SECTIONS.map((section) => {
                const sectionProgress = getSectionProgress(section, state);
                return (
                  <a key={section.title} href={`#${getSectionAnchorId(section)}`} className="block rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:bg-white/[0.06]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-100">{section.title}</span>
                      <span className="text-xs font-bold text-slate-400">{sectionProgress.complete}/{sectionProgress.total}</span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-teal-300" style={{ width: `${sectionProgress.pct}%` }} />
                    </div>
                  </a>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-teal-300/20 bg-teal-300/10 p-3 text-xs leading-5 text-teal-50">
              Print mode compresses these same 21 checks into a two-column A4 layout with note lines.
            </div>
          </aside>

          <main className="print-section-grid grid gap-4">
            {SECTIONS.map((section) => {
              const tally = getSectionTally(section, state);
              return (
                <section
                  id={getSectionAnchorId(section)}
                  key={section.title}
                  className="print-card print-section rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3 shadow-sm sm:p-4 print:break-inside-avoid"
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="print-section-title text-[11px] font-black uppercase tracking-[0.18em] text-teal-700">
                        {section.title}
                      </h2>
                      <p className="print-section-summary mt-1 text-xs leading-5 text-slate-500">{section.summary}</p>
                    </div>
                    <span className="screen-only rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-black text-slate-500">
                      {tally.passes + tally.concerns + tally.fails}/{tally.total}
                    </span>
                    <span className="print-section-tally hidden rounded-full border border-slate-300 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-slate-600 print:inline-flex">
                      Section tally: {tally.passes + tally.concerns + tally.fails}/{tally.total}
                    </span>
                  </div>

                  <div className="grid gap-2 print:block">
                    {section.items.map((item, itemIndex) => {
                      const itemState = state[item.id];
                      const isNoteOpen = expandedNotes.has(item.id);
                      const absoluteIndex = ALL_ITEMS.findIndex((candidate) => candidate.id === item.id) + 1;

                      return (
                        <div key={item.id} className={`print-row rounded-2xl border px-3 py-3 transition-colors print:rounded-none print:border-0 print:px-0 ${ratingTone(itemState.rating)}`}>
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-black text-white print:h-5 print:w-5 print:rounded-sm print:border print:border-slate-400 print:bg-white print:text-[10px] print:text-slate-950">
                              <span className="screen-only">{absoluteIndex}</span>
                              <span className="hidden print:inline">{printRatingGlyph(itemState.rating)}</span>
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                <span className="print-row-label text-sm font-bold leading-snug text-slate-900">
                                  {item.label}
                                </span>
                                <span className="screen-only text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                  {String(itemIndex + 1).padStart(2, "0")} / {section.items.length}
                                </span>
                              </div>
                              {itemState.note && (
                                <p className="mt-1 text-xs leading-5 text-slate-500 print:hidden">{itemState.note}</p>
                              )}
                            </div>

                            <div className="screen-only flex shrink-0 gap-1">
                              <button
                                type="button"
                                onClick={() => setRating(item.id, itemState.rating === "pass" ? null : "pass")}
                                className={`flex h-9 w-9 items-center justify-center rounded-xl transition active:scale-95 ${
                                  itemState.rating === "pass"
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "bg-white text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                                }`}
                                aria-label={`${item.label}: pass`}
                                aria-pressed={itemState.rating === "pass"}
                                title="Pass"
                              >
                                <Check className="h-4 w-4" strokeWidth={3} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setRating(item.id, itemState.rating === "concern" ? null : "concern")}
                                className={`flex h-9 w-9 items-center justify-center rounded-xl transition active:scale-95 ${
                                  itemState.rating === "concern"
                                    ? "bg-amber-500 text-white shadow-sm"
                                    : "bg-white text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                                }`}
                                aria-label={`${item.label}: concern`}
                                aria-pressed={itemState.rating === "concern"}
                                title="Concern"
                              >
                                <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setRating(item.id, itemState.rating === "fail" ? null : "fail")}
                                className={`flex h-9 w-9 items-center justify-center rounded-xl transition active:scale-95 ${
                                  itemState.rating === "fail"
                                    ? "bg-red-600 text-white shadow-sm"
                                    : "bg-white text-slate-400 hover:bg-red-50 hover:text-red-600"
                                }`}
                                aria-label={`${item.label}: fail`}
                                aria-pressed={itemState.rating === "fail"}
                                title="Fail"
                              >
                                <X className="h-4 w-4" strokeWidth={3} />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleNote(item.id)}
                              className="screen-only flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                              aria-label={`${item.label}: add note`}
                            >
                              <ChevronDown className={`h-4 w-4 transition-transform ${isNoteOpen ? "rotate-180" : ""}`} />
                            </button>
                          </div>

                          {itemState.note ? (
                            <p className="print-note-text hidden">Note: {itemState.note}</p>
                          ) : (
                            <div className="print-note-line hidden" />
                          )}

                          {isNoteOpen && (
                            <div className="screen-only mt-3 grid gap-2 border-t border-slate-200 pt-3 sm:grid-cols-[1fr_auto]">
                              <input
                                type="text"
                                aria-label={`Note for ${item.label}`}
                                value={itemState.note}
                                onChange={(e) => setNote(item.id, e.target.value)}
                                placeholder="What did you notice?"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                              />
                              <span className="hidden items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-400 sm:inline-flex">
                                {getRatingLabel(itemState.rating)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </main>
        </div>

        <section className="screen-only mt-8 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl bg-teal-400 px-4 text-base font-black text-slate-950 transition hover:bg-teal-300 active:scale-[0.98]"
          >
            <Printer className="h-5 w-5" /> Print / save PDF
          </button>
          <Link
            href="/ppsr"
            className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-base font-bold text-white transition hover:bg-white/[0.08] active:scale-[0.98]"
          >
            <FileText className="h-5 w-5" /> Run PPSR — $4.95
          </Link>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Clear all ratings and start fresh?")) {
                startFresh();
              }
            }}
            className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-base font-bold text-slate-300 transition hover:bg-white/[0.06] active:scale-[0.98] disabled:opacity-40"
            disabled={rated === 0 && !vehicle}
          >
            <RotateCcw className="h-5 w-5" /> Start fresh
          </button>
        </section>
      </div>
    </div>
  );
}
