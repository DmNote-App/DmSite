import type { ReactNode } from "react";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";
import { notFound } from "next/navigation";
import EditLinkFixer from "@/components/EditLink";
import { docsMetadata } from "../../seo.config";

export const metadata = docsMetadata;

const navbar = (
  <Navbar
    logo={
      <div className="flex items-center gap-2">
        <img
          src="/icon.ico"
          alt="DM Note Logo"
          className="h-6 w-6 rounded-md"
        />
        <b>DM Note</b>
      </div>
    }
    projectLink="https://github.com/DmNote-App/DmNote"
  />
);

const footer = <Footer className="dm-docs-footer">GPL 3.0 © DM Note.</Footer>;

const LOCALES = ["ko", "en"] as const;
type Locale = (typeof LOCALES)[number];

type LayoutProps = Readonly<{
  children: ReactNode;
  params: Promise<{
    lang: string;
  }>;
}>;

export default async function DocsLayout(props: LayoutProps) {
  const params = await props.params;
  const lang = params.lang as Locale;

  if (!LOCALES.includes(lang)) notFound();

  return (
    <div suppressHydrationWarning>
      <Layout
        pageMap={await getPageMap(`/${lang}`)}
        docsRepositoryBase={`https://github.com/DmNote-App/DmNote/tree/master/docs/content/${lang}`}
        editLink="Edit this page"
        navbar={navbar}
        footer={footer}
        i18n={[
          { locale: "ko", name: "한국어" },
          { locale: "en", name: "English" },
        ]}
      >
        <EditLinkFixer />
        {props.children}
      </Layout>
    </div>
  );
}
