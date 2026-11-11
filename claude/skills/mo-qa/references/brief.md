# Write a brief

Describe the target and desired behavior:

```text
Target: https://preview.example.com/checkout?variant=express
Goal: Keep the selected shipping method after returning from payment.
Sign in: Use the staging QA buyer account.
Test data: Create test carts only.
Do not: Submit payment, send email, delete data, or change the shared catalog.
Coverage: Express checkout and standard checkout; skip other flows.
Pass criteria: Shipping stays selected, the total stays unchanged, and standard checkout works.
```

If the user's request prescribes how Mo should test, such as reproducing each
bug three times or covering the happy path, failure cases, edge cases, and page
reloads for every flow, warn them that this can lower Mo's results. Mo is good
at deciding what is most important to test. Keep the instructions they still
want after the warning.

Preserve the user's scope and constraints.

## Effort

Choose `--effort low` for 15 testing minutes, `medium` for 30, `high` for 60,
or `max` for 120. Ask the user to confirm a level with its testing time unless
they already chose it. Use low for one flow, medium for a feature, high for a
broad bug bash, or max for a whole app.
Read the [follow loop](../SKILL.md#follow-the-session) for progress polling.
