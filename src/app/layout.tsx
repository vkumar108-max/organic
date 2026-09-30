import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { MobileSearchOverlay } from "@/components/layout/MobileSearchOverlay";
import { StoreHydrator } from "@/components/StoreHydrator";
import { JsonLd } from "@/components/ui/JsonLd";
import { ToastViewport } from "@/components/ui/Toast";
import { site } from "@/config/site";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import "./globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const heading = Fraunces({ subsets: ["latin"], variable: "--font-heading", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  // Demo catalogues stay out of search engines until NEXT_PUBLIC_ALLOW_INDEXING=true
  robots: site.allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { type: "website", siteName: site.name, locale: site.locale },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#2d7439", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${heading.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lift">
          Skip to main content
        </a>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <StoreHydrator />
        <Header />
        <main id="main" className="min-h-[60vh]">{children}</main>
        <Footer />
        <MobileBottomNav />
        <MobileSearchOverlay />
        <ToastViewport />
      </body>
    </html>
  );
}
