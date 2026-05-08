import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { CheckoutCancelledBanner } from "@/components/checkout-cancelled-banner";

const TRUST_PILLS = [
  "QLD-first used-car buying tools",
  "Official-source checks where possible",
  "Plain-English next steps",
  "No dealer kickbacks",
] as const;

const CORE_HOOKS = [
  {
    title: "Free QLD Rego Check",
    eyebrow: "Best first click",
    copy: "Check live QLD rego status, expiry, VIN, vehicle description, and private/commercial/dealer use before you chase the car.",
    href: "/rego-check",
    cta: "Check a QLD rego",
    icon: BadgeCheck,
    featured: true,
  },
  {
    title: "$4.95 PPSR Report",
    eyebrow: "Before deposit",
    copy: "Finance owing, stolen status, written-off history, then a plain-English read on what the result means.",
    href: "/ppsr",
    cta: "Get PPSR report",
    icon: ShieldCheck,
    featured: false,
  },
  {
    title: "Free Listing Sanity Check",
    eyebrow: "Marketplace filter",
    copy: "Paste the ad or enter the basics and get a quick buyer-side sniff test before you waste a weekend.",
    href: "/check",
    cta: "Check a listing",
    icon: Search,
    featured: false,
  },
  {
    title: "QLD Handover Pack",
    eyebrow: "Paperwork layer",
    copy: "Private-sale checklist, transfer prompts, roadworthy reminders, and contract docs once the car looks worth buying.",
    href: "/contract-pack",
    cta: "Sort paperwork",
    icon: FileText,
    featured: false,
  },
] as const;

const BUYER_PATH = [
  {
    title: "Check the rego",
    copy: "Confirm the car exists in the QLD registration system and see whether the use type matches the seller's story.",
    icon: BadgeCheck,
  },
  {
    title: "Run PPSR before money",
    copy: "A current rego is not a clean-title check. PPSR is where finance, stolen, and write-off risk gets real.",
    icon: ShieldCheck,
  },
  {
    title: "Inspect like you mean it",
    copy: "Use the mobile checklist beside the car, not after you have fallen in love with the shiny photos.",
    icon: ClipboardCheck,
  },
  {
    title: "Keep the handover tidy",
    copy: "Roadworthy, transfer, receipt, insurance, and contract steps in one clean QLD-first flow.",
    icon: FileText,
  },
] as const;

const SEO_WEB = [
  {
    title: "QLD rego check",
    copy: "Free, fast, high-intent hook for buyers already looking at a specific car.",
    href: "/rego-check",
  },
  {
    title: "PPSR check QLD / Australia",
    copy: "Money keyword. Capture people just before deposit or inspection.",
    href: "/ppsr",
  },
  {
    title: "Facebook Marketplace car scams",
    copy: "Top-of-funnel education for buyers who feel unsure but have not chosen a tool yet.",
    href: "/blog/fb-marketplace-car-scams",
  },
  {
    title: "Private car sale QLD paperwork",
    copy: "Handover, roadworthy, rego transfer, receipts, and buyer/seller responsibilities.",
    href: "/contract-pack",
  },
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
    question: "Is Buying Buddy only for Queensland?",
    answer:
      "The sharpest launch tools are QLD-first because rego, transfer, safety certificate, and private-sale paperwork rules are state-specific. PPSR itself is national.",
  },
  {
    question: "Is this a buyer's agent?",
    answer:
      "Not the traditional expensive version. Buying Buddy is a self-serve buyer-side toolkit: rego, PPSR, listing checks, inspection prompts, and handover guidance.",
  },
] as const;

