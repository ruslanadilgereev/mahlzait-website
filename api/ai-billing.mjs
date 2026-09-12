// Private Cloud Billing snapshots. CSV net subtotals already include credits.
// Daily reporting uses Pacific time, independently of ai-usage's UTC counters:
// https://docs.cloud.google.com/billing/docs/how-to/reports
import { google } from "googleapis";
import { timingSafeEqual } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";

export const config = { maxDuration: 30 };
export const MAX_CSV_BYTES = 2 * 1024 * 1024;
export const MAX_STORED_BYTES = 900_000;
// Leave headroom below Vercel's 4.5 MB response limit even for very compressible CSVs.
const MAX_REPORT_BYTES = 4_000_000;
const DOC_PATH =
  "projects/mytemple-460913/databases/(default)/documents/ai_billing_dashboard_cache/state";
const IMPORT_SCOPE =
  "Umfang und Filter des importierten Cloud-Billing-Berichts; Projektzuordnung im CSV nicht enthalten.";
const HEADERS = [
  "Datum",
  "Dienstbeschreibung",
  "Dienst-ID",
  "SKU-Beschreibung",
  "SKU-ID",
  "Nutzungsmenge",
  "Nutzungseinheit",
  "Listenkosten (€)",
  "Ausgehandelte Einsparungen (€)",
  "Sparprogramme (€)",
  "Andere Einsparungen (€)",
  "Ungerundete Zwischensumme (€)",
  "Zwischensumme (€)",
];
export const CATEGORIES = Object.freeze({
  search: "Websuche / Grounding",
  input: "Text- und weitere Eingabe",
  image: "Bildeingabe",
  output: "Ausgabe inkl. Thinking",
  cached_input: "Gecachte Eingabe",
  cache_storage: "Cache-Speicher",
  agent_runtime: "Agent-Betrieb",
  memory: "Memory Bank",
  ai_other: "Weitere AI-Kosten",
  cloud_other: "Weitere Cloud-Dienste",
});

class CsvError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function csvRecords(text) {
  const records = [];
  let row = [],
    field = "",
    quoted = false,
    closed = false;
  const endField = () => {
    row.push(field);
    field = "";
    closed = false;
  };
  const endRow = () => {
    endField();
    if (row.some((value) => value.trim())) records.push(row);
    row = [];
  };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char !== '"') field += char;
      else if (text[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        quoted = false;
        closed = true;
      }
    } else if (char === ",") endField();
    else if (char === "\r" || char === "\n") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      endRow();
    } else if (char === '"' && !field && !closed) quoted = true;
    else if (char === '"' || closed)
      throw new CsvError("Ungültige CSV-Anführungszeichen.");
    else field += char;
  }
  if (quoted)
    throw new CsvError("Die CSV enthält ein nicht geschlossenes Textfeld.");
  if (field || row.length || closed) endRow();
  return records;
}

function germanDecimal(value) {
  const text = value.trim();
  if (!/^[+-]?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(text)) {
    throw new CsvError(
      "Kosten und Nutzungsmenge müssen gültige deutsche Zahlen enthalten.",
    );
  }
  const normalized = text.replace(/\./g, "").replace(",", ".");
  if (!Number.isFinite(Number(normalized)))
    throw new CsvError("Eine Zahl ist außerhalb des gültigen Bereichs.");
  return normalized;
}

function micros(value) {
  const normalized = germanDecimal(value);
  const [whole, fraction = ""] = normalized.replace(/^[+-]/, "").split(".");
  if (fraction.length > 6)
    throw new CsvError("Kosten dürfen höchstens sechs Nachkommastellen haben.");
  const result =
    Number(BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, "0"))) *
    (normalized.startsWith("-") ? -1 : 1);
  if (!Number.isSafeInteger(result))
    throw new CsvError("Ein Kostenbetrag ist zu groß.");
  return result;
}

function validDay(day) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    Number.isFinite(Date.parse(day)) &&
    new Date(day).toISOString().slice(0, 10) === day
  );
}

