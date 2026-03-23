import { createPrivateKey, createSign } from 'node:crypto';
import { gunzipSync } from 'node:zlib';

export default async function handler(req, res) {
  try {
    const pw = req.query?.pw || '';
    if (!pw || pw !== process.env.DASHBOARD_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const apple = await fetchApple();
    return res.json({ ts: new Date().toISOString(), apple });
  } catch (e) {
    return res.status(500).json({ error: String(e.message), stack: String(e.stack).slice(0, 500) });
  }
}

function base64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

function makeJWT(issuerId, keyId, pemKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'ES256', kid: keyId, typ: 'JWT' };
  const payload = { iss: issuerId, iat: now, exp: now + 1200, aud: 'appstoreconnect-v1' };

  const segments = base64url(JSON.stringify(header)) + '.' + base64url(JSON.stringify(payload));
  const sign = createSign('SHA256');
  sign.update(segments);
  const sig = sign.sign({ key: pemKey, dsaEncoding: 'ieee-p1363' });

  return segments + '.' + base64url(sig);
}

async function fetchApple() {
  const ISSUER = process.env.APPLE_ISSUER_ID || '';
  const KEY_ID = process.env.APPLE_KEY_ID || '';
  const KEY_B64 = process.env.APPLE_PRIVATE_KEY_B64 || '';
  const VENDOR = process.env.APPLE_VENDOR || '93509467';

  if (!ISSUER || !KEY_ID || !KEY_B64) {
    return { error: 'env_missing', has: { i: !!ISSUER, k: !!KEY_ID, b: !!KEY_B64 } };
  }

  const pem = Buffer.from(KEY_B64, 'base64').toString('utf-8');
  const jwt = makeJWT(ISSUER, KEY_ID, pem);
  const headers = { Authorization: 'Bearer ' + jwt };

  const trend = [];
  const debug = [];

  for (let i = 2; i < 9; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const url = `https://api.appstoreconnect.apple.com/v1/salesReports?filter[frequency]=DAILY&filter[reportDate]=${date}&filter[reportSubType]=SUMMARY&filter[reportType]=SUBSCRIPTION&filter[vendorNumber]=${VENDOR}&filter[version]=1_4`;

    let r;
    try {
      r = await fetch(url, { headers });
    } catch (err) {
      debug.push({ date, err: err.message });
      continue;
    }

    if (r.status !== 200) {
      if (debug.length < 2) {
        const t = await r.text().catch(() => '');
        debug.push({ date, s: r.status, b: t.slice(0, 200) });
      }
      continue;
    }

    try {
      const buf = Buffer.from(await r.arrayBuffer());
      const tsv = gunzipSync(buf).toString('utf-8');
      const rows = parseTSV(tsv);

      let paid = 0, trial = 0, retry = 0, mP = 0, yP = 0, mT = 0, yT = 0;

      for (const row of rows) {
        const p = int(row['Active Standard Price Subscriptions']);
        const t = int(row['Active Free Trial Introductory Offer Subscriptions']);
        const br = int(row['Billing Retry']);
        const sub = row['Subscription Name'] || '';

        paid += p; trial += t; retry += br;
        if (sub.includes('Monthly')) { mP += p; mT += t; }
        else if (sub.includes('Yearly')) { yP += p; yT += t; }
      }

      trend.push({ date, paid, trial, retry, total: paid + trial + retry, mP, yP, mT, yT });
    } catch (pe) {
      debug.push({ date, parse: pe.message });
    }
  }

  trend.reverse();
  const latest = trend.length ? trend[trend.length - 1] : null;
  const mrr = latest ? {
    gross: +(latest.mP * 4.99 + latest.yP * (29.99 / 12)).toFixed(2),
    net: +((latest.mP * 4.99 + latest.yP * (29.99 / 12)) * 0.85).toFixed(2),
  } : null;

  return { latestDate: latest?.date, current: latest, mrr, trend, debug };
}

function int(v) { return parseInt(v || '0') || 0; }

function parseTSV(tsv) {
  const lines = tsv.trim().split('\n');
  if (lines.length < 2) return [];
  const h = lines[0].split('\t');
  return lines.slice(1).map(l => {
    const v = l.split('\t');
    const o = {};
    h.forEach((k, i) => o[k.trim()] = (v[i] || '').trim());
    return o;
  });
}
