# Inspect run evidence

Read local CLI results from `test-results` unless project settings or the run override the output directory.
The group has `metadata.json` with git/timing data and `runs/<runId>.zip` per test.

Unzip a run and inspect:

- `metadata.json` for run metadata.
- `attempts/<n>/metadata.json` for attempt outcomes and step results; attempt numbers start at 1.
- `attempts/<n>/console.json` for browser console output when captured.
- `attempts/<n>/assets/<snapshotId>.jpeg` and `.html` for screenshots and DOM snapshots referenced by step metadata.
- `assets/har-pages.log` and `har-entries.log` within the attempt for HAR NDJSON.
- `assets/resource-usage.ndjson` for CPU/memory samples, video files when enabled, and `browser-crash.zip` on crashes.

MCP `momentic_get_run` links to extracted `run-result-<runId>` folders in its working directory (default `.momentic-mcp`).

## Inspect locator caches

A target description resolves against HTML/XML and a screenshot. Cached targets are reused when page-state validation passes.
A changed description, missing cached element, or failed position/shape/content checks bust the cache.

For a wrong cached target, request `includeTrace=true` on `momentic_get_step_result`.
Read `cacheBustReason` on the step result's `trace` and inspect the result's `cache`.
Use the `runId` field in the incorrect cache's `targetUpdateLoggerTags` to open the original cache-update run with `momentic_get_run`.

For example, a row-level plus click can report success while leaving the parent page open.
A global `Add to` assertion may then match unrelated text, and an untargeted type step may never enter the child title.
Check the postcondition rather than accepting the locator or assertion result.

## Check module state

A cached module skips its steps when the cache key and resolved inputs are unchanged, reusing the last step's return value.
Authentication modules can restore cookies, localStorage, and IndexedDB, then check page content to validate the restored state.

## Check uploads

Run a file-upload step before the action that opens the native picker.
Sources can be remote URLs, `file://` references to earlier downloads, CLI-local paths, or uploaded user files.
Check any presented-filename override when investigating the selected file.
