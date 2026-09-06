import type { MetadataRoute } from "next";
import { getDocsRoutes } from "@/lib/docs";
import { absoluteUrl } from "./seo.config";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const docs = await getDocsRoutes();
  return ["/", "/en/", ...docs.map((page) => page.path)].map((path) => ({
    url: absoluteUrl(path),
  }));
}
