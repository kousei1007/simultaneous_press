import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { FoliageBackground } from "@/shared/components/FoliageBackground";
import "./globals.css";

/** 見出し用のセリフ体（Material Theme Builder のサンプルに合わせた Fraunces）。 */
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Simultaneous Press | 同時押しタイピング",
  description:
    "表示された 3〜10 文字を 0.5 秒以内に同時押し。60 秒でスコアを競うタイピングゲーム。",
};

export const viewport: Viewport = {
  themeColor: "#e3e8e1",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen">
        <FoliageBackground />
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
