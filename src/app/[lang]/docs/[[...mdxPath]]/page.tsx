import { notFound } from "next/navigation";
import { getDocsComponents } from "@/components/DocsContent";
import StructuredData from "@/components/StructuredData";
import { documentLanguagePaths, getDocument, getDocsRoutes } from "@/lib/docs";
import { docsPath, homePath, isLocale } from "@/lib/i18n";
import { absoluteUrl, createPageMetadata, documentTitle, siteConfig } from "../../../seo.config";

type PageProps = {
  params: Promise<{ mdxPath?: string[]; lang: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams({ params }: { params: { lang: string } }) {
  const routes = await getDocsRoutes();
  return routes.filter((route) => route.locale === params.lang)
    .map((route) => ({ mdxPath: route.segments }));
}

export async function generateMetadata({ params }: PageProps) {
  const { lang, mdxPath = [] } = await params;
  if (!isLocale(lang)) notFound();
  const slug = mdxPath.join("/");
  const { metadata } = await getDocument(lang, slug);
  return createPageMetadata({
    title: documentTitle(metadata.title),
    description: metadata.description || (lang === "ko" ? "DM NOTE 사용 가이드" : "DM NOTE documentation"),
    path: docsPath(lang, slug),
    locale: lang,
    languagePaths: await documentLanguagePaths(slug),
  });
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  const { lang, mdxPath = [] } = params;
  if (!isLocale(lang)) notFound();
  const slug = mdxPath.join("/");
  const { default: MDXContent, toc, metadata, sourceCode } = await getDocument(lang, slug);
  const components = getDocsComponents(lang);
  const Wrapper = components.wrapper;
  const breadcrumbs = [
    { name: siteConfig.name, item: absoluteUrl(homePath(lang)) },
    { name: lang === "ko" ? "문서" : "Documentation", item: absoluteUrl(docsPath(lang)) },
    ...(slug ? [{ name: metadata.title, item: absoluteUrl(docsPath(lang, slug)) }] : []),
  ];

  return (
    <>
      <StructuredData data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((item, index) => ({
          "@type": "ListItem", position: index + 1, ...item,
        })),
      }} />
      <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
        <MDXContent {...props} params={params} components={components} />
      </Wrapper>
    </>
  );
}
