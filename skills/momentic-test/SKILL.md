---
name: momentic-test
description: Create and maintain Momentic browser E2E tests via the Momentic MCP tools. Use when a user asks to create a new test, scaffold a smoke test, or add/modify/delete steps in an existing test. Do not use for editing Momentic YAML directly.
---

# Momentic test creation and maintenance agent (MCP)

This is a workflow guide for creating and maintaining Momentic tests using the **Momentic MCP tool suite** (the `momentic_*` tools). Momentic is an end-to-end testing framework where each test is composed of browser interaction steps. Each step combines Momentic-specific behavior (AI checks, natural-language locators, ai actions, etc.) with Playwright capabilities wrapped in our YAML step schema. Use these together to build stable, maintainable tests. Your sole goal is to build and maintain these tests.

## Scope

- **In scope**: creating new tests, editing existing steps, validating changes by execution, using modules, modifying modules (name, parameters, parameterEnums, etc.) via splice, troubleshooting element targeting and timing issues, structuring setup/main/teardown, and managing sessions correctly.
- **Out of scope**: editing test/module YAML directly, using selectors (CSS/XPath), “resetting” on every edit, or making unrelated refactors.

## Momentic context (smart waiting)

- Momentic steps use **smart waiting**: before attempting a locator (clicks, type, and other steps are all using locators), execution can refetch/re-evaluate page state until the page is ready enough for the locator to have a realistic chance of targeting the right element.
- Smart waiting helps with partial-load UIs (for example, chat shell is visible but messages are still fetching), but it is not magic—if readiness is still ambiguous, add an explicit wait/assertion for the specific content you need.

## Non-negotiables

- **Always call `momentic_get_initial_data` first** before making any other MCP tool calls. It returns project root, cwd, and the step schema—required for paths and for constructing valid test steps.
- **Never edit Momentic YAML directly.** Persist changes only with `momentic_test_splice_steps`.
- **Never splice unvalidated steps.** Every new or changed step MUST be executed successfully via `momentic_preview_step` before splicing.
- **Always carry preview cache keys into splice.** If a `momentic_preview_step` response returns a cache key / `CacheId` for a step and you decide to persist that step, you MUST include `--cache-id <CacheId>` when you add that step with `momentic_test_splice_steps`.
- **Keep assertions minimal and user-driven.** Add only assertions the user requested; add an extra assertion only when it is strictly required as a readiness gate for flaky/ambiguous transitions. EX: don't preemptively add a AI_ASSERTION after a navigate since Momentic's smart waiting will likely already solve this for you.
- **Ask for confirmation before long-running operations.** Before restarting from scratch, running a full long test, or kicking off large multi-step runs, confirm with the user.
- **Do not “reset every time.”** Start a session once and keep working in it. If you need a clean restart, prefer `momentic_run_step` with `resetSession: true` (same `sessionId`).
- **Keep a minimal delta.** Change only what the user asked for.
- **Do not work around real app failures.** If the page is broken, required data does not load, or a backend dependency is down, stop and tell the user what failed instead of weakening the assertion, adding conditionals, or otherwise forcing the test to pass. If a request step or page flow depends on `localhost` and it fails, verify the target local service/port is reachable, the issue could be the user didn't do their required dev environment start up.
- **Preserve existing test intent and data exactly.** When editing, keep unchanged steps, params, request bodies, env keys, literal values, and quoting/style as-is unless the user asked for a change there, or it is necessary to achieve their goal.
- **Do not reorganize test structure speculatively.** Only move steps between setup/main/teardown when the test's intent clearly requires it, and move the full relevant setup flow rather than a partial fragment.
- **Treat every edit as surgical.** If a test or step is outside the requested scope or a section does not need to change, leave it untouched rather than “cleaning up” nearby content.
- **Read file-output paths selectively.** Observability or step tools may return inline content or artifact paths. Read only the artifacts needed for the current decision. Do not re-read screenshot/environment files on every step if the available output already provides enough context.
- **Terminate sessions when done.** When you finish building or validating a test, end the session with `momentic_session_terminate`.

## Required step selection and inputs

- **Use natural language element descriptions only.** No CSS selectors, XPath, or HTML snippets.
- **Prefer native Momentic steps over `JAVASCRIPT` steps.** Do not use `JAVASCRIPT` steps for API calls or other behavior that native Momentic steps can already express. Only reach for `JAVASCRIPT` when there is no native step that fits the job.
- **Do not auto-navigate.** The browser session starts on your page; only add a NAVIGATE step when you confirm you are not already on the intended page.
- **Do not use AI actions** (AI_ACTION_DYNAMIC steps) unless the user specifically asks for them.
- **Do not add optional/default fields just because they are available.** Only include parameters that are required for correctness or explicitly needed for the requested behavior.

