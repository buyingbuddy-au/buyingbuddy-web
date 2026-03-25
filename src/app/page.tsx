import Link from "next/link";
import AnnouncementBanner from "@/components/announcement-banner";
import StickyCta from "@/components/sticky-cta";
import {
  COMPARISON_ROWS,
  CONFIDENCE_REPORT_LINK,
  DELIVERY_POINTS,
  FAQS,
  FULL_BUNDLE_LINK,
  HERO_FEATURES,
  LEAD_MAGNET_BULLETS,
  PRICING_PLANS,
  PROBLEM_CARDS,
  TESTIMONIALS,
  TRUST_BADGES,
  VERIFICATION_POINTS,
} from "@/lib/site-content";

function ActionButton({
  href,
  label,
  variant = "primary",
}: {
  href: string;
  label: string;
  variant?: "primary" | "light-outline" | "dark-outline";
}) {
  const baseClassName =
    "inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.08em] transition";
  const className =
    variant === "primary"
      ? `${baseClassName} bg-brand-lime text-brand-navy hover:-translate-y-0.5 hover:shadow-lg`
      : variant === "light-outline"
        ? `${baseClassName} border border-white/45 text-white hover:border-brand-lime hover:text-brand-lime`
        : `${baseClassName} border border-brand-navy/15 text-brand-navy hover:border-brand-lime hover:text-brand-navy hover:bg-brand-lime/10`;

  if (href.startsWith("http")) {
    return (
      <a
        className={className}
        href={href}
        rel="noreferrer"
        target="_blank"
      >
        {label}
      </a>
    );
  }

  return (
    <Link className={className} href={href}>
      {label}
    </Link>
  );
}

