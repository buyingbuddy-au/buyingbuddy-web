import type { Metadata } from "next";
import PdfLandingPageClient from "@/components/deal/deal-landing-page-client";

export const metadata: Metadata = {
  title: "PDF | Buying Buddy",
  description:
    "Create a shared PDF for a private used-car handover: buyer and seller details, document prompts, and a timestamped deal record.",
  alternates: { canonical: "https://buyingbuddy.com.au/pdf" },
};

export default function PdfLandingPage() {
  return (
    <>
      <h1 className="sr-only">PDF for private used-car handovers</h1>
      <PdfLandingPageClient />
    </>
  );
}
