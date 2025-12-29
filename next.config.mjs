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
        // 정적 자산 프록시
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
        {
          source: "/recap/api/:path*",
          destination: "https://dm-recap.vercel.app/api/:path*",
        },
        // 페이지 라우팅
        {
          source: "/recap",
          has: [{ type: "query", key: "nickname" }],
          destination: "https://dm-recap.vercel.app/recap",
        },
        {
          source: "/recap",
          destination: "https://dm-recap.vercel.app/",
        },
      ],
    };
  },
});
