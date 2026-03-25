import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllBlogPosts, getBlogPost } from "@/lib/blog";
import { CONFIDENCE_REPORT_LINK } from "@/lib/site-content";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getAllBlogPosts()
    .filter((candidate) => candidate.slug !== post.slug)
    .slice(0, 3);

  return (
    <>
      <section className="hero-shell overflow-hidden text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <Link
            className="inline-flex text-sm font-black uppercase tracking-[0.12em] text-brand-lime underline decoration-white/25 underline-offset-4"
            href="/blog"
          >
            Back to blog
          </Link>
          <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-brand-lime">
            {post.category} • {post.readTime}
          </p>
          <h1 className="mt-4 display-font max-w-4xl text-4xl uppercase leading-[0.95] sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/82">
            {post.excerpt}
          </p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
          <article className="panel p-6 sm:p-8">
            <div
              className="blog-body"
              dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
            />
          </article>
          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="panel !bg-brand-navy p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-lime">
                Don&apos;t get scammed
              </p>
              <p className="mt-3 display-font text-3xl uppercase leading-[0.95]">
                Check the car before you hand over cash.
              </p>
              <p className="mt-4 text-sm leading-7 text-white/82">
                Get the real story on any used car before you hand over your
                hard-earned cash.
              </p>
              <a
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-brand-lime px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-brand-navy transition hover:-translate-y-0.5"
                href={CONFIDENCE_REPORT_LINK}
                rel="noreferrer"
                target="_blank"
              >
                Get My Car Report Now - $9.95
              </a>
            </div>
            <div className="panel p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-lime">
                Next Reads
              </p>
              <div className="mt-4 space-y-3">
                {relatedPosts.map((candidate) => (
                  <Link
                    className="block rounded-[1.1rem] bg-brand-lime/8 px-4 py-4 text-sm font-bold leading-6 text-brand-navy transition hover:bg-brand-lime/14"
                    href={`/blog/${candidate.slug}`}
                    key={candidate.slug}
                  >
                    {candidate.title}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
