"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AreaSeries,
  AutoscaleInfo,
  ColorType,
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
} from "lightweight-charts";
import type {
  CryptoHistoryResponse,
  CryptoRatesResponse,
  CryptoToken,
  FxRatesResponse,
} from "../types";
import { useDashboardTheme } from "../ThemeContext";
import {
  ChangeBadge,
  formatLastUpdated,
  formatMarketCap,
  formatUsd,
  PanelError,
  PanelHeading,
  Skeleton,
} from "./Shared";
import FiatConverter from "./FiatConverter";

type PricePoint = { time: UTCTimestamp; value: number };

const TIMEFRAMES = ["5m", "15m", "1h", "4h", "8h", "1D", "1W", "1M"] as const;
type Timeframe = (typeof TIMEFRAMES)[number];

// The chart selector's supported tokens, in display order — independent
// of whatever order/subset the crypto-rates API happens to return them in.
const SUPPORTED_CHART_TOKENS = ["ALGO", "BTC", "ETH", "XRP", "XLM", "USDC", "USDT"] as const;

// Stablecoins barely move, so a price-relative range would turn sub-cent
// noise into a chart that looks like a spike/crash — pin a narrow fixed
// band instead. Every other token auto-scales to its own price range
// (BTC's absolute range dwarfs ALGO's; deriving it from price handles
// that without a per-token special case).
const STABLECOIN_SYMBOLS = new Set(["USDC", "USDT"]);

function chartPriceRange(
  symbol: string | null,
  price: number | null
): { minValue: number; maxValue: number } | null {
  if (!symbol || typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    return null;
  }
  if (STABLECOIN_SYMBOLS.has(symbol)) {
    return { minValue: 0.95, maxValue: 1.05 };
  }
  return { minValue: price * 0.95, maxValue: price * 1.05 };
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// prices_as_of is "YYYY-MM" (directory-api's pacificCryptoRatesService.ts) —
// rendered as "Oct 2026" rather than the raw value.
function formatPricesAsOf(value?: string | null): string {
  if (!value) return "a recent snapshot";
  const [yearStr, monthStr] = value.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  if (!Number.isFinite(year) || monthIndex < 0 || monthIndex > 11) return value;
  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

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
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>("1D");
  const [historyNote, setHistoryNote] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

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

  // Fetches real history from directory-api's /finance/crypto-history (via
  // the /api/pdc proxy, which holds DASHBOARD_INTERNAL_KEY server-side) on
  // every symbol/timeframe change — replaces the prior UI-only local tick
  // accumulation (PR-92's TODO). cancelled guards against a slow response
  // landing after the user has already switched symbol/timeframe again.
  useEffect(() => {
    if (!selectedSymbol) return;
    let cancelled = false;

    setHistoryError(null);
    setHistoryNote(null);

    fetch(
      `/api/pdc/crypto-history?symbol=${encodeURIComponent(selectedSymbol)}&tf=${encodeURIComponent(selectedTimeframe)}`,
      { cache: "no-store" }
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load history for ${selectedSymbol}`);
        return res.json() as Promise<CryptoHistoryResponse>;
      })
      .then((history) => {
        if (cancelled || !seriesRef.current) return;
        const points: PricePoint[] = history.points.map((p) => ({
          time: Math.floor(new Date(p.t).getTime() / 1000) as UTCTimestamp,
          value: p.p,
        }));
        seriesRef.current.setData(points);
        setHistoryNote(history.note);
        chartRef.current?.timeScale().fitContent();
      })
      .catch(() => {
        if (!cancelled) setHistoryError("Chart history temporarily unavailable");
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSymbol, selectedTimeframe]);

  useEffect(() => {
    if (!seriesRef.current || !selectedSymbol) return;
    const price = pickToken(tokens, selectedSymbol)?.price_usd;
    const range = chartPriceRange(selectedSymbol, typeof price === "number" ? price : null);
    seriesRef.current.applyOptions({
      autoscaleInfoProvider: (original: () => AutoscaleInfo | null) =>
        range ? { priceRange: range } : original(),
    });
  }, [selectedSymbol, tokens]);

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
        <PanelError message={error ?? "Crypto prices temporarily unavailable"} />
      </div>
    );
  }

  const selectedToken = pickToken(sortedTokens, selectedSymbol);
  const isStaticFallback = data.static_fallback === true;

  return (
    <div className="pdc-panel p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <PanelHeading
            title="Crypto Prices"
            subtitle={
              isStaticFallback
                ? `Prices as of ${formatPricesAsOf(data.prices_as_of)}`
                : "Live price feed — PDC"
            }
          />
          {isStaticFallback && (
            <span className="rounded-full border border-[var(--pdc-panel-border)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[var(--pdc-text-faint)]">
              Static
            </span>
          )}
        </div>
        <select
          value={selectedSymbol ?? ""}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="rounded-sm border border-[var(--pdc-panel-border)] bg-transparent px-3 py-2 font-mono text-sm text-[var(--pdc-text)]"
        >
          {SUPPORTED_CHART_TOKENS.filter((symbol) => pickToken(tokens, symbol)).map(
            (symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
                {priorityTokens.includes(symbol) ? " ★" : ""}
              </option>
            )
          )}
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
            value={formatMarketCap(selectedToken.market_cap_usd)}
          />
        </div>
      )}

      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => setSelectedTimeframe(tf)}
            className={`rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors ${
              tf === selectedTimeframe
                ? "bg-[var(--pdc-accent)] text-[var(--pdc-bg)]"
                : "text-[var(--pdc-text-faint)] hover:text-[var(--pdc-text-dim)]"
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      <div ref={chartContainerRef} className="w-full" />

      {(historyNote || historyError) && (
        <div className="mt-1 font-mono text-[11px] text-[var(--pdc-text-faint)]">
          {historyError ?? historyNote}
        </div>
      )}

      <div className="mt-2 text-right font-mono text-[11px] text-[var(--pdc-text-faint)]">
        Last updated {formatLastUpdated(data.cached_at)}
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
