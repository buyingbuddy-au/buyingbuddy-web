"use client";

import { useState } from "react";
import type { FreeCheckResult } from "@/lib/types";

const STEPS = [
  {
    number: "01",
    title: "Paste the listing",
    body: "Drop the URL from Facebook Marketplace, Carsales, or Gumtree into the search bar. That's it.",
  },
  {
    number: "02",
    title: "Get your results",
    body: "Our free check gives you an instant snapshot — market value, days listed, red flags in the ad. Want more? Upgrade to a full report.",
  },
  {
    number: "03",
    title: "Buy with confidence",
    body: "Whether you use the free check or the full dealer review, you'll know exactly what you're walking into. No surprises.",
  },
];

const PRODUCTS = [
  {
    name: "Free Listing Check",
    price: "Free",
    product: "free_check" as const,
    description: "Paste any listing. Get a snapshot in seconds.",
    features: [
      "Market value estimate",
      "How long it's been listed",
      "Red flags in the ad",
      "Quick verdict: worth seeing or not",
    ],
    cta: "Check a Listing — Free",
    ctaAction: "free",
    highlight: false,
  },
  {
    name: "PPSR Report",
    price: "$4.95",
    product: "ppsr" as const,
    description: "The essential check before any private purchase. Cheapest in Australia.",
    features: [
      "Finance owing check",
      "Stolen vehicle register",
      "Write-off status (statutory + repairable)",
      "Security interest search",
      "Delivered as a branded PDF",
    ],
    cta: "Run PPSR Check — $4.95",
    ctaAction: "ppsr",
    highlight: false,
    smallPrint: "Official PPSR data. Same source licensed dealers use.",
  },
  {
    name: "Dealer Review",
    price: "$14.95",
    product: "dealer_review" as const,
    description: "A real automotive specialist reviews the listing and gives you their honest take.",
    features: [
      "Everything in the PPSR Report",
      "Pricing opinion — fair, overpriced, or a bargain?",
      "Known issues for that specific make, model, and year",
      "What to look for when you inspect it",
      "\"What I'd offer\" — a suggested opening price",
    ],
    cta: "Get Dealer Review — $14.95",
    ctaAction: "dealer_review",
    highlight: true,
    badge: "Most Popular",
    smallPrint: "Reviewed by a specialist with 15+ years in the Australian automotive industry.",
  },
  {
    name: "Full Confidence Pack",
    price: "$34.95",
    product: "full_pack" as const,
    description: "Everything you need to buy the car safely and negotiate properly.",
    features: [
      "Everything in the Dealer Review",
      "Negotiation script written for that specific deal",
      "QLD private sale contract template (ready to print and sign)",
      "Pre-inspection checklist tailored to the make/model",
      "48-hour text support — ask us anything during the purchase",
    ],
    cta: "Get Full Pack — $34.95",
    ctaAction: "full_pack",
    highlight: false,
    smallPrint: "The most comprehensive private car buying package in Australia.",
  },
];

const CHECK_TABLE = [
  { check: "PPSR Search", description: "Finance owing, security interests, encumbrances" },
  { check: "Stolen Register", description: "Whether the car has been reported stolen nationally" },
  { check: "Write-Off Status", description: "Statutory and repairable write-off history" },
  { check: "Rego History", description: "Registration status and transfer records" },
  { check: "Vehicle Identity", description: "VIN verification and compliance plate data" },
  { check: "Specialist Summary", description: "Plain-English verdict you can actually understand" },
];

const FAQS = [
  {
    question: "How fast do I get results?",
    answer:
      "The free listing check is instant. PPSR reports are delivered within minutes. Dealer Reviews are usually returned within a few hours during business hours.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. Paste the URL, choose your product, pay, and it's sent to your email.",
  },
  {
    question: "Where does the data come from?",
    answer:
      "Official Australian government databases — PPSR, NEVDIS, and state transport authorities. The same sources licensed dealers use every day.",
  },
  {
    question: "Who reviews the listings?",
    answer:
      "Our reviews are done by an automotive specialist with over 15 years of experience across major Australian dealerships and the wholesale market.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Yes. If you're not satisfied with any paid product, we'll refund you in full. No questions.",
  },
  {
    question: "What if I'm buying from a dealer, not privately?",
    answer:
      "Our checks work for any vehicle. But the private sale contract and negotiation tools are specifically designed for private purchases where you don't have dealer protections.",
  },
];

function formatDollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<FreeCheckResult | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  async function handleFreeCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setChecking(true);
    setCheckError(null);
    setCheckResult(null);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_url: url.trim(), email: email.trim() || "free-check@" }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setCheckError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setCheckResult(data as FreeCheckResult);
      }
    } catch {
      setCheckError("Network error. Please check your connection and try again.");
    } finally {
      setChecking(false);
    }
  }

  async function handleUpgrade(product: string) {
    if (!url.trim()) {
      setSelectedProduct(product);
      document.getElementById("hero-input")?.focus();
      return;
    }

    setChecking(true);
    setCheckError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_url: url.trim(),
          email: email.trim() || "upgrade@" + Date.now() + ".com",
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
      setChecking(false);
    }
  }

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="section hero-section">
        <div className="container hero-layout">
          <div className="hero-copy">
            <p className="eyebrow">Vehicle Reports for Private Buyers</p>
            <h1 className="hero-title">
              Know what you&apos;re buying before you hand over your money.
            </h1>
            <p className="hero-description">
              Paste any car listing from Facebook Marketplace, Carsales, or
              Gumtree. We&apos;ll tell you if it&apos;s worth your time — for free.
              Need the full picture? Our team runs official PPSR checks, flags
              hidden problems, and gives you a dealer-level verdict.
            </p>
          </div>

          <div className="hero-search-card">
            <form className="hero-form" onSubmit={handleFreeCheck}>
              <label className="sr-only" htmlFor="listing-url">
                Listing URL or rego number
              </label>
              <input
                className="hero-input"
                id="hero-input"
                placeholder="Paste a listing URL or enter a rego number"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <label className="sr-only" htmlFor="check-email">
                Email address (optional for free check)
              </label>
              <input
                className="hero-input"
                id="check-email"
                placeholder="Your email (optional for free check)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="button button-primary hero-submit"
                type="submit"
                disabled={checking || !url.trim()}
              >
                {checking ? "Checking…" : "Check Listing — Free"}
              </button>
            </form>

            <div className="hero-trust" aria-label="Trust badges">
              <span>✓ Official PPSR data</span>
              <span>·</span>
              <span>✓ Results in minutes</span>
              <span>·</span>
              <span>✓ Money-back guarantee</span>
              <span>·</span>
              <span>✓ Australian owned</span>
            </div>

            {checkError && (
              <p className="hero-error" role="alert">
                {checkError}
              </p>
            )}

            {checkResult && (
              <div className="hero-result" role="region" aria-label="Listing result">
                <p className="result-verdict">{checkResult.analysis.listing_verdict}</p>
                {checkResult.analysis.market_value_low && (
                  <p className="result-market">
                    Market value:{" "}
                    <strong>
                      {formatDollars(checkResult.analysis.market_value_low)}–{formatDollars(checkResult.analysis.market_value_high ?? checkResult.analysis.market_value_low)}
                    </strong>
                  </p>
                )}
                {checkResult.analysis.days_listed !== null && (
                  <p className="result-days">Listed {checkResult.analysis.days_listed} days</p>
                )}
                {checkResult.analysis.red_flags.length > 0 && (
                  <ul className="result-flags">
                    {checkResult.analysis.red_flags.map((flag) => (
                      <li key={flag}>⚠ {flag}</li>
                    ))}
                  </ul>
                )}
                {checkResult.listing && (
                  <p className="result-summary">{checkResult.listing.title}</p>
                )}
                <p className="result-upgrade">
                  Like what you see? Upgrade for the full PPSR check, dealer
                  review, or Full Confidence Pack below.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="section section-alt" id="how-it-works">
        <div className="container">
          <p className="eyebrow">How It Works</p>
          <h2 className="section-title">Three steps. Total clarity.</h2>
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

      {/* ── WHAT WE CHECK ────────────────────────────────── */}
      <section className="section" id="trust">
        <div className="container">
          <p className="eyebrow">What&apos;s in the Report</p>
          <h2 className="section-title">Everything a licensed dealer checks.</h2>
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

      {/* ── SOCIAL PROOF ─────────────────────────────────── */}
      <section className="section section-dark proof-section">
        <div className="container">
          <p className="proof-stat">
            <span className="proof-amount">$93.5M</span> lost to vehicle scams
            in 2023 — ACCC
          </p>
          <blockquote className="proof-quote">
            <p>
              &ldquo;I was about to put a deposit down on a CX-5. The report
              flagged a repairable write-off the seller never mentioned. Saved
              me from a $14,000 mistake.&rdquo;
            </p>
            <cite className="proof-meta">
              Leah T., Brisbane QLD ★★★★★
            </cite>
          </blockquote>
        </div>
      </section>

      {/* ── PRODUCTS ─────────────────────────────────────── */}
      <section className="section" id="pricing">
        <div className="container">
          <p className="eyebrow">What We Offer</p>
          <h2 className="section-title">Choose how deep you want to go.</h2>
          <div className="pricing-grid">
            {PRODUCTS.map((product) => (
              <article
                className={`pricing-card${product.highlight ? " pricing-card-primary" : ""}`}
                key={product.product}
              >
                {product.badge && (
                  <span className="pricing-badge">{product.badge}</span>
                )}
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
                {product.smallPrint && (
                  <p className="pricing-small-print">{product.smallPrint}</p>
                )}
                {product.product === "free_check" ? (
                  <button
                    className="button button-primary"
                    onClick={() => handleFreeCheck(new Event("click") as unknown as React.FormEvent)}
                    disabled={checking || !url.trim()}
                    type="button"
                  >
                    {checking ? "Checking…" : product.cta}
                  </button>
                ) : (
                  <button
                    className={`button ${product.highlight ? "button-primary" : "button-dark"}`}
                    onClick={() => handleUpgrade(product.product)}
                    disabled={checking}
                    type="button"
                  >
                    {product.cta}
                  </button>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTRACT ANGLE ──────────────────────────────── */}
      <section className="section section-alt" id="contract">
        <div className="container">
          <p className="eyebrow">Buying Privately?</p>
          <h2 className="section-title">
            Most people have no idea what paperwork they need.
          </h2>
          <p className="section-intro">
            In Queensland, private car sales have almost no consumer protection.
            There&apos;s no cooling-off period. No warranty. No dealer to go back
            to if something&apos;s wrong.
          </p>
          <p className="section-intro">
            That&apos;s why every Buying Buddy Full Confidence Pack includes a
            QLD-specific private sale contract template — ready to print, fill
            in, and sign on the day. It covers:
          </p>
          <ul className="contract-list">
            <li>Buyer and seller details</li>
            <li>Vehicle identification (VIN, rego, odometer)</li>
            <li>Purchase price and payment method</li>
            <li>Disclosure of known defects</li>
            <li>Safety certificate confirmation</li>
            <li>Settlement terms</li>
          </ul>
          <p className="contract-cta-text">
            Don&apos;t show up with a handshake and a bank transfer. Show up with
            a contract.
          </p>
          <button
            className="button button-dark"
            onClick={() => handleUpgrade("full_pack")}
            disabled={checking}
            type="button"
          >
            Get the Full Pack — $34.95
          </button>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
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

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section className="section section-dark final-cta">
        <div className="container">
          <h2 className="final-cta-title">Check before you buy.</h2>
          <p className="final-cta-copy">
            Whether it&apos;s a free listing check or the full dealer review,
            you&apos;ll know what you&apos;re getting into before you hand over
            your money.
          </p>
          <button
            className="button button-on-dark"
            onClick={() => {
              document.getElementById("hero-input")?.scrollIntoView({ behavior: "smooth" });
              document.getElementById("hero-input")?.focus();
            }}
            type="button"
          >
            Check a Listing — Free
          </button>
        </div>
      </section>

      {/* ── STICKY BAR (mobile) ─────────────────────────── */}
      <div className="sticky-bar">
        <div className="container sticky-bar-inner">
          <span className="sticky-bar-copy">Check before you buy</span>
          <button
            className="button button-primary button-small"
            onClick={() => {
              document.getElementById("hero-input")?.scrollIntoView({ behavior: "smooth" });
            }}
            type="button"
          >
            Check — Free
          </button>
        </div>
      </div>
    </>
  );
}
