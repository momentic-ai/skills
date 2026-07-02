---
name: momentic-mobile-test
description: Create, run, and maintain Momentic mobile E2E tests and modules for Android and iOS. Use Momentic MCP tools for live device validation, and use direct v2 YAML edits only for high-confidence local mobile v2 changes.
---

# Momentic Mobile Background

## Execution model

Momentic Mobile drives real Android emulators and iOS simulators. Tests are
ordered lists of structured mobile steps.

- Interactive steps such as taps, typing, swipes, and scrolls use AI to resolve
  natural-language targets into concrete device actions.
- Assertions can evaluate visible screen state, native hierarchy, and webview
  state when available.
- Goal-based AI actions can perform broader tasks, but native mobile steps are
  more stable and should be preferred.

## Cache and memory

Momentic caches resolved mobile step metadata such as native selectors, XML
nodes, visible text, webview state, and coordinates so most runs avoid repeated
AI calls. This is critical for speed, but stale cache is a real debugging
possibility: a step may hit the wrong element. AI checks may also use past-result
memory to stay consistent across runs; bad memory can explain repeated
borderline failures.

Caches are scoped by git metadata, including branch. Cache writes are skipped on
protected branches, including the configured main branch, unless cache saving is
forced with `--save-cache` or the `CI` environment variable is set. Cache reads
can still happen on protected branches. Use `--disable-cache` to bypass cache
entirely.

Ways to force fresh behavior:

- Change the step description/assertion when the intent has changed; this
  changes the step identity used for cache matching. In v1, splicing a changed
  step also creates fresh internal UUIDs.
- Use `--disable-cache` for dynamic targets that should resolve fresh every run,
  such as today's date or the next available slot.
- Preserve good previewed cache by carrying `CacheId` into splice with
  `--cache-id <CacheId>`.
- Change assertion wording and add disambiguation when previous AI memory is now
  misleading.

## Timing

Momentic uses smart waiting before targeting steps. It waits up to the
configured smart-waiting timeout, which defaults to 5 seconds, for device state
to settle or the target to appear. Within that window, do not add manual waits.
For slower or more semantic readiness, use a targeted element/screen check, an
AI check, or a native wait only when the test genuinely needs fixed time.

## Settings precedence

`momentic.config.yaml` sets project defaults, but many mobile settings can be
overridden at the test level: platform, default app asset channel/tag, emulator
provider, local device/app overrides, locale/timezone, geolocation, timeouts,
headers, and environment. Always check the test's own metadata before assuming
the project default applies.

For managed mobile assets, treat `channels` from `momentic_get_artifacts()` as
the source of truth. `settings.defaultChannel` must be a real channel for the
test platform. `settings.defaultTag` is optional; omit it to use the most recent
uploaded tag for that channel. Do not assume `"latest"` is special unless that
literal tag exists.

## Test context

Each run has a test-scoped `env` context that persists across steps, including
modules. Later steps can read values written by earlier steps.

- v2: use `saveAs` on steps with return values.
- v1/MCP CLI strings: use `--env-key`.
- JavaScript: prefer `return` plus `saveAs` / `--env-key`; use
  `setVariable(name, value)` when setting multiple variables.
- Use `env.NAME` in JavaScript and module input expressions.
- Use `{{ env.NAME }}` in string fields. `{{ ... }}` can evaluate JavaScript,
  but do not use it inside JavaScript step source because `env` is already in
  scope there.

Module inputs are JavaScript fragments as strings. Quote literal strings and use
`env.X` for variables; they are not `{{ }}` templates.

## JavaScript context

Mobile JavaScript steps run in the mobile execution sandbox. Use them for short
one-off data prep, API checks, assertions, or context writes that native mobile
steps cannot express.

The sandbox commonly provides `env`, `setVariable`, `axios`, `assert`, and other
Momentic-provided helpers. If exact JS support matters, check the JavaScript
command docs or the Step Authoring Guide from `momentic_session_start`.

Keep short one-off JavaScript inline. In v2 YAML, reusable utilities and long
scripts can live in a project script file, following existing project
conventions. Prefer locations such as
`$MOMENTIC_PROJECT_ROOT/scripts/mobile-utilities/setup.js` when the project
already has a `scripts/` pattern. Read nearby scripts first and match their
module style, helper naming, env usage, and error style.

