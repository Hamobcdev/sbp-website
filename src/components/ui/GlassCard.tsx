import { CSSProperties, ReactNode } from "react";

type AccentColor = "gold" | "teal" | "silver" | "none";

const accentBorderMap: Record<AccentColor, string> = {
  gold: "border-l-[3px] border-l-gold",
  teal: "border-l-[3px] border-l-teal",
  silver: "border-l-[3px] border-l-silver",
  none: "",
};

export default function GlassCard({
  children,
  variant = "default",
  accent = "none",
  hover = false,
  className = "",
  style,
  padding = "p-6",
}: {
  children: ReactNode;
  variant?: "default" | "gold" | "light";
  accent?: AccentColor;
  hover?: boolean;
  className?: string;
  style?: CSSProperties;
  padding?: string;
}) {
  const base =
    variant === "gold" ? "glass-gold" : variant === "light" ? "glass-light" : "glass";
  return (
    <div
      className={`${base} ${hover ? "glass-hover" : ""} ${accentBorderMap[accent]} ${padding} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
