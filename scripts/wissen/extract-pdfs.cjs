/* eslint-disable no-console */
/**
 * Extracts basic metadata + an abstract snippet from PDFs in src/modules/wissen.
 *
 * Usage (from repo root):
 *   node scripts/wissen/extract-pdfs.cjs
 *
 * Output:
 *   scripts/wissen/papers-extracted.json
 */

const fs = require("node:fs");
const path = require("node:path");
const { PDFParse } = require("pdf-parse");

const ROOT = process.cwd();
const PDF_DIR = path.join(ROOT, "src", "modules", "wissen");
const OUT_FILE = path.join(ROOT, "scripts", "wissen", "papers-extracted.json");

function listPdfFiles(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.toLowerCase().endsWith(".pdf"))
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b, "en"));
}

function cleanDoi(raw) {
  if (!raw) return null;
  return raw
    .trim()
    .replace(/^[^0-9]*?(10\.)/, "$1")
    .replace(/[)\].,;:]+$/, "");
}

function extractFirstMatch(text, regex) {
  const m = text.match(regex);
  return m ? m[1] : null;
}

function extractDoi(text) {
  const doiRegex = /(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)\b/gi;
  const m = doiRegex.exec(text);
  return m ? cleanDoi(m[1]) : null;
}

function normalizeText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Normalize multiple spaces but keep newlines for section matching
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractTitleGuess(text, infoTitle) {
  if (infoTitle && typeof infoTitle === "string") {
    const t = infoTitle.trim();
    if (t && t.length >= 10 && !/untitled|microsoft word/i.test(t)) return t;
  }

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Heuristic: take first "block" until a likely author/journal line appears.
  const block = [];
  for (const line of lines.slice(0, 40)) {
    if (/doi|pmid|clinicaltrials|copyright|issn/i.test(line)) break;
    if (/^abstract\b/i.test(line)) break;
    // stop when we hit a line that looks like author list
    if (/(,|\band\b).*\b(PhD|MD|RD|MSc|MS)\b/i.test(line)) break;
    block.push(line);
    if (block.join(" ").length > 180) break;
  }

  const candidate = block.join(" ").replace(/\s{2,}/g, " ").trim();
  if (candidate && candidate.length >= 12) return candidate;

  // Fallback: longest of first 20 lines
  const best = lines.slice(0, 25).reduce((acc, cur) => {
    if (
      cur.length > acc.length &&
      cur.length >= 12 &&
      !/^(page|copyright|author manuscript|http|www\.)/i.test(cur)
    ) {
      return cur;
    }
    return acc;
  }, "");
  return best || null;
}

function extractSection(text, startRegex, endRegex, maxLen = 3500) {
  const startMatch = startRegex.exec(text);
  if (!startMatch) return null;
  const startIdx = startMatch.index + startMatch[0].length;
  const rest = text.slice(startIdx);

  const endMatch = endRegex.exec(rest);
  const endIdx = endMatch ? endMatch.index : Math.min(rest.length, maxLen);

  return rest
    .slice(0, endIdx)
    .trim()
    .replace(/\n{3,}/g, "\n\n");
}

function extractAbstract(text) {
  const startRegexes = [
    /(^|\n)\s*Abstract\s*[:\n]\s*/i,
    /(^|\n)\s*ABSTRACT\s*[:\n]\s*/i,
  ];
  // Note: Don't stop at "Background/Methods/Results" because many abstracts are structured.
  const endRegex =
    /(^|\n)\s*(Introduction|INTRODUCTION|Keywords|Key words|Key Points|Trial registration|CLINICAL TRIAL REGISTRATION|Funding|Acknowledg|References)\b/i;

  for (const r of startRegexes) {
    const start = new RegExp(r.source, r.flags); // reset lastIndex
    const end = new RegExp(endRegex.source, endRegex.flags);
    const s = extractSection(text, start, end, 4500);
    if (s && s.length >= 200) return s;
  }

  return null;
}

async function main() {
  if (!fs.existsSync(PDF_DIR)) {
    console.error(`PDF directory not found: ${PDF_DIR}`);
    process.exit(1);
  }

  const files = listPdfFiles(PDF_DIR);
  if (files.length === 0) {
    console.log("No PDFs found.");
    return;
  }

  const results = [];

  for (const fileName of files) {
    const absPath = path.join(PDF_DIR, fileName);
    const buf = fs.readFileSync(absPath);

    let parsedText = "";
    let parsedInfo = null;
    try {
      const parser = new PDFParse({ data: buf });
      await parser.load();
      const info = await parser.getInfo().catch(() => null);
      const textRes = await parser.getText().catch(() => null);
      await parser.destroy().catch(() => {});

      parsedInfo = info;
      parsedText =
        textRes && typeof textRes.text === "string" ? textRes.text : "";
    } catch (e) {
      console.warn(`Failed to parse PDF: ${fileName}`);
      results.push({
        fileName,
        error: String(e && e.message ? e.message : e),
      });
      continue;
    }

    const text = normalizeText(parsedText || "");
    const doi = extractDoi(text);
    const pmid = extractFirstMatch(text, /PMID\s*[:\s]\s*(\d{6,10})/i);
    const nct = extractFirstMatch(text, /(NCT\d{8})/i);
    const infoTitle =
      parsedInfo && parsedInfo.info && typeof parsedInfo.info.Title === "string"
        ? parsedInfo.info.Title
        : null;
    const titleGuess = extractTitleGuess(text, infoTitle);
    const abstract = extractAbstract(text);

    results.push({
      fileName,
      titleGuess,
      doi,
      pmid,
      nct,
      // Keep these short to avoid massive JSON
      abstract: abstract ? abstract.slice(0, 5000) : null,
      textHead: text.slice(0, 2500),
    });

    console.log(
      `[ok] ${fileName} | doi=${doi || "-"} pmid=${pmid || "-"} nct=${nct || "-"}`
    );
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2), "utf8");
  console.log(`\nWrote ${results.length} entries to ${path.relative(ROOT, OUT_FILE)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


