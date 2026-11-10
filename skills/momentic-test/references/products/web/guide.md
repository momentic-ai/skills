# Write browser tests

Run saved tests with:

```bash
npx momentic run <test-path>
```

Use `--remote-browser-region westus3` for hosted browsers. Add
`--upload-results` when a shareable result is needed; return only printed URLs.

Read [Authoring](authoring.md) when choosing steps or editing YAML.
Read [Troubleshooting](troubleshooting.md) when a failure blocks validation.

For approved side effects, save without previewing, then run the saved test
once with `npx momentic run <test-path> --retries 0`.

Except for approved side effects, preview adjacent steps with
`momentic_preview_steps`; use `momentic_preview_step` for an uncertain
individual target.

Find reusable modules with `momentic_module_recommend`.
Read [Pass module inputs](authoring.md#pass-module-inputs) when supplying inputs.
