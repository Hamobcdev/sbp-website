"use client";

import { useMemo, useState } from "react";
import type { FxRatesResponse } from "../types";
import { MICRO_STATE_PEG_NOTE, PACIFIC_CURRENCY_INFO } from "../types";
import { formatTimestamp, PanelError, PanelHeading, Skeleton } from "./Shared";

const DEFAULT_BASES = ["USD", "AUD", "NZD", "EUR", "GBP"];
const DISPLAY_CURRENCIES = ["WST", "FJD", "TOP", "PGK", "VUV", "SBD", "XPF"];

export default function FxPanel({
  state,
}: {
  state: { data: FxRatesResponse | null; loading: boolean; error: string | null };
}) {
  const { data, loading, error } = state;
  const [base, setBase] = useState("USD");

  const bases = useMemo(
    () => (data?.base_currencies?.length ? data.base_currencies : DEFAULT_BASES),
    [data]
  );

  const displayCurrencies = useMemo(
    () =>
      data?.display_currencies?.length
        ? data.display_currencies
        : DISPLAY_CURRENCIES,
    [data]
  );

  if (loading) {
    return (
      <div className="pdc-panel p-6">
        <PanelHeading title="Pacific FX Rates" />
        <Skeleton className="h-10 w-40 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="pdc-panel p-6">
        <PanelHeading title="Pacific FX Rates" />
        <PanelError message={error} />
      </div>
    );
  }

  // `data.rates` is already a flat { code: rate } map resolved to the
  // response's base currency, not nested per-base — the `base` selector
  // below is cosmetic until the proxy route forwards it to the upstream
  // ?base= query param, since every fetch currently returns USD-based rates.
  const ratesForBase = data.rates ?? {};

  return (
    <div className="pdc-panel p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <PanelHeading title="Pacific FX Rates" />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wide text-[var(--pdc-text-faint)]">
            Base
          </span>
          <select
            value={base}
            onChange={(e) => setBase(e.target.value)}
            className="rounded-sm border border-[var(--pdc-panel-border)] bg-transparent px-3 py-2 font-mono text-sm text-[var(--pdc-text)]"
          >
            {bases.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-body text-sm">
          <thead>
            <tr className="border-b border-[var(--pdc-panel-border)] text-left font-mono text-[11px] uppercase tracking-wide text-[var(--pdc-text-faint)]">
              <th className="py-2 pr-4">Currency</th>
              <th className="py-2 pr-4">Flag</th>
              <th className="py-2 pr-4">Rate</th>
              <th className="py-2">Full Name</th>
            </tr>
          </thead>
          <tbody>
            {displayCurrencies.map((code) => {
              const info = PACIFIC_CURRENCY_INFO[code];
              const rate = ratesForBase[code];
              return (
                <tr
                  key={code}
                  className="border-b border-[var(--pdc-panel-border)]/60"
                >
                  <td className="py-2 pr-4 font-mono text-[var(--pdc-text)]">
                    {code}
                  </td>
                  <td className="py-2 pr-4 text-lg">{info?.flag ?? ""}</td>
                  <td className="py-2 pr-4 font-mono text-[var(--pdc-text)]">
                    {rate != null ? rate.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "—"}
                  </td>
                  <td className="py-2 text-[var(--pdc-text-dim)]">
                    {info?.name ?? code}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-sm border border-[var(--pdc-panel-border)] bg-[var(--pdc-accent)]/5 px-4 py-3 font-body text-sm text-[var(--pdc-text-dim)]">
        {MICRO_STATE_PEG_NOTE}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[var(--pdc-text-faint)]">
        <span>
          Exchange rates via PDC · {data.source ?? "ECB/Frankfurter"}
        </span>
        <span>Last updated {formatTimestamp(data.generated_at ?? data.timestamp)}</span>
      </div>
    </div>
  );
}
