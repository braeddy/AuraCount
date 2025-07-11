import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AuraCount - Traccia l'Aura dei tuoi Amici",
  description: "Una webapp per tracciare i punti aura nel vostro gioco tra amici",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
          {children}
        </div>
      </body>
    </html>
  );
}
