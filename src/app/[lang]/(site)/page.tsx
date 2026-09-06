import { absoluteUrl, homeMetadata, siteConfig, siteDescription } from "../../seo.config";
import { notFound } from "next/navigation";
import { homePath, isLocale } from "@/lib/i18n";
import StructuredData from "@/components/StructuredData";
import { LandingContent } from "./LandingContent";

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return homeMetadata(lang);
}

export default async function LandingPage({ params }: PageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const url = absoluteUrl(homePath(lang));
  return (
    <>
      <StructuredData data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": absoluteUrl("/#website"),
            name: siteConfig.name,
            url: absoluteUrl("/"),
            inLanguage: ["ko", "en"],
          },
          {
            "@type": "SoftwareApplication",
            "@id": `${url}#application`,
            name: siteConfig.name,
            description: siteDescription(lang),
            url,
            operatingSystem: "Windows",
            applicationCategory: "UtilitiesApplication",
            offers: { "@type": "Offer", price: 0, priceCurrency: "KRW" },
            author: { "@type": "Organization", name: siteConfig.name },
          },
        ],
      }} />
      <LandingContent />
    </>
  );
}
