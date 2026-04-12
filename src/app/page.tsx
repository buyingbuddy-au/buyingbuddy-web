import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  Flag,
  Handshake,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { CheckoutCancelledBanner } from "@/components/checkout-cancelled-banner";

const TOOLKIT_CARDS = [
  {
    href: "/check",
    title: "Free Car Check",
    description:
      "Paste a listing URL and get a fast sanity check before you waste a call or a weekend.",
    icon: Search,
  },
  {
    href: "/ppsr",
    title: "PPSR Report",
    description: "Finance, stolen, and write-off checks. Straightforward, fast, and cheap.",
    icon: ShieldCheck,
  },
  {
    href: "/inspect",
    title: "Inspect Tool",
    description: "25-point guided inspection checklist you can use standing next to the car.",
    icon: ClipboardCheck,
  },
  {
    href: "/contract-pack",
    title: "Contract Pack",
    description: "QLD private sale paperwork without the usual stuffing around.",
    icon: FileText,
  },
  {
    href: "/deal",
    title: "Deal Room",
    description: "Shared digital handover workspace for buyer and seller.",
    icon: Handshake,
  },
  {
    href: "/buddy",
    title: "AI Chat",
    description: "Ask used-car questions in plain English and get a quick answer.",
    icon: MessageCircle,
  },
  {
    href: "/blog",
    title: "Blog & Guides",
    description: "Brisbane and QLD buying guides, scams, PPSR explainers, and checklists.",
    icon: BookOpenText,
  },
] as const;

const TRUST_BADGES = [
  "15+ years in the car industry",
  "Lexus and BMW award winner",
  "No dealer kickbacks or hidden commissions",
] as const;

const PAIN_POINTS = [
  {
    title: "You don’t know what the car is really worth",
    copy:
      "Most buyers only see the asking price. Sellers live in the pricing game every day. That gap is where people get rinsed.",
  },
  {
    title: "The inspection usually happens too late",
    copy:
      "By the time most people book an inspection, they’re already emotionally attached and half-committed to the car.",
  },
  {
    title: "You burn weekends chasing the wrong cars",
    copy:
      "Facebook Marketplace and dealer stock can look fine in photos, then fall apart once you dig into history, condition, or pricing.",
  },
] as const;

const SERVICE_PILLARS = [
  {
    title: "Find the right car",
    copy:
      "Real-world guidance on what fits your budget, what to avoid, and which listings are actually worth chasing.",
    icon: Search,
  },
  {
    title: "Negotiate hard",
    copy:
      "Dealer background, wholesale understanding, and none of the awkwardness of doing the haggling yourself.",
    icon: CircleDollarSign,
  },
  {
    title: "Arrange inspection",
    copy:
      "Independent checks before you commit, with a clean walk-away if the car doesn’t stack up.",
    icon: ClipboardCheck,
  },
] as const;

const PROCESS_STEPS = [
  {
    title: "Tell me what you actually need",
    copy:
      "Budget, must-haves, dealbreakers, and how the car will be used. If your expectations are off, I’ll tell you upfront.",
  },
  {
    title: "I shortlist and vet the right options",
    copy:
      "I look at listings through a dealer lens, screen out junk, and focus on cars worth negotiating on.",
  },
  {
    title: "We negotiate, inspect, and close properly",
    copy:
      "I handle the price pressure, line up the inspection, and help you move only when the numbers and condition make sense.",
  },
] as const;

const FAQS = [
  {
    question: "What do you actually do that an inspection company doesn’t?",
    answer:
      "Inspection companies inspect a car you’ve already found. BuyingBuddy helps before that point too. I help choose the right car, assess whether the asking price is nonsense, negotiate it down, and only then push it through inspection.",
  },
  {
    question: "Do you only help in Brisbane?",
    answer:
      "Brisbane is the core focus, especially the western suburbs and wider SEQ. If the right car is slightly outside that footprint, I can still help depending on the deal.",
  },
  {
    question: "Is it really a flat fee?",
    answer:
      "Yes. The buyer’s agent service is positioned as a flat $997 fee. No dealer commissions, no inspection kickbacks, no hidden margin for steering you into the wrong car.",
  },
  {
    question: "What if the car fails inspection?",
    answer:
      "Then we renegotiate or we walk. The whole point is to keep you out of bad cars, not talk you into one because you’ve already spent time on it.",
  },
  {
    question: "Can I still use the free tools if I don’t want the full service?",
    answer:
      "Absolutely. The toolkit is still there. Run a free check, grab a PPSR, use the inspection checklist, or download the contract pack if you’re handling the deal yourself.",
  },
] as const;

const SERVICE_AREAS = [
  "Brisbane",
  "Pullenvale",
  "Kenmore",
  "Chapel Hill",
  "Brookfield",
  "Moggill",
  "Indooroopilly",
  "The Gap",
] as const;

