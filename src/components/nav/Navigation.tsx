"use client";

import Image from "next/image";
import { useState } from "react";

const LINKS = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Platform", href: "#platform" },
  { label: "Research", href: "#research" },
  { label: "Blog", href: "#blog" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
  { label: "TipTide", href: "https://tiptide.synergybcpacific.com" },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 z-50 h-16 w-full border-b border-teal-dim bg-navy/95 backdrop-blur-[20px]">
        <div className="mx-auto flex h-full max-w-content items-center justify-between px-6">
          <a href="#" className="flex items-center">
            <Image
              src="/assets/images/logo.png"
              alt="Synergy Blockchain Pacific"
              width={46}
              height={48}
              className="h-12 w-auto"
              priority
            />
            <span className="ml-3 hidden font-mono text-[11px] tracking-[0.15em] text-silver sm:block">
              SYNERGY BLOCKCHAIN PACIFIC
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  link.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="font-body text-sm text-silver transition-colors hover:text-teal"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <a
            href="mailto:info@synergybcpacific.com"
            className="hidden font-mono text-xs text-teal md:block"
          >
            info@synergybcpacific.com
          </a>

          <button
            className="flex flex-col gap-1.5 md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
          >
            <span
              className={`block h-0.5 w-6 bg-teal transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-6 bg-teal transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-6 bg-teal transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 top-16 z-40 flex flex-col items-center gap-8 bg-navy pt-16 md:hidden">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={
                link.href.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              onClick={() => setOpen(false)}
              className="font-body text-2xl text-white"
            >
              {link.label}
            </a>
          ))}
          <a
            href="mailto:info@synergybcpacific.com"
            className="font-mono text-sm text-teal"
          >
            info@synergybcpacific.com
          </a>
        </div>
      )}
    </>
  );
}
