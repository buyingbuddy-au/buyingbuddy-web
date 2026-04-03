import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import AppHeader from "@/components/app-header";
import BottomNav from "@/components/bottom-nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Buying Buddy | Vehicle Reports for Private Buyers",
    template: "%s | Buying Buddy",
  },
  description:
    "Paste any car listing from Facebook Marketplace, Carsales, or Gumtree. We'll tell you if it's worth your time for free. Official PPSR checks, dealer-level verdicts, and QLD private sale contract tools.",
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
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <div className="flex min-h-screen flex-col bg-white">
          <AppHeader />
          <main className="flex-1 pb-20 lg:pb-0">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
