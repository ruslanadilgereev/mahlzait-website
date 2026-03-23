import { SignJWT, importPKCS8 } from 'jose';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const pw = url.searchParams.get('pw');

  if (!pw || pw !== process.env.DASHBOARD_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const apple = await fetchAppleSubscriptions();
    return Response.json({ timestamp: new Date().toISOString(), apple }, {
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });
  } catch (e: any) {
    return Response.json({ error: e.message, stack: e.stack?.slice(0, 500) }, { status: 500 });
  }
}

async function fetchAppleSubscriptions() {
  const ISSUER = process.env.APPLE_ISSUER_ID;
  const KEY_ID = process.env.APPLE_KEY_ID;
  const KEY_B64 = process.env.APPLE_PRIVATE_KEY_B64;
  const VENDOR = process.env.APPLE_VENDOR || '93509467';

  if (!ISSUER || !KEY_ID || !KEY_B64) {
    return { error: 'Apple credentials not configured', has: { ISSUER: !!ISSUER, KEY_ID: !!KEY_ID, KEY_B64: !!KEY_B64 } };
  }

  const pem = atob(KEY_B64);
  const privateKey = await importPKCS8(pem, 'ES256');

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime('20m')
    .setAudience('appstoreconnect-v1')
    .sign(privateKey);

  const headers = { Authorization: `Bearer ${token}` };
  const dates = getLast7Dates();
  const trend: any[] = [];

  for (const date of dates) {
    const apiUrl = `https://api.appstoreconnect.apple.com/v1/salesReports?filter[frequency]=DAILY&filter[reportDate]=${date}&filter[reportSubType]=SUMMARY&filter[reportType]=SUBSCRIPTION&filter[vendorNumber]=${VENDOR}&filter[version]=1_4`;
    const r = await fetch(apiUrl, { headers });

    if (r.status === 200) {
      const buf = await r.arrayBuffer();
      const tsv = await decompressGzip(new Uint8Array(buf));
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

async function decompressGzip(data: Uint8Array): Promise<string> {
  const ds = new DecompressionStream('gzip');
  const w = ds.writable.getWriter();
  w.write(data);
  w.close();
  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
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
