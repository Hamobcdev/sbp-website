"use client";

import { useMemo } from "react";
import type { RemittanceCorridor, RemittanceCorridorsResponse } from "../types";
import { formatTimestamp, PanelError, PanelHeading, Skeleton } from "./Shared";

function corridorLabel(c: RemittanceCorridor): string {
  if (c.send_country && c.receive_country) {
    return `${c.send_country} → ${c.receive_country}`;
  }
  return "Pacific Corridor";
}

function bestCryptoCostPct(c: RemittanceCorridor): number | null {
  if (!c.crypto_rails.length) return null;
  return Math.min(...c.crypto_rails.map((r) => r.total_estimated_cost_pct));
}

// Static reference data for the traditional-vs-crypto comparison table —
// not from the live corridors API. Cost ranges are publicly published
// provider rates (World Bank Remittance Prices Worldwide); crypto figures
// reflect USDC-on-Algorand network fees and settlement time. See footnote
// rendered alongside the table.
type RailComparisonRow = {
  corridor: string;
  provider: string;
  traditionalCostPct: string;
  traditionalTime: string;
  cryptoCostPct: string;
  cryptoTime: string;
  savings: string;
};

const RAIL_COMPARISON_ROWS: RailComparisonRow[] = [
  {
    corridor: "Samoa (from AU / NZ / US)",
    provider: "Western Union",
    traditionalCostPct: "6–8%",
    traditionalTime: "1–3 business days",
    cryptoCostPct: "0.1–0.5%",
    cryptoTime: "< 5 seconds",
    savings: "5.5–7.9 pts",
  },
  {
    corridor: "Samoa (from AU / NZ / US)",
    provider: "MoneyGram",
    traditionalCostPct: "5–7%",
    traditionalTime: "1–2 business days",
    cryptoCostPct: "0.1–0.5%",
    cryptoTime: "< 5 seconds",
    savings: "4.5–6.9 pts",
  },
  {
    corridor: "Fiji (from AU / NZ)",
    provider: "Traditional rail (avg.)",
    traditionalCostPct: "5–7%",
    traditionalTime: "1–2 business days",
    cryptoCostPct: "0.1–0.5%",
    cryptoTime: "< 5 seconds",
    savings: "4.5–6.9 pts",
  },
  {
    corridor: "Tonga",
    provider: "Traditional rail (avg.)",
    traditionalCostPct: "8–10%",
    traditionalTime: "—",
    cryptoCostPct: "0.1–0.5%",
    cryptoTime: "< 5 seconds",
    savings: "7.5–9.9 pts",
  },
];

