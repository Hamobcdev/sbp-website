export default function LiveIndicator({
  status = "live",
}: {
  status?: "live" | "pilot";
}) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulse-live rounded-full bg-green-live" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-live" />
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wide text-green-live">
          Live
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-gold" />
      <span className="font-mono text-[11px] uppercase tracking-wide text-gold">
        Pilot Ready
      </span>
    </span>
  );
}
