import type { Metadata } from "next";
import { Clock, DollarSign, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PpiForm } from "@/components/ppi-form";

export const metadata: Metadata = {
  title: "Book a Pre-Purchase Inspection",
  description:
    "Book a pre-purchase inspection before buying a used car in QLD. Get a qualified mechanic to check the car before you hand over any money.",
};

const STATS = [
  { stat: "$150–250", label: "Typical PPI cost in QLD", icon: DollarSign },
  { stat: "$5,000+", label: "Average hidden repair cost", icon: AlertTriangle },
  { stat: "1 in 3", label: "Used cars have an undisclosed fault", icon: Clock },
  { stat: "100%", label: "Worth it. Every single time.", icon: CheckCircle2 },
] as const;

export default function PpiPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      <section className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
          Pre-Purchase Inspection
        </p>
        <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-5xl">
          Get a mechanic to check it before you buy.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500">
          A pre-purchase inspection is the one thing that catches what sellers hope you&apos;ll miss.
          $150–$250 now can save you $5,000 later.
        </p>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        {/* Why PPI */}
        <section>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Why you need one</p>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] text-gray-900">
            Private sellers don&apos;t always tell the truth.
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-gray-500">
            <p>
              In 15 years in the car industry — Lexus, BMW, Audi — I&apos;ve seen every trick.
              Clocked odometers. Flood damage hidden under fresh carpet. Engine mounts held
              together with zip ties.
            </p>
            <p>
              A pre-purchase inspection from a qualified mechanic takes 1–2 hours and gives you
              a full written report. You either walk in knowing exactly what you&apos;re buying, or
              you walk away before it costs you.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {STATS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[1.75rem] border border-gray-200 bg-gray-50 p-4 shadow-sm">
                  <Icon className="h-5 w-5 text-teal-600" />
                  <p className="mt-3 text-2xl font-black tracking-[-0.05em] text-gray-900">{item.stat}</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">{item.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Form */}
        <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:sticky lg:top-20">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
            Book your inspection
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] text-gray-900">
            Tell us about the car.
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Fill in the details below. We&apos;ll get back to you within a few hours to confirm availability and cost.
          </p>
          <div className="mt-6">
            <PpiForm />
          </div>
        </section>
      </div>
    </div>
  );
}
