import { notFound } from "next/navigation";
import { baseMetadata, baseViewport } from "../seo.config";
import { isLocale, locales } from "@/lib/i18n";
import AppProviders from "@/providers/AppProviders";
import SiteDocument from "@/components/SiteDocument";

export const metadata = baseMetadata;
export const viewport = baseViewport;
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <SiteDocument lang={lang}>
      <AppProviders>{children}</AppProviders>
    </SiteDocument>
  );
}
