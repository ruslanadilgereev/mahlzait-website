// Döner-Kalorien-Rechner (/doener-kalorien-rechner/) und die Döner-Seiten unter
// /kalorien/ nannten Werte, die laut Commit 78b7cba aus FDDB und YAZIO stammten
// (Döner mit Kalbfleisch 650 kcal, Dürüm 700, Box bis 1.000). Seit 22.11.2026
// setzt src/modules/doener/rezepte.ts jede Variante aus Zutaten mit festen
// Grammangaben zusammen; alle Nährwerte je 100 g stammen aus USDA FoodData
// Central (FDC), gelesen über die FDC-API. Der Test prüft die Zutaten gegen die
// FDC-Werte, die Rezeptrechnung, die sieben Döner-Seiten unter /kalorien/ und
// die gebauten Seiten (vorher pnpm build).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  faqFromSchema,
  jsonLd,
  readPage,
  readRepoFile,
  visibleText,
} from "./dist-html.mjs";

// Der lokale Build unter Windows schreibt vereinzelt NUL-Bytes vor Umlaute und
// andere Mehrbyte-Zeichen (beim Streaming der React-Inseln); die Live-Seiten
// sind frei davon. Dieser Test prüft Inhalte, deshalb fallen NUL-Bytes vorher weg.
const NUL = String.fromCharCode(0);
const seite = (route) => readPage(route).split(NUL).join("");

// Dynamisch, damit jeder Test einzeln scheitert, wenn das Modul fehlt.
const R = await import("../src/modules/doener/rezepte.ts").catch(() => null);
const brauchtRezepte = () =>
  assert.ok(R, "src/modules/doener/rezepte.ts fehlt");

// Werte je 100 g laut FDC-API (22.11.2026): kcal, Eiweiß, Kohlenhydrate, Fett
const fdc = {
  174915: [275, 9.1, 55.7, 1.2],
  175037: [306, 8.2, 49.38, 7.99],
  2709077: [137, 3.29, 24.1, 3.03],
  170698: [312, 3.43, 41.44, 14.73],
  169248: [14, 0.9, 2.97, 0.14],
  170457: [18, 0.88, 3.89, 0.2],
  169977: [31, 1.43, 7.37, 0.16],
  168409: [15, 0.65, 3.63, 0.11],
  170000: [40, 1.1, 9.34, 0.1],
  174032: [250, 25.93, 0, 15.41],
  172388: [179, 24.76, 0, 8.15],
  172544: [283, 24.75, 0, 19.65],
  172455: [333, 13.31, 31.84, 17.8],
  2705448: [91, 5.22, 4.1, 6],
  171284: [61, 3.47, 4.66, 3.25],
  171009: [680, 0.96, 0.57, 74.85],
  169230: [149, 6.36, 33.06, 0.5],
  170416: [36, 2.97, 6.33, 0.79],
  171402: [379, 1.09, 14.64, 35.06],
  171186: [93, 1.93, 19.16, 0.93],
  171241: [356, 24.94, 2.22, 27.44],
  173420: [265, 14.21, 3.88, 21.49],
  2472184: [321, 21.43, 3.57, 25],
  170459: [82, 4.32, 18.91, 0.47],
  170108: [26, 0.99, 6.03, 0.3],
};
const STRICH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");

test("jede Zutat entspricht ihrem FDC-Eintrag", () => {
  brauchtRezepte();
  const ids = Object.values(R.zutaten)
    .map((z) => z.fdcId)
    .sort();
  assert.deepEqual(ids, Object.keys(fdc).map(Number).sort());
  for (const z of Object.values(R.zutaten)) {
    assert.deepEqual([z.kcal, z.protein, z.kh, z.fett], fdc[z.fdcId], z.name);
  }
  assert.deepEqual(
    [R.bigMac.fdcId, R.bigMac.kcal, R.bigMac.gramm],
    [170720, 257, 219],
  );
  assert.equal(R.bigMacKcal, 563);
  assert.deepEqual(
    [R.kalbshackMager.fdcId, R.kalbshackMager.kcal],
    [175291, 172],
  );
});

