import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { defaultStoreConfig } from "@/lib/config/store.config";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${defaultStoreConfig.name} — ${defaultStoreConfig.slogan}`,
  description: defaultStoreConfig.description,
  icons: {
    icon: defaultStoreConfig.faviconUrl,
    shortcut: defaultStoreConfig.faviconUrl,
    apple: defaultStoreConfig.faviconUrl,
  },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${bebasNeue.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-brasa-bg text-brasa-cream font-sans antialiased selection:bg-brasa-orange selection:text-black">
        {children}
      </body>
    </html>
  );
}

