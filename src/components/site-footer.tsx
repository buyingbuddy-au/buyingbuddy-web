import Link from 'next/link'
import { Car, Shield, MessageCircle, Phone, Mail } from 'lucide-react'

export default function SiteFooter() {
  return (
    <footer className="bg-navy text-white">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-lime p-2 rounded-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">Buying Buddy</span>
                <div className="text-sm text-gray-300">Smart Car Buying</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your smart dealer friend helping Aussies buy cars with confidence.
              Queensland&apos;s trusted car buying support service.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/free-kit" className="text-gray-300 hover:text-lime-500 transition-colors">
                  Free Car Kit
                </Link>
              </li>
              <li>
                <Link href="/free-checklist" className="text-gray-300 hover:text-lime-500 transition-colors">
                  Free Checklist
                </Link>
              </li>
              <li>
                <Link href="/inspect" className="text-gray-300 hover:text-lime-500 transition-colors">
                  Inspect Tool
                </Link>
              </li>
              <li>
                <Link href="/ppi" className="text-gray-300 hover:text-lime-500 transition-colors">
                  PPI Booking
                </Link>
              </li>
              <li>
                <Link href="/contract-pack" className="text-gray-300 hover:text-lime-500 transition-colors">
                  Contract Pack
                </Link>
              </li>
              <li>
                <Link href="/second-opinion" className="text-gray-300 hover:text-lime-500 transition-colors">
                  Second Opinion
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-lime-500 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-lime-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-300 hover:text-lime-500 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-lime-500 transition-colors">
                  Contact &amp; FAQs
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-lime-500 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Get In Touch</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-lime-500" />
                <span className="text-gray-300">SMS: 0400 123 456</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-lime-500" />
                <span className="text-gray-300">WhatsApp Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-lime-500" />
                <a
                  href="mailto:info@buyingbuddy.com.au"
                  className="text-gray-300 hover:text-lime-500 transition-colors"
                >
                  info@buyingbuddy.com.au
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-lime-500" />
                <span className="text-gray-300">Queensland Only</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2026 Buying Buddy. All rights reserved. Queensland car buying support service.</p>
          <p className="mt-2">PPSR reports, rego transfers, and buyer protection for smart Aussies.</p>
        </div>
      </div>
    </footer>
  )
}
