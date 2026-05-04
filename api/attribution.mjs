// Self-reported onboarding attribution Cockpit-Endpoint.
// Datenquelle: BigQuery view `users_master_with_self_attribution`
//             JOIN `subscription_events` (last 30 days).
// Auth: shared DASHBOARD_PASSWORD (same as /api/dashboard).

import { google } from 'googleapis';

const PROJECT_ID = 'mytemple-460913';
const DATASET = 'analytics_derived';

const SQL = `
WITH attr AS (
  SELECT user_id,
         COALESCE(onboarding_attribution, '__null__') AS bucket
  FROM \`${PROJECT_ID}.${DATASET}.users_master_with_self_attribution\`
  WHERE user_id IS NOT NULL
),
trials AS (
  SELECT DISTINCT user_id
  FROM \`${PROJECT_ID}.${DATASET}.subscription_events\`
  WHERE event_type = 'trial_started'
    AND event_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
    AND user_id IS NOT NULL
),
paid AS (
  SELECT DISTINCT user_id
  FROM \`${PROJECT_ID}.${DATASET}.subscription_events\`
  WHERE has_revenue = TRUE
    AND is_trial = FALSE
    AND event_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
    AND user_id IS NOT NULL
)
SELECT
  attr.bucket AS bucket,
  COUNTIF(t.user_id IS NOT NULL) AS trials_30d,
  COUNTIF(p.user_id IS NOT NULL) AS paid_30d,
  SAFE_DIVIDE(COUNTIF(p.user_id IS NOT NULL), COUNTIF(t.user_id IS NOT NULL)) AS cvr
FROM attr
LEFT JOIN trials t USING (user_id)
LEFT JOIN paid p USING (user_id)
GROUP BY attr.bucket
HAVING trials_30d > 0 OR paid_30d > 0
ORDER BY trials_30d DESC, paid_30d DESC
`;

export default async function handler(req, res) {
  try {
    const pw = req.query?.pw || '';
    if (!pw || pw !== process.env.DASHBOARD_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const credentials = loadServiceAccount();
    if (!credentials) {
      return res.status(500).json({
        error: 'gcp_credentials_missing',
        hint: 'Set GCP_SERVICE_ACCOUNT_JSON_B64 (base64 of service-account JSON) on Vercel.',
      });
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/bigquery.readonly'],
    });

    const bigquery = google.bigquery({ version: 'v2', auth });
    const queryRes = await bigquery.jobs.query({
      projectId: PROJECT_ID,
      requestBody: {
        query: SQL,
        useLegacySql: false,
        timeoutMs: 25000,
        location: 'EU',
      },
    });

    const rows = (queryRes.data.rows || []).map((r) => {
      const [bucket, trials, paid, cvr] = r.f.map((c) => c.v);
      const trialsN = parseInt(trials || '0', 10);
      const paidN = parseInt(paid || '0', 10);
      const cvrF = cvr === null || cvr === undefined ? null : Number(cvr);
      return {
        bucket,
        trials_30d: trialsN,
        paid_30d: paidN,
        cvr_pct: cvrF === null ? null : +(cvrF * 100).toFixed(1),
      };
    });

    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
    return res.json({
      ts: new Date().toISOString(),
      window: 'last_30_days',
      disclaimer: 'Self-reported, ~70% Genauigkeit',
      rows,
    });
  } catch (e) {
    return res.status(500).json({
      error: String(e.message || e),
      stack: String(e.stack || '').slice(0, 600),
    });
  }
}

function loadServiceAccount() {
  const b64 = process.env.GCP_SERVICE_ACCOUNT_JSON_B64;
  if (b64) {
    try {
      return JSON.parse(Buffer.from(b64, 'base64').toString('utf-8'));
    } catch {
      return null;
    }
  }
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}
