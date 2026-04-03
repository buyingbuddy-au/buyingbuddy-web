import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Eye, Shield, Star } from "lucide-react";
import CTASection from "@/components/cta-section";
import { SecondOpinionForm } from "@/components/second-opinion-form";

export const metadata: Metadata = {
  title: "Second Opinion | Buying Buddy",
  description:
    "Paste a used-car listing and get a quick dealer-style second opinion before you message the seller or drive across town.",
};

const RED_FLAGS = [
  "Price way too low for the model and year",
  "Seller asks for a deposit before inspection",
  "Won't share the rego, VIN, or inspection location",
  "Photos look like stock images or don't match the suburb",
  "Story keeps changing once you ask normal buyer questions",
  "Only wants text/email and avoids direct calls",
] as const;

const WHAT_WE_CHECK = [
  "Whether the asking price is way off market",
  "Obvious ad copy and seller behaviour red flags",
  "Whether you should escalate to a PPSR or PPI",
  "A plain-English verdict on whether the car is worth chasing",
] as const;

const EXAMPLES = [
  {
    title: "Scam avoided",
    body: "$8,000 Corolla with a rushed deposit request and stock-looking photos. Classic too-cheap trap.",
    stat: "Saved a wasted trip and likely deposit loss",
  },
  {
    title: "Flood car warning",
    body: "Mazda 3 looked clean in photos but the story and pricing didn't line up. That was enough to pause and verify.",
    stat: "Escalated to PPSR/PPI before money moved",
  },
  {
    title: "Legit deal confirmed",
    body: "A slightly rough i30 was cheap for a reason, but the seller story and pricing stacked up. Worth inspecting.",
    stat: "Proceed with a sharper inspection checklist",
  },
] as const;

export default function SecondOpinionPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-navy-700 via-blue-900 to-navy-800 py-16 text-white">
        <div className="section-container grid gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-500">
              Second Opinion
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-6xl">
              Get a second opinion before you chase that listing.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80 sm:text-xl">
              Paste the ad and we'll run a quick dealer-style read using the existing Buying Buddy
              listing-check flow. Better than driving across Brisbane for a dud.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold text-white/85">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                <CheckCircle className="h-4 w-4 text-lime-500" />
                Scam red flags
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                <Eye className="h-4 w-4 text-lime-500" />
                Quick go / no-go verdict
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                <Shield className="h-4 w-4 text-lime-500" />
                Next-step recommendations
              </span>
            </div>
          </div>

          <SecondOpinionForm />
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-500">
              Red Flags
            </p>
            <h2 className="mt-4 text-4xl font-black text-navy-700">
              The warning signs worth checking before you inspect.
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
            {RED_FLAGS.map((flag) => (
              <article key={flag} className="card flex items-start gap-4 p-6">
                <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-red-500" />
                <p className="text-sm leading-7 text-gray-700">{flag}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-500">
              What We Check
            </p>
            <h2 className="mt-4 text-4xl font-black text-navy-700">
              Not a full inspection, but enough to decide if it's worth your time.
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-4">
            {WHAT_WE_CHECK.map((item, index) => (
              <article key={item} className="card p-6">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-500">
                  0{index + 1}
                </p>
                <p className="mt-4 text-sm leading-7 text-gray-700">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-500">
              Examples
            </p>
            <h2 className="mt-4 text-4xl font-black text-navy-700">
              The types of listings a second opinion helps sort fast.
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-8 lg:grid-cols-3">
            {EXAMPLES.map((example) => (
              <article key={example.title} className="card p-8">
                <Star className="h-8 w-8 text-lime-500" />
                <h3 className="mt-5 text-2xl font-black text-navy-700">{example.title}</h3>
                <p className="mt-4 text-sm leading-7 text-gray-700">{example.body}</p>
                <p className="mt-6 text-sm font-black uppercase tracking-[0.08em] text-lime-500">
                  {example.stat}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/free-checklist" className="btn-outline inline-flex">
              Grab the Free Checklist
            </Link>
          </div>
        </div>
      </section>

      <CTASection
        title="If the listing still looks legit, do the proper checks next."
        subtitle="Run the homepage free check, book a PPI, or use the QLD contract pack before you hand over cash."
        primaryText="Run Free Check"
        primaryHref="/#free-check"
        secondaryText="Book a PPI"
        secondaryHref="/ppi"
      />
    </>
  );
}
