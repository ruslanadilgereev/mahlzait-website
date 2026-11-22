// /kaloriendefizit-berechnen/ (Keyword-Recherche vom 22.11.2026): Formel,
// Beispielrechnungen und eine sichtbare FAQ mit FAQPage-Schema. Die Beispiele
// müssen zur Rechnung des Rechners passen (Mifflin-St Jeor, Faktor, 7.700 kcal/kg).
// Prüft das gebaute dist/ (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  faqFromSchema,
  pageExists,
  readPage,
  visibleText,
} from "./dist-html.mjs";

const html = readPage("/kaloriendefizit-berechnen/");
const text = visibleText(html);
const de = (value) => Math.round(value).toLocaleString("de-DE");

// Unabhängig nachgerechnet: Mifflin MD et al., Am J Clin Nutr 1990;51:241-247.
function grundumsatz({ female, weight, height, age }) {
  return 10 * weight + 6.25 * height - 5 * age + (female ? -161 : 5);
}

test("die Formel steht sichtbar auf der Seite", () => {
  assert.ok(
    text.includes("So berechnest du dein Kaloriendefizit"),
    "Abschnitt fehlt",
  );
  assert.ok(
    text.includes(
      "Frauen: 10 × Gewicht in kg + 6,25 × Größe in cm - 5 × Alter in Jahren - 161",
    ),
  );
  assert.ok(
    text.includes(
      "Männer: 10 × Gewicht in kg + 6,25 × Größe in cm - 5 × Alter in Jahren + 5",
    ),
  );
  assert.ok(text.includes("Defizit × 7 ÷ 7.700 kcal"));
});

test("die Beispielrechnungen passen zur Formel", () => {
  const beispiele = [
    {
      person: "Frau, 35 Jahre, 168 cm, 75 kg",
      female: true,
      age: 35,
      height: 168,
      weight: 75,
      factor: 1.375,
      label: "leicht aktiv (1,375)",
    },
    {
      person: "Frau, 35 Jahre, 168 cm, 75 kg",
      female: true,
      age: 35,
      height: 168,
      weight: 75,
      factor: 1.55,
      label: "3 bis 5 Mal Sport pro Woche (1,55)",
    },
    {
      person: "Mann, 40 Jahre, 182 cm, 92 kg",
      female: false,
      age: 40,
      height: 182,
      weight: 92,
      factor: 1.55,
      label: "3 bis 5 Mal Sport pro Woche (1,55)",
    },
  ];
  for (const b of beispiele) {
    const bmr = grundumsatz(b);
    const tdee = Math.round(bmr * b.factor);
    const zeile = `${b.person} ${b.label} ${de(bmr)} kcal ${de(tdee)} kcal ${de(tdee - 500)} kcal`;
    assert.ok(text.includes(zeile), `Zeile fehlt oder stimmt nicht: ${zeile}`);
  }
  // Das Zahlenbeispiel in der FAQ ist die erste Zeile der Tabelle.
  const faqBeispiel = faqFromSchema(html).find(
    (f) => f.question === "Wie berechne ich mein Kaloriendefizit?",
  );
  assert.ok(faqBeispiel, "FAQ zur Berechnung fehlt");
  for (const wert of ["1.464 kcal", "2.013 kcal", "1.513 kcal"]) {
    assert.ok(
      faqBeispiel.answer.includes(wert),
      `${wert} fehlt in der FAQ-Antwort`,
    );
  }
});

test("FAQ: sichtbar und wortgleich mit dem FAQPage-Schema", () => {
  const faq = faqFromSchema(html);
  assert.ok(faq.length >= 5, `nur ${faq.length} Fragen im Schema`);
  for (const { question, answer } of faq) {
    assert.ok(text.includes(question), `Frage nicht sichtbar: ${question}`);
    assert.ok(text.includes(answer), `Antwort nicht sichtbar: ${question}`);
  }
  const fragen = faq.map((f) => f.question);
  for (const frage of [
    "Was ist ein Kaloriendefizit?",
    "Wie groß sollte mein Kaloriendefizit sein?",
    "Kaloriendefizit berechnen als Frau: Was ist anders?",
    "Warum nehme ich trotz Kaloriendefizit nicht ab?",
  ]) {
    assert.ok(fragen.includes(frage), `Frage fehlt: ${frage}`);
  }
});

test("die FAQ verweist auf den Wissen-Artikel, und der Artikel ist gebaut", () => {
  const route = "/wissen/trotz-kaloriendefizit-nicht-abnehmen-gruende/";
  assert.ok(html.includes(`href="${route}"`), "Link auf den Artikel fehlt");
  assert.ok(pageExists(route), "Artikel ist nicht gebaut");
});

test("Quellen mit DOI, keine kaputten Umlaute mehr", () => {
  for (const doi of [
    "10.1093/ajcn/51.2.241",
    "10.1055/a-1030-5207",
    "10.1038/ijo.2013.51",
    "10.1056/NEJM199212313272701",
  ]) {
    assert.ok(html.includes(`https://doi.org/${doi}`), `Quelle fehlt: ${doi}`);
  }
  for (const kaputt of [
    "Aktülles",
    "Daür",
    "mühleos",
    "Grösse",
    "zürst",
    "schuetzt",
  ]) {
    assert.ok(!html.includes(kaputt), `${kaputt} steht noch auf der Seite`);
  }
});
