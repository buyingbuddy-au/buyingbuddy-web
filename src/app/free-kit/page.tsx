import type { Metadata } from "next";
import { FreeKitForm } from "@/components/free-kit-form";

export const metadata: Metadata = {
  title: "Free QLD Car Buyer's Kit",
  description:
    "Download the QLD Used Car Buyer's Complete Protection Kit — free. Checklist, PPSR guide, private sale contract, negotiation scripts.",
};

const KIT_ITEMS = [
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
] as const;

export default function FreeKitPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      <section className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
          Free Download
        </p>
        <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-5xl">
          The QLD Used Car Buyer&apos;s Complete Protection Kit.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500">
          15 years in the car industry. This is everything I wish everyday buyers knew before
          handing over a single dollar.
        </p>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        {/* What's inside */}
        <section>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
            What&apos;s inside
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] text-gray-900">
            5 tools in one download.
          </h2>
          <div className="mt-6 grid gap-4">
            {KIT_ITEMS.map((item) => (
              <div key={item.num} className="flex gap-4 rounded-[1.75rem] border border-gray-200 bg-gray-50 p-5 shadow-sm">
                <span className="text-2xl font-black text-teal-600 leading-none mt-0.5 shrink-0">
                  {item.num}
                </span>
                <div>
                  <p className="font-black text-gray-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-gray-500">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Form */}
        <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:sticky lg:top-20">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
            Get the Kit — Free
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] text-gray-900">
            Drop your email. Download instantly.
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            No spam. One email with your download link. That&apos;s it.
          </p>
          <div className="mt-6">
            <FreeKitForm />
          </div>
        </section>
      </div>
    </div>
  );
}
