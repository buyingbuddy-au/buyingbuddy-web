"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DESKTOP_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/check", label: "Free Check" },
  { href: "/ppsr", label: "PPSR" },
  { href: "/inspect", label: "Inspect" },
  { href: "/buddy", label: "Buddy" },
  { href: "/contract-pack", label: "Contracts" },
  { href: "/blog", label: "Guides" },
] as const;

export default function AppHeader() {
  const pathname = usePathname();
  if (pathname === "/inspect/full") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-16 lg:px-8">
        <Link
          href="/"
          className="text-lg font-black tracking-[-0.04em] text-gray-900"
        >
          BuyingBuddy.
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {DESKTOP_NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-bold text-gray-600 transition-colors hover:text-teal-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-teal-700">
          QLD ACTIVE
        </span>
      </div>
    </header>
  );
}