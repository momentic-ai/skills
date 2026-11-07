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
- Use `--output-format json` for automation and multi-run bookkeeping.
- Classify multiple related run IDs together when useful, but keep each result
  mapped to its exact run.

For single-run interactive classification, add `--interactive` to the run-ID command. It requires a TTY and cannot use JSON output.

## Prepare triage

Verify readiness before replaying in a browser:

1. Read `momentic.config.yaml`, the target test and its setup modules, repository
   scripts, and the CI workflow that normally runs the test. Use the same URL,
   environment, credentials, headers, files, services, and data fixtures.
2. Confirm `MOMENTIC_API_KEY`, project configuration, dependencies, and the
   requested browser are available.
3. Inspect `git status` and preserve unrelated work. Decide the repair delivery
   before running the command; do not let an unknown dashboard default create a
   pull request or commit unexpectedly.
4. Build the application before starting triage. Prefer a production or
   otherwise precompiled build and a stable server over Next.js, webpack, Vite,
   or another development server that compiles routes incrementally.
5. Start every required service and wait for the actual readiness URL. Warm any
   unavoidable dev-only compilation path before triage and verify that the
   relevant route no longer shows a compile/loading screen or incurs a long
   first request.
6. Run a focused smoke or the failing test once when necessary to prove the app,
   fixture, authentication, and browser are ready. Fix setup failures before
   blaming triage.
7. Start with `--parallel 1`. Raise it only when the machine has enough CPU and
   memory for one browser and application workload per worker.

If the repository exposes a stable server command, either start it separately
or let triage own it with `--start` and `--wait-on`:

```bash
pnpm build
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

- Pass multiple related run IDs after one `--run-id` so the bucketing agent can
  group shared causes. Do not launch one competing triage command per run.
- Set `--on-heal-success` explicitly: use `nothing` for local review, `patch`
  for a portable diff, or a pull-request/commit behavior only when the user
  asked for that delivery.
- Pass `--yes` only after the environment and delivery choice are confirmed so
  dependency prompts do not stall the run.
- Use `--dry-run --no-save` to inspect bucketing without editing tests or saving
  triage metadata. Dry-run is not a repair attempt.
- Use `--regenerate-heal` only when a cached heal is stale or failed and a new
  repair should be generated from scratch.
- Keep the command attached and monitor reasoning, tool calls, browser progress,
  CPU, and memory. Several minutes without browser progress can indicate app
  startup, cold compilation, resource pressure, or a missing fixture.
- Inspect every resulting diff. Do not accept deleted assertions, broadened
  checks, arbitrary sleeps, or longer timeouts that merely conceal the cause.
- Re-run the repaired test before changing quarantine state.

For interactive triage, add `--interactive`. It requires a TTY, cannot use `--json`, and is available only when the bucketing agent runs.
