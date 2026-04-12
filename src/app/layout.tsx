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
    default: "BuyingBuddy | Brisbane Car Buyer’s Agent + Used Car Tools",
    template: "%s | BuyingBuddy",
  },
  description:
    "Brisbane car buyer’s agent service, free AI car checks, PPSR reports, inspection tools, and QLD private sale paperwork. Built by Jordan Lansbury, a licensed QLD dealer with 15+ years in the trade.",
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://buyingbuddy.com.au",
    siteName: "BuyingBuddy",
    title: "BuyingBuddy | Brisbane Car Buyer’s Agent + Used Car Tools",
    description:
      "Brisbane buyer’s agent service, free checks, PPSR reports, inspections, and QLD paperwork in one place.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuyingBuddy | Brisbane Car Buyer’s Agent + Used Car Tools",
    description:
      "Brisbane buyer’s agent service, free car checks, PPSR reports, inspection tools, and QLD paperwork.",
  },
  keywords: [
    "car buyers agent Brisbane",
    "used car buyer's agent Brisbane",
    "pre purchase car inspection Brisbane",
    "buy used car Brisbane",
    "car buying service Brisbane",
    "used car inspection Brisbane",
    "PPSR check",
    "private sale contract QLD",
    "car scam prevention",
    "BuyingBuddy",
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
