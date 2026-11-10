---
name: momentic-test
description: Create, run, and maintain Momentic browser, Android, and iOS tests and modules stored as *.test.yaml and *.module.yaml files.
---

# Write Momentic tests

1. Identify the target app from `momentic.config.yaml`, existing tests and modules, and dependencies.
   For `momentic/mobile-test` or `momentic/mobile-module` (including `/v2`), Android/iOS apps,
   or a `momentic-mobile` dependency, use `npx momentic-mobile` and local MCP
   server `momentic-mobile`. For `momentic/test` or `momentic/module` (including `/v2`),
   browser apps, or a `momentic` dependency, use `npx momentic` and local MCP
   server `momentic`. In a mixed repo, follow the target test, module, or app; ask if unclear.
   Use that product's CLI and local MCP tools, not the other product's.
   Read, list, and search product-specific references
   only inside its `references/products/web/` or `references/products/mobile/`
   directory. Read shared references when the active skill calls for them, including
   run evidence, classification, and manual artifacts.
   Exclude the other product's references from broader repository or
   installed-skill searches.
2. Read the [web guide](references/products/web/guide.md) when testing a browser
   app, or the [mobile guide](references/products/mobile/guide.md) when testing
   Android or iOS. Confirm the expected result, environment, and authentication.
3. Edit known v2 YAML directly and run the selected CLI's `lint`.
   Reload an active session before validating saved edits.
   For v1 changes, unfamiliar screens, or live validation, use MCP as below.
4. Validate the changed saved steps and their prerequisites, then terminate the session.
   Report the result and any steps left unverified. Ask before changing a requested
   assertion that the app doesn't satisfy.

## Start a session

Create a new test with `momentic_test_create`, then call `momentic_session_start`
with its ID. For an existing test, start it directly. Read the returned Step
Authoring Guide and use its active step IDs.

Use `momentic_get_artifacts` to discover tests, environments, and other artifacts.
Use `momentic_test_get` to read a saved test outside the active session, and
`momentic_get_environment_variables` when a step needs an unknown value.

## Preview, save, and validate

1. For a mid-test change, run through the preceding step in the same session.
2. Preview with the product guide's tools and inspect the screenshots.
   Request state only when the image doesn't show enough to choose a target or explain a failure.
3. Save successful steps with `momentic_test_splice_steps`. Attach each returned
   `CacheId` to its exact step and use the updated step IDs.
4. Run the smallest saved range covering the change, including its next dependent
   step. Reuse prerequisites already run in this session.

Run one operation at a time per session. If a preview or run returns a
`stepRunnerId`, wait with `momentic_poll_runner` using a nonzero wait before
the next operation. Reset when accumulated state could hide a failure.
For nested steps, use the parent chain from the active session or splice response.

Get approval before previewing or running actions that submit, purchase, delete,
send, create data, or have any other non-idempotent side effect. Also get approval
for shared-module edits and expensive full-test runs. Execute approved side effects
once, following the product guide; don't preview them and replay them.
Report saved side-effect steps left unverified.

## Reuse modules

For a reusable flow of roughly four or more steps, discover modules through the
product guide and read one with `momentic_module_get` before using it.
Modules can't contain modules. Respect declared parameters, defaults, and enums.
In MCP step strings, inputs are JavaScript expressions, not `{{ }}` templates.

Use hosted `momentic_search_docs` for current step options and configuration.
Read [MCP setup](https://momentic.ai/docs/coding-agents/mcp-server) when the
hosted server isn't connected. Without hosted sign-in, use
https://momentic.ai/docs/llms.txt.
