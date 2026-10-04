"use client";

import { useMemo } from "react";
import type { RemittanceCorridor, RemittanceCorridorsResponse } from "../types";
import { formatTimestamp, PanelError, PanelHeading, Skeleton } from "./Shared";

function corridorLabel(c: RemittanceCorridor): string {
  return c.corridor_label || `${c.from} → ${c.to}`;
}

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
    const values = corridors.flatMap((c) => [
      c.traditional_rails.cost_pct,
      c.crypto_rails.best_cost_pct,
    ]);
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
          const saving =
            c.potential_saving_pct ??
            c.traditional_rails.cost_pct - c.crypto_rails.best_cost_pct;
          const traditionalWidth = Math.max(
            (c.traditional_rails.cost_pct / maxCost) * 100,
            2
          );
          const cryptoWidth = Math.max(
            (c.crypto_rails.best_cost_pct / maxCost) * 100,
            0.5
          );

          return (
            <div key={corridorLabel(c)}>
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-sm text-[var(--pdc-text)]">
                  {corridorLabel(c)}
                </span>
                <span className="font-mono text-xs text-[var(--pdc-up)]">
                  Save {saving.toFixed(2)}%
                </span>
              </div>

              <BarRow
                label="Traditional"
                value={c.traditional_rails.cost_pct}
                widthPct={traditionalWidth}
                colorVar="--pdc-down"
              />
              <BarRow
                label="Crypto"
                value={c.crypto_rails.best_cost_pct}
                widthPct={cryptoWidth}
                colorVar="--pdc-up"
              />

              {c.traditional_rails.static_fallback && (
                <div className="mt-1 font-mono text-[10px] text-[var(--pdc-text-faint)]">
                  Traditional cost data: World Bank RPW Q4-2024
                </div>
              )}
            </div>
          );
        })}
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
  value: number;
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
        {value.toFixed(2)}%
      </span>
    </div>
  );
}
