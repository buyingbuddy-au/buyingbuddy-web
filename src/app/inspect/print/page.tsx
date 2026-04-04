"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Printer, Share2 } from "lucide-react";
import Link from "next/link";

const CHECKLIST_SECTIONS = [
  {
    title: "Exterior",
    items: [
      "Panel gaps even on both sides",
      "No mismatched paint or overspray",
      "No rust around wheel arches, doors, or boot",
      "All lights and indicators working",
      "Windscreen free of cracks",
      "Tyre tread even and legal depth",
    ],
  },
  {
    title: "Under the Bonnet",
    items: [
      "Oil level and colour (no white residue on cap)",
      "Coolant level and colour (no brown sludge)",
      "No visible fluid leaks",
      "Battery terminals clean, no corrosion",
      "Belts and hoses not cracked or perished",
    ],
  },
  {
    title: "Interior",
    items: [
      "All electrics work (windows, locks, mirrors)",
      "Air conditioning blows cold",
      "Seats adjust and aren't ripped",
      "Dashboard warning lights clear after start",
      "No damp or mould smell (flood damage)",
      "Steering wheel not excessively worn",
    ],
  },
  {
    title: "Test Drive",
    items: [
      "Engine starts smoothly (cold start if possible)",
      "No unusual noises (knocking, ticking, grinding)",
      "Brakes feel firm, car stops straight",
      "Steering doesn't pull to one side",
      "Gearbox shifts smoothly (auto or manual)",
      "No vibrations at highway speed",
    ],
  },
  {
    title: "Paperwork",
    items: [
      "VIN matches rego papers",
      "Service logbook present and up to date",
      "Safety certificate / roadworthy current",
      "Seller's name matches rego certificate",
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
        current === "unchecked" ? "pass" :
        current === "pass" ? "concern" :
        current === "concern" ? "fail" : "unchecked";
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
      case "pass": return <CheckCircle2 className="h-5 w-5 text-teal-600" />;
      case "concern": return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "fail": return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleShare() {
    const summary = `BuyingBuddy Inspection${vehicleName ? ` — ${vehicleName}` : ""}: ${passes} pass, ${concerns} caution, ${fails} fail out of ${totalItems} checks.`;
    if (navigator.share) {
      void navigator.share({ title: "BuyingBuddy Inspection", text: summary, url: window.location.href });
    } else {
      void navigator.clipboard.writeText(summary);
      alert("Copied to clipboard!");
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/inspect" className="text-sm font-bold text-teal-600">← Back</Link>
        <div className="flex gap-2">
          <button onClick={handleShare} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-teal-50 hover:text-teal-700">
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
          <button onClick={handlePrint} className="inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-3 py-2 text-xs font-bold text-white hover:bg-teal-700">
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
        </div>
      </div>

      {/* Vehicle name */}
      <div className="mt-4 print:hidden">
        <input
          type="text"
          value={vehicleName}
          onChange={(e) => setVehicleName(e.target.value)}
          placeholder="2019 Toyota Yaris (optional)"
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
        />
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-black">BuyingBuddy Inspection Checklist</h1>
        {vehicleName && <p className="text-lg font-bold mt-1">{vehicleName}</p>}
        <p className="text-sm text-gray-500 mt-1">Generated {new Date().toLocaleDateString("en-AU")}</p>
      </div>

      {/* Progress bar */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-gray-900">{checked}/{totalItems} checked</span>
          <div className="flex gap-3 text-xs font-bold">
            <span className="text-teal-600">✓ {passes}</span>
            <span className="text-amber-500">⚠ {concerns}</span>
            <span className="text-red-500">✗ {fails}</span>
          </div>
        </div>
        <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-teal-600 transition-all duration-300"
            style={{ width: `${totalItems ? (checked / totalItems) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Checklist sections */}
      {CHECKLIST_SECTIONS.map((section) => (
        <section key={section.title} className="mt-6">
          <h2 className="text-sm font-black uppercase tracking-[0.16em] text-gray-500">{section.title}</h2>
          <div className="mt-3 grid gap-2">
            {section.items.map((item) => {
              const state = checks[item] ?? "unchecked";
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => cycleCheck(item)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    state === "pass" ? "border-teal-200 bg-teal-50" :
                    state === "concern" ? "border-amber-200 bg-amber-50" :
                    state === "fail" ? "border-red-200 bg-red-50" :
                    "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  {getIcon(state)}
                  <span className={state === "unchecked" ? "text-gray-700" : "font-medium text-gray-900"}>{item}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {/* Results summary */}
      {checked > 0 && (
        <section className="mt-8 rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm text-center">
          <h2 className="text-xl font-black text-gray-900">Quick Summary</h2>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-teal-50 p-4">
              <p className="text-3xl font-black text-teal-600">{passes}</p>
              <p className="text-xs font-bold text-teal-700">Pass</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-3xl font-black text-amber-600">{concerns}</p>
              <p className="text-xs font-bold text-amber-700">Caution</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-4">
              <p className="text-3xl font-black text-red-600">{fails}</p>
              <p className="text-xs font-bold text-red-700">Fail</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center print:hidden">
            <Link href="/ppsr" className="inline-flex min-h-[3rem] items-center justify-center rounded-2xl bg-teal-600 px-6 text-sm font-bold text-white transition hover:bg-teal-700">
              Run PPSR Check — $4.95
            </Link>
            <Link href="/deal" className="inline-flex min-h-[3rem] items-center justify-center rounded-2xl border border-gray-300 px-6 text-sm font-bold text-gray-900 transition hover:bg-gray-50">
              Set up Deal Room
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
