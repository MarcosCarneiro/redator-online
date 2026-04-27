import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Redator Online | Corretor de Redação ENEM Grátis com IA",
  description: "Melhore sua nota no ENEM com nossa Inteligência Artificial. Correção instantânea baseada nas 5 competências oficiais. Treine sua redação agora!",
  keywords: ["redação enem", "corretor de redação", "ia redação", "nota 1000 enem", "praticar redação"],
  authors: [{ name: "Redator Online Team" }],
  openGraph: {
    title: "Redator Online | Corretor de Redação ENEM com IA",
    description: "Receba feedback detalhado e sua nota da redação em segundos.",
    url: "https://redatoronline.com.br",
    siteName: "Redator Online",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Redator Online | Corretor de Redação ENEM",
    description: "Sua nota 1000 começa aqui com Inteligência Artificial.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export const viewport: Viewport = {
  themeColor: "#1e3a8a",
  width: "device-width",
  initialScale: 1,
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Kalam:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
