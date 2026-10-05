import type { UTCTimestamp } from "lightweight-charts";
import type { CryptoHistoryPoint } from "../types";

// directory-api's /finance/crypto-history only returns a single USD price
// per timestamp ({t, p}), not OHLCV bars — there is no upstream open/high/
// low/close/volume data today. These candles are synthesized client-side by
// bucketing consecutive price points: open = first price in the bucket,
// high/low = max/min, close = last. They do not reflect real intra-bar
// price action and should be replaced once directory-api ships real OHLCV.
export type Candle = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
};

// Keeps the candle count roughly constant regardless of how many raw
// points a timeframe's lookback window happens to return.
const TARGET_CANDLES = 60;

function toUTCTimestamp(iso: string): UTCTimestamp {
  return Math.floor(new Date(iso).getTime() / 1000) as UTCTimestamp;
}

export function bucketPoints(points: CryptoHistoryPoint[]): Candle[] {
  if (points.length === 0) return [];
  const bucketSize = Math.max(1, Math.ceil(points.length / TARGET_CANDLES));
  const candles: Candle[] = [];

  for (let i = 0; i < points.length; i += bucketSize) {
    const chunk = points.slice(i, i + bucketSize);
    const prices = chunk.map((p) => p.p);
    candles.push({
      time: toUTCTimestamp(chunk[0].t),
      open: prices[0],
      high: Math.max(...prices),
      low: Math.min(...prices),
      close: prices[prices.length - 1],
    });
  }

  return candles;
}

// Simple moving average, aligned to the input array (undefined until enough
// history has accumulated for a full window).
export function sma(values: number[], period: number): (number | undefined)[] {
  const result: (number | undefined)[] = new Array(values.length).fill(undefined);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) result[i] = sum / period;
  }
  return result;
}

function rsiFromAvg(avgGain: number, avgLoss: number): number {
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

// Wilder's RSI, aligned to the input array (undefined until the first full
// `period`-length window of deltas is available).
export function rsi(values: number[], period = 14): (number | undefined)[] {
  const result: (number | undefined)[] = new Array(values.length).fill(undefined);
  if (values.length < period + 1) return result;

  let gainSum = 0;
  let lossSum = 0;
  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gainSum += diff;
    else lossSum -= diff;
  }
  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  result[period] = rsiFromAvg(avgGain, avgLoss);

  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    result[i] = rsiFromAvg(avgGain, avgLoss);
  }

  return result;
}

export function toLineData(
  times: UTCTimestamp[],
  values: (number | undefined)[]
): { time: UTCTimestamp; value: number }[] {
  const out: { time: UTCTimestamp; value: number }[] = [];
  for (let i = 0; i < times.length; i++) {
    const v = values[i];
    if (v !== undefined) out.push({ time: times[i], value: v });
  }
  return out;
}
