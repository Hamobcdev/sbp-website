import Image from "next/image";

const STAT_CARDS = [
  {
    icon: "◈",
    title: "Registered",
    body: "Samoa Companies Office",
  },
  {
    icon: "▲",
    title: "Mainnet",
    body: "Transactions Live",
  },
  {
    icon: "⟳",
    title: "Standards",
    body: "BIS · FATF · CISA · IMF",
  },
  {
    icon: "●",
    title: "Active",
    body: "Pilot Engagements",
  },
];

export default function About() {
  return (
    <section id="about" className="bg-white px-6 py-14">
      <div className="mx-auto max-w-content">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-teal">
              Who We Are
            </p>
            <h2 className="mb-6 font-body text-4xl font-bold leading-tight text-navy">
              Built in Samoa.
              <br />
              Built for the Pacific.
            </h2>

            <div className="space-y-4">
              <p className="max-w-prose font-body text-base leading-relaxed text-ink">
                Synergy Blockchain Pacific is an independent Samoan technology
                company building sovereign digital infrastructure for Pacific
                Island governments, institutions, and communities. We design,
                build, and operate blockchain-anchored platforms that keep
                data, payments, and governance authority in Pacific hands.
              </p>
              <p className="max-w-prose font-body text-base leading-relaxed text-ink">
                We follow a governance-first principle: legal frameworks and
                institutional foundations are established before blockchain
                infrastructure is activated. This approach — grounded in BIS
                PFMI, FATF R.15, and CISA Zero Trust standards — ensures that
                Pacific nations adopt technology on their own terms, not as
                recipients of systems designed elsewhere.
              </p>
              <p className="max-w-prose font-body text-base leading-relaxed text-ink">
                Our mission is to build Samoa first, then open the Pacific.
                The infrastructure we are building — interoperability
                protocols, payment rails, maritime windows, sovereign data
                commons — is designed from day one to be replicated across
                Pacific Islands Forum member states.
              </p>
            </div>
          </div>

          <div
            className="relative aspect-[3/4] w-full self-start rounded-2xl"
            style={{
              boxShadow:
                "0 0 60px rgba(0, 212, 200, 0.15), 0 32px 64px rgba(0,0,0,0.2)",
            }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-2xl">
              <Image
                src="/assets/images/about.jpg"
                alt="Synergy Blockchain Pacific team"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3">
          {STAT_CARDS.map((card) => (
            <div key={card.title} className="glass-light p-4">
              <p className="mb-2 text-xl text-teal">{card.icon}</p>
              <p className="mb-0.5 font-body text-base font-semibold text-navy">
                {card.title}
              </p>
              <p className="font-body text-sm text-ink">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
