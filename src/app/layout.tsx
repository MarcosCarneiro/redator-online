import type { Metadata, Viewport } from "next";
import { Inter, Kalam } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const kalam = Kalam({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-kalam",
  display: "swap",
});

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
    <html lang="pt-BR" className={`${inter.variable} ${kalam.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
