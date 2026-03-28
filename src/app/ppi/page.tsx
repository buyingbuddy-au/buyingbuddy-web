import type { Metadata } from "next";
import { PpiForm } from "@/components/ppi-form";

export const metadata: Metadata = {
  title: "Book a Pre-Purchase Inspection — Buying Buddy",
  description:
    "Book a pre-purchase inspection before buying a used car in QLD. We'll connect you with a qualified mechanic to check the car before you hand over any money.",
};

export default function PpiPage() {
  return (
    <>
      <section className="hero-shell overflow-hidden text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-lime">
            Pre-Purchase Inspection
          </p>
          <h1 className="mt-4 display-font max-w-4xl text-4xl uppercase leading-[0.95] sm:text-5xl lg:text-6xl">
            Get a mechanic to check it before you buy.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82">
            A pre-purchase inspection is the one thing that catches what sellers hope you&apos;ll miss.
            $150–$250 now can save you $5,000 later.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
            {/* Why PPI */}
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-lime">
                Why You Need One
              </p>
              <h2 className="mt-3 display-font text-4xl uppercase leading-[0.95] text-brand-navy">
                Private sellers don&apos;t always tell the truth.
              </h2>
              <div className="mt-8 space-y-5 text-brand-ink/80 text-sm leading-7">
                <p>
                  In 15 years in the car industry — Lexus, BMW, Audi — I&apos;ve seen every trick. Clocked
                  odometers. Flood damage hidden under fresh carpet. Engine mounts held together with zip ties.
                  Resprayed hail damage that looks perfect in photos.
                </p>
                <p>
                  A pre-purchase inspection from a qualified mechanic takes 1–2 hours and gives you a full
                  written report. You either walk in knowing exactly what you&apos;re buying, or you walk away
                  before it costs you.
                </p>
                <p>
                  Either way, you win.
                </p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { stat: "$150–250", label: "Typical PPI cost in QLD" },
                  { stat: "$5,000+", label: "Average hidden repair cost on a failed car" },
                  { stat: "1 in 3", label: "Used cars have an undisclosed fault" },
                  { stat: "100%", label: "Worth it. Every single time." },
                ].map((item) => (
                  <div key={item.label} className="panel p-4">
                    <p className="display-font text-3xl text-brand-lime">{item.stat}</p>
                    <p className="mt-1 text-xs text-brand-ink/60 leading-5">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="panel p-7 lg:sticky lg:top-8">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-lime">
                Book Your Inspection
              </p>
              <h2 className="mt-3 display-font text-3xl uppercase leading-[0.95] text-brand-navy">
                Tell us about the car.
              </h2>
              <p className="mt-3 text-sm leading-7 text-brand-ink/70">
                Fill in the details below. We&apos;ll get back to you within a few hours to confirm availability and cost.
              </p>
              <PpiForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
