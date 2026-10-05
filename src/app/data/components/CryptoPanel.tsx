"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AutoscaleInfo,
  CandlestickData,
  CandlestickSeries,
  ColorType,
  createChart,
  CrosshairMode,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
  LineData,
  LineSeries,
  LineStyle,
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
import { bucketPoints, rsi, sma, toLineData, type Candle } from "./chartMath";

const TIMEFRAMES = ["5m", "15m", "1h", "4h", "8h", "1D", "1W", "1M"] as const;
type Timeframe = (typeof TIMEFRAMES)[number];

type ChartType = "candlestick" | "line";

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

// Theme-keyed chart colors. Canvas-rendered series can't read CSS custom
// properties, so these mirror --pdc-up/--pdc-down/--pdc-accent per theme
// (see globals.css) rather than resolving them at runtime.
const CHART_COLORS = {
  dark: {
    bg: "#0a1628",
    text: "#8899aa",
    grid: "rgba(255,255,255,0.04)",
    crosshair: "rgba(255,255,255,0.3)",
    up: "#00a651",
    down: "#ff5c5c",
    accent: "#00d4c8",
  },
  light: {
    bg: "#ffffff",
    text: "#5b6b80",
    grid: "rgba(0,0,0,0.04)",
    crosshair: "rgba(10,22,40,0.3)",
    up: "#0a9448",
    down: "#d1324a",
    accent: "#0b9c92",
  },
};

const MA_COLORS = { ma20: "#3b82f6", ma50: "#f59e0b", ma200: "#ef4444" };

