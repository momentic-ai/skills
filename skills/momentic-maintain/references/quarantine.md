# Triage quarantined tests

Choose fresh runs or existing failures and the repair delivery. Default to fresh
runs, or a 7-day lookback for existing failures. Read [Repair](repair.md) before
triage for app readiness and delivery options.

## Fresh runs

Run quarantined tests, then triage their results:

```bash
npx momentic run --only-quarantined --output-dir test-results
npx momentic ai triage test-results --parallel 1 --yes --on-heal-success nothing
```

Failures make the first command exit nonzero. Continue to triage its results.
Use the project's invocation prefix if it differs from `npx`.

## Existing failures

1. Confirm the hosted MCP workspace matches the organization of the local CLI
   API key before listing. If they differ or the match is unknown, stop and ask
   the user to reconnect. Discard IDs from the wrong workspace and list again.
2. Call `momentic_quarantine_list` for the quarantine-date range and read every
   page. Without hosted MCP, `momentic quarantine list` lists local files.
3. Record tests without a retained failed run and use fresh runs for them.
   Deduplicate the remaining run IDs, classify them, and triage related runs
   together after one `--run-id` as described in [Repair](repair.md).

Report each test's outcome, repair, and blockers, including tests without retained
runs. Rerun environment failures after fixing setup; don't classify them as
unrepairable tests. Leave quarantine unchanged unless the user asks to remove it,
and validate repairs with `npx momentic run --ignore-quarantine` first.
