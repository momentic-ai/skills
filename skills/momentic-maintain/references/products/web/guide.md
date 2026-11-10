# Maintain browser tests

Read [Repair](repair.md) when running AI classification or triage.
Read [Quarantine](quarantine.md) when repairing quarantined tests.

When asked to save a verdict, use `momentic_submit_result_classification`
or `ai classify --save`, not both for the same conclusion.

Inspect these files within each attempt when available:

- `console.json` for browser console output.
- `assets/<snapshotId>.jpeg` and `.html` for screenshots and DOM snapshots.
- `assets/har-pages.log` and `har-entries.log` for HAR NDJSON.
- `assets/resource-usage.ndjson` for CPU and memory.
- Videos and `browser-crash.zip` for recordings and crashes.
