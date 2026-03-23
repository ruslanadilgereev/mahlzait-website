import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SignJWT, importPKCS8 } from 'jose';
import { gunzipSync } from 'zlib';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pw = (req.query.pw as string) || '';
  if (!pw || pw !== process.env.DASHBOARD_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const apple = await fetchApple();
    return res.json({ timestamp: new Date().toISOString(), apple });
  } catch (e: any) {
    return res.status(500).json({ error: e.message, stack: (e.stack || '').slice(0, 500) });
  }
}

async function fetchApple() {
  const ISSUER = process.env.APPLE_ISSUER_ID || '';
  const KEY_ID = process.env.APPLE_KEY_ID || '';
  const KEY_B64 = process.env.APPLE_PRIVATE_KEY_B64 || '';
  const VENDOR = process.env.APPLE_VENDOR || '93509467';

  if (!ISSUER || !KEY_ID || !KEY_B64) {
    return { error: 'Credentials missing', has: { ISSUER: !!ISSUER, KEY_ID: !!KEY_ID, KEY_B64: !!KEY_B64 } };
  }

  const pem = Buffer.from(KEY_B64, 'base64').toString('utf-8');
  const pk = await importPKCS8(pem, 'ES256');

  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime('20m')
    .setAudience('appstoreconnect-v1')
    .sign(pk);

  const headers = { Authorization: `Bearer ${jwt}` };
  const trend: any[] = [];
  const debug: any[] = [];

  for (let i = 2; i < 9; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const url = `https://api.appstoreconnect.apple.com/v1/salesReports?filter[frequency]=DAILY&filter[reportDate]=${date}&filter[reportSubType]=SUMMARY&filter[reportType]=SUBSCRIPTION&filter[vendorNumber]=${VENDOR}&filter[version]=1_4`;

    const r = await fetch(url, { headers });

    if (r.status !== 200) {
      const t = await r.text().catch(() => '');
      debug.push({ date, status: r.status, body: t.slice(0, 200) });
      continue;
    }

    const buf = Buffer.from(await r.arrayBuffer());
    const tsv = gunzipSync(buf).toString('utf-8');
    const rows = parseTSV(tsv);

    let paid = 0, trial = 0, retry = 0;
    let mP = 0, yP = 0, mT = 0, yT = 0;

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
  }

  trend.reverse();
  const latest = trend.length ? trend[trend.length - 1] : null;
  const mrr = latest ? {
    gross: +(latest.mP * 4.99 + latest.yP * (29.99 / 12)).toFixed(2),
    net: +((latest.mP * 4.99 + latest.yP * (29.99 / 12)) * 0.85).toFixed(2),
  } : null;

  return { latestDate: latest?.date, current: latest, mrr, trend, debug: debug.slice(0, 2) };
}

function int(v: string | undefined): number { return parseInt(v || '0') || 0; }

function parseTSV(tsv: string): Record<string, string>[] {
  const lines = tsv.trim().split('\n');
  if (lines.length < 2) return [];
  const h = lines[0].split('\t');
  return lines.slice(1).map(l => {
    const v = l.split('\t');
    const o: Record<string, string> = {};
    h.forEach((k, i) => o[k.trim()] = (v[i] || '').trim());
    return o;
  });
}
