"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Car,
  CheckCircle,
  ClipboardList,
  FileSearch,
  FileText,
  Landmark,
  Loader2,
  Shield,
  Sparkles,
  Star,
  Wrench,
} from "lucide-react";
import BuddyChat from "@/components/buddy-chat";
import CTASection from "@/components/cta-section";
import SiteStickyCTA from "@/components/site-sticky-cta";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FreeCheckApiResponse } from "@/lib/types";

type SupportedUpgradeProduct = "ppsr" | "dealer_review" | "full_pack";

type BusyAction =
  | { type: "check" }
  | { type: "checkout"; product: SupportedUpgradeProduct }
  | null;

type HomepageCheckResult = FreeCheckApiResponse & {
  negotiation_script?: string | null;
};

type HomepageCheckResponse =
  | ({ ok: true } & HomepageCheckResult)
  | { ok: false; error?: string };

const URL_INPUT_ID = "free-check-listing-url";

const TRUST_STATS = [
  {
    icon: Shield,
    value: "PPSR + dealer context",
    label: "Know the legal and practical risk before you send a deposit.",
  },
  {
    icon: BadgeCheck,
    value: "QLD dealer-built workflow",
    label: "Written for private buyers who need sharper process, not sales fluff.",
  },
  {
    icon: Landmark,
    value: "Contracts, PPI, blog, inspect",
    label: "Move from listing check to paperwork and inspection without leaving the site.",
  },
] as const;

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Paste the listing",
    body: "Drop in the Facebook Marketplace, Carsales, or Gumtree URL. If you don't have the link yet, enter make, model, and year for a manual snapshot.",
    icon: FileSearch,
  },
  {
    step: "02",
    title: "Read the fast verdict",
    body: "Get the market read, ad-level red flags, and what to inspect next before you waste a Saturday driving across town.",
    icon: ClipboardList,
  },
  {
    step: "03",
    title: "Do the proper checks",
    body: "Escalate to PPSR, dealer review, PPI, and the QLD contract pack when the car still looks worth chasing.",
    icon: Wrench,
  },
] as const;

const PRODUCT_CARDS = [
  {
    product: "ppsr" as const,
    name: "PPSR Report",
    price: "$4.95",
    summary: "Finance owing, stolen status, and write-off history before you send money.",
    actionLabel: "Run PPSR Checkout",
    highlight: false,
    bullets: [
      "Official ownership and security-interest checks",
      "Plain-English risk summary",
      "Use before any deposit or final transfer",
    ],
  },
  {
    product: "dealer_review" as const,
    name: "Dealer Review",
    price: "$14.95",
    summary: "A sharper call on price, known faults, and whether the car is worth pursuing.",
    actionLabel: "Get Dealer Review",
    highlight: true,
    bullets: [
      "Everything in the PPSR layer",
      "Known make/model failure points",
      "Inspection and negotiation angles",
    ],
  },
  {
    product: "full_pack" as const,
    name: "Full Confidence Pack",
    price: "$34.95",
    summary: "Bundle the report workflow with QLD paperwork so handover day stays tight.",
    actionLabel: "Get Full Pack",
    highlight: false,
    bullets: [
      "Dealer review plus negotiation guidance",
      "Contract pack for QLD private sales",
      "Best when you're ready to move on one car",
    ],
  },
] as const;

const RESOURCE_CARDS = [
  {
    title: "Inspect the car yourself",
    body: "Use the guided inspection checklist while you're standing next to the vehicle.",
    href: "/inspect",
    cta: "Open Inspect Tool",
    icon: Car,
  },
  {
    title: "Book a pre-purchase inspection",
    body: "If you want a mechanic involved, submit the car details and we'll follow up.",
    href: "/ppi",
    cta: "Book PPI",
    icon: Wrench,
  },
  {
    title: "Use the QLD contract pack",
    body: "Get the paperwork sorted before handover so the deal isn't just a messy chat thread.",
    href: "/contract-pack",
    cta: "View Contract Pack",
    icon: FileText,
  },
  {
    title: "Read the buyer guides",
    body: "Use the blog when you want the longer version on scams, PPSR, and private-sale process.",
    href: "/blog",
    cta: "Browse Blog",
    icon: Star,
  },
] as const;

