import "./globals.css";
import "nextra-theme-docs/style.css";
import { Head } from "nextra/components";
import { baseMetadata, baseViewport, siteConfig } from "./seo.config";
import AppProviders from "@/providers/AppProviders";

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
      <Head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K8GL2GC9');`,
          }}
        />
        {/* End Google Tag Manager */}
        <meta
          name="naver-site-verification"
          content="b249cc8c4fa1792f5e3b50b6a8e4ee6ebca3fd2d"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K8GL2GC9"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
