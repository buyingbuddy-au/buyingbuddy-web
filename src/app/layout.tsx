import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import AppHeader from "@/components/app-header";
import BottomNav from "@/components/bottom-nav";
import StructuredData from "@/components/structured-data";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Buying Buddy | Don't Get Scammed Buying a Used Car",
    template: "%s | Buying Buddy",
  },
  description:
    "Free AI-powered listing checks, official PPSR reports, 25-point inspection tool, and QLD private sale contracts. Built by a licensed QLD dealer with 15+ years experience.",
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://buyingbuddy.com.au",
    siteName: "Buying Buddy",
    title: "Buying Buddy | Don't Get Scammed Buying a Used Car",
    description: "Free AI car checks, PPSR reports, inspection tools & QLD contracts. Built by a licensed dealer.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Buying Buddy | Don't Get Scammed Buying a Used Car",
    description: "Free AI car checks, PPSR reports, inspection tools & QLD contracts.",
  },
  keywords: [
    "PPSR check", "used car check", "car buying QLD", "PPSR report",
    "used car inspection checklist", "private sale contract QLD",
    "car scam prevention", "Facebook Marketplace car scam",
    "buy used car Queensland", "car buying checklist Australia",
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
          <BottomNav />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
