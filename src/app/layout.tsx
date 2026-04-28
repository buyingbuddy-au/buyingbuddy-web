import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import AppHeader from "@/components/app-header";
import BottomNav from "@/components/bottom-nav";
import SiteFooter from "@/components/site-footer";
import StructuredData from "@/components/structured-data";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Buying Buddy | Used Car Buying Help & Buyer-Side Tools",
    template: "%s | Buying Buddy",
  },
  description:
    "Self-serve buyer-side help for used-car buyers: free listing checks, $4.95 PPSR reports, inspection prompts, and private-sale paperwork.",
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://buyingbuddy.com.au",
    siteName: "Buying Buddy",
    title: "Buying Buddy | Used Car Buying Help & Buyer-Side Tools",
    description:
      "A self-serve buyer's-agent alternative with free listing checks, $4.95 PPSR reports, inspection prompts, and private-sale paperwork.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Buying Buddy | Used Car Buying Help & Buyer-Side Tools",
    description:
      "Buyer-side used-car help before money changes hands: check the listing, run the PPSR, inspect the car, and sort the paperwork.",
  },
  keywords: [
    "used car buying help Australia",
    "buyer agent alternative Australia",
    "used car check Australia",
    "PPSR report Australia",
    "PPSR check QLD",
    "private car sale QLD",
    "used car inspection checklist",
    "QLD car sale contract",
    "Facebook Marketplace car scam",
    "Buying Buddy",
  ],
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D9488",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
      </head>
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <div className="flex min-h-screen flex-col bg-white">
          <AppHeader />
          <main className="flex-1 pb-20 lg:pb-0">{children}</main>
          <SiteFooter />
          <BottomNav />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
