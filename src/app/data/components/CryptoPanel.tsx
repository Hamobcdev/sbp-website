"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AreaSeries,
  ColorType,
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
} from "lightweight-charts";
import type { CryptoRatesResponse, CryptoToken, FxRatesResponse } from "../types";
import { useDashboardTheme } from "../ThemeContext";
import {
  ChangeBadge,
  formatTimestamp,
  formatUsd,
  PanelError,
  PanelHeading,
  Skeleton,
} from "./Shared";
import FiatConverter from "./FiatConverter";

type PricePoint = { time: UTCTimestamp; value: number };

const MAX_HISTORY_POINTS = 200;

function pickToken(
  tokens: CryptoToken[],
  symbol: string | null
): CryptoToken | undefined {
  if (!symbol) return undefined;
  return tokens.find((t) => t.symbol === symbol);
}

export default function CryptoPanel({
  state,
  fxData,
}: {
  state: { data: CryptoRatesResponse | null; loading: boolean; error: string | null };
  fxData: FxRatesResponse | null;
}) {
  const { theme } = useDashboardTheme();
  const { data, loading, error } = state;

  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const historyRef = useRef<Map<string, PricePoint[]>>(new Map());

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  const priorityTokens = useMemo(
    () => data?.pacific_priority_tokens ?? [],
    [data]
  );

  const tokens = useMemo(() => data?.tokens ?? [], [data]);

  const sortedTokens = useMemo(() => {
    const priority = tokens.filter((t) => priorityTokens.includes(t.symbol));
    const rest = tokens.filter((t) => !priorityTokens.includes(t.symbol));
    return [...priority, ...rest];
  }, [tokens, priorityTokens]);

  useEffect(() => {
    if (selectedSymbol || tokens.length === 0) return;
    const defaultSymbol = priorityTokens[0] ?? tokens[0]?.symbol ?? null;
    setSelectedSymbol(defaultSymbol);
  }, [tokens, priorityTokens, selectedSymbol]);

  useEffect(() => {
    if (!data) return;
    const nowSeconds = Math.floor(Date.now() / 1000) as UTCTimestamp;
    for (const token of data.tokens) {
      const series = historyRef.current.get(token.symbol) ?? [];
      const last = series[series.length - 1];
      if (!last || last.time !== nowSeconds) {
        series.push({ time: nowSeconds, value: token.price_usd });
        if (series.length > MAX_HISTORY_POINTS) series.shift();
        historyRef.current.set(token.symbol, series);
      }
    }
  }, [data]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const bgColor = theme === "dark" ? "#0a1628" : "#ffffff";
    const textColor = theme === "dark" ? "#8899aa" : "#5b6b80";
    const gridColor = theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(10,22,40,0.06)";

    const chart = createChart(chartContainerRef.current, {
      height: 280,
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor,
        fontFamily: "var(--font-dm-sans), sans-serif",
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
      rightPriceScale: {
        borderVisible: false,
      },
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: "#00d4c8",
      topColor: "rgba(0, 212, 200, 0.28)",
      bottomColor: "rgba(0, 212, 200, 0.02)",
      lineWidth: 2,
      priceLineVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // Re-created on theme change so chart.applyOptions picks up new colors.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  useEffect(() => {
    if (!seriesRef.current || !selectedSymbol) return;
    const points = historyRef.current.get(selectedSymbol) ?? [];
    seriesRef.current.setData(points);
    chartRef.current?.timeScale().fitContent();
  }, [selectedSymbol, data]);

  if (loading) {
    return (
      <div className="pdc-panel p-6">
        <PanelHeading title="Crypto Prices" subtitle="Live price feed — PDC" />
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-[280px] w-full mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="pdc-panel p-6">
        <PanelHeading title="Crypto Prices" />
        <PanelError message={error} />
      </div>
    );
  }

  const selectedToken = pickToken(sortedTokens, selectedSymbol);

  return (
    <div className="pdc-panel p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <PanelHeading title="Crypto Prices" subtitle="Live price feed — PDC" />
        <select
          value={selectedSymbol ?? ""}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="rounded-sm border border-[var(--pdc-panel-border)] bg-transparent px-3 py-2 font-mono text-sm text-[var(--pdc-text)]"
        >
          {sortedTokens.map((t) => (
            <option key={t.symbol} value={t.symbol}>
              {t.symbol}
              {priorityTokens.includes(t.symbol) ? " ★" : ""}
            </option>
          ))}
        </select>
      </div>

      {selectedToken && (
        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Price" value={formatUsd(selectedToken.price_usd)} />
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wide text-[var(--pdc-text-faint)]">
              24h Change
            </div>
            <ChangeBadge value={selectedToken.change_24h_pct} />
          </div>
          <Stat
            label="24h Volume"
            value={formatUsd(selectedToken.volume_24h_usd, { compact: true })}
          />
          <Stat
            label="Market Cap"
            value={formatUsd(selectedToken.market_cap_usd, { compact: true })}
          />
        </div>
      )}

      <div ref={chartContainerRef} className="w-full" />

      <div className="mt-2 text-right font-mono text-[11px] text-[var(--pdc-text-faint)]">
        Last updated {formatTimestamp(data.updated_at)}
      </div>

      <FiatConverter
        tokens={sortedTokens}
        priorityTokens={priorityTokens}
        fxData={fxData}
      />

      <div className="mt-6">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-wide text-[var(--pdc-text-faint)]">
          All tokens
        </div>
        <div className="max-h-64 overflow-y-auto">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {sortedTokens.map((t) => (
              <button
                key={t.symbol}
                onClick={() => setSelectedSymbol(t.symbol)}
                className={`flex items-center justify-between rounded-sm border px-3 py-2 text-left transition-colors ${
                  t.symbol === selectedSymbol
                    ? "border-[var(--pdc-accent)] bg-[var(--pdc-accent)]/10"
                    : "border-[var(--pdc-panel-border)] hover:border-[var(--pdc-accent)]/50"
                }`}
              >
                <span className="font-mono text-sm text-[var(--pdc-text)]">
                  {t.symbol}
                  {priorityTokens.includes(t.symbol) && (
                    <span className="ml-1 text-[var(--pdc-accent-gold)]">★</span>
                  )}
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-mono text-sm text-[var(--pdc-text)]">
                    {formatUsd(t.price_usd)}
                  </span>
                  <ChangeBadge value={t.change_24h_pct} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-wide text-[var(--pdc-text-faint)]">
        {label}
      </div>
      <div className="font-mono text-lg text-[var(--pdc-text)]">{value}</div>
    </div>
  );
}
