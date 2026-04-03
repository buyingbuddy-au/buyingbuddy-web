import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Download, FileText, Shield } from "lucide-react";
import CTASection from "@/components/cta-section";
import { FreeKitForm } from "@/components/free-kit-form";

export const metadata: Metadata = {
  title: "Free Car Checklist | Buying Buddy",
  description:
    "Download the free Queensland used-car checklist and buyer kit. Spot red flags, inspect smarter, and avoid private sale mistakes.",
};

const CHECKLIST_ITEMS = [
  "Exterior, interior, engine bay, and test-drive checks",
  "Paperwork and PPSR verification prompts",
  "Common Facebook Marketplace scam red flags",
  "QLD transfer basics and seller handover reminders",
  "Simple negotiation lines for obvious faults",
  "A mobile-friendly format you can use while inspecting",
] as const;

const UPGRADE_ITEMS = [
  {
    title: "Run a live listing check",
    body: "Paste the seller's URL on the homepage and get a dealer-style snapshot before you book the inspection.",
    href: "/#free-check",
    cta: "Run Free Check",
  },
  {
    title: "Book a pre-purchase inspection",
    body: "If the car still stacks up, get a mechanic's eyes on it before money changes hands.",
    href: "/ppi",
    cta: "Book PPI",
  },
  {
    title: "Lock down the paperwork",
    body: "Use the QLD contract pack so handover day doesn't turn into a mess of screenshots and missing details.",
    href: "/contract-pack",
    cta: "View Contract Pack",
  },
] as const;

export default function FreeChecklistPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-navy-700 via-blue-900 to-navy-800 py-16 text-white">
        <div className="section-container grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-500">
              Free Checklist
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-6xl">
              Get the free checklist before you inspect a private-sale car.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80 sm:text-xl">
              Don't rock up blind. Get the inspection checklist, scam red flags, and QLD paperwork
              reminders so you know what to ask before the seller rushes you.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold text-white/85">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                <CheckCircle className="h-4 w-4 text-lime-500" />
                Instant email delivery
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                <Shield className="h-4 w-4 text-lime-500" />
                Built for QLD buyers
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                <FileText className="h-4 w-4 text-lime-500" />
                Mobile-friendly
              </span>
            </div>
          </div>

          <div className="card p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto inline-flex rounded-2xl bg-lime-500 p-4">
                <Download className="h-8 w-8 text-white" />
              </div>
              <h2 className="mt-4 text-2xl font-black text-navy-700">Send me the free kit</h2>
              <p className="mt-2 text-sm leading-7 text-gray-600">
                Enter your details and the existing Buying Buddy email flow will send the kit to your inbox.
              </p>
            </div>
            <FreeKitForm />
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-500">
              What's Inside
            </p>
            <h2 className="mt-4 text-4xl font-black text-navy-700">
              The bits private buyers usually skip.
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Use it before inspection, during the walkaround, and again before you put down a deposit.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
            {CHECKLIST_ITEMS.map((item) => (
              <div key={item} className="card flex items-start gap-4 p-6">
                <CheckCircle className="mt-1 h-6 w-6 shrink-0 text-lime-500" />
                <p className="text-base leading-7 text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-500">
              Next Steps
            </p>
            <h2 className="mt-4 text-4xl font-black text-navy-700">
              Want more protection than a checklist?
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-8 lg:grid-cols-3">
            {UPGRADE_ITEMS.map((item) => (
              <article key={item.title} className="card p-8">
                <AlertTriangle className="h-10 w-10 text-lime-500" />
                <h3 className="mt-5 text-2xl font-black text-navy-700">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-gray-700">{item.body}</p>
                <Link href={item.href} className="btn-primary mt-6 inline-flex w-full justify-center">
                  {item.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Don't stop at the checklist if the car looks promising."
        subtitle="Run the free listing check, book a PPI, or grab the QLD contract pack before you hand over money."
        primaryText="Run Free Check"
        primaryHref="/#free-check"
        secondaryText="Book a PPI"
        secondaryHref="/ppi"
      />
    </>
  );
}
