// Account-level invoice amounts; demographic filters apply only to token estimates.
let aiBillingData = null;
let aiBillingError = "";

async function aiBillingLoad() {
  try {
    const response = await fetch(
      `/api/ai-billing?pw=${encodeURIComponent(PW)}`,
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.available === false) {
      aiBillingData = null;
      aiBillingError = data.hint || "Bitte eine Billing-CSV importieren.";
      aiBillingRender();
      return;
    }
    if (!data.available || !Array.isArray(data.rows))
      throw new Error("Kein Billing-Bericht verfügbar");
    aiBillingData = data;
    aiBillingError = "";
  } catch (error) {
    aiBillingError = `Billing-Bericht konnte nicht geladen werden: ${error.message}. Erneut „Aktualisieren“ klicken.`;
  }
  aiBillingRender();
}

function aiBillingAggregate(rows) {
  const result = {
    total: 0,
    ai: 0,
    search: 0,
    categories: new Map(),
    models: new Map(),
    days: new Map(),
  };
  for (const row of rows) {
    const cost = row.net_eur;
    result.total += cost;
    if (row.category !== "cloud_other") result.ai += cost;
    if (row.category === "search") result.search += cost;
    result.categories.set(
      row.category,
      (result.categories.get(row.category) || 0) + cost,
    );
    if (row.model)
      result.models.set(row.model, (result.models.get(row.model) || 0) + cost);
    if (!result.days.has(row.date))
      result.days.set(row.date, { total: 0, ai: 0, search: 0 });
    const day = result.days.get(row.date);
    day.total += cost;
    if (row.category !== "cloud_other") day.ai += cost;
    if (row.category === "search") day.search += cost;
  }
  return result;
}

