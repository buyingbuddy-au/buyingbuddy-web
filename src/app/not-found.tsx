import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-12 pt-16 text-center sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Not found</p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-gray-900 sm:text-5xl">
          That page has done a runner.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-gray-500">
          Head back to the homepage or open the blog and keep moving.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-2xl bg-teal-600 px-6 text-sm font-bold text-white transition hover:bg-teal-700 sm:w-auto"
          >
            Back home
          </Link>
          <Link
            href="/blog"
            className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-2xl border border-gray-300 px-6 text-sm font-bold text-gray-900 transition hover:bg-gray-50 sm:w-auto"
          >
            Open blog
          </Link>
        </div>
      </div>
    </div>
  );
}
