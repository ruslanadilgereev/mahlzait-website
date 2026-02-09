const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "public");
const SVG_PATH = path.join(PUBLIC, "favicon.svg");

async function main() {
  const svgBuffer = fs.readFileSync(SVG_PATH);

  // Generate all needed PNG sizes
  const sizes = [16, 32, 48, 72, 96, 128, 144, 150, 152, 180, 192, 384, 512, 1024];
  for (const size of sizes) {
    const outPath = path.join(PUBLIC, `favicon-${size}x${size}.png`);
    await sharp(svgBuffer).resize(size, size).png().toFile(outPath);
    console.log(`Created ${path.basename(outPath)}`);
  }

  // Generate logo-1024x1024.png (referenced in Layout.astro for apple-touch-icon)
  const logo1024Path = path.join(PUBLIC, "logo-1024x1024.png");
  fs.copyFileSync(path.join(PUBLIC, "favicon-1024x1024.png"), logo1024Path);
  console.log("Created logo-1024x1024.png");

  // Generate apple-touch-icon (180x180)
  const appleTouchPath = path.join(PUBLIC, "apple-touch-icon.png");
  fs.copyFileSync(path.join(PUBLIC, "favicon-180x180.png"), appleTouchPath);
  console.log("Created apple-touch-icon.png");

  // Generate mstile-150x150.png for Windows
  const mstilePath = path.join(PUBLIC, "mstile-150x150.png");
  fs.copyFileSync(path.join(PUBLIC, "favicon-150x150.png"), mstilePath);
  console.log("Created mstile-150x150.png");

  // Generate favicon.ico using png-to-ico (ESM dynamic import)
  const pngToIco = await import("png-to-ico");
  const icoConvert = pngToIco.default;
  const icoBuffer = await icoConvert([
    path.join(PUBLIC, "favicon-16x16.png"),
    path.join(PUBLIC, "favicon-32x32.png"),
    path.join(PUBLIC, "favicon-48x48.png"),
  ]);
  fs.writeFileSync(path.join(PUBLIC, "favicon.ico"), icoBuffer);
  console.log("Created favicon.ico");

  console.log("\nAll favicon files generated successfully!");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
