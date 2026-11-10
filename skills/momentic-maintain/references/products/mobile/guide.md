# Maintain Android and iOS tests

Read [Mobile authoring](../../../../momentic-test/references/products/mobile/authoring.md)
when preparing the device.
Match the failing test's app build, platform, environment, and credentials.
Compare screenshots, screen state, and device logs.

Filter run history by `executionType: ANDROID` or `IOS`, reading every required
page before summarizing results.

## Save a classification

Open `https://app.momentic.ai/runs/<runId>`, choose the thumbs-down control
beside the classification, then choose **Override classification**.
The connected mobile tools don't save classifications.

## Repair quarantined tests

Use `momentic_quarantine_list` for retained failures. For fresh results, run:

```bash
npx momentic-mobile run --only-quarantined --output-dir test-results
```

Inspect results even when failures make the command exit nonzero.
Lint the repair with `npx momentic-mobile lint`, then validate with
`npx momentic-mobile run <test-path> --ignore-quarantine`.

Leave quarantine unchanged unless removal is requested. After a verified repair
and approval, run:

```bash
npx momentic-mobile quarantine remove <test-name> --reason "Repair verified by the rerun"
```
