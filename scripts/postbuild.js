const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Running postbuild...");

const sitePath = path.join(".next", "server", "app");
const outputPath = path.join("public", "_pagefind");

if (!fs.existsSync(sitePath)) {
  console.log("Pagefind skipped: .next/server/app not found.");
  process.exit(0);
}

try {
  execSync(
    `pagefind --site "${sitePath}" --output-path "${outputPath}"`,
    {
      stdio: "inherit",
      shell: true,
    }
  );
  console.log("Pagefind index created successfully.");
} catch (error) {
  console.error("Pagefind indexing failed:", error.message);
  process.exit(1);
}
