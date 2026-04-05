import { Suspense } from "react";
import Link from "next/link";
import {
  BookOpenText,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileText,
  Flag,
  Handshake,
  MessageCircle,
  Search,
  Shield,
  Sparkles,
} from "lucide-react";
import { CheckoutCancelledBanner } from "@/components/checkout-cancelled-banner";

const TOOLKIT_CARDS = [
  {
    href: "/check",
    title: "Free Car Check",
    description:
      "AI-powered listing check. Paste a URL or enter make/model/year.",
    icon: Search,
  },
  {
    href: "/ppsr",
    title: "PPSR Report",
    description: "Finance, stolen, write-off checks. From $4.95.",
    icon: Shield,
  },
  {
    href: "/inspect",
    title: "Inspect Tool",
    description: "25-point guided inspection checklist. Use at the car.",
    icon: ClipboardCheck,
  },
  {
    href: "/contract-pack",
    title: "Contract Pack",
    description: "QLD private sale paperwork. From $9.95.",
    icon: FileText,
  },
  {
    href: "/deal",
    title: "Deal Room",
    description: "Shared digital handover workspace. Buyer + seller. $39.95.",
    icon: Handshake,
  },
  {
    href: "/buddy",
    title: "Buddy Chat",
    description: "Ask anything about buying a used car in QLD.",
    icon: MessageCircle,
  },
  {
    href: "/blog",
    title: "Blog & Guides",
    description: "28 guides on scams, PPSR, inspections, and QLD process.",
    icon: BookOpenText,
  },
] as const;

const TRUST_BADGES = [
  { label: "Licensed QLD Dealer", icon: Shield },
  { label: "15+ Years Experience", icon: Clock3 },
  { label: "Australian Built", icon: Flag },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pt-14">
      <Suspense><CheckoutCancelledBanner /></Suspense>
      <section className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-teal-700">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          QLD private buyers
        </div>

        <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-[-0.06em] text-gray-900 sm:text-6xl">
          Buy your next car without the risk.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
          Instant PPSR checks, AI-powered inspections, and QLD-compliant
          paperwork.
        </p>

        <Link
          href="/check"
          className="mt-8 inline-flex min-h-[3.75rem] w-full items-center justify-center rounded-2xl bg-teal-600 px-6 text-base font-black text-white shadow-sm transition hover:bg-teal-700 sm:w-auto"
        >
          Run Free Check
        </Link>
      </section>

      <section className="mt-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
          Your Toolkit
        </p>

        <div className="mt-4 grid gap-4">
          {TOOLKIT_CARDS.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-4 rounded-[1.75rem] border border-gray-200 bg-gray-50 p-4 shadow-sm transition hover:border-teal-200 hover:bg-white hover:shadow-md sm:p-5"
              >
                <div className="inline-flex rounded-[1.25rem] bg-teal-50 p-4 text-teal-600">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-black tracking-[-0.05em] text-gray-900">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    {item.description}
                  </p>
                </div>

                <ChevronRight
                  className="h-6 w-6 shrink-0 text-gray-400 transition group-hover:text-teal-600"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10 grid grid-cols-3 gap-3 rounded-[2rem] border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        {TRUST_BADGES.map((badge) => {
          const Icon = badge.icon;

          return (
            <article
              key={badge.label}
              className="flex flex-col items-center rounded-[1.5rem] bg-gray-50 px-3 py-4 text-center"
            >
              <Icon className="h-5 w-5 text-teal-600" aria-hidden="true" />
              <p className="mt-3 text-[11px] font-black uppercase tracking-[0.12em] text-gray-900 sm:text-xs">
                {badge.label}
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
