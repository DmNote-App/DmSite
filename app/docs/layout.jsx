import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

const banner = <Banner storageKey="some-key">Nextra 4.0 is released 🎉</Banner>;
const navbar = (
  <Navbar
    logo={<b>DM Note</b>}
    projectLink="https://github.com/DmNote-App/DmNote"
  />
);
const footer = <Footer>GPL 3.0 {new Date().getFullYear()} © DM Note.</Footer>;

export default async function DocsLayout({ children }) {
  return (
    <Layout
      banner={banner}
      navbar={navbar}
      pageMap={await getPageMap()}
      docsRepositoryBase="https://github.com/DmNote-App/DmNote"
      footer={footer}
    >
      {children}
    </Layout>
  );
}
