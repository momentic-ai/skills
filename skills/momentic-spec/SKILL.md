---
name: momentic-spec
description: Specify browser, Android, and iOS behavior with Momentic tests before implementing new or changed features.
---

# Specify product behavior with Momentic

1. Read [momentic-test](../momentic-test/SKILL.md) for product selection, the selected
   CLI and local MCP server, and product-specific and linked shared references.
   Read repository guidance and nearby tests and modules.
2. List the tests to add or change for the request. If none are affected, say why.
3. Write the expected behavior before implementing it. Review the test diff
   against the request and summarize the expected failure to confirm the
   specification. Prepare required accounts, data, permissions, and services
   before running new tests once to confirm the expected failure. If setup is
   blocked, report it instead of treating it as an expected failure.
4. Implement the change. Update the specification first if the requirement changes.
5. Enable tests that should now pass and run the smallest affected set through the app.
   Run the repository's required product-code checks too.
6. Report verified behavior, tests not run, and tests still disabled.

Read the [web guide](references/products/web/guide.md) when specifying browser
behavior, or the [mobile guide](references/products/mobile/guide.md) for Android/iOS.

## Choose coverage

Update existing tests for changed behavior; add a test for a new user flow.
Start with user-named tests; expand only for demonstrated behavioral impact.
Keep one changed contract to a focused test delta. Preserve unrelated setup,
teardown, data, assertions, and intent. Don't weaken tests to match an incorrect
implementation or work around a product bug.
Trace shared components to real behavioral impact when finding affected tests;
don't infer coverage from filenames alone.
Reuse modules for established setup and navigation, checking their callers
before changing shared behavior. Follow nearby naming, setup, and assertion style.

## Prepare the run

Momentic validates end-to-end checkpoints, not every edit or commit. A checkpoint
exercises behavior in the product with an observable outcome, including the
expected failure before implementation in step 3.
For a small change, the next checkpoint is usually the implemented change.
Run once, diagnose failures, and make a coherent fix. Rerun only when the
end-to-end outcome can reasonably have changed.

Mark a test `disabled: true` only when the product or a required dependency
isn't ready. Record what must change before enabling it. Report missing local
credentials as a validation gap rather than disabling a valid test.

Use existing test setup. Keep shared data stable and clean up only data created
for the run. Restrict new setup tooling to approved test environments,
authenticate it where needed, make it repeatable, and keep it out of production.
Seed prerequisites, not the behavior being verified.
Make tests repeatable from a clean environment without accidental prior state.

Before a long run, confirm the test set and expected duration unless already
authorized. Treat unknown duration as long-running; confirm another long run
unless iterative reruns were approved.
If the user declines, continue with non-Momentic checks and report tests as
not run.
