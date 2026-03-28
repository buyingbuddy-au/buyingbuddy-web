"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { FreeCheckApiResponse } from "@/lib/types";

type FreeCheckResponse =
  | ({ ok: true } & FreeCheckApiResponse)
  | { ok: false; error?: string };

type SupportedUpgradeProduct = "ppsr" | "dealer_review" | "full_pack";

type BusyAction =
  | { type: "check" }
  | { type: "checkout"; product: SupportedUpgradeProduct }
  | null;

const URL_INPUT_ID = "hero-input";

const TRUST_INDICATORS = [
  {
    title: "Built by a Licensed QLD Car Dealer",
    body: "Straight advice from the side of the desk that has seen bad private deals unravel in real life.",
  },
  {
    title: "15+ Years Industry Experience",
    body: "Market instinct, PPSR context, and practical buying advice shaped by years in the trade.",
  },
  {
    title: "100% Aussie Owned",
    body: "Built in Queensland for Australian private buyers who need a sharper process before they inspect.",
  },
] as const;

const STEPS = [
  {
    number: "01",
    title: "Paste the listing",
    body: "Drop in the Marketplace, Carsales, or Gumtree URL. Add the car name and seller ask if you want a cleaner snapshot.",
  },
  {
    number: "02",
    title: "Read the quick verdict",
    body: "You get a fast read on market position, listing age, and obvious ad-level red flags before you waste a trip.",
  },
  {
    number: "03",
    title: "Protect the deal properly",
    body: "Run the PPSR, get a dealer review, and bring the right QLD paperwork before money changes hands.",
  },
] as const;

const CHECK_TABLE = [
  {
    check: "Ad quality and seller signals",
    description: "Whether the listing reads clean, vague, rushed, or too good to be true.",
  },
  {
    check: "Market value context",
    description: "A fast sense-check on where the ad sits versus what similar cars should be worth.",
  },
  {
    check: "Time on market",
    description: "Long-running ads can tell you more than the seller ever will.",
  },
  {
    check: "PPSR risk checks",
    description: "Finance owing, stolen status, and write-off history when you upgrade to a paid check.",
  },
  {
    check: "Dealer review notes",
    description: "Known issues, inspection traps, and what an experienced buyer would offer.",
  },
  {
    check: "QLD paperwork readiness",
    description: "Contract, receipt, condition report, and transfer guidance for the handover day.",
  },
] as const;

const PAID_PRODUCTS = [
  {
    key: "ppsr",
    name: "PPSR Report",
    price: "$4.95",
    description: "Official finance, stolen, and write-off checks before you send a deposit.",
    features: [
      "Finance owing and security interests",
      "Stolen vehicle register result",
      "Statutory and repairable write-off status",
      "Fast, plain-English summary",
    ],
    cta: "Run PPSR Check - $4.95",
    type: "checkout",
    highlight: false,
  },
  {
    key: "dealer_review",
    name: "Dealer Review",
    price: "$14.95",
    description: "A sharper opinion on price, risk, and whether the car is worth your time.",
    features: [
      "Everything in the PPSR Report",
      "Fair price opinion from a dealer's perspective",
      "Known issues for that make, model, and year",
      "Inspection traps and opening-offer guidance",
    ],
    cta: "Get Dealer Review - $14.95",
    type: "checkout",
    highlight: true,
    badge: "Best Value",
  },
  {
    key: "contract_pack",
    name: "Private Sale Contract Pack",
    price: "$9.95",
    description: "QLD-specific paperwork for the day you actually hand over money.",
    features: [
      "QLD vehicle sale contract",
      "Receipt of payment template",
      "Vehicle condition report",
      "Transfer of registration guide",
    ],
    cta: "View Contract Pack - $9.95",
    type: "link",
    href: "/contract-pack",
    highlight: false,
  },
] as const;

