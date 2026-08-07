type BadgeColor = "teal" | "gold" | "silver";

const colorMap: Record<BadgeColor, string> = {
  teal: "text-teal border-teal/40 bg-teal/[0.15]",
  gold: "text-gold border-gold/40 bg-gold/[0.15]",
  silver: "text-silver border-silver/40 bg-silver/[0.15]",
};

export default function Badge({
  children,
  color = "teal",
}: {
  children: string;
  color?: BadgeColor;
}) {
  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wide ${colorMap[color]}`}
    >
      {children}
    </span>
  );
}
