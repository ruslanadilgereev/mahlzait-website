// Automatic, authenticated Cloud Billing retrieval. No billing data lives in this repository.
// Schema/backfill: https://docs.cloud.google.com/billing/docs/how-to/export-data-bigquery-tables/standard-usage
import { google } from "googleapis";
import { timingSafeEqual } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";

export const config = { maxDuration: 90 };
export const MAX_STORED_BYTES = 900_000;
export const MAX_BYTES_BILLED = 500_000_000;
export const CACHE_TTL_MS = 60 * 60 * 1000;
export const RETRY_MS = 15 * 60 * 1000;
export const MAX_REPORT_BYTES = 16 * 1024 * 1024;
const MAX_QUERY_ROWS = 100_000;
const QUERY_PAGE_SIZE = 5000;
const QUERY_TIMEOUT_MS = 45_000;
const TIMEZONE = "America/Los_Angeles";
const SOURCE = "Google Cloud Billing BigQuery";
const DOC_PATH =
  "projects/mytemple-460913/databases/(default)/documents/ai_billing_dashboard_cache/state";
const DEFAULT_TABLE =
  "mytemple-460913.mahlzait_billing.gcp_billing_export_v1_017D1E_33B8D2_D24629";
const RESULT_FIELDS = [
  "date",
  "service",
  "sku",
  "unit",
  "currency",
  "net_eur",
  "usage",
  "export_time_ms",
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

class BillingError extends Error {
  constructor(code) {
    super(code);
    this.billingCode = code;
  }
}

function validDay(day) {
  return (
    typeof day === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    Number.isFinite(Date.parse(day)) &&
    new Date(day).toISOString().slice(0, 10) === day
  );
}

export function billingWindow(at) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(new Date(at))
      .map((part) => [part.type, part.value]),
  );
  const to = `${parts.year}-${parts.month}-${parts.day}`;
  const previousYear = Number(parts.year) - 1;
  const month = Number(parts.month);
  const day = Math.min(
    Number(parts.day),
    new Date(Date.UTC(previousYear, month, 0)).getUTCDate(),
  );
  return {
    from: `${previousYear}-${parts.month}-${String(day).padStart(2, "0")}`,
    to,
  };
}

function settingsFromEnv() {
  return {
    table: process.env.BILLING_BIGQUERY_TABLE || DEFAULT_TABLE,
    location: process.env.BILLING_BIGQUERY_LOCATION || "EU",
  };
}

export function billingQuery({ table, location }, window) {
  if (
    !/^[a-z][a-z0-9-]*\.[A-Za-z_][A-Za-z0-9_]*\.[A-Za-z_][A-Za-z0-9_]*$/.test(
      table,
    ) ||
    !/^[A-Za-z0-9-]{2,40}$/.test(location)
  )
    throw new BillingError("invalid_configuration");
  // Correlated credit aggregation avoids multiplying costs or usage by the number of credits.
  const query = `WITH usage_costs AS (
  SELECT DATE(usage_start_time, @timezone) AS day,
    COALESCE(NULLIF(TRIM(service.description), ''), 'Unbekannter Dienst') AS service,
    COALESCE(NULLIF(TRIM(sku.description), ''), 'Unbekannte SKU') AS sku,
    COALESCE(NULLIF(usage.unit, ''), 'nicht ausgewiesen') AS unit,
    currency,
    CAST(cost AS NUMERIC) + IFNULL((SELECT SUM(CAST(credit.amount AS NUMERIC)) FROM UNNEST(credits) AS credit), NUMERIC '0') AS net_cost,
    IFNULL(CAST(usage.amount AS NUMERIC), NUMERIC '0') AS usage_amount,
    export_time
  FROM \`${table}\`
  WHERE usage_start_time >= TIMESTAMP(@from_date, @timezone)
    AND usage_start_time < TIMESTAMP(DATE_ADD(@to_date, INTERVAL 1 DAY), @timezone)
    AND IFNULL(cost_type, 'regular') != 'tax'
)
SELECT FORMAT_DATE('%F', day) AS date, service, sku, unit, currency,
  CAST(SUM(net_cost) AS STRING) AS net_eur,
  CAST(SUM(usage_amount) AS STRING) AS usage,
  UNIX_MILLIS(MAX(export_time)) AS export_time_ms
FROM usage_costs
GROUP BY day, service, sku, unit, currency
ORDER BY day, service, sku, unit`;
  return {
    projectId: table.split(".")[0],
    requestBody: {
      query,
      location,
      useLegacySql: false,
      useQueryCache: true,
      maximumBytesBilled: String(MAX_BYTES_BILLED),
      jobTimeoutMs: String(QUERY_TIMEOUT_MS),
      timeoutMs: 10_000,
      maxResults: QUERY_PAGE_SIZE,
      parameterMode: "NAMED",
      queryParameters: [
        {
          name: "from_date",
          parameterType: { type: "DATE" },
          parameterValue: { value: window.from },
        },
        {
          name: "to_date",
          parameterType: { type: "DATE" },
          parameterValue: { value: window.to },
        },
        {
          name: "timezone",
          parameterType: { type: "STRING" },
          parameterValue: { value: TIMEZONE },
        },
      ],
    },
  };
}

