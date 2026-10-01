import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

const mdxComponents = {
  h2: (props: { children?: ReactNode }) => (
    <h2
      className="mb-4 mt-10 font-serif text-2xl font-semibold text-navy"
      {...props}
    />
  ),
  h3: (props: { children?: ReactNode }) => (
    <h3
      className="mb-3 mt-8 font-serif text-xl font-semibold text-navy"
      {...props}
    />
  ),
  p: (props: { children?: ReactNode }) => (
    <p className="mb-5 font-body text-base leading-relaxed text-ink" {...props} />
  ),
  ul: (props: { children?: ReactNode }) => (
    <ul
      className="mb-5 list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-ink"
      {...props}
    />
  ),
  blockquote: (props: { children?: ReactNode }) => (
    <blockquote
      className="my-6 border-l-[3px] border-teal pl-4 font-body text-base italic leading-relaxed text-navy"
      {...props}
    />
  ),
  a: (props: { children?: ReactNode; href?: string }) => (
    <a className="text-teal underline hover:no-underline" {...props} />
  ),
  strong: (props: { children?: ReactNode }) => (
    <strong className="font-bold text-navy" {...props} />
  ),
  hr: () => <hr className="my-10 border-silver/30" />,
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};

  return {
    title: `${post.frontmatter.title} — Synergy Blockchain Pacific`,
    description: post.frontmatter.excerpt,
  };
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <article className="bg-white px-6 py-14 pt-32">
      <div className="mx-auto max-w-prose">
        {post.frontmatter.category && (
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-teal">
            {post.frontmatter.category}
          </p>
        )}
        <h1 className="mb-4 font-serif text-4xl font-semibold leading-tight text-navy">
          {post.frontmatter.title}
        </h1>
        <div className="mb-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-wide text-silver">
          <span>{post.frontmatter.author}</span>
          <span>·</span>
          <span>{formatDate(post.frontmatter.date)}</span>
        </div>

        {post.frontmatter.image && (
          <Image
            src={post.frontmatter.image}
            alt={post.frontmatter.title}
            width={1200}
            height={600}
            className="w-full rounded-lg mb-8 object-cover"
          />
        )}

        <div>
          <MDXRemote source={post.content} components={mdxComponents} />
        </div>
      </div>
    </article>
  );
}
