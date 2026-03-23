import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SignJWT, importPKCS8 } from 'jose';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pw = req.query.pw as string;
  if (!pw || pw !== process.env.DASHBOARD_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const apple = await fetchAppleSubscriptions();
    return res.status(200).json({ timestamp: new Date().toISOString(), apple });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

async function fetchAppleSubscriptions() {
  const { APPLE_ISSUER_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY_B64, APPLE_VENDOR } = process.env;
  if (!APPLE_ISSUER_ID || !APPLE_KEY_ID || !APPLE_PRIVATE_KEY_B64) {
    return { error: 'Apple credentials not configured' };
  }

  const pem = Buffer.from(APPLE_PRIVATE_KEY_B64, 'base64').toString('utf-8');
  const privateKey = await importPKCS8(pem, 'ES256');

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: APPLE_KEY_ID, typ: 'JWT' })
    .setIssuer(APPLE_ISSUER_ID)
    .setIssuedAt()
    .setExpirationTime('20m')
    .setAudience('appstoreconnect-v1')
    .sign(privateKey);

  const headers = { Authorization: `Bearer ${token}` };
  const vendor = APPLE_VENDOR || '93509467';

  const dates = getLast7Dates();
  const trend: any[] = [];

  for (const date of dates) {
    const url = `https://api.appstoreconnect.apple.com/v1/salesReports?filter[frequency]=DAILY&filter[reportDate]=${date}&filter[reportSubType]=SUMMARY&filter[reportType]=SUBSCRIPTION&filter[vendorNumber]=${vendor}&filter[version]=1_4`;
    const r = await fetch(url, { headers });

    if (r.status === 200) {
      const buf = Buffer.from(await r.arrayBuffer());
      const { gunzipSync } = await import('zlib');
      const tsv = gunzipSync(buf).toString('utf-8');
      const rows = parseTSV(tsv);

      let paid = 0, trial = 0, billingRetry = 0;
      let monthlyPaid = 0, yearlyPaid = 0, monthlyTrial = 0, yearlyTrial = 0;

      for (const row of rows) {
        const p = parseInt(row['Active Standard Price Subscriptions'] || '0');
        const t = parseInt(row['Active Free Trial Introductory Offer Subscriptions'] || '0');
        const br = parseInt(row['Billing Retry'] || '0');
        const sub = row['Subscription Name'] || '';

        paid += p; trial += t; billingRetry += br;
        if (sub.includes('Monthly')) { monthlyPaid += p; monthlyTrial += t; }
        else if (sub.includes('Yearly')) { yearlyPaid += p; yearlyTrial += t; }
      }

      trend.push({ date, paid, trial, billingRetry, total: paid + trial + billingRetry, monthlyPaid, yearlyPaid, monthlyTrial, yearlyTrial });
    }
  }

  trend.reverse();
  const latest = trend.length ? trend[trend.length - 1] : null;
  const mrr = latest ? {
    monthlyGross: +(latest.monthlyPaid * 4.99 + latest.yearlyPaid * (29.99 / 12)).toFixed(2),
    monthlyNet: +((latest.monthlyPaid * 4.99 + latest.yearlyPaid * (29.99 / 12)) * 0.85).toFixed(2),
  } : null;

  return { latestDate: latest?.date, current: latest, mrr, trend };
}

function getLast7Dates(): string[] {
  const dates: string[] = [];
  for (let i = 2; i < 9; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function parseTSV(tsv: string): Record<string, string>[] {
  const lines = tsv.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split('\t');
  return lines.slice(1).map(line => {
    const vals = line.split('\t');
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => obj[h.trim()] = (vals[i] || '').trim());
    return obj;
  });
}
