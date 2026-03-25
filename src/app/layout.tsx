import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

const R = "https://buy.stripe.com/9B614o8Qa1212ks8Jo7Zu01";

export const metadata: Metadata = {
  title: { default: "Buying Buddy — Check Any Car Before You Buy", template: "%s | Buying Buddy" },
  description: "Official PPSR checks and vehicle reports for Australian buyers. $9.95. PDF in 30 seconds.",
};
export const viewport: Viewport = { themeColor: "#1A237E", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="hdr">
          <div className="w">
            <Link href="/" className="hdr-logo"><span className="hdr-mark">BB</span> Buying Buddy</Link>
            <a className="hdr-cta" href={R} target="_blank" rel="noreferrer">Get Report $9.95</a>
          </div>
        </header>
        <main>{children}</main>
        <footer className="ftr">
          <div className="w" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
            <span>© 2026 Buying Buddy · Brisbane, Australia</span>
            <nav style={{ display: "flex", gap: 14 }}>
              <Link href="/#report">Report</Link>
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
