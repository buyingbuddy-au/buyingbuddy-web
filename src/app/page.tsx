import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Handshake,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CheckoutCancelledBanner } from "@/components/checkout-cancelled-banner";

const TRUST_PILLS = [
  "Buyer-side used-car help",
  "15+ yrs car-trade experience",
  "No dealer kickbacks",
  "Self-serve buying guidance",
] as const;

const PRIMARY_TOOLS = [
  {
    title: "Free Listing Check",
    copy: "Paste a listing and get a quick sanity check before you waste a call, weekend, or deposit.",
    href: "/check",
    cta: "Run a free check",
    icon: Search,
  },
  {
    title: "$4.95 PPSR Report",
    copy: "Check finance owing, stolen status, and written-off history, then get the result explained in plain English.",
    href: "/ppsr",
    cta: "Get PPSR report",
    icon: ShieldCheck,
  },
  {
    title: "$9.99 Deal Pack",
    copy: "Bundle the PPSR, contract pack, and guided handover steps when the car looks worth chasing.",
    href: "/pricing",
    cta: "See launch pricing",
    icon: Handshake,
  },
] as const;

const HOW_IT_WORKS = [
  {
    title: "Check the listing",
    copy: "Look for obvious red flags before you message the seller or send money.",
    icon: Search,
  },
  {
    title: "Verify the car",
    copy: "Run the PPSR so finance owing, stolen, and write-off risk is not guesswork.",
    icon: ShieldCheck,
  },
  {
    title: "Inspect it properly",
    copy: "Use the mobile checklist beside the car, not after you have already fallen in love with it.",
    icon: ClipboardCheck,
  },
  {
    title: "Do the paperwork",
    copy: "Use QLD private-sale paperwork and a handover record before money changes hands.",
    icon: FileText,
  },
] as const;

const RED_FLAGS = [
  "Seller pushes for a deposit before you inspect",
  "No VIN, no clear rego, or mismatched details",
  "Price looks too good for the kilometres and model",
  "Seller cannot explain finance owing or ownership",
  "No safety certificate plan for a QLD sale",
  "Pressure to skip the PPSR or paperwork",
] as const;

const FAQS = [
  {
    question: "Is Buying Buddy a buyer's agent?",
    answer:
      "Think of it as a self-serve buyer's-agent alternative. It gives you buyer-side checks, reports, inspection prompts, and paperwork guidance, but it does not find cars, negotiate for you, or handle the whole purchase.",
  },
  {
    question: "Why not just use the government PPSR site?",
    answer:
      "You can. Buying Buddy is for people who want the PPSR result and the plain-English next step in one simple flow, alongside the rest of the buying checklist.",
  },
  {
    question: "What should I do before sending a deposit?",
    answer:
      "Run the free listing check, get a PPSR, confirm the seller details match the car, and know what paperwork is needed for the handover. Do not let urgency replace verification.",
  },
  {
    question: "Is this only for Queensland?",
    answer:
      "The launch is QLD-first because private-sale paperwork and safety certificate rules are state-specific. PPSR basics are national, but the handover guidance is written for QLD buyers first.",
  },
] as const;

