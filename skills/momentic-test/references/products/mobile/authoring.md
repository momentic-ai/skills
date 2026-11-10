# Author Android and iOS tests

## Prepare the device

Run `npx momentic-mobile doctor` for initial setup or device/connectivity
failures; use `--json` for a support report.
Read the [Android](https://momentic.ai/docs/platforms/android/app-setup) or
[iOS](https://momentic.ai/docs/platforms/ios/app-setup) setup guide when
dependencies are missing.

Remote Android needs adb and `ANDROID_HOME`; local Android also needs Java
and Android Studio. Local iOS needs macOS and Xcode; remote iOS needs a
simulator build, not local Xcode.

Enable WebView debugging in Android builds that automate WebViews.
A missing debug connection can report `No browser controller is attached to
the requested webview`. Device WebViews don't need local Chromium.

## Edit YAML

Use `*.test.yaml` for tests and `*.module.yaml` for modules.
Read `momentic.config.yaml` and test metadata. Use a UUID or lowercase
kebab-case test `id`, at most 36 characters.

Edit `momentic/mobile-test/v2` and `momentic/mobile-module/v2` directly, then
run `npx momentic-mobile lint`. Save v1 changes through
`momentic_test_splice_steps`.

Set `platform: ANDROID` or `platform: IOS` and use that platform's commands.
Use `before`, `steps`, and `after` in tests, and `steps` in modules.
Give each step one command key and millisecond durations. Omit step IDs,
generated fields, and default-valued options.

Use `defaultEnv`, `defaultChannel`, and optional `defaultTag` for defaults;
override them with `--env`, `--channel`, and `--tag`.
Without a tag, install the latest tag in the channel.
In the `local` region, use `defaultApkFilePath` or `defaultAppFilePath`.
Read valid channels, tags, and aliases from `momentic_get_artifacts`.

Use relative paths from the referencing YAML for modules, JavaScript, and
injected files. Update callers before moving or deleting referenced files.
File-backed JavaScript is v2-only; keep v1/MCP code inline.
Read [File format](https://momentic.ai/docs/core-concepts/file-format) or
[Steps](https://momentic.ai/docs/core-concepts/steps) when syntax is unclear.

## Choose steps

Use natural-language targets and native tap, type, swipe, scroll, wait, and check
steps. Use coordinates for non-semantic surfaces such as canvases or maps:
`0..100` in v2 YAML, `0..1` in MCP step strings.

Start with `openApp` in `before` or the first step unless a launcher already
opens it. Validate a fresh saved run, not only an existing preview session.

Use the app's Android package ID or iOS bundle ID with `openApp`. For example:

```yaml
before:
  - openApp: com.example.app
steps:
  - checkScreenContains: Welcome home
  - checkElementVisible: Get started
```

Check visible results after material state changes and before dependent actions.
Use element/screen checks for deterministic state and AI checks for semantic
visual state. Use visual-only checks when hierarchy data can't express the condition.

Use AI actions when requested or already used by the test. Keep caching for
repeatable flows; disable it for behavior that must be chosen afresh.
Preserve nearby style and unrelated test coverage.

## Pass module inputs

Declare parameters in the module:

```yaml
parameters:
  - name: username
    default: { string: standard_user }
```

Pass inputs from the test:

```yaml
- module:
    path: ./login.module.yaml
    inputs:
      username: { string: standard_user }
```

In a preview step string, use
`--step-type MODULE --module-path ./login.module.yaml --inputs username='"standard_user"'`.
For a shell command, quote the pair as `'username="standard_user"'`.
Inside the module, use `{{ env.username }}` in text fields and `env.username`
in JavaScript.

## Wait and enter text

Use element, screen, or AI checks for positive readiness, increasing their
timeout for longer work rather than polling JavaScript or sleeping.
Set `emulator.smartWaitingTimeoutMs` for pre-targeting readiness;
`emulator.waitForStability` waits after interactions for incremental loads
or animations. Read [mobile configuration](https://momentic.ai/docs/configuration/mobile)
when changing project-wide timing.

For slow iOS input, use `waitForKeyboardSettle`. Replace text with
`clearContent: true`, or `forceClearContent: true` if clearing fails.
For masked fields, target the input explicitly and use a keypress `delay`
when needed. Use `text` and `into` for the value and target.

Scroll to reveal content; swipe for a finger gesture. Swipe up reveals lower
content. Inspect test-level overrides for device, app, locale, timezone,
geolocation, timeout, headers, and environment before changing defaults.

## Use variables and JavaScript

Save results with `saveAs` in v2, `--env-key` in MCP strings, or
`setVariable(name, value)` in JavaScript. Use `env.NAME` in JavaScript and
module input expressions, and `{{ env.NAME }}` in string fields.

Use JavaScript for setup, data generation, APIs, databases, OTP/email/SMS,
assertions, or context writes that a native step can't express.
Read the [mobile JavaScript command](https://momentic.ai/docs/reference/mobile-commands/javascript)
when writing reusable scripts.

## Correct cache or assertion memory

Change descriptions when intent changes. Disable a locator's cache only when
requested or a proven bad match persists after correcting the description
and screen readiness. Reword assertions when old memory contradicts their intent.
