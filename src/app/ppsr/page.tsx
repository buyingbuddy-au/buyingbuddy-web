import type { Metadata } from "next";
import PpsrPageClient from "@/components/ppsr/ppsr-page-client";

export const metadata: Metadata = {
  title: "PPSR Check — $4.95 Finance, Stolen & Written-Off Report",
  description: "Run a $4.95 PPSR check before you buy: finance owing, stolen and written-off status from official PPSR data, explained in plain English.",
  alternates: { canonical: "https://buyingbuddy.com.au/ppsr" },
  openGraph: {
    title: "PPSR Check — $4.95 Finance, Stolen & Written-Off Report",
    description: "Check finance owing, stolen and written-off status before money changes hands. Same business day, usually within 2 hours.",
    url: "https://buyingbuddy.com.au/ppsr",
    siteName: "Buying Buddy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PPSR Check — $4.95 Finance, Stolen & Written-Off Report",
    description: "A $4.95 PPSR report with finance owing, stolen and written-off status explained in plain English.",
  },
};

export default function PpsrPage() {
  return <PpsrPageClient />;
}
