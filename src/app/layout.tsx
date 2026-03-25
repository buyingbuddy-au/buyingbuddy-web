import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Buying Buddy | Vehicle Reports for Private Buyers",
    template: "%s | Buying Buddy",
  },
  description:
    "Paste any car listing from Facebook Marketplace, Carsales, or Gumtree. We'll tell you if it's worth your time — for free. Official PPSR checks, dealer-level verdicts, and QLD private sale contracts.",
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
                href="#hero-input"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("hero-input")?.scrollIntoView({ behavior: "smooth" });
                  document.getElementById("hero-input")?.focus();
                }}
              >
                Check a Listing — Free
              </a>
            </div>
          </header>
          <main className="site-main">{children}</main>
          <footer className="site-footer">
            <div className="container site-footer-inner">
              <span>© 2026 Buying Buddy · Brisbane, Australia</span>
              <nav aria-label="Footer" className="site-footer-nav">
                <Link href="/#how-it-works">How It Works</Link>
                <Link href="/#pricing">Pricing</Link>
                <Link href="/blog">Blog</Link>
                <Link href="/#faq">FAQ</Link>
                <a href="mailto:info@buyingbuddy.com.au">info@buyingbuddy.com.au</a>
              </nav>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
