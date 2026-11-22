import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Abgesprochene Links zu Partnerseiten muessen als nofollow gekennzeichnet sein.
// In Markdown geht das nicht, deshalb sind sie dort als HTML-Link geschrieben.
const dir = join(process.cwd(), 'src/content/wissen/articles');

test('Wissen-Artikel verlinken Partnerseiten nur mit rel="nofollow"', () => {
  const offen = [];
  for (const name of readdirSync(dir).filter((n) => n.endsWith('.md'))) {
    const src = readFileSync(join(dir, name), 'utf8');
    for (const m of src.matchAll(/\]\(https:\/\/(?:www\.)?(?:werkbank-rechner\.de|countrivo\.com)[^)]*\)/g)) offen.push(name + ': ' + m[0]);
    for (const m of src.matchAll(/<a\b[^>]*href="https:\/\/(?:www\.)?(?:werkbank-rechner\.de|countrivo\.com)[^"]*"[^>]*>/g)) {
      if (!/rel="[^"]*\bnofollow\b/.test(m[0])) offen.push(name + ': ' + m[0]);
    }
  }
  assert.deepEqual(offen, []);
});
