# Wissen-Artikel Workflow (Papers -> SEO-Seite)

Dieses Repo rendert Forschungsartikel als statische Seiten unter `/wissen/<slug>/`.
Damit SEO (Title/Description, Canonical, OpenGraph, JSON-LD, Sitemap) automatisch korrekt ist, muessen zwei Dinge stimmen:

- **Markdown-Artikel** in `src/content/wissen/articles/<slug>.md`
- **Meta-Eintrag** in `src/content/wissen/index.ts` (`articlesMeta`)

Optional (aber empfohlen): Lege auch das PDF unter `src/modules/wissen/` ab, damit wir DOI/Titel/Abstract automatisiert extrahieren koennen.

---

## 1) Datei-Namen / Slug Konvention

- **Dateiname = Slug**: `src/content/wissen/articles/<slug>.md`
- **Nur ASCII**, alles klein, mit `-`:
  - `ernaehrung` statt `ernährung`
  - `kalorien` statt `kalorien`
  - `ä/ö/ü` statt ae oe ue
  - keine Sonderzeichen

Beispiel:

- Datei: `src/content/wissen/articles/schlaf-verlaengern-weniger-kalorien-rct.md`
- URL: `/wissen/schlaf-verlaengern-weniger-kalorien-rct/`

---

## 2) Markdown-Template (SEO + Stil)

Wichtig:

- **Kein Markdown-H1 (`# ...`)** im Artikel (sonst gibt es doppelte H1, weil die Seite bereits ein H1 rendert).
- Nutze die Struktur:
  - Intro (2–3 Saetze, klarer Nutzen)
  - `## Das Wichtigste in Kuerze` (Bulletpoints)
  - `## Was wurde untersucht?`
  - `## Kernerkenntnisse`
  - `## Was heisst das praktisch?`
  - `## Limitationen und Einordnung`
  - `## Fazit`
  - `## Quellen` (mind. 1 Quelle mit DOI)
  - Disclaimer am Ende

Du kannst das Template hier kopieren:

- `src/content/wissen/articles/_template.md`

---

## 3) Meta-Eintrag in `articlesMeta`

In `src/content/wissen/index.ts` fuege in `articlesMeta` einen neuen Block hinzu:

- **slug**: muss exakt dem Dateinamen entsprechen
- **title**: sauberer Seitentitel (wird im `<title>` genutzt, plus `| Mahlzait Wissen`)
- **description**: 1–2 Saetze, klare Aussage; idealerweise ~140–170 Zeichen
- **tags**: einfache, wiederverwendbare Tags (z.B. `Abnehmen`, `Studie`, `Meta-Analyse`, `Protein`, `Schlaf`, `Tracking`)
- **publishedAt**: ISO Datum `YYYY-MM-DD`
- **readingTime**: grober Minutenwert
- **sources**: mindestens eine Quelle mit:
  - `title`
  - `authors` (Kurzform ok, z.B. `Nachname I, et al.`)
  - `journal`
  - `year`
  - `doi`
  - optional `pmid`

Optional:

- `featured: true` wenn der Artikel auf `/wissen` hervorgehoben werden soll.

---

## 4) Automatische Metadaten aus PDFs (optional)

Wenn du das PDF in `src/modules/wissen/` ablegst, kannst du automatisch DOI/Title/Abstract ziehen:

```bash
pnpm wissen:extract
pnpm wissen:resolve
```

Outputs:

- `scripts/wissen/papers-extracted.json` (Text/DOI/Abstract-Snippets)
- `scripts/wissen/papers-resolved.json` (Crossref: Titel/Journal/Jahr/URL)

Hinweis: Das ersetzt nicht das Schreiben des Artikels, aber spart Copy/Paste und verhindert falsche Metadaten.

---

## 5) Checks (vor PR / Deploy)

Slug/Datei Konsistenz:

```bash
pnpm wissen:check
```

Build:

```bash
pnpm build
```

Wenn der Build durchlaeuft, werden:

- `/wissen` Listing aktualisiert
- alle neuen `/wissen/<slug>` Seiten statisch gebaut
- Sitemap aktualisiert


