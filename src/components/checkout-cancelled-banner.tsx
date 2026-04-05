"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";

export function CheckoutCancelledBanner() {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || searchParams.get("checkout") !== "cancelled") {
    return null;
  }

  return (
    <div className="mx-auto mb-4 flex w-full max-w-6xl items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
      <span>Checkout cancelled — you weren&apos;t charged.</span>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-full p-1 text-amber-600 transition hover:bg-amber-100"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
