import nextra from "nextra";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withNextra = nextra({
  contentDirBasePath: "/docs",
});

export default withNextra({
  trailingSlash: true,
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
