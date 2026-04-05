"use client";

import { useState, useMemo } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Printer,
  Share2,
  ChevronLeft,
  Car,
} from "lucide-react";
import Link from "next/link";

const CHECKLIST_SECTIONS = [
  {
    title: "Exterior",
    items: [
      "Panels line up and paint looks consistent",
      "Lights and indicators work",
      "Tyres look decent and wear evenly",
      "Windscreen and mirrors aren't badly damaged",
    ],
  },
  {
    title: "Interior",
    items: [
      "Windows, locks and mirrors work",
      "Air con blows cold",
      "No warning lights stay on",
      "No bad smells or strange wear inside",
    ],
  },
  {
    title: "Drive",
    items: [
      "Engine starts and idles smoothly",
      "Steering and brakes feel normal",
      "No weird noises or vibrations",
    ],
  },
  {
    title: "Paperwork",
    items: [
      "VIN matches the papers",
      "Service history makes sense",
      "Seller details stack up",
    ],
  },
] as const;

type CheckState = "unchecked" | "pass" | "concern" | "fail";

function getVerdict(passes: number, concerns: number, fails: number, total: number) {
  if (passes + concerns + fails === 0) return null;
  const pct = passes / total;
  if (fails >= 3) return { text: "Walk away", tone: "rose" as const };
  if (fails >= 1) return { text: "Needs closer look", tone: "amber" as const };
  if (concerns >= 3) return { text: "Proceed with caution", tone: "amber" as const };
  if (pct >= 0.85 && fails === 0) return { text: "Looking solid", tone: "teal" as const };
  if (pct >= 0.5) return { text: "Some concerns", tone: "amber" as const };
  return { text: "Keep checking", tone: "slate" as const };
}

