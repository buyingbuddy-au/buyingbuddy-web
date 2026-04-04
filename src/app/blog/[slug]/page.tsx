import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllBlogPosts, getBlogPost } from "@/lib/blog";

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
    return { title: "Post not found" };
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
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      <section className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-10">
        <Link
          href="/blog"
          className="text-sm font-bold text-teal-600 underline decoration-teal-600/40 underline-offset-4"
        >
          ← Back to blog
        </Link>
        <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-teal-600">
          {post.category} · {post.readTime}
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500">{post.excerpt}</p>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_18rem] lg:items-start">
        <article className="rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div
            className="blog-body"
            dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
          />
        </article>

        <aside className="grid gap-4 lg:sticky lg:top-20">
          <div className="rounded-[1.75rem] border border-gray-200 bg-gray-900 p-6 text-white shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-400">
              Don&apos;t get scammed
            </p>
            <p className="mt-3 text-2xl font-black tracking-[-0.04em]">
              Check the car before you hand over cash.
            </p>
            <Link
              href="/check"
              className="mt-6 inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-2xl bg-teal-600 px-5 text-sm font-bold text-white transition hover:bg-teal-700"
            >
              Run Free Check
            </Link>
          </div>

          <div className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">
              Next reads
            </p>
            <div className="mt-4 grid gap-2">
              {relatedPosts.map((candidate) => (
                <Link
                  key={candidate.slug}
                  href={`/blog/${candidate.slug}`}
                  className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 transition hover:bg-teal-50 hover:text-teal-700"
                >
                  {candidate.title}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
