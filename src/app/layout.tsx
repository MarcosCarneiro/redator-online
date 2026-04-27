import type { Metadata, Viewport } from "next";
import { Inter, Kalam } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
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
        <ClerkProvider
          localization={ptBR}
          appearance={{
            layout: {
              socialButtonsVariant: 'blockButton',
              logoPlacement: 'inside',
            },
            variables: {
              colorPrimary: '#1e3a8a',
              colorText: '#0f172a',
              colorBackground: '#ffffff',
              borderRadius: '12px',
              fontWeight: {
                normal: 400,
                medium: 600,
                bold: 700,
              }
            },
            elements: {
              formButtonPrimary: {
                fontSize: '1rem',
                textTransform: 'none',
                paddingTop: '0.8rem',
                paddingBottom: '0.8rem',
                fontWeight: 700,
                backgroundColor: '#1e3a8a',
                '&:hover': {
                  backgroundColor: '#3b82f6',
                },
              },
              socialButtonsBlockButton: {
                paddingTop: '0.8rem',
                paddingBottom: '0.8rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                border: '1px solid #e2e8f0',
              },
              card: {
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                border: '1px solid #f1f5f9',
              },
              formFieldInput: {
                paddingTop: '0.7rem',
                paddingBottom: '0.7rem',
                borderRadius: '8px',
              }
            }
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
