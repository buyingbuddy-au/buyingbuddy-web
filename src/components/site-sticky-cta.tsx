'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface StickyCTAProps {
  text?: string
  buttonText?: string
  buttonHref?: string
  showClose?: boolean
}

export default function SiteStickyCTA({
  text = "Don't get scammed",
  buttonText = "Run Free Check",
  buttonHref = "/#free-check",
  showClose = true
}: StickyCTAProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible || !isScrolled) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto px-4">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm sm:text-base text-gray-900">Free listing check for QLD buyers</span>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href={buttonHref}
            className="bg-[#0D9488] text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-[#0f766e] transition-colors"
          >
            Check Free
          </Link>

          {showClose && (
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Close banner"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