export default function RemittancePanel({
  state,
}: {
  state: {
    data: RemittanceCorridorsResponse | null;
    loading: boolean;
    error: string | null;
  };
}) {
  const { data, loading, error } = state;
  const corridors = useMemo(() => data?.corridors ?? [], [data]);

  const maxCost = useMemo(() => {
    const values = corridors
      .flatMap((c) => [c.traditional_rails?.average_cost_pct, bestCryptoCostPct(c)])
      .filter((v): v is number => typeof v === "number");
    return values.length ? Math.max(...values, 0.01) : 1;
  }, [corridors]);

  if (loading) {
    return (
      <div className="pdc-panel p-6">
        <PanelHeading title="Remittance Corridors" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="pdc-panel p-6">
        <PanelHeading title="Remittance Corridors" />
        <PanelError message={error} />
      </div>
    );
  }

  return (
    <div className="pdc-panel p-6">
      <PanelHeading
        title="Remittance Corridors"
        subtitle="Traditional rail cost vs. best available crypto rail cost"
      />

      <div className="mb-2 flex items-center gap-4 font-mono text-[11px] uppercase tracking-wide text-[var(--pdc-text-faint)]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[var(--pdc-down)]" />
          Traditional Rail
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[var(--pdc-up)]" />
          Crypto Rail
        </span>
      </div>

      <div className="flex flex-col gap-5">
        {corridors.map((c) => {
          const traditionalCostPct = c.traditional_rails?.average_cost_pct ?? null;
          const cryptoCostPct = bestCryptoCostPct(c);
          const saving =
            c.potential_saving_pct ??
            (typeof traditionalCostPct === "number" && typeof cryptoCostPct === "number"
              ? traditionalCostPct - cryptoCostPct
              : null);
          const traditionalWidth = Math.max(
            ((traditionalCostPct ?? 0) / maxCost) * 100,
            2
          );
          const cryptoWidth = Math.max(
            ((cryptoCostPct ?? 0) / maxCost) * 100,
            0.5
          );

          return (
            <div key={c.corridor_id}>
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-sm text-[var(--pdc-text)]">
                  {corridorLabel(c)}
                </span>
                <span className="font-mono text-xs text-[var(--pdc-up)]">
                  Save {typeof saving === "number" ? saving.toFixed(2) : "—"}%
                </span>
              </div>

              <BarRow
                label="Traditional"
                value={traditionalCostPct}
                widthPct={traditionalWidth}
                colorVar="--pdc-down"
              />
              <BarRow
                label="Crypto"
                value={cryptoCostPct}
                widthPct={cryptoWidth}
                colorVar="--pdc-up"
              />

              {c.traditional_rails?.static_fallback && (
                <div className="mt-1 font-mono text-[10px] text-[var(--pdc-text-faint)]">
                  Traditional cost data: World Bank RPW Q4-2024
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <PanelHeading
          title="Traditional vs. Crypto Rail"
          subtitle="Reference Pacific corridors — published provider rates vs. crypto settlement"
        />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-body text-sm">
            <thead>
              <tr className="border-b border-[var(--pdc-panel-border)] text-left font-mono text-[11px] uppercase tracking-wide text-[var(--pdc-text-faint)]">
                <th className="py-2 pr-4">Corridor</th>
                <th className="py-2 pr-4">Traditional Cost %</th>
                <th className="py-2 pr-4">Traditional Time</th>
                <th className="py-2 pr-4">Crypto Cost %</th>
                <th className="py-2 pr-4">Crypto Time</th>
                <th className="py-2">Savings</th>
              </tr>
            </thead>
            <tbody>
              {RAIL_COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={`${row.corridor}-${row.provider}-${i}`}
                  className="border-b border-[var(--pdc-panel-border)]/60"
                >
                  <td className="py-2 pr-4 text-[var(--pdc-text)]">
                    {row.corridor}
                    <div className="font-mono text-[10px] text-[var(--pdc-text-faint)]">
                      {row.provider}
                    </div>
                  </td>
                  <td className="py-2 pr-4 font-mono text-[var(--pdc-text)]">
                    {row.traditionalCostPct}
                  </td>
                  <td className="py-2 pr-4 font-mono text-[var(--pdc-text)]">
                    {row.traditionalTime}
                  </td>
                  <td className="py-2 pr-4 font-mono text-[var(--pdc-up)]">
                    {row.cryptoCostPct}
                  </td>
                  <td className="py-2 pr-4 font-mono text-[var(--pdc-up)]">
                    {row.cryptoTime}
                  </td>
                  <td className="py-2 font-mono text-[var(--pdc-up)]">
                    {row.savings}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 font-body text-[11px] text-[var(--pdc-text-faint)]">
          Traditional rates sourced from World Bank Remittance Prices
          Worldwide database. Crypto rates reflect Algorand network fees.
        </div>
      </div>

      <div className="mt-6 font-body text-xs text-[var(--pdc-text-dim)]">
        Crypto rail costs are network fees only. On-ramp/off-ramp costs are
        additional. Not financial advice.
      </div>

      <div className="mt-4 text-right font-mono text-[11px] text-[var(--pdc-text-faint)]">
        Last updated {formatTimestamp(data.updated_at)}
      </div>
    </div>
  );
}

function BarRow({
  label,
  value,
  widthPct,
  colorVar,
}: {
  label: string;
  value: number | null;
  widthPct: number;
  colorVar: string;
}) {
  return (
    <div className="mb-1 flex items-center gap-2">
      <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-wide text-[var(--pdc-text-faint)]">
        {label}
      </span>
      <div className="h-3 flex-1 rounded-sm bg-[var(--pdc-panel-border)]/30">
        <div
          className="h-3 rounded-sm transition-all"
          style={{ width: `${widthPct}%`, backgroundColor: `var(${colorVar})` }}
        />
      </div>
      <span className="w-16 shrink-0 text-right font-mono text-xs text-[var(--pdc-text)]">
        {typeof value === "number" ? value.toFixed(2) : "—"}%
      </span>
    </div>
  );
}
