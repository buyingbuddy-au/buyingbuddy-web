import Link from "next/link";
import { ClipboardCheck, Camera, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inspect Tool | Buying Buddy",
  description: "Choose your inspection style: Quick Print Checklist or Full Interactive Report with photos.",
};

const MODES = [
  {
    href: "/inspect/full",
    icon: Camera,
    title: "Full Inspection Report",
    subtitle: "14 practical checks",
    description: "Step through each checkpoint on your phone. Add notes, rate each item, get a risk score at the end. Best when you're standing next to the car.",
    badge: "Recommended",
    cta: "Start Full Inspection",
    features: ["14 guided checkpoints", "Notes per item", "Risk rating at the end", "Sharable results", "Takes 10-15 minutes"],
  },
  {
    href: "/inspect/print",
    icon: ClipboardCheck,
    title: "Quick Print Checklist",
    subtitle: "Print it, tick it, done",
    description: "A clean one-page checklist you can print at home or pull up on your phone. Old school but effective. Tick off each item as you go.",
    badge: null,
    cta: "Open Print Checklist",
    features: ["One-page printable checklist", "14 practical checks", "Works offline once printed", "Takes 5 minutes", "Share or save as PDF"],
  },
] as const;

export default function InspectLandingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      <section className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
          Vehicle Inspection
        </p>
        <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-5xl">
          Check the car before you check out.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-gray-500">
          Two ways to inspect. Pick the one that suits how you work.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          return (
            <Link
              key={mode.href}
              href={mode.href}
              className="group relative flex flex-col rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm transition hover:border-teal-200 hover:shadow-md sm:p-8"
            >
              {mode.badge && (
                <span className="absolute -top-3 right-6 rounded-full bg-teal-600 px-3 py-1 text-xs font-bold text-white">
                  {mode.badge}
                </span>
              )}

              <div className="inline-flex self-start rounded-2xl bg-teal-50 p-4 text-teal-600">
                <Icon className="h-8 w-8" />
              </div>

              <h2 className="mt-5 text-2xl font-black tracking-[-0.05em] text-gray-900">
                {mode.title}
              </h2>
              <p className="mt-1 text-sm font-bold text-teal-600">{mode.subtitle}</p>
              <p className="mt-3 text-sm leading-7 text-gray-500">{mode.description}</p>

              <ul className="mt-6 flex-1 grid gap-2">
                {mode.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6 inline-flex items-center gap-2 text-sm font-black text-teal-600 group-hover:gap-3 transition-all">
                {mode.cta}
                <ChevronRight className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
