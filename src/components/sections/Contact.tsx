import Image from "next/image";
import GlassCard from "@/components/ui/GlassCard";

const CARDS = [
  {
    icon: "📍",
    label: "Location",
    value: (
      <>
        Lepiu Road, Tuaefu Heights
        <br />
        Faleata Sasae, Samoa
        <br />
        <span className="text-sm text-silver">
          Postal: P.O. Box 6301, Apia, Samoa
        </span>
      </>
    ),
  },
  {
    icon: "✉️",
    label: "Email",
    value: (
      <a
        href="mailto:info@synergybcpacific.com"
        className="text-teal hover:underline"
      >
        info@synergybcpacific.com
      </a>
    ),
  },
  {
    icon: "🌐",
    label: "Platform",
    value: (
      <a
        href="https://pacific-data-commons-web-olive.vercel.app/en"
        target="_blank"
        rel="noopener noreferrer"
        className="text-teal hover:underline"
      >
        pacific-data-commons-web-olive.vercel.app
      </a>
    ),
  },
];

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden px-6 py-20 text-center md:py-24"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/contact.jpg"
          alt=""
          fill
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0, 0, 0, 0.6)" }}
        />
      </div>

      <div className="relative z-[1] mx-auto max-w-content">
        <h2 className="gradient-heading mb-4 font-serif text-5xl font-semibold md:text-6xl">
          Work with us.
        </h2>
        <p className="mx-auto mb-12 max-w-prose font-body text-base text-silver">
          We are actively engaged with Pacific governments, regional
          institutions, development finance partners, and technology
          collaborators.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {CARDS.map((card) => (
            <GlassCard key={card.label} className="text-left">
              <p className="mb-3 text-2xl">{card.icon}</p>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-silver">
                {card.label}
              </p>
              <p className="font-body text-base text-white">{card.value}</p>
            </GlassCard>
          ))}
        </div>

        <p className="mt-10 font-mono text-xs text-silver">
          Incorporated 23 June 2023 · Company No. 202307636
        </p>
      </div>
    </section>
  );
}
