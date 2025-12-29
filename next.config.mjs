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
        // nickname 쿼리가 있으면 결과 페이지로
        {
          source: "/recap",
          has: [{ type: "query", key: "nickname" }],
          destination: "https://dm-recap.vercel.app/recap",
        },
        // 쿼리 없으면 메인 페이지로
        {
          source: "/recap",
          destination: "https://dm-recap.vercel.app/",
        },
        // API 프록시 추가
        {
          source: "/recap/api/:path*",
          destination: "https://dm-recap.vercel.app/api/:path*",
        },
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
      ],
    };
  },
});
