import Link from 'next/link'
import { Check, Star, Crown } from 'lucide-react'

interface PricingCardProps {
  name: string
  price: string
  priceNote?: string
  description: string
  features: string[]
  buttonText: string
  buttonHref: string
  isPopular?: boolean
  isPremium?: boolean
  className?: string
}

export default function PricingCard({
  name,
  price,
  priceNote,
  description,
  features,
  buttonText,
  buttonHref,
  isPopular = false,
  isPremium = false,
  className = ""
}: PricingCardProps) {
  return (
    <div className={`relative ${className}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-lime-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
            <Star className="h-4 w-4" />
            <span>Most Popular</span>
          </div>
        </div>
      )}

      {isPremium && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-navy-700 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
            <Crown className="h-4 w-4" />
            <span>Complete Bundle</span>
          </div>
        </div>
      )}

      <div className={`card p-8 h-full ${isPopular ? 'ring-2 ring-lime-500 shadow-2xl' : ''} ${isPremium ? 'ring-2 ring-navy-700 shadow-2xl' : ''}`}>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-navy-700 mb-2">{name}</h3>
          <div className="text-4xl font-bold text-gray-900 mb-1">{price}</div>
          {priceNote && <div className="text-sm text-gray-600">{priceNote}</div>}
          <p className="text-gray-600 mt-4">{description}</p>
        </div>

        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-lime-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <Link
            href={buttonHref}
            className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
              isPopular || isPremium
                ? 'btn-primary'
                : 'btn-outline'
            }`}
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  )
}
