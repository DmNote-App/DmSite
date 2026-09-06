import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { generateStaticParamsFor, importPage } from "nextra/pages";
import { docsPath, isLocale, type Locale } from "./i18n";

const generateParams = generateStaticParamsFor("mdxPath");

export const getDocsRoutes = cache(async () => {
  const params = await generateParams();
  return params.map((param) => {
    if (!isLocale(param.lang) || !Array.isArray(param.mdxPath)) {
      throw new Error("문서 경로의 언어와 경로 조각을 확인할 수 없습니다");
    }
    const segments = param.mdxPath.filter(Boolean);
    return {
      locale: param.lang,
      slug: segments.join("/"),
      segments,
      path: docsPath(param.lang, segments.join("/")),
    };
  });
});

export const getDocument = cache(async (locale: Locale, slug: string) => {
  const routes = await getDocsRoutes();
  const route = routes.find((item) => item.locale === locale && item.slug === slug);
  if (!route) notFound();
  return importPage(route.segments, locale);
});

export async function documentLanguagePaths(slug: string) {
  const routes = await getDocsRoutes();
  const languagePaths: Partial<Record<Locale | "x-default", string>> = Object.fromEntries(
    routes.filter((item) => item.slug === slug).map((item) => [item.locale, item.path]),
  );
  const fallback = languagePaths.ko ?? languagePaths.en;
  if (fallback) languagePaths["x-default"] = fallback;
  return languagePaths;
}
