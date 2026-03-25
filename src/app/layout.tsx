import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { CONFIDENCE_REPORT_LINK } from "@/lib/site-content";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Buying Buddy | Vehicle History Reports",
    template: "%s | Buying Buddy",
  },
  description:
    "Search any car by VIN or rego. Buying Buddy checks PPSR, stolen vehicle register, write-off status, and rego history, then sends a clear PDF report in under 30 seconds.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <div className="container site-header-inner">
              <Link className="site-logo" href="/">
                Buying Buddy
              </Link>
              <a
                className="button button-primary button-small header-cta"
                href={CONFIDENCE_REPORT_LINK}
                rel="noreferrer"
                target="_blank"
              >
                Get Report — $9.95
              </a>
            </div>
          </header>
          <main className="site-main">{children}</main>
          <footer className="site-footer">
            <div className="container site-footer-inner">
              <span>© 2026 Buying Buddy · Brisbane, Australia</span>
              <nav aria-label="Footer" className="site-footer-nav">
                <Link href="/#report">Report</Link>
                <Link href="/#pricing">Pricing</Link>
                <Link href="/blog">Blog</Link>
                <Link href="/#faq">FAQ</Link>
              </nav>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
