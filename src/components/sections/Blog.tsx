import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import { getAllPosts } from "@/lib/blog";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function Blog() {
  const posts = getAllPosts().slice(0, 6);

  return (
    <section id="blog" className="bg-navy px-6 py-14">
      <div className="mx-auto max-w-content">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-teal">
          Insights
        </p>
        <h2 className="mb-8 max-w-2xl font-serif text-4xl font-semibold leading-tight text-white">
          Pacific digital sovereignty — our thinking.
        </h2>

        <div className="grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <GlassCard
              key={post.slug}
              accent="teal"
              hover
              className="flex flex-col"
              style={{
                boxShadow:
                  "-4px 0 20px rgba(0,212,200,0.2), 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              }}
            >
              {post.frontmatter.category && (
                <p className="mb-3 font-mono text-[11px] uppercase tracking-wide text-teal">
                  {post.frontmatter.category}
                </p>
              )}
              <h3 className="mb-3 font-body text-lg font-bold text-white">
                {post.frontmatter.title}
              </h3>
              <p className="mb-4 flex-1 font-body text-sm leading-relaxed text-silver">
                {post.frontmatter.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wide text-silver">
                  {formatDate(post.frontmatter.date)}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-mono text-[13px] text-teal hover:underline"
                >
                  Read more →
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            href="/blog"
            className="font-mono text-sm text-teal hover:underline"
          >
            View all posts →
          </Link>
        </div>
      </div>
    </section>
  );
}
