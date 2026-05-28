"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  ClipboardCheck,
  FileText,
  Home,
  Shield,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/rego-check", label: "Rego", icon: BadgeCheck },
  { href: "/ppsr", label: "PPSR", icon: Shield },
  { href: "/inspect", label: "Inspect", icon: ClipboardCheck },
  { href: "/deal", label: "Deal Room", icon: FileText },
] as const;

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname === "/inspect/full") return null;

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-50 w-full max-w-full overflow-x-clip border-t border-gray-200 bg-white/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto grid w-full max-w-lg grid-cols-5 gap-1 px-2">
        {NAV_ITEMS.map((item) => {
          const active = isActiveRoute(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-2xl px-1.5 py-2 text-[11px] font-black transition active:scale-95 ${
                active ? "bg-teal-50 text-teal-700" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${active ? "text-teal-700" : "text-gray-400"}`}
                strokeWidth={2.4}
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}