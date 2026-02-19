#!/usr/bin/env python3
"""GSC API query for mahlzait.de"""

import json
from datetime import datetime, timedelta
from google.oauth2 import service_account
from googleapiclient.discovery import build

CREDENTIALS_FILE = '/home/ubuntu/clawd/.secrets/mahlzait-gsc-service-account.json'
SITE_URL = 'sc-domain:mahlzait.de'

credentials = service_account.Credentials.from_service_account_file(
    CREDENTIALS_FILE,
    scopes=['https://www.googleapis.com/auth/webmasters.readonly']
)

service = build('searchconsole', 'v1', credentials=credentials)

# Date range: last 7 days (GSC has ~2-3 day delay)
end_date = (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d')
start_date = (datetime.now() - timedelta(days=8)).strftime('%Y-%m-%d')

print(f"Querying period: {start_date} to {end_date}")

# Overall stats
overall = service.searchanalytics().query(
    siteUrl=SITE_URL,
    body={
        'startDate': start_date,
        'endDate': end_date,
        'dimensions': [],
        'rowLimit': 1
    }
).execute()

print("\n=== OVERALL ===")
if 'rows' in overall:
    row = overall['rows'][0]
    print(f"Impressions: {row['impressions']}")
    print(f"Clicks: {row['clicks']}")
    print(f"CTR: {row.get('ctr', 0)*100:.1f}%")
    print(f"Position: {row.get('position', 0):.1f}")
else:
    print("No data")

# Top pages
pages = service.searchanalytics().query(
    siteUrl=SITE_URL,
    body={
        'startDate': start_date,
        'endDate': end_date,
        'dimensions': ['page'],
        'rowLimit': 10
    }
).execute()

print("\n=== TOP PAGES ===")
if 'rows' in pages:
    for row in pages['rows']:
        print(f"{row['keys'][0]}: {row['impressions']} imp, pos {row['position']:.1f}")
else:
    print("No page data")

# Top queries
queries = service.searchanalytics().query(
    siteUrl=SITE_URL,
    body={
        'startDate': start_date,
        'endDate': end_date,
        'dimensions': ['query'],
        'rowLimit': 15
    }
).execute()

print("\n=== TOP QUERIES ===")
if 'rows' in queries:
    for row in queries['rows']:
        print(f"'{row['keys'][0]}': {row['impressions']} imp, pos {row['position']:.1f}")
else:
    print("No query data")

# Output as JSON for parsing
result = {
    'period': f"{start_date} to {end_date}",
    'overall': overall.get('rows', [{}])[0] if 'rows' in overall else {},
    'pages': pages.get('rows', []),
    'queries': queries.get('rows', [])
}
print("\n=== JSON ===")
print(json.dumps(result, indent=2))
