import { siteConfig } from "../seo.config";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

// 동적 import로 초기 JS 번들 크기 감소 및 로드 분산
const LandingContent = dynamic(
  () => import("./LandingContent").then((mod) => mod.LandingContent),
  { 
    ssr: true,  // SEO를 위해 SSR 유지
  }
);

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export default function LandingPage() {
  return <LandingContent />;
}
