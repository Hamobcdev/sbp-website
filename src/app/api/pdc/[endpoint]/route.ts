import { NextRequest, NextResponse } from "next/server";

const PDC_BASE_URL = "https://api.synergybcpacific.com";

const ENDPOINT_MAP: Record<string, { path: string; cacheSeconds: number }> = {
  "crypto-rates": { path: "/finance/crypto-rates", cacheSeconds: 60 },
  fx: { path: "/finance/fx", cacheSeconds: 86400 },
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
  _req: NextRequest,
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

  try {
    const upstream = await fetch(`${PDC_BASE_URL}${entry.path}`, {
      headers: {
        "X-Internal-Key": internalKey,
        Accept: "application/json",
      },
      next: { revalidate: entry.cacheSeconds },
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
