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
