'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="section-container">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0D9488]">
              <span className="text-sm font-black text-white">BB</span>
            </div>
            <span className="text-lg font-black text-navy-700">Buying Buddy</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-medium text-gray-600 transition-colors hover:text-navy-700"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/free-kit"
              className="text-sm font-semibold text-navy-700 transition-colors hover:text-lime-500"
            >
              Free Toolkit
            </Link>
            <Link
              href="/#free-check"
              className="inline-flex items-center justify-center rounded-full bg-[#0D9488] px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#0f766e]"
            >
              Run Free Check
            </Link>
          </div>

          <button
            className="p-2 lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
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
          <div className="border-t border-gray-100 py-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="rounded-lg px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-navy-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 px-4 pt-2">
                <Link
                  href="/free-kit"
                  className="font-semibold text-navy-700 hover:text-lime-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Free Toolkit
                </Link>
                <Link
                  href="/#free-check"
                  className="inline-flex items-center justify-center rounded-full bg-[#0D9488] px-5 py-2.5 text-sm font-bold text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Run Free Check
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
