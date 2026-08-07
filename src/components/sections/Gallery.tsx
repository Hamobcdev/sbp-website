"use client";

import Image from "next/image";

const ROW_1 = [
  "confident Synergy team.jpg",
  "Cross sector.jpg",
  "DBS-LMS-landing.jpg",
  "Synergy port photo real logo.jpg",
  "Mobile friendlyports synergy.jpg",
  "pdc-landing.jpg",
  "Synergy ocean moana logo.jpg",
];

const ROW_2 = [
  "confident Synergy with right logo..jpg",
  "cross sector tatau transparent.jpg",
  "SynergyPayShield.jpg",
  "SyneryPayShield-demo.jpg",
  "Mobile moana synergy design.jpg",
  "split screen with right logo.jpg",
];

function MarqueeRow({
  images,
  direction,
}: {
  images: string[];
  direction: "left" | "right";
}) {
  const doubled = [...images, ...images];
  return (
    <div className="group overflow-hidden">
      <div
        className={`flex w-max gap-3 ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        } group-hover:[animation-play-state:paused]`}
      >
        {doubled.map((name, i) => (
          <div
            key={`${name}-${i}`}
            className="relative h-[180px] w-[280px] flex-shrink-0 overflow-hidden rounded-lg"
          >
            <Image
              src={`/assets/images/gallery/${name}`}
              alt=""
              fill
              className="object-cover"
              sizes="280px"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Gallery() {
  return (
    <section className="bg-navy py-14">
      <div className="mx-auto max-w-content px-6">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.15em] text-teal">
          Pacific Digital Infrastructure
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <MarqueeRow images={ROW_1} direction="left" />
        <MarqueeRow images={ROW_2} direction="right" />
      </div>
    </section>
  );
}
