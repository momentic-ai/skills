---
name: momentic-mobile-test
description: Create, run, and maintain Momentic mobile E2E tests and modules for Android and iOS.
---

# Write mobile tests

1. Read `momentic.config.yaml` and the target test. Confirm the intended result,
   environment, and authentication. Run `npx momentic-mobile doctor` before initial
   device setup, and confirm the platform and app.
2. Before choosing steps or editing YAML, read [Authoring](references/authoring.md)
   for device setup, file formats, step choices, timing, and module inputs.
3. For a known v2 change, edit the YAML and run `npx momentic-mobile lint`. Reload or
   restart an active session before validating the saved change.
4. For v1 changes, unfamiliar screens, or live validation, use the MCP steps below.
5. Run the changed saved steps and their prerequisites, then terminate the session.
   Read [Troubleshooting](references/troubleshooting.md) when a failure blocks you.

Use hosted `momentic_search_docs` for current step options and configuration.
If hosted tools aren't connected, add `https://mcp.momentic.ai` as an HTTP MCP
server and sign in with OAuth. See [MCP setup](https://momentic.ai/docs/mo/chatgpt-and-claude).

## Confirm side effects

Get approval before running or previewing an action that submits, purchases,
deletes, sends, creates data, or has another non-idempotent side effect.
Execute an approved side effect once, not once
in preview and again in the saved test. Also confirm shared-module edits,
local device overrides, and
expensive full-test runs.

## Start a session

Use `momentic_test_create` for a new test, then `momentic_session_start` with
its test ID. For an existing test, start the session directly. Use the test's
configured device and app unless the user requests an override. Read the
returned platform-specific Step Authoring Guide and use its active step IDs.

Use `momentic_get_artifacts` to discover unknown tests, modules, environments,
devices, or app channels.
Use `momentic_test_get` to read a saved test outside the active session, and
`momentic_get_environment_variables` when a step needs an unknown value.

## Preview, save, and validate

1. For a mid-test change, run through the preceding step in the same session.
2. Preview a group of adjacent steps with `momentic_preview_steps`. Preview an
   uncertain target individually with `momentic_preview_step`.
3. Inspect the screenshots. Request emulator state only when the image doesn't
   show enough to choose a target or diagnose a failure.
4. Save a successful group with `momentic_test_splice_steps`. Attach each
   returned `CacheId` to its exact step and use the updated step IDs in the response.
5. Run the next dependent saved step or range. Validate the smallest saved range
   covering the changed behavior, reusing prerequisites already run in this session.
   Don't replay an approved side effect; report any saved steps left unverified.

Run one device operation at a time per session. If a preview or run returns a
`stepRunnerId`, wait for it with `momentic_poll_runner` before the next operation.
Use a nonzero polling wait rather than repeatedly polling without waiting.
Reset only when accumulated state could hide a failure. For nested steps, use
the parent chain returned by the active session or splice response.

## Reuse modules

For a reusable flow of roughly four or more steps, call
`momentic_module_recommend`, then `momentic_module_get` before reusing it.
Modules can't contain modules. Respect declared parameters, defaults, and enum
values. Module inputs are JavaScript expressions, not `{{ }}` templates.
