import { NextRequest, NextResponse } from "next/server";

const PDC_BASE_URL = "https://api.synergybcpacific.com";

const ENDPOINT_MAP: Record<
  string,
  { path: string; cacheSeconds: number; forwardParams?: string[] }
> = {
  "crypto-rates": { path: "/finance/crypto-rates", cacheSeconds: 60 },
  "crypto-history": {
    path: "/finance/crypto-history",
    cacheSeconds: 60,
    // directory-api's own query params are `symbol` and `tf` (not
    // `interval`) — see routes/finance/crypto-history.ts. Forwarded
    // verbatim; CryptoPanel.tsx's TIMEFRAMES values already match `tf`'s
    // expected values (5m/15m/1h/4h/8h/1D/1W/1M) exactly, so no mapping
    // is needed on either side of this proxy.
    forwardParams: ["symbol", "tf"],
  },
  fx: {
    path: "/finance/fx",
    cacheSeconds: 86400,
    forwardParams: ["base"],
  },
  "remittance-corridors": {
    path: "/finance/remittance-corridors",
    cacheSeconds: 86400,
  },
  "arbitrage-signals": {
    path: "/finance/arbitrage-signals",
    cacheSeconds: 60,
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: { endpoint: string } }
) {
  const entry = ENDPOINT_MAP[params.endpoint];

  if (!entry) {
    return NextResponse.json({ error: "Unknown endpoint" }, { status: 404 });
  }

  const internalKey = process.env.DASHBOARD_INTERNAL_KEY;

  if (!internalKey) {
    return NextResponse.json(
      { error: "Dashboard is not configured" },
      { status: 503 }
    );
  }

  const upstreamUrl = new URL(`${PDC_BASE_URL}${entry.path}`);
  for (const name of entry.forwardParams ?? []) {
    const value = req.nextUrl.searchParams.get(name);
    if (value) upstreamUrl.searchParams.set(name, value);
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        "X-Internal-Key": internalKey,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Upstream data source unavailable" },
        { status: 502 }
      );
    }

    const data = await upstream.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `private, max-age=${entry.cacheSeconds}`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Upstream data source unavailable" },
      { status: 502 }
    );
  }
}
