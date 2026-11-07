# Classify the failure

Determine intent from the test name, description, and steps. Mark failures outside that intent, including setup/teardown failures, as unrelated.
Relatedness qualifies bugs and changes; it does not change an `INFRA` failure into another category.
Prove application changes with screenshots; distinguish them from an application error or other broken behavior.

## Choose one category

Use exactly one ID:

| ID                   | Evidence or constraint                                                                                                                                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NO_FAILURE`         | All attempts passed.                                                                                                                                                                                                                                              |
| `APPLICATION_CHANGE` | A changed flow or UI made the test outdated; updating it would permanently fix the failure.                                                                                                                                                                       |
| `BUG`                | The application behaved incorrectly, such as an error message or missing expected content.                                                                                                                                                                        |
| `TEST_AUTHORSHIP`    | Name a concrete test change that preserves intent and permanently prevents failure. Vague descriptions or a type-with-Enter race fixed by selecting an item qualify. Waiting longer or increasing timeouts does not; use `INFRA` for slow-but-eventual readiness. |
| `TEST_SETUP`         | Missing data, upload files, or credentials require action outside the test.                                                                                                                                                                                       |
| `INFRA`              | External factors such as outages, browser crashes, resource pressure, rate limits, or long load times caused the failure. Rule out wrong page state, data, flow, locator, assertion, and setup first.                                                             |
| `MOMENTIC_ISSUE`     | Execution or Momentic data is wrong: a bad cache/global locator redirect, an unambiguous AI misread, or incorrect trace behavior with no reasonable test alternative.                                                                                             |
| `OTHER`              | No category above fits.                                                                                                                                                                                                                                           |

## Choose recoverability

- `RECOVERABLE`: a persistent test update can fix future runs, such as updating a flow or clarifying a locator/assertion.
- `ONE_TIME_RECOVERABLE`: this run can recover without a persistent edit, such as dismissing an incidental modal or retrying a temporary delay.
- `NON_RECOVERABLE`: external intervention is needed, such as supplying credentials/files or resolving a third-party outage.

## Report the evidence

Name the earliest divergent step/container and its broken postcondition, not only the last failing step.
Use readable module names or step descriptions in reasoning; use exact IDs in tool calls.
For example, write `module create-subpage-under-parent-page`, `the last invocation of module <name>`, `substep 4 (0-indexed)`, or `the failed setup assertion`.
Link past runs as `https://app.momentic.ai/runs/<runId>` with full UUIDs.

```text
Reasoning: <earliest divergence, screenshots/traces, intent, and past runs if used>
Category: <one ID>
Recoverable: <RECOVERABLE | ONE_TIME_RECOVERABLE | NON_RECOVERABLE>
Confidence: <high | medium | low>
```

Use `high` for direct evidence, `medium` for converging signals without conclusive direct evidence, and `low` for ambiguous or inferred causes.
