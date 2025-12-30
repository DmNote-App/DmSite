import { siteConfig } from "../seo.config";
import type { Metadata } from "next";
import { LandingContent } from "./LandingContent";

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
