## Prepare the device

Run `npx momentic-mobile doctor` for initial setup and launch, driver, device,
or connectivity failures. Use `--json` when collecting a support report. See
the [doctor reference](https://momentic.ai/docs/cli-reference/momentic-mobile/commands/doctor).

Remote Android requires adb and `ANDROID_HOME`; local Android also requires
Java and Android Studio. Local iOS requires macOS and Xcode; remote iOS does not
once a simulator build is available. Follow the
[Android](https://momentic.ai/docs/platforms/android/app-setup) or
[iOS](https://momentic.ai/docs/platforms/ios/app-setup) setup guide rather than
guessing at missing dependencies.

Android WebView automation requires a build with WebView debugging enabled.
Debug builds usually provide it; release builds must enable it explicitly.
Missing debugging commonly appears as `No browser controller is attached to
the requested webview`. Mobile WebViews run through the device and do not need
a local Chromium installation.

# Project files and formats

Mobile tests use `*.test.yaml`; modules use `*.module.yaml`. Test IDs live in the
test file's `id` field. Check `momentic.config.yaml` and test-level metadata
before assuming project defaults apply.

`fileType: momentic/mobile-test/v2` and
`fileType: momentic/mobile-module/v2` identify mobile v2. Treat missing or
different `fileType` as deprecated v1. Never edit v1 YAML directly; persist
changes through `momentic_test_splice_steps`.

Mobile v2 tests require `platform: ANDROID` or `platform: IOS`. Commands are
platform-specific.

A mobile v2 test carries its own defaults: `defaultEnv` for environment
variables, `defaultChannel` for the app channel, and `defaultTag` for a tag or
an alias such as `nightly`. `--env`, `--channel` and `--tag` override them.
`defaultTag` is optional: without it, the run installs the latest tag in the
channel. In the `local` region the test installs `defaultApkFilePath` or
`defaultAppFilePath` instead.

V2 can reference modules, JavaScript, and injected files with relative paths.
Paths resolve from the YAML file containing the reference. Use `./...` or
`../...`, never absolute paths or `~`. Before moving, renaming, or deleting a
referenced file, grep its path and update or remove every reference. File-backed
JavaScript is v2-only; v1/MCP step strings carry code inline. Do not add internal
or generated fields to v2 YAML.

# Test execution behavior

## Cache and memory

Momentic caches native selectors, XML nodes, visible text, webview state,
coordinates, and other metadata. AI checks may also reuse past-result memory.
Stale cache or memory can explain a fast wrong-target action or a repeated
borderline verdict.

Cache is scoped by git metadata, including branch. Protected branches read cache
but do not write it unless `--save-cache` is used or `CI` is set.

- Change a step description when its intent changes. Do not add `DANGEROUS_FORCE_DYNAMIC` or `--disable-cache` to locator steps unless asked, or unless a proven bad cache persists after clarifying the description and fixing timing.
- Reword an assertion when old memory no longer matches its intended condition.

## Readiness and timing

`emulator.smartWaitingTimeoutMs` budgets readiness before AI locate, cached
element retries, and other single-interaction waits. `emulator.waitForStability`
instead waits after each interactive step so its effects land before the next
step begins. Turn on `waitForStability` for apps that load incrementally,
animate between screens, or are broadly slow. It does not control pre-targeting
waits.

Within smart waiting, do not add sleeps. For longer or semantic readiness, use
an element, screen, or AI check that describes the required positive state.
Checks retry until their timeout; increase that timeout instead of polling with
JavaScript. See
[mobile configuration](https://momentic.ai/docs/configuration/mobile) for
project-wide timing settings.

## Common execution pitfalls

- Keyboard and input animations can race with typing. For slow iOS inputs, use
  TYPE's keyboard-settling option. For masked or formatted fields that move the
  cursor, target the input explicitly and add a keypress delay when needed.
- Scroll describes the content to reveal; swipe describes the finger gesture.
  Scrolling down finds lower content, while swiping up moves the finger up to
  reveal it.

## Devices, apps, and settings

Test-level settings can override project platform, app asset, emulator, locale,
timezone, geolocation, timeout, header, and environment defaults. Inspect both
levels before changing behavior.

For managed assets, use the `channels` artifact from
`momentic_get_artifacts` as the source of truth for valid platform channels,
tags, and aliases. Follow the current tool description for `defaultChannel` and
`defaultTag` behavior.

## Test context

Each run has a test-scoped `env` that persists across steps and modules.

- In v2, save returned values with `saveAs`; in MCP step strings, use
  `--env-key`. Use `setVariable(name, value)` in JavaScript when saving several
  values.
- Use `env.NAME` in JavaScript and module input expressions. Use
  `{{ env.NAME }}` in string fields, but not inside JavaScript source.

## JavaScript

Use native tap, type, swipe, scroll, wait, and check steps for device behavior.
They retain Momentic's targeting, smart waiting, cache, and traces. Do not use
JavaScript to reproduce those actions or poll UI state when a check can retry.

Use mobile JavaScript for test setup, data generation, APIs, databases,
OTP/email/SMS, assertions, and context writes that no native step expresses.
Keep one-off code short; for reusable v2 scripts, follow nearby project
conventions. See the
[mobile JavaScript command](https://momentic.ai/docs/reference/mobile-commands/javascript)
for current syntax.

# Working with mobile v2 YAML

Mobile v2 is human-editable. Tests use `before`, `steps`, and `after`; modules use
`steps`. Each step has one command key, durations are milliseconds, and runnable
step IDs are not stored in YAML.

Common pitfalls:

- Android-only commands in iOS tests.
- Coordinates outside `0..100` in v2 YAML or `0..1` in MCP step strings.
- Adding IDs, cache blobs, artifacts, or the wrong detailed target field.

Consult [File format](https://momentic.ai/docs/core-concepts/file-format) for
top-level structure and [Steps](https://momentic.ai/docs/core-concepts/steps) for
step syntax.

`momentic_test_get` reads persisted state; it does not refresh an active session.

## Choose steps

- Prefer natural-language targets. Use coordinates only for surfaces the AI
  cannot see, such as canvases, maps, games, or non-semantic custom views.
- Do not add an initial launch/open-app step unless the test must switch apps or
  recover app state.
- Keep assertions minimal and user-driven. Validate material state changes
  before dependent actions.
- Prefer element or screen checks for deterministic state and AI checks for
  semantic visual state. Use visual-only AI checks only when the condition is
  fully visible and hierarchy data is unavailable, unreliable, or irrelevant.
- Use AI actions only when the user requests one or the existing test already
  uses one.
- Do not add optional or default-valued fields unless correctness requires them.
- Keep changes narrow. Preserve unrelated values, comments, ordering, and step
  style. Do not weaken a test to hide an app, asset, permission, data, or backend
  failure.

AI actions cache and self-heal replayed flows by default. Use `--disable-cache` on `AI_ACTION` for fresh chats, exploratory tests, or other dynamic behavior.
