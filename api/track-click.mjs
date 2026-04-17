import { createHash } from "node:crypto";
import { google } from "googleapis";

const PROJECT_ID = "mytemple-460913";
const COLLECTION = "link_clicks";

const VALID_SOURCES = new Set([
  "instagram", "tiktok", "youtube", "facebook",
  "twitter", "reddit", "sms", "whatsapp", "email", "direct",
]);

const SLUG_RE = /^[a-z0-9_-]{1,40}$/;

let cachedAuth = null;

function getAuth() {
  if (cachedAuth) return cachedAuth;
  if (!process.env.GOOGLE_SA_KEY) {
    throw new Error("GOOGLE_SA_KEY env var missing");
  }
  const saJson = JSON.parse(
    Buffer.from(process.env.GOOGLE_SA_KEY, "base64").toString("utf-8"),
  );
  cachedAuth = new google.auth.GoogleAuth({
    credentials: saJson,
    scopes: ["https://www.googleapis.com/auth/datastore"],
  });
  return cachedAuth;
}

function hashIp(ip) {
  if (!ip) return "";
  const salt = process.env.IP_HASH_SALT || "mahlzait-golink";
  return createHash("sha256").update(salt + "|" + ip).digest("hex").slice(0, 16);
}

function clientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string") return xff.split(",")[0].trim();
  return req.socket?.remoteAddress || "";
}

function trunc(s, n) {
  if (!s) return "";
  return String(s).slice(0, n);
}

export default async function handler(req, res) {
  // CORS: only same-origin / mahlzait.de
  const origin = req.headers.origin || "";
  const allowed = ["https://www.mahlzait.de", "https://mahlzait.de", "http://localhost:4321"];
  if (allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const slug = String(body.slug || "").toLowerCase().trim();
    const source = String(body.source || "direct").toLowerCase().trim();

    if (!SLUG_RE.test(slug)) {
      return res.status(400).json({ error: "Invalid slug" });
    }
    if (!VALID_SOURCES.has(source)) {
      return res.status(400).json({ error: "Invalid source" });
    }

    const auth = getAuth();
    const firestore = google.firestore({ version: "v1", auth });

    const doc = {
      fields: {
        slug:       { stringValue: slug },
        source:     { stringValue: source },
        referrer:   { stringValue: trunc(body.referrer, 200) },
        ua:         { stringValue: trunc(req.headers["user-agent"], 200) },
        ipHash:     { stringValue: hashIp(clientIp(req)) },
        ts:         { timestampValue: new Date().toISOString() },
      },
    };

    await firestore.projects.databases.documents.createDocument({
      parent: `projects/${PROJECT_ID}/databases/(default)/documents`,
      collectionId: COLLECTION,
      requestBody: doc,
    });

    return res.status(204).end();
  } catch (e) {
    console.error("[track-click]", e?.message, e?.stack?.slice(0, 300));
    return res.status(500).json({ error: "Internal error" });
  }
}