## Inputs you should gather (up front)

- **Test goal**: what user-visible behavior is this test verifying?
- **Start point**: `baseUrl` (preferred) or a named environment.
- **Auth needs**: anonymous vs logged-in; credentials or env vars to use.
- **Success criteria**: what should be asserted on-screen to prove the goal?
- **Risk tolerance**: any actions that must _not_ be executed twice (submit/purchase/delete/send).

## Tool headers (Momentic MCP)

Use these tools (and only these) to discover tests/modules, manage sessions, validate steps, and persist changes. **Call `momentic_get_initial_data` first** before any other tool.

### Initial context (call first)

- **`momentic_get_initial_data()`**: returns project root, cwd, and the step schema. Call this before any other tool so you have correct paths and can construct valid CLI-style steps.

### Environments and tests

- **IDs in Momentic files**: Test files are usually .test.yaml and will have an id attribute. The id field is authoritative. Module files are .module.yaml.
- **`momentic_get_artifacts()`**: get the important project artifacts you need before creating or editing tests. This returns separate artifact files, so read or grep only the relevant ones for the tests, modules, environments, or other project context you need.
- **`momentic_test_create({ name, baseUrl | environment, description?, pathSegments?, browserType?, viewport? })`**: create a new test.
  - Required: `name` and either `baseUrl` or `environment`.
  - Name rules: 1–255 chars, letters/numbers/dashes only, cannot start/end with `-`, not `.yaml`, not `none`, not a UUID.
  - Optional: description, pathSegments (folder path), browserType, viewport.

### Modules

- **`momentic_module_recommend({ userRequest })`**: identify reusable flows (login, navigation, etc.).
- **`momentic_module_get({ selector })`**: inspect required parameters/defaults/enums and the module’s steps. Selector: exactly one of `{ id }`, `{ name }`, or `{ path }` (id recommended).
- **`momentic_get_artifacts()`**: returns files containing all relevant discovery payloads (tests, modules, environments, etc.). Modules will be present within the returned path labeled module.

### Sessions (restart options)

- **`momentic_session_start({ testId, envName?, projectConfigPath?, projectNameFilter?, headfulBrowser?, video? })`**: start a granular browser session. Returns session metadata (`sessionId`, `testId`, `testFileAbsolutePath`, `createdAt`, `expiresAt`, `idleTimeoutMinutes`, `envName`, `baseUrl`) plus `viewport` (`width`/`height` in pixels, or `null` if unavailable). Required: `testId`. Optional: env override, config path, project filter, headful browser, video recording.
- **`momentic_session_terminate({ sessionId })`**: terminate the current session. If the session was started with `video: true`, the response will include the path to the video output directory as an artifact.

Restart rule:

- If you must restart (state drift, auth stuck, large rewrite, or you can’t reason about the current UI state): use `momentic_run_step` with `resetSession: true` (same `sessionId`) and run from the first step.

### Observability

- **`momentic_get_session_state({ sessionId })`**: Structured view of the current UI state for the session.
- **`momentic_get_environment_variables({ sessionId })`**: view current session env vars.

**Live sessions and transient snapshots**

- Each session is a **live browser session**—a real browser process running statefully.
- Screenshots and UI-state snapshots are **transient**; they capture a moment in time and do not persist.
- If a screenshot or step output doesn't show the expected state (e.g., you clicked a button but the returned image doesn't show the resulting UI), **call `momentic_get_session_state` again** to get a fresh snapshot. The page may still have been loading or the tool may have returned stale output.
- When in doubt, retry: get a fresh UI-state snapshot before concluding that something failed. That being said don't loop over and over, a second try is usually good enough.

### Reading file output (required when creating or editing tests)

The MCP server may return **file output** as markdown links in tool response sections (not XML tags). Typical sections are the UI state, `Screenshot Path`, and `Environment Variables`.

