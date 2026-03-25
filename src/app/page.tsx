"use client";

const REPORT_LINK = "https://buy.stripe.com/9B614o8Qa1212ks8Jo7Zu01";
const BUNDLE_LINK = "https://buy.stripe.com/dRmbJ27M6fWVcZ6f7M7Zu02";

export default function HomePage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="hero">
        <div className="wrap">
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#00C853", marginBottom: 16 }}>
            Australian Owned · Official PPSR Data
          </p>
          <h1>Check any car before you buy it.</h1>
          <p className="hero-sub">
            Finance owing. Stolen. Written off. We check official government
            databases and send you a plain-English PDF report in under 30 seconds.
          </p>
          <div className="hero-ctas">
            <a className="btn btn-lime" href={REPORT_LINK} target="_blank" rel="noreferrer">
              Get Car Report — $9.95
            </a>
            <a className="btn btn-white" href="#how-it-works" style={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}>
              How It Works
            </a>
          </div>
          <div className="hero-trust">
            <span>✓ Official PPSR</span>
            <span>✉ PDF in 30 sec</span>
            <span>🔒 Stripe Secure</span>
            <span>↩ Money-back guarantee</span>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ───────────────────────────────── */}
      <div className="trust-strip">
        <div className="trust-strip-inner">
          {[
            { icon: "🛡", text: "Official government databases" },
            { icon: "⚡", text: "Report in under 30 seconds" },
            { icon: "🔒", text: "Secure Stripe payment" },
            { icon: "🇦🇺", text: "100% Australian owned" },
          ].map(({ icon, text }) => (
            <div className="trust-item" key={text}>
              <span className="trust-icon">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── How It Works ──────────────────────────────── */}
      <section className="section" id="how-it-works">
        <div className="wrap">
          <p className="section-label">How It Works</p>
          <h2>Three steps. Total clarity.</h2>
          <p className="section-sub">No account needed. No complicated forms.</p>
          <div className="steps">
            {[
              { num: "Step 1", title: "Paste the listing link", body: "Drop the Facebook Marketplace or Carsales URL into the order form." },
              { num: "Step 2", title: "We check everything", body: "PPSR, rego history, finance owing, stolen status, write-off register — all official sources." },
              { num: "Step 3", title: "Get your PDF report", body: "A clear, plain-English report lands in your inbox. No jargon. Just the facts you need." },
            ].map(({ num, title, body }) => (
              <div className="step" key={num}>
                <p className="step-num">{num}</p>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What We Check ─────────────────────────────── */}
      <section className="section section-alt">
        <div className="wrap">
          <p className="section-label">What We Check</p>
          <h2>Everything that matters.</h2>
          <p className="section-sub">The same databases licensed dealers use — without the dealer markup.</p>
          <div className="checks">
            {[
              { icon: "📋", title: "PPSR Check", desc: "Finance owing, security interests, encumbrances" },
              { icon: "🔍", title: "Stolen Vehicle", desc: "Nationally reported theft status" },
              { icon: "⚠️", title: "Write-off Register", desc: "Statutory and repairable write-offs" },
              { icon: "📄", title: "Rego History", desc: "Registration status and transfer history" },
              { icon: "🚗", title: "Vehicle Identity", desc: "VIN verification, compliance plate data" },
              { icon: "💰", title: "Value Context", desc: "Price guidance based on market data" },
            ].map(({ icon, title, desc }) => (
              <div className="check" key={title}>
                <div className="check-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why It Matters ─────────────────────────────── */}
      <section className="section">
        <div className="wrap">
          <p className="section-label">Why It Matters</p>
          <h2>The cost of not checking.</h2>
          <div style={{ display: "grid", gap: 14, maxWidth: 640 }}>
            {[
              { stat: "$93.5M", text: "Lost by Australians to vehicle scams in 2023 (ACCC)" },
              { stat: "1 in 4", text: "Private listings have undisclosed problems — finance, damage, or identity issues" },
              { stat: "$9.95", text: "The cost of checking. Compare that to the cost of getting it wrong." },
            ].map(({ stat, text }) => (
              <div key={stat} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "#1A237E", minWidth: 80, flexShrink: 0 }}>{stat}</span>
                <p style={{ color: "#5d648f", fontSize: 13, lineHeight: 1.55, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────── */}
      <section className="section section-alt" id="pricing">
        <div className="wrap">
          <p className="section-label">Pricing</p>
          <h2>Simple, upfront, no subscriptions.</h2>
          <p className="section-sub">Pay once. Get your report. That&apos;s it.</p>
          <div className="pricing-grid">
            {/* Free */}
            <div className="price-card">
              <p className="price-label">Free Checklist</p>
              <p className="price-amount">Free</p>
              <ul className="price-features">
                <li>Basic inspection guide <span className="yes">✓</span></li>
                <li>Negotiation tips <span className="yes">✓</span></li>
                <li>PPSR check <span className="no">—</span></li>
                <li>Rego history <span className="no">—</span></li>
              </ul>
              <a className="btn btn-white btn-full" href="/blog">Download Free</a>
            </div>
            {/* Confidence Report */}
            <div className="price-card featured">
              <div className="price-badge">Most Popular</div>
              <p className="price-label">Confidence Report</p>
              <p className="price-amount">$9.95</p>
              <ul className="price-features">
                <li>PPSR check <span className="yes">✓</span></li>
                <li>Rego history <span className="yes">✓</span></li>
                <li>Stolen check <span className="yes">✓</span></li>
                <li>Write-off check <span className="yes">✓</span></li>
                <li>Basic contract template <span className="yes">✓</span></li>
              </ul>
              <a className="btn btn-lime btn-full" href={REPORT_LINK} target="_blank" rel="noreferrer">Get Report — $9.95</a>
            </div>
            {/* Full Bundle */}
            <div className="price-card">
              <p className="price-label">Full Bundle</p>
              <p className="price-amount">$39</p>
              <ul className="price-features">
                <li>Everything in Confidence <span className="yes">✓</span></li>
                <li>Negotiation scripts <span className="yes">✓</span></li>
                <li>Detailed inspection guide <span className="yes">✓</span></li>
                <li>Premium contract templates <span className="yes">✓</span></li>
              </ul>
              <a className="btn btn-navy btn-full" href={BUNDLE_LINK} target="_blank" rel="noreferrer">Get Everything — $39</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────── */}
      <section className="section">
        <div className="wrap">
          <p className="section-label">Real Stories</p>
          <h2>People who checked first.</h2>
          <div className="testimonials">
            {[
              { name: "Sarah M.", loc: "Redcliffe, QLD", initials: "SM", quote: "The report showed the car had been written off twice. The seller swore it was perfect. Saved me from a $12,000 mistake." },
              { name: "Emma K.", loc: "Gold Coast, QLD", initials: "EK", quote: "First time buying in Australia. The report gave me confidence to negotiate. Got $2,000 off the asking price." },
              { name: "Michelle T.", loc: "Toowoomba, QLD", initials: "MT", quote: "The PPSR check found $8,000 in finance owing that the seller never mentioned. Would have become my problem." },
            ].map(({ name, loc, initials, quote }) => (
              <div className="testimonial" key={name}>
                <div className="testimonial-header">
                  <div className="testimonial-avatar">{initials}</div>
                  <div>
                    <p className="testimonial-name">{name}</p>
                    <p className="testimonial-loc">{loc}</p>
                    <p className="testimonial-stars">★★★★★</p>
                  </div>
                </div>
                <q>{quote}</q>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────── */}
      <section className="section section-alt" id="faq">
        <div className="wrap">
          <p className="section-label">FAQ</p>
          <h2>Common questions.</h2>
          <div className="faq-list">
            {[
              { q: "How fast do I get the report?", a: "Usually within 30 seconds of payment. The PDF is emailed directly to you." },
              { q: "Do I need an account?", a: "No. Just paste the listing URL, pay, and the report is sent to your email." },
              { q: "Where does the data come from?", a: "Official Australian government databases including PPSR, NEVDIS, and state transport authorities. The same sources licensed dealers use." },
              { q: "What if the car comes back clean?", a: "Then you've got peace of mind for less than a cup of coffee. The report is yours to keep." },
              { q: "Can I get a refund?", a: "Yes. If you're not satisfied, we'll refund you in full. No questions asked." },
              { q: "Does this work for any car in Australia?", a: "Any registered vehicle — cars, utes, bikes, caravans. If it has a VIN or rego, we can check it." },
            ].map(({ q, a }) => (
              <details className="faq-item" key={q}>
                <summary>{q}</summary>
                <div className="faq-answer">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────── */}
      <section className="final-cta">
        <div className="wrap">
          <h2>Don&apos;t hand over your money blind.</h2>
          <p>$9.95 now is nothing compared to what a bad car costs later.</p>
          <div className="final-ctas">
            <a className="btn btn-lime" href={REPORT_LINK} target="_blank" rel="noreferrer">Get Car Report — $9.95</a>
            <a className="btn btn-white" href="/blog" style={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}>Read Free Guides</a>
          </div>
        </div>
      </section>

      {/* ── Sticky Mobile CTA ─────────────────────────── */}
      <div className="sticky-bar">
        <p>Check before you buy</p>
        <a className="btn btn-lime" href={REPORT_LINK} target="_blank" rel="noreferrer">Report $9.95</a>
      </div>
    </>
  );
}
