import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export type BlogFrontmatter = {
  title: string;
  date: string;
  author: string;
  excerpt: string;
  tags: string[];
  category?: string;
  image?: string;
};

export type BlogPost = {
  slug: string;
  frontmatter: BlogFrontmatter;
};

export type BlogPostWithContent = BlogPost & {
  content: string;
};

function normalizeFrontmatter(data: Record<string, unknown>): BlogFrontmatter {
  return {
    title: String(data.title ?? ""),
    date: String(data.date ?? ""),
    author: String(data.author ?? ""),
    excerpt: String(data.excerpt ?? data.description ?? ""),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    category: data.category ? String(data.category) : undefined,
    image: data.image ? String(data.image) : undefined,
  };
}

export function getAllPosts(): BlogPost[] {
  const files = fs.existsSync(BLOG_DIR)
    ? fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith(".mdx"))
    : [];

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
    const { data } = matter(raw);
    return { slug, frontmatter: normalizeFrontmatter(data) };
  });

  return posts.sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPostWithContent | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return { slug, frontmatter: normalizeFrontmatter(data), content };
}
