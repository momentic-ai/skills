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

## Effort

`qa start --effort <level>` sets active testing time and sub-agent concurrency:

| Effort             | Testing time | Use for                                     |
| ------------------ | -----------: | ------------------------------------------- |
| `low`              |       15 min | A quick check of one flow.                  |
| `medium` (default) |       30 min | A normal feature or PR pass.                |
| `high`             |       60 min | A broad bug bash; Mo can fork coordinators. |
| `max`              |      120 min | A whole-app pass; Mo can fork coordinators. |

Pick it from the requested depth or duration.
