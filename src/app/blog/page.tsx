import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Buying Buddy",
  description:
    "Used car buying guides, PPSR explainers, scam warnings, and practical Buying Buddy articles.",
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();
  const featuredPosts = posts.filter((post) => post.featured);
  const guidePosts = posts.filter((post) => !post.featured);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      {/* Hero */}
      <section className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Blog &amp; Guides</p>
        <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-5xl">
          Guides for buyers who don&apos;t want surprises at handover.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-gray-500">
          PPSR explainers, scam warnings, private sale checklists, and QLD paperwork guides.
        </p>
      </section>

      {/* Featured */}
      <section className="mt-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Featured guides</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {featuredPosts.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm"
            >
              <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-600">
                {post.category} · {post.readTime}
              </p>
              <h2 className="mt-4 text-xl font-black tracking-[-0.04em] text-gray-900">{post.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-gray-500">{post.excerpt}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-6 inline-flex min-h-[3rem] items-center justify-center rounded-2xl border border-gray-300 px-6 text-sm font-bold text-gray-900 transition hover:bg-gray-50"
              >
                Read article
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* More Reads */}
      <section className="mt-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">More reads</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {guidePosts.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col rounded-[1.75rem] border border-gray-200 bg-gray-50 p-5 shadow-sm"
            >
              <p className="text-xs font-bold text-teal-600">{post.readTime}</p>
              <h3 className="mt-3 text-lg font-black tracking-[-0.04em] text-gray-900">{post.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-gray-500">{post.excerpt}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-flex text-sm font-bold text-gray-900 underline decoration-teal-600/50 underline-offset-4 transition hover:text-teal-600"
              >
                Open post
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
