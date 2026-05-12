import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CheckoutCancelledBanner } from "@/components/checkout-cancelled-banner";
import { HomeRegoStarter } from "@/components/home-rego-starter";

const NEXT_STEPS = [
  {
    title: "Rego first",
    copy: "Check status, expiry, VIN, description, and use type before you waste a drive.",
    icon: BadgeCheck,
  },
  {
    title: "Then PPSR",
    copy: "If the rego story lines up, run the $4.95 PPSR before deposit or transfer.",
    icon: ShieldCheck,
  },
  {
    title: "Then inspect + paperwork",
    copy: "Use the checklist and QLD handover pack only when the car is still in the game.",
    icon: ClipboardCheck,
  },
] as const;

const MOBILE_STEPS = [
  { label: "1", title: "Free rego" },
  { label: "2", title: "$4.95 PPSR" },
  { label: "3", title: "Buy safer" },
] as const;

const SUPPORT_TOOLS = [
  {
    title: "Free listing check",
    copy: "Paste the ad when the seller story feels weird.",
    href: "/check",
    cta: "Check listing",
    icon: Search,
  },
  {
    title: "Inspection checklist",
    copy: "Use it beside the car before emotion takes over.",
    href: "/inspect",
    cta: "Open checklist",
    icon: ClipboardCheck,
  },
  {
    title: "QLD handover pack",
    copy: "Contract, receipt, condition report, and transfer guide.",
    href: "/contract-pack",
    cta: "Get paperwork",
    icon: FileText,
  },
] as const;

const FAQS = [
  {
    question: "What should I do first?",
    answer:
      "Enter the QLD rego. If the rego, VIN, vehicle description, and use type look sensible, then run PPSR before money changes hands.",
  },
  {
    question: "Is rego enough to buy the car?",
    answer:
      "No. Rego is the first filter. PPSR is the money check: finance owing, stolen status, and written-off history.",
  },
  {
    question: "What is Buying Buddy really selling?",
    answer:
      "Cheap buyer-side tools for private used-car buyers. Start free with rego. Pay $4.95 for PPSR when the car is worth checking properly.",
  },
] as const;

