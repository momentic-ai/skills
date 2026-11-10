# Write Android and iOS tests

Run saved tests with:

```bash
npx momentic-mobile run <test-path>
```

Add `--upload-results` when a shareable result is needed; return only printed URLs.
Read [Authoring](authoring.md) when preparing the device or editing YAML.
Read [Troubleshooting](troubleshooting.md) when a failure blocks validation.

Use the test's configured device and app. Confirm any requested local-device
override before applying it.

For approved side effects, save without previewing, then run the saved test
once. Set `retries: 0` in v2 tests or `settings.retries: 0` in v1 tests.

Except for approved side effects, preview each step with
`momentic_preview_step` and wait for completion before the next step.
Discover modules, devices, and app channels with
`momentic_get_artifacts`.
Read [Pass module inputs](authoring.md#pass-module-inputs) when supplying inputs.
