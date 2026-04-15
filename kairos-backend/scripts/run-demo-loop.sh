#!/usr/bin/env bash
# Run the hackathon demo loop against a deployed or local backend.
# Usage:
#   export KAIROS_DEMO_BACKEND=https://your-service.up.railway.app
#   ./scripts/run-demo-loop.sh
# Optional env:
#   KAIROS_DEMO_CYCLES=15 KAIROS_DEMO_FUND_AMOUNT=0.00005 KAIROS_DEMO_A2A_AMOUNT=0.00001 KAIROS_DEMO_FUND_AGENTS=1

set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BACKEND="${KAIROS_DEMO_BACKEND:-http://localhost:3001}"
CYCLES="${KAIROS_DEMO_CYCLES:-15}"
FUND_AMOUNT="${KAIROS_DEMO_FUND_AMOUNT:-0.00005}"
A2A_AMOUNT="${KAIROS_DEMO_A2A_AMOUNT:-0.00001}"
FUND_AGENTS="${KAIROS_DEMO_FUND_AGENTS:-true}"

if [[ "$FUND_AGENTS" == "1" || "$FUND_AGENTS" == "true" ]]; then
  FUND_JSON="true"
else
  FUND_JSON="false"
fi

echo "POST $BACKEND/api/demo/run-cycles"
echo "  cycles=$CYCLES fundAgents=$FUND_JSON fundAmount=$FUND_AMOUNT amount=$A2A_AMOUNT"
echo ""

curl -s -X POST "${BACKEND}/api/demo/run-cycles" \
  -H "Content-Type: application/json" \
  -d "{\"cycles\":${CYCLES},\"fundAgents\":${FUND_JSON},\"fundAmount\":\"${FUND_AMOUNT}\",\"amount\":\"${A2A_AMOUNT}\"}"

echo ""
