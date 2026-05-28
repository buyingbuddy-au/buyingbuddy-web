import type { Metadata } from "next";
import ContactPageClient from "@/components/contact-page-client";

export const metadata: Metadata = {
  title: "Contact Buying Buddy",
  description:
    "Contact Buying Buddy about a used-car check, PPSR report, contract PDF, or private-sale buying question.",
  alternates: { canonical: "https://buyingbuddy.com.au/contact" },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
