import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

const REPORT_LINK = "https://buy.stripe.com/9B614o8Qa1212ks8Jo7Zu01";

export const metadata: Metadata = {
  title: { default: "Buying Buddy — Check Any Car Before You Buy", template: "%s | Buying Buddy" },
  description: "Official PPSR checks, rego history, and vehicle reports for Australian buyers. $9.95. PDF in 30 seconds.",
};

export const viewport: Viewport = {
  themeColor: "#1A237E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Header */}
        <header className="site-header">
          <div className="wrap">
            <Link href="/" className="logo">
              <span className="logo-mark">BB</span>
              Buying Buddy
            </Link>
            <a className="header-cta" href={REPORT_LINK} target="_blank" rel="noreferrer">
              Get Report $9.95
            </a>
          </div>
        </header>

        <main>{children}</main>

        {/* Footer */}
        <footer className="site-footer">
          <div className="wrap" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16 }}>
            <p>© 2026 Buying Buddy. Brisbane, Australia.</p>
            <nav style={{ display: "flex", gap: 16 }}>
              <Link href="/#how-it-works">How It Works</Link>
              <Link href="/#pricing">Pricing</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/#faq">FAQ</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
