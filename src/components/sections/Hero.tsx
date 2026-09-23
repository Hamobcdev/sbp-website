import Image from "next/image";
import BlockchainCanvas from "@/components/canvas/BlockchainCanvas";
import DataFlowCanvas from "@/components/canvas/DataFlowCanvas";
import Button from "@/components/ui/Button";

const STATS = [
  { label: "Founded", value: "2023, Apia" },
  { label: "Products Live", value: "3" },
  { label: "Mainnet", value: "Active" },
  { label: "Registered", value: "Samoa" },
];

export default function Hero() {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-navy">
      {/* Background layers */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/hero.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-[0.15]"
        />
      </div>
      <BlockchainCanvas />
      <DataFlowCanvas />
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(13,31,60,0.3) 0%, rgba(10,22,40,0.85) 70%, rgba(10,22,40,1) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-[2] mx-auto w-full max-w-content px-6 py-20">
        <div className="mb-8 flex w-full justify-center">
          <Image
            src="/assets/images/logo.png"
            alt="Synergy Blockchain Pacific"
            width={160}
            height={167}
            className="h-20 w-auto"
            priority
          />
        </div>

        <p className="mb-6 text-center font-mono text-xs uppercase tracking-[0.15em] text-teal">
          Independent State of Samoa · Sovereign Digital Infrastructure
        </p>

        <h1 className="gradient-heading mx-auto mb-6 max-w-3xl text-center font-serif text-6xl font-semibold leading-[1.1] md:text-8xl">
          Pioneering Blockchain
          <br />
          in the Pacific.
        </h1>

        <p className="mx-auto mb-5 max-w-prose text-center font-body text-lg text-silver">
          Samoa&apos;s first blockchain infrastructure company — building
          sovereign digital public infrastructure for Pacific Island nations.
        </p>

        <div className="mb-8 flex items-center justify-center gap-2 font-mono text-[13px] text-teal">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-live rounded-full bg-green-live" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-live" />
          </span>
          First confirmed Mainnet transaction: August 2026
        </div>

        <div
          className="mx-auto mb-10 grid grid-cols-2 gap-6 px-[28px] py-[14px] sm:inline-grid sm:grid-cols-4"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(0, 212, 200, 0.2)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderRadius: "8px",
          }}
        >
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="font-mono text-[11px] uppercase tracking-wide text-silver">
                {stat.label}
              </p>
              <p className="font-body text-lg font-medium text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Button href="#platform" variant="primary">
            Explore Our Platform →
          </Button>
          <Button
            href="https://pacific-data-commons-web-olive.vercel.app/en"
            variant="secondary"
            target="_blank"
          >
            Pacific Data Commons →
          </Button>
        </div>
      </div>
    </section>
  );
}
