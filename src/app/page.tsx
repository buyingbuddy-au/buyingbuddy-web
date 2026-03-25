import Link from "next/link";
import {
  CONFIDENCE_REPORT_LINK,
  FULL_BUNDLE_LINK,
} from "@/lib/site-content";

const reportItems = [
  {
    title: "PPSR Check",
    description: "Finance owing, security interests, and encumbrance flags.",
  },
  {
    title: "Stolen Vehicle",
    description: "National stolen vehicle register results before you commit.",
  },
  {
    title: "Write-Off Status",
    description: "Repairable and statutory write-off history in one place.",
  },
  {
    title: "Rego History",
    description: "Registration status and recent history checks for the vehicle.",
  },
  {
    title: "Vehicle Identity",
    description: "VIN and identity details matched back to the listed vehicle.",
  },
  {
    title: "Plain-English Summary",
    description: "A clear PDF summary built for buyers, not just insiders.",
  },
] as const;

const faqs = [
  {
    question: "How fast is the report?",
    answer:
      "Most reports are delivered in under 30 seconds after payment, straight to your inbox as a PDF.",
  },
  {
    question: "What do I need to run a check?",
    answer:
      "Enter the VIN or rego number and complete payment. That is enough to start the search.",
  },
  {
    question: "Where does the data come from?",
    answer:
      "Buying Buddy checks official PPSR data along with stolen vehicle, write-off, and rego history sources used in dealer workflows.",
  },
  {
    question: "What if the report is incomplete?",
    answer:
      "If the lookup cannot return the promised core checks, contact us and we will sort it out, including a refund when appropriate.",
  },
] as const;

export default function Home() {
  return (
    <>
      <section className="section hero-section" id="report">
        <div className="container hero-layout">
          <div className="hero-copy">
            <p className="eyebrow">Vehicle History Reports</p>
            <h1 className="hero-title">Know the full story before you buy.</h1>
            <p className="hero-description">
              Search any car by VIN or rego. We check PPSR, stolen vehicle
              register, write-off status, and rego history — then send you a
              clear PDF report in under 30 seconds.
            </p>
          </div>
          <div className="hero-search-card">
            <form
              action={CONFIDENCE_REPORT_LINK}
              className="hero-form"
              method="get"
              target="_blank"
            >
              <label className="sr-only" htmlFor="vehicle-query">
                Enter VIN or rego number
              </label>
              <input
                className="hero-input"
                id="vehicle-query"
                name="vehicle"
                placeholder="Enter VIN or rego number"
                type="text"
              />
              <button className="button button-primary hero-submit" type="submit">
                Check Now — $9.95
              </button>
            </form>
            <div className="hero-trust" aria-label="Trust badges">
              <span>✓ Official PPSR data</span>
              <span>·</span>
              <span>✓ 30-second delivery</span>
              <span>·</span>
              <span>✓ Money-back guarantee</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <p className="eyebrow">What&apos;s in the report</p>
          <h2 className="section-title">Everything a licensed dealer checks.</h2>
          <div className="included-grid">
            {reportItems.map((item) => (
              <article className="included-item" key={item.title}>
                <span aria-hidden="true" className="included-icon">
                  →
                </span>
                <h3 className="included-title">{item.title}</h3>
                <p className="included-description">{item.description}</p>
              </article>
            ))}
          </div>
          <div className="report-preview">Sample report preview coming soon</div>
        </div>
      </section>

      <section className="section section-dark proof-section">
        <div className="container">
          <p className="proof-stat">
            <span className="proof-amount">$93.5M</span> lost to vehicle scams
            in 2023 — ACCC
          </p>
          <blockquote className="proof-quote">
            <p>
              “Buying Buddy flagged a repairable write-off before I sent the
              deposit.”
            </p>
            <cite className="proof-meta">Leah T. · Brisbane, QLD · ★★★★★</cite>
          </blockquote>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="container">
          <h2 className="section-title">Simple pricing. No subscriptions.</h2>
          <div className="pricing-grid">
            <article className="pricing-card pricing-card-primary">
              <span className="pricing-badge">Most Popular</span>
              <div className="pricing-heading">
                <h3 className="pricing-name">Confidence Report</h3>
                <p className="pricing-price">$9.95</p>
              </div>
              <ul className="pricing-list">
                <li>PPSR check</li>
                <li>Stolen vehicle register check</li>
                <li>Write-off status</li>
                <li>Rego history</li>
                <li>Vehicle identity verification</li>
                <li>Plain-English PDF summary</li>
              </ul>
              <a
                className="button button-primary"
                href={CONFIDENCE_REPORT_LINK}
                rel="noreferrer"
                target="_blank"
              >
                Get Report — $9.95
              </a>
            </article>

            <article className="pricing-card">
              <div className="pricing-heading">
                <h3 className="pricing-name">Full Bundle</h3>
                <p className="pricing-price">$39</p>
              </div>
              <ul className="pricing-list">
                <li>Everything in the Confidence Report</li>
                <li>Buyer checklist</li>
                <li>Negotiation scripts</li>
                <li>Extra purchase resources</li>
              </ul>
              <a
                className="button button-dark"
                href={FULL_BUNDLE_LINK}
                rel="noreferrer"
                target="_blank"
              >
                Get Bundle — $39
              </a>
            </article>
          </div>
          <p className="pricing-link-row">
            Looking for free resources?{" "}
            <Link className="pricing-link" href="/blog">
              Visit our blog →
            </Link>
          </p>
        </div>
      </section>

      <section className="section section-alt" id="faq">
        <div className="container">
          <h2 className="section-title">Questions</h2>
          <div className="faq-wrap">
            {faqs.map((item) => (
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
          <h2 className="final-cta-title">Check before you buy.</h2>
          <p className="final-cta-copy">
            Run the core PPSR, stolen, write-off, and rego checks before you
            commit to the car.
          </p>
          <a
            className="button button-on-dark"
            href={CONFIDENCE_REPORT_LINK}
            rel="noreferrer"
            target="_blank"
          >
            Get Report — $9.95
          </a>
        </div>
      </section>

      <div className="sticky-bar">
        <div className="container sticky-bar-inner">
          <span className="sticky-bar-copy">Check before you buy</span>
          <a
            className="button button-primary button-small"
            href={CONFIDENCE_REPORT_LINK}
            rel="noreferrer"
            target="_blank"
          >
            $9.95
          </a>
        </div>
      </div>
    </>
  );
}
