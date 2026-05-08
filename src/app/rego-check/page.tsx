import type { Metadata } from "next";
import QldRegoChecker from "@/components/rego-check/qld-rego-checker";

export const metadata: Metadata = {
  title: "Free QLD Rego Check",
  description:
    "Check a Queensland vehicle registration and get plain-English buyer prompts before you inspect or send money.",
  alternates: {
    canonical: "https://buyingbuddy.com.au/rego-check",
  },
  openGraph: {
    title: "Free QLD Rego Check | Buying Buddy",
    description:
      "Live QLD rego details with buyer-side guidance on what to ask next. QLD-only beta.",
    url: "https://buyingbuddy.com.au/rego-check",
    siteName: "Buying Buddy",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free QLD Rego Check | Buying Buddy",
    description:
      "Check a Queensland rego and get practical next-step questions before you chase the car.",
  },
};

export default function RegoCheckPage() {
  return <QldRegoChecker />;
}
