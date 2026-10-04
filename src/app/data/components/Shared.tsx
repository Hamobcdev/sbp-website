export function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
  return <div className={`pdc-skeleton ${className}`} />;
}

export function PanelError({ message }: { message?: string | null }) {
  return (
    <div className="flex min-h-[120px] items-center justify-center rounded-md border border-dashed border-[var(--pdc-panel-border)] p-6 text-center font-body text-sm text-[var(--pdc-text-dim)]">
      {message || "Data temporarily unavailable"}
    </div>
  );
}

export function PanelHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--pdc-accent)]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 font-body text-sm text-[var(--pdc-text-dim)]">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function formatTimestamp(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function formatAgo(ms?: number | null): string {
  if (ms == null || Number.isNaN(ms)) return "—";
  const seconds = Math.round(ms / 1000);
  if (seconds < 1) return "just now";
  if (seconds === 1) return "1 second ago";
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.round(seconds / 60);
  return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
}

export function formatUsd(value?: number | null, opts?: { compact?: boolean }): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  if (opts?.compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  }
  const maximumFractionDigits = value < 1 ? 6 : value < 100 ? 4 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  }).format(value);
}

export function formatPct(value?: number | null): string {
  // typeof check (not just value == null) matters here specifically: this
  // is the one helper in this file that calls .toFixed() directly rather
  // than going through Intl.NumberFormat, so a non-number value (e.g. a
  // malformed/degraded API response field) would otherwise throw
  // "value.toFixed is not a function" instead of rendering "—".
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function ChangeBadge({ value }: { value?: number | null }) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return <span className="text-[var(--pdc-text-dim)]">—</span>;
  }
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-sm ${
        positive ? "text-[var(--pdc-up)]" : "text-[var(--pdc-down)]"
      }`}
    >
      {positive ? "▲" : "▼"} {formatPct(value)}
    </span>
  );
}
