import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CheckoutCancelledBanner } from "@/components/checkout-cancelled-banner";

const TRUST_PILLS = [
  "Free checks before you drive out",
  "$4.95 PPSR before deposit",
  "Free QLD contract pack",
  "No dealer kickbacks",
] as const;

const FREE_TOOLS = [
  {
    title: "Free QLD Rego Check",
    eyebrow: "Best first click",
    copy: "Check registration status, expiry, VIN, vehicle description, and use type before you message or drive out.",
    href: "/rego-check",
    cta: "Check a QLD rego",
    icon: BadgeCheck,
    featured: true,
  },
  {
    title: "Free Listing Check",
    eyebrow: "Marketplace filter",
    copy: "Paste the ad or enter the basics for a quick read on price, red flags, and what to ask next.",
    href: "/check",
    cta: "Check a listing",
    icon: Search,
    featured: false,
  },
  {
    title: "Free Inspection Checklist",
    eyebrow: "At the car",
    copy: "Use the mobile checklist beside the car so shiny photos do not do the thinking for you.",
    href: "/inspect",
    cta: "Open checklist",
    icon: ClipboardCheck,
    featured: false,
  },
  {
    title: "Free QLD Contract Pack",
    eyebrow: "Handover day",
    copy: "Get the private-sale contract, receipt, condition report, and transfer guide before money changes hands.",
    href: "/contract-pack",
    cta: "Get contract pack",
    icon: FileText,
    featured: false,
  },
] as const;

const BUYER_PATH = [
  {
    title: "First sniff test — free",
    copy: "Run the rego check and listing check. If the seller story, rego details, price, or photos feel off, walk away early.",
    icon: BadgeCheck,
    ctas: [
      { href: "/rego-check", label: "Check rego" },
      { href: "/check", label: "Check listing" },
    ],
  },
  {
    title: "Inspect beside the car — free",
    copy: "Use the inspection checklist to check tyres, leaks, warning lights, service history, body condition, and seller answers while you are actually there.",
    icon: ClipboardCheck,
    ctas: [{ href: "/inspect", label: "Open checklist" }],
  },
  {
    title: "Before deposit — $4.95",
    copy: "Run the PPSR before sending money. Rego does not tell you if finance is owing, the car is stolen, or it has written-off history.",
    icon: ShieldCheck,
    ctas: [{ href: "/ppsr", label: "Get PPSR report" }],
  },
  {
    title: "Before handover — free or $9.99",
    copy: "Download the free QLD contract pack, or open the Deal Pack if you want PPSR, paperwork, and a guided handover record in one place.",
    icon: FileText,
    ctas: [
      { href: "/contract-pack", label: "Get contract pack" },
      { href: "/deal", label: "Open Deal Pack" },
    ],
  },
] as const;

const PRIVATE_SALE_RED_FLAGS = [
  "Seller will not provide VIN or rego before inspection",
  "Purpose of use does not match the story",
  "Price is cheap but transfer or roadworthy details are vague",
  "Seller pushes for a deposit before PPSR",
] as const;

const FAQS = [
  {
    question: "What should I check first on a QLD used car?",
    answer:
      "Start with the free QLD rego check. It confirms current registration details and gives you questions to ask before you drive out. If the car still looks good, run the PPSR before sending money.",
  },
  {
    question: "Does a current rego mean the car is safe to buy?",
    answer:
      "No. Current rego is useful, but it does not prove there is no finance owing, stolen record, written-off history, odometer issue, or mechanical problem.",
  },
  {
    question: "Why are there so many free tools?",
    answer:
      "Because not every car deserves paid checks. Start free with rego, listing, inspection, and paperwork tools. Pay for PPSR or Deal Pack only when the car still looks worth chasing.",
  },
  {
    question: "Is Buying Buddy a buyer's agent?",
    answer:
      "Not the traditional expensive version. Buying Buddy is a self-serve buyer-side toolkit: rego, PPSR, listing checks, inspection prompts, contract pack, and handover guidance.",
  },
] as const;