# Project State On Disk

Mobile tests are `*.test.yaml` files. Mobile modules are reusable step
collections stored as `*.module.yaml` files. Test IDs are authoritative and live
on the test file's `id` field.

There are two major mobile file formats:

- `fileType: momentic/mobile-test/v2` or
  `fileType: momentic/mobile-module/v2` -> **mobile v2**. Direct YAML editing is
  preferred for high-confidence localized changes when live device discovery is
  not needed.
- Missing `fileType`, or any other value -> **v1**. Never edit v1 YAML
  directly; persist changes only through `momentic_test_splice_steps`.

Mobile v2 tests include a required `platform` value: `ANDROID` or `IOS`.
Platform-specific command availability matters. Do not add Android-only commands
to iOS tests.

`momentic.config.yaml` is the project root config. It stores project defaults
for agents, AI features, emulator settings, file globs, environments, mobile
assets, cache behavior, and advanced settings.

Mobile v2 steps can reference local files by relative path:

- Module invocations: `module: ./modules/login.module.yaml`
- JavaScript steps: `javascript: ./scripts/setup.js`
- File injection: command-specific local file paths

Relative paths resolve from the YAML file containing the step, not from the
project root or importing test. Use `./...` or `../...`; do not use absolute
paths or `~`. If you move, rename, or delete a referenced file, grep for the old
path and update every reference.

v1 YAML should still be edited only through MCP. Do not use file-backed
JavaScript in v1 YAML or MCP CLI step strings; v1 JavaScript steps should carry
executable code in `code` / `--code`. Use JavaScript file references only in
mobile v2 YAML.

Do not add internal or auto-generated fields to v2 YAML.

# Before You Edit

Gather only what you need:

- Test goal and user-visible mobile success criteria.
- Platform: Android or iOS.
- App source: managed channel/tag, local APK/.app, or an already-installed app.
- Provider: remote by default; local only when the user explicitly asks for a
  local emulator/simulator.
- Auth requirements and required env vars.
- Risky actions that must not run twice: submit, purchase, delete, send, create.

For long tasks, inspect nearby mobile tests and modules before authoring.
Reusing an existing module is usually better than rebuilding a common flow
inline.

Ask before long-running checks, starting over from scratch, destructive actions,
local device overrides, or editing a shared module.

# Choose The Workflow

If the user requests a specific workflow, respect it unless it is unsafe or
impossible. Otherwise, use direct mobile v2 YAML editing when the file is v2, the
change is localized, the step sequence is known, and live device discovery is
not required. Good examples: reword an assertion, adjust a target, update an env
key, fix a file reference, or insert a small known step from a nearby pattern.

Use the MCP device-validation workflow when the file is v1 or unknown, live UI
state must be discovered, target timing is flaky, the flow is multi-step and
unclear, the change depends on platform behavior, or the user asks to
build/validate interactively.

Use `momentic_test_create` for new mobile tests; search for the tool if it is not
visible. It requires `name`, `platform`, and valid mobile settings. Only pass
folder/path fields when requested.

`momentic_session_start` requires an existing `testId`; it does not create
tests.

# Universal Authoring Rules

- Prefer natural-language element descriptions. Use coordinate targets only as a
  last resort for cases the AI cannot see, such as canvas-like surfaces,
  non-semantic custom views, maps, games, or a user-requested coordinate target.
- Prefer native mobile steps over JavaScript. Use JS only when no native step
  expresses the behavior.
- Do not add launch/open-app steps at the start unless the test actually needs
  to switch apps or recover app state.
- Keep assertions minimal and user-driven. Add readiness checks only when they
  are needed to make the next dependent action reliable.
- After an action that should materially change screen state, add an immediate
  validation before dependent actions. Prefer `ELEMENT_CHECK` or `SCREEN_CHECK`
  for deterministic text/state, and `AI_CHECK` for semantic visual state.
- An `AI_CHECK` is multimodal by default (screenshot + accessibility/XML
  hierarchy). For a screenshot-only check, use its visual-only form (the
  `assertVisually` YAML key). Reach for it when the hierarchy is unavailable or
  unreliable, such as a WebView with multiple pages, or when the condition is
  purely visual. The condition must be fully verifiable from the current
  viewport, since no hierarchy and nothing offscreen is available.
