import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "LIGAPRO EC - Sistema Integral de Gestión de Competiciones",
  description:
    "Sistema Integral de Gestión de Competiciones de la Liga Profesional de Fútbol del Ecuador. Administración, control reglamentario, fiscalización y gestión de campeonatos.",
  keywords: [
    "LIGAPRO",
    "fútbol",
    "Ecuador",
    "competiciones",
    "gestión deportiva",
    "Serie A",
    "Serie B",
  ],
  authors: [{ name: "LIGAPRO EC" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
