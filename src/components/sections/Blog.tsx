const POSTS = [
  {
    category: "BLOCKCHAIN GOVERNANCE",
    title: "Blockchain and Regulatory Compliance in the Pacific",
    teaser:
      "How blockchain-native infrastructure built to international standards from day one changes Pacific SIDS regulatory options.",
  },
  {
    category: "AI & DATA",
    title: "Sovereign Data in the Age of AI",
    teaser:
      "When AI systems query Pacific data, who controls the terms? Who receives the payment? Sovereign infrastructure answers both questions.",
  },
  {
    category: "GOVERNANCE DESIGN",
    title: "Law Before Code — Sequencing Technology and Governance",
    teaser:
      "The sequencing question every Pacific government faces when adopting blockchain infrastructure — and why getting it right matters.",
  },
];

// To publish a post: add an MDX file to content/blog/[slug].mdx and create
// src/app/blog/[slug]/page.tsx to render it. Update the card status below
// from "Coming Soon" to the published date once live.
export default function Blog() {
  return (
    <section id="blog" className="bg-white px-6 py-14">
      <div className="mx-auto max-w-content">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-teal">
          Insights
        </p>
        <h2 className="mb-8 max-w-2xl font-serif text-4xl font-semibold leading-tight text-navy">
          Pacific digital sovereignty — our thinking.
        </h2>

        <div className="grid gap-5 md:grid-cols-3">
          {POSTS.map((post) => (
            <div
              key={post.title}
              className="group rounded-md border border-navy border-l-[3px] border-l-transparent p-5 transition-all hover:border-l-navy hover:shadow-lg"
            >
              <p className="mb-3 font-mono text-[11px] uppercase tracking-wide text-teal">
                {post.category}
              </p>
              <h3 className="mb-3 font-body text-lg font-bold text-navy">
                {post.title}
              </h3>
              <p className="mb-4 font-body text-sm leading-relaxed text-ink">
                {post.teaser}
              </p>
              <div className="flex items-center justify-between">
                <span className="inline-block rounded-full border border-silver/40 bg-silver/[0.15] px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-silver">
                  Coming Soon
                </span>
                <a
                  href="mailto:info@synergybcpacific.com?subject=Blog+Notify"
                  className="font-mono text-[13px] text-teal hover:underline"
                >
                  Notify me →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
