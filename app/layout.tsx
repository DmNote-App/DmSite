import "./globals.css";
import { baseMetadata, baseViewport, siteConfig } from "./seo.config";

export const metadata = baseMetadata;
export const viewport = baseViewport;

// JSON-LD 구조화된 데이터 (Google 검색 최적화)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  applicationCategory: "GameApplication",
  operatingSystem: "Windows",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
  },
  author: {
    "@type": "Organization",
    name: siteConfig.name,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" dir="ltr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
