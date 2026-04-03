import Link from 'next/link'

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
    <section className={`bg-navy-700 py-16 ${className}`}>
      <div className="section-container">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-black tracking-[-0.05em] text-white md:text-6xl">
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
            {subtitle}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex w-full sm:w-auto min-w-[240px] items-center justify-center rounded-full bg-white px-8 py-4 text-base font-bold text-navy-700 transition-all duration-200 hover:bg-gray-100"
            >
              {primaryText}
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex w-full sm:w-auto min-w-[240px] items-center justify-center rounded-full bg-white px-8 py-4 text-base font-bold text-navy-700 transition-all duration-200 hover:bg-gray-100"
            >
              {secondaryText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
