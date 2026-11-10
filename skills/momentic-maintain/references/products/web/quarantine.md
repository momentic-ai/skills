# Repair quarantined browser tests

Read [Repair](repair.md) when preparing app readiness and repair delivery.
Choose fresh runs by default, or a 7-day lookback when using existing failures.

## Fresh runs

```bash
npx momentic run --only-quarantined --output-dir test-results
npx momentic ai triage test-results --parallel 1 --yes --on-heal-success nothing
```

Continue to triage even when test failures make the first command exit nonzero.
Use the project's invocation prefix if different from `npx`.

## Existing failures

1. Confirm hosted MCP and the local CLI key refer to the same organization.
   If unknown or mismatched, reconnect before collecting IDs.
2. Call `momentic_quarantine_list` for a bounded date range and read every page.
   Without hosted MCP, `momentic quarantine list` lists local files.
3. Use fresh runs for tests without retained failures. Deduplicate other run IDs,
   classify them, and group related failures for triage.

Report each repair and blocker, including missing retained runs.
Fix environment failures before rerunning. Validate repairs with
`npx momentic run <test-path> --ignore-quarantine`.

Remove quarantine only when requested, after validation:

```bash
npx momentic quarantine remove <test-name> --reason "Repair verified by the rerun"
```