function classify(service, sku) {
  if (!["Vertex AI", "Gemini API"].includes(service)) return "cloud_other";
  if (/grounding|google search|search query/i.test(sku)) return "search";
  if (/memory bank/i.test(sku)) return "memory";
  if (/agent (?:platform|engine)|reasoning engine/i.test(sku))
    return "agent_runtime";
  if (/cach(?:e|ed|ing)/i.test(sku))
    return /storage/i.test(sku) ? "cache_storage" : "cached_input";
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
  const variant = [match[2], match[3]]
    .filter(Boolean)
    .join(" ")
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) =>
      word.toLowerCase() === "tts"
        ? "TTS"
        : word[0].toUpperCase() + word.slice(1).toLowerCase(),
    );
  return ["Gemini", match[1], ...variant].join(" ");
}

// Input is already aggregated by BigQuery; no credits or discounts are applied here.
export function normalizeBillingRows(records) {
  let exportedAt = null;
  const rows = records.map((record) => {
    if (record.currency !== "EUR")
      throw new BillingError("unsupported_currency");
    if (
      !validDay(record.date) ||
      ![record.service, record.sku, record.unit].every(
        (value) => typeof value === "string" && value.trim(),
      )
    )
      throw new BillingError("invalid_data");
    const finite = (value) =>
      value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(Number(value));
    if (
      !finite(record.net_eur) ||
      !finite(record.usage) ||
      !finite(record.export_time_ms)
    )
      throw new BillingError("invalid_data");
    const timestamp = Number(record.export_time_ms);
    if (!Number.isFinite(new Date(timestamp).getTime()))
      throw new BillingError("invalid_data");
    exportedAt = Math.max(exportedAt || 0, timestamp);
    const service = record.service.trim(),
      sku = record.sku.trim();
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
    return {
      date: record.date,
      service,
      sku,
      category,
      model,
      net_eur: Number(record.net_eur),
      usage: Number(record.usage),
      unit: record.unit,
    };
  });
  return {
    rows,
    export_last_updated_at:
      exportedAt === null ? null : new Date(exportedAt).toISOString(),
  };
}

