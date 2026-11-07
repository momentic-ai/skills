---
name: momentic-mobile-test
description: Create, run, and maintain Momentic mobile E2E tests and modules for Android and iOS. Use Momentic MCP tools for live device validation, and use direct v2 YAML edits only for high-confidence local mobile v2 changes.
---

# Write mobile tests

1. Read `momentic.config.yaml` and the target test; confirm the intended result, environment, authentication, platform, app source, and provider. Run `npx momentic-mobile doctor` before initial device setup.
2. Before editing YAML or choosing steps, read [Authoring](references/authoring.md) for device setup, file formats, commands, caches, timing, and module inputs.
3. For a known v2 change, edit YAML, run `npx momentic-mobile lint` if syntax or references are uncertain, then reload or restart the session before validating.
4. For v1, unknown screens, or live validation, use the MCP sequence below. Create new tests with `momentic_test_create` first; `momentic_session_start` opens existing tests only.
5. Validate the saved range and terminate the session. Read [Troubleshooting](references/troubleshooting.md) when targeting, timing, device, or data failures block progress.

Use hosted `momentic_search_docs` before writing step options, CLI flags, or configuration keys from memory.
For mobile run history, call hosted `momentic_list_runs` with `executionType: ["ANDROID", "IOS"]`, or select one platform.

If hosted tools are missing, connect `https://mcp.momentic.ai` over HTTP and sign in with OAuth.
In Codex, run the commands below; for other clients, use [remote MCP settings](https://momentic.ai/docs/mo/chatgpt-and-claude).

```bash
codex mcp add momentic-hosted --url https://mcp.momentic.ai
codex mcp login momentic-hosted
```

## Confirm scope

Ask before previewing or running any step or AI
action that may submit, purchase, delete, send, create, or cause another
non-idempotent side effect. If approved, execute it at most once. Also ask before
using local device overrides, editing a shared module, restarting a long flow, or
running an expensive full test.

## Start and validate with MCP

Use tool descriptions and the platform-specific Step Authoring Guide returned by session start for current arguments and syntax.
Prefer the test's configured remote device and app. Use local device or app overrides only when explicitly requested.

Preview and run wait 30 seconds by
default, then return a `stepRunnerId` while work continues. Leave
`timeoutSeconds` unset for most calls, especially single preset steps. Lower it
only when the coding agent's tool timeout is shorter; raise it only within a
larger tool timeout. Poll returned handles with `momentic_poll_runner`.

### Fetch context

Fetch context only when needed; use filters in tool descriptions.

- If the test ID is known, start `momentic_session_start` by itself. Its Test
  Content provides active steps and runnable IDs; the platform comes from the
  test.
- Use `momentic_get_artifacts` only to discover unknown tests, modules,
  environments, local devices, simulators, or managed asset channels. Avoid
  redundant refreshes.
- Use `momentic_test_get` to inspect persisted state before starting, or to read
  a different test. Use active session and splice responses afterward.
- Use filtered `momentic_get_environment_variables` only when a step needs env
  data that is not already known.

Only one device operation may run per session. Do not issue concurrent preview,
run, state, or splice operations against the same session.

### Preview, splice, and validate

1. For mid-test work, run through the preceding step once and keep the same
   session so authoring starts from the correct screen.
2. Preview forward in logical checkpoints such as login complete, permission
   handled, form ready, submission complete, or confirmation visible.
3. Read the returned screenshot first. Request emulator state only when the
   image lacks enough targeting or diagnostic context; request it again once if
   the app may still be settling.
4. Splice the successful checkpoint. Attach each returned `CacheId` only to its
   exact step, then read the splice response for current step refs.
5. Run the next dependent saved step or range.
6. Before finishing, when safe, run the smallest saved range covering the
   prerequisites, changed step, and next dependent contract. Reset first only
   when accumulated state could mask a failure.

Batch low-risk steps and preview uncertain targets individually. For non-idempotent actions, preview setup, splice it, then run only the approved saved action.

MCP screenshots are the default signal. Request serialized emulator state for
accessible names, native XML, webview structure, screen bounds, or offscreen
context. Read environment and installed-app artifacts only when diagnosing data,
launch, or install behavior.

## Reuse modules

For a logical flow of roughly four or more reusable steps, check
`momentic_module_recommend` -> `momentic_module_get` -> reuse or inline. Modules
cannot contain modules.

Respect declared parameters, defaults, and enum values. Module inputs are
JavaScript fragments, not `{{ }}` templates.
