import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BotRoyale — AI vs AI Battle Arena",
  description: "Creëer je eigen AI fighter en laat die los in de arena. AI vs AI battles in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="antialiased bg-[#07070d] text-white min-h-screen font-mono">
        {children}
      </body>
    </html>
  );
}
