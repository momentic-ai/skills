---
name: momentic-test
description: Create, run, and maintain Momentic browser E2E tests and modules stored as *.test.yaml and *.module.yaml files.
---

# Write browser tests

1. Read `momentic.config.yaml` and the target test; confirm the intended result, environment, and authentication.
2. Before editing YAML or choosing steps, read [Authoring](references/authoring.md) for file formats, commands, caches, timing, and module inputs.
3. For a known v2 change, edit YAML, run `npx momentic lint` if syntax or references are uncertain, then reload or restart the session before validating.
4. For v1, unknown UI, or live validation, use the MCP sequence below. Create new tests with `momentic_test_create` first; `momentic_session_start` opens existing tests only.
5. Validate the saved range and terminate the session. Read [Troubleshooting](references/troubleshooting.md) when targeting, timing, browser, or data failures block progress.

Use hosted `momentic_search_docs` before writing step options, CLI flags, or configuration keys from memory.

If hosted tools are missing, connect `https://mcp.momentic.ai` over HTTP and sign in with OAuth.
In Codex, run the commands below; for other clients, use [remote MCP settings](https://momentic.ai/docs/mo/chatgpt-and-claude).

```bash
codex mcp add momentic-hosted --url https://mcp.momentic.ai
codex mcp login momentic-hosted
```

## Confirm scope

Ask before previewing or running any step or AI Action
that may submit, purchase, delete, send, create, or cause another non-idempotent
side effect. If approved, execute it at most once. Also ask before editing a
shared module, restarting a long flow, or running an expensive full test.

## Start and validate with MCP

Use tool descriptions and the Step Authoring Guide returned by session start for current arguments and syntax.

Preview and run tools
wait 30 seconds by default, then return a `stepRunnerId` while work continues.
Leave `timeoutSeconds` unset for most calls, especially single preset steps.
Set it below 30 seconds only when the coding agent's tool-call timeout is
shorter. Raise it only to wait longer within a larger tool-call timeout; poll
returned handles with `momentic_poll_runner`.

Polling has a separate `timeoutSeconds` (default 0, maximum 30). Pass the
returned `stepRunnerId` and use a nonzero wait within the coding agent's
tool-call timeout instead of repeatedly polling without a wait.

### Fetch context

Fetch context only when needed; use filters in tool descriptions.

- If the test ID is known, start `momentic_session_start` by itself. Its Test
  Content provides the active steps and runnable IDs.
- Use `momentic_get_artifacts` only to discover project paths, tests, modules, or
  environments that are not already known. Avoid redundant refreshes.
- Use `momentic_test_get` to inspect persisted state before starting, or to read
  a different test. Use active session and splice responses afterward.
- Use filtered `momentic_get_environment_variables` only when a step needs env
  data that is not already known.

V2 YAML has no runnable step IDs. Use IDs returned by session start or later
splice responses.

Only one browser operation may run per session. Do not issue concurrent preview,
run, state, or splice operations against the same session.

### Preview, splice, and validate

1. For mid-test work, run through the preceding step once and keep the same
   session. This avoids authoring against the wrong page state.
2. Preview forward in logical checkpoints such as login complete, form ready,
   or submission complete. Checkpoints make the browser state reusable and keep
   persistence calls reviewable.
3. Use `momentic_preview_steps` for adjacent steps. It supports the same preset,
   AI Action, and module steps as `momentic_preview_step`.
4. Treat preview and run screenshots as the primary result. Request browser
   state only when the screenshot or locator result is insufficient; request it
   again once if the page may still be settling.
5. Splice the successful checkpoint. Attach each returned `CacheId` only to its
   exact step; cacheless steps are normal. Read the splice response immediately
   for the active step refs.
6. Run the next dependent saved step or range.
7. Before finishing, when safe, run the smallest saved range covering the
   prerequisites, changed step, and next dependent contract. Reset first when
   accumulated state could mask a failure.

Batch low-risk steps and preview uncertain targets individually. For non-idempotent actions, preview setup, splice it, then run only the approved saved action.

Do not reset between routine edits. For nested steps, use the parent chain
returned by the active session or splice response.

## Reuse modules

For a logical flow of roughly four or more reusable steps, check
`momentic_module_recommend` -> `momentic_module_get` -> reuse or inline.

Modules cannot contain modules. Respect their
declared parameters, defaults, and enum values; module inputs are JavaScript
fragments, not `{{ }}` templates.
