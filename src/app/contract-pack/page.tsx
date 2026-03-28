import type { Metadata } from "next";
import Link from "next/link";

const CONTRACT_PACK_ITEMS = [
  {
    title: "QLD vehicle sale contract",
    body: "A cleaner private-sale contract for recording buyer, seller, vehicle, price, disclosures, and settlement terms.",
  },
  {
    title: "Receipt of payment",
    body: "A simple record of exactly what was paid, when it was paid, and how the funds changed hands.",
  },
  {
    title: "Vehicle condition report template",
    body: "A handover-day checklist for documenting what the car looked like when the deal was done.",
  },
  {
    title: "Transfer of registration guide",
    body: "A QLD-focused guide so you know what needs to happen after the keys and money change hands.",
  },
] as const;

const SCAM_POINTS = [
  "Seller changes the story once you arrive",
  "Deposit pressure before you've checked the car properly",
  "Missing written record of defects or promises made",
  "Confusion over payment, identity, or handover timing",
] as const;

const contractPackCheckoutUrl =
  process.env.CONTRACT_PACK_CHECKOUT_URL?.trim() ||
  process.env.NEXT_PUBLIC_CONTRACT_PACK_CHECKOUT_URL?.trim() ||
  "";

export const metadata: Metadata = {
  title: "Private Sale Contract Pack",
  description:
    "QLD-specific private sale paperwork for car buyers: vehicle sale contract, receipt of payment, condition report template, and transfer guide.",
};

export default function ContractPackPage() {
  const checkoutReady = Boolean(contractPackCheckoutUrl);

  return (
    <>
      <section className="section contract-hero-section">
        <div className="container contract-hero-layout">
          <div className="contract-hero-copy">
            <p className="eyebrow">QLD Private Sale Contract Pack</p>
            <h1 className="hero-title contract-hero-title">
              Private sale paperwork built by a licensed dealer who has seen every scam.
            </h1>
            <p className="hero-description contract-hero-description">
              If a private seller gets vague when it is time to take payment, record defects, or hand over
              rego paperwork, that is your problem unless the deal is documented properly. This pack gives
              Queensland buyers the core documents to tighten the handover.
            </p>

            <div className="contract-hero-points">
              <span className="hero-chip">QLD-specific paperwork</span>
              <span className="hero-chip">Built for private vehicle sales</span>
              <span className="hero-chip">Fast, printable templates</span>
            </div>
          </div>

          <aside className="contract-buy-card">
            <p className="contract-buy-kicker">Private Sale Contract Pack</p>
            <p className="contract-buy-price">$9.95</p>
            <p className="contract-buy-copy">
              Four practical documents for the day the deal becomes real.
            </p>

            <ul className="contract-buy-list">
              <li>QLD vehicle sale contract</li>
              <li>Receipt of payment</li>
              <li>Vehicle condition report</li>
              <li>Transfer of registration guide</li>
            </ul>

            {checkoutReady ? (
              <a
                className="button button-primary contract-buy-button"
                href={contractPackCheckoutUrl}
                rel="noreferrer"
                target="_blank"
              >
                Buy Contract Pack - $9.95
              </a>
            ) : (
              <button className="button button-primary contract-buy-button" disabled type="button">
                Contract Pack Checkout Coming Soon
              </button>
            )}

            <p className="contract-buy-note">
              {checkoutReady
                ? "Secure Stripe checkout. Opens in a new tab."
                : "Stripe checkout will appear here once the payment link is connected."}
            </p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">What's Included</p>
          <h2 className="section-title">Everything you need to document the handover properly.</h2>
          <div className="contract-grid">
            {CONTRACT_PACK_ITEMS.map((item) => (
              <article className="contract-item-card" key={item.title}>
                <h3 className="contract-item-title">{item.title}</h3>
                <p className="contract-item-copy">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container contract-story-layout">
          <div>
            <p className="eyebrow">Why This Exists</p>
            <h2 className="section-title">A handshake is not a process.</h2>
            <p className="section-intro">
              Private sales in Queensland are where the seller's memory suddenly gets fuzzy. A proper
              contract, payment receipt, and condition report force the important details onto paper while
              both sides are still standing next to the car.
            </p>
            <p className="section-intro">
              That matters because once the transfer is done, arguments about defects, damage, accessories,
              or payment promises get hard to unwind very quickly.
            </p>
          </div>

          <div className="contract-risk-card">
            <p className="contract-risk-kicker">Built by a licensed dealer who has seen every scam</p>
            <ul className="contract-risk-list">
              {SCAM_POINTS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section section-dark final-cta contract-final-cta">
        <div className="container">
          <h2 className="final-cta-title">Show up with paperwork, not hope.</h2>
          <p className="final-cta-copy">
            Use the contract pack on handover day, and pair it with the free listing check or PPSR earlier
            in the buying process.
          </p>
          <div className="final-cta-actions">
            {checkoutReady ? (
              <a
                className="button button-on-dark"
                href={contractPackCheckoutUrl}
                rel="noreferrer"
                target="_blank"
              >
                Buy Contract Pack
              </a>
            ) : (
              <button className="button button-on-dark" disabled type="button">
                Checkout Coming Soon
              </button>
            )}
            <Link className="button button-secondary" href="/">
              Back to free check
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
