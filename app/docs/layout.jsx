import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import { docsMetadata } from "../seo.config";
import EditLinkFixer from "@/app/components/EditLink";

export const metadata = docsMetadata;

const banner = <Banner storageKey="some-key">Nextra 4.0 is released 🎉</Banner>;
const navbar = (
  <Navbar
    logo={
      <div className="flex items-center gap-2">
        <img
          src="/icon.ico"
          alt="DM Note Logo"
          className="w-6 h-6 rounded-md"
        />
        <b>DM Note</b>
      </div>
    }
    projectLink="https://github.com/DmNote-App/DmNote"
  />
);
const footer = (
  <Footer className="dm-docs-footer">
    GPL 3.0 {new Date().getFullYear()} © DM Note.
  </Footer>
);

export default async function DocsLayout({ children }) {
  return (
    <Layout
      // banner={banner}
      navbar={navbar}
      pageMap={await getPageMap()}
      docsRepositoryBase="https://github.com/DmNote-App/DmNote/tree/master/docs/plugin"
      editLink="Edit this page"
      footer={footer}
    >
      <EditLinkFixer />
      {children}
    </Layout>
  );
}
