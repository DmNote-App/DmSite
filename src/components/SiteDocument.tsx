import localFont from "next/font/local";
import Script from "next/script";
import "../app/globals.css";
import "nextra-theme-docs/style.css";
import { Head } from "nextra/components";
import type { Locale } from "@/lib/i18n";

// 자체 호스팅 + preload라 CSS를 파싱하기 전에 받기 시작한다
// CDN에 있을 때는 스타일시트를 읽고 나서야 URL을 발견해 229ms를 흘려보냈다
// 굵기 축이 400~700인 가변 폰트 한 벌로 쓰던 네 굵기를 모두 덮는다
const pretendard = localFont({
  src: "../app/fonts/PretendardVariable.subset.woff2",
  weight: "400 700",
  style: "normal",
  display: "swap",
  variable: "--font-pretendard",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "system-ui",
    "Apple SD Gothic Neo",
    "Noto Sans KR",
    "Malgun Gothic",
    "sans-serif",
  ],
});

export default function SiteDocument({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: Locale;
}) {
  return (
    <html
      lang={lang}
      dir="ltr"
      className={pretendard.variable}
      suppressHydrationWarning
    >
      <Head>
        <meta
          name="naver-site-verification"
          content="b249cc8c4fa1792f5e3b50b6a8e4ee6ebca3fd2d"
        />
      </Head>
      <body suppressHydrationWarning>
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K8GL2GC9');`,
          }}
        />
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K8GL2GC9"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {children}
      </body>
    </html>
  );
}
