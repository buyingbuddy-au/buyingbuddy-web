import Link from 'next/link'
import { ArrowRight, Shield, CheckCircle } from 'lucide-react'

interface CTASectionProps {
  title?: string
  subtitle?: string
  primaryText?: string
  primaryHref?: string
  secondaryText?: string
  secondaryHref?: string
  className?: string
}

export default function CTASection({
  title = "Ready to Buy Smarter?",
  subtitle = "Don't get ripped off. Get the confidence and tools you need to make a smart car purchase.",
  primaryText = "Start with Free Kit",
  primaryHref = "/free-kit",
  secondaryText = "Get Full Bundle ($39)",
  secondaryHref = "/pricing",
  className = ""
}: CTASectionProps) {
  return (
    <section className={`bg-navy py-16 ${className}`}>
      <div className="section-container text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-200 mb-8 leading-relaxed">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href={primaryHref}
              className="bg-lime-500 hover:bg-lime-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 group w-full sm:w-auto justify-center"
            >
              <span>{primaryText}</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={secondaryHref}
              className="border-2 border-white text-white hover:bg-white hover:text-navy-700 font-semibold py-4 px-8 rounded-lg transition-all duration-200 w-full sm:w-auto text-center"
            >
              {secondaryText}
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-300">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-lime-500" />
              <span className="text-sm">Verified PPSR Reports</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-lime-500" />
              <span className="text-sm">30+ Years Experience</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-lime-500" />
              <span className="text-sm">QLD Specialists</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
