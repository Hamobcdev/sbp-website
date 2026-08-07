import { ReactNode } from "react";

export default function Button({
  children,
  href,
  variant = "primary",
  target,
}: {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary";
  target?: "_blank";
}) {
  const base =
    "inline-flex items-center gap-2 rounded-sm px-6 py-3 font-body text-sm font-bold transition-all duration-300";
  const styles =
    variant === "primary"
      ? "bg-teal text-navy hover:bg-teal/90"
      : "glass border-teal/40 text-teal hover:bg-teal-glow";

  return (
    <a
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className={`${base} ${styles}`}
    >
      {children}
    </a>
  );
}
