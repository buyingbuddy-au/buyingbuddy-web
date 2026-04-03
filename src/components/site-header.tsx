'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Car } from 'lucide-react'

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Inspect', href: '/inspect' },
    { name: 'PPI', href: '/ppi' },
    { name: 'Contract Pack', href: '/contract-pack' },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-navy-700/10 bg-white/95 shadow-lg backdrop-blur">
      <div className="section-container">
        <div className="flex items-center justify-between py-4">
          <Link
            href="/"
            className="flex items-center space-x-2"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="rounded-lg bg-navy p-2">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-navy-700">Buying Buddy</span>
              <div className="text-xs text-gray-600">Smart Car Buying</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-navy-700 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center space-x-4 lg:flex">
            <Link
              href="/free-kit"
              className="text-navy-700 font-semibold hover:text-lime-500 transition-colors"
            >
              Free Kit
            </Link>
            <Link
              href="/free-checklist"
              className="text-navy-700 font-semibold hover:text-lime-500 transition-colors"
            >
              Free Checklist
            </Link>
            <Link
              href="/second-opinion"
              className="btn-primary"
            >
              Second Opinion
            </Link>
          </div>

          <button
            className="p-2 lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            type="button"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-navy-700" />
            ) : (
              <Menu className="h-6 w-6 text-navy-700" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="border-t border-gray-200 py-4 lg:hidden">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 font-medium text-gray-700 transition-colors hover:text-navy-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="space-y-3 border-t border-gray-200 px-4 pt-4">
                <Link
                  href="/free-kit"
                  className="block text-navy-700 font-semibold hover:text-lime-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Free Kit
                </Link>
                <Link
                  href="/free-checklist"
                  className="block text-navy-700 font-semibold hover:text-lime-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Free Checklist
                </Link>
                <Link
                  href="/second-opinion"
                  className="block btn-primary text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Second Opinion
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
