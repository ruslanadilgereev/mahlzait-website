// Speichern/Laden des Google-Ads-Leaderboard-Stands gegen ein nachgebautes
// Firestore mit dem echten Limit von 1 MiB pro Dokument.
// Ausfuehren: node --test test/*.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadState, saveState } from "../api/google-ads-leaderboard.mjs";

const LIMIT = 1_048_576;
const DOC = "projects/mytemple-460913/databases/(default)/documents/google_ads_leaderboard_cache/state";

// Groessenregeln laut Firestore-Doku (storage-size): String = UTF-8-Bytes + 1,
// Zahl = 8, Bool/Null = 1, Feldname = Bytes + 1, Dokument + 32 Byte Overhead.
function valueSize(v) {
  if ("stringValue" in v) return Buffer.byteLength(v.stringValue, "utf8") + 1;
  if ("integerValue" in v || "doubleValue" in v) return 8;
  if ("arrayValue" in v) return (v.arrayValue.values || []).reduce((s, x) => s + valueSize(x), 0);
  if ("mapValue" in v) return fieldsSize(v.mapValue.fields || {});
  return 1;
}
function fieldsSize(fields) {
  return Object.entries(fields).reduce((s, [k, v]) => s + Buffer.byteLength(k) + 1 + valueSize(v), 0);
}
// Firestore speichert UTF-8: eine zerschnittene Emoji-Haelfte wird dabei zu U+FFFD.
function throughUtf8(v) {
  if ("stringValue" in v) return { stringValue: Buffer.from(v.stringValue, "utf8").toString("utf8") };
  if ("arrayValue" in v) return { arrayValue: { values: (v.arrayValue.values || []).map(throughUtf8) } };
  if ("mapValue" in v) return { mapValue: { fields: storeFields(v.mapValue.fields || {}) } };
  return v;
}
function storeFields(fields) {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, throughUtf8(v)]));
}

function fakeFirestore() {
  const docs = new Map();
  const check = (name, fields) => {
    const size = Buffer.byteLength(name.split("/documents/")[1]) + 1 + fieldsSize(fields) + 32;
    if (size > LIMIT) {
      throw new Error(`Document '${name}' cannot be written because its size (${size} bytes) exceeds the maximum allowed size of ${LIMIT} bytes.`);
    }
  };
  return {
    docs,
    projects: { databases: { documents: {
      async get({ name }) {
        if (!docs.has(name)) throw Object.assign(new Error("not found"), { code: 404 });
        return { data: { name, fields: docs.get(name) } };
      },
      async patch({ name, requestBody }) {
        check(name, requestBody.fields);
        docs.set(name, storeFields(requestBody.fields));
        return { data: {} };
      },
      // Commit ist atomar: erst alles pruefen, dann alles schreiben.
      async commit({ requestBody }) {
        for (const w of requestBody.writes) check(w.update.name, w.update.fields);
        for (const w of requestBody.writes) docs.set(w.update.name, storeFields(w.update.fields));
        return { data: {} };
      },
    } } },
  };
}

// Nachbau des Stands vom 30.09.2026 (~1,3 MB): viele geprueft-UIDs + Google-Kunden.
function bigState() {
  const uid = (i) => `$RCAnonymousID:${String(i).padStart(32, "0")}`;
  return {
    last_pull_ts_ms: 1_790_000_000_000,
    currency: "EUR",
    spend_history_from: "2026-07-02",
    spend_history_to: "2026-09-30",
    customer_id: "3583858609",
    campaigns: [{ id: "1", name: "Mahlzait App Ö", status: "ENABLED", channel_type: "MULTI_CHANNEL",
      daily: Array.from({ length: 90 }, (_, d) => ({ date: `2026-07-${d}`, spend: 29.87, clicks: 41, conversions: 3.5 })) }],
    google_customers: Array.from({ length: 1500 }, (_, i) => ({
      id: uid(i), country: "DE", platform: "android", first_seen_at: 1_780_000_000_000, last_seen_at: null,
      gclid: `Cj0KCQjw${"x".repeat(80)}${i}`, gbraid: null, wbraid: null, utm_medium: null,
      subs: [{ status: "active", ownership: "purchased", store: "play_store", product_id: "mahlzait_pro_yearly",
        starts_at: 1_780_000_000_000, current_period_starts_at: 1_780_000_000_000, ends_at: null,
        auto_renewal_status: "will_renew", gross_usd: 39.99, proceeds_usd: 29.1 }],
    })),
    seen_uids: Array.from({ length: 20_000 }, (_, i) => uid(i)),
    last_refresh_meta: { ms_total: 81_000, enrich_errors: 0, campaigns: 1 },
  };
}

test("Stand ueber 1 MB wird gespeichert und unveraendert zurueckgelesen", async () => {
  const fs = fakeFirestore();
  const state = bigState();
  assert.ok(Buffer.byteLength(JSON.stringify(state)) > LIMIT, "Testdaten muessen ueber dem Limit liegen");
  await saveState(fs, state);
  assert.deepEqual(await loadState(fs), state);
});

test("Emoji an einer Teilgrenze uebersteht das Speichern", async () => {
  const fs = fakeFirestore();
  // Ungerade Vorlaufzahl, damit eine Grenze mitten in ein Emoji-Paar faellt.
  const state = { a: "x", note: "😀".repeat(400_000) };
  await saveState(fs, state);
  assert.deepEqual(await loadState(fs), state);
});

test("alter Einzeldokument-Stand (bis Juni 2026) bleibt lesbar", async () => {
  const fs = fakeFirestore();
  fs.docs.set(DOC, {
    last_pull_ts_ms: { integerValue: "1782000000000" },
    currency: { stringValue: "EUR" },
    seen_uids: { arrayValue: { values: [{ stringValue: "u1" }, { stringValue: "u2" }] } },
    campaigns: { arrayValue: { values: [{ mapValue: { fields: { id: { stringValue: "7" }, spend: { doubleValue: 1.5 } } } }] } },
  });
  assert.deepEqual(await loadState(fs), {
    last_pull_ts_ms: 1782000000000,
    currency: "EUR",
    seen_uids: ["u1", "u2"],
    campaigns: [{ id: "7", spend: 1.5 }],
  });
});

test("ohne gespeicherten Stand kommt null", async () => {
  assert.equal(await loadState(fakeFirestore()), null);
});
