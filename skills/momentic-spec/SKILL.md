---
name: momentic-spec
description: Write Momentic tests as product specifications before implementing new or changed behavior.
---

# Specify product behavior with Momentic

1. Read `momentic.config.yaml`, repository guidance, and nearby tests and modules.
2. Identify the tests affected by the requested behavior. Report their paths and
   whether each test needs to be added or changed. If none are affected, say why.
3. Write the expected behavior in those tests before implementing it. Review the
   test diff against the request, not the current implementation.
4. Implement the change. Update the specification first if the requirement changes.
5. Prepare the required accounts, data, permissions, and services. Enable tests
   that should now pass, then run the smallest affected set at a usable checkpoint.
6. Report the behavior verified, tests not run, and any tests still disabled.

Use the `momentic-test` or `momentic-mobile-test` skill for file formats,
step authoring, and live validation.

## Choose tests and steps

Update existing coverage for changed behavior. Add a test for a new user flow;
reuse modules for established setup and navigation. Check which tests use a
shared module before changing it.

Follow nearby tests' naming, setup, and assertion style. Prefer native steps
and natural-language targets over JavaScript or selectors. Preserve unrelated
coverage and don't weaken a check to match a product bug.

For new browser tests, prefer an AI action when a short goal expresses the
behavior more clearly than individual steps. Keep reusable setup in modules and
check the result after the action. Use individual steps when intermediate
states or side effects need separate checks.

For timing-sensitive sequences, keep the rapid interactions in one focused AI
action and verify the transient state in the recorded run. A passing final
state alone doesn't prove that a race was exercised.

Keep caching enabled for repeatable flows. Disable it only for behavior that
must be chosen afresh, such as opening the latest record. When the expected
behavior changes, update the goal rather than disabling its cache.

## Prepare and run the specification

Mark a test `disabled: true` only when the product behavior or a required
dependency isn't ready. Record why and what must change before enabling it.
Missing local credentials alone are a validation gap, not a reason to disable
an otherwise valid test.

Use the project's existing test setup to establish prerequisites. Keep shared
data stable during the run and clean up only the data created for it.

If you add setup tooling, restrict it to approved test environments, authenticate
it where needed, make it safe to repeat, and keep it inaccessible in production.
Seed prerequisites, not the behavior the test is meant to verify.

Run at a checkpoint where the behavior can be exercised through the app. Before
a long-running run, confirm the test set and expected duration with the user
unless they already authorized it. Treat unknown duration as long-running.
Get confirmation again for another long run unless iterative reruns were approved.
