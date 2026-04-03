"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  Home,
  MessageCircle,
  Search,
  Shield,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/check", label: "Check", icon: Search },
  { href: "/ppsr", label: "PPSR", icon: Shield },
  { href: "/inspect", label: "Inspect", icon: ClipboardCheck },
  { href: "/buddy", label: "Buddy", icon: MessageCircle },
] as const;

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden">
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = isActiveRoute(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-1 text-[11px] font-bold transition-colors ${
                active ? "text-teal-600" : "text-gray-500"
              }`}
            >
              <Icon
                className={`h-6 w-6 ${active ? "text-teal-600" : "text-gray-400"}`}
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
