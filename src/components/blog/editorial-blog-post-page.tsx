import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllBlogPosts,
  getBlogPost,
} from "@/lib/blog";

export function EditorialBlogPostPage({ slug }: { slug: string }) {
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getAllBlogPosts()
    .filter((candidate) => candidate.slug !== post.slug)
    .slice(0, 3);

  return (
    <>
      <section className="content-hero">
        <div className="container content-hero-inner">
          <div className="content-hero-copy">
            <Link className="content-back-link" href="/blog">
              Back to blog
            </Link>
            <p className="content-kicker">
              {post.category} | {post.readTime}
            </p>
            <h1 className="content-title">{post.title}</h1>
            <p className="content-lede">{post.excerpt}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container blog-page-grid">
          <article className="panel blog-article-shell">
            <div
              className="blog-body"
              dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
            />
          </article>

          <aside className="blog-side-stack">
            <div className="panel blog-side-card">
              <p className="content-kicker">Start with protection</p>
              <h2 className="blog-side-title">
                Download the free QLD buyer checklist.
              </h2>
              <p className="blog-side-copy">
                Grab the checklist, contract prompts, negotiation scripts, and
                PPSR guide before you inspect the car.
              </p>
              <Link className="button button-primary" href="/free-kit">
                Get the free kit
              </Link>
            </div>

            <div className="panel blog-side-card">
              <p className="content-kicker">Need another pair of eyes?</p>
              <h2 className="blog-side-title">Book a pre-purchase inspection</h2>
              <p className="blog-side-copy">
                Use Buying Buddy to line up a PPI before you transfer cash.
              </p>
              <Link className="button button-secondary" href="/ppi">
                Book an inspection
              </Link>
            </div>

            <div className="panel blog-side-card">
              <p className="content-kicker">Next reads</p>
              <div className="blog-related-list">
                {relatedPosts.map((candidate) => (
                  <Link
                    className="blog-related-link"
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