- Do not use AI actions unless the user asks or the existing test already uses
  one.
- Do not add optional/default fields unless needed for correctness.
- Keep the delta small. Preserve unrelated params, request bodies, env keys,
  literal values, quoting, comments, ordering, and step style.
- Do not work around real app failures. If the app is broken, data is missing,
  permissions are blocked, the app asset is wrong, or a backend is down, report
  the failure instead of weakening the test.
- Do not reorganize `before` / `steps` / `after` or setup / main / teardown
  unless the test intent requires it.

# Working With Mobile V2 YAML

Mobile v2 is the human-editable format. Steps are compact: each step has one
top-level command key, such as `tap: Continue`, or a detailed map under that key.
Tests use `before` / `steps` / `after`; modules use `steps`. Durations are
always milliseconds. No visible step/command IDs.

Direct-edit loop:

1. Confirm `fileType` and `platform`.
2. Inspect nearby tests/modules for local command style.
3. Edit the smallest YAML range.
4. Run lint or MCP validation when syntax or behavior is uncertain.

Common mistakes:

- Using Android-only commands in iOS tests.
- Using percent coordinates outside `0..100` in v2 YAML or outside `0..1` in MCP
  CLI-style step strings.
- Confusing swipe direction with scroll intent. `SCROLL_TO --direction down`
  searches lower content; `SWIPE --direction up` moves the finger up and reveals
  lower content.
- Adding step IDs, command IDs, cache blobs, or execution artifacts to YAML.
- Using the wrong detailed target-field name for a command.

`npx momentic-mobile lint` validates mobile v2 schemas and file references. Run
it when you are unsure of syntax after edits or after moving/renaming referenced
files.

State refresh after disk edits:

- Active MCP session: use reload if available, otherwise restart the session and
  run the edited range.
- No active MCP session: start a fresh session when ready to validate.
- `momentic_test_get` inspects persisted state; it does not refresh an active
  session after disk edits.

# MCP Device-Validation Workflow

Use this for every v1 edit and for mobile v2 work that needs live discovery. The
tool surface is shared; persistence differs: v1 uses splice, while v2 can use
splice or direct YAML edit plus reload/restart.

## Discovery

- `momentic_get_artifacts()`: project context, config path, cwd, tests, modules,
  environments, available AVDs, available iOS simulators, and managed mobile
  asset channels. Read only what you need.
- `momentic_test_get({ testId | testPath })`: inspect persisted mobile test
  state. Before a session, this is useful. During an active session after
  splicing, prefer the splice response or `returnTest: true`.
- `momentic_module_recommend({ userRequest })`: find reusable flows.
- `momentic_module_get({ selector })`: inspect module params, defaults, enums,
  and steps. Selector is exactly one of `{ id }`, `{ name }`, or `{ path }`.

## Sessions

- `momentic_session_start({ testId, ... })`: start a mobile session. It returns
  metadata, the Step Authoring Guide artifact, active Test Content with session
  step IDs, an initial screenshot, and installed-apps info. Required: `testId`.
  Call it by itself, not in parallel with other MCP tools.
- The platform is inferred from the test. Prefer the test's default emulator
  settings. Omit provider/device/app overrides unless the user explicitly asks.
  If a provider must be chosen, prefer `remote`; use `local` only when requested.
- Session start options include `provider`, `envName`, `localDeviceId`, and
  `localAppPath`.
- Read the Step Authoring Guide before constructing CLI-style mobile steps.
- `momentic_run_step({ sessionId, fromStep, toStep?, targetSection?,
resetSession? })`: run existing active-session steps. Use step IDs from Test
  Content or splice responses, never raw YAML. Use `parentStepIdChain: []` for
  top-level steps. Responds with the full result if the run finishes within 30
  seconds. Otherwise it responds with the `stepRunnerId` and currently
  executing step while the run continues in the background. Poll
  `momentic_poll_runner` for the result. Do not start multiple runs in the same
  session at once unless you intentionally want overlap; overlapping runs share
  emulator state and can race each other.
- `momentic_poll_runner({ sessionId, stepRunnerId?, timeoutSeconds? })`: reports
  active runs, finished runs, and any newly finished results. Prefer passing the
  `stepRunnerId` reported by `momentic_run_step` to scope the response to that
  run. Pass `timeoutSeconds` (0-30, default 0) alongside `stepRunnerId` to wait
  up to that long for that run to finish before responding. Poll this instead
  of retrying `momentic_run_step`.
