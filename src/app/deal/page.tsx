import type { Metadata } from "next";
import DealLandingPageClient from "@/components/deal/deal-landing-page-client";

export const metadata: Metadata = {
  title: "Deal Room | Buying Buddy",
  description:
    "Create a shared Deal Room for a private used-car handover: buyer and seller details, document prompts, and a timestamped PDF sale record.",
  alternates: { canonical: "https://buyingbuddy.com.au/deal" },
};

export default function DealLandingPage() {
  return (
    <>
      <h1 className="sr-only">Deal Room for private used-car handovers</h1>
      <DealLandingPageClient />
    </>
  );
}
