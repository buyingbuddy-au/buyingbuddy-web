import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, FileSignature, Shield, Sparkles } from "lucide-react";
import { ContractBuilderForm } from "@/components/contract-builder-form";

const CONTRACT_STEPS = [
  {
    title: "Fill the deal details",
    body: "Buyer, seller, vehicle, price, payout conditions and handover notes go into one digital contract builder.",
  },
  {
    title: "Email one clean PDF",
    body: "Buying Buddy prepares a single private-sale contract and handover record you can review before anyone signs.",
  },
  {
    title: "Control the sale",
    body: "Use the PDF with your inspection notes, PPSR and Deal Room so pressure does not replace process.",
  },
] as const;

const DOCUMENT_SECTIONS = [
  "Private sale contract",
  "Payment receipt record",
  "Condition and handover notes",
  "Transfer and PPSR reminder checklist",
] as const;

export const metadata: Metadata = {
  title: "Private Sale Contract Builder",
  description:
    "Create a professional Buying Buddy private-sale contract PDF for a QLD used-car handover and email it before payment or keys change hands.",
  alternates: { canonical: "https://buyingbuddy.com.au/contract-pack" },
};

export default function ContractPackPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="rounded-[2.25rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-teal-50 p-6 shadow-sm sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Private sale paperwork</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-[-0.065em] text-slate-950 sm:text-6xl">
            A digital contract builder that keeps the buyer in control.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
            Build a clean private-sale contract and handover record before payment, keys or vague promises become your problem.
          </p>
          <div className="mt-6 rounded-3xl border border-teal-100 bg-white/80 p-5 shadow-sm">
            <p className="text-lg font-black tracking-[-0.04em] text-slate-950">You’re in control.</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              It’s easier to live with walking away than dealing with problems. Slow the deal down, write the terms down, then decide.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex rounded-full bg-teal-100 px-3 py-1 text-xs font-black text-teal-800">Email-ready PDF</span>
            <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700">Finance payout notes</span>
            <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700">Subtle BB record</span>
          </div>
        </div>

        <ContractBuilderForm />
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {CONTRACT_STEPS.map((step, index) => (
          <article key={step.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-sm font-black text-teal-700">
              {index + 1}
            </div>
            <h2 className="mt-4 text-lg font-black tracking-[-0.04em] text-slate-950">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8">
          <div className="inline-flex rounded-2xl bg-teal-50 p-3 text-teal-600">
            <FileSignature className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-[-0.05em] text-slate-950">
            One professional sale record, prepared before handover.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            The contract keeps the legal-style substance practical and plain: who is selling, who is buying, what vehicle, what money, what conditions and what happens at handover.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Buying Buddy appears subtly as the tool that prepared the document. It does not make Buying Buddy a party to the sale or a substitute for legal advice.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {DOCUMENT_SECTIONS.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden="true" />
              <p className="text-sm font-bold leading-6 text-slate-800">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] border border-teal-200 bg-teal-50 p-6 shadow-sm sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">Next control layer</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-950">Before you sign, open Deal Room.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700">
              The contract records the terms. The Deal Room workspace keeps the listing, inspection notes, PPSR, seller messages and next steps together so the sale stays controlled.
            </p>
          </div>
          <Link
            href="/deal"
            className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 text-sm font-black text-white transition hover:bg-teal-700"
          >
            Open Deal Room <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <ClipboardCheck className="h-6 w-6 text-teal-600" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-black tracking-[-0.04em] text-slate-950">Use it with the checklist</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Inspect the car first, then carry defects or promises into the contract before handover.
          </p>
          <Link href="/inspect/full" className="mt-4 inline-flex text-sm font-black text-teal-700 hover:text-teal-800">
            Open inspection checklist
          </Link>
        </article>

        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <Shield className="h-6 w-6 text-teal-600" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-black tracking-[-0.04em] text-slate-950">Record PPSR status carefully</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The document records whether a PPSR check has been completed. It does not replace the PPSR itself.
          </p>
          <Link href="/ppsr" className="mt-4 inline-flex text-sm font-black text-teal-700 hover:text-teal-800">
            Review PPSR option
          </Link>
        </article>

        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <Sparkles className="h-6 w-6 text-teal-600" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-black tracking-[-0.04em] text-slate-950">Keep the seller honest</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            If details change when it is time to write them down, that is a signal. Pause before payment.
          </p>
          <Link href="/check" className="mt-4 inline-flex text-sm font-black text-teal-700 hover:text-teal-800">
            Run a listing check
          </Link>
        </article>
      </section>
    </div>
  );
}
