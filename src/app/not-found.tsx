import Link from "next/link";

export default function NotFound() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl panel p-8 text-center sm:p-10">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-teal">
          Not found
        </p>
        <h1 className="mt-4 text-4xl font-bold text-brand-ink sm:text-5xl">
          That page has done a runner.
        </h1>
        <p className="mt-5 text-base leading-8 text-brand-muted">
          Head back to the homepage or open the blog and keep moving.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-teal px-6 py-3 text-sm font-bold text-white"
            href="/"
          >
            Back home
          </Link>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-teal/15 px-6 py-3 text-sm font-bold text-brand-ink"
            href="/blog"
          >
            Open blog
          </Link>
        </div>
      </div>
    </section>
  );
}