- If state drifts, restart with `momentic_run_step` and `resetSession: true` on
  the same `sessionId`; do not reset between every micro-edit.
- `momentic_session_terminate({ sessionId })`: terminate when done.

## Test authoring loop

Author MCP steps in checkpoint-sized chunks. Preview forward until a logical
section works, then splice that checkpoint. Good checkpoints are natural mobile
flow boundaries such as login complete, permission handled, form submitted, item
created, or confirmation visible. Avoid splicing one step at a time unless each
step is uncertain, risky, or affects shared module structure.

- `momentic_preview_step({ sessionId, step })`: execute one mobile step without
  persisting. It is stateful. If it returns `CacheId`, include
  `--cache-id <CacheId>` when splicing that step. The response screenshot shows
  device state after the step.
- If a preview screenshot is not enough to target, call
  `momentic_get_session_state` with `returnBrowserState: true`, then inspect the
  emulator-state text or artifact for accessible names, visible text, XML nodes,
  webview structure, screen bounds, and nearby structure.
- When the next several steps are obvious and low-risk, such as filling known
  fields, splice them together and run that saved range instead of previewing
  each field one by one.
- `momentic_test_splice_steps({ sessionId, startIndex, deleteCount, steps,
targetSection?, parentStepIdChain?, returnTest? })`: insert, replace, or
  delete steps and persist.
- After splicing, read the response immediately; it is the source of truth for
  inserted/deleted refs and active-session step IDs.
- If `returnTest: true`, verify the returned structure before continuing.
- If downstream steps remain, run the immediate next step or small range to
  confirm the flow still connects.
- For non-idempotent actions such as submit, purchase, delete, send, or create,
  avoid repeated previews. Preview the setup steps, splice the checkpoint before
  the risky action, then execute the risky saved step once only when validation
  requires it.
- For obvious adjacent low-risk steps, batch them; do not checkpoint after every
  field unless target or device state is uncertain.
- When the requested edit is complete, ask whether to validate from the start by
  running the relevant saved range with `momentic_run_step`.

## Reading tool output

Sessions are live emulator/simulator processes. Screenshots and UI snapshots are
transient. If the screenshot does not show expected state after an action, call
`momentic_get_session_state` once more; the app may still be loading.

MCP tools may return artifact links under `.momentic-mcp/...`. Read linked files
only when needed:

- Emulator-state text: refine targeting or debug native/webview structure.
- Screenshots: usually already returned inline as images.
- Environment files: validate `envKey`, JavaScript/API outputs, or dependent
  env values.
- Installed-apps reports: verify package/bundle state when app launch or install
  behavior is unclear.
- `momentic_get_session_state` returns serialized emulator state only with
  `returnBrowserState: true`; screenshots are returned by default.

## CLI-style step strings

`preview_step` and `splice_steps` use CLI-style strings:
`--step-type <TYPE> [options]`. The platform-specific Step Authoring Guide
returned by `momentic_session_start` is authoritative.

Common examples:

- Tap: `--step-type TAP --description "the Continue button"`
- Type:
  `--step-type TYPE --description "Email field" --value "user@example.com" --clear-content`
- AI check:
  `--step-type AI_CHECK --assertion "the confirmation message is visible" --timeout-seconds 10`
- Scroll to:
  `--step-type SCROLL_TO --description "Settings" --direction down`
- Press:
  `--step-type PRESS --key HOME`
- Module:
  `--step-type MODULE --module-id <id> --inputs email=env.USER_EMAIL`

Splice example:

```json
{
  "sessionId": "SESSION_ID",
  "startIndex": 0,
  "deleteCount": 0,
  "steps": [
    "--step-type TAP --description \"the Continue button\" --cache-id UUID_FROM_PREVIEW",
    "--step-type AI_CHECK --assertion \"the next screen is visible\" --timeout-seconds 10"
  ],
  "targetSection": "main"
}
```

For mobile conditionals, create the `CONDITIONAL` step with `--assertion-type`
and the matching assertion fields, then splice nested steps with
`parentStepIdChain: [conditionalStepId]`.

# Modules

