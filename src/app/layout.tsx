import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { CONFIDENCE_REPORT_LINK, NAV_LINKS } from "@/lib/site-content";

export const metadata: Metadata = {
  title: {
    default: "Buying Buddy",
    template: "%s | Buying Buddy",
  },
  description:
    "Used car checks, PPSR guidance, scam protection, and plain-English buying help for Aussie buyers.",
};

export const viewport: Viewport = {
  themeColor: "#1A237E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="sticky top-0 z-30 border-b border-white/15 bg-[rgba(26,35,126,0.92)] text-white frosted">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <Link className="flex items-center gap-3" href="/">
                <span className="rounded-full bg-brand-lime px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-brand-navy">
                  Buying Buddy
                </span>
                <span className="hidden text-sm font-semibold text-white/70 sm:inline">
                  Know before you go
                </span>
              </Link>
              <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
                {NAV_LINKS.map((link) => (
                  <Link
                    className="transition hover:text-brand-lime"
                    href={link.href}
                    key={link.label}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex items-center gap-2">
                <Link
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-bold transition hover:border-brand-lime hover:text-brand-lime md:hidden"
                  href="/blog"
                >
                  Blog
                </Link>
                <a
                  className="hidden min-h-10 items-center justify-center rounded-full bg-brand-lime px-5 py-2 text-sm font-black uppercase tracking-[0.08em] text-brand-navy transition hover:-translate-y-0.5 hover:shadow-lg md:inline-flex"
                  href={CONFIDENCE_REPORT_LINK}
                  rel="noreferrer"
                  target="_blank"
                >
                  Get Report $9.95
                </a>
              </div>
            </div>
          </header>
          <main>{children}</main>
          <footer className="border-t border-white/15 bg-brand-navy text-white">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl space-y-3">
                  <p className="display-font text-2xl uppercase tracking-[0.08em]">
                    Don&apos;t risk buying the wrong car.
                  </p>
                  <p className="max-w-xl text-sm leading-7 text-white/75">
                    Confident buyers ask the right questions. We don&apos;t sell
                    cars. We protect buyers.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm font-semibold text-white/80">
                  {NAV_LINKS.map((link) => (
                    <Link
                      className="transition hover:text-brand-lime"
                      href={link.href}
                      key={link.label}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
              <p className="mt-10 text-xs uppercase tracking-[0.14em] text-white/55">
                Built with ♥ in Brisbane. Prices in AUD.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