- **Read only what is relevant** when paths are present. Do not treat a step as confirmed without checking the relevant artifact content, but avoid opening artifacts that are not needed for the current step.
- **How to read**: use your Read tool on the linked path. Paths are written under `.momentic-mcp` in the project (for example `.../page-state-<ts>.txt`, `.../screenshot-<ts>.jpeg`, `.../environment-variables-<ts>.json`).
- **How to use the content**: use UI-state text to refine targeting or debug structure; use screenshot images to verify visual state; use environment variables only when needed. The UI-state snapshot is usually unnecessary when screenshot-only output is sufficient. Read environment-variable files only when validating `envKey` outputs, JavaScript/API outputs, or when a later step depends on new env values.
- **Avoid redundant artifact reads**:
  - do not read both screenshot and environment files by default after every preview/run
  - if only env output matters, prefer reading only environment variables
  - skip re-reading unchanged artifact types when no new information is expected
  - ImageParts are returned directly to you so reading the screenshot is usually a waste since it is in the tool call.
- **Tool-specific note**:
  - `momentic_get_session_state`: returns the serialized UI-state snapshot only when `returnBrowserState: true` (default is false), and returns a screenshot by default.
  - `momentic_preview_step` / `momentic_run_step`: return screenshot + environment variables, and may include artifact paths for those when file output is enabled.

### Validate vs persist

> **CRITICAL: Never persist steps that have not been executed successfully via `momentic_preview_step`.**

- **`momentic_preview_step({ sessionId, step })`**: execute a single step without persisting it. **Stateful**: can advance the browser. Some preview responses include a cache key / `<CacheId>`. **Save this value.** and use it as the `--cache-id <CacheId>` for that step when you splice it. Do not ignore a cache key when you are adding steps you have already previewed. Treat cache-key handoff to `momentic_test_splice_steps` as part of persisting a previewed step correctly.
- **`momentic_run_step({ sessionId, fromStep: { fromStepId, parentStepIdChain }, toStep?, targetSection?, resetSession? })`**: execute steps already in the test. Set `resetSession: true` to reset the browser session before running. When step IDs are unknown, read the section of the test file that contains the specific step(s) you need. Use `parentStepIdChain: []` for top-level steps. Returns screenshot and env vars at the end.
- **`momentic_test_splice_steps({ sessionId, startIndex, deleteCount, steps, targetSection?, parentStepIdChain?, returnTest? })`**: insert/replace/delete steps and persist. To add a conditional: use `--step-type CONDITIONAL` with `--assertion-type` (AI_ASSERTION, PAGE_CHECK, or JAVASCRIPT) and the assertion fields. Use splice with `parentStepIdChain: [parentStepId]` to add steps inside conditionals or modules. **Modules cannot contain other modules**; splicing a MODULE step inside a module (via parentStepIdChain) will fail. **To modify a module** (name, parameters, parameterEnums, etc.): replace the module step with a MODULE step that includes metadata flags (`--parameters`, `--parameter-enums`, `--default-parameters`, `--module-display-name`, `--module-description`, `--module-enabled`). Metadata comes on the step itself; changes persist to the module `.module.yaml` file.

Splice response handling (required):

- Read the full `momentic_test_splice_steps` response immediately; it is the source of truth.
- Verify section/index range, inserted/deleted counts, and any returned step ID/order changes.
- If `returnTest` is true, confirm the post-splice structure from the returned snapshot before continuing.

Output note:

- **`momentic_preview_step` / `momentic_run_step`** can return file paths for `<Screenshot>` and `<EnvironmentVariables>` when file output is enabled; they do not return `<PageState>`.

## Decision rules (tool choice)

- **Need to know which index to edit**: You can search within the file for known step IDs and read only those specific sections. This is usually unnecessary since splice returns the new indices.
- **Need to get the browser into the right state before editing step N**: `momentic_run_step` from first step to the step before N (use step IDs from the test file). If the test splits **setup / main / teardown** and the edit is in **main**, run **setup first**, then main up to the step before the edit. Do this once to reach the work point, then keep editing in the same live session unless you intentionally restart.
- **Need to understand the current UI state / fix an element description when screenshot-only output is insufficient**: `momentic_get_session_state`.
- **Adding any logical multi-step action (login, navigation, setup, checkout, etc.)**: default to module-first: call `momentic_module_recommend` → `momentic_module_get` for strong candidates → decide module vs inline steps. Editing modules is risky and requires user confirmation; use this flow to check for an existing module that matches the required flow before writing inline steps.
- **Editing a module**: If you must edit a module and have confirmed with the user that the module should be edited, replace the module step with a MODULE step includes arguments for the properties you'd like to update: `--parameters "a,b,c"`, `--parameter-enum param=val1,val2`, `--default-parameter param=val`, `--module-name`, `--module-description`, `--disabled`. Example: `--step-type MODULE --module-id <id> --inputs <same> --parameters test,test2 --parameter-enum test=1,2 --parameter-enum test2=2,3`.
- **Testing a new single step idea quickly**: `momentic_preview_step`.
- **Unsaved preview limit**: never keep too many validated unsaved steps in memory; splice each contiguous batch. This should be at each logical break point in the test (suggested 5ish steps)
- **Persisting steps**: `momentic_test_splice_steps`. After splicing is complete, you should generally ask the user whether they would like you to run and verify the newly
  added/edited step(s) in a "check pass". `momentic_preview_step` calls are testing the step in isolation, but re-running them from start ensures there are no timing errors or
  other sources of flakiness.
