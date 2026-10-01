import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Insights — Synergy Blockchain Pacific",
  description:
    "Our thinking on sovereign digital infrastructure, verifiable governance, and Pacific digital sovereignty.",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <section className="bg-white px-6 py-14 pt-32">
      <div className="mx-auto max-w-content">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-teal">
          Insights
        </p>
        <h1 className="mb-10 max-w-2xl font-serif text-4xl font-semibold leading-tight text-navy">
          Pacific digital sovereignty — our thinking.
        </h1>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-md border border-navy border-l-[3px] border-l-transparent p-5 transition-all hover:border-l-navy hover:shadow-lg"
            >
              {post.frontmatter.category && (
                <p className="mb-3 font-mono text-[11px] uppercase tracking-wide text-teal">
                  {post.frontmatter.category}
                </p>
              )}
              <h2 className="mb-3 font-body text-lg font-bold text-navy">
                {post.frontmatter.title}
              </h2>
              <p className="mb-4 font-body text-sm leading-relaxed text-ink">
                {post.frontmatter.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wide text-silver">
                  {formatDate(post.frontmatter.date)}
                </span>
                <span className="font-mono text-[13px] text-teal group-hover:underline">
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
