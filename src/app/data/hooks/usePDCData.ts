"use client";

import { useEffect, useRef, useState } from "react";
import type {
  ArbitrageSignalsResponse,
  CryptoRatesResponse,
  FxRatesResponse,
  RemittanceCorridorsResponse,
} from "../types";

const POLL_INTERVAL_MS = 60_000;

type EndpointState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

function initialState<T>(): EndpointState<T> {
  return { data: null, loading: true, error: null };
}

async function fetchEndpoint<T>(endpoint: string): Promise<T> {
  const res = await fetch(`/api/pdc/${endpoint}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load ${endpoint}`);
  }
  return (await res.json()) as T;
}

export type PDCData = {
  crypto: EndpointState<CryptoRatesResponse>;
  fx: EndpointState<FxRatesResponse>;
  arbitrage: EndpointState<ArbitrageSignalsResponse>;
  remittance: EndpointState<RemittanceCorridorsResponse>;
};

export function usePDCData(initialCrypto?: CryptoRatesResponse | null): PDCData {
  const [crypto, setCrypto] = useState<EndpointState<CryptoRatesResponse>>(
    initialCrypto
      ? { data: initialCrypto, loading: false, error: null }
      : initialState()
  );
  const [fx, setFx] = useState<EndpointState<FxRatesResponse>>(
    initialState()
  );
  const [arbitrage, setArbitrage] = useState<
    EndpointState<ArbitrageSignalsResponse>
  >(initialState());
  const [remittance, setRemittance] = useState<
    EndpointState<RemittanceCorridorsResponse>
  >(initialState());

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const loadCrypto = async () => {
      try {
        const data = await fetchEndpoint<CryptoRatesResponse>(
          "crypto-rates"
        );
        if (mountedRef.current) setCrypto({ data, loading: false, error: null });
      } catch {
        if (mountedRef.current)
          setCrypto((prev) => ({
            ...prev,
            loading: false,
            error: "Data temporarily unavailable",
          }));
      }
    };

    const loadArbitrage = async () => {
      try {
        const data = await fetchEndpoint<ArbitrageSignalsResponse>(
          "arbitrage-signals"
        );
        if (mountedRef.current)
          setArbitrage({ data, loading: false, error: null });
      } catch {
        if (mountedRef.current)
          setArbitrage((prev) => ({
            ...prev,
            loading: false,
            error: "Data temporarily unavailable",
          }));
      }
    };

    const loadFx = async () => {
      try {
        const data = await fetchEndpoint<FxRatesResponse>("fx");
        if (mountedRef.current) setFx({ data, loading: false, error: null });
      } catch {
        if (mountedRef.current)
          setFx((prev) => ({
            ...prev,
            loading: false,
            error: "Data temporarily unavailable",
          }));
      }
    };

    const loadRemittance = async () => {
      try {
        const data = await fetchEndpoint<RemittanceCorridorsResponse>(
          "remittance-corridors"
        );
        if (mountedRef.current)
          setRemittance({ data, loading: false, error: null });
      } catch {
        if (mountedRef.current)
          setRemittance((prev) => ({
            ...prev,
            loading: false,
            error: "Data temporarily unavailable",
          }));
      }
    };

    if (!initialCrypto) loadCrypto();
    loadArbitrage();
    loadFx();
    loadRemittance();

    const pollId = setInterval(() => {
      loadCrypto();
      loadArbitrage();
    }, POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(pollId);
    };
    // Mount-once: initialCrypto only seeds the first render and must not
    // restart fetching/polling on subsequent renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { crypto, fx, arbitrage, remittance };
}