function priceFmt(value: number): string {
  return formatUsd(value);
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
  const [historyResponse, setHistoryResponse] = useState<CryptoHistoryResponse | null>(null);

  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [showMA20, setShowMA20] = useState(true);
  const [showMA50, setShowMA50] = useState(true);
  const [showMA200, setShowMA200] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showRSI, setShowRSI] = useState(false);

  // page.tsx server-fetches initialCrypto, so this panel (unlike the
  // other three, which always start in a loading state) can render real
  // data on the very first, server-matched paint. formatLastUpdated()
  // formats with the runtime's default locale/timezone (Intl without a
  // fixed locale/timeZone) — Vercel's server and a visitor's browser
  // rarely agree on either, so rendering it unconditionally produced a
  // server/client text mismatch (React errors #418/#423/#425 in
  // production). Deferring it to after mount guarantees the first client
  // render matches the server's HTML exactly; the real local time fills
  // in a tick later.
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ma20Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const ma50Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const ma200Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

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

  // Derived candles + indicator series (bucketing, SMA, RSI — all pure,
  // no DOM access) — recomputed only when the raw history response
  // changes, not on every toggle/theme flip or price-tick render. This
  // was already memoized; it wasn't the source of the "Forced reflow"
  // warning seen in production (see the chart-setup effect below for the
  // actual layout-thrash fix).
  const derived = useMemo(() => {
    const points = historyResponse?.points ?? [];
    const candles: Candle[] = bucketPoints(points);
    const times = candles.map((c) => c.time);
    const closes = candles.map((c) => c.close);

    const lineData: LineData[] = candles.map((c) => ({ time: c.time, value: c.close }));
    const candleData: CandlestickData[] = candles.map((c) => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    return {
      candles,
      candleData,
      lineData,
      ma20: toLineData(times, sma(closes, 20)),
      ma50: toLineData(times, sma(closes, 50)),
      ma200: toLineData(times, sma(closes, 200)),
      rsi: toLineData(times, rsi(closes, 14)),
      volume: candles.map((c) => ({
        time: c.time,
        value: c.close,
        color:
          c.close >= c.open
            ? CHART_COLORS[theme].up + "80"
            : CHART_COLORS[theme].down + "80",
      })),
    };
    // theme only affects volume bar color here; chart/series recreation
    // on theme change is handled by the chart-setup effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyResponse]);

  // Chart + pane + series setup. Rebuilt whenever the pane layout changes
  // (theme, main series type, or a panel toggle) rather than mutated in
  // place — mirrors the previous theme-only rebuild, just with more
  // triggers now that panes can appear/disappear.
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const colors = CHART_COLORS[theme];

    const extraPanes = (showVolume ? 1 : 0) + (showRSI ? 1 : 0);
    const chart = createChart(chartContainerRef.current, {
      height: 280 + extraPanes * 100,
      layout: {
        background: { type: ColorType.Solid, color: colors.bg },
        textColor: colors.text,
        fontFamily: "var(--font-dm-sans), sans-serif",
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { style: LineStyle.Dashed, width: 1, color: colors.crosshair, labelBackgroundColor: colors.bg },
        horzLine: { style: LineStyle.Dashed, width: 1, color: colors.crosshair, labelBackgroundColor: colors.bg },
      },
      handleScroll: true,
      handleScale: true,
    });

    chartRef.current = chart;

    let mainSeries: ISeriesApi<"Candlestick"> | ISeriesApi<"Line">;
    if (chartType === "candlestick") {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: colors.up,
        downColor: colors.down,
        borderVisible: false,
        wickUpColor: colors.up,
        wickDownColor: colors.down,
      });
      candleSeriesRef.current = series;
      lineSeriesRef.current = null;
      mainSeries = series;
    } else {
      const series = chart.addSeries(LineSeries, {
        color: colors.accent,
        lineWidth: 1,
        priceLineVisible: false,
      });
      lineSeriesRef.current = series;
      candleSeriesRef.current = null;
      mainSeries = series;
    }

    ma20Ref.current = chart.addSeries(LineSeries, {
      color: MA_COLORS.ma20,
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    ma50Ref.current = chart.addSeries(LineSeries, {
      color: MA_COLORS.ma50,
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    ma200Ref.current = chart.addSeries(LineSeries, {
      color: MA_COLORS.ma200,
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    let volumePaneIndex: number | null = null;
    let rsiPaneIndex: number | null = null;

    if (showVolume) {
      volumePaneIndex = 1;
      volumeSeriesRef.current = chart.addSeries(
        HistogramSeries,
        { priceLineVisible: false, lastValueVisible: false },
        volumePaneIndex
      );
    } else {
      volumeSeriesRef.current = null;
    }

    if (showRSI) {
      rsiPaneIndex = showVolume ? 2 : 1;
      rsiSeriesRef.current = chart.addSeries(
        LineSeries,
        { color: colors.accent, lineWidth: 1, priceLineVisible: false },
        rsiPaneIndex
      );
    } else {
      rsiSeriesRef.current = null;
    }

    const panes = chart.panes();
    panes[0]?.setStretchFactor(3);
    if (volumePaneIndex !== null) panes[volumePaneIndex]?.setStretchFactor(1);
    if (rsiPaneIndex !== null) panes[rsiPaneIndex]?.setStretchFactor(1);

    // Named (not inline) so the same reference can be passed to
    // unsubscribeCrosshairMove below — an anonymous handler can only ever
    // be subscribed, never individually removed, which is how this leaked
    // a listener per chart rebuild (every timeframe/toggle/theme change)
    // until the MaxListenersExceededWarning showed up in production.
    const handleCrosshairMove: Parameters<IChartApi["subscribeCrosshairMove"]>[0] = (
      param
    ) => {
      // Guards against a crosshair event that was already in flight when
      // this effect's cleanup ran (e.g. a toggle clicked mid-hover) from
      // touching a chart/series that chart.remove() has torn down.
      if (!chartRef.current) return;
      const tooltipEl = tooltipRef.current;
      if (!tooltipEl) return;
      const seriesData = param.point && param.seriesData.get(mainSeries);
      if (!param.point || !seriesData) {
        tooltipEl.style.display = "none";
        return;
      }
      let text: string;
      if ("open" in seriesData) {
        const c = seriesData as CandlestickData;
        text = `O ${priceFmt(c.open)}  H ${priceFmt(c.high)}  L ${priceFmt(c.low)}  C ${priceFmt(c.close)}`;
      } else {
        const l = seriesData as LineData;
        text = priceFmt(l.value);
      }
      tooltipEl.textContent = text;
      tooltipEl.style.display = "block";
      tooltipEl.style.left = `${param.point.x + 12}px`;
      tooltipEl.style.top = `${param.point.y + 12}px`;
    };
    chart.subscribeCrosshairMove(handleCrosshairMove);

    // Reading clientWidth right after createChart/addSeries (which just
    // inserted several canvases — one main pane plus one per volume/RSI
    // pane) forces a synchronous layout before the browser's next paint —
    // the "Forced reflow" warning. Deferring the read to a rAF lets layout
    // happen on the browser's own schedule instead.
    let resizeFrame: number | null = null;
    const scheduleResize = () => {
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = null;
        if (chartContainerRef.current) {
          chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      });
    };
    scheduleResize();
    window.addEventListener("resize", scheduleResize);

    return () => {
      window.removeEventListener("resize", scheduleResize);
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      lineSeriesRef.current = null;
      ma20Ref.current = null;
      ma50Ref.current = null;
      ma200Ref.current = null;
      volumeSeriesRef.current = null;
      rsiSeriesRef.current = null;
    };
  }, [theme, chartType, showVolume, showRSI]);

  // Pushes derived candle/indicator data into whatever series the setup
  // effect above currently has mounted. Runs after that effect on every
  // commit where either fires, since both share the pane-layout deps.
  useEffect(() => {
    const mainSeries = candleSeriesRef.current ?? lineSeriesRef.current;
    if (!mainSeries) return;

    if (candleSeriesRef.current) candleSeriesRef.current.setData(derived.candleData);
    if (lineSeriesRef.current) lineSeriesRef.current.setData(derived.lineData);

    ma20Ref.current?.setData(showMA20 ? derived.ma20 : []);
    ma50Ref.current?.setData(showMA50 ? derived.ma50 : []);
    ma200Ref.current?.setData(showMA200 ? derived.ma200 : []);
    volumeSeriesRef.current?.setData(derived.volume);
    rsiSeriesRef.current?.setData(derived.rsi);

    chartRef.current?.timeScale().fitContent();
  }, [derived, theme, chartType, showMA20, showMA50, showMA200, showVolume, showRSI]);

  // Fetches real history from directory-api's /finance/crypto-history (via
  // the /api/pdc proxy, which holds DASHBOARD_INTERNAL_KEY server-side) on
  // every symbol/timeframe change. cancelled guards against a slow response
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
        if (cancelled) return;
        setHistoryResponse(history);
        setHistoryNote(history.note);
      })
      .catch(() => {
        if (!cancelled) setHistoryError("Chart history temporarily unavailable");
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSymbol, selectedTimeframe]);

  useEffect(() => {
    const mainSeries = candleSeriesRef.current ?? lineSeriesRef.current;
    if (!mainSeries || !selectedSymbol) return;
    const price = pickToken(tokens, selectedSymbol)?.price_usd;
    const range = chartPriceRange(selectedSymbol, typeof price === "number" ? price : null);
    mainSeries.applyOptions({
      autoscaleInfoProvider: (original: () => AutoscaleInfo | null) =>
        range ? { priceRange: range } : original(),
    });
  }, [selectedSymbol, tokens, chartType]);

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

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
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

        <div className="flex items-center gap-1 rounded-full border border-[var(--pdc-panel-border)] p-0.5">
          <ChartTypeButton
            label="Candles"
            active={chartType === "candlestick"}
            onClick={() => setChartType("candlestick")}
          />
          <ChartTypeButton
            label="Line"
            active={chartType === "line"}
            onClick={() => setChartType("line")}
          />
        </div>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <IndicatorToggle
          label="MA20"
          dotColor={MA_COLORS.ma20}
          active={showMA20}
          onClick={() => setShowMA20((v) => !v)}
        />
        <IndicatorToggle
          label="MA50"
          dotColor={MA_COLORS.ma50}
          active={showMA50}
          onClick={() => setShowMA50((v) => !v)}
        />
        <IndicatorToggle
          label="MA200"
          dotColor={MA_COLORS.ma200}
          active={showMA200}
          onClick={() => setShowMA200((v) => !v)}
        />
        <IndicatorToggle
          label="Volume"
          active={showVolume}
          onClick={() => setShowVolume((v) => !v)}
        />
        <IndicatorToggle
          label="RSI(14)"
          active={showRSI}
          onClick={() => setShowRSI((v) => !v)}
        />
      </div>

      <div className="relative w-full rounded-sm border border-[var(--pdc-panel-border)]">
        <div ref={chartContainerRef} className="w-full" />
        <div
          ref={tooltipRef}
          className="pointer-events-none absolute z-10 hidden rounded-sm border border-[var(--pdc-panel-border)] bg-[var(--pdc-bg)] px-2 py-1 font-mono text-[11px] text-[var(--pdc-text)] shadow-none"
        />
      </div>

      {(historyNote || historyError) && (
        <div className="mt-1 font-mono text-[11px] text-[var(--pdc-text-faint)]">
          {historyError ?? historyNote}
        </div>
      )}

      <div className="mt-1 font-mono text-[10px] text-[var(--pdc-text-faint)]">
        Candles are synthesized client-side from price snapshots (directory-api
        does not yet provide OHLCV data) — treat wicks as indicative, not exact.
      </div>

      <div className="mt-2 text-right font-mono text-[11px] text-[var(--pdc-text-faint)]">
        Last updated {hasMounted ? formatLastUpdated(data.cached_at) : "—"}
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

function ChartTypeButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors ${
        active
          ? "bg-[var(--pdc-accent)] text-[var(--pdc-bg)]"
          : "text-[var(--pdc-text-faint)] hover:text-[var(--pdc-text-dim)]"
      }`}
    >
      {label}
    </button>
  );
}

function IndicatorToggle({
  label,
  active,
  onClick,
  dotColor,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  dotColor?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors ${
        active
          ? "border-[var(--pdc-accent)] text-[var(--pdc-text)]"
          : "border-[var(--pdc-panel-border)] text-[var(--pdc-text-faint)] hover:text-[var(--pdc-text-dim)]"
      }`}
    >
      {dotColor && (
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: dotColor, opacity: active ? 1 : 0.4 }}
        />
      )}
      {label}
    </button>
  );
}
