const MILESTONES = [
  {
    date: "August 2026",
    title: "First Mainnet Transaction",
    body: "Pacific Data Commons completes first confirmed x402 payment on Algorand Mainnet.",
  },
  {
    date: "June 2023",
    title: "Company Registered",
    body: "Synergy Blockchain Pacific Limited incorporated in Apia, Samoa.",
  },
];

export default function Milestones() {
  return (
    <section className="bg-navy-mid px-6 py-16">
      <div className="mx-auto max-w-content">
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.15em] text-teal">
          Milestones
        </p>

        <div className="flex gap-6 overflow-x-auto pb-4">
          {MILESTONES.map((m) => (
            <div
              key={m.title}
              className="glass min-w-[280px] flex-1 p-6"
            >
              <p className="mb-3 font-mono text-xs uppercase tracking-wide text-gold">
                {m.date}
              </p>
              <h3 className="mb-2 font-body text-lg font-bold text-white">
                {m.title}
              </h3>
              <p className="font-body text-sm leading-relaxed text-silver">
                {m.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