- **Step failed mid-run, need to recover**: You can use `momentic_preview_step` with steps that you don't intend to persist to the test in order to recover from failures or incorrect states, then resume `momentic_run_step` from the appropriate step. Only restart from the beginning if recovery is not feasible.
- **Need a clean slate**: `momentic_run_step` with `resetSession: true`; if this implies a long re-run, ask for confirmation first. This re-creates the browser, destroying any local state.
- **Break up long `run_step` operations**: avoid running many steps at once; prefer smaller checkpoint-based runs. Keep each run small (about 5 steps max) to reduce tool timeouts (usually 60s) which cause undefined UI state.

## Build and edit workflow (preview → splice → validate safely)

### 0) Get initial data (first call)

- Call `momentic_get_initial_data()` before any other tool. It provides project root, cwd, and the step schema needed for all subsequent operations.

### 1) Create the test (or select existing)

- If you’re making a brand new test, call `momentic_test_create`.
- If the user might already have a similar test, prefer: `momentic_get_artifacts` to discover tests, then read the tests using the returned `testFileAbsolutePath`.

### 2) Start a session

- Call `momentic_session_start({ testId, envName? })` and keep using that `sessionId`.

### 3) Identify the minimal delta and navigate to the work point

- Determine exactly which step index(es) to insert/replace/delete.
- If this is a new test, start from the beginning and build the first vertical slice.
- If editing, use `momentic_run_step` to execute existing steps to right before the edit location. Don't needlessly repeat this and restart, you should be able to do this once to reach the work point, then keep editing in the same session.
- Use output from `momentic_run_step` to confirm what’s on screen before previewing. If and only if you **need** more information should you get the UI-state snapshot.
- When previewing, use the narrowest valid change to the steps and avoid widening the edit to adjacent steps. All adjusted fields must be in your preview and only adjust what is required to keep the requested behavior correct.

### 4) Build the test incrementally

Start with the smallest meaningful “vertical slice”:

- Confirm you are at the expected starting UI state (use UI state or a stable assertion). Only add NAVIGATE if you are not.
- Add a page assertion only when needed for stability or when explicitly requested by the user.

Then add the next step, etc.

Rules:

- Prefer **preview preview preview → splice** for a small batch of adjacent, idempotent steps. Validate each step first, then splice them together to keep the test reproducible without constant splicing. When splicing, pass the `<CacheId>` from each preview response as `--cache-id CACHE_ID` in the CLI string for the corresponding step so the cache is reused.
- If the user asks you to create/edit a test, your task is not complete until you have persisted the steps with splice. You should splice each logical grouping of steps as soon as you finish previewing them. EX: if you were to be testing google flights and booking a flight, all of the toggles and selects before clicking search would be a logical grouping. When it doubt try to keep each splice to around 5 steps. This ensures you do not forget about previously previewed steps and returned cache IDs.
- After each preview or run, if the tool returns **file paths**, read only the artifact(s) required to verify the intended outcome before splicing; if you require structured UI-state details, call `momentic_get_session_state`.
- Avoid "nice-to-have" assertions. If the user asked for one final assertion, keep exactly that assertion unless an intermediate readiness check is truly necessary to make the test reliable.
- When editing an existing test, prefer the smallest possible splice. Do not rewrite neighboring steps or change unnecessary fields.

### 5) Author steps (natural language targeting)

For every UI step, write an element description a human would understand:

- Good: “the **Sign in** button below the password field”
- Good: “the **Search** input with placeholder **‘Search products’**”
- Bad: “button with class …”
- Bad: “div:nth-child(3)”

NOTE: Single quotes signal strict queries, so do not use them unless you expect an exact match in the page snapshot and want incredibly strict behavior.

