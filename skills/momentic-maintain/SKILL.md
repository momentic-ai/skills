---
name: momentic-maintain
description:
  Diagnose, classify, triage, and repair failing Momentic tests with MCP run
  tools, the Momentic CLI, and manual run artifacts. Use when a developer asks
  what happened on a branch, DevX or on-call asks why main is red, or the user
  wants to inspect classifications, de-flake quarantined or recovered tests,
  reduce retries, re-classify runs, run AI triage, work through the quarantine
  backlog, or repair failures.
---

# Maintain Momentic tests

1. Identify the exact run, branch, run group, commit, or local results directory.
2. Read existing automated/manual classifications and heal state with the metadata request below. Use `momentic_get_run` for evidence, not the saved verdict.
3. Reconstruct the current failure with step screenshots. Find the earliest divergence before consulting history.
4. Explain the broken postcondition. Read [Classification](references/classification.md) when assigning a category, recoverability, and confidence.
5. Read [Repair](references/repair.md) when running `momentic ai classify` or `momentic ai triage`. Verify the app and fixtures first; choose delivery explicitly.
6. Review the diff and replay evidence. Re-run inconclusive repairs.
7. Report the diagnosis, verification, delivery, and remaining blockers.

Do not weaken a test to hide an application bug, missing fixture, invalid credentials, outage, or Momentic defect.

## Connect tools

Use hosted MCP for `momentic_list_runs`, `momentic_quarantine_list`, and `momentic_search_docs`; use local CLI MCP for artifacts and classification.
If hosted tools are missing, connect `https://mcp.momentic.ai` over HTTP and sign in with OAuth.
In Codex, run the commands below; for other clients, use [remote MCP settings](https://momentic.ai/docs/mo/chatgpt-and-claude).

```bash
codex mcp add momentic-hosted --url https://mcp.momentic.ai
codex mcp login momentic-hosted
```

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

## Inspect the failure

1. Call `momentic_get_run` for the failing attempt. Identify the section (`beforeSteps`, main steps, or `afterSteps`), failing step, and nested `parentStepIdChain`. Re-fetch only for another attempt or missing data.
2. Call `momentic_get_step_result` with the parent chain and inspect before/after screenshots and URLs. For nested steps, inspect the nearest parent container or module too. Request `includeTrace=true` only when normal fields and screenshots are insufficient.
3. If the before-screenshot is already wrong, walk backward to the step that produced it. Compare repeated module invocations within this run before consulting older runs.
4. Inspect failed/recovered children even when the container passed. Check its final screenshot and URL against the next step's expected baseline.
5. Use `momentic_get_test_steps_for_run` when intent or changes to the authored test remain unclear. It returns simplified steps; get step results for full details.
6. Verify the intended action, actual target, URL transition, and resulting state. A successful click or a broad page-content assertion alone does not prove the expected postcondition.

Read [Run evidence](references/run-evidence.md) when inspecting raw result structure, locator caches, module caching, or file uploads.
Read [Manual artifacts](references/artifacts.md) when MCP output is missing or you need raw files for independent inspection.

## Compare history

- For branch incidents, call `momentic_list_runs` with the exact `gitBranchName` and bounded `start`/`end`. Start without a status filter, then narrow to `FAILED`, `CANCELLED`, or `recovered=true`. Omit the branch only for a specific cross-branch question.
- Use `failureCategory` for effective classification (manual when present, otherwise automated). The `minAttempts` filter counts total attempts. Use `minAttempts: 2` for at least one retry, or 3 for at least two.
- Use `momentic_quarantine_list` with a bounded quarantine-date range for active local test quarantines and each test's latest retained failed CLI run. It does not filter by branch or category.
- Read all `pageCount` pages needed before claiming an exhaustive inventory. Group symptoms only after inspecting representative runs and steps.
- Open each comparison with `momentic_get_run`, then `momentic_get_step_result` for the matching step/container. Do not cite list summaries alone.
- For passing runs with `attempts > 1`, retrieve earlier failed attempts using `attemptNumber`. Recovery can leave invalid state.
- Call behavior flaky only after ruling out app and test changes. One failure is insufficient.
- Skip history when the current run already proves the cause; say so in the report.

## Record the verdict

Call `momentic_submit_result_classification` only after investigation and only when the user asks to persist the verdict.
Do not also use `ai classify --save` for the same conclusion.

## Triage quarantined tests

Read [Quarantine](references/quarantine.md) to choose fresh runs or retained
failures, build the batch, and verify repairs before changing quarantine state.
