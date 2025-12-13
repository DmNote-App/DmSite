import type { Metadata, Viewport } from "next";

export const siteConfig = {
  url: "https://dmnote.app",
  name: "DM Note",
  title: "DM Note - Custom Key Viewer",
  description:
    "강력한 커스터마이징을 지원하는 키뷰어",
  keywords: [
    "키뷰어",
    "key viewer",
    "DJMAX",
    "리듬게임",
    "스트리밍",
    "OBS",
    "키 입력",
    "DM Note",
  ],
  authors: [{ name: "DM Note" }],
  creator: "DM Note",
  locale: "ko_KR",
  icon: "/icon.ico",
} as const;

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [...siteConfig.authors],
  creator: siteConfig.creator,
  icons: {
    icon: siteConfig.icon,
    shortcut: siteConfig.icon,
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.icon,
        width: 256,
        height: 256,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.icon],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "theme-color": "#000000",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const docsMetadata: Metadata = {
  title: {
    default: `${siteConfig.name} 문서`,
    template: `%s`,
  },
  description:
    "DM Note API 레퍼런스",
  openGraph: {
    title: `${siteConfig.name} 문서`,
    description:
      "DM Note API 레퍼런스",
  },
};

export const baseViewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};
