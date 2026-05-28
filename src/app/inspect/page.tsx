import Link from "next/link";
import { ChevronRight, ClipboardCheck, FileText, Printer, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Inspection Checklist | Buying Buddy",
  description:
    "Use Buying Buddy's free 21-check inspection checklist beside the car, then print or save the same checklist as a compact PDF.",
  alternates: { canonical: "https://buyingbuddy.com.au/inspect" },
};

const HIGHLIGHTS = [
  "21 practical checks in one flow",
  "Phone-first ratings and notes",
  "Print or save as a compact two-page PDF",
  "PPSR next step kept close before money changes hands",
] as const;

export default function InspectLandingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_32%),linear-gradient(135deg,#f8fafc,#ffffff_62%)] p-6 shadow-sm sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-teal-700">
              <ClipboardCheck className="h-3.5 w-3.5" /> Free Inspection Checklist
            </p>
            <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.06em] text-slate-950 sm:text-5xl">
              One 21-check inspection flow. Phone-ready and printable.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Use one practical 21-check tool beside the car. Add ratings and notes as you go, then print or save a compact PDF record before money changes hands.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-3">
              {HIGHLIGHTS.map((highlight) => (
                <div key={highlight} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  <span className="text-sm font-bold leading-5 text-slate-700">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <Link
          href="/inspect/full"
          className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-6 shadow-xl shadow-slate-200/60 transition hover:-translate-y-0.5 hover:shadow-2xl sm:p-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className="inline-flex self-start rounded-2xl bg-teal-300/15 p-4 text-teal-200">
              <ClipboardCheck className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-2xl font-black tracking-[-0.05em] text-white sm:text-3xl">
              Start the 21-check inspection
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Rate each item as pass, concern or fail. Notes auto-save locally on your device, and print mode compresses the full checklist into a buyer-friendly handover record.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-slate-200">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
                <Printer className="h-3.5 w-3.5" /> Print / PDF
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
                <FileText className="h-3.5 w-3.5" /> PPSR next step
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> 21 practical checks
              </span>
            </div>
          </div>

          <div className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-teal-300 px-5 py-3 text-sm font-black text-slate-950 transition group-hover:gap-3 lg:mt-0">
            Open checklist
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>
      </section>
    </div>
  );
}
