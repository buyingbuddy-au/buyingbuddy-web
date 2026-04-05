"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Printer, Share2 } from "lucide-react";
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

export default function PrintChecklistPage() {
  const [checks, setChecks] = useState<Record<string, CheckState>>({});
  const [vehicleName, setVehicleName] = useState("");

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

  function getIcon(state: CheckState) {
    switch (state) {
      case "pass":
        return <CheckCircle2 className="h-5 w-5 text-teal-300" />;
      case "concern":
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case "fail":
        return <XCircle className="h-5 w-5 text-rose-400" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-slate-600" />;
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleShare() {
    const shareData = {
      type: "quick_print",
      vehicle: vehicleName || "Unknown vehicle",
      passes,
      concerns,
      fails,
      total: totalItems,
    };
    const encoded = btoa(JSON.stringify(shareData));
    const shareUrl = `${window.location.origin}/shared/${encoded}`;

    if (navigator.share) {
      void navigator.share({ title: "BuyingBuddy Inspection", url: shareUrl });
    } else {
      void navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-12 pt-5 text-white sm:px-6 lg:px-8 lg:pt-10 print:bg-white print:text-black">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/inspect" className="text-sm font-bold text-teal-300">
          ← Back
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10"
          >
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-3 py-2 text-xs font-bold text-white hover:bg-teal-700"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
        </div>
      </div>

      <section className="mt-4 rounded-[2rem] border border-white/10 bg-slate-950/72 p-5 shadow-panel print:border print:border-gray-300 print:bg-white print:text-black">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-teal-200 print:text-gray-600">
          Quick inspection
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white print:text-black">
          14 checks you can actually do standing next to the car.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-300 print:text-gray-600">
          This is the simple version. No mechanic cosplay. Just the practical stuff that helps you avoid obvious rubbish.
        </p>
      </section>

      <div className="mt-4 print:hidden">
        <input
          type="text"
          value={vehicleName}
          onChange={(e) => setVehicleName(e.target.value)}
          placeholder="2019 Toyota Yaris (optional)"
          className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
        />
      </div>

      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-black">BuyingBuddy Inspection Checklist</h1>
        {vehicleName && <p className="mt-1 text-lg font-bold">{vehicleName}</p>}
        <p className="mt-1 text-sm text-gray-500">Generated {new Date().toLocaleDateString("en-AU")}</p>
      </div>

      <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-[#0b1326]/84 p-4 shadow-panel print:border print:border-gray-300 print:bg-white">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-white print:text-black">{checked}/{totalItems} checked</span>
          <div className="flex gap-3 text-xs font-bold">
            <span className="text-teal-300 print:text-teal-700">✓ {passes}</span>
            <span className="text-amber-400 print:text-amber-700">⚠ {concerns}</span>
            <span className="text-rose-400 print:text-rose-700">✕ {fails}</span>
          </div>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8 print:bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-300 via-teal-500 to-teal-400 transition-all duration-300"
            style={{ width: `${totalItems ? (checked / totalItems) * 100 : 0}%` }}
          />
        </div>
      </div>

      {CHECKLIST_SECTIONS.map((section) => (
        <section key={section.title} className="mt-6">
          <h2 className="text-sm font-black uppercase tracking-[0.16em] text-slate-400 print:text-gray-500">
            {section.title}
          </h2>
          <div className="mt-3 grid gap-2">
            {section.items.map((item) => {
              const state = checks[item] ?? "unchecked";
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => cycleCheck(item)}
                  className={`flex items-center gap-3 rounded-[1.5rem] border px-4 py-4 text-left text-sm transition print:border-gray-300 print:bg-white ${
                    state === "pass"
                      ? "border-teal-400/30 bg-teal-500/10"
                      : state === "concern"
                        ? "border-amber-400/30 bg-amber-500/10"
                        : state === "fail"
                          ? "border-rose-400/30 bg-rose-500/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {getIcon(state)}
                  <span className={state === "unchecked" ? "text-slate-200 print:text-gray-700" : "font-medium text-white print:text-black"}>
                    {item}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {checked > 0 && (
        <section className="mt-8 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 text-center shadow-panel print:border print:border-gray-300 print:bg-white">
          <h2 className="text-xl font-black text-white print:text-black">Quick Summary</h2>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-teal-500/10 p-4 print:bg-teal-50">
              <p className="text-3xl font-black text-teal-300 print:text-teal-700">{passes}</p>
              <p className="text-xs font-bold text-teal-200 print:text-teal-700">Pass</p>
            </div>
            <div className="rounded-2xl bg-amber-500/10 p-4 print:bg-amber-50">
              <p className="text-3xl font-black text-amber-400 print:text-amber-700">{concerns}</p>
              <p className="text-xs font-bold text-amber-200 print:text-amber-700">Caution</p>
            </div>
            <div className="rounded-2xl bg-rose-500/10 p-4 print:bg-rose-50">
              <p className="text-3xl font-black text-rose-400 print:text-rose-700">{fails}</p>
              <p className="text-xs font-bold text-rose-200 print:text-rose-700">Fail</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center print:hidden">
            <Link
              href="/ppsr"
              className="inline-flex min-h-[3rem] items-center justify-center rounded-2xl bg-teal-600 px-6 text-sm font-bold text-white transition hover:bg-teal-700"
            >
              Run PPSR Check — $4.95
            </Link>
            <Link
              href="/deal"
              className="inline-flex min-h-[3rem] items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-6 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Set up Deal Room
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
