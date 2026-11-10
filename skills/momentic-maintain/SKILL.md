---
name: momentic-maintain
description: Diagnose and classify failing Momentic browser, Android, and iOS tests, compare run history, and repair quarantined tests.
---

# Maintain Momentic tests

1. Read [momentic-test](../momentic-test/SKILL.md) for product selection, the selected
   CLI and local MCP server, and product-specific and linked shared references.
   Identify the run, branch, run group, commit, or local results directory.
   Read the [web guide](references/products/web/guide.md) when maintaining browser
   tests, or the [mobile guide](references/products/mobile/guide.md) for Android/iOS.
2. Read [Run evidence](references/run-evidence.md) when investigating a failure.
   Check saved classifications and heal results before assigning a new verdict.
3. Resolve a `/run-groups/<id>` URL with authenticated
   `GET /v1/run-groups/<id>/runs` or a run ZIP filename in `test-results/runs/`.
   Call `momentic_get_run` with the individual run ID and failing attempt, then
   `momentic_get_step_result` for the failing step.
4. Work backward through screenshots to the first divergence from the expected behavior.
5. Read [Classification](references/classification.md) when assigning a category.
   Save a classification only when asked. For hosted MCP submission, upload
   any local run first. For browser runs, `ai classify --save` can save directly
   to the local ZIP without uploading it.
6. Verify the app and fixtures, make the smallest repair that preserves intent,
   review the diff, and rerun the affected test.
7. Report the diagnosis, evidence, verdict, repair, rerun result, and remaining
   blockers. Add `--upload-results` when a local rerun needs a shareable link;
   otherwise say the results are local. For local reruns, return only URLs printed by the CLI.
   For historical runs discovered through hosted MCP, link the returned run IDs
   using the URL format in [Classification](references/classification.md).

## Inspect the failure

Use the failing step's `parentStepIdChain` for nested steps. If its before-image
is wrong, walk back to the step that produced it. Compare repeated module
invocations before older runs; inspect failed or recovered children even when
their container passed.

Check the final screenshot against the next step's expected state.
Use `momentic_get_test_steps_for_run` when intent is unclear, and request
`includeTrace=true` when screenshots and step results don't explain the failure.
Read [Manual artifacts](references/artifacts.md) when MCP output is missing.

Preserve the intended assertion when the failure is an app bug, missing fixture,
invalid credentials, outage, or Momentic defect.
Use hosted MCP for run discovery and the selected product's local MCP for artifacts.
Read [MCP setup](https://momentic.ai/docs/coding-agents/mcp-server) when disconnected.
