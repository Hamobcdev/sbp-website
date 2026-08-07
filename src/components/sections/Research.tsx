import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const STANDARDS = ["BIS PFMI", "FATF R.15", "CISA Zero Trust", "Lagatoi Declaration"];
const STANDARDS_EXTENDED = [
  "IMO FAL Convention 2024",
  "UNCTAD 2029",
  "WTO Trade Facilitation Agreement",
  "GovStack",
  "IIA IPPF 2024",
  "IMF GFSM 2014",
  "PEFA 2016",
  "ISO 20022",
];

export default function Research() {
  return (
    <section
      id="research"
      className="px-6 py-14 text-center"
      style={{
        background:
          "linear-gradient(180deg, rgba(0,212,200,0.04) 0%, #ffffff 6%)",
      }}
    >
      <div className="mx-auto max-w-content">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-teal">
          Research &amp; Standards
        </p>
        <h2 className="mx-auto mb-8 max-w-2xl font-body text-4xl font-bold leading-tight text-navy">
          Research-grade infrastructure. Internationally standards-compliant.
        </h2>

        <div className="mb-4 flex flex-wrap justify-center gap-3">
          {STANDARDS.map((s) => (
            <Badge key={s} color="teal">
              {s}
            </Badge>
          ))}
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {STANDARDS_EXTENDED.map((s) => (
            <Badge key={s} color="silver">
              {s}
            </Badge>
          ))}
        </div>

        <p className="mx-auto mb-10 max-w-prose font-body text-base leading-relaxed text-ink">
          Our work is grounded in international standards and contributes to
          the Pacific regional research agenda. We publish governance
          framework and standards-compliance documentation for review by
          qualified research partners and government agencies.
        </p>

        <div
          className="glass-light mx-auto max-w-md p-6 text-left"
          style={{ borderLeft: "3px solid #00d4c8" }}
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-teal">
            Working Papers &amp; Research Collaboration
          </p>
          <p className="mb-6 font-body text-sm leading-relaxed text-ink">
            Research documentation and working papers are available to
            qualified research partners and government agencies on request.
          </p>
          <Button href="mailto:info@synergybcpacific.com" variant="secondary">
            Request Research Access →
          </Button>
        </div>
      </div>
    </section>
  );
}