export async function queryBilling(
  bigquery,
  settings,
  window,
  {
    clock = Date.now,
    pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  } = {},
) {
  const deadline = clock() + QUERY_TIMEOUT_MS;
  const options = () => {
    const remaining = deadline - clock();
    if (remaining <= 0) throw new BillingError("timeout");
    return { timeout: Math.min(12_000, remaining), retry: false };
  };
  const request = billingQuery(settings, window);
  let data = (await bigquery.jobs.query(request, options())).data;
  let job = data.jobReference;
  let schema = data.schema;
  let totalRows;
  let cacheHit = false;
  let calls = 0;
  const records = [],
    tokens = new Set();
  while (true) {
    if (++calls > 100) throw new BillingError("timeout");
    job = data.jobReference || job;
    schema = data.schema || schema;
    cacheHit ||= Boolean(data.cacheHit);
    if (data.jobComplete) {
      if (data.errors?.length && !schema)
        throw Object.assign(new BillingError("query_failed"), {
          errors: data.errors,
        });
      if (data.totalRows !== undefined) totalRows = Number(data.totalRows);
      if (totalRows > MAX_QUERY_ROWS)
        throw new BillingError("snapshot_too_large");
      const names = schema?.fields?.map((field) => field.name);
      if (
        data.rows?.length &&
        (!names || RESULT_FIELDS.some((name) => !names.includes(name)))
      )
        throw new BillingError("invalid_data");
      for (const row of data.rows || []) {
        if (!Array.isArray(row.f) || row.f.length !== names.length)
          throw new BillingError("invalid_data");
        records.push(
          Object.fromEntries(names.map((name, i) => [name, row.f[i].v])),
        );
      }
      if (records.length > MAX_QUERY_ROWS)
        throw new BillingError("snapshot_too_large");
      if (!data.pageToken) break;
      if (tokens.has(data.pageToken)) throw new BillingError("invalid_data");
      tokens.add(data.pageToken);
    }
    if (!job?.jobId) throw new BillingError("invalid_data");
    if (!data.jobComplete) await pause(200);
    const timeout = options();
    data = (
      await bigquery.jobs.getQueryResults(
        {
          projectId: job.projectId || request.projectId,
          jobId: job.jobId,
          location: job.location || settings.location,
          maxResults: QUERY_PAGE_SIZE,
          timeoutMs: Math.min(10_000, timeout.timeout),
          ...(data.jobComplete && data.pageToken
            ? { pageToken: data.pageToken }
            : {}),
        },
        timeout,
      )
    ).data;
  }
  if (
    totalRows !== undefined &&
    (!Number.isSafeInteger(totalRows) || totalRows !== records.length)
  )
    throw new BillingError("invalid_data");
  return {
    ...normalizeBillingRows(records),
    query_cache_hit: cacheHit,
  };
}

function baseReport() {
  return {
    source: SOURCE,
    currency: "EUR",
    categories: CATEGORIES,
    timezone: TIMEZONE,
    timezone_label: "Google-Billing-Tag (Pacific)",
    timezone_source:
      "https://docs.cloud.google.com/billing/docs/how-to/reports",
    scope:
      "Gesamtes Abrechnungskonto des Cloud-Billing-Exports; inklusive Gutschriften, ohne Steuern. Keine Zuordnung zu einzelnen Nutzern.",
    cache_ttl_seconds: CACHE_TTL_MS / 1000,
    provisional: true,
  };
}

export function mergeBillingHistory(previous, result, window, at) {
  const incoming = result.rows.filter(
    (row) => row.date >= window.from && row.date <= window.to,
  );
  if (!incoming.length) return null;
  incoming.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.service.localeCompare(b.service) ||
      a.sku.localeCompare(b.sku),
  );
  const exportFrom = incoming[0].date,
    exportTo = incoming.at(-1).date;
  const priorDays = new Set(previous?.historical?.days || []);
  const historicalRows = (previous?.rows || []).filter(
    (row) =>
      priorDays.has(row.date) &&
      row.date >= window.from &&
      row.date <= window.to,
  );
  const historicalDays = [
    ...new Set(historicalRows.map((row) => row.date)),
  ].sort();
  // EU backfill is chronological. A later billing day after the full old range
  // establishes handover; later legitimate corrections must remain authoritative.
  const caughtUp =
    historicalDays.length === 0 ||
    (exportFrom <= historicalDays[0] && exportTo > historicalDays.at(-1));
  const retained = caughtUp ? [] : historicalRows;
  const retainedDays = new Set(retained.map((row) => row.date));
  const added = incoming.filter((row) => !retainedDays.has(row.date));
  const rows = [...retained, ...added].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.service.localeCompare(b.service) ||
      a.sku.localeCompare(b.sku),
  );
  return {
    ...baseReport(),
    available: true,
    rows,
    from: rows[0].date,
    to: rows.at(-1).date,
    captured_at: added.length ? at : previous.captured_at,
    export_from: exportFrom,
    export_to: exportTo,
    export_last_updated_at: result.export_last_updated_at,
    query_cache_hit: result.query_cache_hit,
    historical: retained.length
      ? { days: historicalDays, captured_at: previous.historical.captured_at }
      : null,
    sync_status: retained.length ? "backfilling" : "current",
    warning: retained.length
      ? "Google liefert den historischen Export noch nach. Bereits bestätigte Tage bleiben bis zur vollständigen Übernahme erhalten; weitere Tage werden automatisch ergänzt."
      : null,
  };
}

