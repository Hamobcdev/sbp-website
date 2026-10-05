"use client";

import LiveIndicator from "@/components/ui/LiveIndicator";
import { usePDCData } from "./hooks/usePDCData";
import { useDashboardTheme } from "./ThemeContext";
import type { CryptoRatesResponse } from "./types";
import CryptoPanel from "./components/CryptoPanel";
import FxPanel from "./components/FxPanel";
import ArbitragePanel from "./components/ArbitragePanel";
import RemittancePanel from "./components/RemittancePanel";

function RegulatoryBanner() {
  return (
    <div className="mb-6 rounded-md border border-[var(--pdc-accent-gold)]/40 bg-[var(--pdc-accent-gold)]/10 px-4 py-3 font-body text-sm text-[var(--pdc-text)]">
      ⚠️ The DEX arbitrage signals and crypto analytics on this dashboard are
      for informational purposes only. Synergy Blockchain Pacific is actively
      working with Pacific Island regulators to establish a clear framework
      for digital asset innovation across the region. Features marked
      pending are subject to regulatory approval.
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useDashboardTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle dashboard theme"
      className="rounded-sm border border-[var(--pdc-panel-border)] px-3 py-2 font-mono text-xs uppercase tracking-wide text-[var(--pdc-text-dim)] transition-colors hover:border-[var(--pdc-accent)] hover:text-[var(--pdc-accent)]"
    >
      {theme === "dark" ? "☾ Dark" : "☀ Light"}
    </button>
  );
}

export default function DashboardClient({
  initialCrypto,
}: {
  initialCrypto: CryptoRatesResponse | null;
}) {
  const { crypto, fx, arbitrage, remittance } = usePDCData(initialCrypto);

  return (
    <div className="mx-auto max-w-content px-6 pb-24 pt-28">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-body text-2xl font-bold text-[var(--pdc-text)] sm:text-3xl">
            Pacific Financial Intelligence Dashboard
          </h1>
          <p className="mt-2 font-body text-sm text-[var(--pdc-text-dim)]">
            Real-time crypto, FX, arbitrage and remittance data for the
            Pacific region — powered by the Pacific Digital Clearinghouse.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LiveIndicator status="live" />
          <ThemeToggle />
        </div>
      </div>

      <RegulatoryBanner />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <CryptoPanel state={crypto} fxData={fx.data} />
        </div>
        <FxPanel state={fx} />
        <ArbitragePanel state={arbitrage} />
        <div className="lg:col-span-2">
          <RemittancePanel state={remittance} />
        </div>
      </div>
    </div>
  );
}
