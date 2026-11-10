# Classify the failure

Read the test's name, description, and steps to establish intent.
Find the earliest divergent step and its broken postcondition.
Mark failures outside that intent, including setup/teardown failures, as unrelated.

Choose the category supported by evidence:

- `NO_FAILURE` when all attempts passed.
- `APPLICATION_CHANGE` when history or app changes prove a previously passing
  flow changed and a test update would fix it.
- `BUG` when the app behaves incorrectly.
- `TEST_AUTHORSHIP` when a concrete test correction preserves intent and
  permanently fixes the failure. Without evidence of a previous passing flow,
  use this for a wrong expectation rather than assuming an app change.
- `TEST_SETUP` when credentials, files, or data require outside action.
- `INFRA` for outages, crashes, resource pressure, rate limits, or slow-but-eventual
  readiness, after ruling out wrong state, targeting, assertions, and setup.
- `MOMENTIC_ISSUE` for incorrect Momentic execution or data, such as an
  unambiguous AI misread or bad cached locator with no reasonable test correction.
- `OTHER` when none fits.

Use screenshots to distinguish a changed app from a broken app.
Relatedness doesn't turn an infrastructure failure into another category.
Increasing a timeout alone isn't a permanent authorship repair.

Report recoverability as `RECOVERABLE` for a persistent test fix,
`ONE_TIME_RECOVERABLE` for recovery without a saved edit, or
`NON_RECOVERABLE` when outside intervention is needed.

```text
Reasoning: <earliest divergence, screenshots/traces, intent, and relevant history>
Category: <category ID>
Recoverable: <recoverability ID>
Confidence: <high for direct evidence, medium for converging evidence, low for inference>
```

Use readable step/module names in the report and exact IDs in tool calls.
Link historical runs as `https://app.momentic.ai/runs/<full-run-UUID>`.
