"use client";

import { useEffect, useState } from "react";
import type { CryptoToken, FxRatesResponse } from "../types";

const FIAT_CURRENCIES = [
  "USD",
  "AUD",
  "NZD",
  "WST",
  "FJD",
  "TOP",
  "PGK",
  "VUV",
  "SBD",
  "XPF",
];

type Driver = "fiat" | "crypto";

// Last-resort fallback when the live PDC fx-rates fetch is entirely
// unavailable, or doesn't include this currency — on top of, not instead
// of, directory-api's own internal static fallback. Values are USD per 1
// unit of the currency (same direction as a token's price_usd), not
// currency-per-USD.
const INDICATIVE_USD_RATES: Record<string, number> = {
  WST: 0.357,
  FJD: 0.439,
  TOP: 0.418,
  PGK: 0.259,
  VUV: 0.00837,
  SBD: 0.119,
  XPF: 0.00887,
  AUD: 0.644,
  NZD: 0.593,
};

type RateResult = { usdPerUnit: number; indicative: boolean };

function usdRateFor(
  fxData: FxRatesResponse | null,
  currency: string
): RateResult | undefined {
  if (currency === "USD") return { usdPerUnit: 1, indicative: false };

  // Live PDC data (fxRateService.ts convention): rates[code] is currency
  // units per 1 USD — invert to USD per 1 unit, the direction this
  // converter uses everywhere else (tokenPrice included).
  const unitsPerUsd = fxData?.rates?.[currency];
  if (typeof unitsPerUsd === "number" && unitsPerUsd > 0) {
    return { usdPerUnit: 1 / unitsPerUsd, indicative: false };
  }

  const fallback = INDICATIVE_USD_RATES[currency];
  if (typeof fallback === "number") {
    return { usdPerUnit: fallback, indicative: true };
  }

  return undefined;
}

export default function FiatConverter({
  tokens,
  priorityTokens,
  fxData,
}: {
  tokens: CryptoToken[];
  priorityTokens: string[];
  fxData: FxRatesResponse | null;
}) {
  const [currency, setCurrency] = useState("USD");
  const [token, setToken] = useState<string | null>(null);
  const [amountFiat, setAmountFiat] = useState("1");
  const [amountCrypto, setAmountCrypto] = useState("");
  const [driver, setDriver] = useState<Driver>("fiat");

  useEffect(() => {
    if (token || tokens.length === 0) return;
    setToken(priorityTokens[0] ?? tokens[0]?.symbol ?? null);
  }, [tokens, priorityTokens, token]);

  const tokenPrice = tokens.find((t) => t.symbol === token)?.price_usd;
  const rateResult = usdRateFor(fxData, currency);
  const rate = rateResult?.usdPerUnit;
  const usingIndicativeRate = rateResult?.indicative ?? false;

  // Driver: fiat -> recompute crypto amount from the fiat input.
  useEffect(() => {
    if (driver !== "fiat") return;
    const amt = parseFloat(amountFiat);
    if (!Number.isFinite(amt) || !rate || !tokenPrice) {
      setAmountCrypto("");
      return;
    }
    const usd = amt * rate;
    setAmountCrypto((usd / tokenPrice).toFixed(4));
  }, [driver, amountFiat, currency, token, rate, tokenPrice]);

  // Driver: crypto -> recompute fiat amount from the crypto input.
  useEffect(() => {
    if (driver !== "crypto") return;
    const amt = parseFloat(amountCrypto);
    if (!Number.isFinite(amt) || !rate || !tokenPrice) {
      setAmountFiat("");
      return;
    }
    const usd = amt * tokenPrice;
    setAmountFiat((usd / rate).toFixed(4));
  }, [driver, amountCrypto, currency, token, rate, tokenPrice]);

  const rateUnavailable = !rate || !tokenPrice;

  return (
    <div className="mt-6 rounded-md border border-[var(--pdc-panel-border)] bg-[var(--pdc-accent)]/[0.04] p-4">
      <div className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-[var(--pdc-accent)]">
        Fiat ⇄ Crypto Converter
      </div>

      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-sm border border-[var(--pdc-panel-border)] px-3 py-2">
          <input
            type="number"
            inputMode="decimal"
            value={driver === "fiat" ? amountFiat : amountFiat}
            readOnly={driver !== "fiat"}
            onFocus={() => setDriver("fiat")}
            onChange={(e) => {
              setDriver("fiat");
              setAmountFiat(e.target.value);
            }}
            className="w-full min-w-0 bg-transparent font-mono text-sm text-[var(--pdc-text)] outline-none"
            placeholder="0.00"
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-transparent font-mono text-sm text-[var(--pdc-text)] outline-none"
          >
            {FIAT_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          aria-label="Swap conversion direction"
          onClick={() => setDriver((d) => (d === "fiat" ? "crypto" : "fiat"))}
          className="shrink-0 self-center rounded-full border border-[var(--pdc-panel-border)] px-2.5 py-1.5 font-mono text-sm text-[var(--pdc-accent)] transition-colors hover:border-[var(--pdc-accent)]"
        >
          ⇄
        </button>

        <div className="flex flex-1 items-center gap-2 rounded-sm border border-[var(--pdc-panel-border)] px-3 py-2">
          <input
            type="number"
            inputMode="decimal"
            value={amountCrypto}
            readOnly={driver !== "crypto"}
            onFocus={() => setDriver("crypto")}
            onChange={(e) => {
              setDriver("crypto");
              setAmountCrypto(e.target.value);
            }}
            className="w-full min-w-0 bg-transparent font-mono text-sm text-[var(--pdc-text)] outline-none"
            placeholder="0.00"
          />
          <select
            value={token ?? ""}
            onChange={(e) => setToken(e.target.value)}
            className="bg-transparent font-mono text-sm text-[var(--pdc-text)] outline-none"
          >
            {tokens.map((t) => (
              <option key={t.symbol} value={t.symbol}>
                {t.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      {usingIndicativeRate ? (
        <div className="mt-2 font-mono text-[11px] text-[var(--pdc-accent-gold)]">
          Rate unavailable — using indicative rate
        </div>
      ) : (
        rateUnavailable && (
          <div className="mt-2 font-mono text-[11px] text-[var(--pdc-text-faint)]">
            Rate unavailable for this pair right now.
          </div>
        )
      )}

      <div className="mt-2 font-body text-xs text-[var(--pdc-text-dim)]">
        Indicative rate only. Not financial advice.
      </div>
    </div>
  );
}