test("die Rezeptrechnung ergibt die Werte der Tabelle", () => {
  brauchtRezepte();
  const m = R.auswahl;
  const werte = (a) => {
    const p = R.portion(a);
    return [p.gramm, p.kcal, p.protein, p.kh, p.fett];
  };
  // Standard: 120 g Fladenbrot, 70 g Salat, 130 g Rinderhack, 30 g Tzatziki
  assert.deepEqual(werte(R.STANDARD), [350, 696, 47, 71, 23]);
  assert.deepEqual(werte(m("classic", "haehnchen")), [350, 604, 45, 71, 14]);
  assert.deepEqual(werte(m("dueruem", "kalb")), [347, 724, 46, 62, 31]);
  assert.deepEqual(werte(m("box", "kalb")), [314, 833, 41, 65, 45]);
  assert.deepEqual(werte(m("teller", "kalb")), [466, 655, 43, 55, 28]);
  assert.deepEqual(werte(m("salatteller", "kalb")), [310, 383, 37, 8, 22]);
  assert.deepEqual(werte(m("vegetarisch")), [305, 655, 24, 98, 18]);
  // Soßen je 30 g und Extras als feste Mengen
  assert.deepEqual(
    R.saucen.map((s) => [s.id, R.sauceKcal(s.id)]),
    [
      ["joghurt", 27],
      ["knoblauch", 107],
      ["cocktail", 114],
      ["scharf", 28],
      ["krauter", 67],
      ["ohne", 0],
    ],
  );
  assert.deepEqual(
    R.extras.map((e) => [e.id, R.extraKcal(e.id)]),
    [
      ["kaese", 107],
      ["pommes", 222],
      ["halloumi", 161],
      ["schafkaese", 80],
    ],
  );
  // Der Portionsregler skaliert Brot, Salat und Fleisch, nicht die Soße.
  const gross = R.berechne(m("classic", "kalb", ["joghurt"], [], 150));
  assert.equal(Math.round(gross.sauce.kcal), 27);
  assert.equal(Math.round(gross.gesamt.kcal), 1031);
});