export const metadata: Metadata = {
  title: "Buying Buddy | Used Car Buying Help, PPSR Reports & Buyer-Side Tools",
  description:
    "Buying Buddy is a self-serve buyer's-agent alternative for used-car buyers, with free listing checks, $4.95 PPSR reports, inspection prompts, and private-sale paperwork.",
  keywords: [
    "used car buying help Australia",
    "buyer agent alternative Australia",
    "used car check Australia",
    "PPSR report Australia",
    "PPSR check QLD",
    "private car sale QLD",
    "used car inspection checklist",
    "QLD car sale contract",
    "Facebook Marketplace car scam",
    "Buying Buddy",
  ],
  alternates: {
    canonical: "https://buyingbuddy.com.au/",
  },
  openGraph: {
    title: "Buying Buddy | Used Car Buying Help, PPSR Reports & Buyer-Side Tools",
    description:
      "Buyer-side used-car help without a traditional buyer's-agent fee: free listing checks, $4.95 PPSR reports, inspection prompts, and private-sale paperwork.",
    url: "https://buyingbuddy.com.au/",
    siteName: "Buying Buddy",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Buying Buddy | Used Car Buying Help, PPSR Reports & Buyer-Side Tools",
    description:
      "Self-serve buyer-side tools for used-car buyers: listing checks, PPSR reports, inspection prompts, and paperwork guidance.",
  },
};

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <Suspense>
        <CheckoutCancelledBanner />
      </Suspense>

      <section className="rounded-[2rem] border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-white p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-teal-700 shadow-sm ring-1 ring-teal-100">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Buyer-side help for used-car buyers
            </div>

            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.07em] text-gray-900 sm:text-5xl lg:text-6xl">
              Buyer-side help before you buy a used car.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-700 sm:text-lg sm:leading-8">
              A self-serve alternative to a traditional buyer&apos;s agent: check the
              listing, run the PPSR, inspect the car, and sort the paperwork before money changes hands.
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

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/check"
                className="inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 text-base font-black text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
              >
                Run a free check
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/ppsr"
                className="inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl border border-gray-300 bg-white px-6 text-base font-black text-gray-900 transition hover:border-teal-300 hover:text-teal-700 active:scale-[0.98]"
              >
                Get a PPSR report — $4.95
              </Link>
            </div>

            <p className="mt-3 text-xs font-semibold text-gray-500">
              No sourcing fees, no dealer kickbacks, no pressure to upgrade.
            </p>
          </div>

          <aside className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">
              Buyer&apos;s-agent alternative
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] text-gray-900">
              Car-smart help, without handing the whole job over.
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Traditional buyer&apos;s agents can be useful, but most people just need
              a fast second set of eyes before they chase the wrong car. Buying Buddy
              turns car-trade experience into cheap, practical next steps.
            </p>
            <div className="mt-5 rounded-[1.25rem] border border-teal-200 bg-teal-50 p-4">
              <p className="text-sm font-black text-teal-950">Best first move:</p>
              <p className="mt-1 text-sm leading-6 text-teal-900">
                Paste the listing into the free check. If it still looks worth
                chasing, run the PPSR before sending money.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {PRIMARY_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <article
              key={tool.title}
              className="flex flex-col rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="inline-flex w-fit rounded-2xl bg-teal-50 p-3 text-teal-600">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-xl font-black tracking-[-0.04em] text-gray-900">
                {tool.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">{tool.copy}</p>
              <Link
                href={tool.href}
                className="mt-6 inline-flex min-h-[3rem] items-center justify-center rounded-2xl border border-gray-300 px-4 text-sm font-black text-gray-900 transition hover:border-teal-300 hover:text-teal-700"
              >
                {tool.cta}
              </Link>
            </article>
          );
        })}
      </section>

      <section className="mt-10 rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-4xl">
            A simple path from listing to handover.
          </h2>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((step, index) => {
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
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
            What we watch for
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-4xl">
            The buyer-side checks are the ones that save you money.
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-600">
            Buying Buddy brings the buyer&apos;s-agent mindset into a simple self-serve flow:
            spot risk early, verify the car, and keep the handover tidy.
          </p>
        </div>

        <div className="grid gap-3">
          {RED_FLAGS.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-[1.25rem] border border-gray-200 bg-white p-4 shadow-sm"
            >
              <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden="true" />
              <p className="text-sm leading-6 text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] border border-teal-200 bg-teal-50 p-6 text-center shadow-sm sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">
          Start here
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-5xl">
          Found a car? Get the buyer-side read before you chase it.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-teal-950">
          Paste the listing into the free check. If it passes the sniff test,
          run the PPSR before you talk money.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/check"
            className="inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-2xl bg-teal-600 px-8 text-base font-black text-white transition hover:bg-teal-700"
          >
            Run a free check
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl border border-teal-300 bg-white px-8 text-base font-black text-teal-800 transition hover:border-teal-500"
          >
            View pricing
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
