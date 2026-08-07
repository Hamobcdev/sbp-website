import GlassCard from "@/components/ui/GlassCard";

const RESOURCES = [
  {
    category: "FOUNDATION",
    title: "Blockchain for Pacific Institutions",
    body: "What distributed ledger technology is, what it isn't, and how it applies to Pacific government and enterprise operations.",
  },
  {
    category: "DATA ECONOMY",
    title: "AI, Data Sovereignty, and the Pacific",
    body: "Understanding how AI systems consume Pacific data, and what sovereign data infrastructure protects.",
  },
  {
    category: "REGULATORY",
    title: "Digital Finance Standards for Pacific SIDS",
    body: "International frameworks — BIS, FATF, CISA — explained in plain language for Pacific policymakers and institutions.",
  },
];

// PDFs added to public/assets/resources/ when ready — replace the mailto
// link on each card with a direct PDF link once available.
export default function Education() {
  return (
    <section id="education" className="bg-navy-mid px-6 py-14">
      <div className="mx-auto max-w-content">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-teal">
          Resources
        </p>
        <h2 className="gradient-heading mb-3 max-w-2xl font-body text-4xl font-bold leading-tight">
          Built for Pacific institutions and communities.
        </h2>
        <p className="mb-8 max-w-prose font-body text-base text-silver">
          Plain-language guides on blockchain, AI, and digital governance for
          Pacific governments, institutions, and enterprises.
        </p>

        <div className="grid gap-5 md:grid-cols-3">
          {RESOURCES.map((r) => (
            <GlassCard key={r.title} padding="p-5">
              <p className="mb-3 text-2xl text-teal">📄</p>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-teal">
                {r.category}
              </p>
              <h3 className="mb-3 font-body text-lg font-bold text-white">
                {r.title}
              </h3>
              <p className="mb-4 font-body text-sm leading-relaxed text-silver">
                {r.body}
              </p>
              <a
                href="mailto:info@synergybcpacific.com?subject=Resource+Request"
                className="font-mono text-[13px] text-teal hover:underline"
              >
                Request resource →
              </a>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