function classify(service, sku) {
  if (!["Vertex AI", "Gemini API"].includes(service)) return "cloud_other";
  if (/grounding|google search|search query/i.test(sku)) return "search";
  if (/memory bank/i.test(sku)) return "memory";
  if (/agent (?:platform|engine)|reasoning engine/i.test(sku))
    return "agent_runtime";
  if (/cach(?:e|ed|ing)/i.test(sku))
    return /storage/i.test(sku) ? "cache_storage" : "cached_input";
  // Gemini API output SKUs can also contain "input text" later in their name.
  if (/output|thinking/i.test(sku)) return "output";
  if (/image/i.test(sku) && /input/i.test(sku)) return "image";
  if (/input/i.test(sku)) return "input";
  return "ai_other";
}

function modelName(sku) {
  const match = sku.match(
    /\bgemini\s+(\d+(?:\.\d+)?)(?:\s+(flash(?:[\s-]+lite)?|pro))?(?:\s+(preview|tts))?/i,
  );
  if (!match) return null;
  return [
    "Gemini",
    match[1],
    ...[match[2], match[3]]
      .filter(Boolean)
      .join(" ")
      .split(/[\s-]+/)
      .filter(Boolean)
      .map((word) =>
        word.toLowerCase() === "tts"
          ? "TTS"
          : word[0].toUpperCase() + word.slice(1).toLowerCase(),
      ),
  ].join(" ");
}