export default function PrintChecklistPage() {
  const [checks, setChecks] = useState<Record<string, CheckState>>({});
  const [vehicleName, setVehicleName] = useState("");
  const [shareToast, setShareToast] = useState(false);

  function cycleCheck(item: string) {
    setChecks((prev) => {
      const current = prev[item] ?? "unchecked";
      const next: CheckState =
        current === "unchecked"
          ? "pass"
          : current === "pass"
            ? "concern"
            : current === "concern"
              ? "fail"
              : "unchecked";
      return { ...prev, [item]: next };
    });
  }

  const totalItems = CHECKLIST_SECTIONS.reduce((sum, s) => sum + s.items.length, 0);
  const checked = Object.values(checks).filter((v) => v !== "unchecked").length;
  const passes = Object.values(checks).filter((v) => v === "pass").length;
  const concerns = Object.values(checks).filter((v) => v === "concern").length;
  const fails = Object.values(checks).filter((v) => v === "fail").length;
  const verdict = useMemo(() => getVerdict(passes, concerns, fails, totalItems), [passes, concerns, fails, totalItems]);

  function getIcon(state: CheckState) {
    switch (state) {
      case "pass":
        return <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-400" />;
      case "concern":
        return <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />;
      case "fail":
        return <XCircle className="h-5 w-5 shrink-0 text-rose-400" />;
      default:
        return <div className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-600" />;
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleShare() {
    const summaryParts: string[] = [];
    if (vehicleName) summaryParts.push(vehicleName);
    summaryParts.push(`${checked}/${totalItems} checked`);
    if (passes) summaryParts.push(`${passes} pass`);
    if (concerns) summaryParts.push(`${concerns} caution`);
    if (fails) summaryParts.push(`${fails} fail`);
    if (verdict) summaryParts.push(`Verdict: ${verdict.text}`);

    const shareText = `BuyingBuddy Quick Inspection\n${summaryParts.join(" · ")}\n\nDo your own check: ${window.location.origin}/inspect/print`;

    if (navigator.share) {
      void navigator.share({ title: "BuyingBuddy Inspection", text: shareText });
    } else {
      void navigator.clipboard.writeText(shareText);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  }

  const toneMap = {
    teal: "border-teal-500/30 bg-teal-500/10 text-teal-300",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    rose: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    slate: "border-white/10 bg-white/5 text-slate-300",
  };

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-slate-950 px-4 pt-4 pb-24 sm:-mx-6 lg:-mx-8 print:mx-0 print:mt-0 print:bg-white">
    <div className="mx-auto w-full max-w-2xl text-white sm:px-2 lg:pt-4 print:text-black print:pb-8">
      {/* Top bar */}
      <nav className="flex items-center justify-between print:hidden">
        <Link
          href="/inspect"
          className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-bold text-teal-300 -ml-2 active:bg-white/5"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="relative inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-200 active:bg-white/10"
          >
            <Share2 className="h-3.5 w-3.5" /> Share
            {shareToast && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg bg-teal-600 px-2.5 py-1 text-[11px] font-bold text-white whitespace-nowrap shadow-lg">
                Copied!
              </span>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-bold text-white active:bg-teal-700"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mt-3 rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-5 shadow-panel print:border-gray-300 print:bg-white print:text-black">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-300 print:text-gray-500">
          Quick Inspection
        </p>
        <h1 className="mt-1.5 text-[1.6rem] font-bold leading-tight tracking-tight text-white print:text-black">
          14 checks. No mechanic cosplay.
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-400 print:text-gray-500">
          The stuff you can actually check standing next to the car. Tap each item to rate it.
        </p>
      </section>

      {/* Vehicle name */}
      <div className="mt-3 print:hidden">
        <div className="relative">
          <Car className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
            placeholder="2019 Toyota Yaris (optional)"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-teal-500/50 focus:bg-white/8"
          />
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block mt-2 mb-4">
        <h1 className="text-xl font-black">BuyingBuddy Quick Inspection</h1>
        {vehicleName && <p className="mt-0.5 text-base font-bold">{vehicleName}</p>}
        <p className="mt-0.5 text-xs text-gray-500">{new Date().toLocaleDateString("en-AU")}</p>
      </div>

      {/* Progress + verdict strip */}
      <div className="sticky top-0 z-10 -mx-4 px-4 pt-3 pb-1 bg-gradient-to-b from-slate-950 via-slate-950/95 to-transparent print:static print:mx-0 print:px-0 print:bg-white">
        <div className="rounded-xl border border-white/10 bg-[#0b1326]/90 px-4 py-3 backdrop-blur-sm shadow-panel print:border-gray-300 print:bg-white print:backdrop-blur-none">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white print:text-black">
              {checked}/{totalItems}
            </span>
            <div className="flex gap-3 text-xs font-bold">
              {passes > 0 && <span className="text-teal-400 print:text-teal-700">✓{passes}</span>}
              {concerns > 0 && <span className="text-amber-400 print:text-amber-700">⚠{concerns}</span>}
              {fails > 0 && <span className="text-rose-400 print:text-rose-700">✕{fails}</span>}
            </div>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8 print:bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-500 transition-all duration-300"
              style={{ width: `${totalItems ? (checked / totalItems) * 100 : 0}%` }}
            />
          </div>
          {verdict && (
            <div className={`mt-2 inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold ${toneMap[verdict.tone]}`}>
              {verdict.text}
            </div>
          )}
        </div>
      </div>

      {/* Checklist sections */}
      {CHECKLIST_SECTIONS.map((section) => (
        <section key={section.title} className="mt-5">
          <h2 className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 print:text-gray-500">
            {section.title}
          </h2>
          <div className="grid gap-1.5">
            {section.items.map((item) => {
              const state = checks[item] ?? "unchecked";
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => cycleCheck(item)}
                  className={`flex min-h-[48px] items-center gap-3 rounded-xl border px-4 py-3 text-left text-[13px] leading-snug transition-colors active:scale-[0.98] print:border-gray-300 print:bg-white ${
                    state === "pass"
                      ? "border-teal-500/25 bg-teal-500/10"
                      : state === "concern"
                        ? "border-amber-500/25 bg-amber-500/10"
                        : state === "fail"
                          ? "border-rose-500/25 bg-rose-500/10"
                          : "border-white/8 bg-white/[0.03] active:bg-white/8"
                  }`}
                >
                  {getIcon(state)}
                  <span
                    className={
                      state === "unchecked"
                        ? "text-slate-300 print:text-gray-700"
                        : "font-medium text-white print:text-black"
                    }
                  >
                    {item}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {/* Summary — appears once any checks done */}
      {checked > 0 && (
        <section className="mt-8 rounded-2xl border border-white/10 bg-slate-950/70 p-5 shadow-panel print:border-gray-300 print:bg-white">
          <h2 className="text-center text-lg font-bold text-white print:text-black">
            {vehicleName || "Your"} Summary
          </h2>

          {verdict && (
            <p
              className={`mt-2 text-center text-sm font-bold ${
                verdict.tone === "teal"
                  ? "text-teal-300 print:text-teal-700"
                  : verdict.tone === "amber"
                    ? "text-amber-300 print:text-amber-700"
                    : verdict.tone === "rose"
                      ? "text-rose-300 print:text-rose-700"
                      : "text-slate-300 print:text-gray-600"
              }`}
            >
              {verdict.text}
            </p>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-teal-500/10 py-3 text-center print:bg-teal-50">
              <p className="text-2xl font-black text-teal-400 print:text-teal-700">{passes}</p>
              <p className="text-[11px] font-bold text-teal-300/70 print:text-teal-700">Pass</p>
            </div>
            <div className="rounded-xl bg-amber-500/10 py-3 text-center print:bg-amber-50">
              <p className="text-2xl font-black text-amber-400 print:text-amber-700">{concerns}</p>
              <p className="text-[11px] font-bold text-amber-300/70 print:text-amber-700">Caution</p>
            </div>
            <div className="rounded-xl bg-rose-500/10 py-3 text-center print:bg-rose-50">
              <p className="text-2xl font-black text-rose-400 print:text-rose-700">{fails}</p>
              <p className="text-[11px] font-bold text-rose-300/70 print:text-rose-700">Fail</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center print:hidden">
            <Link
              href="/ppsr"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-teal-600 px-5 text-sm font-bold text-white transition active:bg-teal-700"
            >
              Run PPSR Check — $4.95
            </Link>
            <Link
              href="/deal"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-bold text-white transition active:bg-white/10"
            >
              Set up Deal Room
            </Link>
          </div>
        </section>
      )}

      {/* Tap legend — only show before any checks */}
      {checked === 0 && (
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-500 print:hidden">
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-teal-400" /> Pass</span>
          <span className="flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> Caution</span>
          <span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5 text-rose-400" /> Fail</span>
        </div>
      )}
    </div>
    </div>
  );
}
