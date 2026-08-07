import GlassCard from "@/components/ui/GlassCard";

const SERVICES = [
  {
    icon: "◈",
    title: "Government DPI Advisory",
    body: "Strategic advisory for Pacific governments adopting blockchain-based digital public infrastructure. Legislative framework design, governance sequencing, standards compliance assessment, and implementation roadmap.",
    engagement: "Retainer · Project · Workshop",
  },
  {
    icon: "⬡",
    title: "Blockchain Architecture",
    body: "End-to-end design and build of distributed ledger infrastructure for government and enterprise. Distributed node architecture, smart contract design, security hardening to CISA Zero Trust and BIS PFMI standards.",
    engagement: "Fixed-scope · Milestone-based",
  },
  {
    icon: "🌊",
    title: "Data Marketplace Integration",
    body: "Integration of institutional data endpoints with Pacific Data Commons. Endpoint configuration, x402 payment setup, trust tier verification, and agent marketplace listing. Pacific institutions start earning from their data.",
    engagement: "Setup fee · Revenue share",
  },
  {
    icon: "▲",
    title: "Enterprise Platform Deployment",
    body: "Deployment and customisation of Payshield workforce management and the OGIP interoperability suite for Pacific government and enterprise clients. Training, support, and ongoing maintenance included.",
    engagement: "Licence · SaaS · White-label",
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-navy px-6 py-14">
      <div className="mx-auto max-w-content">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-teal">
          Services
        </p>
        <h2 className="mb-3 max-w-2xl font-body text-4xl font-bold leading-tight text-white">
          What We Offer
        </h2>
        <p className="mb-8 max-w-prose font-body text-base text-silver">
          From advisory to full-stack deployment — we work with governments,
          institutions, and enterprises across the Pacific.
        </p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {SERVICES.map((service) => (
            <GlassCard
              key={service.title}
              accent="gold"
              padding="p-5"
              style={{
                boxShadow:
                  "-4px 0 20px rgba(245,166,35,0.3), 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              }}
            >
              <span className="mb-4 block text-3xl">{service.icon}</span>
              <h3 className="mb-3 font-body text-xl font-bold text-white">
                {service.title}
              </h3>
              <p className="mb-4 font-body text-sm leading-relaxed text-silver">
                {service.body}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-wide text-gold">
                {service.engagement}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