export default function HomePage() {
  return (
    <>
      <AnnouncementBanner />
      <section className="hero-shell overflow-hidden text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 pt-10 sm:px-6 md:pt-14 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:pb-24">
          <div className="space-y-7">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-brand-lime">
              100% Aussie owned and operated
            </span>
            <div className="space-y-5">
              <h1 className="display-font max-w-4xl text-4xl uppercase leading-[0.95] sm:text-5xl lg:text-7xl">
                Don&apos;t Be the Mug Who Gets Scammed on Facebook Marketplace
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/82 sm:text-xl">
                Get the real story on any used car before you hand over your
                hard-earned cash
              </p>
              <p className="max-w-2xl text-sm font-semibold text-white/78 sm:text-base">
                ✓ PPSR Verified Reports • ✉️ PDF Sent Instantly • 🛡️ Secure
                Aussie Payments
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ActionButton
                href={CONFIDENCE_REPORT_LINK}
                label="Get My Car Report Now - $9.95"
              />
              <ActionButton
                href="#checklist"
                label="Start with Free Checklist"
                variant="light-outline"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.35rem] border border-white/12 bg-white/10 p-4 frosted">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-lime">
                  Value
                </p>
                <p className="mt-2 text-lg font-bold">
                  $9.95 Report vs $15,000 Mistake
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-white/12 bg-white/10 p-4 frosted">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-lime">
                  Speed
                </p>
                <p className="mt-2 text-lg font-bold">
                  PDF Delivered in 30 Seconds
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-white/12 bg-white/10 p-4 frosted">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-lime">
                  Proof
                </p>
                <p className="mt-2 text-lg font-bold">
                  Same data, no dealer markup
                </p>
              </div>
            </div>
          </div>
          <div className="animate-float">
            <div className="panel overflow-hidden panel-strong p-4 sm:p-6">
              <div className="rounded-[1.35rem] bg-brand-lime/10 p-5 text-brand-navy">
                <p className="text-xs font-black uppercase tracking-[0.18em]">
                  Free Download
                </p>
                <h2 className="mt-3 display-font text-3xl uppercase leading-none">
                  The Only Car Buying Checklist You Need
                </h2>
                <div className="mt-5 space-y-3">
                  {LEAD_MAGNET_BULLETS.map((item) => (
                    <p className="text-sm font-bold sm:text-base" key={item}>
                      {item}
                    </p>
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded-[1.35rem] bg-brand-navy p-5 text-white">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-lime">
                  Confidence Report
                </p>
                <p className="mt-3 text-lg leading-7 text-white/82">
                  Dealers charge $50+ for basic checks. We give you everything
                  for $9.95.
                </p>
                <div className="mt-5 space-y-3">
                  {HERO_FEATURES.map((feature) => (
                    <div
                      className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold leading-6 text-white/92"
                      key={feature}
                    >
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.2rem] bg-[#f7f9ff] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-navy">
                    Sarah
                  </p>
                  <p className="mt-2 text-sm font-semibold text-brand-ink">
                    Dodged a $12k bullet
                  </p>
                </div>
                <div className="rounded-[1.2rem] bg-[#f7f9ff] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-navy">
                    Emma
                  </p>
                  <p className="mt-2 text-sm font-semibold text-brand-ink">
                    Got $2k off the asking price
                  </p>
                </div>
                <div className="rounded-[1.2rem] bg-[#f7f9ff] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-navy">
                    Michelle
                  </p>
                  <p className="mt-2 text-sm font-semibold text-brand-ink">
                    Spotted $8k finance owing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8" id="how-it-works">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-lime">
              Why Smart Aussies Use Buying Buddy
            </p>
            <h2 className="display-font text-4xl uppercase leading-[0.95] text-brand-navy sm:text-5xl">
              Know before you go.
            </h2>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {PROBLEM_CARDS.map((card) => (
              <article className="panel p-6 sm:p-7" key={card.title}>
                <p className="display-font text-2xl uppercase leading-tight text-brand-navy">
                  {card.title}
                </p>
                <p className="mt-4 text-base leading-8 text-brand-ink/85">
                  {card.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8" id="pricing">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div className="space-y-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-lime">
                Course Not All Car Reports Are the Same
              </p>
              <h2 className="display-font text-4xl uppercase leading-[0.95] text-brand-navy sm:text-5xl">
                Most mob charge you $50+ for basic rego checks.
              </h2>
              <p className="max-w-xl text-lg leading-8 text-brand-ink/82">
                We give you everything that actually matters for under $40.
              </p>
              <div className="panel !bg-brand-navy p-6 text-white">
                <p className="display-font text-2xl uppercase leading-none">
                  Dealers charge $50+ for basic checks
                </p>
                <p className="mt-3 text-sm leading-7 text-white/78">
                  We give you everything for $9.95
                </p>
                <p className="mt-2 text-sm font-bold uppercase tracking-[0.12em] text-brand-lime">
                  Same data, no dealer markup
                </p>
                <p className="mt-6 text-sm leading-7 text-white/82">
                  Try it risk-free. If our report doesn&apos;t save you money or
                  give you peace of mind, we&apos;ll refund every cent. No
                  questions, no hassles.
                </p>
              </div>
            </div>
            <div className="space-y-5">
              <div className="hidden overflow-hidden rounded-[1.75rem] border border-brand-navy/10 bg-white shadow-panel md:block">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-brand-navy text-white">
                      <th className="px-5 py-4 text-sm font-black uppercase tracking-[0.12em]">
                        Feature
                      </th>
                      {PRICING_PLANS.map((plan) => (
                        <th
                          className={`px-5 py-4 text-sm font-black uppercase tracking-[0.12em] ${
                            plan.featured ? "bg-brand-lime text-brand-navy" : ""
                          }`}
                          key={plan.name}
                        >
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_ROWS.map((row) => (
                      <tr
                        className="border-t border-brand-navy/10"
                        key={row.label}
                      >
                        <td className="px-5 py-4 text-sm font-bold text-brand-ink">
                          {row.label}
                        </td>
                        {row.values.map((value, index) => (
                          <td
                            className={`px-5 py-4 text-sm font-semibold ${
                              PRICING_PLANS[index]?.featured
                                ? "bg-brand-lime/8 text-brand-navy"
                                : "text-brand-ink/82"
                            }`}
                            key={`${row.label}-${index}`}
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="border-t border-brand-navy/10">
                      <td className="px-5 py-5" />
                      {PRICING_PLANS.map((plan) => (
                        <td
                          className={`px-5 py-5 ${
                            plan.featured ? "bg-brand-lime/8" : ""
                          }`}
                          key={plan.ctaLabel}
                        >
                          <ActionButton
                            href={plan.ctaHref}
                            label={plan.ctaLabel}
                            variant={plan.featured ? "primary" : "dark-outline"}
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="grid gap-4 md:hidden">
                {PRICING_PLANS.map((plan, planIndex) => (
                  <article
                    className={`panel p-5 ${
                      plan.featured
                        ? "!border-brand-lime !bg-brand-lime/8"
                        : ""
                    }`}
                    key={plan.name}
                  >
                    {plan.featured ? (
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-lime">
                        Most Popular
                      </p>
                    ) : null}
                    <div className="mt-2 flex items-end justify-between gap-4">
                      <div>
                        <p className="display-font text-2xl uppercase leading-none text-brand-navy">
                          {plan.name}
                        </p>
                        <p className="mt-2 text-lg font-bold text-brand-ink">
                          {plan.price}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {COMPARISON_ROWS.map((row) => (
                        <div
                          className="flex items-center justify-between gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm"
                          key={`${plan.name}-${row.label}`}
                        >
                          <span className="font-semibold text-brand-ink/82">
                            {row.label}
                          </span>
                          <span className="font-black text-brand-navy">
                            {row.values[planIndex]}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5">
                      <ActionButton
                        href={plan.ctaHref}
                        label={plan.ctaLabel}
                        variant={plan.featured ? "primary" : "dark-outline"}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8" id="trust">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {TRUST_BADGES.map((badge) => (
                <article className="panel p-5" key={badge.title}>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-lime">
                    Trust Badge
                  </p>
                  <p className="mt-3 display-font text-xl uppercase leading-tight text-brand-navy">
                    {badge.title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-brand-ink/82">
                    {badge.copy}
                  </p>
                </article>
              ))}
            </div>
            <div className="panel !bg-brand-navy p-6 text-white sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-lime">
                Same data, fraction of the dealer price
              </p>
              <h2 className="mt-4 display-font text-4xl uppercase leading-[0.95]">
                Official data. Plain-English guidance.
              </h2>
              <div className="mt-6 space-y-4">
                {VERIFICATION_POINTS.map((point) => (
                  <p className="text-sm leading-7 text-white/82" key={point}>
                    {point}
                  </p>
                ))}
              </div>
              <div className="mt-8 rounded-[1.4rem] border border-white/10 bg-white/8 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-lime">
                  Delivery promises
                </p>
                <div className="mt-4 space-y-3">
                  {DELIVERY_POINTS.map((point) => (
                    <p className="text-sm leading-7 text-white/86" key={point}>
                      {point}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-lime">
              Real Aussies, Real Saves
            </p>
            <h2 className="display-font text-4xl uppercase leading-[0.95] text-brand-navy sm:text-5xl">
              Real Aussies, Real Saves
            </h2>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <article className="panel p-6" key={testimonial.name}>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-lime text-xl font-black text-brand-navy">
                    {testimonial.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-xl font-black tracking-[0.2em] text-brand-lime">
                      ★★★★★
                    </p>
                    <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-brand-navy">
                      {testimonial.name}, {testimonial.location}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-base italic leading-8 text-brand-ink/84">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8" id="faq">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-4 text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-lime">
              Fair Dinkum Questions
            </p>
            <h2 className="display-font text-4xl uppercase leading-[0.95] text-brand-navy sm:text-5xl">
              Fair Dinkum Questions
            </h2>
          </div>
          <div className="mt-8 space-y-4">
            {FAQS.map((faq, index) => (
              <details
                className="faq-item panel overflow-hidden bg-white"
                key={faq.question}
                open={index === 0}
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 bg-brand-navy px-5 py-4 text-left text-base font-black text-white transition hover:text-brand-lime sm:px-6">
                  <span>{faq.question}</span>
                  <span className="text-brand-lime">+</span>
                </summary>
                <div className="px-5 py-5 sm:px-6">
                  <p className="text-base leading-8 text-brand-ink/82">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8 lg:pb-16" id="checklist">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="panel !bg-brand-navy p-6 text-white sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-lime">
              Get the Free Checklist That&apos;s Saved 10,000+ Aussies from Car Scams
            </p>
            <h2 className="mt-4 display-font text-4xl uppercase leading-[0.95]">
              The Only Car Buying Checklist You Need
            </h2>
            <div className="mt-6 space-y-3">
              {LEAD_MAGNET_BULLETS.map((item) => (
                <p className="text-base font-semibold leading-7 text-white/88" key={item}>
                  {item}
                </p>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ActionButton
                href="/blog/private-car-buying-checklist"
                label="Download Free Checklist"
              />
              <ActionButton
                href="/blog"
                label="Read the Blog"
                variant="light-outline"
              />
            </div>
            <p className="mt-5 text-sm text-white/72">
              We hate spam too. Unsubscribe anytime.
            </p>
          </div>
          <div className="panel p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-lime">
              Join 10,000+ Smart Aussie Car Buyers
            </p>
            <h2 className="mt-4 display-font text-4xl uppercase leading-[0.95] text-brand-navy">
              Don&apos;t be the mug who buys blind
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-brand-ink/82">
              Try it risk-free. If our report doesn&apos;t save you money or give
              you peace of mind, we&apos;ll refund every cent. No questions, no
              hassles.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.2rem] bg-brand-lime/10 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-navy">
                  Comparison Banner
                </p>
                <p className="mt-2 text-base font-bold text-brand-ink">
                  Fair dinkum - which sounds better?
                </p>
              </div>
              <div className="rounded-[1.2rem] bg-brand-navy p-4 text-white">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-lime">
                  Social Proof
                </p>
                <p className="mt-2 text-base font-bold">
                  Don&apos;t be the mug who buys blind
                </p>
              </div>
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ActionButton
                href={CONFIDENCE_REPORT_LINK}
                label="Get My Car Report - $9.95"
              />
              <ActionButton
                href={FULL_BUNDLE_LINK}
                label="Get Everything"
                variant="dark-outline"
              />
            </div>
          </div>
        </div>
      </section>

      <StickyCta />
    </>
  );
}
