import nextra from "nextra";

const withNextra = nextra({});

export default withNextra({
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/recap",
          has: [{ type: "query", key: "nickname" }],
          destination: "https://dm-recap.vercel.app/recap",
        },
        {
          source: "/recap",
          destination: "https://dm-recap.vercel.app/",
        },
        {
          source: "/recap/_next/:path*",
          destination: "https://dm-recap.vercel.app/_next/:path*",
        },
        {
          source: "/recap/assets/:path*",
          destination: "https://dm-recap.vercel.app/assets/:path*",
        },
        {
          source: "/recap/fonts/:path*",
          destination: "https://dm-recap.vercel.app/fonts/:path*",
        },
      ],
    };
  },
});
