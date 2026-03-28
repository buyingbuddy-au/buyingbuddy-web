import type { Metadata } from "next";
import { FreeKitForm } from "@/components/free-kit-form";

export const metadata: Metadata = {
  title: "Free QLD Car Buyer's Kit — Buying Buddy",
  description:
    "Download the QLD Used Car Buyer's Complete Protection Kit — free. Checklist, PPSR guide, private sale contract, negotiation scripts. Written by someone with 15 years in the industry.",
};

export default function FreeKitPage() {
  return (
    <>
      <section className="hero-shell overflow-hidden text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-lime">
            Free Download
          </p>
          <h1 className="mt-4 display-font max-w-4xl text-4xl uppercase leading-[0.95] sm:text-5xl lg:text-6xl">
            The QLD Used Car Buyer&apos;s Complete Protection Kit.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82">
            15 years in the car industry. This is everything I wish everyday buyers knew before
            handing over a single dollar.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
            {/* What's inside */}
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-lime">
                What&apos;s Inside
              </p>
              <h2 className="mt-3 display-font text-4xl uppercase leading-[0.95] text-brand-navy">
                5 tools in one download.
              </h2>
              <div className="mt-8 space-y-6">
                {[
                  {
                    num: "01",
                    title: "Pre-Purchase Checklist",
                    body: "20 checks to run before you even consider making an offer. Covers mechanical, cosmetic, paperwork, and seller red flags.",
                  },
                  {
                    num: "02",
                    title: "PPSR Check Guide",
                    body: "What a PPSR actually shows you, how to read the result, and what to do if something comes up. Plain English, no jargon.",
                  },
                  {
                    num: "03",
                    title: "Private Sale Contract Essentials",
                    body: "What must be in a QLD private sale contract, what sellers try to leave out, and how to protect yourself on paper.",
                  },
                  {
                    num: "04",
                    title: "Negotiation Scripts",
                    body: "5 real scripts for real situations — overpriced cars, hidden damage, motivated sellers, and lowball rejections.",
                  },
                  {
                    num: "05",
                    title: "Walk-Away Red Flags",
                    body: "The signs that should make you put your wallet away and drive off — no matter how much you want the car.",
                  },
                ].map((item) => (
                  <div key={item.num} className="flex gap-5">
                    <span className="display-font text-2xl text-brand-lime leading-none mt-1 shrink-0">
                      {item.num}
                    </span>
                    <div>
                      <p className="font-black text-brand-navy">{item.title}</p>
                      <p className="mt-1 text-sm leading-7 text-brand-ink/70">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="panel p-7 lg:sticky lg:top-8">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-lime">
                Get the Kit — Free
              </p>
              <h2 className="mt-3 display-font text-3xl uppercase leading-[0.95] text-brand-navy">
                Drop your email. Download instantly.
              </h2>
              <p className="mt-3 text-sm leading-7 text-brand-ink/70">
                No spam. One email with your download link. That&apos;s it.
              </p>
              <FreeKitForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