### 6) Use modules for obvious flows

If the flow is 4+ steps or obviously reusable:

1. Call `momentic_module_recommend` with the desired sub-flow.
2. Call `momentic_module_get` on the candidate module.
3. Preview the module
4. Add a `MODULE` step via `momentic_test_splice_steps`.

### 7) Avoid double-executing risky steps

- If a step is **idempotent** (tab switches, typing into empty fields, assertions), it’s usually fine to preview, splice, then continue validating forward.
- If a step is **not idempotent / risky** (submit/purchase/delete/send/create), do **not** immediately re-run it in the same session:
  - splice the step
  - restart via `momentic_run_step` with `resetSession: true`
  - run up to right before it (if needed)
  - then run through it once to validate the saved test

If something fails:

- First: check if it's a timing/state issue (see smart waiting context above); add an explicit readiness wait/assertion when needed.
- Second: check if it's an element description issue (use the UI-state snapshot to refine the wording after the UI is ready).
- If the page is showing a genuine product failure which blocks your testing (for example, an empty graph because the backend is down, missing data required for the requested assertion, or a localhost request that cannot connect), report it to the user instead of editing around it.
- Before restarting: consider recovering via `momentic_preview_step`, even if you do not intend to add the steps to the test, to get the browser into a state where the test can continue (e.g., dismiss a modal, navigate back). Only restart via `momentic_run_step` with `resetSession: true` if recovery is not feasible.
- After ~3 attempts, stop and collaborate with the user on alternatives.

### 8) Persist and re-validate

Once a small batch of steps is validated, persist them together with `momentic_test_splice_steps`.

Common splice patterns:

- **Insert**: `deleteCount: 0`
- **Replace 1**: `deleteCount: 1`
- **Delete N**: `steps: []`, `deleteCount: N`
- **Add conditional**: Splice `--step-type CONDITIONAL --assertion-type AI_ASSERTION --assertion "..."` (or PAGE_CHECK/JAVASCRIPT with their fields). Then splice again with `parentStepIdChain: [conditionalStepId]` to add steps inside the conditional. Since preview does not support CONDITIONAL, validate the assertion and child steps individually before splicing.

After splicing:

- Read the splice response first to confirm your edit did what you intended before running anything else.
- If there are more steps after your splice that you didn't change, run the immediate next step to confirm the flow still works (i.e. verify that your spliced changes still connect with the rest of the test).
- Ask the user if they would like you to do an additional check pass to ensure the changes work end-to-end in the broader context of the test.
- For risky actions, avoid re-triggering unless required for one-time validation.

### 9) Organize into setup/main/teardown when it helps

- **Setup**: Creating users, setting feature flags, loading credentials, etc.
- **Main**: the core user journey + assertions.
- **Teardown**: cleanup of artifacts made from main and setup.

When splicing, set `targetSection` accordingly (`setup`, `main`, `teardown`).

- **Full execution**: run **setup → main → teardown**. Skip any section with no steps.

**How to Edit a Section**: Reach the work point with **`momentic_run_step` through setup, then main, then teardown as necessary**, stopping at the step before the one you change (or a stable checkpoint), then preview/splice. Do not skip a section with steps to jump into the section you want to work on.

### 10) End the session

- Once the test is built and validated, call `momentic_session_terminate` to clean up the session.

## Step shapes (what to send)

Steps use **CLI-style** strings: `--step-type <type> [options]` where the step type is: `CLICK`, `TYPE`, `NAVIGATE`, `AI_ASSERTION`, `MODULE`, `AI_ACTION_DYNAMIC`, `WAIT_FOR_URL`, etc.

### Preview a single step (`momentic_preview_step`)

The `step` parameter is a single CLI-style string:

```json
{
  "sessionId": "SESSION_ID",
  "step": "--step-type NAVIGATE --url \"https://example.com\""
}
```

More examples:

- Click: `--step-type CLICK --description "the Sign in button"`
- Type: `--step-type TYPE --description "Search input" --value "hello" --press-enter`
- AI assertion: `--step-type AI_ASSERTION --assertion "the page shows a Sign in button" --timeout 10`

### Persist steps (`momentic_test_splice_steps`)

The `steps` parameter is an array of CLI-style strings. For every step whose `momentic_preview_step` response returned a cache key / `<CacheId>`, append `--cache-id <CacheId>` to that exact spliced step. If you previewed a step and chose to persist it, carrying over its cache key is required whenever one was returned.

