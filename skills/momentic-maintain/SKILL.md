---
name: momentic-maintain
description: Diagnose and classify failing Momentic tests, compare run history, and repair quarantined tests.
---

# Maintain Momentic tests

1. Identify the run, branch, run group, commit, or local results directory.
2. Read [Run evidence](references/run-evidence.md). Check saved classifications
   and heal results through run metadata or the dashboard before investigating.
3. Call `momentic_get_run` for the failing attempt, then
   `momentic_get_step_result` for its failing step.
4. Inspect screenshots and work backward to the first step where the app stopped
   matching the test's expected behavior.
5. Read [Classification](references/classification.md) when assigning a category
   and deciding whether a test edit can fix the failure.
6. Read [Repair](references/repair.md) when running `npx momentic ai classify`
   or `npx momentic ai triage`. Verify the app and fixtures before replaying.
7. Review the repair diff and rerun the affected test. Report the diagnosis,
   evidence, repair, and remaining blockers.

Use hosted MCP for run discovery and local CLI MCP for artifact inspection.
If hosted tools aren't connected, add `https://mcp.momentic.ai` as an HTTP MCP
server and sign in with OAuth. See [MCP setup](https://momentic.ai/docs/mo/chatgpt-and-claude).

## Inspect the failure

Use the failing step's `parentStepIdChain` for nested steps. Inspect its parent
module or container too. If the before-screenshot is already wrong, walk
backward to the step that produced it.

Compare repeated module invocations within the run before checking older runs.
Inspect failed or recovered child steps even when their container passed.
Check the final screenshot and URL against the next step's expected state.
A successful click or broad content assertion alone doesn't prove the result.

Use `momentic_get_test_steps_for_run` when the intended behavior is unclear.
Request `includeTrace=true` on a step result only when screenshots and normal
fields don't explain the failure. Read [Manual artifacts](references/artifacts.md)
when MCP output is missing or you need raw files.

Don't weaken a test to hide an application bug, missing fixture, invalid
credentials, outage, or Momentic defect.

## Save a classification

Call `momentic_submit_result_classification` only when the user asks to save
the verdict. Don't also use `ai classify --save` for the same conclusion.

## Triage quarantined tests

Read [Quarantine](references/quarantine.md) when choosing fresh runs or retained
failures, batching repairs, or changing quarantine state.
