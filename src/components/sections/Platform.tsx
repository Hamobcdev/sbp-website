import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import LiveIndicator from "@/components/ui/LiveIndicator";

const PRODUCTS = [
  {
    icon: "◈",
    tag: "OGIP · BIS PFMI · FATF R.15",
    title: "Sovereign Government Infrastructure",
    body: "Whole-of-government digital public infrastructure for Samoa — One Maritime Window, CBS monetary authority dashboard, MOF fiscal command centre, Development Bank platforms, and the OGIP interoperability protocol. Blockchain-ready. Standards-compliant. Built to Law Before Code principles.",
    linkLabel: "View Government Showcase →",
    href: "https://samoa-dpi-showcase-deploy.vercel.app/",
    accent: "gold" as const,
    badgeColor: "gold" as const,
    glowShadow: "-4px 0 20px rgba(245,166,35,0.3)",
    status: null,
  },
  {
    icon: "🌊",
    tag: "Live · Algorand Mainnet · x402",
    title: "Pacific Data Commons",
    body: "Sovereign data marketplace for the Pacific — institutions list data endpoints and receive direct USDC payments when AI agents and international researchers query them. Live on Algorand Mainnet with confirmed transactions August 2026. Entered in the Algorand x402 Global Challenge.",
    linkLabel: "Open Marketplace →",
    href: "https://pdcweb-production.up.railway.app",
    accent: "teal" as const,
    badgeColor: "teal" as const,
    glowShadow: "-4px 0 20px rgba(0,212,200,0.3)",
    status: "live" as const,
  },
  {
    icon: "⬡",
    tag: "Pilot Ready · Enterprise",
    title: "Payshield",
    body: "Workforce management and payroll platform built for Pacific government and enterprise. Role-based access controls, payroll processing, and compliance reporting. Ready for pilot deployment across the Pacific region.",
    linkLabel: "Explore Payshield →",
    href: "https://pay-shield-web-lovat.vercel.app/",
    accent: "silver" as const,
    badgeColor: "silver" as const,
    glowShadow: "-4px 0 20px rgba(136,153,170,0.2)",
    status: "pilot" as const,
  },
];

export default function Platform() {
  return (
    <section id="platform" className="bg-navy px-6 py-14">
      <div className="mx-auto max-w-content">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-teal">
          What We Build
        </p>
        <h2 className="gradient-heading mb-8 max-w-2xl font-body text-4xl font-bold leading-tight">
          Three platforms. One sovereign infrastructure layer.
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {PRODUCTS.map((product) => (
            <GlassCard
              key={product.title}
              accent={product.accent}
              hover
              className="flex flex-col"
              style={{
                boxShadow: `${product.glowShadow}, 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-3xl">{product.icon}</span>
                {product.status === "live" && <LiveIndicator status="live" />}
                {product.status === "pilot" && (
                  <LiveIndicator status="pilot" />
                )}
              </div>

              <Badge color={product.badgeColor}>{product.tag}</Badge>

              <h3 className="mb-3 mt-4 font-body text-xl font-bold text-white">
                {product.title}
              </h3>

              <p className="mb-6 flex-1 font-body text-sm leading-relaxed text-silver">
                {product.body}
              </p>

              <a
                href={product.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[13px] text-teal hover:underline"
              >
                {product.linkLabel}
              </a>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
