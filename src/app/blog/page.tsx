import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Used car buying guides, PPSR explainers, scam warnings, and practical Buying Buddy articles.",
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();
  const featuredPosts = posts.filter((post) => post.featured);
  const guidePosts = posts.filter((post) => !post.featured);

  return (
    <>
      <section className="hero-shell overflow-hidden text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-lime">
            Trusty Car Guide
          </p>
          <h1 className="mt-4 display-font max-w-4xl text-4xl uppercase leading-[0.95] sm:text-5xl lg:text-6xl">
            Blog posts for buyers who don&apos;t want surprises at handover.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82">
            PPSR explainers, scam warnings, private sale checklists, QLD
            paperwork guides, and short articles built from the Trusty Car Guide
            post set.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-lime">
              Featured Guides
            </p>
            <h2 className="mt-3 display-font text-4xl uppercase leading-[0.95] text-brand-navy sm:text-5xl">
              Start with the core checks.
            </h2>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {featuredPosts.map((post) => (
              <article className="panel p-6 sm:p-7" key={post.slug}>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-lime">
                  {post.category} • {post.readTime}
                </p>
                <h3 className="mt-4 display-font text-3xl uppercase leading-[0.95] text-brand-navy">
                  {post.title}
                </h3>
                <p className="mt-4 text-base leading-8 text-brand-ink/82">
                  {post.excerpt}
                </p>
                <Link
                  className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-brand-navy px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5 hover:text-brand-lime"
                  href={`/blog/${post.slug}`}
                >
                  Read article
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-lime">
            More Reads
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {guidePosts.map((post) => (
              <article className="panel p-5" key={post.slug}>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-lime">
                  {post.readTime}
                </p>
                <h3 className="mt-3 text-2xl font-black leading-tight text-brand-navy">
                  {post.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-brand-ink/82">
                  {post.excerpt}
                </p>
                <Link
                  className="mt-5 inline-flex text-sm font-black uppercase tracking-[0.08em] text-brand-navy underline decoration-brand-lime/60 underline-offset-4"
                  href={`/blog/${post.slug}`}
                >
                  Open post
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
