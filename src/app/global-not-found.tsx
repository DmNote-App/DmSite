import SiteDocument from "@/components/SiteDocument";
import { baseMetadata, baseViewport } from "./seo.config";

export const metadata = {
  ...baseMetadata,
  title: "404 | DM NOTE",
};
export const viewport = baseViewport;

export default function GlobalNotFound() {
  return (
    <SiteDocument lang="ko">
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
        <h1 className="text-4xl font-semibold">404</h1>
        <p>페이지를 찾을 수 없습니다.</p>
        <p lang="en">This page could not be found.</p>
        <nav className="flex gap-6" aria-label="홈페이지">
          <a className="underline underline-offset-4" href="/" hrefLang="ko">한국어 홈</a>
          <a className="underline underline-offset-4" href="/en/" hrefLang="en" lang="en">English home</a>
        </nav>
      </main>
    </SiteDocument>
  );
}
