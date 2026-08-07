const VIDEOS = [
  "Synergy Blockchain Pacific — Overview",
  "Pacific Data Commons — How It Works",
  "Sovereign Digital Infrastructure — The Pacific Case",
];

// Update social URLs below with real profile links before launch.
// Posts from those profiles should deep-link to:
//   Blog:  synergybcpacific.com/#blog
//   Media: synergybcpacific.com/#media
const SOCIALS = ["Facebook", "LinkedIn", "X", "YouTube"];

export default function Media() {
  return (
    <section id="media" className="bg-white px-6 py-14">
      <div className="mx-auto max-w-content">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-teal">
          Media
        </p>
        <h2 className="mb-8 max-w-2xl font-serif text-4xl font-semibold leading-tight text-navy">
          Blockchain in the Pacific — in motion.
        </h2>

        <div className="mb-10 grid gap-5 md:grid-cols-3">
          {VIDEOS.map((title) => (
            <div
              key={title}
              className="overflow-hidden rounded-md border border-navy"
            >
              <div
                className="relative flex h-40 items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #0a1628 0%, #1a2f4a 100%)",
                }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal">
                  <div
                    className="ml-1 h-0 w-0 border-y-8 border-l-[14px] border-y-transparent border-l-white"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div className="p-4">
                <p className="mb-2 font-body text-sm font-bold text-navy">
                  {title}
                </p>
                <span className="inline-block rounded-full border border-silver/40 bg-silver/[0.15] px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-silver">
                  Coming Soon
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mb-4 font-body text-sm text-ink">
          Follow us for updates on Pacific blockchain and digital
          sovereignty.
        </p>
        <div className="flex flex-wrap gap-3">
          {SOCIALS.map((s) => (
            <a
              key={s}
              href="#"
              className="glass-light rounded-full px-5 py-2 font-mono text-xs uppercase tracking-wide text-navy transition-colors hover:bg-teal/10"
            >
              {s}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
