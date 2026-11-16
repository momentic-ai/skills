# Inspect run evidence

## Read saved classifications

With API access, retrieve metadata for the exact run and organization before
assigning a new classification:

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

Use this endpoint or the dashboard for saved classification/heal verdicts;
`momentic_get_run` doesn't include them. Establish that the request succeeded
before interpreting absent fields. Keep credentials and downloaded run data private.

## Compare history

Call `momentic_list_runs` with the incident's `gitBranchName` and bounded
`start`/`end`. Start without a status filter; then narrow to `FAILED`,
`CANCELLED`, or `recovered=true`. Omit the branch for cross-branch questions.

Use `failureCategory` for the effective classification and `minAttempts: 2`
for at least one retry, or 3 for two. For quarantine, use
`momentic_quarantine_list` with bounded dates; it has no branch/category filter.

Read every required page before claiming a complete inventory.
Open representative runs with `momentic_get_run` and their matching
`momentic_get_step_result`. For recovered runs, inspect earlier
`attemptNumber` values and their resulting state.
Rule out app and test changes before calling behavior flaky.
Skip history when current evidence proves the cause and say so.

Past runs may use different test steps than today's file. Read
`momentic_get_test_steps_for_run` for the run being cited, and inspect its step
results and screenshots rather than relying on run summaries alone.
For quarantine work, track each test through classification, repair, and replay;
report the date range, quarantine count, retained and missing runs, each outcome,
delivery artifact, and blockers.

## Explain the divergence

Name the broken postcondition, not just "wrong state" or "unreliable setup."
Distinguish a missing target from a target absent because setup left the wrong
page, filter, overlay, or selected row. A successful click doesn't prove the
expected transition occurred. An untargeted type may affect the wrong input.
Trace later failures to the first step that left the wrong state.

## Read local results

Use the configured output directory, normally `test-results`.
Read the group's `metadata.json` and extract `runs/<runId>.zip`.
Inspect run metadata, `attempts/<n>/metadata.json` (starting at 1),
referenced screenshots/state, logs, and recordings.
Read the product guide when locating individual artifacts.

Use the extracted `run-result-<runId>` folder returned by `momentic_get_run`
for MCP downloads.

## Trace cached behavior

For a wrong cached target, request `includeTrace=true` on
`momentic_get_step_result`. Inspect `trace.cacheBustReason` and the result's
`cache`. Open the cache's source run from `targetUpdateLoggerTags.runId`.
Check whether `cacheBustReason` reports "Description changed", "Description
mismatch", "Cache explicitly disabled", "Cache invalidated after resolution",
or "Heuristic healed cache incompatible".

When a cached module skips authentication, inspect the resulting account and
page before blaming a later step.

## Check uploads

Place the upload step before the action opening the native picker.
Check its source (remote URL, prior `file://` download, local path, or uploaded
user file) and any presented-filename override.
