## Run AI classification

Use one selector per classification command:

```bash
npx momentic ai classify --run-id "$RUN_ID" --output-format json
npx momentic ai classify --run-group-id "<run-group-id>"
npx momentic ai classify --git-commit "<commit-sha>"
```

- Omit `--save` for a diagnostic re-classification. Add `--save` only when the
  new verdict should replace the saved classification on the local archive or
  cloud run.
- Use `--no-cache` when the existing cached classifier result is suspected to
  be stale and the user explicitly needs a fresh analysis.
- Use `--skip-classified` when resuming a batch without revisiting runs that
  already have saved classifications.
- Classify multiple related run IDs together when useful, but keep each result
  mapped to its exact run.

For single-run interactive classification, add `--interactive` to the run-ID command. It requires a TTY and cannot use JSON output.

## Prepare triage

Verify readiness before replaying in a browser:

1. Read `momentic.config.yaml`, the test and its setup modules, and the command
   that normally runs it. Match its environment, credentials, files, and fixtures.
2. Check `MOMENTIC_API_KEY`, dependencies, and the requested browser.
3. Build the app with the project's build command when needed. Prefer a
   precompiled app and stable server. Start required services and check readiness.
   If a dev server is necessary, warm the affected routes so their first request
   doesn't compile during triage. Run a focused smoke when readiness is uncertain.
4. Choose repair delivery before running triage. Start with `--parallel 1`;
   increase it only when the host can support more browsers.

To start the app with triage, pass the project's server command and readiness URL:

```bash
npx momentic ai triage --run-id "$RUN_ID" \
  --start "pnpm start" \
  --wait-on "http://localhost:3000/health" \
  --parallel 1 \
  --yes \
  --on-heal-success nothing
```

## Run AI triage

Pass the classification target to triage:

```bash
npx momentic ai triage --run-id "$RUN_ID" \
  --parallel 1 \
  --yes \
  --on-heal-success nothing
```

For a local run group, pass the results directory instead:

```bash
npx momentic ai triage ./test-results \
  --parallel 1 \
  --yes \
  --on-heal-success nothing
```

- Pass multiple related run IDs after one `--run-id` to group shared causes
  rather than launching competing triage commands.
- Set `--on-heal-success` explicitly: use `nothing` for local review, `patch`
  for a portable diff, or a pull-request/commit behavior only when the user
  asked for that delivery.
- Pass `--yes` only after the environment and delivery choice are confirmed so
  dependency prompts do not stall the run.
- Use `--dry-run --no-save` to inspect bucketing without editing tests or saving
  triage metadata. Dry-run is not a repair attempt.
- Use `--regenerate-heal` only when a cached heal is stale or failed and a new
  repair should be generated from scratch.
- Monitor browser progress, CPU, and memory. If triage stalls, check app startup,
  cold compilation, resource pressure, and missing fixtures before retrying.
- Inspect the resulting diff and rerun the repaired test.

For interactive triage, add `--interactive`. It requires a TTY, cannot use `--json`, and is available only when the bucketing agent runs.