export const metadata: Metadata = {
  title: "Buying Buddy | Free QLD Rego Check, PPSR & Used-Car Buyer Tools",
  description:
    "Check a QLD rego, run a PPSR, sanity-check a Facebook Marketplace car, and sort private-sale paperwork before you buy a used car.",
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
    title: "Buying Buddy | Free QLD Rego Check, PPSR & Used-Car Buyer Tools",
    description:
      "QLD-first used-car buying tools: free rego check, PPSR reports, listing sanity checks, inspection prompts, and handover guidance.",
    url: "https://buyingbuddy.com.au/",
    siteName: "Buying Buddy",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Buying Buddy | Free QLD Rego Check, PPSR & Used-Car Buyer Tools",
    description:
      "Check the rego, verify the history, ask better seller questions, and buy the car with less guesswork.",
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
              QLD-first buyer-side car checks
            </div>

            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[0.95] tracking-[-0.075em] text-gray-900 sm:text-5xl lg:text-6xl">
              Check the rego before you chase the car.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-700 sm:text-lg sm:leading-8">
              Buying Buddy helps QLD used-car buyers verify the rego, run the PPSR, ask sharper seller questions, and keep the handover paperwork tidy.
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
                Run free QLD rego check
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/ppsr"
                className="inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl border border-gray-300 bg-white px-6 text-base font-black text-gray-900 transition hover:border-teal-300 hover:text-teal-700 active:scale-[0.98]"
              >
                PPSR — $4.95
              </Link>
            </div>

            <p className="mt-3 text-xs font-semibold text-gray-500">
              Rego first. PPSR before money. Paperwork before handover.
            </p>
          </div>

          <aside className="border-t border-teal-100 bg-white/80 p-5 sm:p-6 lg:border-l lg:border-t-0 lg:p-8">
            <div className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">
                Main hook
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] text-gray-900">
                Free QLD rego check that turns into better buyer questions.
              </h2>
              <div className="mt-5 grid gap-3">
                {[
                  ["Status + expiry", "Know if the rego story starts clean."],
                  ["VIN + description", "Match the result against photos and paperwork."],
                  ["Purpose of use", "Private, commercial, dealer: ask the right follow-up."],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-2xl bg-teal-50 p-4">
                    <p className="text-sm font-black text-teal-950">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-teal-900">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
        {CORE_HOOKS.map((tool) => {
          const Icon = tool.icon;
          return (
            <article
              key={tool.title}
              className={`flex flex-col rounded-[1.75rem] border p-5 shadow-sm sm:p-6 ${
                tool.featured
                  ? "border-teal-200 bg-teal-50"
                  : "border-gray-200 bg-white"
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
              <h2 className="mt-4 text-xl font-black tracking-[-0.04em] text-gray-900">
                {tool.title}
              </h2>
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
      </section>

      <section className="mt-10 rounded-[2rem] border border-gray-200 bg-gray-50 p-5 shadow-sm sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
              The buying flow
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-4xl">
              Four checks. Less noise. Better decisions.
            </h2>
            <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
              The site is being stripped back around the buyer journey: rego, PPSR, inspection, handover. Everything else should support one of those steps or wait its turn.
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
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
            Marketplace hook
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-4xl">
            Found it on Facebook Marketplace? Start with the plate.
          </h2>
          <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
            A lot of buyers ask, "Is this a scam?" The faster question is: does the rego, VIN, description, seller story, PPSR, and paperwork all line up?
          </p>
          <div className="mt-5 grid gap-3">
            {[
              "Seller won't provide VIN or rego before inspection",
              "Purpose of use does not match the story",
              "Price is cheap but transfer/roadworthy details are vague",
              "Seller pushes deposit before PPSR",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden="true" />
                <p className="text-sm leading-6 text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-teal-200 bg-teal-50 p-5 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">
            SEO spider web
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-4xl">
            Build pages around jobs buyers already search.
          </h2>
          <div className="mt-5 grid gap-3">
            {SEO_WEB.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-black text-gray-900">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">{item.copy}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: CarFront, title: "Rego transfer QLD", copy: "Turn into a simple buyer handover checklist and internal links from rego/PPSR pages." },
          { icon: Wrench, title: "Roadworthy QLD", copy: "Explain safety certificate timing, buyer expectations, and seller questions without legal overclaiming." },
          { icon: FileText, title: "Private sale contract", copy: "Make paperwork feel like the final confidence step, not admin homework." },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-sm">
              <Icon className="h-6 w-6 text-teal-600" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-black tracking-[-0.04em] text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{item.copy}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-10 rounded-[2rem] border border-gray-900 bg-gray-950 p-6 text-center shadow-sm sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-300">
          Start here
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-[-0.06em] text-white sm:text-5xl">
          Before you message the seller, check the rego.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-300">
          If the rego result makes sense, move to PPSR. If the seller's story does not match, you just saved yourself a drive.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/rego-check"
            className="inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-2xl bg-teal-500 px-8 text-base font-black text-white transition hover:bg-teal-400"
          >
            Run free QLD rego check
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href="/ppsr"
            className="inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl border border-white/20 bg-white px-8 text-base font-black text-gray-950 transition hover:bg-gray-100"
          >
            Get PPSR report
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