export const metadata: Metadata = {
  title: "Buying Buddy | Free QLD Rego Check & $4.95 PPSR",
  description:
    "Enter a QLD rego, check the basics for free, then run a $4.95 PPSR before you pay a stranger for a used car.",
  keywords: [
    "QLD rego check",
    "free QLD rego check",
    "PPSR check QLD",
    "used car check Queensland",
    "private car sale QLD paperwork",
    "Facebook Marketplace car scams",
    "Buying Buddy",
  ],
  alternates: {
    canonical: "https://buyingbuddy.com.au/",
  },
  openGraph: {
    title: "Buying Buddy | Start With The Rego",
    description:
      "Check a QLD rego for free, then run a $4.95 PPSR before deposit if the car still looks worth chasing.",
    url: "https://buyingbuddy.com.au/",
    siteName: "Buying Buddy",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Buying Buddy | Start With The Rego",
    description: "Free QLD rego check first. $4.95 PPSR before money changes hands.",
  },
};

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-3 pb-10 pt-3 sm:px-6 lg:px-8 lg:pt-8">
      <Suspense>
        <CheckoutCancelledBanner />
      </Suspense>

      <section className="overflow-hidden rounded-[1.5rem] border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-white shadow-sm sm:rounded-[2rem]">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-stretch">
          <div className="p-4 sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-teal-700 shadow-sm ring-1 ring-teal-100">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Free QLD rego check
            </div>

            <h1 className="mt-4 max-w-2xl text-[2.65rem] font-black leading-[0.92] tracking-[-0.06em] text-gray-950 sm:text-5xl lg:text-6xl">
              Got the plate? Start here.
            </h1>

            <p className="mt-4 max-w-xl text-[15px] leading-7 text-gray-700 sm:text-lg">
              Type the QLD rego. Check it free. If it still looks good, run PPSR before deposit.
            </p>

            <HomeRegoStarter />

            <div className="mt-4 grid grid-cols-3 gap-2 md:hidden" aria-label="Buying Buddy mobile buyer flow">
              {MOBILE_STEPS.map((step) => (
                <div key={step.title} className="rounded-2xl border border-teal-100 bg-white/80 px-2.5 py-3 text-center shadow-sm">
                  <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs font-black text-white">
                    {step.label}
                  </span>
                  <p className="mt-2 text-[11px] font-black leading-tight text-gray-950">{step.title}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[13px] font-semibold leading-6 text-gray-600 sm:text-sm">
              Rego first. PPSR second. Paperwork only if the car survives the checks.
            </p>
          </div>

          <aside className="hidden border-t border-teal-100 bg-white/80 p-5 sm:p-6 md:block lg:border-l lg:border-t-0 lg:p-8">
            <div className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">
                Simple buyer flow
              </p>
              <div className="mt-5 grid gap-3">
                {NEXT_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.title} className="flex gap-3 rounded-2xl bg-gray-50 p-4">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-black text-white">
                        {index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-teal-600" aria-hidden="true" />
                          <h2 className="text-sm font-black text-gray-950">{step.title}</h2>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-gray-600">{step.copy}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link
                href="/ppsr"
                className="mt-5 inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-4 text-sm font-black text-gray-950 transition hover:border-teal-300 hover:text-teal-700"
              >
                Already have VIN? Get PPSR — $4.95
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-5 rounded-[1.5rem] border border-gray-200 bg-white p-4 shadow-sm sm:mt-8 sm:rounded-[2rem] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">What this is</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-gray-950 sm:text-4xl">
              One simple flow, not a pile of tools.
            </h2>
            <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
              Buying Buddy helps private buyers avoid expensive used-car mistakes. Rego check is the front door. PPSR is the main paid product. The other tools support the same buy.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/rego-check"
              className="flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-3 transition hover:-translate-y-0.5 hover:shadow-md sm:block sm:rounded-[1.5rem] sm:p-5"
            >
              <BadgeCheck className="h-6 w-6 shrink-0 text-teal-700" aria-hidden="true" />
              <div>
                <h3 className="text-base font-black tracking-[-0.02em] text-gray-950 sm:mt-4 sm:text-lg">Free rego check</h3>
                <p className="mt-1 text-xs leading-5 text-teal-950 sm:mt-2 sm:text-sm sm:leading-6">First filter for QLD cars.</p>
              </div>
            </Link>
            <Link
              href="/ppsr"
              className="flex items-center gap-3 rounded-2xl border border-gray-900 bg-gray-950 p-3 text-white transition hover:-translate-y-0.5 hover:shadow-md sm:block sm:rounded-[1.5rem] sm:p-5"
            >
              <ShieldCheck className="h-6 w-6 shrink-0 text-teal-300" aria-hidden="true" />
              <div>
                <h3 className="text-base font-black tracking-[-0.02em] sm:mt-4 sm:text-lg">$4.95 PPSR</h3>
                <p className="mt-1 text-xs leading-5 text-gray-300 sm:mt-2 sm:text-sm sm:leading-6">Main paid check.</p>
              </div>
            </Link>
            <Link
              href="/deal"
              className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 transition hover:-translate-y-0.5 hover:shadow-md sm:block sm:rounded-[1.5rem] sm:p-5"
            >
              <FileText className="h-6 w-6 shrink-0 text-teal-700" aria-hidden="true" />
              <div>
                <h3 className="text-base font-black tracking-[-0.02em] text-gray-950 sm:mt-4 sm:text-lg">$9.99 Deal Pack</h3>
                <p className="mt-1 text-xs leading-5 text-gray-600 sm:mt-2 sm:text-sm sm:leading-6">PPSR + handover.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8 hidden md:block">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Support tools</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-gray-950 sm:text-4xl">
              Extra help when you need it.
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-gray-600">
            The listing, inspection, and paperwork tools sit underneath the rego-to-PPSR flow so the page does not feel like five equal offers at once.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {SUPPORT_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
              >
                <Icon className="h-6 w-6 text-teal-600" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-black tracking-[-0.02em] text-gray-950">{tool.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{tool.copy}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-teal-700">
                  {tool.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-[1.5rem] border border-gray-900 bg-gray-950 p-5 text-center shadow-sm sm:mt-8 sm:rounded-[2rem] sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-300">Got a car in mind?</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-[-0.035em] text-white sm:text-5xl">
          Don’t pay first. Check first.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-300">
          Rego is the free starting point. PPSR is the paid proof before money changes hands.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/rego-check"
            className="inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-2xl bg-teal-500 px-8 text-base font-black text-white transition hover:bg-teal-400"
          >
            Check QLD rego
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href="/ppsr"
            className="inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl border border-white/20 bg-white px-8 text-base font-black text-gray-950 transition hover:bg-gray-100"
          >
            PPSR report — $4.95
          </Link>
        </div>
      </section>

      <section className="mt-8 hidden md:block">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">FAQs</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {FAQS.map((item) => (
            <article key={item.question} className="rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-black tracking-[-0.03em] text-gray-950">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
