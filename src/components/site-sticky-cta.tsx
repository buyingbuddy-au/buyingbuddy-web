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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-navy-700/20 bg-lime-500 p-3 text-navy-700 shadow-lg">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto px-4">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-sm sm:text-base text-navy-700">{text}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href={buttonHref}
            className="bg-navy-700 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-navy-800 transition-colors"
          >
            {buttonText}
          </Link>

          {showClose && (
            <button
              onClick={() => setIsVisible(false)}
              className="text-navy-700/70 hover:text-navy-700 p-1"
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
