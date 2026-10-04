"use client";

import { useMemo, useState } from "react";
import type { ArbitrageSignal, ArbitrageSignalsResponse } from "../types";
import {
  formatAgo,
  formatPct,
  formatTimestamp,
  PanelError,
  PanelHeading,
  Skeleton,
} from "./Shared";

type SortDir = "asc" | "desc";

export default function ArbitragePanel({
  state,
}: {
  state: {
    data: ArbitrageSignalsResponse | null;
    loading: boolean;
    error: string | null;
  };
}) {
  const { data, loading, error } = state;
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const signals = useMemo(() => data?.signals ?? [], [data]);

  const sortedSignals = useMemo(() => {
    return [...signals].sort((a, b) =>
      sortDir === "desc"
        ? b.net_spread_after_slippage_pct - a.net_spread_after_slippage_pct
        : a.net_spread_after_slippage_pct - b.net_spread_after_slippage_pct
    );
  }, [signals, sortDir]);

  const activeCount = signals.filter((s) => s.is_executable_estimated).length;

  const topSignal: ArbitrageSignal | undefined = sortedSignals[0];
  const bestSpread = topSignal?.net_spread_after_slippage_pct;

  if (loading) {
    return (
      <div className="pdc-panel p-6">
        <PanelHeading title="DEX Arbitrage Signals" />
        <Skeleton className="h-16 w-full mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="pdc-panel p-6">
        <PanelHeading title="DEX Arbitrage Signals" />
        <PanelError message={error} />
      </div>
    );
  }

  return (
    <div className="pdc-panel p-6">
      <PanelHeading title="DEX Arbitrage Signals" />

      <div className="mb-4 rounded-sm border border-[var(--gold)]/40 bg-[var(--gold)]/[0.08] px-4 py-3 font-body text-xs text-[var(--pdc-text-dim)]">
        Arbitrage signals are indicative only. Not financial advice. Gas
        costs and slippage are estimates. Always verify before executing.
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-2">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wide text-[var(--pdc-text-faint)]">
            Active Signals
          </div>
          <div className="font-mono text-xl text-[var(--pdc-text)]">
            {activeCount}
          </div>
        </div>
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wide text-[var(--pdc-text-faint)]">
            Best Net Spread
          </div>
          <div className="font-mono text-xl text-[var(--pdc-up)]">
            {formatPct(bestSpread)}
          </div>
        </div>
      </div>

      {topSignal && (
        <div className="mb-6 rounded-md border border-[var(--pdc-accent)]/40 bg-[var(--pdc-accent)]/[0.06] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wide text-[var(--pdc-accent)]">
              Top Opportunity
            </span>
            {topSignal.mev_warning && (
              <span className="rounded-full border border-[var(--pdc-down)]/40 bg-[var(--pdc-down)]/[0.12] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[var(--pdc-down)]">
                MEV Warning
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Field label="Pair" value={topSignal.pair} />
            <Field label="Buy" value={topSignal.buy_venue} />
            <Field label="Sell" value={topSignal.sell_venue} />
            <Field
              label="Net Spread"
              value={formatPct(topSignal.net_spread_after_slippage_pct)}
              valueClassName="text-[var(--pdc-up)]"
            />
            <Field
              label="Executable"
              value={topSignal.is_executable_estimated ? "Yes" : "No"}
              valueClassName={
                topSignal.is_executable_estimated
                  ? "text-[var(--pdc-up)]"
                  : "text-[var(--pdc-text-dim)]"
              }
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-body text-sm">
          <thead>
            <tr className="border-b border-[var(--pdc-panel-border)] text-left font-mono text-[11px] uppercase tracking-wide text-[var(--pdc-text-faint)]">
              <th className="py-2 pr-4">Pair</th>
              <th className="py-2 pr-4">Buy Venue</th>
              <th className="py-2 pr-4">Sell Venue</th>
              <th
                className="cursor-pointer py-2 pr-4"
                onClick={() =>
                  setSortDir((d) => (d === "desc" ? "asc" : "desc"))
                }
              >
                Net Spread {sortDir === "desc" ? "▼" : "▲"}
              </th>
              <th className="py-2 pr-4">Executable</th>
              <th className="py-2">Freshness</th>
            </tr>
          </thead>
          <tbody>
            {sortedSignals.map((s, i) => (
              <tr
                key={`${s.pair}-${s.buy_venue}-${s.sell_venue}-${i}`}
                className="border-b border-[var(--pdc-panel-border)]/60"
              >
                <td className="py-2 pr-4 font-mono text-[var(--pdc-text)]">
                  {s.pair}
                </td>
                <td className="py-2 pr-4 text-[var(--pdc-text-dim)]">
                  {s.buy_venue}
                </td>
                <td className="py-2 pr-4 text-[var(--pdc-text-dim)]">
                  {s.sell_venue}
                </td>
                <td
                  className={`py-2 pr-4 font-mono ${
                    s.net_spread_after_slippage_pct >= 0
                      ? "text-[var(--pdc-up)]"
                      : "text-[var(--pdc-down)]"
                  }`}
                >
                  {formatPct(s.net_spread_after_slippage_pct)}
                </td>
                <td className="py-2 pr-4">
                  {s.is_executable_estimated ? (
                    <span className="text-[var(--pdc-up)]">Yes</span>
                  ) : (
                    <span className="text-[var(--pdc-text-dim)]">No</span>
                  )}
                </td>
                <td className="py-2 font-mono text-[var(--pdc-text-faint)]">
                  {formatAgo(s.signal_age_ms)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-right font-mono text-[11px] text-[var(--pdc-text-faint)]">
        Last updated {formatTimestamp(data.updated_at)}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wide text-[var(--pdc-text-faint)]">
        {label}
      </div>
      <div className={`font-mono text-sm text-[var(--pdc-text)] ${valueClassName}`}>
        {value}
      </div>
    </div>
  );
}
