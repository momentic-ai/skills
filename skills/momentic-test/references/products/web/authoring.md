# Author browser tests

## Edit YAML

Use `*.test.yaml` for tests and `*.module.yaml` for modules. Read
`momentic.config.yaml` and test metadata before choosing defaults.
Test IDs are in the test's `id` field.

Edit `momentic/test/v2` and `momentic/module/v2` files directly, then run
`npx momentic lint`. For v1, save changes through `momentic_test_splice_steps`.
Read the [v2 format reference](https://static.momentic.ai/v2-format-reference.md)
when syntax is unclear.

Use `before`, `steps`, and `after` in tests, and `steps` in modules.
Give each step one command key with options underneath. Use milliseconds for
durations; omit step IDs, generated data, and default-valued options.

Set `defaultEnv` explicitly or override it with `--env <name>`.
The base URL comes from `--url-override`, then test `url`, then `env.BASE_URL`.
A test-level URL therefore stays the same across environments.
A run needs a base URL and doesn't automatically select the only environment.

Use relative paths from the referencing YAML for modules, JavaScript, and auth
state. Update callers before moving or deleting referenced files.

## Choose steps

Use natural-language targets and native click, type, hover, wait, and check steps.
Use selectors or coordinates when the target isn't visible to AI or precise
selector behavior is required. Preserve nearby test style and unrelated coverage.

Start at the test's base URL without adding an initial navigation step.
After a material state change, check the required result before dependent actions.
Use `waitForUrl` for URL contracts, page/element checks for stable content,
and AI assertions for semantic visual state.

Write an AI action as a bare string, such as `- Add a task called Buy milk`,
not `aiAction:`. Keep individual steps for intermediate checks and side effects.
Keep AI action caching enabled for repeatable flows; set `cache: false` in v2
for behavior that must be chosen afresh, such as a new chat.

### Time-sensitive interactions

Use one focused AI action for rapid sequences, with explicit ordering and
instructions not to wait between interactions. Keep setup and stable final
checks outside it. Inspect timestamps and video-backed
[run assertions](https://momentic.ai/docs/core-concepts/writing-assertions#run-assertions)
to verify the transient state was exercised. If the race can't be exercised,
report the coverage gap or use a controlled test fixture.

## Pass module inputs

Declare parameters in the module:

```yaml
parameters:
  - name: username
    default: { string: standard_user }
```

Supply inputs from the test:

```yaml
- module:
    path: ./login.module.yaml
    inputs:
      username: { string: standard_user }
```

In a preview step string, use
`--step-type MODULE --module-path ./login.module.yaml --inputs username='"standard_user"'`.
For a shell command, quote the pair as `'username="standard_user"'`.

## Wait for readiness

Use a URL, page, element, or AI check for the required positive state.
Increase its timeout for longer work rather than polling JavaScript or sleeping.
For project-wide targeting delays, read
[browser configuration](https://momentic.ai/docs/configuration/browser)
before changing smart waiting.

## Use variables and JavaScript

Save results with `saveAs` in v2, `--env-key` in MCP step strings, or
`setVariable(name, value)` in JavaScript. Use `env.NAME` in JavaScript and
module input expressions, and `{{ env.NAME }}` in string fields.

Use Node JavaScript for setup, data generation, APIs, databases, OTP/email/SMS,
and helpers. Use Browser JavaScript for `window`, `document`, or client state
when a native step can't express the operation. Browser callbacks can't capture
Node variables; pass arguments or use `customWindow._momentic`.
Read the [JavaScript guide](https://momentic.ai/docs/integrations/javascript)
when choosing runtime APIs.

## Correct cache or assertion memory

Change a description when its intent changes. Disable a locator's cache only
when requested or a proven bad match persists after fixing the description
and page readiness. Reword an assertion when old memory contradicts its intent.
