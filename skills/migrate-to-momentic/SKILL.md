---
name: migrate-to-momentic
description: Migrate an existing browser or mobile test suite to Momentic one verified flow at a time.
---

# Migrate to Momentic

Move an existing browser or mobile suite to Momentic without losing behavior or coverage. Migrate one flow at a time and keep the source suite and its CI gate until the user approves their retirement.

## Choose the source guide and target

1. Inspect the source tests, runner configuration, app target, and any existing `momentic.config.yaml`. Choose the target from each flow's app and test type, not the repository name.
2. Read the matching source guide before mapping tests:
   - Playwright to web: [From Playwright](https://momentic.ai/docs/guides/migrate/from-playwright).
   - Cypress to web: [From Cypress](https://momentic.ai/docs/guides/migrate/from-cypress).
   - Selenium to web and Appium to mobile: [From Selenium and Appium](https://momentic.ai/docs/guides/migrate/from-selenium-appium).
   - Maestro to mobile: [From Maestro](https://momentic.ai/docs/guides/migrate/from-maestro).
3. In a mixed repository, route each flow separately. Use `momentic` for browser tests and `momentic-mobile` for Android or iOS tests.
4. If no guide covers the runner or behavior, use documented Momentic commands when they preserve the same behavior. Record unsupported mappings and continue with the flows you can verify. Ask only when a coverage decision has no safe default.

Use `momentic-test` for Momentic test authoring, product-specific references, and CLI or MCP details. Keep those instructions in that skill rather than copying them here.

## Create or resume the inventory

Use a repository-root `MIGRATION.md` for this effort. If it already tracks another migration, leave it intact and use `MIGRATION-momentic.md`. Read either existing inventory before editing it and preserve unrelated content.

Track one row per source flow, including its source path, expected behavior and assertions, setup and cleanup, fixtures or mocks, environment variable names, target Momentic path, baseline result, verification result, and any gap. Record secret names, never their values.

Before editing a flow, run its source test against the intended test environment when it is safe to do so. Record the command, app build, test data, and result. If you cannot establish a source baseline, record why and leave equivalence unverified.

Update the inventory after each flow so another session can continue from the recorded state instead of rescanning completed work.

## Port one flow at a time

Follow the source guide's mapping for authentication, helpers, fixtures, mocks, waits, device or browser setup, and cleanup. Preserve the meaning and strength of every assertion, including checks for exact values, errors, and absent behavior. Do not replace a specific assertion with a broad page or app success check.

For a deterministic one-to-one port, use explicit selectors and exact checks.
Natural-language targets in preset steps use AI to locate elements; label those
ports AI-assisted. Mobile selector APIs do not always have a deterministic
Momentic equivalent, so record the gap instead of claiming parity.

If Momentic cannot represent part of a flow, record the unsupported behavior and leave the source test and CI coverage in place. Ask before weakening or dropping an assertion, test, setup step, or platform requirement.

## Verify each port

Use the selected source guide's lint and run commands, then compare the source and Momentic tests against the same app build, configuration, and test data where possible. Check that the port exercises the same actions and assertions, not only that its command exits successfully. Follow the guide's expected-failure check within the environment and data scope already authorized for the task. Use disposable data when a test would reach shared state outside that scope; ask only when authorization or scope is genuinely unclear and no safe test data is available.

When the flow can be repeated safely, run both versions three times against the same build and record each result. If the environment or side effects prevent that comparison, record the limit instead of claiming equivalent coverage.

After each run, update the inventory with the command, result, evidence reviewed, and remaining gaps. Keep unverified flows marked as unverified.

## Report the result

Summarize which flows were migrated and verified, which remain on the source runner, the commands and comparison results, and any unsupported or unverified behavior. Do not remove source tests, dependencies, or CI jobs unless the user explicitly approves that cleanup.
