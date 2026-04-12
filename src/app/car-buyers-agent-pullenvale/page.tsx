import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MapPin, ShieldCheck } from "lucide-react";

const LOCAL_POINTS = [
  {
    title: "Built for acreage and family-car buyers",
    copy:
      "Pullenvale buyers are often juggling school runs, acreage living, 4WD needs, towing, or a second car that actually has to be reliable.",
  },
  {
    title: "Local context matters",
    copy:
      "A city runabout and a car that has to live a real west-side Brisbane life are not the same thing. The shortlist needs to reflect that.",
  },
  {
    title: "You still need price protection",
    copy:
      "Higher household income doesn’t stop people overpaying. It just means the mistakes are often more expensive.",
  },
] as const;

const INCLUDED = [
  "Shortlist guidance based on your budget and use case",
  "Dealer-style read on listings and pricing before you chase them",
  "Negotiation support aimed at pulling money back out of the deal",
  "Independent inspection coordination before you commit",
  "Access to BuyingBuddy’s free check, PPSR, and QLD paperwork tools",
] as const;

const FAQS = [
  {
    question: "Do you only work with buyers in Pullenvale?",
    answer:
      "No. This page is here because Pullenvale is a strong local fit, but the service is Brisbane-focused and can extend across surrounding suburbs and SEQ when the deal makes sense.",
  },
  {
    question: "What sort of cars do Pullenvale buyers usually ask for?",
    answer:
      "Usually family SUVs, 4WDs, dual-cab utes, and practical second cars. The common thread is the same, buyers want reliability and don’t want to waste a weekend on junk.",
  },
  {
    question: "Can I still just use the tools without the full service?",
    answer:
      "Yes. BuyingBuddy still gives you self-serve options like the free car check, PPSR reports, inspection checklist, and contract pack.",
  },
] as const;

export const metadata: Metadata = {
  title: "Car Buyer’s Agent Pullenvale, Brisbane | BuyingBuddy",
  description:
    "Need a car buyer’s agent in Pullenvale, Brisbane? BuyingBuddy helps Pullenvale buyers find, negotiate, and inspect the right used car without overpaying.",
  keywords: [
    "car buyers agent Pullenvale",
    "car buyer's agent Pullenvale Brisbane",
    "used car inspection Pullenvale",
    "buy used car Pullenvale",
    "car buyers agent Brisbane west",
  ],
  alternates: {
    canonical: "https://buyingbuddy.com.au/car-buyers-agent-pullenvale",
  },
  openGraph: {
    title: "Car Buyer’s Agent Pullenvale, Brisbane | BuyingBuddy",
    description:
      "Flat-fee used car buyer support for Pullenvale and Brisbane west, find, negotiate, and inspect the right car properly.",
    url: "https://buyingbuddy.com.au/car-buyers-agent-pullenvale",
    siteName: "BuyingBuddy",
    locale: "en_AU",
    type: "website",
  },
};

export default function PullenvaleBuyerAgentPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 transition hover:text-teal-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to homepage
      </Link>

      <section className="mt-4 rounded-[2rem] border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-white p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_320px] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-teal-700 ring-1 ring-teal-100">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              Pullenvale, Brisbane
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.07em] text-gray-900 sm:text-5xl">
              Car Buyer’s Agent, Pullenvale.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
              If you’re in Pullenvale and you don’t want to waste weekends
              chasing overpriced or dodgy used cars, BuyingBuddy helps you find
              the right one, negotiate properly, and arrange the inspection
              before you commit.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
              This page exists because Pullenvale is exactly the kind of suburb
              where busy families and acreage buyers want a local operator, not
              a national call centre and not a generic inspection-only service.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl bg-teal-600 px-6 text-base font-black text-white transition hover:bg-teal-700"
              >
                Book a free call
              </Link>
              <Link
                href="/check"
                className="inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl border border-gray-300 bg-white px-6 text-base font-black text-gray-900 transition hover:border-teal-200 hover:text-teal-700"
              >
                Run a free check first
              </Link>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">
              Flat-fee positioning
            </p>
            <p className="mt-3 text-4xl font-black tracking-[-0.06em] text-gray-900">$997</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              A cleaner alternative to guessing your way through pricing, seller spin, and inspection timing.
            </p>
            <div className="mt-5 rounded-[1.25rem] border border-teal-200 bg-teal-50 p-4">
              <p className="text-sm font-black text-teal-900">Best fit for:</p>
              <p className="mt-2 text-sm leading-6 text-teal-950">
                Family SUVs, 4WDs, dual-cab utes, and second cars that actually need to be dependable.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-10">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
            Why this page matters
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-4xl">
            Pullenvale buyers don’t need more information. They need better protection.
          </h2>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {LOCAL_POINTS.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-black tracking-[-0.04em] text-gray-900">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
              What’s included
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-4xl">
              Find, negotiate, inspect.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
              The goal isn’t to hand you a report and disappear. The goal is to
              stop you getting boxed into a bad used-car decision in the first place.
            </p>

            <div className="mt-5 grid gap-3">
              {INCLUDED.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[1.25rem] border border-gray-200 bg-white p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden="true" />
                  <p className="text-sm leading-6 text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-teal-200 bg-white p-5 shadow-sm">
            <ShieldCheck className="h-6 w-6 text-teal-600" aria-hidden="true" />
            <h3 className="mt-4 text-xl font-black tracking-[-0.04em] text-gray-900">
              Brisbane-west trust signal
            </h3>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              This local page supports searches around Pullenvale, Kenmore,
              Brookfield, Chapel Hill, and the wider west-side catchment.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-2xl bg-teal-600 px-5 text-sm font-black text-white transition hover:bg-teal-700"
            >
              Ask about your shortlist
            </Link>
          </aside>
        </div>
      </section>

      <section className="mt-10">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">FAQ</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-4xl">
            Common questions from local buyers.
          </h2>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {FAQS.map((item) => (
            <article
              key={item.question}
              className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-black tracking-[-0.04em] text-gray-900">
                {item.question}
              </h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
