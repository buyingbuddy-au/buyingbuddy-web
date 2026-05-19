import type { Metadata } from "next";
import DealLandingPageClient from "@/components/deal/deal-landing-page-client";

export const metadata: Metadata = {
  title: "Deal Pack | Buying Buddy",
  description:
    "Create a shared Deal Pack for a private used-car handover: buyer and seller details, document prompts, and a timestamped deal record.",
  alternates: { canonical: "https://buyingbuddy.com.au/deal" },
};

export default function DealLandingPage() {
  return (
    <>
      <h1 className="sr-only">Deal Pack for private used-car handovers</h1>
      <DealLandingPageClient />
    </>
  );
}