export function parseBillingCsv(
  csv,
  { captured_at = new Date().toISOString(), scope = IMPORT_SCOPE } = {},
) {
  if (typeof csv !== "string" || !csv.trim())
    throw new CsvError(
      "Bitte eine deutsche tägliche Cloud-Billing-SKU-CSV auswählen.",
    );
  if (Buffer.byteLength(csv, "utf8") > MAX_CSV_BYTES)
    throw new CsvError("Die CSV darf höchstens 2 MB groß sein.", 413);
  const records = csvRecords(csv.replace(/^\uFEFF/, ""));
  const header = records.shift()?.map((value) => value.trim()) || [];
  if (
    header.length !== HEADERS.length ||
    HEADERS.some((name) => !header.includes(name))
  ) {
    throw new CsvError(
      "Erwartet wird der deutsche EUR-Bericht mit Gruppierung Datum › SKU und ungerundeter Zwischensumme.",
    );
  }
  const index = Object.fromEntries(
    header.map((name, position) => [name, position]),
  );
  const rows = [],
    seen = new Set(),
    summaries = new Map();
  let totalMicros = 0,
    inFooter = false;
  for (const record of records) {
    const value = (name) => (record[index[name]] || "").trim();
    if (!value("Datum")) {
      inFooter = true;
      // Google's three footer rows have fewer cells than the column headers.
      const cells = record.map((cell) => cell.trim()).filter(Boolean);
      if (
        cells.length !== 3 ||
        !["Zwischensumme", "Steuer", "Summe"].includes(cells[0]) ||
        summaries.has(cells[0])
      ) {
        throw new CsvError(
          "Die CSV enthält eine unbekannte oder doppelte Summenzeile.",
        );
      }
      const net = micros(cells[1]),
        rounded = micros(cells[2]);
      if (Math.abs(net - rounded) > 5000)
        throw new CsvError(
          "Gerundete und ungerundete CSV-Summe stimmen nicht überein.",
        );
      summaries.set(cells[0], net);
      continue;
    }
    if (
      inFooter ||
      record.length !== header.length ||
      !validDay(value("Datum"))
    )
      throw new CsvError("Die CSV enthält eine ungültige Tageszeile.");
    const date = value("Datum"),
      service = value("Dienstbeschreibung"),
      sku = value("SKU-Beschreibung"),
      unit = value("Nutzungseinheit");
    if (!service || !sku || !unit || !value("Dienst-ID") || !value("SKU-ID"))
      throw new CsvError(
        "Eine Tageszeile enthält keine vollständigen Dienst-, SKU- oder Nutzungsangaben.",
      );
    const key = JSON.stringify([date, value("Dienst-ID"), value("SKU-ID")]);
    if (seen.has(key))
      throw new CsvError("Die CSV enthält doppelte Tages-/SKU-Zeilen.");
    seen.add(key);
    const net = micros(value("Ungerundete Zwischensumme (€)"));
    if (Math.abs(net - micros(value("Zwischensumme (€)"))) > 5000)
      throw new CsvError(
        "Die gerundeten SKU-Kosten stimmen nicht mit den Originalkosten überein.",
      );
    for (const name of HEADERS.slice(7, 11)) micros(value(name));
    totalMicros += net;
    if (!Number.isSafeInteger(totalMicros))
      throw new CsvError("Die Gesamtkosten sind zu groß.");
    const category = classify(service, sku);
    const model = [
      "input",
      "image",
      "output",
      "cached_input",
      "cache_storage",
    ].includes(category)
      ? modelName(sku)
      : null;
    rows.push({
      date,
      service,
      sku,
      category,
      model,
      net_eur: net / 1_000_000,
      usage: Number(germanDecimal(value("Nutzungsmenge"))),
      unit,
    });
  }
  if (
    !rows.length ||
    !summaries.has("Zwischensumme") ||
    summaries.get("Zwischensumme") !== totalMicros
  )
    throw new CsvError(
      "Die SKU-Kosten stimmen nicht mit der CSV-Zwischensumme überein oder der Export ist unvollständig.",
    );
  if (
    (summaries.get("Steuer") || 0) !== 0 ||
    (summaries.has("Summe") && summaries.get("Summe") !== totalMicros)
  )
    throw new CsvError(
      "Bitte einen Bericht ohne Steuern und Kosten auf Rechnungsebene exportieren.",
    );
  if (!Number.isFinite(Date.parse(captured_at)))
    throw new CsvError("Ungültiger Importzeitpunkt.");
  rows.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.service.localeCompare(b.service) ||
      a.sku.localeCompare(b.sku),
  );
  return {
    available: true,
    source: "Google Cloud Billing CSV",
    captured_at: new Date(captured_at).toISOString(),
    from: rows[0].date,
    to: rows.at(-1).date,
    scope,
    currency: "EUR",
    rows,
    categories: CATEGORIES,
    timezone: "America/Los_Angeles",
    timezone_label: "Google-Billing-Tag (Pacific)",
    timezone_source:
      "https://docs.cloud.google.com/billing/docs/how-to/reports",
    warning: null,
  };
}

export function encodeSnapshot(report) {
  const json = Buffer.from(JSON.stringify(report));
  if (json.length > MAX_REPORT_BYTES)
    throw new CsvError(
      "Der Bericht enthält zu viele Daten. Bitte einen kürzeren Zeitraum exportieren.",
      413,
    );
  const data = gzipSync(json, { level: 9 }).toString("base64");
  if (Buffer.byteLength(data) > MAX_STORED_BYTES)
    throw new CsvError(
      "Der Bericht ist für den Import zu groß. Bitte einen kürzeren Zeitraum exportieren.",
      413,
    );
  return { schema: { integerValue: "1" }, data_b64: { stringValue: data } };
}

