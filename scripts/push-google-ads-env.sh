#!/usr/bin/env bash
# Pusht die 6 GOOGLE_ADS_* Env-Vars aus .env.google-ads.local nach Vercel.
# Voraussetzung: `vercel login` + im Repo `vercel link` bereits gemacht.
# Usage:  bash scripts/push-google-ads-env.sh [production|preview|development]
set -euo pipefail
ENV_FILE="$(dirname "$0")/../.env.google-ads.local"
TARGET="${1:-production}"

[ -f "$ENV_FILE" ] || { echo "Fehlt: $ENV_FILE"; exit 1; }

while IFS='=' read -r key val; do
  [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
  echo "→ $key ($TARGET)"
  # vorhandenen Wert entfernen (idempotent), Fehler ignorieren falls nicht vorhanden
  vercel env rm "$key" "$TARGET" -y >/dev/null 2>&1 || true
  printf '%s' "$val" | vercel env add "$key" "$TARGET" >/dev/null
done < "$ENV_FILE"

echo "Fertig. Danach neu deployen (git push oder \`vercel --prod\`), damit die Function die Vars sieht."
