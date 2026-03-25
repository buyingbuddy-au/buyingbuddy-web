import { CONFIDENCE_REPORT_LINK } from "@/lib/site-content";

export default function StickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-navy/15 bg-brand-lime/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 text-brand-navy shadow-2xl backdrop-blur sm:px-6 lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <p className="max-w-[10rem] text-sm font-black uppercase tracking-[0.08em]">
          Don&apos;t get scammed
        </p>
        <a
          className="inline-flex min-h-11 animate-soft-bounce items-center justify-center rounded-full bg-brand-navy px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white"
          href={CONFIDENCE_REPORT_LINK}
          rel="noreferrer"
          target="_blank"
        >
          Get Report $9.95
        </a>
      </div>
    </div>
  );
}
