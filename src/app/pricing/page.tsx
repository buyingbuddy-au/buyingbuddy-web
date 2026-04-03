import CTASection from '@/components/cta-section'
import PricingCard from '@/components/pricing-card'
import SiteStickyCTA from '@/components/site-sticky-cta'
import { Check, X, Shield, Crown, Star, FileText, Phone } from 'lucide-react'

export const metadata = {
  title: 'Pricing - Car Buying Protection Plans | Buying Buddy',
  description: 'Choose your level of car buying protection. From free checklist to complete buyer bundles. Queensland car buying support.',
}

export default function PricingPage() {
  const comparisonFeatures = [
    { feature: "20-point inspection checklist", free: true, confidence: true, bundle: true },
    { feature: "Red flags and scam detection", free: true, confidence: true, bundle: true },
    { feature: "Basic negotiation tips", free: true, confidence: true, bundle: true },
    { feature: "QLD rego transfer basics", free: true, confidence: true, bundle: true },
    { feature: "Verified PPSR report (1 vehicle)", free: false, confidence: true, bundle: true },
    { feature: "QLD-specific legal contracts", free: false, confidence: true, bundle: true },
    { feature: "Detailed inspection guide", free: false, confidence: true, bundle: true },
    { feature: "Advanced scam protection", free: false, confidence: false, bundle: true },
    { feature: "Multiple PPSR reports (up to 5)", free: false, confidence: false, bundle: true },
    { feature: "Editable contract templates", free: false, confidence: false, bundle: true },
    { feature: "Professional negotiation scripts", free: false, confidence: false, bundle: true },
    { feature: "SMS support included", free: false, confidence: false, bundle: true },
    { feature: "WhatsApp support", free: false, confidence: false, bundle: true },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-700 to-blue-800 text-white py-16">
        <div className="section-container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Course Not All Car Reports Are the Same
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
            Most mob charge you $50+ for basic rego checks. We give you everything that actually matters for under $40.
            Don&apos;t be the mug paying dealer prices for Facebook Marketplace cars.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-300">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-lime-500" />
              <span>PPSR Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-lime-500" />
              <span>QLD Legal Contracts</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-lime-500" />
              <span>SMS Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-gray-50">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard
              name="Free Checklist"
              price="Free"
              description="Don't rock up completely blind - at least get the basics"
              features={[
                "47-point inspection checklist",
                "Red flags every Aussie should know",
                "Basic negotiation scripts that work",
                "QLD rego transfer basics",
                "Printable PDF format",
                "Instant download - no spam"
              ]}
              buttonText="Download Free Checklist"
              buttonHref="/free-checklist"
            />

            <PricingCard
              name="Confidence Report"
              price="$9.95"
              priceNote="$9.95 vs $15,000 mistake"
              description="Know before you go - don't be the mug who buys blind"
              features={[
                "Complete inspection checklist",
                "Official PPSR report (shows finance owing)",
                "QLD-specific transfer paperwork",
                "Legal contract templates",
                "Scam detection that actually works",
                "Red flags from 30+ years experience",
                "PDF hits your inbox in 30 seconds"
              ]}
              buttonText="Run Free Check"
              buttonHref="/check"
              isPopular={true}
            />

            <PricingCard
              name="Full Buyer's Bundle"
              price="$39"
              priceNote="Same data dealers charge $50+ for"
              description="Everything plus ongoing support - fair dinkum protection"
              features={[
                "Everything in Confidence Report",
                "Multiple PPSR reports (check 5 cars)",
                "Editable contract templates (TMR approved)",
                "Negotiation scripts that actually work",
                "SMS support when you need it",
                "WhatsApp backup for urgent stuff",
                "Advanced scam protection from 30+ years",
                "Instant delivery - no waiting around"
              ]}
              buttonText="View Contract Pack"
              buttonHref="/contract-pack"
              isPremium={true}
            />
          </div>

          {/* Money back guarantee */}
          <div className="text-center mt-8 p-6 bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
            <Shield className="h-12 w-12 text-lime-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-navy-700 mb-2">100% Satisfaction Guarantee</h3>
            <p className="text-gray-600">
              Not happy? Full refund, no questions asked. We&apos;re not here to rip you off -
              we&apos;re here to help you avoid getting ripped off.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-700 mb-4">
              What&apos;s Included in Each Package?
            </h2>
            <p className="text-xl text-gray-600">
              Detailed breakdown so you know exactly what you&apos;re getting
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead className="bg-navy-700 text-white">
                <tr>
                  <th className="text-left p-4 font-semibold">Features</th>
                  <th className="text-center p-4 font-semibold">
                    Free Checklist
                  </th>
                  <th className="text-center p-4 font-semibold bg-lime-500 text-white">
                    <Star className="h-5 w-5 inline mr-2" />
                    Confidence Report
                    <div className="text-sm font-normal">$9.95</div>
                  </th>
                  <th className="text-center p-4 font-semibold">
                    <Crown className="h-5 w-5 inline mr-2" />
                    Full Bundle
                    <div className="text-sm font-normal">$39</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((item, index) => (
                  <tr key={index} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <td className="p-4 font-medium">{item.feature}</td>
                    <td className="p-4 text-center">
                      {item.free ? (
                        <Check className="h-5 w-5 text-lime-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                    <td className="p-4 text-center bg-lime-500/10">
                      {item.confidence ? (
                        <Check className="h-5 w-5 text-lime-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {item.bundle ? (
                        <Check className="h-5 w-5 text-lime-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-700 mb-4">
              Fair Dinkum Questions
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <div className="card p-6">
              <h3 className="font-bold text-navy-700 mb-3">How quick do I get my report?</h3>
              <p className="text-gray-700">
                Instant mate. Soon as your payment goes through, you&apos;ll get a PDF in your inbox. Usually takes about 30 seconds.
                No waiting around while some dodgy seller changes their mind.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-navy-700 mb-3">Is this legit or some dodgy overseas mob?</h3>
              <p className="text-gray-700">
                100% Aussie owned and operated mate. We use official government databases - same ones the dealers use,
                just without the dealer markup. No dodgy third-party rubbish.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-navy-700 mb-3">What&apos;s this PPSR thing anyway?</h3>
              <p className="text-gray-700">
                Personal Property Securities Register. Shows if there&apos;s finance owing, if it&apos;s stolen, written off,
                or used as security for a loan. Basically tells you if you&apos;ll actually own the car after you buy it.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-navy-700 mb-3">What if I&apos;m buying from a dealer?</h3>
              <p className="text-gray-700">
                Even more reason to check! Some dealers are dodgier than private sellers. At least with Facebook Marketplace,
                you know what you&apos;re getting into. Dealers just hide it better.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Don't Be the Mug Who Buys Blind"
        subtitle="Join 10,000+ smart Aussies who didn't get scammed on Facebook Marketplace"
        primaryText="Get My Report - $9.95"
        primaryHref="/check"
        secondaryText="View Contract Pack"
        secondaryHref="/contract-pack"
      />

      <SiteStickyCTA />
    </>
  )
}
