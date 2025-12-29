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
        // 정적 자산 프록시 (CSS, JS, 폰트 등) 
        {
          source: "/_next/:path*",
          destination: "https://dm-recap.vercel.app/_next/:path*",
        },
        {
          source: "/assets/:path*",
          destination: "https://dm-recap.vercel.app/assets/:path*",
        },
        {
          source: "/api/image-proxy",
          destination: "https://dm-recap.vercel.app/api/image-proxy",
        },
        // 페이지 프록시
        {
          source: "/recap",
          destination: "https://dm-recap.vercel.app/",
        },
        {
          source: "/recap/:path*",
          destination: "https://dm-recap.vercel.app/:path*",
        },
      ],
    };
  },
});