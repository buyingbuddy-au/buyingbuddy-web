export default function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "BuyingBuddy",
        url: "https://buyingbuddy.com.au",
        description:
          "Brisbane car buyer’s agent service, free checks, PPSR reports, inspection tools, and QLD private sale paperwork.",
        inLanguage: "en-AU",
      },
      {
        "@type": "LocalBusiness",
        name: "BuyingBuddy",
        url: "https://buyingbuddy.com.au",
        image: "https://buyingbuddy.com.au",
        description:
          "BuyingBuddy helps Brisbane used-car buyers find, negotiate, inspect, and complete private-sale deals with more confidence.",
        areaServed: [
          { "@type": "City", name: "Brisbane" },
          { "@type": "Place", name: "Pullenvale" },
          { "@type": "Place", name: "Kenmore" },
          { "@type": "Place", name: "Chapel Hill" },
          { "@type": "Place", name: "Brookfield" },
          { "@type": "Place", name: "Moggill" },
        ],
        founder: {
          "@type": "Person",
          name: "Jordan Lansbury",
          jobTitle: "Licensed QLD Dealer",
          description: "15+ years experience in the Brisbane and QLD car industry.",
        },
        makesOffer: [
          {
            "@type": "Offer",
            name: "Brisbane Car Buyer’s Agent Service",
            price: "997",
            priceCurrency: "AUD",
            description:
              "Flat-fee used-car buyer representation covering car sourcing guidance, negotiation, and inspection coordination.",
          },
          {
            "@type": "Offer",
            name: "Free Car Check",
            price: "0",
            priceCurrency: "AUD",
            description:
              "AI-powered listing analysis with red flags and market position.",
          },
          {
            "@type": "Offer",
            name: "PPSR Report",
            price: "4.95",
            priceCurrency: "AUD",
            description: "Official finance, stolen, and write-off vehicle history check.",
          },
          {
            "@type": "Offer",
            name: "QLD Contract Pack",
            price: "9.95",
            priceCurrency: "AUD",
            description: "Four QLD-specific private sale documents for handover day.",
          },
        ],
      },
      {
        "@type": "Service",
        serviceType: "Used car buyer’s agent",
        provider: {
          "@type": "LocalBusiness",
          name: "BuyingBuddy",
          url: "https://buyingbuddy.com.au",
        },
        areaServed: {
          "@type": "City",
          name: "Brisbane",
        },
        audience: {
          "@type": "Audience",
          audienceType: "Used car buyers",
        },
        description:
          "BuyingBuddy helps Brisbane used-car buyers shortlist the right cars, negotiate better, and arrange independent inspections before purchase.",
      },
      {
        "@type": "WebApplication",
        name: "BuyingBuddy Tools",
        url: "https://buyingbuddy.com.au",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        description:
          "Free AI car checks, PPSR reports, inspection tools, and QLD private-sale paperwork for used-car buyers.",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
