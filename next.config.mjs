import nextra from "nextra";

// Set up Nextra with its configuration
const withNextra = nextra({
  // ... Add Nextra-specific options here
});

// Vercel 배포용: output: "export" 제거 (서버리스 방식)
// GitHub Pages 배포 시에는 output: "export" 필요
const isVercel = process.env.VERCEL === "1";

// Export the final Next.js config with Nextra included
export default withNextra({
  // Vercel에서는 서버리스 방식, 그 외에는 정적 내보내기
  ...(isVercel ? {} : { output: "export" }),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
});
