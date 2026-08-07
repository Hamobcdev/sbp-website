import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/nav/Navigation";
import Footer from "@/components/Footer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Synergy Blockchain Pacific — Pioneering Blockchain in the Pacific",
  description:
    "Samoa's first blockchain infrastructure company, building sovereign digital public infrastructure for Pacific Island nations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${plexMono.variable} ${dmSans.variable} bg-navy antialiased`}
      >
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
