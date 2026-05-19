import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aldım - Fatura, Garanti ve İade Takip Uygulaması",
  description:
    "Aldım ile satın aldığın ürünlerin faturasını, garanti süresini, iade tarihini ve servis kayıtlarını tek yerde takip et.",
  applicationName: "Aldım",
  authors: [{ name: "Aldım" }],
  keywords: [
    "fatura takip",
    "garanti takip",
    "iade takip",
    "tüketici hakları",
    "alışveriş asistanı",
    "Aldım",
  ],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.svg", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "Aldım",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#172F5E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-ink-50 text-ink-900 font-sans">
        {children}
      </body>
    </html>
  );
}
