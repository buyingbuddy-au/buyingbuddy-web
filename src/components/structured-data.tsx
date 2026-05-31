export default function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Buying Buddy",
        url: "https://buyingbuddy.com.au",
        description:
          "Buyer-side used-car buying help: listing checks, PPSR reports, inspection prompts, and private-sale paperwork.",
        inLanguage: "en-AU",
      },
      {
        "@type": "Organization",
        name: "Buying Buddy",
        url: "https://buyingbuddy.com.au",
        description:
          "Buying Buddy gives private used-car buyers cheap, practical self-serve tools to avoid expensive mistakes.",
        founder: {
          "@type": "Person",
          name: "Jordan Lansbury",
          description: "Licensed QLD dealer with 15+ years in the car industry.",
        },
        areaServed: {
          "@type": "AdministrativeArea",
          name: "Queensland, Australia",
        },
      },
      {
        "@type": "OfferCatalog",
        name: "Buying Buddy launch tools",
        itemListElement: [
          {
            "@type": "Offer",
            name: "Free Listing Check",
            price: "0",
            priceCurrency: "AUD",
            description:
              "A fast used-car listing sanity check with red flags and suggested next steps.",
          },
          {
            "@type": "Offer",
            name: "PPSR Report",
            price: "4.95",
            priceCurrency: "AUD",
            description:
              "Finance owing, stolen, and written-off status explained in plain English.",
          },
          {
            "@type": "Offer",
            name: "Deal Room",
            price: "9.99",
            priceCurrency: "AUD",
            description:
              "Post-PPSR handover workspace with QLD paperwork, buyer/seller detail capture, and a guided sale record.",
          },
        ],
      },
      {
        "@type": "WebApplication",
        name: "Buying Buddy Buyer-Side Tools",
        url: "https://buyingbuddy.com.au",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        description:
          "Free listing checks, PPSR reports, inspection prompts, and private-sale paperwork for used-car buyers who want buyer-side help.",
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
