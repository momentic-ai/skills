# Download run artifacts

Use the API when MCP output is missing or you need to inspect raw files.

Download each attempt ZIP from the export response without printing signed URLs:

```bash
RUN_ID="<run-id>"
MOMENTIC_SERVER_URL="${MOMENTIC_SERVER:-https://api.momentic.ai}"
RUN_INSPECTION_DIR="$(mktemp -d)"

curl --fail --silent --show-error \
  -H "Authorization: Bearer ${MOMENTIC_API_KEY:?Set MOMENTIC_API_KEY}" \
  "${MOMENTIC_SERVER_URL}/v1/runs/${RUN_ID}/export" \
  -o "${RUN_INSPECTION_DIR}/export.json"

jq '.run' "${RUN_INSPECTION_DIR}/export.json" \
  > "${RUN_INSPECTION_DIR}/metadata.json"

jq -r '.attemptZipUrls | to_entries[] | select(.value != null) |
  [(.key + 1), .value] | @tsv' "${RUN_INSPECTION_DIR}/export.json" |
  while IFS=$'\t' read -r attempt url; do
    mkdir -p "${RUN_INSPECTION_DIR}/attempts/${attempt}"
    curl --fail --silent --show-error "$url" \
      -o "${RUN_INSPECTION_DIR}/attempt-${attempt}.zip"
    unzip -q "${RUN_INSPECTION_DIR}/attempt-${attempt}.zip" \
      -d "${RUN_INSPECTION_DIR}/attempts/${attempt}"
  done
```

Inspect `metadata.json`, each attempt's `metadata.json`, screenshots, state
snapshots, logs, recordings, and crash archives when present.
Keep attempt numbers intact. Do not commit the export response, run artifacts,
signed URLs, credentials, or customer data. Remove the temporary directory when
the investigation is complete.
