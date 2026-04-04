export default function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Buying Buddy",
    url: "https://buyingbuddy.com.au",
    description:
      "Free AI-powered listing checks, official PPSR reports, 25-point inspection tool, and QLD private sale contracts. Built by a licensed QLD dealer.",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: [
      {
        "@type": "Offer",
        name: "Free Car Check",
        price: "0",
        priceCurrency: "AUD",
        description: "AI-powered listing analysis with red flags and market position.",
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
    author: {
      "@type": "Person",
      name: "Jordan Lansbury",
      jobTitle: "Licensed Car Dealer",
      description: "15+ years experience in the QLD automotive industry.",
    },
    areaServed: {
      "@type": "State",
      name: "Queensland",
      containedInPlace: { "@type": "Country", name: "Australia" },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
