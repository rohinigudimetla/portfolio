import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rohini Gudimetla",
  description:
    "Software developer in Boston. Spring Boot, React, PostgreSQL and AWS, and the written record of why each decision went that way.",
  authors: [{ name: "Rohini Gudimetla" }],
  openGraph: {
    title: "Rohini Gudimetla",
    description: "Software developer in Boston.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#2a2d1d",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