// Variantennamen der Food-Seiten und ihre Zusammenstellung im Rechner
const seiten = () => {
  const m = R.auswahl;
  const S = R.STANDARD;
  const p = (a) => R.portion(a);
  return {
    doener: {
      standard: S,
      varianten: {
        "Döner Kebab (Kalb/Rind)": S,
        "Döner Kebab (Hähnchen)": m("classic", "haehnchen"),
        "Dürüm (Yufka)": m("dueruem", "kalb"),
        "Döner Teller mit Salat": m("salatteller", "kalb"),
        "Lahmacun mit Dönerfleisch": m("lahmacun", "kalb"),
        "Döner mit Falafel (vegetarisch)": m("vegetarisch"),
        "Döner mit Käse": m("classic", "kalb", ["joghurt"], ["kaese"]),
        "Kinder-Döner (klein)": m("classic", "kalb", ["joghurt"], [], 60),
      },
      vergleich: {
        "Döner Box mit Pommes": p(m("box", "kalb")).kcal,
        "Big Mac": R.bigMacKcal,
      },
    },
    "doener-box": {
      standard: m("box", "kalb"),
      varianten: {
        "Döner Box mit Pommes": m("box", "kalb"),
        "Döner Box mit Reis": m("boxReis", "kalb"),
        "Döner Box mit Salat": m("salatteller", "kalb"),
        "Döner Box Hähnchen": m("box", "haehnchen"),
        "Döner Box mit Käse überbacken": m(
          "box",
          "kalb",
          ["joghurt"],
          ["kaese"],
        ),
        "Döner Box Vegetarisch (Falafel)": m("box", "falafel"),
        "Döner Box XL": m("box", "kalb", ["joghurt"], [], 150),
      },
      vergleich: { "Döner Kebab": p(S).kcal },
    },
    "doener-teller": {
      standard: m("teller", "kalb"),
      varianten: {
        "Döner Teller mit Reis": m("teller", "kalb"),
        "Döner Teller mit Pommes": m("tellerPommes", "kalb"),
        "Döner Teller mit Salat": m("salatteller", "kalb"),
        "Döner Teller mit Reis und zwei Soßen": m("teller", "kalb", [
          "joghurt",
          "knoblauch",
        ]),
        "Hähnchen Döner Teller": m("teller", "haehnchen"),
        "Döner Teller vegetarisch (Falafel)": m("teller", "falafel"),
      },
      vergleich: {
        "Döner Kebab (im Brot)": p(S).kcal,
        "Dürüm Döner": p(m("dueruem", "kalb")).kcal,
        "Döner Box": p(m("box", "kalb")).kcal,
      },
    },
    duerrum: {
      standard: m("dueruem", "kalb"),
      varianten: {
        "Dürüm Döner (Kalb/Rind)": m("dueruem", "kalb"),
        "Dürüm Hähnchen": m("dueruem", "haehnchen"),
        "Dürüm Lamm": m("dueruem", "lamm"),
        "Dürüm Falafel": m("dueruem", "falafel"),
        "Dürüm mit Käse": m("dueruem", "kalb", ["joghurt"], ["kaese"]),
        "Dürüm mit Knoblauchsoße": m("dueruem", "kalb", ["knoblauch"]),
        "Dürüm XL (Portionsgröße 150 %)": m(
          "dueruem",
          "kalb",
          ["joghurt"],
          [],
          150,
        ),
      },
      vergleich: { "Döner Kebab (im Brot)": p(S).kcal },
    },
    "durum-kebab": {
      standard: m("dueruem", "kalb"),
      varianten: {
        "Dürüm klein (252g)": m("dueruem", "kalb", ["joghurt"], [], 70),
        "Dürüm normal (347g)": m("dueruem", "kalb"),
        "Dürüm groß (442g)": m("dueruem", "kalb", ["joghurt"], [], 130),
        "Dürüm XXL (506g)": m("dueruem", "kalb", ["joghurt"], [], 150),
        "Dürüm mit Hähnchen (347g)": m("dueruem", "haehnchen"),
        "Veggie-Dürüm mit Falafel (302g)": m("dueruem", "falafel"),
        "Dürüm ohne Sauce (317g)": m("dueruem", "kalb", []),
      },
      vergleich: { "Döner im Brot": p(S).kcal },
    },
    kebab: {
      standard: S,
      varianten: {
        "Kebab klein (222g)": m("classic", "kalb", ["joghurt"], [], 60),
        "Kebab Standard (350g)": S,
        "Kebab groß (446g)": m("classic", "kalb", ["joghurt"], [], 130),
        "Kebab-Box ohne Brot (310g)": m("salatteller", "kalb"),
        "Kebab-Teller mit Reis (466g)": m("teller", "kalb"),
        "Hähnchen-Kebab (350g)": m("classic", "haehnchen"),
        "Veggie-Kebab mit Falafel (305g)": m("vegetarisch"),
      },
      vergleich: { Dürüm: p(m("dueruem", "kalb")).kcal },
    },
    "vegetarischer-doener": {
      standard: m("vegetarisch"),
      varianten: {
        "Vegetarischer Döner klein (223g)": m(
          "vegetarisch",
          undefined,
          ["joghurt"],
          [],
          70,
        ),
        "Vegetarischer Döner mit Falafel (305g)": m("vegetarisch"),
        "Vegetarischer Döner groß (388g)": m(
          "vegetarisch",
          undefined,
          ["joghurt"],
          [],
          130,
        ),
        "Falafel-Dürüm (302g)": m("dueruem", "falafel"),
        "Döner mit Grillkäse / Halloumi (320g)": m("classic", "halloumi"),
        "Veggie-Döner ohne Sauce (275g)": m("vegetarisch", undefined, []),
      },
      vergleich: {
        "Döner (mit Fleisch)": p(S).kcal,
        "Dürüm vegetarisch": p(m("dueruem", "falafel")).kcal,
      },
    },
  };
};
const lade = (slug) => JSON.parse(readRepoFile(`src/data/foods/${slug}.json`));
const fdcIdsVon = (a) => {
  const art = R.art(a.art);
  const teile = [
    ...art.basis.flatMap((k) => k.teile),
    ...R.fuellung(art.fuellung ?? a.fuellung).teile,
    ...a.saucen.flatMap((s) => R.sauce(s).teile),
    ...a.extras.flatMap((e) => R.extra(e).teile),
  ];
  return teile.map((b) => R.zutaten[b.zutat].fdcId);
};

