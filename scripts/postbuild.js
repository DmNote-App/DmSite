const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const isVercel = process.env.VERCEL === "1";
const isWindows = process.platform === "win32";

console.log(
  `Running postbuild... (Vercel: ${isVercel}, Windows: ${isWindows})`
);

if (isVercel) {
  // Vercel 서버리스 방식: .next/server/app에서 인덱싱 → public/_pagefind로 출력
  console.log("Building pagefind index for Vercel (serverless)...");

  try {
    execSync(
      "pagefind --site .next/server/app --output-path public/_pagefind",
      {
        stdio: "inherit",
        shell: true,
      }
    );
    console.log("Pagefind index created successfully for Vercel!");
  } catch (error) {
    console.error("Pagefind indexing failed:", error.message);
    // Vercel에서 pagefind 실패해도 빌드는 계속 진행
  }
} else {
  // 로컬/GitHub Pages: out 디렉토리에서 인덱싱
  console.log("Building pagefind index for static export...");

  try {
    execSync("pagefind --site out --output-path out/_pagefind", {
      stdio: "inherit",
      shell: true,
    });

    // CNAME 복사
    const copyCmd = isWindows ? "copy CNAME out\\CNAME" : "cp CNAME out/CNAME";
    execSync(copyCmd, {
      stdio: "inherit",
      shell: true,
    });

    console.log("Pagefind index and CNAME created successfully!");
  } catch (error) {
    console.error("Postbuild failed:", error.message);
    process.exit(1);
  }
}
