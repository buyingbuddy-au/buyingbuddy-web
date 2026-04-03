import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Shield } from "lucide-react";
import CTASection from "@/components/cta-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Contact & FAQs | Buying Buddy",
  description:
    "Contact Buying Buddy for Queensland car-buying support and read the most common PPSR, inspection, and contract questions.",
};

const CONTACT_METHODS = [
  {
    title: "Email",
    description: "Detailed questions, support requests, or car listings you want a second set of eyes on.",
    value: "info@buyingbuddy.com.au",
    href: "mailto:info@buyingbuddy.com.au",
    icon: Mail,
    recommended: true,
  },
  {
    title: "Free listing check",
    description: "Need a fast verdict on a car right now? Paste the listing URL into the homepage check flow.",
    value: "Run the homepage check",
    href: "/check",
    icon: MessageCircle,
    recommended: false,
  },
  {
    title: "Book a PPI",
    description: "Want a mechanic involved before purchase? Use the PPI enquiry page and we'll follow up.",
    value: "Open the PPI form",
    href: "/ppi",
    icon: Shield,
    recommended: false,
  },
] as const;

const FAQS = [
  {
    question: "How quickly do I get a PPSR or listing verdict?",
    answer:
      "The homepage free check returns a fast snapshot straight away. Paid and manual reviews depend on the product and vehicle details supplied.",
  },
  {
    question: "Is the contract pack Queensland-specific?",
    answer:
      "Yes. The contract pack is written for Queensland private-sale handovers and should be used alongside a PPSR check, not instead of one.",
  },
  {
    question: "Do you inspect cars in person?",
    answer:
      "The /inspect route is a guided self-inspection tool. If you want a mechanic involved, use /ppi and send the car details.",
  },
  {
    question: "Can you give a quick opinion before I message the seller?",
    answer:
      "Yes. Use /second-opinion or the homepage free listing check, then escalate to PPSR, PPI, or contract paperwork if the car still looks worth chasing.",
  },
  {
    question: "What if I'm buying outside Queensland?",
    answer:
      "The listing read can still help, but the contract pack and transfer guidance are built around Queensland private-sale process and should not be treated as state-agnostic legal advice.",
  },
  {
    question: "What's the best order of operations?",
    answer:
      "Run the free check, verify legal status with PPSR, inspect the car properly, negotiate with facts, then use the right paperwork at handover.",
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-navy-700 via-blue-900 to-navy-800 py-16 text-white">
        <div className="section-container text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-500">
            Contact & FAQs
          </p>
          <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-black tracking-[-0.04em] sm:text-6xl">
            Got a question about a listing, PPSR, or QLD paperwork?
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/80 sm:text-xl">
            Start with email or use the live tools already in Repo A. No fake form handlers, no dead routes.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/85">
            <Clock className="h-4 w-4 text-lime-500" />
            Usually reply within one business day
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="section-container">
          <div className="grid gap-8 lg:grid-cols-3">
            {CONTACT_METHODS.map((method) => (
              <article
                key={method.title}
                className={`card p-8 text-center ${method.recommended ? "ring-2 ring-lime-500" : ""}`}
              >
                {method.recommended && (
                  <div className="-mt-11 mb-6 inline-flex rounded-full bg-lime-500 px-4 py-1 text-sm font-semibold text-white">
                    Recommended
                  </div>
                )}
                <div
                  className={`mx-auto inline-flex rounded-2xl p-4 ${
                    method.recommended ? "bg-lime-500" : "bg-navy-700"
                  }`}
                >
                  <method.icon className="h-8 w-8 text-white" />
                </div>
                <h2 className="mt-6 text-2xl font-black text-navy-700">{method.title}</h2>
                <p className="mt-4 text-sm leading-7 text-gray-700">{method.description}</p>
                <Link
                  href={method.href}
                  className="mt-6 inline-flex font-black text-navy-700 underline decoration-lime-500/40 underline-offset-4 hover:text-lime-500"
                >
                  {method.value}
                </Link>
              </article>
            ))}
          </div>

          <div className="card mx-auto mt-12 max-w-3xl p-8 text-center">
            <MapPin className="mx-auto h-12 w-12 text-lime-500" />
            <h2 className="mt-4 text-2xl font-black text-navy-700">Queensland-focused</h2>
            <p className="mt-4 text-sm leading-7 text-gray-700">
              Advice and paperwork are written around Queensland private-sale process. If you're outside QLD,
              treat the contract content carefully and check your local transfer rules.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-500">
              FAQs
            </p>
            <h2 className="mt-4 text-4xl font-black text-navy-700">
              The questions that usually come up first.
            </h2>
          </div>

          <Accordion type="single" collapsible className="mx-auto mt-12 max-w-4xl">
            {FAQS.map((faq) => (
              <AccordionItem
                key={faq.question}
                value={faq.question}
                className="mb-4 rounded-2xl border border-gray-200 bg-white px-6"
              >
                <AccordionTrigger className="py-6 text-left text-base font-black text-navy-700 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-sm leading-7 text-gray-700">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <CTASection
        title="Still choosing between tools?"
        subtitle="Start with the free checklist or run a live listing check on the homepage."
        primaryText="Run Free Check"
        primaryHref="/check"
        secondaryText="Download Free Checklist"
        secondaryHref="/free-checklist"
      />
    </>
  );
}