test("die Döner-Seiten unter /kalorien/ zeigen die Werte der Rezeptrechnung", () => {
  brauchtRezepte();
  for (const [slug, seite] of Object.entries(seiten())) {
    const food = lade(slug);
    const je100 = R.je100g(seite.standard);
    const portion = R.portion(seite.standard);
    assert.deepEqual(
      [
        food.overview.calories_per_100g,
        food.overview.protein_per_100g,
        food.overview.carbs_per_100g,
        food.overview.fat_per_100g,
        food.overview.fiber_per_100g,
        food.overview.typical_portion_g,
      ],
      [
        je100.kcal,
        je100.protein,
        je100.kh,
        je100.fett,
        je100.ballaststoffe,
        portion.gramm,
      ],
      slug + " overview",
    );
    for (const [name, a] of Object.entries(seite.varianten)) {
      const v = food.variants.find((x) => x.name === name);
      assert.ok(v, slug + ": Variante fehlt: " + name);
      const p = R.portion(a);
      assert.deepEqual(
        [v.portion_g, v.calories, v.protein, v.carbs, v.fat],
        [p.gramm, p.kcal, p.protein, p.kh, p.fett],
        slug + ": " + name,
      );
      for (const id of fdcIdsVon(a))
        assert.ok(
          food.source.includes(String(id)),
          slug + ": source ohne FDC-ID " + id,
        );
    }
    for (const [name, kcal] of Object.entries(seite.vergleich)) {
      assert.equal(
        food.comparison.find((c) => c.name === name)?.calories,
        kcal,
        slug + ": Vergleich " + name,
      );
    }
    assert.match(
      food.source,
      /^USDA FoodData Central \(FDC-API, 22\.11\.2026\), Rezeptrechnung/,
    );
    assert.ok(
      food.faq[0].answer.includes(portion.kcal + " kcal"),
      slug + ": erste FAQ ohne " + portion.kcal + " kcal",
    );
    assert.doesNotMatch(
      JSON.stringify(food),
      STRICH,
      slug + ": Gedankenstrich",
    );
  }
  // Zusatzzeilen der vegetarischen Seite: Falafel allein und je 100 g
  const veg = lade("vegetarischer-doener");
  const falafel = fdc[172455].map((w) => Math.round((w * 85) / 100));
  const pur = veg.variants.find((v) => v.name === "Falafel pur (5 Stück, 85g)");
  assert.deepEqual(
    [pur.portion_g, pur.calories, pur.protein, pur.carbs, pur.fat],
    [85, ...falafel],
  );
  const pro100 = veg.variants.find((v) => v.name === "Pro 100g");
  assert.equal(pro100.calories, R.je100g(R.auswahl("vegetarisch")).kcal);
});

test("die alten FDDB/YAZIO-Werte stehen auf keiner Döner-Seite mehr", () => {
  assert.equal(lade("doener").overview.calories_per_100g, 199);
  assert.equal(lade("doener-box").overview.calories_per_100g, 265);
  assert.equal(
    lade("durum-kebab").variants.find((v) => v.name.startsWith("Dürüm normal"))
      .calories,
    724,
  );
  assert.equal(
    lade("kebab").variants.find((v) => v.name.startsWith("Kebab Standard"))
      .calories,
    696,
  );
  assert.equal(lade("vegetarischer-doener").overview.typical_portion_g, 305);
  const modul = readRepoFile("src/modules/doener/index.tsx");
  assert.doesNotMatch(modul, /calorieModifier|baseCalories|550 bis 750/);
});

