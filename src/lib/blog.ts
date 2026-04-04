import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  featured: boolean;
  category: string;
  readTime: string;
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const FEATURED_ORDER = [
  "fb-marketplace-car-scams",
  "how-to-check-ppsr",
  "private-car-buying-checklist",
  "qld-private-car-sale-contract-guide",
];

let cachedPosts: BlogPost[] | null = null;

function walkHtmlFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = path.join(directory, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      return walkHtmlFiles(fullPath);
    }

    return fullPath.endsWith(".html") ? [fullPath] : [];
  });
}

function decodeHtmlEntities(value: string) {
  const namedEntities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&quot;": '"',
    "&#39;": "'",
    "&lt;": "<",
    "&gt;": ">",
    "&copy;": "©",
  };

  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(parseInt(code, 16)),
    )
    .replace(/&[a-z#0-9]+;/gi, (entity) => namedEntities[entity] ?? entity)
    .replace(/\u00a0/g, " ");
}

function stripTags(value: string) {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function extractSection(pattern: RegExp, html: string) {
  return html.match(pattern)?.[1]?.trim() ?? "";
}

function rewriteLinks(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\sstyle="[^"]*"/gi, "")
    .replace(/href="(?:\.\.\/)+(#([^"]+))"/gi, 'href="/#$2"')
    .replace(/href="(?:\.\.\/)+(?:blog\/)?([a-z0-9-]+)\.html"/gi, (_, slug) => {
      return `href="/blog/${slug}"`;
    })
    .replace(/href="([a-z0-9-]+)\.html"/gi, (_, slug) => {
      return `href="/blog/${slug}"`;
    });
}

function toBlogPost(filePath: string): BlogPost {
  const rawHtml = readFileSync(filePath, "utf8");
  const slug = path.basename(filePath, ".html");
  const relativePath = path.relative(POSTS_DIR, filePath);
  const featured = !relativePath.startsWith(`blog${path.sep}`);
  const title = stripTags(extractSection(/<h1>([\s\S]*?)<\/h1>/i, rawHtml));
  const excerpt = stripTags(
    extractSection(/<header[\s\S]*?<p>([\s\S]*?)<\/p>/i, rawHtml),
  );
  const sectionHtml = extractSection(
    /<section class="section">[\s\S]*?<div class="container">([\s\S]*?)<\/div>\s*<\/section>/i,
    rawHtml,
  );
  const bodyHtml = rewriteLinks(sectionHtml);
  const wordCount = stripTags(bodyHtml).split(/\s+/).filter(Boolean).length;
  const readTime = `${Math.max(1, Math.round(wordCount / 180))} min read`;

  return {
    slug,
    title,
    excerpt,
    bodyHtml,
    featured,
    category: featured ? "Featured Guide" : "Guide Article",
    readTime,
  };
}

export function getAllBlogPosts() {
  if (cachedPosts) {
    return cachedPosts;
  }

  const htmlFiles = walkHtmlFiles(POSTS_DIR);
  const seenSlugs = new Set<string>();
  const posts = htmlFiles.map((filePath) => {
    const post = toBlogPost(filePath);

    if (seenSlugs.has(post.slug)) {
      throw new Error(`Duplicate blog slug detected: ${post.slug}`);
    }

    seenSlugs.add(post.slug);
    return post;
  });

  posts.sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    if (left.featured && right.featured) {
      return (
        FEATURED_ORDER.indexOf(left.slug) - FEATURED_ORDER.indexOf(right.slug)
      );
    }

    return left.title.localeCompare(right.title);
  });

  cachedPosts = posts;
  return cachedPosts;
}

export function getBlogPost(slug: string) {
  return getAllBlogPosts().find((post) => post.slug === slug);
}
