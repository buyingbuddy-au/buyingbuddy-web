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
  if (fails >= 3) return { text: "Walk away", tone: "red" as const };
  if (fails >= 1) return { text: "Needs closer look", tone: "amber" as const };
  if (concerns >= 3) return { text: "Proceed with caution", tone: "amber" as const };
  if (pct >= 0.85 && fails === 0) return { text: "Looking solid", tone: "green" as const };
  if (pct >= 0.5) return { text: "Some concerns", tone: "amber" as const };
  return { text: "Keep checking", tone: "gray" as const };
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
        return <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />;
      case "concern":
        return <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />;
      case "fail":
        return <XCircle className="h-5 w-5 shrink-0 text-red-600" />;
      default:
        return <div className="h-5 w-5 shrink-0 rounded-full border-2 border-gray-300" />;
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
    green: "border-green-200 bg-green-50 text-green-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
    gray: "border-gray-200 bg-gray-50 text-gray-600",
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-24 sm:px-6 print:pb-8">
      {/* Top bar */}
      <nav className="flex items-center justify-between print:hidden">
        <Link
          href="/inspect"
          className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-bold text-teal-600 -ml-2 active:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="relative inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 active:bg-gray-50"
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
      <section className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-5 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600">
          Quick Inspection
        </p>
        <h1 className="mt-1.5 text-[1.6rem] font-bold leading-tight tracking-tight text-gray-900">
          14 checks. No mechanic cosplay.
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
          The stuff you can actually check standing next to the car. Tap each item to rate it.
        </p>
      </section>

      {/* Vehicle name */}
      <div className="mt-3 print:hidden">
        <div className="relative">
          <Car className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
            placeholder="2019 Toyota Yaris (optional)"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
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
      <div className="sticky top-0 z-10 -mx-4 px-4 pt-3 pb-1 bg-gradient-to-b from-white via-white/95 to-transparent print:static print:mx-0 print:px-0">
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">
              {checked}/{totalItems}
            </span>
            <div className="flex gap-3 text-xs font-bold">
              {passes > 0 && <span className="text-green-600">✓{passes}</span>}
              {concerns > 0 && <span className="text-amber-600">⚠{concerns}</span>}
              {fails > 0 && <span className="text-red-600">✕{fails}</span>}
            </div>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-300"
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
          <h2 className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-teal-600">
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
                  className={`flex min-h-[48px] items-center gap-3 rounded-xl border px-4 py-3 text-left text-[13px] leading-snug transition-colors active:scale-[0.98] ${
                    state === "pass"
                      ? "border-green-200 bg-green-50"
                      : state === "concern"
                        ? "border-amber-200 bg-amber-50"
                        : state === "fail"
                          ? "border-red-200 bg-red-50"
                          : "border-gray-200 bg-white active:bg-gray-50"
                  }`}
                >
                  {getIcon(state)}
                  <span
                    className={
                      state === "unchecked"
                        ? "text-gray-600"
                        : "font-medium text-gray-900"
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

      {/* Summary */}
      {checked > 0 && (
        <section className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
          <h2 className="text-center text-lg font-bold text-gray-900">
            {vehicleName || "Your"} Summary
          </h2>

          {verdict && (
            <p
              className={`mt-2 text-center text-sm font-bold ${
                verdict.tone === "green"
                  ? "text-green-600"
                  : verdict.tone === "amber"
                    ? "text-amber-600"
                    : verdict.tone === "red"
                      ? "text-red-600"
                      : "text-gray-600"
              }`}
            >
              {verdict.text}
            </p>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-green-50 border border-green-200 py-3 text-center">
              <p className="text-2xl font-black text-green-600">{passes}</p>
              <p className="text-[11px] font-bold text-green-600">Pass</p>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-200 py-3 text-center">
              <p className="text-2xl font-black text-amber-600">{concerns}</p>
              <p className="text-[11px] font-bold text-amber-600">Caution</p>
            </div>
            <div className="rounded-xl bg-red-50 border border-red-200 py-3 text-center">
              <p className="text-2xl font-black text-red-600">{fails}</p>
              <p className="text-[11px] font-bold text-red-600">Fail</p>
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
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-bold text-gray-900 transition active:bg-gray-50"
            >
              Set up Deal Room
            </Link>
          </div>
        </section>
      )}

      {/* Tap legend */}
      {checked === 0 && (
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-gray-500 print:hidden">
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Pass</span>
          <span className="flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Caution</span>
          <span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5 text-red-600" /> Fail</span>
        </div>
      )}
    </div>
  );
}