const FAQS = [
  {
    question: "What does the free listing check actually do?",
    answer:
      "It gives you a fast dealer-style read on the listing: market position, time listed, and obvious ad-level red flags. If you enter make/model/year manually, it generates a vehicle snapshot instead.",
  },
  {
    question: "When should I pay for PPSR?",
    answer:
      "Before you send a deposit and definitely before final payment. If there's finance owing, stolen status, or write-off history, you want that confirmed before the deal gets emotional.",
  },
  {
    question: "What if I need a mechanic?",
    answer:
      "Use /ppi. The self-guided /inspect flow is useful, but a qualified PPI is still the move when the car is expensive or the seller story feels thin.",
  },
  {
    question: "Is the contract pack a replacement for PPSR?",
    answer:
      "No. The contract pack tightens the paperwork and handover process. PPSR is what checks finance, theft, and write-off risk. Use both when the car still looks promising.",
  },
] as const;

function formatCurrency(value: string) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Not supplied";
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getListingSource(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "Manual snapshot";
  }
}

function getRiskTone(redFlags: string[]) {
  if (redFlags.length >= 3) {
    return {
      label: "High caution",
      className: "bg-red-50 text-red-700 border-red-100",
    };
  }

  if (redFlags.length >= 1) {
    return {
      label: "Proceed carefully",
      className: "bg-amber-50 text-amber-700 border-amber-100",
    };
  }

  return {
    label: "Cleaner listing",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };
}

