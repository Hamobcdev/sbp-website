export type CryptoToken = {
  symbol: string;
  name?: string;
  price_usd: number;
  change_24h_pct: number;
  volume_24h_usd: number;
  market_cap_usd: number;
};

export type CryptoRatesResponse = {
  tokens: CryptoToken[];
  pacific_priority_tokens: string[];
  updated_at: string;
  // Added alongside the directory-api static price fallback for when
  // CoinGecko is unreachable from Cloudflare Workers — static_fallback is
  // always present; the other two are null on a live response.
  static_fallback?: boolean;
  static_fallback_reason?: string | null;
  prices_as_of?: string | null;
};

export type FxRatesResponse = {
  base_currencies: string[];
  display_currencies: string[];
  rates: Record<string, Record<string, number>>;
  pegs?: { currencies: string[]; peg_currency: string; note: string }[];
  updated_at: string;
  source?: string;
};

export type ArbitrageSignal = {
  pair: string;
  buy_venue: string;
  sell_venue: string;
  net_spread_after_slippage_pct: number;
  is_executable_estimated: boolean;
  signal_age_ms: number;
  mev_warning?: string | null;
};

export type ArbitrageSignalsResponse = {
  signals: ArbitrageSignal[];
  updated_at: string;
};

export type RemittanceCorridor = {
  corridor_label: string;
  from: string;
  to: string;
  traditional_rails: {
    cost_pct: number;
    static_fallback?: boolean;
    source?: string;
  };
  crypto_rails: {
    best_cost_pct: number;
    venue?: string;
  };
  potential_saving_pct?: number;
};

export type RemittanceCorridorsResponse = {
  corridors: RemittanceCorridor[];
  updated_at: string;
};

export const PACIFIC_CURRENCY_INFO: Record<
  string,
  { flag: string; name: string }
> = {
  WST: { flag: "🇼🇸", name: "Samoan Tālā" },
  FJD: { flag: "🇫🇯", name: "Fijian Dollar" },
  TOP: { flag: "🇹🇴", name: "Tongan Paʻanga" },
  PGK: { flag: "🇵🇬", name: "PNG Kina" },
  VUV: { flag: "🇻🇺", name: "Vanuatu Vatu" },
  SBD: { flag: "🇸🇧", name: "Solomon Islands Dollar" },
  XPF: { flag: "🇵🇫", name: "CFP Franc" },
};

export const MICRO_STATE_PEG_NOTE =
  "Kiribati, Nauru and Tuvalu use the Australian Dollar (AUD peg)";
