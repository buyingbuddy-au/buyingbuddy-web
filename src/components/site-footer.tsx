import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black tracking-[-0.03em] text-gray-900">Buying Buddy</p>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Built for QLD private sales, with practical tools and plain-English guidance.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-500">
            <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-700">QLD, Australia</span>
            <span className="rounded-full bg-gray-100 px-3 py-1">No accounts</span>
            <span className="rounded-full bg-gray-100 px-3 py-1">No spam</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/contact" className="font-semibold text-gray-700 transition hover:text-teal-600">
              Contact
            </Link>
            <Link href="/car-buyers-agent-pullenvale" className="font-semibold text-gray-700 transition hover:text-teal-600">
              Pullenvale
            </Link>
            <Link href="/privacy" className="font-semibold text-gray-700 transition hover:text-teal-600">
              Privacy
            </Link>
            <Link href="/terms" className="font-semibold text-gray-700 transition hover:text-teal-600">
              Terms
            </Link>
          </div>
          <a href="mailto:info@buyingbuddy.com.au" className="font-semibold text-gray-700 transition hover:text-teal-600">
            info@buyingbuddy.com.au
          </a>
        </div>
      </div>
    </footer>
  );
}