export const metadata: Metadata = {
  title: "Buying Buddy | Free QLD Rego Check, PPSR & Used-Car Buyer Tools",
  description:
    "Start free with QLD rego, listing, inspection, and contract tools. Run a $4.95 PPSR before deposit and use the Deal Pack when the car gets serious.",
  keywords: [
    "QLD rego check",
    "free QLD rego check",
    "PPSR check QLD",
    "Facebook Marketplace car scams",
    "used car check Queensland",
    "rego transfer QLD",
    "roadworthy certificate QLD private sale",
    "private car sale QLD paperwork",
    "used car buying help Australia",
    "Buying Buddy",
  ],
  alternates: {
    canonical: "https://buyingbuddy.com.au/",
  },
  openGraph: {
    title: "Buying Buddy | Start Free Before You Buy Privately",
    description:
      "Free QLD rego, listing, inspection, and contract tools, plus $4.95 PPSR reports and a $9.99 Deal Pack for private used-car buyers.",
    url: "https://buyingbuddy.com.au/",
    siteName: "Buying Buddy",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Buying Buddy | Start Free Before You Buy Privately",
    description:
      "Check the rego, sanity-check the listing, inspect properly, run PPSR before deposit, and keep the handover paperwork tidy.",
  },
};

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-4 sm:px-6 lg:px-8 lg:pt-8">
      <Suspense>
        <CheckoutCancelledBanner />
      </Suspense>

      <section className="overflow-hidden rounded-[2rem] border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-stretch">
          <div className="p-5 sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-teal-700 shadow-sm ring-1 ring-teal-100">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Built for QLD used-car buyers
            </div>

            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.035em] text-gray-900 sm:text-5xl">
              Check the car before you chase it.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-700 sm:text-lg sm:leading-8">
              Buying Buddy gives private used-car buyers a free first check, a cheap PPSR, an inspection checklist, and QLD paperwork tools before money changes hands.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {TRUST_PILLS.map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-gray-700 ring-1 ring-gray-200"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
                  {pill}
                </span>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <Link
                href="/rego-check"
                className="inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 text-base font-black text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
              >
                Check QLD rego — free
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/ppsr"
                className="inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl border border-gray-300 bg-white px-6 text-base font-black text-gray-900 transition hover:border-teal-300 hover:text-teal-700 active:scale-[0.98]"
              >
                PPSR report — $4.95
              </Link>
            </div>

            <p className="mt-3 text-xs font-semibold text-gray-500">
              Start free. Pay only when the car still looks worth chasing.
            </p>
          </div>

          <aside className="border-t border-teal-100 bg-white/80 p-5 sm:p-6 lg:border-l lg:border-t-0 lg:p-8">
            <div className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">
                Sample rego preview
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-gray-900">
                What the first check gives you.
              </h2>
              <div className="mt-5 grid gap-3">
                {[
                  ["Status + expiry", "Know whether the current registration story starts clean."],
                  ["VIN + description", "Match the result against photos, seller details, and paperwork."],
                  ["Purpose of use", "Private, commercial, dealer: ask the right follow-up before you inspect."],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-2xl bg-teal-50 p-4">
                    <p className="text-sm font-black text-teal-950">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-teal-900">{copy}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs font-semibold leading-5 text-gray-500">
                Rego is the first layer. PPSR checks finance, stolen, and written-off history before deposit.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-10">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Start free</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-gray-900 sm:text-4xl">
            Four free ways to avoid wasting a weekend.
          </h2>
          <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
            Not every car deserves a PPSR or inspection. Start with the free tools, then pay only when the car still looks worth chasing.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {FREE_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <article
                key={tool.title}
                className={`flex flex-col rounded-[1.75rem] border p-5 shadow-sm sm:p-6 ${
                  tool.featured ? "border-teal-200 bg-teal-50" : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-700">
                    {tool.eyebrow}
                  </span>
                  <div className="inline-flex w-fit rounded-2xl bg-white p-3 text-teal-600 shadow-sm ring-1 ring-gray-100">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-black tracking-[-0.02em] text-gray-900">
                  {tool.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">{tool.copy}</p>
                <Link
                  href={tool.href}
                  className={`mt-6 inline-flex min-h-[3rem] items-center justify-center rounded-2xl px-4 text-sm font-black transition ${
                    tool.featured
                      ? "bg-teal-600 text-white hover:bg-teal-700"
                      : "border border-gray-300 text-gray-900 hover:border-teal-300 hover:text-teal-700"
                  }`}
                >
                  {tool.cta}
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] border border-gray-200 bg-gray-50 p-5 shadow-sm sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
              The buyer path
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-gray-900 sm:text-4xl">
              Start free. Verify before money. Document the handover.
            </h2>
            <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
              Buying Buddy is built around the actual private-sale flow: check the ad, check the rego, verify the history, inspect the car, then keep the paperwork tidy.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {BUYER_PATH.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <Icon className="h-5 w-5 text-teal-600" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-base font-black tracking-[-0.03em] text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{step.copy}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {step.ctas.map((cta) => (
                      <Link
                        key={cta.href}
                        href={cta.href}
                        className="inline-flex min-h-[2.5rem] items-center justify-center rounded-xl border border-gray-200 px-3 text-xs font-black text-gray-800 transition hover:border-teal-300 hover:text-teal-700"
                      >
                        {cta.label}
                      </Link>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
            Buying from Marketplace?
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-gray-900 sm:text-4xl">
            Start with the plate, not the seller story.
          </h2>
          <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
            The faster question is not “is this a scam?” It is whether the rego, VIN, description, price, PPSR, and paperwork all line up.
          </p>
          <div className="mt-5 grid gap-3">
            {PRIVATE_SALE_RED_FLAGS.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden="true" />
                <p className="text-sm leading-6 text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-teal-200 bg-teal-50 p-5 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">
            Free contract pack
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-gray-900 sm:text-4xl">
            Paperwork is not admin. It is protection.
          </h2>
          <p className="mt-4 text-sm leading-7 text-teal-950 sm:text-base">
            The free QLD contract pack gives buyers the private-sale contract, receipt, condition report, and transfer guide before handover day gets messy.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/contract-pack"
              className="inline-flex min-h-[3.25rem] items-center justify-center rounded-2xl bg-white px-4 text-sm font-black text-teal-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Get free contract pack
            </Link>
            <Link
              href="/deal"
              className="inline-flex min-h-[3.25rem] items-center justify-center rounded-2xl bg-teal-700 px-4 text-sm font-black text-white shadow-sm transition hover:bg-teal-800"
            >
              Open Deal Pack — $9.99
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] border border-gray-900 bg-gray-950 p-6 text-center shadow-sm sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-300">
          Got a car in mind?
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-[-0.035em] text-white sm:text-5xl">
          Start with the free check.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-300">
          If the car still looks good after the free checks, run the PPSR before money changes hands and use the paperwork tools before handover.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/rego-check"
            className="inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-2xl bg-teal-500 px-8 text-base font-black text-white transition hover:bg-teal-400"
          >
            Check QLD rego — free
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href="/ppsr"
            className="inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl border border-white/20 bg-white px-8 text-base font-black text-gray-950 transition hover:bg-gray-100"
          >
            Get PPSR report — $4.95
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
          FAQs
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {FAQS.map((item) => (
            <article key={item.question} className="rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-black tracking-[-0.03em] text-gray-900">
                {item.question}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
