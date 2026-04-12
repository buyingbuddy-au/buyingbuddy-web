"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronLeft,
  X,
} from "lucide-react";

/* ── Checklist data ── */

type Rating = "pass" | "concern" | "fail" | null;

interface ChecklistItem {
  id: string;
  label: string;
}

interface ChecklistSection {
  title: string;
  items: ChecklistItem[];
}

const SECTIONS: ChecklistSection[] = [
  {
    title: "Exterior",
    items: [
      { id: "ext-panels", label: "Panels line up and paint looks consistent" },
      { id: "ext-rust", label: "No visible rust, dents, or scratches" },
      { id: "ext-lights", label: "Lights and indicators all work" },
      { id: "ext-tyres", label: "Tyres look decent and wear evenly" },
      { id: "ext-glass", label: "Windscreen and mirrors aren't damaged" },
    ],
  },
  {
    title: "Interior",
    items: [
      { id: "int-windows", label: "Windows, locks and mirrors work" },
      { id: "int-aircon", label: "Air con blows cold" },
      { id: "int-warnings", label: "No warning lights stay on" },
      { id: "int-seats", label: "Seats, seatbelts and controls work" },
      { id: "int-smell", label: "No water damage, mould or bad smells" },
    ],
  },
  {
    title: "Mechanical",
    items: [
      { id: "mech-start", label: "Engine starts cleanly, no odd noises" },
      { id: "mech-trans", label: "Transmission shifts smoothly" },
      { id: "mech-brakes", label: "Brakes feel firm, no pulling" },
      { id: "mech-leaks", label: "No fluid leaks visible under the car" },
    ],
  },
  {
    title: "Test Drive",
    items: [
      { id: "drive-steering", label: "Steering is straight, no vibration" },
      { id: "drive-noises", label: "No unusual noises while driving" },
      { id: "drive-accel", label: "Acceleration and braking feel normal" },
    ],
  },
  {
    title: "Documents",
    items: [
      { id: "docs-rego", label: "Rego matches the car and seller" },
      { id: "docs-service", label: "Service history available" },
      { id: "docs-safety", label: "Safety certificate current or discussed" },
      { id: "docs-ppsr", label: "PPSR check completed" },
    ],
  },
];

const ALL_ITEMS = SECTIONS.flatMap((s) => s.items);
const TOTAL = ALL_ITEMS.length;
const STORAGE_KEY = "buyingbuddy-inspection-v5";

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

  if (fails >= 3) return { text: "Walk Away", color: "text-red-600", bg: "bg-red-50 border-red-200" };
  if (fails >= 1 || concerns >= 3) return { text: "Some Concerns", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
  return { text: "Looking Good", color: "text-green-600", bg: "bg-green-50 border-green-200" };
}

