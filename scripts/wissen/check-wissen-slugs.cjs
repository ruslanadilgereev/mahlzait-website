/* eslint-disable no-console */
/**
 * Sanity check: ensure every ArticleMeta.slug has a matching markdown file
 * in src/content/wissen/articles (and no orphan markdowns).
 *
 * Usage:
 *   node scripts/wissen/check-wissen-slugs.cjs
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const MD_DIR = path.join(ROOT, "src", "content", "wissen", "articles");
const INDEX_FILE = path.join(ROOT, "src", "content", "wissen", "index.ts");

function main() {
  const mdFiles = new Set(
    fs
      .readdirSync(MD_DIR, { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.endsWith(".md"))
      .map((d) => d.name.replace(/\.md$/, ""))
  );

  const ts = fs.readFileSync(INDEX_FILE, "utf8");
  const slugs = Array.from(ts.matchAll(/slug:\s*"([^"]+)"/g)).map((m) => m[1]);

  const missingFiles = slugs.filter((s) => !mdFiles.has(s));
  const extraFiles = Array.from(mdFiles).filter((f) => !slugs.includes(f));

  console.log(`slugs: ${slugs.length}`);
  console.log(`markdown files: ${mdFiles.size}`);

  if (missingFiles.length) {
    console.log("\nMissing markdown files for slugs:");
    for (const s of missingFiles) console.log(`- ${s}`);
  }

  if (extraFiles.length) {
    console.log("\nOrphan markdown files (not registered in articlesMeta):");
    for (const f of extraFiles) console.log(`- ${f}`);
  }

  if (!missingFiles.length && !extraFiles.length) {
    console.log("\nOK: slugs and markdown files match.");
  } else {
    process.exitCode = 1;
  }
}

main();


