import nextra from "nextra";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withNextra = nextra({
  contentDirBasePath: "/docs",
  unstable_shouldAddLocaleToLinks: true,
});

export default withNextra({
  trailingSlash: true,
  experimental: {
    globalNotFound: true,
  },
  turbopack: {
    root: __dirname,
  },
  images: {
    unoptimized: true,
  },
  i18n: {
    locales: ["en", "ko"],
    defaultLocale: "ko",
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          destination: "/ko/",
        },
        {
          source: "/recap",
          destination: "https://dm-recap.vercel.app/recap",
        },
        {
          source: "/recap/:path*",
          destination: "https://dm-recap.vercel.app/recap/:path*",
        },
      ],
    };
  },
});
