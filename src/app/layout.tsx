import type { Metadata, Viewport } from "next";
import { Literata, Caveat } from "next/font/google";
import "./globals.css";

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  display: "swap",
  axes: ["opsz"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rohini Gudimetla, Full Stack Software Developer",
  description:
    "Full stack developer in Boston working in Spring Boot, React, PostgreSQL and AWS. Shipped work, written architecture decisions, and a resume you can download.",
  authors: [{ name: "Rohini Gudimetla" }],
  openGraph: {
    title: "Rohini Gudimetla, Full Stack Software Developer",
    description:
      "Spring Boot, React, PostgreSQL and AWS. Shipped work and the reasoning behind it.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#334736",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${literata.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
