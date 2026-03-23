import type { APIRoute } from 'astro';

// All secrets come from Vercel env vars
const APPLE_ISSUER_ID = import.meta.env.APPLE_ISSUER_ID;
const APPLE_KEY_ID = import.meta.env.APPLE_KEY_ID;
const APPLE_PRIVATE_KEY_B64 = import.meta.env.APPLE_PRIVATE_KEY_B64;
const APPLE_VENDOR = import.meta.env.APPLE_VENDOR || '93509467';
const DASHBOARD_PASSWORD = import.meta.env.DASHBOARD_PASSWORD;
const GCP_SA_B64 = import.meta.env.GCP_SA_B64;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const pw = url.searchParams.get('pw');

  if (!pw || pw !== DASHBOARD_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // For now, return a simple structure
    // Apple data fetching happens server-side via JWT
    const data = await fetchDashboardData();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

async function fetchDashboardData() {
  const appleData = await fetchAppleSubscriptions();
  return {
    timestamp: new Date().toISOString(),
    apple: appleData,
  };
}

async function fetchAppleSubscriptions() {
  if (!APPLE_ISSUER_ID || !APPLE_KEY_ID || !APPLE_PRIVATE_KEY_B64) {
    return { error: 'Apple credentials not configured' };
  }

  // Dynamic import for jose (JWT signing)
  const { SignJWT, importPKCS8 } = await import('jose');

  const privateKeyPem = Buffer.from(APPLE_PRIVATE_KEY_B64, 'base64').toString('utf-8');
  const privateKey = await importPKCS8(privateKeyPem, 'ES256');

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: APPLE_KEY_ID, typ: 'JWT' })
    .setIssuer(APPLE_ISSUER_ID)
    .setIssuedAt()
    .setExpirationTime('20m')
    .setAudience('appstoreconnect-v1')
    .sign(privateKey);

  const headers = { Authorization: `Bearer ${token}` };

  // Get subscription data for last available dates
  const dates = getLastNDates(7);
  let latestData = null;
  let latestDate = '';
  let trend: any[] = [];

  for (const date of dates) {
    const res = await fetch(
      `https://api.appstoreconnect.apple.com/v1/salesReports?filter[frequency]=DAILY&filter[reportDate]=${date}&filter[reportSubType]=SUMMARY&filter[reportType]=SUBSCRIPTION&filter[vendorNumber]=${APPLE_VENDOR}&filter[version]=1_4`,
      { headers }
    );

    if (res.status === 200) {
      const buffer = await res.arrayBuffer();
      const decompressed = await decompressGzip(new Uint8Array(buffer));
      const parsed = parseTSV(decompressed);

      let paid = 0;
      let trial = 0;
      let monthlyPaid = 0;
      let yearlyPaid = 0;
      let monthlyTrial = 0;
      let yearlyTrial = 0;
      let billingRetry = 0;

      for (const row of parsed) {
        const p = parseInt(row['Active Standard Price Subscriptions'] || '0');
        const t = parseInt(row['Active Free Trial Introductory Offer Subscriptions'] || '0');
        const r = parseInt(row['Billing Retry'] || '0');
        const sub = row['Subscription Name'] || '';

        paid += p;
        trial += t;
        billingRetry += r;

        if (sub.includes('Monthly')) {
          monthlyPaid += p;
          monthlyTrial += t;
        } else if (sub.includes('Yearly')) {
          yearlyPaid += p;
          yearlyTrial += t;
        }
      }

      const dayData = {
        date,
        paid,
        trial,
        billingRetry,
        total: paid + trial + billingRetry,
        monthlyPaid,
        yearlyPaid,
        monthlyTrial,
        yearlyTrial,
      };

      trend.push(dayData);

      if (!latestData) {
        latestData = dayData;
        latestDate = date;
      }
    }
  }

  // Estimate MRR
  const mrr = latestData
    ? {
        monthlyGross: latestData.monthlyPaid * 4.99 + latestData.yearlyPaid * (29.99 / 12),
        monthlyNet:
          (latestData.monthlyPaid * 4.99 + latestData.yearlyPaid * (29.99 / 12)) * 0.85,
      }
    : null;

  return {
    latestDate,
    current: latestData,
    mrr,
    trend: trend.reverse(), // oldest first
  };
}

function getLastNDates(n: number): string[] {
  const dates: string[] = [];
  for (let i = 2; i < n + 2; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

async function decompressGzip(data: Uint8Array): Promise<string> {
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(data);
  writer.close();
  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(result);
}

function parseTSV(tsv: string): Record<string, string>[] {
  const lines = tsv.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split('\t');
  return lines.slice(1).map((line) => {
    const values = line.split('\t');
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h.trim()] = (values[i] || '').trim()));
    return obj;
  });
}
