import type { Metadata, Viewport } from "next";
import { translations } from "./[lang]/(site)/i18n/translations";
import { homePath, type Locale } from "@/lib/i18n";

export function siteDescription(locale: Locale): string {
  const { description, descriptionSub } = translations[locale].hero;
  return `${description} ${descriptionSub}`;
}

export const siteConfig = {
  url: "https://dmnote.app",
  name: "DM NOTE",
  title: "DM NOTE - Custom Key Viewer",
  description: siteDescription("ko"),
  icon: "/icon.ico",
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).href;
}

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  icons: { icon: siteConfig.icon, shortcut: siteConfig.icon },
  other: {
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  languagePaths: Partial<Record<Locale | "x-default", string>>;
};

export function createPageMetadata({
  title,
  description,
  path,
  locale,
  languagePaths,
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const image = {
    url: absoluteUrl("/share-logo.png"),
    width: 256,
    height: 256,
    type: "image/png",
    alt: locale === "ko" ? "DM NOTE 로고" : "DM NOTE logo",
  };

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        Object.entries(languagePaths).map(([lang, route]) => [lang, absoluteUrl(route)]),
      ),
    },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: locale === "ko" ? "ko_KR" : "en_US",
      url,
      siteName: siteConfig.name,
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [image],
    },
  };
}

export function homeMetadata(locale: Locale): Metadata {
  return createPageMetadata({
    title: siteConfig.title,
    description: siteDescription(locale),
    path: homePath(locale),
    locale,
    languagePaths: { ko: "/", en: "/en/", "x-default": "/" },
  });
}

export function documentTitle(title: string): string {
  return /\bdm\s*note\b/i.test(title) ? title : `${title} | ${siteConfig.name}`;
}

export const baseViewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};
