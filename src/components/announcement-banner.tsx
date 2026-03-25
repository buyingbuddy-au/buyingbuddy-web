"use client";

import { useState } from "react";

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <div className="border-b border-white/15 bg-gradient-to-r from-brand-red to-[#ef5350] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] sm:px-6 lg:px-8">
        <p>⚠️ Facebook Marketplace Scams Up 300% This Year - Protect Yourself</p>
        <button
          aria-label="Dismiss warning banner"
          className="rounded-full border border-white/40 px-3 py-1 text-xs transition hover:bg-white/10"
          onClick={() => setVisible(false)}
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  );
}
