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
  // directory-api's /finance/crypto-rates sends cached_at, not
  // updated_at — this previously named the wrong field, so "Last
  // updated" always read undefined. Optional/nullable defensively;
  // the live response always sets it, but never assume that here.
  cached_at?: string | null;
  // Added alongside the directory-api static price fallback for when
  // CoinGecko is unreachable from Cloudflare Workers — static_fallback is
  // always present; the other two are null on a live response.
  static_fallback?: boolean;
  static_fallback_reason?: string | null;
  prices_as_of?: string | null;
};

// Matches directory-api's /finance/fx response (fxRateService.ts +
// routes/finance/fx.ts) — `rates` is a flat Record<code, number> already
// resolved to the response's `base` currency (USD unless ?base= was
// passed), not a nested per-base map. base_currencies/display_currencies
// are never actually sent by this API; FxPanel supplies its own curated
// defaults when they're absent. micro_state_pegs (not `pegs`) carries
// short machine-readable notes, not display prose.
export type FxRatesResponse = {
  base?: string;
  base_currencies?: string[];
  display_currencies?: string[];
  rates: Record<string, number>;
  micro_state_pegs?: { country: string; currency: string; note: string; peg_confirmed: boolean }[];
  generated_at?: string;
  timestamp?: string;
  source?: string;
  data_sources?: string[];
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

// Matches directory-api's pacificRemittanceService.ts response shape —
// send_country/receive_country (not from/to/corridor_label), an array of
// per-token crypto_rails (not a single best_cost_pct object), and a
// traditional_rails that can be null when no World Bank data (live or
// static) exists for a corridor.
export type RemittanceCorridor = {
  corridor_id: string;
  send_country: string;
  receive_country: string;
  traditional_rails: {
    average_cost_pct: number;
    static_fallback?: boolean;
    data_source?: string;
  } | null;
  crypto_rails: Array<{
    token: string;
    total_estimated_cost_pct: number;
  }>;
  potential_saving_pct: number | null;
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