const FAQS = [
  {
    question: "What does the free listing check actually do?",
    answer:
      "It gives you a fast dealer-style read on the listing: market position, time listed, and obvious ad-level red flags. It is designed to help you decide whether the car is worth more effort.",
  },
  {
    question: "When should I pay for the PPSR?",
    answer:
      "Before you send a deposit and definitely before final payment. If there is finance owing or write-off history, you want to know before the deal gets emotional.",
  },
  {
    question: "Who writes the Dealer Review?",
    answer:
      "Buying Buddy is built by a licensed QLD dealer with more than 15 years in the industry, so the advice is grounded in real appraisal and trade experience.",
  },
  {
    question: "Why would I buy the contract pack?",
    answer:
      "Private sales in Queensland do not give you dealer protections. The contract pack makes the paperwork tighter, records the condition properly, and reduces the chance of a messy handover.",
  },
  {
    question: "Does the contract pack replace a PPSR check?",
    answer:
      "No. The contract pack protects the paperwork side of the deal. The PPSR protects you from buying a car with finance, theft, or write-off issues.",
  },
  {
    question: "Is this just for Queensland buyers?",
    answer:
      "The listing check, PPSR, and Dealer Review work for Australian buyers broadly. The contract pack is specifically written for Queensland private sale handovers.",
  },
] as const;

function formatCurrency(value: string) {
  if (!value.trim()) {
    return "Not supplied";
  }

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
    const hostname = new URL(value).hostname.replace(/^www\./, "");
    return hostname;
  } catch {
    return "Listing link";
  }
}

function getRiskLabel(redFlags: string[]) {
  if (redFlags.length >= 3) {
    return { label: "High caution", tone: "high" as const };
  }

  if (redFlags.length >= 1) {
    return { label: "Proceed carefully", tone: "medium" as const };
  }

  return { label: "Cleaner listing", tone: "low" as const };
}

