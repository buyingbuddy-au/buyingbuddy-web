import CTASection from '@/components/cta-section'
import SiteStickyCTA from '@/components/site-sticky-cta'
import { Search, FileText, Shield, Car, CheckCircle, MessageCircle, CreditCard, Download } from 'lucide-react'

export const metadata = {
  title: 'How It Works - Car Buying Process | Buying Buddy',
  description: 'Step-by-step guide to buying cars with confidence using Buying Buddy. From finding listings to final purchase in Queensland.',
}

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      title: "Spot a Car on Facebook Marketplace",
      description: "Found a Corolla in Ipswich? Mazda 3 in Caboolture? Course you did. Don't call that number yet mate - time to get smart about it first.",
      icon: Search,
      details: [
        "Screenshot the listing before it gets deleted",
        "Note the location - avoid dodgy areas at night",
        "Don't call the seller yet - get informed first",
        "Red flag if they won't give you the VIN or rego"
      ]
    },
    {
      number: 2,
      title: "Get Protected Before You Go",
      description: "Don't rock up empty-handed like a mug. Get our tools first - $9.95 to avoid a $15,000 mistake. Fair dinkum.",
      icon: FileText,
      details: [
        "Start with our free 47-point checklist",
        "Get Confidence Report ($9.95) - shows finance owing",
        "Full Bundle ($39) if you're checking multiple cars",
        "PDF hits your inbox in 30 seconds"
      ]
    },
    {
      number: 3,
      title: "Check if It's Actually Legal to Buy",
      description: "PPSR check shows if there's $8k finance owing that seller 'forgot' to mention. This is where we catch the dodgy bastards.",
      icon: Shield,
      details: [
        "Official PPSR report - same data dealers use",
        "Check for finance owing, theft records, write-offs",
        "Spot flood cars from Brisbane floods",
        "Clear pass/fail - no guesswork"
      ]
    },
    {
      number: 4,
      title: "Actually Look at the Bloody Thing",
      description: "Don't just kick the tyres like a tourist. Use our checklist to spot problems the seller 'forgot' to mention.",
      icon: Car,
      details: [
        "Follow our 47-point inspection checklist",
        "Check for rust, accident damage, dodgy repairs",
        "Test everything - lights, air con, power steering",
        "Take photos of any problems for negotiation"
      ]
    },
    {
      number: 5,
      title: "Don't Pay Full Price Like a Tourist",
      description: "Armed with real info about the car's problems, negotiate like you know what you're doing. Because now you do.",
      icon: MessageCircle,
      details: [
        "Use our proven scripts that actually work",
        "Point out the scratches and worn tyres you found",
        "Know what it's actually worth on RedBook",
        "Walk away if they're being dodgy - plenty more fish"
      ]
    },
    {
      number: 6,
      title: "Do the TMR Paperwork Properly",
      description: "Use our QLD-specific contracts and transfer guides so you don't get stung by TMR later. No $200 late fees here mate.",
      icon: CheckCircle,
      details: [
        "Use our legal Queensland purchase contracts",
        "Follow TMR transfer process step-by-step",
        "Avoid the $200 penalty for late transfers",
        "Get keys and drive away knowing you're not an idiot!"
      ]
    }
  ]

  const stepImages = [
    'https://cdn.abacus.ai/images/6f334475-b887-4c11-810e-22cecd1a2084.png',
    'https://cdn.abacus.ai/images/59e640c8-02d2-481a-a47b-ba3be8f3345f.png',
    'https://cdn.abacus.ai/images/212fdf3c-0662-451a-bbab-044757acd017.png',
    'https://cdn.abacus.ai/images/59e640c8-02d2-481a-a47b-ba3be8f3345f.png',
    'https://cdn.abacus.ai/images/6df196bf-3293-4853-a00c-50793afb3e48.png',
    'https://cdn.abacus.ai/images/d8394546-4a7a-4e8d-979b-73797ababbd6.png',
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-700 to-blue-800 text-white py-16">
        <div className="section-container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            How to Buy a Car <span className="text-lime-500">Without Getting Scammed</span>
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
            Our proven 6-step process for Queensland buyers. From Facebook Marketplace to TMR transfer -
            no more &ldquo;what do I do now?&rdquo; moments when some dodgy seller tries to rush you.
          </p>

          <div className="bg-white/10 backdrop-blur rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-4 text-lime-500">
              <CheckCircle className="h-6 w-6" />
              <span className="font-semibold">10,000+ smart Aussies didn&apos;t get scammed using this process</span>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-700 mb-4">
              Don&apos;t Be the Mug - Follow This Process
            </h2>
            <p className="text-xl text-gray-600">
              Follow these steps and you&apos;ll never get burned by dodgy Facebook Marketplace sellers again
            </p>
          </div>

          <div className="space-y-16">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}>
                  {/* Content */}
                  <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                    <div className="flex items-center space-x-4">
                      <div className="bg-lime-500 p-4 rounded-xl">
                        <step.icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-lime-500 mb-1">STEP {step.number}</div>
                        <h3 className="text-2xl md:text-3xl font-bold text-navy-700">{step.title}</h3>
                      </div>
                    </div>

                    <p className="text-lg text-gray-700 leading-relaxed">
                      {step.description}
                    </p>

                    <ul className="space-y-3">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-lime-500 flex-shrink-0 mt-1" />
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Image */}
                  <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                    <div className="relative aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden">
                      <img
                        src={stepImages[index]}
                        alt={`Step ${step.number}: ${step.title}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Step connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 mt-8">
                    <div className="w-0.5 h-16 bg-lime-500 opacity-30"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Flow Summary */}
      <section className="py-16 bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-700 mb-4">
              Your Car Buying Journey
            </h2>
            <p className="text-xl text-gray-600">
              From browsing to driving away - we&apos;ve got you covered at every step
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-navy-700 p-6 rounded-2xl mb-6 inline-block">
                <Search className="h-12 w-12 text-lime-500" />
              </div>
              <h3 className="text-xl font-bold text-navy-700 mb-3">Research &amp; Find</h3>
              <p className="text-gray-600">
                Find cars you like, get our tools, check vehicle history
              </p>
            </div>

            <div className="text-center">
              <div className="bg-navy-700 p-6 rounded-2xl mb-6 inline-block">
                <Car className="h-12 w-12 text-lime-500" />
              </div>
              <h3 className="text-xl font-bold text-navy-700 mb-3">Inspect &amp; Negotiate</h3>
              <p className="text-gray-600">
                Use our checklist to inspect, negotiate with confidence
              </p>
            </div>

            <div className="text-center">
              <div className="bg-navy-700 p-6 rounded-2xl mb-6 inline-block">
                <CheckCircle className="h-12 w-12 text-lime-500" />
              </div>
              <h3 className="text-xl font-bold text-navy-700 mb-3">Purchase &amp; Drive</h3>
              <p className="text-gray-600">
                Complete paperwork correctly, transfer rego, enjoy your car!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access CTAs */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-700 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600">
              Choose how you want to begin your smart car buying journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card p-8 text-center">
              <Download className="h-12 w-12 text-lime-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-navy-700 mb-3">Start with Free Tools</h3>
              <p className="text-gray-600 mb-6">
                Get our essential 20-point checklist and basic buying guide
              </p>
              <a href="/free-kit" className="btn-outline w-full block text-center">
                Open Free Kit
              </a>
            </div>

            <div className="card p-8 text-center ring-2 ring-lime-500">
              <Shield className="h-12 w-12 text-lime-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-navy-700 mb-3">Get One Car Report</h3>
              <p className="text-gray-600 mb-6">
                Perfect for your next purchase - PPSR report + contracts
              </p>
              <a
                href="/check"
                className="btn-primary w-full block text-center"
              >
                Run Free Check
              </a>
            </div>

            <div className="card p-8 text-center">
              <CreditCard className="h-12 w-12 text-navy-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-navy-700 mb-3">Go All-In</h3>
              <p className="text-gray-600 mb-6">
                Complete bundle with multiple reports + ongoing support
              </p>
              <a
                href="/contract-pack"
                className="btn-secondary w-full block text-center"
              >
                View Contract Pack
              </a>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Stop Being the Mug?"
        subtitle="Get our tools and stop getting ripped off by dodgy Facebook Marketplace sellers"
        primaryText="Run Free Check"
        primaryHref="/check"
        secondaryText="Start with Free Kit"
        secondaryHref="/free-kit"
      />

      <SiteStickyCTA />
    </>
  )
}