function aiBillingRender() {
  const status = document.getElementById("ai-billing-status");
  const kpis = document.getElementById("ai-billing-kpis");
  const grid = document.getElementById("ai-billing-grid");
  const details = document.getElementById("ai-billing-details");
  if (!aiBillingData) {
    kpis.innerHTML = "";
    grid.innerHTML = "";
    details.classList.add("hidden");
    status.textContent = aiBillingError || "Rechnungskosten werden geladen.";
    return;
  }
  const data = aiBillingData;
  const from = aiFrom || data.from,
    to = aiTo || data.to;
  const rows = data.rows.filter((row) => row.date >= from && row.date <= to);
  const dateLabel = (date) => date.split("-").reverse().join(".");
  const captured = new Date(data.captured_at).toLocaleString("de-DE");
  const prefix = [aiBillingError, data.warning].filter(Boolean).join(" ");
  const provenance = `${data.scope} · Importstand ${captured} · Bericht ${dateLabel(data.from)}–${dateLabel(data.to)}. Nettokosten nach Gutschriften, ohne Steuern. Google-Billing-Tage: Pacific.`;
  if (!rows.length) {
    status.textContent =
      `${prefix} Für den gewählten Zeitraum liegen keine Rechnungskosten vor. ${provenance}`.trim();
    kpis.innerHTML = "";
    grid.innerHTML = "";
    details.classList.add("hidden");
    return;
  }
  const agg = aiBillingAggregate(rows);
  const days = [...agg.days].sort(([a], [b]) => a.localeCompare(b));
  const partial =
    days[0][0] > from ||
    days[days.length - 1][0] < to ||
    days.length <
      Math.round((Date.parse(to) - Date.parse(from)) / 86400000) + 1;
  const coverage = partial
    ? `Teilabdeckung: ${days.length} Berichtstage in der Auswahl. Fehlende Tage werden nicht als 0 € gewertet.`
    : `${days.length} Berichtstage in der Auswahl.`;
  status.textContent = `${prefix} ${provenance} ${coverage}`.trim();
  const budgetDays = days.filter(([, day]) => day.ai > 5).length;
  const tiles = [
    {
      label: "Cloud gesamt",
      val: aiEur(agg.total),
      sub: "inkl. übriger Cloud-Dienste",
    },
    {
      label: "AI & Agent-Betrieb",
      val: aiEur(agg.ai),
      sub: "Vertex AI + Gemini API",
    },
    {
      label: "Websuche / Grounding",
      val: aiEur(agg.search),
      sub: "in den AI-Kosten enthalten",
    },
    {
      label: "Ø AI pro Berichtstag",
      val: aiEur(agg.ai / days.length),
      sub: `${budgetDays} von ${days.length} Tagen über dem 5-€-Ziel`,
    },
  ];
  kpis.innerHTML = tiles
    .map(
      (k) =>
        `<div class="cu-kpi"><div class="k-label">${escapeHtml(k.label)}</div><div class="k-val">${escapeHtml(k.val)}</div><div class="k-sub">${escapeHtml(k.sub)}</div></div>`,
    )
    .join("");
  const entries = [...agg.categories]
    .filter(([, cost]) => cost !== 0)
    .sort((a, b) => b[1] - a[1])
    .map(([key, cost]) => [data.categories[key] || key, cost]);
  const models = [...agg.models]
    .filter(([, cost]) => cost !== 0)
    .sort((a, b) => b[1] - a[1]);
  grid.innerHTML =
    cuCardHtml(
      "Wofür Google abrechnet",
      aiEur(agg.total),
      aiHBars(entries, agg.total, aiEur),
    ) +
    cuCardHtml(
      "Modellkosten laut Rechnung",
      "inkl. Modell-Cache",
      aiHBars(
        models,
        models.reduce((sum, e) => sum + e[1], 0),
        aiEur,
      ),
    );
  const daily = days
    .slice()
    .reverse()
    .map(
      ([date, day]) =>
        `<tr><td>${escapeHtml(dateLabel(date))}</td><td class="num">${aiEur(day.ai)}</td><td class="num">${aiEur(day.search)}</td><td class="num">${aiEur(day.total - day.ai)}</td><td class="num">${aiEur(day.total)}</td></tr>`,
    )
    .join("");
  const skus = new Map();
  for (const row of rows) {
    const key = `${row.service} · ${row.sku}`;
    skus.set(key, (skus.get(key) || 0) + row.net_eur);
  }
  const skuRows = [...skus]
    .filter(([, cost]) => cost !== 0)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([label, cost]) =>
        `<tr><td style="white-space:normal">${escapeHtml(label)}</td><td class="num">${aiEur(cost)}</td></tr>`,
    )
    .join("");
  document.getElementById("ai-billing-table").innerHTML =
    `<div class="card"><table><caption class="ai-section-note">Rechnungskosten pro Google-Billing-Tag (Pacific)</caption><thead><tr><th>Tag</th><th class="num">AI & Betrieb</th><th class="num">davon Suche</th><th class="num">Weitere Cloud</th><th class="num">Cloud gesamt</th></tr></thead><tbody>${daily}</tbody></table></div>` +
    `<div class="card"><table><caption class="ai-section-note">Einzelne Rechnungsposten im gewählten Zeitraum</caption><thead><tr><th>Dienst · Rechnungsposten</th><th class="num">Nettokosten</th></tr></thead><tbody>${skuRows}</tbody></table></div>`;
  details.classList.remove("hidden");
}

async function aiBillingImport(input) {
  const file = input.files?.[0];
  if (!file) return;
  const button = document.getElementById("ai-billing-import-btn");
  const status = document.getElementById("ai-billing-status");
  button.disabled = true;
  try {
    if (file.size > 2 * 1024 * 1024)
      throw new Error(
        "Die CSV darf höchstens 2 MB groß sein. Bitte einen kürzeren Zeitraum exportieren.",
      );
    status.textContent = "Billing-Bericht wird geprüft und importiert…";
    const response = await fetch(
      `/api/ai-billing?pw=${encodeURIComponent(PW)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: await file.text() }),
      },
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    aiBillingData = data;
    aiBillingError = "";
    aiBillingRender();
  } catch (error) {
    aiBillingError = `Import fehlgeschlagen: ${error.message} Bitte „Aktualisieren“ klicken.`;
    aiBillingRender();
  } finally {
    button.disabled = false;
    input.value = "";
  }
}