function getProductLabel(product: SupportedUpgradeProduct) {
  switch (product) {
    case "ppsr":
      return "PPSR Report";
    case "dealer_review":
      return "Dealer Review";
    case "full_pack":
      return "Full Confidence Pack";
    default:
      return "product";
  }
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [carName, setCarName] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [email, setEmail] = useState("");
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<FreeCheckApiResponse | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<SupportedUpgradeProduct | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);

  const isChecking = busyAction?.type === "check";
  const busy = busyAction !== null;
  const risk = checkResult ? getRiskLabel(checkResult.red_flags) : null;
  const selectedProductLabel = selectedProduct ? getProductLabel(selectedProduct) : null;
  const vehicleHeading = carName.trim() || checkResult?.listing_title || "your listing";

  useEffect(() => {
    if (!checkResult) {
      return;
    }

    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [checkResult]);

  function focusHeroInput() {
    document.getElementById(URL_INPUT_ID)?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById(URL_INPUT_ID)?.focus();
  }

  async function runFreeCheck() {
    if (!url.trim()) return;

    setBusyAction({ type: "check" });
    setCheckError(null);
    setCheckResult(null);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_url: url.trim(), email: email.trim() || "" }),
      });

      const data = (await res.json()) as FreeCheckResponse;

      if (!res.ok || !data.ok) {
        setCheckError(("error" in data ? data.error : undefined) ?? "Something went wrong. Please try again.");
      } else {
        setCheckResult(data);
      }
    } catch {
      setCheckError("Network error. Please check your connection and try again.");
    } finally {
      setBusyAction(null);
    }
  }

  function handleFreeCheck(e: FormEvent) {
    e.preventDefault();
    void runFreeCheck();
  }

  async function handleUpgrade(product: SupportedUpgradeProduct) {
    setSelectedProduct(product);
    setCheckError(null);

    if (!url.trim()) {
      focusHeroInput();
      return;
    }

    setBusyAction({ type: "checkout", product });

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_url: url.trim(),
          email: email.trim() || `upgrade-${Date.now()}@buyingbuddy.local`,
          product,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setCheckError(data.error ?? "Could not start checkout. Please try again.");
      } else if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch {
      setCheckError("Network error. Please try again.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <>
      <section className="section hero-section">
        <div className="container hero-layout">
          <div className="hero-copy">
            <p className="eyebrow">Private Car Buying Tools for Queensland</p>
            <h1 className="hero-title">
              Spot risky private car listings before you inspect, negotiate, or pay.
            </h1>
            <p className="hero-description">
              Buying Buddy gives QLD private buyers a sharper process: a free listing check, official
              PPSR protection, a dealer review, and the paperwork to close the deal properly.
            </p>

            <div className="hero-chip-row" aria-label="What Buying Buddy helps with">
              <span className="hero-chip">Free listing sanity check</span>
              <span className="hero-chip">Official PPSR protection</span>
              <span className="hero-chip">QLD handover paperwork</span>
            </div>

            <div className="hero-proof-grid" aria-label="Key benefits">
              <div className="hero-proof-card">
                <span className="hero-proof-value">Free</span>
                <p className="hero-proof-label">Quick read before you waste a trip</p>
              </div>
              <div className="hero-proof-card">
                <span className="hero-proof-value">$4.95</span>
                <p className="hero-proof-label">PPSR check before any deposit or transfer</p>
              </div>
              <div className="hero-proof-card">
                <span className="hero-proof-value">$9.95</span>
                <p className="hero-proof-label">QLD contract pack for a tighter handover day</p>
              </div>
            </div>
          </div>

          <div className="hero-search-card">
            <div className="hero-card-head">
              <p className="hero-card-kicker">Free Listing Check</p>
              <p className="hero-card-copy">
                Optional car details make the snapshot clearer. The listing URL is the only required field.
              </p>
            </div>

            <form className="hero-form" onSubmit={handleFreeCheck}>
              <div className="hero-field hero-field-wide">
                <label className="hero-label" htmlFor={URL_INPUT_ID}>
                  Listing URL
                </label>
                <input
                  className="hero-input"
                  id={URL_INPUT_ID}
                  placeholder="Paste a Facebook Marketplace, Carsales, or Gumtree link"
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setCheckError(null);
                  }}
                />
              </div>

              <div className="hero-field-row">
                <div className="hero-field">
                  <label className="hero-label" htmlFor="car-name">
                    Car Name
                  </label>
                  <input
                    className="hero-input"
                    id="car-name"
                    placeholder="2019 Mazda CX-3 Akari"
                    type="text"
                    value={carName}
                    onChange={(e) => setCarName(e.target.value)}
                  />
                </div>

                <div className="hero-field">
                  <label className="hero-label" htmlFor="asking-price">
                    Asking Price
                  </label>
                  <div className="hero-price-input">
                    <span aria-hidden="true">$</span>
                    <input
                      className="hero-input hero-input-price"
                      id="asking-price"
                      inputMode="numeric"
                      min="0"
                      placeholder="24500"
                      type="number"
                      value={askingPrice}
                      onChange={(e) => setAskingPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="hero-field-row hero-field-row-action">
                <div className="hero-field">
                  <label className="hero-label" htmlFor="check-email">
                    Email
                  </label>
                  <input
                    className="hero-input"
                    id="check-email"
                    placeholder="Optional for the free check"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button className="button button-primary hero-submit" type="submit" disabled={busy || !url.trim()}>
                  {isChecking ? "Checking listing..." : "Run Free Check"}
                </button>
              </div>
            </form>

            <div className="hero-trust" aria-label="Trust badges">
              <span>Licensed QLD dealer built</span>
              <span>15+ years in the trade</span>
              <span>Australian owned</span>
              <span>Private-buyer focused</span>
            </div>

            {selectedProductLabel && !url.trim() && (
              <p className="hero-inline-tip">
                Paste the listing URL first so we can start the {selectedProductLabel} checkout with the
                right vehicle attached.
              </p>
            )}

            {checkError && (
              <p className="hero-error" role="alert">
                {checkError}
              </p>
            )}

            {checkResult && (
              <div className="hero-result" role="status" aria-live="polite">
                <p className="hero-result-kicker">Free snapshot ready</p>
                <p className="hero-result-title">{vehicleHeading}</p>
                <p className="hero-result-copy">{checkResult.verdict}</p>
                <button
                  className="button button-secondary hero-result-button"
                  onClick={() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  type="button"
                >
                  View premium snapshot
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section trust-band" id="trust">
        <div className="container">
          <div className="trust-band-grid">
            {TRUST_INDICATORS.map((item) => (
              <article className="trust-card" key={item.title}>
                <p className="trust-card-title">{item.title}</p>
                <p className="trust-card-copy">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {checkResult && (
        <section className="section premium-results-section" ref={resultsRef}>
          <div className="container">
            <div className="results-heading">
              <div>
                <p className="eyebrow">Your Free Snapshot</p>
                <h2 className="section-title">Dealer-style read on {vehicleHeading}</h2>
              </div>
              {risk && (
                <span className={`results-risk results-risk-${risk.tone}`}>
                  {risk.label}
                </span>
              )}
            </div>

            <div className="results-shell">
              <article className="results-primary-card">
                <p className="results-title">{vehicleHeading}</p>
                <p className="results-verdict">{checkResult.verdict}</p>

                <div className="results-metric-grid">
                  <div className="results-metric-card">
                    <span className="results-metric-label">Seller asking</span>
                    <strong className="results-metric-value">{formatCurrency(askingPrice)}</strong>
                  </div>
                  <div className="results-metric-card">
                    <span className="results-metric-label">Market estimate</span>
                    <strong className="results-metric-value">{checkResult.market_value_estimate}</strong>
                  </div>
                  <div className="results-metric-card">
                    <span className="results-metric-label">Days listed</span>
                    <strong className="results-metric-value">
                      {checkResult.days_listed > 0 ? `${checkResult.days_listed} days live` : "Fresh or unknown"}
                    </strong>
                  </div>
                  <div className="results-metric-card">
                    <span className="results-metric-label">Listing source</span>
                    <strong className="results-metric-value">{getListingSource(url)}</strong>
                  </div>
                </div>

                <div className="results-summary-strip">
                  <div>
                    <span className="results-summary-label">Listing title</span>
                    <p className="results-summary-copy">{checkResult.listing_title}</p>
                  </div>
                  {carName.trim() && (
                    <div>
                      <span className="results-summary-label">Your supplied car name</span>
                      <p className="results-summary-copy">{carName.trim()}</p>
                    </div>
                  )}
                </div>
              </article>

              <div className="results-side-stack">
                <article className="results-side-card">
                  <h3 className="results-side-title">What stood out</h3>
                  {checkResult.red_flags.length > 0 ? (
                    <ul className="results-flag-list">
                      {checkResult.red_flags.map((flag) => (
                        <li key={flag}>{flag}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="results-side-copy">
                      No obvious red flags surfaced in the ad copy. That does not replace a PPSR or proper
                      inspection, but it is a cleaner start than most private listings.
                    </p>
                  )}
                </article>

                <article className="results-side-card">
                  <h3 className="results-side-title">Best next step</h3>
                  <div className="results-action-list">
                    <button
                      className="results-action-card"
                      onClick={() => void handleUpgrade("ppsr")}
                      type="button"
                      disabled={busy}
                    >
                      <span className="results-action-meta">PPSR Report - $4.95</span>
                      <strong>Check finance, stolen status, and write-offs</strong>
                    </button>
                    <button
                      className="results-action-card"
                      onClick={() => void handleUpgrade("dealer_review")}
                      type="button"
                      disabled={busy}
                    >
                      <span className="results-action-meta">Dealer Review - $14.95</span>
                      <strong>Get a sharper verdict before you inspect</strong>
                    </button>
                    <Link className="results-action-card results-action-link" href="/contract-pack">
                      <span className="results-action-meta">Contract Pack - $9.95</span>
                      <strong>Lock down the QLD paperwork before payment day</strong>
                    </Link>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section section-alt" id="how-it-works">
        <div className="container">
          <p className="eyebrow">How It Works</p>
          <h2 className="section-title">A cleaner buying process in three steps.</h2>
          <div className="steps-grid">
            {STEPS.map((step) => (
              <div className="step-card" key={step.number}>
                <span className="step-number" aria-hidden="true">
                  {step.number}
                </span>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-body">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="container">
          <p className="eyebrow">Paid Products</p>
          <h2 className="section-title">Buy only the layer of protection you need.</h2>
          <p className="section-intro pricing-intro">
            Start with the free listing check. When the car still looks promising, add the official data,
            dealer judgement, or the paperwork that keeps the handover tight.
          </p>

          <div className="pricing-grid premium-pricing-grid">
            {PAID_PRODUCTS.map((product) => {
              const isSelected = selectedProduct === product.key;
              const badge = "badge" in product ? product.badge : null;
              const checkoutLabel =
                busyAction?.type === "checkout" && busyAction.product === product.key
                  ? "Opening checkout..."
                  : product.cta;

              return (
                <article
                  className={[
                    "pricing-card",
                    product.highlight ? "pricing-card-primary" : "",
                    isSelected ? "pricing-card-selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={product.key}
                >
                  {badge && <span className="pricing-badge">{badge}</span>}
                  <div className="pricing-heading">
                    <h3 className="pricing-name">{product.name}</h3>
                    <p className="pricing-price">{product.price}</p>
                    <p className="pricing-description">{product.description}</p>
                  </div>

                  <ul className="pricing-list">
                    {product.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>

                  {product.type === "checkout" ? (
                    <button
                      className={`button ${product.highlight ? "button-primary" : "button-dark"}`}
                      onClick={() => void handleUpgrade(product.key)}
                      disabled={busy}
                      type="button"
                    >
                      {checkoutLabel}
                    </button>
                  ) : (
                    <Link className="button button-dark" href={product.href}>
                      {product.cta}
                    </Link>
                  )}
                </article>
              );
            })}
          </div>

          <div className="bundle-callout">
            <div>
              <p className="eyebrow">Need the Whole Playbook?</p>
              <h3 className="bundle-title">The Full Confidence Pack is still here when you want everything.</h3>
              <p className="bundle-copy">
                Dealer review, negotiation guidance, and buyer support in one checkout for buyers who want
                the strongest version of the process.
              </p>
            </div>
            <button className="button button-primary" onClick={() => void handleUpgrade("full_pack")} type="button" disabled={busy}>
              {busyAction?.type === "checkout" && busyAction.product === "full_pack"
                ? "Opening checkout..."
                : "Get Full Confidence Pack - $34.95"}
            </button>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <p className="eyebrow">What Gets Checked</p>
          <h2 className="section-title">The parts private buyers usually miss.</h2>
          <div className="check-table">
            <div className="check-table-header">
              <span>Check</span>
              <span>What it tells you</span>
            </div>
            {CHECK_TABLE.map((row) => (
              <div className="check-table-row" key={row.check}>
                <span className="check-name">{row.check}</span>
                <span className="check-description">{row.description}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark proof-section">
        <div className="container dealer-proof-shell">
          <div>
            <p className="eyebrow eyebrow-on-dark">Dealer-Built Protection</p>
            <h2 className="final-cta-title dealer-proof-title">
              Built by a licensed dealer who has seen every scam.
            </h2>
            <p className="final-cta-copy dealer-proof-copy">
              Deposits sent too early. Cars with finance still attached. Sellers who promise one thing and
              hand over another. Buying Buddy exists because private buyers need better process, not better
              slogans.
            </p>
          </div>

          <blockquote className="proof-quote dealer-proof-quote">
            <p>
              "The goal is simple: help private buyers slow the deal down, check the right things, and show
              up with paperwork that makes the seller take them seriously."
            </p>
            <cite className="proof-meta">Buying Buddy, Brisbane QLD</cite>
          </blockquote>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container">
          <h2 className="section-title">Questions</h2>
          <div className="faq-wrap">
            {FAQS.map((item) => (
              <details className="faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <div className="faq-answer">{item.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark final-cta">
        <div className="container">
          <h2 className="final-cta-title">Check the listing before you chase the car.</h2>
          <p className="final-cta-copy">
            Start free. Add the PPSR, Dealer Review, or QLD contract pack when the deal starts getting real.
          </p>
          <div className="final-cta-actions">
            <button className="button button-on-dark" onClick={focusHeroInput} type="button">
              Run Free Check
            </button>
            <Link className="button button-secondary" href="/contract-pack">
              View Contract Pack
            </Link>
          </div>
        </div>
      </section>

      <div className="sticky-bar">
        <div className="container sticky-bar-inner">
          <span className="sticky-bar-copy">Free listing check for QLD buyers</span>
          <button
            className="button button-primary button-small"
            onClick={focusHeroInput}
            type="button"
          >
            Check Free
          </button>
        </div>
      </div>
    </>
  );
}
