# Write a brief

For a user requesting express-checkout smoke coverage and a standard-checkout
regression check:

```bash
brief=$(cat <<'EOF'
Target: https://preview.example.com/checkout?variant=express
Goal: Keep the selected shipping method after returning from payment.
Sign in: Use the staging QA buyer account.
Test data: Create test carts and orders only.
Do not: Submit payment, send email, delete data, or change the shared catalog.
Coverage: Smoke the express-checkout happy path and standard checkout. Skip other flows and failure states.
Pass criteria: The shipping method stays selected, the total does not change, and standard checkout still works.
EOF
)
```

If the user's request prescribes how Mo should test, such as reproducing each
bug three times or covering the happy path, failure cases, edge cases, and page
reloads for every flow, warn them that this can lower Mo's results. Mo is good
at deciding what is most important to test. Keep the instructions they still
want after the warning.

## Effort

`qa start --effort <level>` sets active testing time and sub-agent concurrency:

| Effort             | Testing time | Max sub-agents | Use for                                     |
| ------------------ | -----------: | -------------: | ------------------------------------------- |
| `low`              |       15 min |             10 | A quick check of one flow.                  |
| `medium` (default) |       30 min |             20 | A normal feature or PR pass.                |
| `high`             |       60 min |             30 | A broad bug bash; Mo can fork coordinators. |
| `max`              |      120 min |             40 | A whole-app pass; Mo can fork coordinators. |

If the user didn't choose an effort, pick a reasonable one from the request's
scope and ask them to confirm it with its testing time and sub-agent limit.
