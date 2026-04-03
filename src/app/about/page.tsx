import CTASection from '@/components/cta-section'
import { Car, Shield, Users, Clock, CheckCircle, AlertTriangle, Star, Heart } from 'lucide-react'

export const metadata = {
  title: 'About Us - Real Car People Helping Real Aussies | Buying Buddy',
  description: 'Meet the experienced car dealers helping Queensland buyers avoid scams and buy with confidence. 30+ years of car buying expertise.',
}

export default function AboutPage() {
  const stats = [
    { number: "30+", label: "Years Experience", icon: Clock },
    { number: "500+", label: "Happy Buyers", icon: Users },
    { number: "2000+", label: "Cars Evaluated", icon: Car },
    { number: "100%", label: "Queensland Focus", icon: Shield },
  ]

  const values = [
    {
      title: "No Bullsh*t Advice",
      description: "We tell you straight - if a car is a dud, we'll say so. If it's a good deal, we'll celebrate with you.",
      icon: AlertTriangle
    },
    {
      title: "Real People First",
      description: "We're not some faceless tech company. We're real car people who've been there, done that, got the t-shirt.",
      icon: Users
    },
    {
      title: "Your Success is Ours",
      description: "We only win when you drive away happy. Every dollar you save, every problem we help you avoid - that's our victory.",
      icon: Heart
    }
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-700 to-blue-800 text-white py-16">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                We&apos;re Real Car People Helping <span className="text-lime-500">Real Aussies</span>
              </h1>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                30+ years buying and selling cars every single week. We&apos;ve seen every scam,
                every trick, and every way buyers get burned. Now we&apos;re using that knowledge
                to level the playing field.
              </p>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-6 w-6 text-lime-500" />
                  <span className="font-semibold">Not a tech startup</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Car className="h-6 w-6 text-lime-500" />
                  <span className="font-semibold">Real dealers with real experience</span>
                </div>
              </div>
            </div>

            <div>
              <div className="relative aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden">
                <div className="flex h-full w-full flex-col items-center justify-center border-2 border-dashed border-gray-300 p-8"><span className="text-2xl font-black text-navy-700">JL</span><p className="mt-2 text-sm font-bold text-navy-700">Jordan Lansbury</p><p className="mt-1 text-xs text-gray-500">[Insert real photo here]</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-lime-500 p-4 rounded-xl inline-block mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-navy-700 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gray-50">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-navy-700 mb-6">
                Why We Started Buying Buddy
              </h2>
              <p className="text-xl text-gray-600">
                Because we got tired of watching good people get ripped off
              </p>
            </div>

            <div className="space-y-8 text-lg text-gray-700 leading-relaxed">
              <p>
                Look, we&apos;ve been in the car game for over 30 years. Started as young blokes
                working at dealerships, learned the trade from the ground up. Bought and sold
                thousands of cars. Seen it all.
              </p>

              <p>
                But here&apos;s what really gets us fired up - watching decent people get absolutely
                shafted by dodgy sellers, scam listings, and cars with hidden problems.
                Single mums buying flood cars. Young blokes getting stuck with massive repair bills.
                Families losing their savings to professional scammers.
              </p>

              <p>
                The car buying process in Australia is broken. The good sellers get drowned out
                by the dodgy ones. Facebook Marketplace is like the Wild West. And regular people
                don&apos;t have the knowledge to protect themselves.
              </p>

              <p className="font-semibold text-navy-700">
                So we decided to do something about it.
              </p>

              <p>
                Buying Buddy isn&apos;t some fancy tech startup with venture capital and buzzwords.
                We&apos;re real car people who know the difference between a bargain and a money pit.
                We can spot a scam from a mile away. And we know exactly what paperwork you need
                in Queensland to avoid problems down the road.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-700 mb-6">
              How We Work
            </h2>
            <p className="text-xl text-gray-600">
              No corporate nonsense, just straight-talking advice
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <div key={index} className="card p-8 text-center">
                <div className="bg-navy-700 p-4 rounded-xl inline-block mb-6">
                  <value.icon className="h-8 w-8 text-lime-500" />
                </div>
                <h3 className="text-xl font-bold text-navy-700 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-navy-700 text-white">
        <div className="section-container text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Our Mission is Simple
            </h2>
            <p className="text-2xl text-gray-200 mb-8 leading-relaxed">
              &ldquo;Help every Queensland car buyer make one smart purchase at a time.
              No one should get ripped off just because they don&apos;t know what we know.&rdquo;
            </p>

            <div className="bg-white/10 backdrop-blur rounded-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-lime-500">What We Do</h3>
                  <ul className="text-left space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-lime-500 flex-shrink-0" />
                      <span>Run real PPSR reports and explain what they mean</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-lime-500 flex-shrink-0" />
                      <span>Provide QLD-specific legal contracts and guides</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-lime-500 flex-shrink-0" />
                      <span>Teach you to spot scams and dodgy listings</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-lime-500 flex-shrink-0" />
                      <span>Share negotiation techniques that actually work</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4 text-lime-500">What We Don&apos;t Do</h3>
                  <ul className="text-left space-y-2">
                    <li className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <span>Sell you cars (we&apos;re buyers&apos; advocates)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <span>Use fancy jargon or confusing tech speak</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <span>Promise unrealistic deals or magic solutions</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <span>Work with dodgy dealers or get kickbacks</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Queensland Only */}
      <section className="py-16 bg-gray-50">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-700 mb-6">
              Why Queensland Only?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Because we&apos;d rather do one state properly than half-arse the whole country
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card p-6 text-left">
                <Shield className="h-12 w-12 text-lime-500 mb-4" />
                <h3 className="font-bold text-navy-700 mb-3">State-Specific Expertise</h3>
                <p className="text-gray-700">
                  Every state has different rego rules, transfer processes, and legal requirements.
                  We know Queensland inside out, so our advice is always accurate and current.
                </p>
              </div>

              <div className="card p-6 text-left">
                <Users className="h-12 w-12 text-lime-500 mb-4" />
                <h3 className="font-bold text-navy-700 mb-3">Better Service</h3>
                <p className="text-gray-700">
                  By focusing on Queensland, we can provide better support, more relevant advice,
                  and actually understand the local market conditions and common scams.
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
              <p className="text-lg text-gray-700">
                <strong>Planning to expand?</strong> Maybe one day. But right now, we&apos;re focused on
                being the best car buying service Queensland has ever seen. Quality over quantity, always.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Work with People You Can Trust?"
        subtitle="We're not here to get rich quick - we're here to help Aussies buy cars without getting screwed over"
        primaryText="Get Started Today"
        primaryHref="/pricing"
        secondaryText="Ask Us Anything"
        secondaryHref="/contact"
      />
    </>
  )
}