export function encodeSnapshot(report) {
  const json = Buffer.from(JSON.stringify(report));
  if (json.length > MAX_REPORT_BYTES)
    throw new BillingError("snapshot_too_large");
  const data = gzipSync(json, { level: 9 }).toString("base64");
  if (data.length > MAX_STORED_BYTES)
    throw new BillingError("snapshot_too_large");
  return { schema: { integerValue: "2" }, data_b64: { stringValue: data } };
}

function decodeSnapshot(fields) {
  const schema = fields?.schema?.integerValue,
    data = fields?.data_b64?.stringValue;
  if (
    !["1", "2"].includes(schema) ||
    typeof data !== "string" ||
    data.length > MAX_STORED_BYTES
  )
    throw new BillingError("cache_invalid");
  let report;
  try {
    report = JSON.parse(
      gunzipSync(Buffer.from(data, "base64"), {
        maxOutputLength: MAX_REPORT_BYTES,
      }).toString("utf8"),
    );
  } catch {
    throw new BillingError("cache_invalid");
  }
  if (report.available === false && schema === "2")
    return { ...report, ...baseReport() };
  if (
    report.available !== true ||
    report.currency !== "EUR" ||
    !Number.isFinite(Date.parse(report.captured_at)) ||
    !validDay(report.from) ||
    !validDay(report.to) ||
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
    throw new BillingError("cache_invalid");
  if (schema === "1") {
    if (report.source !== "Google Cloud Billing CSV")
      throw new BillingError("cache_invalid");
    // Legacy format is accepted only internally as already verified historical data.
    return {
      ...report,
      ...baseReport(),
      source: "Google Cloud Billing",
      historical: {
        days: [...new Set(report.rows.map((row) => row.date))].sort(),
        captured_at: report.captured_at,
      },
      last_sync_at: null,
      last_attempt_at: null,
      next_retry_at: null,
      sync_status: "waiting",
    };
  }
  return { ...report, categories: CATEGORIES };
}

let cachedAuth;
function getAuth() {
  if (!cachedAuth) {
    if (!process.env.GOOGLE_SA_KEY)
      throw new BillingError("credentials_missing");
    let credentials;
    try {
      credentials = JSON.parse(
        Buffer.from(process.env.GOOGLE_SA_KEY, "base64").toString("utf8"),
      );
    } catch {
      throw new BillingError("credentials_missing");
    }
    cachedAuth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
  }
  return cachedAuth;
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

function errorCode(error) {
  const reason =
    error?.errors?.[0]?.reason ||
    error?.response?.data?.error?.errors?.[0]?.reason ||
    "";
  const status = Number(error?.response?.status || error?.code);
  if (
    status === 429 ||
    /billingTierLimitExceeded|quotaExceeded|resourcesExceeded|rateLimitExceeded/i.test(
      reason,
    ) ||
    /maximum.bytes.billed|bytes billed/i.test(error?.message || "")
  )
    return "query_limit";
  if (
    status === 401 ||
    status === 403 ||
    /accessDenied|forbidden|permission/i.test(reason)
  )
    return "permission_denied";
  if (status === 404 || reason === "notFound") return "export_missing";
  if (error?.billingCode) return error.billingCode;
  if (
    ["ETIMEDOUT", "ECONNABORTED", "ABORT_ERR"].includes(error?.code) ||
    /timeout|jobTimeout/i.test(reason)
  )
    return "timeout";
  return "query_failed";
}

function failureMessage(code) {
  return (
    {
      permission_denied:
        "Zugriff auf die Cloud-Abrechnung verweigert. Dem Dashboard-Dienst fehlen Google-Cloud-Lese- oder BigQuery-Job-Berechtigungen.",
      export_missing:
        "Der automatische Billing-Export ist noch nicht bereit. Google liefert die Daten nach; der Abruf wird automatisch wiederholt.",
      empty_export:
        "Google hat noch keine Abrechnungsdaten im automatischen Export bereitgestellt. Der Abruf wird automatisch wiederholt.",
      timeout:
        "Die automatische Kostenabfrage hat zu lange gedauert. Der Abruf wird automatisch wiederholt.",
      query_limit:
        "Google hat die automatische Kostenabfrage wegen eines Abfrage- oder Kontingentlimits gestoppt. Der Abruf wird automatisch wiederholt.",
      invalid_configuration:
        "Die automatische Billing-Datenquelle ist ungültig konfiguriert.",
      credentials_missing:
        "Die Google-Zugangsdaten für die automatische Kostenabfrage fehlen oder sind ungültig.",
      unsupported_currency:
        "Der Billing-Export enthält eine andere Währung als EUR. Es werden keine Währungen vermischt.",
      invalid_data:
        "Google hat unvollständige oder unerwartete Billing-Daten geliefert. Der bestätigte Stand wird erhalten.",
      cache_invalid:
        "Der gespeicherte Kostenstand ist nicht lesbar. Die automatische Abrechnung konnte nicht sicher geladen werden.",
      snapshot_too_large:
        "Der automatische Kostenbericht überschreitet das Speicher- oder Antwortlimit. Der bestätigte Stand wird erhalten.",
    }[code] ||
    "Die automatische Kostenabfrage ist vorübergehend fehlgeschlagen. Der Abruf wird automatisch wiederholt."
  );
}

// Same negotiation rules as ai-usage: encode the full body before Vercel's 4.5 MB limit.
export function sendBillingJson(req, res, payload, status = 200) {
  const qualities = new Map();
  const header = req.headers?.["accept-encoding"] || "";
  for (const item of (Array.isArray(header)
    ? header.join(",")
    : String(header)
  ).split(",")) {
    const [coding, ...params] = item
      .trim()
      .toLowerCase()
      .split(";")
      .map((part) => part.trim());
    if (!coding) continue;
    const qParam = params.find((part) => /^q\s*=/.test(part));
    const value =
      qParam === undefined ? 1 : Number(qParam.slice(qParam.indexOf("=") + 1));
    const quality =
      Number.isFinite(value) && value >= 0 && value <= 1 ? value : 0;
    qualities.set(coding, Math.min(qualities.get(coding) ?? 1, quality));
  }
  const gzipAccepted = (qualities.get("gzip") ?? qualities.get("*") ?? 0) > 0;
  const identityAccepted =
    (qualities.get("identity") ?? (qualities.get("*") === 0 ? 0 : 1)) > 0;
  const vary = String(res.getHeader?.("Vary") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (
    !vary.some(
      (value) => value === "*" || value.toLowerCase() === "accept-encoding",
    )
  )
    vary.push("Accept-Encoding");
  res.setHeader("Vary", vary.join(", "));
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.statusCode = status;
  const json = Buffer.from(JSON.stringify(payload), "utf8");
  const maxHttpBytes = 4_500_000;
  const fail = (code, message) => {
    res.statusCode = code;
    const body = Buffer.from(
      JSON.stringify({
        error: message,
        ...(code === 406 ? { code: "gzip_required" } : {}),
      }),
    );
    res.setHeader("Content-Length", String(body.length));
    return res.end(body);
  };
  if (gzipAccepted && (json.length >= 1024 || !identityAccepted)) {
    const compressed = gzipSync(json);
    if (compressed.length > maxHttpBytes)
      return fail(
        503,
        "Der vollständige Kostenbericht ist derzeit zu groß für die Übertragung.",
      );
    res.setHeader("Content-Encoding", "gzip");
    res.setHeader("Content-Length", String(compressed.length));
    return res.end(compressed);
  }
  if (!identityAccepted || json.length > maxHttpBytes)
    return fail(
      406,
      "Der Client muss gzip-Komprimierung akzeptieren, um den vollständigen Kostenbericht abzurufen.",
    );
  res.setHeader("Content-Length", String(json.length));
  return res.end(json);
}

export function createBillingHandler({
  firestore = () => google.firestore({ version: "v1", auth: getAuth() }),
  bigquery = () => google.bigquery({ version: "v2", auth: getAuth() }),
  settings = settingsFromEnv,
  password = () => process.env.DASHBOARD_PASSWORD,
  now = () => new Date().toISOString(),
  clock = Date.now,
  pause,
} = {}) {
  let inFlight;
  async function synchronize(previous, loaded, client, attemptAt) {
    let report;
    try {
      const window = billingWindow(attemptAt);
      const result = await queryBilling(bigquery(), settings(), window, {
        clock,
        ...(pause ? { pause } : {}),
      });
      const completedAt = now();
      report = mergeBillingHistory(previous, result, window, completedAt);
      if (!report)
        report = {
          ...(previous || { ...baseReport(), available: false }),
          sync_status: "waiting",
          error_code: "empty_export",
          warning: failureMessage("empty_export"),
        };
      report = {
        ...report,
        last_sync_at: completedAt,
        last_attempt_at: attemptAt,
        next_retry_at: new Date(
          Date.parse(completedAt) +
            (report.sync_status === "current" ? CACHE_TTL_MS : RETRY_MS),
        ).toISOString(),
        cache_ttl_seconds: CACHE_TTL_MS / 1000,
      };
      // Validate size before replacing any cached last-good state.
      encodeSnapshot(report);
    } catch (error) {
      const code = errorCode(error);
      report = {
        ...(previous || { ...baseReport(), available: false }),
        sync_status: code === "export_missing" ? "waiting" : "error",
        error_code: code,
        warning: failureMessage(code),
        last_sync_at: previous?.last_sync_at || null,
        last_attempt_at: attemptAt,
        next_retry_at: new Date(Date.parse(attemptAt) + RETRY_MS).toISOString(),
        cache_ttl_seconds: CACHE_TTL_MS / 1000,
      };
    }
    if (!report.available) report.hint = report.warning;
    try {
      await client.projects.databases.documents.patch(
        {
          name: DOC_PATH,
          ...(loaded?.updateTime
            ? { "currentDocument.updateTime": loaded.updateTime }
            : { "currentDocument.exists": false }),
          requestBody: { fields: encodeSnapshot(report) },
        },
        { timeout: 8_000, retry: false },
      );
    } catch (error) {
      // A conditional update prevents a late refresh from overwriting a newer one.
      if ([409, 412].includes(Number(error?.response?.status || error?.code))) {
        try {
          return decodeSnapshot(
            (
              await client.projects.databases.documents.get(
                { name: DOC_PATH },
                { timeout: 5_000, retry: false },
              )
            ).data.fields,
          );
        } catch {
          /* Return our verified result with a persistence warning. */
        }
      }
      report = {
        ...report,
        warning: [
          report.warning,
          "Das Zwischenspeichern des abgerufenen Stands konnte nicht bestätigt werden.",
        ]
          .filter(Boolean)
          .join(" "),
        cache_warning: "cache_save_failed",
      };
    }
    return report;
  }
  return async (req, res) => {
    res.setHeader("Cache-Control", "private, no-store");
    if (!authorized(req, password()))
      return sendBillingJson(req, res, { error: "Unauthorized" }, 401);
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return sendBillingJson(req, res, { error: "Method not allowed" }, 405);
    }
    let previous = null,
      loaded = null,
      client;
    try {
      client = firestore();
      loaded = (
        await client.projects.databases.documents.get(
          { name: DOC_PATH },
          { timeout: 8_000, retry: false },
        )
      ).data;
      previous = decodeSnapshot(loaded.fields);
    } catch (error) {
      if (Number(error?.response?.status || error?.code) !== 404)
        return sendBillingJson(
          req,
          res,
          {
            ...baseReport(),
            available: false,
            sync_status: "error",
            error_code: errorCode(error),
            error: failureMessage(errorCode(error)),
            warning: failureMessage(errorCode(error)),
            last_sync_at: null,
            last_attempt_at: null,
            next_retry_at: new Date(Date.parse(now()) + RETRY_MS).toISOString(),
          },
          503,
        );
    }
    const attemptAt = now();
    if (
      req.query?.refresh !== "1" &&
      previous?.next_retry_at &&
      Date.parse(attemptAt) < Date.parse(previous.next_retry_at)
    )
      return sendBillingJson(
        req,
        res,
        previous,
        !previous.available && previous.sync_status === "error" ? 503 : 200,
      );
    if (!inFlight)
      inFlight = synchronize(previous, loaded, client, attemptAt).finally(
        () => {
          inFlight = null;
        },
      );
    const report = await inFlight;
    return sendBillingJson(
      req,
      res,
      report,
      !report.available && report.sync_status === "error" ? 503 : 200,
    );
  };
}

export default createBillingHandler();