function getProductLabel(product: SupportedUpgradeProduct) {
  switch (product) {
    case "ppsr":
      return "PPSR Report";
    case "dealer_review":
      return "Dealer Review";
    case "full_pack":
      return "Full Confidence Pack";
  }
}

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [rego, setRego] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [email, setEmail] = useState("");
  const [ppsrIdentifier, setPpsrIdentifier] = useState("");
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [checkError, setCheckError] = useState("");
  const [checkResult, setCheckResult] = useState<HomepageCheckResult | null>(null);
  const [, setSelectedProduct] = useState<SupportedUpgradeProduct | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);

  const isChecking = busyAction?.type === "check";
  const canRunCheck = Boolean(url.trim() || (make.trim() && model.trim() && year.trim()));
  const needsEmailForUrlCheck = Boolean(url.trim());
  const vehicleHeading =
    checkResult?.listing_title ||
    [year.trim(), make.trim(), model.trim()].filter(Boolean).join(" ") ||
    "your listing";
  const riskTone = checkResult ? getRiskTone(checkResult.red_flags) : null;

  useEffect(() => {
    if (checkResult) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [checkResult]);

  function focusHeroInput() {
    const input = document.getElementById(URL_INPUT_ID);
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
    input?.focus();
  }

  async function runFreeCheck() {
    if (!canRunCheck) {
      return;
    }

    setBusyAction({ type: "check" });
    setCheckError("");
    setCheckResult(null);

    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_url: url.trim() || undefined,
          email: email.trim() || undefined,
          make: make.trim() || undefined,
          model: model.trim() || undefined,
          year: year.trim() || undefined,
          rego: rego.trim() || undefined,
          asking_price: askingPrice.trim() || undefined,
        }),
      });

      const data = (await response.json()) as HomepageCheckResponse;

      if (!response.ok || !data.ok) {
        setCheckError(
          "error" in data && data.error
            ? data.error
            : "Something went wrong. Please try again.",
        );
        return;
      }

      setCheckResult(data);
    } catch {
      setCheckError("Network error. Please check your connection and try again.");
    } finally {
      setBusyAction(null);
    }
  }

  function handleFreeCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runFreeCheck();
  }

  async function handleUpgrade(product: SupportedUpgradeProduct) {
    setSelectedProduct(product);
    setCheckError("");

    if (product === "ppsr") {
      if (!ppsrIdentifier.trim()) {
        setCheckError("Enter the rego or VIN first.");
        return;
      }

      if (!email.trim()) {
        setCheckError("Enter your email so we know where to send the report.");
        return;
      }
    } else if (!url.trim()) {
      setCheckError(
        `Paste the listing URL first so we can start the ${getProductLabel(product)} checkout with the right car attached.`,
      );
      focusHeroInput();
      return;
    }

    setBusyAction({ type: "checkout", product });

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_url: url.trim(),
          email: email.trim() || `upgrade-${Date.now()}@buyingbuddy.local`,
          product,
          vehicle_identifier:
            product === "ppsr" ? ppsrIdentifier.trim().toUpperCase() : undefined,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        checkout_url?: string;
      };

      if (!response.ok || !data.ok || !data.checkout_url) {
        setCheckError(data.error ?? "Could not start checkout. Please try again.");
        return;
      }

      window.location.href = data.checkout_url;
    } catch {
      setCheckError("Network error. Please try again.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <>
      <section
        id="free-check"
        className="relative overflow-hidden bg-gradient-to-br from-navy-700 via-blue-900 to-navy-900 py-16 text-white"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-[10%] top-16 h-64 w-64 rounded-full bg-lime-500 blur-[100px]" />
          <div className="absolute right-[5%] top-24 h-72 w-72 rounded-full bg-blue-500 blur-[120px]" />
        </div>

        <div className="section-container relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-500">
              Private Car Buying Support for Queensland
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-[-0.05em] sm:text-6xl">
              Don&apos;t be the <span className="text-lime-500">mug who gets scammed</span> on
              Facebook Marketplace.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80 sm:text-xl">
              Paste any listing and get the quick verdict first. Then move into PPSR, dealer review,
              PPI, and QLD paperwork when the car still stacks up.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={focusHeroInput}
                className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-base"
              >
                Run Free Check
                <Sparkles className="h-5 w-5" />
              </button>
              <Link
                href="/free-checklist"
                className="inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-4 text-center text-base font-semibold text-white transition-all duration-200 hover:bg-white hover:text-navy-700"
              >
                Get Free Checklist
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {TRUST_STATS.map((item) => (
                <article
                  key={item.value}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <item.icon className="h-7 w-7 text-lime-500" />
                  <p className="mt-4 text-sm font-black text-white">{item.value}</p>
                  <p className="mt-2 text-xs leading-6 text-white/70">{item.label}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="card border-0 p-8 shadow-2xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-500">
              Free Listing Check
            </p>
            <h2 className="mt-3 text-3xl font-black text-navy-700">
              Paste the ad or enter the car manually.
            </h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              URL checks need an email address so the existing report flow can attach the listing to a
              lead. Manual make/model/year checks can run without one.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleFreeCheck}>
              <div>
                <label className="mb-2 block text-sm font-bold text-navy-700" htmlFor={URL_INPUT_ID}>
                  Listing URL
                </label>
                <input
                  id={URL_INPUT_ID}
                  type="url"
                  value={url}
                  onChange={(event) => {
                    setUrl(event.target.value);
                    setCheckError("");
                  }}
                  placeholder="Paste a Marketplace, Carsales, or Gumtree link"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-lime-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-bold text-navy-700" htmlFor="vehicle-make">
                    Make
                  </label>
                  <input
                    id="vehicle-make"
                    type="text"
                    value={make}
                    onChange={(event) => setMake(event.target.value)}
                    placeholder="Toyota"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-lime-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-navy-700" htmlFor="vehicle-model">
                    Model
                  </label>
                  <input
                    id="vehicle-model"
                    type="text"
                    value={model}
                    onChange={(event) => setModel(event.target.value)}
                    placeholder="Yaris"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-lime-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-navy-700" htmlFor="vehicle-year">
                    Year
                  </label>
                  <input
                    id="vehicle-year"
                    type="number"
                    inputMode="numeric"
                    value={year}
                    onChange={(event) => setYear(event.target.value)}
                    placeholder="2019"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-lime-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-bold text-navy-700" htmlFor="vehicle-rego">
                    Rego (optional)
                  </label>
                  <input
                    id="vehicle-rego"
                    type="text"
                    value={rego}
                    onChange={(event) => setRego(event.target.value.toUpperCase())}
                    placeholder="123ABC"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm uppercase focus:border-transparent focus:ring-2 focus:ring-lime-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-navy-700" htmlFor="asking-price">
                    Asking price
                  </label>
                  <input
                    id="asking-price"
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={askingPrice}
                    onChange={(event) => setAskingPrice(event.target.value)}
                    placeholder="24500"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-lime-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-navy-700" htmlFor="check-email">
                    Email {needsEmailForUrlCheck ? "(required)" : "(optional)"}
                  </label>
                  <input
                    id="check-email"
                    type="email"
                    value={email}
                    required={needsEmailForUrlCheck}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setCheckError("");
                    }}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-lime-500"
                  />
                </div>
              </div>

              {checkError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {checkError}
                </p>
              )}

              <button
                type="submit"
                disabled={
                  isChecking ||
                  !canRunCheck ||
                  (needsEmailForUrlCheck && !email.trim())
                }
                className="btn-primary inline-flex w-full items-center justify-center gap-2 px-8 py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Checking listing...
                  </>
                ) : (
                  "Run Free Check"
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {checkResult && (
        <section ref={resultsRef} className="bg-white py-16">
          <div className="section-container">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-500">
                  Your Snapshot
                </p>
                <h2 className="mt-4 text-4xl font-black text-navy-700">
                  Dealer-style read on {vehicleHeading}.
                </h2>
              </div>
              {riskTone && (
                <span
                  className={`inline-flex self-start rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${riskTone.className}`}
                >
                  {riskTone.label}
                </span>
              )}
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <article className="rounded-[2rem] bg-gradient-to-br from-navy-700 to-blue-950 p-8 text-white shadow-2xl">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-500">
                  {vehicleHeading}
                </p>
                <p className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">
                  {checkResult.verdict}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    ["Seller asking", formatCurrency(askingPrice)],
                    ["Market estimate", checkResult.market_value_estimate],
                    [
                      "Days listed",
                      checkResult.days_listed > 0
                        ? `${checkResult.days_listed} days live`
                        : "Fresh or unknown",
                    ],
                    ["Listing source", getListingSource(url)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-3xl border border-white/10 bg-white/5 p-5"
                    >
                      <span className="text-xs font-black uppercase tracking-[0.16em] text-white/60">
                        {label}
                      </span>
                      <strong className="mt-3 block text-2xl font-black text-white">
                        {value}
                      </strong>
                    </div>
                  ))}
                </div>
              </article>

              <div className="space-y-6">
                <article className="card p-8">
                  <h3 className="text-2xl font-black text-navy-700">Red flags</h3>
                  {checkResult.red_flags.length > 0 ? (
                    <ul className="mt-5 space-y-3 text-sm leading-7 text-gray-700">
                      {checkResult.red_flags.map((flag) => (
                        <li key={flag} className="flex items-start gap-3">
                          <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-red-500" />
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-gray-700">
                      No obvious ad-level red flags surfaced. That still does not replace PPSR or a proper
                      inspection, but it&apos;s a cleaner start than most listings.
                    </p>
                  )}
                </article>

                {checkResult.report && (
                  <article className="card p-8">
                    <h3 className="text-2xl font-black text-navy-700">What to inspect next</h3>
                    <ul className="mt-5 space-y-3 text-sm leading-7 text-gray-700">
                      {checkResult.report.what_to_check.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-lime-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <h4 className="mt-8 text-sm font-black uppercase tracking-[0.16em] text-lime-500">
                      Known issues
                    </h4>
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-gray-700">
                      {checkResult.report.known_issues.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <Wrench className="mt-1 h-5 w-5 shrink-0 text-navy-700" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                )}

                {checkResult.negotiation_script && (
                  <article className="rounded-[2rem] border border-lime-500/20 bg-lime-500/10 p-8">
                    <h3 className="text-2xl font-black text-navy-700">
                      Opening offer strategy
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-navy-700">
                      {checkResult.negotiation_script}
                    </p>
                  </article>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-gray-50 py-16" id="how-it-works">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-500">
              How It Works
            </p>
            <h2 className="mt-4 text-4xl font-black text-navy-700">
              Three steps. No showroom theatre.
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free, then only pay for the extra protection when the car still looks worth chasing.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <article key={item.step} className="card p-8">
                <div className="inline-flex rounded-2xl bg-navy-700 p-4">
                  <item.icon className="h-8 w-8 text-lime-500" />
                </div>
                <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-lime-500">
                  Step {item.step}
                </p>
                <h3 className="mt-3 text-2xl font-black text-navy-700">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-gray-700">{item.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/how-it-works"
              className="inline-flex font-black text-navy-700 underline decoration-lime-500/50 underline-offset-4 hover:text-lime-500"
            >
              Read the full process
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16" id="pricing">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-500">
              Pricing
            </p>
            <h2 className="mt-4 text-4xl font-black text-navy-700">
              Pick the layer of protection that matches the risk.
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              If you&apos;re not ready to pay yet, use the free checklist or the live listing check first.
            </p>
          </div>

          <div className="mt-12 grid gap-8 xl:grid-cols-3">
            {PRODUCT_CARDS.map((product) => {
              const checkoutPending =
                busyAction?.type === "checkout" &&
                busyAction.product === product.product;

              return (
                <article
                  key={product.product}
                  className={`card p-8 ${
                    product.highlight ? "ring-2 ring-lime-500 shadow-2xl" : ""
                  }`}
                >
                  {product.highlight && (
                    <div className="-mt-11 mb-6 inline-flex rounded-full bg-lime-500 px-4 py-1 text-sm font-semibold text-white">
                      Best Value
                    </div>
                  )}

                  <h3 className="text-2xl font-black text-navy-700">{product.name}</h3>
                  <p className="mt-3 text-5xl font-black tracking-[-0.05em] text-gray-900">
                    {product.price}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-gray-700">{product.summary}</p>

                  <ul className="mt-8 space-y-3 text-sm leading-7 text-gray-700">
                    {product.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-lime-500" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {product.product === "ppsr" && (
                    <div className="mt-8">
                      <label
                        className="mb-2 block text-sm font-bold text-navy-700"
                        htmlFor="ppsr-identifier"
                      >
                        Rego or VIN
                      </label>
                      <input
                        id="ppsr-identifier"
                        type="text"
                        value={ppsrIdentifier}
                        onChange={(event) =>
                          setPpsrIdentifier(event.target.value.toUpperCase())
                        }
                        placeholder="ABC123 or JM0DK2W7601234567"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm uppercase focus:border-transparent focus:ring-2 focus:ring-lime-500"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={busyAction !== null}
                    onClick={() => void handleUpgrade(product.product)}
                    className={`mt-8 inline-flex w-full items-center justify-center rounded-lg px-6 py-3 text-center font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                      product.highlight
                        ? "bg-lime-500 text-white hover:bg-lime-600"
                        : "border-2 border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-white"
                    }`}
                  >
                    {checkoutPending ? "Opening checkout..." : product.actionLabel}
                  </button>
                </article>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/pricing"
              className="inline-flex font-black text-navy-700 underline decoration-lime-500/50 underline-offset-4 hover:text-lime-500"
            >
              Compare the packages
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-500">
              More Tools
            </p>
            <h2 className="mt-4 text-4xl font-black text-navy-700">
              Keep moving once the car passes the first sniff test.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-4">
            {RESOURCE_CARDS.map((item) => (
              <article key={item.title} className="card p-8">
                <item.icon className="h-10 w-10 text-lime-500" />
                <h3 className="mt-5 text-2xl font-black text-navy-700">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-gray-700">{item.body}</p>
                <Link
                  href={item.href}
                  className="mt-6 inline-flex font-black text-navy-700 underline decoration-lime-500/50 underline-offset-4 hover:text-lime-500"
                >
                  {item.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16" id="faq">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-500">
              FAQ
            </p>
            <h2 className="mt-4 text-4xl font-black text-navy-700">
              The short answers before you start clicking around.
            </h2>
          </div>

          <Accordion type="single" collapsible className="mx-auto mt-12 max-w-4xl">
            {FAQS.map((faq) => (
              <AccordionItem
                key={faq.question}
                value={faq.question}
                className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 px-6"
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

      <BuddyChat />

      <CTASection
        title="Check the listing before you chase the car."
        subtitle="Start free. If the seller story still stacks up, run PPSR, book a PPI, or grab the QLD contract pack before you hand over money."
        primaryText="Run Free Check"
        primaryHref="/#free-check"
        secondaryText="View Contract Pack"
        secondaryHref="/contract-pack"
      />

      <SiteStickyCTA text="Run the free listing check" buttonText="Check Free" />
    </>
  );
}