function decodeSnapshot(fields) {
  const data = fields?.data_b64?.stringValue;
  if (
    fields?.schema?.integerValue !== "1" ||
    typeof data !== "string" ||
    data.length > MAX_STORED_BYTES
  )
    throw new Error("Invalid billing cache");
  const report = JSON.parse(
    gunzipSync(Buffer.from(data, "base64"), {
      maxOutputLength: MAX_REPORT_BYTES,
    }).toString("utf8"),
  );
  if (
    report.available !== true ||
    report.source !== "Google Cloud Billing CSV" ||
    report.currency !== "EUR" ||
    !Number.isFinite(Date.parse(report.captured_at)) ||
    !validDay(report.from) ||
    !validDay(report.to) ||
    typeof report.scope !== "string" ||
    !Array.isArray(report.rows) ||
    !report.rows.length ||
    report.rows.some(
      (row) =>
        !validDay(row.date) ||
        row.date < report.from ||
        row.date > report.to ||
        !Object.hasOwn(CATEGORIES, row.category) ||
        !Number.isFinite(row.net_eur) ||
        !Number.isFinite(row.usage) ||
        ![row.service, row.sku, row.unit].every(
          (value) => typeof value === "string",
        ) ||
        !(row.model === null || typeof row.model === "string"),
    )
  )
    throw new Error("Invalid billing report");
  return { ...report, categories: CATEGORIES, warning: null };
}

let cachedAuth;
function getFirestore() {
  if (!cachedAuth) {
    if (!process.env.GOOGLE_SA_KEY)
      throw new Error("Missing Google credentials");
    cachedAuth = new google.auth.GoogleAuth({
      credentials: JSON.parse(
        Buffer.from(process.env.GOOGLE_SA_KEY, "base64").toString("utf8"),
      ),
      scopes: ["https://www.googleapis.com/auth/datastore"],
    });
  }
  return google.firestore({ version: "v1", auth: cachedAuth });
}

function authorized(req, password) {
  const supplied = req.query?.pw;
  if (
    typeof password !== "string" ||
    !password ||
    typeof supplied !== "string" ||
    !supplied
  )
    return false;
  const actual = Buffer.from(supplied),
    expected = Buffer.from(password);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function importBody(body) {
  try {
    if (typeof body === "string" || Buffer.isBuffer(body)) {
      // JSON doubles CSV quotes/backslashes; the decoded CSV still has its own 2 MB cap.
      if (Buffer.byteLength(body) > MAX_CSV_BYTES * 2 + 1024)
        throw new CsvError("Die Importanfrage ist zu groß.", 413);
      body = JSON.parse(body.toString());
    }
  } catch (error) {
    if (error instanceof CsvError) throw error;
    throw new CsvError("Die Importanfrage muss gültiges JSON enthalten.");
  }
  if (!body || typeof body !== "object" || typeof body.csv !== "string")
    throw new CsvError("Die Importanfrage muss ein CSV-Textfeld enthalten.");
  return body.csv;
}

// Dependency seam keeps validation and HTTP tests entirely offline.
export function createBillingHandler({
  firestore = getFirestore,
  password = () => process.env.DASHBOARD_PASSWORD,
  now = () => new Date().toISOString(),
} = {}) {
  return async (req, res) => {
    res.setHeader("Cache-Control", "private, no-store");
    if (!authorized(req, password()))
      return res.status(401).json({ error: "Unauthorized" });
    if (!["GET", "POST"].includes(req.method)) {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).json({ error: "Method not allowed" });
    }
    if (req.method === "GET") {
      try {
        const result = await firestore().projects.databases.documents.get({
          name: DOC_PATH,
        });
        return res.json(decodeSnapshot(result.data?.fields));
      } catch (error) {
        if (Number(error?.response?.status || error?.code) === 404)
          return res.json({
            available: false,
            hint: "Noch kein Billing-Bericht gespeichert. Bitte eine Billing-CSV importieren.",
          });
        return res.status(503).json({
          available: false,
          error: "Der Billing-Bericht konnte nicht geladen werden.",
        });
      }
    }
    try {
      const report = parseBillingCsv(importBody(req.body), {
        captured_at: now(),
      });
      const fields = encodeSnapshot(report);
      await firestore().projects.databases.documents.patch({
        name: DOC_PATH,
        requestBody: { fields },
      });
      return res.json(report);
    } catch (error) {
      if (error instanceof CsvError)
        return res.status(error.status).json({ error: error.message });
      return res.status(503).json({
        error:
          "Der Import konnte nicht bestätigt werden. Bitte den gespeicherten Bericht erneut laden.",
      });
    }
  };
}

export default createBillingHandler();