test("die gebaute Rechner-Seite zeigt Tabelle, Quellen und FAQ aus der Rechnung", () => {
  const html = seite("/doener-kalorien-rechner/");
  const text = visibleText(html);
  // Tabelle: Standard-Döner und Box
  assert.ok(
    text.includes("Döner Kebab, Kalb/Rind 350 g 696 47 g 71 g 23 g"),
    "Tabellenzeile Standard",
  );
  assert.ok(
    text.includes("Döner-Box mit Pommes 314 g 833 41 g 65 g 45 g"),
    "Tabellenzeile Box",
  );
  assert.doesNotMatch(text, /je nach Imbiss 550 bis 750|rund 650 kcal/);
  // Quellenabschnitt mit Link auf jeden FDC-Eintrag, auch die Vergleichswerte
  // Big Mac (170720) und mageres Kalbshack (175291)
  assert.ok(text.includes("So rechnen wir: Zutaten, Mengen und Quellen"));
  for (const id of [...Object.keys(fdc), "170720", "175291"]) {
    assert.ok(
      html.includes(
        `href="https://fdc.nal.usda.gov/food-details/${id}/nutrients"`,
      ),
      "Link FDC " + id,
    );
  }
  // FAQ: Schema und sichtbarer Text sind dieselbe Liste
  const faq = faqFromSchema(html);
  assert.equal(faq.length, 7);
  for (const item of faq) {
    assert.ok(text.includes(item.question), item.question);
    assert.ok(text.includes(item.answer), item.answer);
    assert.doesNotMatch(item.answer, STRICH);
  }
  assert.ok(faq[0].answer.includes("696 kcal bei 350 g"), faq[0].answer);
  assert.ok(faq[4].answer.includes("563 kcal"), faq[4].answer);
  const naehrwerte = jsonLd(html).find(
    (b) => b["@type"] === "NutritionInformation",
  );
  assert.deepEqual(
    [
      naehrwerte.servingSize,
      naehrwerte.calories,
      naehrwerte.proteinContent,
      naehrwerte.carbohydrateContent,
      naehrwerte.fatContent,
    ],
    ["350g", "696 kcal", "47g", "71g", "23g"],
  );
  for (const block of jsonLd(html))
    assert.doesNotMatch(JSON.stringify(block), STRICH);
});

test("die gebauten Döner-Seiten zeigen Werte und FAQ aus den Daten", () => {
  // kcal je 100 g der Standardportion jeder Seite laut Rezeptrechnung
  const je100g = {
    doener: 199,
    "doener-box": 265,
    "doener-teller": 141,
    duerrum: 209,
    "durum-kebab": 209,
    kebab: 199,
    "vegetarischer-doener": 215,
  };
  for (const [slug, kcal] of Object.entries(je100g)) {
    const food = lade(slug);
    const html = seite(`/kalorien/${slug}/`);
    assert.ok(
      visibleText(html).includes("berechnet aus " + kcal + " kcal pro 100 g"),
      slug,
    );
    assert.deepEqual(faqFromSchema(html), food.faq, slug);
  }
});

test("Fast-Food-Übersicht: Spanne der Döner-Werte stimmt mit den Döner-Seiten", () => {
  const werte = [
    "doener",
    "doener-box",
    "doener-teller",
    "durum-kebab",
    "kebab",
    "vegetarischer-doener",
  ]
    .flatMap((slug) => lade(slug).variants)
    .filter((v) => !/^Pro 100g$|^Falafel pur/.test(v.name))
    .map((v) => v.calories);
  const min = Math.min(...werte);
  const max = Math.max(...werte);
  assert.ok(min > 350 && min < 400, "Minimum " + min);
  assert.ok(max > 1200 && max < 1300, "Maximum " + max);
  const text = visibleText(seite("/fastfood-kalorien/"));
  assert.ok(
    text.includes("von knapp 400 bis über 1.200 Kalorien"),
    "Spanne im Text",
  );
});
