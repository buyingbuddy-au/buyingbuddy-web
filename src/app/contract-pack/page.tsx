import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { HandoverPackButton } from "@/components/handover-pack-button";

const CONTRACT_PACK_ITEMS = [
  {
    title: "QLD vehicle sale contract",
    body: "A cleaner private-sale contract for recording buyer, seller, vehicle, price, disclosures, and settlement terms.",
  },
  {
    title: "Receipt of payment",
    body: "A simple record of exactly what was paid, when it was paid, and how the funds changed hands.",
  },
  {
    title: "Vehicle condition report template",
    body: "A handover-day checklist for documenting what the car looked like when the deal was done.",
  },
  {
    title: "Transfer of registration guide",
    body: "A QLD-focused guide so you know what needs to happen after the keys and money change hands.",
  },
] as const;

const SCAM_POINTS = [
  "Seller changes the story once you arrive",
  "Deposit pressure before you've checked the car properly",
  "Missing written record of defects or promises made",
  "Confusion over payment, identity, or handover timing",
] as const;

export const metadata: Metadata = {
  title: "Private Sale Contract Pack",
  description:
    "QLD-specific private sale paperwork for car buyers: vehicle sale contract, receipt of payment, condition report template, and transfer guide.",
};

export default function ContractPackPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      {/* Hero + Buy Card */}
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
            QLD Private Sale Contract Pack
          </p>
          <h1 className="mt-4 max-w-xl text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-5xl">
            Private sale paperwork built by a licensed dealer who has seen every scam.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-gray-500">
            If a private seller gets vague when it&apos;s time to take payment, record defects, or hand
            over rego paperwork, that&apos;s your problem unless the deal is documented properly.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">QLD-specific paperwork</span>
            <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">Built for private vehicle sales</span>
            <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">Fast, printable templates</span>
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
            Private Sale Contract Pack
          </p>
          <p className="mt-3 text-4xl font-black tracking-[-0.05em] text-gray-900">Free</p>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Four practical documents for the day the deal becomes real.
          </p>

          <ul className="mt-6 grid gap-3">
            {["QLD vehicle sale contract", "Receipt of payment", "Vehicle condition report", "Transfer of registration guide"].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm font-medium text-gray-900">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <HandoverPackButton />
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Free download — enter your email and get all 4 PDFs instantly.
          </p>
        </div>
      </section>

      {/* What's Included */}
      <section className="mt-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">What&apos;s included</p>
        <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] text-gray-900">
          Everything you need to document the handover properly.
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {CONTRACT_PACK_ITEMS.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.75rem] border border-gray-200 bg-gray-50 p-5 shadow-sm"
            >
              <div className="inline-flex rounded-2xl bg-teal-50 p-3 text-teal-600">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-black tracking-[-0.04em] text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Why This Exists */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Why this exists</p>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] text-gray-900">
            A handshake is not a process.
          </h2>
          <p className="mt-4 text-sm leading-7 text-gray-500">
            Private sales in Queensland are where the seller&apos;s memory suddenly gets fuzzy. A proper
            contract, payment receipt, and condition report force the important details onto paper while
            both sides are still standing next to the car.
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-500">
            That matters because once the transfer is done, arguments about defects, damage, accessories,
            or payment promises get hard to unwind very quickly.
          </p>
        </div>

        <div className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm">
          <div className="inline-flex rounded-2xl bg-red-50 p-3 text-red-600">
            <Shield className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-black text-gray-900">
            Built by a licensed dealer who has seen every scam
          </p>
          <ul className="mt-4 grid gap-3">
            {SCAM_POINTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-gray-600">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PPSR Cross-sell */}
      <section className="mt-10 rounded-[2rem] border border-teal-200 bg-teal-50 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">Before you sign</p>
            <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-gray-900">
              Have you checked the PPSR?
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Paperwork on a car with hidden finance or write-off history doesn&apos;t protect you.
              Run the PPSR check first — $4.95.
            </p>
          </div>
          <Link
            href="/ppsr"
            className="shrink-0 inline-flex min-h-[3rem] items-center justify-center rounded-2xl bg-teal-600 px-6 text-sm font-bold text-white transition hover:bg-teal-700"
          >
            Run PPSR Check
          </Link>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-6 rounded-[2rem] border border-teal-200 bg-teal-50 p-6 text-center shadow-sm sm:p-10">
        <h2 className="text-2xl font-black tracking-[-0.05em] text-gray-900 sm:text-4xl">
          Show up with paperwork, not hope.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-gray-600">
          Use the contract pack on handover day, and pair it with the free listing check or PPSR earlier
          in the buying process.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <div><HandoverPackButton /></div>
          <Link
            href="/check"
            className="inline-flex min-h-[3rem] items-center justify-center rounded-2xl border border-teal-600 px-6 text-sm font-bold text-teal-600 transition hover:bg-teal-600 hover:text-white"
          >
            Back to free check
          </Link>
        </div>
      </section>
    </div>
  );
}