export const metadata: Metadata = {
  title: "Car Buyer’s Agent Brisbane | BuyingBuddy",
  description:
    "Brisbane car buyer’s agent service plus free car checks, PPSR reports, inspection tools, and QLD paperwork. BuyingBuddy helps you find, negotiate, and inspect the right used car.",
  keywords: [
    "car buyers agent Brisbane",
    "used car buyer's agent Brisbane",
    "pre purchase car inspection Brisbane",
    "car buying service Brisbane",
    "buy used car Brisbane",
    "used car inspection Brisbane",
    "QLD used car buyer help",
    "BuyingBuddy Brisbane",
  ],
  alternates: {
    canonical: "https://buyingbuddy.com.au/",
  },
  openGraph: {
    title: "Car Buyer’s Agent Brisbane | BuyingBuddy",
    description:
      "Find, negotiate, and inspect the right used car in Brisbane. Plus free checks, PPSR reports, and QLD paperwork.",
    url: "https://buyingbuddy.com.au/",
    siteName: "BuyingBuddy",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Car Buyer’s Agent Brisbane | BuyingBuddy",
    description:
      "Brisbane buyer’s agent service, free car checks, PPSR reports, and QLD paperwork in one place.",
  },
};

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <Suspense>
        <CheckoutCancelledBanner />
      </Suspense>

      <section className="rounded-[2rem] border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-white p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-teal-700 shadow-sm ring-1 ring-teal-100">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Brisbane car buyer’s agent
            </div>

            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.07em] text-gray-900 sm:text-5xl lg:text-6xl">
              Stop getting ripped off buying a car in Brisbane.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
              Flat-fee help for buyers who want someone on their side before
              they waste time, overpay, or buy the wrong car. We help you find
              the right option, negotiate hard, and line up the inspection
              before you hand over cash.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {TRUST_BADGES.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center rounded-full bg-white px-3 py-2 text-xs font-bold text-gray-700 ring-1 ring-gray-200"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl bg-teal-600 px-6 text-base font-black text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
              >
                Book a free 15-minute call
              </Link>
              <Link
                href="#toolkit"
                className="inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl border border-gray-300 bg-white px-6 text-base font-black text-gray-900 transition hover:border-teal-200 hover:text-teal-700 active:scale-[0.98]"
              >
                See the self-serve tools
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <article className="rounded-[1.5rem] border border-white bg-white/90 p-4 shadow-sm ring-1 ring-teal-100">
                <p className="text-2xl font-black tracking-[-0.05em] text-gray-900">$997</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">Flat fee for the buyer’s agent service.</p>
              </article>
              <article className="rounded-[1.5rem] border border-white bg-white/90 p-4 shadow-sm ring-1 ring-teal-100">
                <p className="text-2xl font-black tracking-[-0.05em] text-gray-900">3-in-1</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">Find, negotiate, and inspect, handled properly.</p>
              </article>
              <article className="rounded-[1.5rem] border border-white bg-white/90 p-4 shadow-sm ring-1 ring-teal-100">
                <p className="text-2xl font-black tracking-[-0.05em] text-gray-900">Brisbane</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">Local positioning built for west-side and SEQ buyers.</p>
              </article>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">
              What you’re paying for
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] text-gray-900 sm:text-3xl">
              A buyer’s agent who works for the buyer.
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
              Not an inspection-only report. Not a generic checklist. Not a
              dealer pushing stock. Actual representation on the buy side.
            </p>

            <div className="mt-5 grid gap-3">
              {SERVICE_PILLARS.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[1.25rem] border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-teal-100 p-2 text-teal-700">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black tracking-[-0.03em] text-gray-900 sm:text-base">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                          {item.copy}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-[1.25rem] border border-teal-200 bg-teal-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
                Brisbane west
              </p>
              <p className="mt-2 text-sm leading-6 text-teal-900">
                Based around Brisbane’s western suburbs, with dedicated local
                information for buyers who want someone nearby and switched on.
              </p>
              <Link
                href="/car-buyers-agent-pullenvale"
                className="mt-3 inline-flex items-center gap-2 text-sm font-black text-teal-800 underline decoration-teal-300 underline-offset-4"
              >
                View Pullenvale page
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-10">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
            Why this matters
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-4xl">
            You’re about to spend serious money on a car. The seller usually knows more than you.
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-600">
            Buying a used car is risky when you’re making a big decision with
            less information than the person selling it. That’s exactly where a
            buyer’s agent earns their keep.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {PAIN_POINTS.map((item) => (
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
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
              The offer
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-4xl">
              One fee. One person accountable. No hidden agenda.
            </h2>
            <p className="mt-4 text-base leading-7 text-gray-600">
              Flat-fee representation for used-car buyers in Brisbane, backed by
              practical tools if you want to handle parts of the process
              yourself.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-teal-200 bg-white p-5 shadow-sm lg:w-[320px]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">
              Buyer’s agent package
            </p>
            <p className="mt-3 text-4xl font-black tracking-[-0.06em] text-gray-900">$997</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Flat fee positioning for Brisbane buyers who want the whole thing handled properly.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-2xl bg-teal-600 px-5 text-sm font-black text-white transition hover:bg-teal-700"
            >
              Ask about the service
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {SERVICE_PILLARS.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="inline-flex rounded-2xl bg-teal-50 p-3 text-teal-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-black tracking-[-0.04em] text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{item.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-4xl">
            Three steps. No mucking around.
          </h2>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {PROCESS_STEPS.map((step, index) => (
            <article
              key={step.title}
              className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm"
            >
              <p className="text-3xl font-black tracking-[-0.05em] text-teal-600">
                0{index + 1}
              </p>
              <h3 className="mt-4 text-lg font-black tracking-[-0.04em] text-gray-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
              Why trust Jordan
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-4xl">
              Experience matters when you’re trying not to buy a problem.
            </h2>
            <p className="mt-4 text-base leading-7 text-gray-600">
              15 years in the trade, award-winning dealership background, and a
              clear conflict-free model. The fee doesn’t change based on which
              car you buy, so the incentive stays aligned with the buyer.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <article className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-4">
                <BadgeCheck className="h-5 w-5 text-teal-600" aria-hidden="true" />
                <h3 className="mt-3 text-base font-black tracking-[-0.03em] text-gray-900">
                  Award-winning background
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Lexus Used Car Consultant of the Year and BMW Booking of the Year.
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-4">
                <Star className="h-5 w-5 text-teal-600" aria-hidden="true" />
                <h3 className="mt-3 text-base font-black tracking-[-0.03em] text-gray-900">
                  Built for Brisbane buyers
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Local knowledge matters when buyers want practical advice, realistic pricing, and a car that suits Brisbane life.
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-4">
                <Flag className="h-5 w-5 text-teal-600" aria-hidden="true" />
                <h3 className="mt-3 text-base font-black tracking-[-0.03em] text-gray-900">
                  Plain-English process
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  No fluff, no call-centre tone, and no vague promises about saving money without doing the work.
                </p>
              </article>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-teal-200 bg-teal-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
              Simple maths
            </p>
            <h3 className="mt-3 text-2xl font-black tracking-[-0.05em] text-gray-900">
              A small pricing mistake can cost more than the fee.
            </h3>
            <p className="mt-3 text-sm leading-6 text-teal-950">
              Overpay by just 5% on a $25,000 used car and you’ve burned $1,250.
              That’s before hidden issues, rushed inspection decisions, or finance/write-off surprises.
            </p>
            <div className="mt-4 rounded-[1.25rem] border border-teal-200 bg-white p-4">
              <p className="text-sm font-black text-gray-900">Built around Brisbane buyers</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-gray-600">
                <li>• West-side suburb focus</li>
                <li>• Used-car negotiation support</li>
                <li>• Inspection-first decision making</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
              Local service area
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-4xl">
              Brisbane-first support, especially across the western suburbs.
            </h2>
            <p className="mt-4 text-base leading-7 text-gray-600">
              Starting in Brisbane’s west makes sense, busy families, acreage
              buyers, 4WD shoppers, and people who don’t want to waste a whole
              Saturday looking at rubbish cars.
            </p>
          </div>

          <Link
            href="/car-buyers-agent-pullenvale"
            className="inline-flex min-h-[3.25rem] items-center justify-center rounded-2xl border border-gray-300 bg-white px-5 text-sm font-black text-gray-900 transition hover:border-teal-200 hover:text-teal-700"
          >
            Open suburb page
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          {SERVICE_AREAS.map((area) => (
            <span
              key={area}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700"
            >
              <MapPin className="h-4 w-4 text-teal-600" aria-hidden="true" />
              {area}
            </span>
          ))}
        </div>
      </section>

      <section id="toolkit" className="mt-10">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
            Still want the tools?
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-4xl">
            Prefer to handle it yourself? Use the tools and keep moving.
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-600">
            If you’re doing the legwork yourself, you can still run checks,
            order reports, use the inspection tool, and grab the paperwork you
            need without creating an account.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4">
          {TOOLKIT_CARDS.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-[1.75rem] border border-gray-200 bg-white p-4 shadow-sm transition active:scale-[0.98] hover:border-teal-200 hover:shadow-md sm:gap-4 sm:p-5"
              >
                <div className="inline-flex shrink-0 rounded-[1.25rem] bg-teal-50 p-3 text-teal-600 sm:p-4">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-black tracking-[-0.05em] text-gray-900 sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-sm leading-5 text-gray-500 sm:mt-1 sm:leading-6">
                    {item.description}
                  </p>
                </div>

                <ChevronRight
                  className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:text-teal-600 sm:h-6 sm:w-6"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">FAQ</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-4xl">
            The obvious questions, answered properly.
          </h2>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
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

      <section className="mt-10 rounded-[2rem] bg-gray-900 p-6 text-white shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-300">
          Final CTA
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-[-0.06em] sm:text-4xl">
          Want the whole buy handled properly, or just need one quick tool?
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-300">
          Start with the buyer’s agent call if you want real help. Start with a
          tool if you’re still handling parts of it yourself. Either way, you
          don’t need to walk into the deal blind.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl bg-teal-500 px-6 text-base font-black text-white transition hover:bg-teal-400"
          >
            Book the call
          </Link>
          <Link
            href="/check"
            className="inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl border border-gray-700 px-6 text-base font-black text-white transition hover:border-teal-400 hover:text-teal-300"
          >
            Run a free check
          </Link>
        </div>
      </section>
    </div>
  );
}
