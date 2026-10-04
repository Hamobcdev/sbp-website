import type { Metadata } from "next";
import { DashboardThemeProvider } from "./ThemeContext";
import DashboardClient from "./DashboardClient";
import type { CryptoRatesResponse } from "./types";

export const metadata: Metadata = {
  title: "Pacific Data | Synergy Blockchain Pacific",
  description:
    "Real-time Pacific crypto prices, FX rates, DEX arbitrage signals and remittance corridor costs, powered by the Pacific Digital Clearinghouse.",
};

const PDC_BASE_URL = "https://api.synergybcpacific.com";

async function getInitialCryptoRates(): Promise<CryptoRatesResponse | null> {
  const internalKey = process.env.DASHBOARD_INTERNAL_KEY;
  if (!internalKey) return null;

  try {
    const res = await fetch(`${PDC_BASE_URL}/finance/crypto-rates`, {
      headers: {
        "X-Internal-Key": internalKey,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as CryptoRatesResponse;
  } catch {
    return null;
  }
}

export default async function DataPage() {
  const initialCrypto = await getInitialCryptoRates();

  return (
    <DashboardThemeProvider>
      <DashboardClient initialCrypto={initialCrypto} />
    </DashboardThemeProvider>
  );
}
