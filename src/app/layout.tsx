import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Redator Online - Corretor de Redação ENEM",
  description: "Corrija sua redação do ENEM instantaneamente com Inteligência Artificial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Kalam:wght@300;400;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