function getSectionTally(section: ChecklistSection, state: InspectionState) {
  const passes = section.items.filter((i) => state[i.id]?.rating === "pass").length;
  const concerns = section.items.filter((i) => state[i.id]?.rating === "concern").length;
  const fails = section.items.filter((i) => state[i.id]?.rating === "fail").length;
  return { passes, concerns, fails, total: section.items.length };
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
          restored[key] = {
            rating: parsed.state[key].rating ?? null,
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

/* ── Component ── */

export function InspectionApp() {
  const [state, setState] = useState<InspectionState>(createEmptyState);
  const [vehicle, setVehicle] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage
  useEffect(() => {
    const restored = restoreState();
    setState(restored.state);
    setVehicle(restored.vehicle);
    setHydrated(true);
  }, []);

  // Auto-save (debounced)
  const persist = useCallback((nextState: InspectionState, nextVehicle: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: nextState, vehicle: nextVehicle }));
      } catch { /* storage full — ignore */ }
    }, 300);
  }, []);

  function setRating(id: string, rating: Rating) {
    setState((prev) => {
      const next = { ...prev, [id]: { ...prev[id], rating } };
      persist(next, vehicle);
      // Auto-expand note if concern or fail
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

  const rated = useMemo(() => Object.values(state).filter((s) => s.rating !== null).length, [state]);
  const verdict = useMemo(() => getVerdict(state), [state]);
  const progress = TOTAL > 0 ? (rated / TOTAL) * 100 : 0;

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-4 sm:px-6">
      {/* Back link */}
      <nav className="mb-3">
        <Link
          href="/inspect"
          className="inline-flex items-center gap-1 text-sm font-bold text-teal-600"
        >
          <ChevronLeft className="h-4 w-4" /> All inspection tools
        </Link>
      </nav>

      {/* Sticky header */}
      <div className="sticky top-14 z-20 -mx-4 bg-white/95 px-4 pb-3 pt-3 backdrop-blur border-b border-gray-100 sm:-mx-6 sm:px-6 lg:top-16">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={vehicle}
              onChange={(e) => handleVehicleChange(e.target.value)}
              placeholder="2019 Toyota Yaris (optional)"
              className="w-full border-0 bg-transparent text-base font-bold text-gray-900 placeholder:text-gray-400 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            {verdict && (
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${verdict.bg} ${verdict.color}`}>
                {verdict.text}
              </span>
            )}
            <span className="text-sm font-bold text-gray-500">{rated}/{TOTAL}</span>
          </div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist sections */}
      {SECTIONS.map((section) => {
        const tally = getSectionTally(section, state);
        return (
          <section key={section.title} className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">
                {section.title}
              </h2>
              <span className="text-xs font-bold text-gray-400">
                {tally.passes > 0 && <span className="text-green-600">{tally.passes}✓</span>}
                {tally.concerns > 0 && <span className="ml-1.5 text-amber-600">{tally.concerns}⚠</span>}
                {tally.fails > 0 && <span className="ml-1.5 text-red-600">{tally.fails}✕</span>}
                {tally.passes + tally.concerns + tally.fails === 0 && `0/${tally.total}`}
              </span>
            </div>

            <div className="grid gap-2">
              {section.items.map((item) => {
                const itemState = state[item.id];
                const isNoteOpen = expandedNotes.has(item.id);
                const rowBg =
                  itemState.rating === "pass"
                    ? "border-green-200 bg-green-50/50"
                    : itemState.rating === "concern"
                      ? "border-amber-200 bg-amber-50/50"
                      : itemState.rating === "fail"
                        ? "border-red-200 bg-red-50/50"
                        : "border-gray-200 bg-white";

                return (
                  <div key={item.id} className={`rounded-xl border ${rowBg} transition-colors`}>
                    <div className="flex items-center gap-2 px-3 py-3 sm:px-4">
                      {/* Label */}
                      <span className="flex-1 text-sm leading-snug text-gray-800">{item.label}</span>

                      {/* Rating buttons */}
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => setRating(item.id, itemState.rating === "pass" ? null : "pass")}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg transition active:scale-95 ${
                            itemState.rating === "pass"
                              ? "bg-green-600 text-white shadow-sm"
                              : "bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600"
                          }`}
                          aria-label="Pass"
                        >
                          <Check className="h-4 w-4" strokeWidth={3} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRating(item.id, itemState.rating === "concern" ? null : "concern")}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg transition active:scale-95 ${
                            itemState.rating === "concern"
                              ? "bg-amber-500 text-white shadow-sm"
                              : "bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                          }`}
                          aria-label="Concern"
                        >
                          <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRating(item.id, itemState.rating === "fail" ? null : "fail")}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg transition active:scale-95 ${
                            itemState.rating === "fail"
                              ? "bg-red-600 text-white shadow-sm"
                              : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          }`}
                          aria-label="Fail"
                        >
                          <X className="h-4 w-4" strokeWidth={3} />
                        </button>
                      </div>

                      {/* Note toggle */}
                      <button
                        type="button"
                        onClick={() => toggleNote(item.id)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                        aria-label="Add note"
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform ${isNoteOpen ? "rotate-180" : ""}`} />
                      </button>
                    </div>

                    {/* Note input */}
                    {isNoteOpen && (
                      <div className="px-3 pb-3 sm:px-4">
                        <input
                          type="text"
                          value={itemState.note}
                          onChange={(e) => setNote(item.id, e.target.value)}
                          placeholder="What did you notice?"
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Bottom actions */}
      <div className="mt-8 grid gap-3">
        <button
          type="button"
          onClick={() => {
            // Coming soon toast
            const el = document.createElement("div");
            el.className = "fixed bottom-24 left-1/2 -translate-x-1/2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg z-50";
            el.textContent = "Save & PDF coming soon";
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 2000);
          }}
          className="min-h-[3.25rem] w-full rounded-xl bg-teal-600 px-4 text-base font-bold text-white transition active:scale-[0.98] hover:bg-teal-700"
        >
          Save Inspection
        </button>
        <button
          type="button"
          onClick={() => {
            const el = document.createElement("div");
            el.className = "fixed bottom-24 left-1/2 -translate-x-1/2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg z-50";
            el.textContent = "PDF download coming soon";
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 2000);
          }}
          className="min-h-[3.25rem] w-full rounded-xl border border-teal-600 px-4 text-base font-bold text-teal-600 transition active:scale-[0.98] hover:bg-teal-50"
        >
          Download PDF
        </button>
        <button
          type="button"
          onClick={() => {
            const el = document.createElement("div");
            el.className = "fixed bottom-24 left-1/2 -translate-x-1/2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg z-50";
            el.textContent = "Deal Room attachment coming soon";
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 2000);
          }}
          className="min-h-[3.25rem] w-full rounded-xl border border-gray-200 px-4 text-base font-bold text-gray-700 transition active:scale-[0.98] hover:bg-gray-50"
        >
          Attach to Deal Room
        </button>
      </div>

      {/* Reset */}
      {rated > 0 && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Clear all ratings and start fresh?")) {
                startFresh();
              }
            }}
            className="text-sm font-bold text-gray-400 transition hover:text-red-600"
          >
            Clear all and start fresh
          </button>
        </div>
      )}
    </div>
  );
}