```json
{
  "sessionId": "SESSION_ID",
  "startIndex": 0,
  "deleteCount": 0,
  "steps": [
    "--step-type NAVIGATE --url \"https://example.com\"",
    "--step-type AI_ASSERTION --assertion \"the page shows a Sign in button\" --timeout 10 --cache-id UUID_FROM_PREVIEW_CacheId_TAG"
  ],
  "targetSection": "main"
}
```

## Module inputs (important)

Module `inputs` values are JavaScript fragments as strings evaluated at runtime.

- Use quotes for string literals.
- Use `env.X` to reference environment variables.
- If the module has enum constraints, input must exactly match one of the allowed values.

Example:

`--step-type MODULE --module-id MODULE_ID --inputs email=env.USER_EMAIL --inputs password=env.USER_PASSWORD --inputs rememberMe=true --inputs planName='Pro' --inputs url="https://example.com"`

## Module metadata (modifying modules via splice)

You can modify module definitions by replacing a MODULE step with one that includes metadata flags. See the MODULE step schema for full options.

Keys in `defaultParameters` and `parameterEnums` must appear in `parameters`. Changes persist to the `.module.yaml` file. Get user confirmation before editing modules.

Example: to add a new parameter `test2` with enums `["2","3","4","5"]`, replace the module step with:
`--step-type MODULE --module-id MODULE_ID --inputs test=1 --parameters test,test2 --parameter-enum test=1,2,3,4 --parameter-enum test2=2,3,4,5`

## Environment variable syntax by context

There are two env-var reference forms in Momentic tests, depending on where the value is evaluated:

- First, create/store the value with `--env-key SOME_NAME` on a step that produces output.
- Use `env.X` inside JavaScript-evaluated fragments such as MODULE `--inputs` values and JavaScript expressions.
- Use `{{ env.X }}` when the test DSL/text supports template interpolation. The `{{ ... }}` block can also evaluate JavaScript, for example `{{ env.CURRENT_URL.slice(0, 50) }}`.

In general, if the field is code or a module input expression, use `env.X`, but, if the field is user-facing/interpolated text in the saved test YAML, use `{{ env.X }}`. Like this: 
- `--step-type JAVASCRIPT --code "assert(env.PAGE_TITLE === 'Hacker News')" --environment NODE`
- `--step-type MODULE --module-id MODULE_ID --inputs email=env.USER_EMAIL`
- `Select date {{ env.TARGET_DATE }}`
- `Verify the date field shows {{ env.INVOICE_DATE }}`

## Troubleshooting checklist

- **Wrong page / unexpected UI**: use the UI-state snapshot from the last run (if it was returned as a file path, read that file); otherwise call `momentic_get_session_state` and, if you get a path back, read it to inspect the structured UI state.
- **Element not found**:
  - Read the latest browser-state (or screenshot) file to see what’s on the page
  - If the target element is on the page but was not found, rewrite the step description using visible text, role, and nearby context
  - If the expected element is missing or clearly not present/usable, an earlier prerequisite step may have been incorrect or silently failed.
- **Screenshot doesn't show expected state after a click/action**: snapshots are transient. Call `momentic_get_session_state` again to get a fresh image; the page may have been loading. If the fresh snapshot still doesn't match, retry the step or add a wait.
- **Flaky timing**: prefer assertion-style checks (`AI_ASSERTION`) over generic `WAIT`/`CHECK` steps, and use `WAIT_FOR_URL` or `SWITCH_TAB` for page/tab transitions. Actions that would normally finish within ~5 seconds are automatically retried, so avoid explicit waits unless retries and assertions are still insufficient.
- **Session got “weird”** (wrong account, stuck modal, unexpected navigation): restart via `momentic_run_step` with `resetSession: true`.
- **Module won’t run**: re-check required params/defaults/enums with `momentic_module_get`; ensure inputs are valid JS fragments as strings.

## Minimal example: create a smoke test

Goal: “Homepage loads and shows the Log in button.”

1. `momentic_get_initial_data()` — first, always
2. `momentic_test_create(name, baseUrl)`
3. `momentic_session_start(testId)`
4. `momentic_preview_step` NAVIGATE to `baseUrl`
5. `momentic_preview_step` AI_ASSERTION “page shows Log in button”
6. `momentic_test_splice_steps` to persist both steps
7. `momentic_run_step` from first step to last (read the test file to get step IDs) to validate the saved test
8. `momentic_session_terminate`
