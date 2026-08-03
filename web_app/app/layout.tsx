import type { Metadata, Viewport } from "next";
import "./globals.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "MARKOVMADE: RECODE — Life RPG",
  description: "Перепиши тело. Перепиши решения. Перепиши жизнь. Life RPG, где реальные действия меняют героя, отношения, Meridian и финал.",
  applicationName: "MARKOVMADE: RECODE",
  manifest: `${BASE_PATH}/manifest.webmanifest`,
  authors: [{ name: "Павел Марков / Pavel Markov / MARKOVMADE" }],
  other: {
    "codex-preview": "production",
    "theme-color": "#07090b",
  },
  icons: {
    icon: `${BASE_PATH}/favicon.svg`,
    shortcut: `${BASE_PATH}/favicon.svg`,
    apple: `${BASE_PATH}/icon-192.png`,
  },
  openGraph: {
    title: "MARKOVMADE: RECODE — Life RPG",
    description: "Реальное действие меняет героя, отношения, Meridian и финальную последовательность.",
    type: "website",
    locale: "ru_RU",
    alternateLocale: "en_US",
    images: [{ url: `${BASE_PATH}/og-recode-v7.jpg`, width: 1200, height: 630, alt: "MARKOVMADE: RECODE — Meridian changed by real choices" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MARKOVMADE: RECODE — Life RPG",
    description: "Recode your body. Recode your choices. Recode your life.",
    images: [`${BASE_PATH}/og-recode-v7.jpg`],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080a0b" },
    { media: "(prefers-color-scheme: light)", color: "#ede9df" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
