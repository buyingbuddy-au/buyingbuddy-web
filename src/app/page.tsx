"use client";

const REPORT = "https://buy.stripe.com/9B614o8Qa1212ks8Jo7Zu01";
const BUNDLE = "https://buy.stripe.com/dRmbJ27M6fWVcZ6f7M7Zu02";

export default function Home() {
  return (
    <>
      {/* ═══ 1. HERO ═══════════════════════════════════ */}
      <section className="hero">
        <div className="w">
          <h1>Check any car<br />before you buy.</h1>
          <p className="hero-p">
            We search official government databases — PPSR, rego history, stolen
            register, write-off status — and send you a clear PDF report in
            under 30 seconds.
          </p>
          <a className="cta cta-lime" href={REPORT} target="_blank" rel="noreferrer">
            Get Report — $9.95
          </a>
          <div className="hero-badges">
            <span>✓ Official PPSR data</span>
            <span>⚡ 30-second delivery</span>
            <span>🔒 Secure payment</span>
            <span>🇦🇺 Australian owned</span>
          </div>
        </div>
      </section>

      {/* ═══ 2. WHAT YOU GET ═══════════════════════════ */}
      <section className="sec sec-white" id="report">
        <div className="w">
          <p className="label">Your Report Includes</p>
          <h2>Everything a dealer checks — for $9.95.</h2>
          <div className="report-grid">
            {[
              ["PPSR Check", "Finance owing, security interests, encumbrances"],
              ["Stolen Vehicle", "National theft register status"],
              ["Write-off Register", "Statutory and repairable write-offs"],
              ["Rego History", "Registration status and transfer records"],
              ["Vehicle Identity", "VIN verification and compliance data"],
              ["Plain-English Summary", "No jargon — just what you need to know"],
            ].map(([t, d]) => (
              <div className="report-item" key={t}>
                <strong>{t}</strong>
                <span>{d}</span>
              </div>
            ))}
          </div>
          <a className="cta cta-navy" href={REPORT} target="_blank" rel="noreferrer" style={{ marginTop: 24 }}>
            Get Report — $9.95
          </a>
        </div>
      </section>

      {/* ═══ 3. SOCIAL PROOF ══════════════════════════ */}
      <section className="sec proof">
        <div className="w">
          <div className="proof-stat">
            <span className="proof-num">$93.5M</span>
            <span className="proof-text">lost by Australians to vehicle scams in 2023 — ACCC</span>
          </div>
          <div className="proof-quote">
            <p>
              &ldquo;The report showed the car had been written off twice. The
              seller swore it was perfect. Saved me from a $12,000
              mistake.&rdquo;
            </p>
            <cite>— Sarah M., Redcliffe QLD ★★★★★</cite>
          </div>
        </div>
      </section>

      {/* ═══ 4. PRICING ═══════════════════════════════ */}
      <section className="sec sec-white" id="pricing">
        <div className="w">
          <p className="label">Pricing</p>
          <h2>No subscriptions. No accounts. Pay once.</h2>
          <div className="price-row">
            {/* Core product */}
            <div className="pcard pcard-primary">
              <div className="pcard-badge">Most Popular</div>
              <p className="pcard-name">Confidence Report</p>
              <p className="pcard-price">$9.95</p>
              <ul className="pcard-list">
                <li>PPSR check</li>
                <li>Rego history</li>
                <li>Stolen vehicle check</li>
                <li>Write-off register</li>
                <li>Contract template</li>
                <li>Plain-English summary</li>
              </ul>
              <a className="cta cta-lime cta-full" href={REPORT} target="_blank" rel="noreferrer">
                Get Report — $9.95
              </a>
            </div>
            {/* Bundle */}
            <div className="pcard">
              <p className="pcard-name">Full Bundle</p>
              <p className="pcard-price">$39</p>
              <ul className="pcard-list">
                <li>Everything above, plus:</li>
                <li>Negotiation scripts</li>
                <li>Detailed inspection guide</li>
                <li>Premium contract templates</li>
              </ul>
              <a className="cta cta-navy cta-full" href={BUNDLE} target="_blank" rel="noreferrer">
                Get Bundle — $39
              </a>
            </div>
          </div>
          <p className="price-free">
            Just browsing? Grab our <a href="/blog" style={{ color: "#1A237E", fontWeight: 600, textDecoration: "underline" }}>free car-buying checklist</a>.
          </p>
        </div>
      </section>

      {/* ═══ 5. FAQ ═══════════════════════════════════ */}
      <section className="sec" id="faq">
        <div className="w">
          <h2>Questions.</h2>
          <div className="faq">
            {[
              ["How fast is the report?", "Usually under 30 seconds. The PDF is emailed directly to you after payment."],
              ["Do I need an account?", "No. Paste the listing URL, pay, and it's sent to your email. That's it."],
              ["Where does the data come from?", "Official Australian government databases — PPSR, NEVDIS, and state transport authorities. Same sources licensed dealers use."],
              ["Can I get a refund?", "Yes. Not satisfied? Full refund, no questions asked."],
            ].map(([q, a]) => (
              <details className="faq-item" key={q}>
                <summary>{q}</summary>
                <div className="faq-a">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. FINAL CTA ═════════════════════════════ */}
      <section className="sec-final">
        <div className="w" style={{ textAlign: "center" }}>
          <h2>Don&apos;t hand over your money blind.</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 24, maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
            $9.95 is nothing compared to what a bad car costs.
          </p>
          <a className="cta cta-lime" href={REPORT} target="_blank" rel="noreferrer">
            Get Report — $9.95
          </a>
        </div>
      </section>

      {/* ═══ STICKY MOBILE BAR ════════════════════════ */}
      <div className="sticky">
        <span>Check before you buy</span>
        <a className="cta cta-lime cta-sm" href={REPORT} target="_blank" rel="noreferrer">$9.95</a>
      </div>
    </>
  );
}
