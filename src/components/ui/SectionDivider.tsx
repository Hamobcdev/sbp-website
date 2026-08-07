"use client";

import { useEffect, useRef, useState } from "react";

const BG_MAP: Record<string, string> = {
  navy: "#0a1628",
  "navy-mid": "#0d1f3c",
  white: "#ffffff",
};

export default function SectionDivider({
  bg = "navy",
}: {
  bg?: "navy" | "navy-mid" | "white";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex justify-center py-2"
      style={{ background: BG_MAP[bg] }}
    >
      <div
        className="h-px transition-all duration-[1200ms] ease-out"
        style={{
          width: visible ? "60%" : "0%",
          maxWidth: "400px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(0,212,200,0.6) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}
