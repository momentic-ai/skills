# Inspect run evidence

## Inspect the existing classification

Fetch raw run metadata before MCP investigation when an API key is available:

```bash
RUN_ID="<run-id>"
MOMENTIC_SERVER_URL="${MOMENTIC_SERVER:-https://api.momentic.ai}"
RUN_INSPECTION_DIR="$(mktemp -d)"

curl --fail --silent --show-error \
  -H "Authorization: Bearer ${MOMENTIC_API_KEY:?Set MOMENTIC_API_KEY}" \
  "${MOMENTIC_SERVER_URL}/v1/runs/${RUN_ID}/metadata" \
  -o "${RUN_INSPECTION_DIR}/metadata.json"

jq '{
  runId: .id,
  status,
  failureReason,
  classification: .failureDetails.classification,
  manualClassification: .failureDetails.manualClassification,
  healStatus,
  healDetails
}' "${RUN_INSPECTION_DIR}/metadata.json"
```

Do not treat a missing field as proof that no human reviewed the failure until
the metadata request succeeds for the exact run and organization. Do not echo,
log, or commit the API key. Treat downloaded metadata and signed artifact URLs
as sensitive run data.

`momentic_get_run` omits saved classification and heal fields; use the metadata endpoint or dashboard for those verdicts.

## Compare history

- For branch incidents, call `momentic_list_runs` with the exact `gitBranchName` and bounded `start`/`end`. Start without a status filter, then narrow to `FAILED`, `CANCELLED`, or `recovered=true`. Omit the branch only for a specific cross-branch question.
- For mobile history, filter `executionType` to `["ANDROID", "IOS"]` or the
  affected platform.
- Use `failureCategory` for effective classification (manual when present, otherwise automated). The `minAttempts` filter counts total attempts. Use `minAttempts: 2` for at least one retry, or 3 for at least two.
- Use `momentic_quarantine_list` with a bounded quarantine-date range for active local test quarantines and each test's latest retained failed CLI run. It does not filter by branch or category.
- Read all `pageCount` pages needed before claiming an exhaustive inventory. Group symptoms only after inspecting representative runs and steps.
- Open each comparison with `momentic_get_run`, then `momentic_get_step_result` for the matching step/container. Do not cite list summaries alone.
- For passing runs with `attempts > 1`, retrieve earlier failed attempts using `attemptNumber`. Recovery can leave invalid state.
- Call behavior flaky only after ruling out app and test changes. One failure is insufficient.
- Skip history when the current run already proves the cause; say so in the report.

## Read local results

Read local CLI results from `test-results` unless project settings or the run override the output directory.
The group has `metadata.json` with git/timing data and `runs/<runId>.zip` per test.

Unzip a run and inspect:

- `metadata.json` for run metadata.
- `attempts/<n>/metadata.json` for attempt outcomes and step results; attempt numbers start at 1.
- `attempts/<n>/console.json` for browser console output when captured.
- `attempts/<n>/assets/<snapshotId>.jpeg` and `.html` for screenshots and DOM snapshots referenced by step metadata.
- `assets/har-pages.log` and `har-entries.log` within the attempt for HAR NDJSON.
- `assets/resource-usage.ndjson` for CPU/memory samples, video files when enabled, and `browser-crash.zip` on crashes.

MCP `momentic_get_run` links to extracted `run-result-<runId>` folders in its working directory (default `.momentic-mcp`).

## Inspect locator caches

For a wrong cached target, request `includeTrace=true` on `momentic_get_step_result`.
Read `cacheBustReason` on the step result's `trace` and inspect the result's `cache`.
Use the `runId` field in the incorrect cache's `targetUpdateLoggerTags` to open the original cache-update run with `momentic_get_run`.

## Check module state

A cached module skips its steps when its cache key and resolved inputs are
unchanged, reusing the last step's return value.
When a cached authentication module skips login, inspect the resulting page and
account state before blaming a later step.

## Check uploads

Run a file-upload step before the action that opens the native picker.
Sources can be remote URLs, `file://` references to earlier downloads, CLI-local paths, or uploaded user files.
Check any presented-filename override when investigating the selected file.