Default to module-first for logical flows of 4+ steps such as login, permission
handling, setup, navigation inside the app, or checkout. Call
`momentic_module_recommend`, inspect strong candidates with `momentic_module_get`,
then decide module vs inline.

Modules cannot contain modules. Splicing a `MODULE` step inside a module fails.

Editing a shared module requires user confirmation. To modify a module through
MCP, replace the module step with a `MODULE` step carrying the needed metadata
flags: `--parameters`, `--parameter-enum`, `--default-parameter`,
`--module-name`, `--module-description`, `--disabled`. Keys in
`defaultParameters` and `parameterEnums` must exist in `parameters`.

Module `inputs` values are JavaScript fragments as strings. Quote string
literals, reference env as `env.X`, and respect enum constraints exactly.

# Validation Strategy

- Direct mobile v2 edit with no live validation requested: summarize changes and
  ask whether to run.
- Direct mobile v2 edit with active session: reload if available, otherwise
  restart the session, then run the edited range.
- MCP-authored edit: preview forward, splice at logical checkpoints, then run the
  next downstream saved step or range.
- Long full-test runs, local device overrides, and risky actions require
  confirmation.
- Terminate MCP sessions when done.

# Troubleshooting

## Device state and timing

- Wrong screen/UI: read latest emulator state or call `momentic_get_session_state`.
- Screenshot not updated: call `momentic_get_session_state` once more.
- Flaky timing: prefer `AI_CHECK`, `SCREEN_CHECK`, `ELEMENT_CHECK`, or a targeted
  `SCROLL_TO` over generic `WAIT`.
- Long backend job/import/upload: use an assertion or screen/element wait with an
  appropriate timeout instead of sleeps.
- Permission dialog or system sheet: handle it explicitly before continuing.
- Weird session state: use `momentic_run_step` with `resetSession: true`.

## Targeting and cache

- Element not found: inspect screenshot/emulator state. If visible, improve the
  description using visible text, role/name, and nearby context; if absent,
  debug the prerequisite step or scroll state.
- Wrong element was hit quickly or without any AI: suspect stale cache,
  especially when the screen structure is similar to a prior run.
- Dynamic target: change the description to be stable, or disable cache for that
  step.
- Coordinates: use `--x-fraction` / `--y-fraction` only when semantic targeting
  is not available. In MCP CLI strings, fractions are `0..1`.
- Scroll direction: use `SCROLL_TO --direction down` for lower content and
  `SCROLL_TO --direction up` for earlier content. Use manual `SWIPE` when there
  is no specific target or `SCROLL_TO` is not appropriate.
- Quoted text: quoted substrings in descriptions are treated literally by
  Momentic AI. Use quotes only when that exact text must appear on screen or in
  the element's name; omit quotes for semantic matching.

## AI check performance

- Ambiguous assertion: make the expected visual/text condition concrete. Include
  the relevant screen region, object, count, or state.
- Literal text mismatch: quoted strings are treated as text that must appear on
  screen. Remove quotes when semantic matching is intended.
- Off-screen: visual conditions like color or shape can only be evaluated if
  the element is visible. Use scroll/gesture setup.
- Repeated bad verdict: reword the assertion so the intended condition is
  clearer and old memory no longer applies.
- Transient conditions: AI checks retry over the configured timeout, but each
  attempt is an instantaneous snapshot. Prefer stable final-state assertions; if
  necessary, use a deterministic element/screen check.

## Format and data

- Env value missing: confirm the producing step used `saveAs` / `--env-key` or
  `setVariable`, and that the consuming syntax is `env.X` vs `{{ env.X }}`.
- Module input error: inputs are JavaScript fragments as strings; quote string
  literals and match enum constraints exactly.
- App launch/install issue: inspect test settings, managed channels/tags,
  installed-apps artifact, and whether the session is remote or local.
- Platform mismatch: check the test `platform` and the Step Authoring Guide for
  platform-specific command availability.

# Completion Checklist

- Identify v1 vs mobile v2 and choose MCP vs direct edit.
- For MCP changes: preview forward to checkpoints, splice with cache IDs, read
  splice refs, and run the next saved step/range.
- For v2 direct edits: lint or validate when syntax/behavior is uncertain.
- Ask before full start-to-end validation unless the user already requested it.
- End any MCP session you started.
