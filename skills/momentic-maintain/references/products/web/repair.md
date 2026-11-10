# Classify and repair browser tests

Use one selector per classification command:

```bash
npx momentic ai classify --run-id "$RUN_ID" --output-format json
npx momentic ai classify --run-group-id "<run-group-id>"
npx momentic ai classify --git-commit "<commit-sha>"
```

Add `--save` only when asked to replace the saved verdict.
Use `--no-cache` for a requested fresh analysis, and `--skip-classified`
when resuming a batch. Keep each result mapped to its run.
For interactive single-run classification, use `--interactive` with a TTY,
without JSON output.

## Prepare triage

1. Read the config, test, setup modules, and normal run command. Match
   environment, credentials, files, fixtures, and browser; check API access.
2. Start the app and required services, preferring a prebuilt app. Check
   readiness and warm affected routes when using a dev server.
3. Confirm repair delivery before starting. Begin with `--parallel 1`;
   increase it only when host capacity permits.

To start the app as part of triage, supply its server command and readiness URL:

```bash
npx momentic ai triage --run-id "$RUN_ID" \
  --start "pnpm start" --wait-on "http://localhost:3000/health" \
  --parallel 1 --yes --on-heal-success nothing
```

## Run triage

For an already running app:

```bash
npx momentic ai triage --run-id "$RUN_ID" \
  --parallel 1 --yes --on-heal-success nothing
```

For a local run group, replace `--run-id "$RUN_ID"` with `./test-results`.
Group related run IDs after one `--run-id`.

Set `--on-heal-success` explicitly: `nothing` for local review, `patch` for a
portable diff, or commit/PR delivery only when requested.
Pass `--yes` after confirming the environment and delivery.

Use `--dry-run --no-save` to inspect the plan without editing or saving
triage data. Use `--regenerate-heal` when a cached repair needs replacement.
Interactive triage requires the bucketing agent to run. Use a TTY and
`--interactive` without `--json`.

Monitor browser progress and host resources. For a stall, check app startup,
compilation, resource pressure, and fixtures. Inspect the diff and rerun the repair.
