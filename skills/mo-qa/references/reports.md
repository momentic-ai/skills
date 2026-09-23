# Read a Mo report

Use `status` for polling. Export the detailed evidence once the session is ready:

```bash
qa report <session-id> --require-idle
```

`--require-idle` checks once and exits without writing unless Mo is idle and its
sub-agents are done. It does not wait. Omit it only when an in-progress snapshot
is useful. Every export downloads the attached bug recordings.

The command prints the output directory. Read `report.json` there first. It contains:

- `sessionId`: the source Mo session.
- `findings`: a map from each finding category to its JSON filename.
- `artifacts`: each recording download as either `{ bugName, path }` or
  `{ bugName, error }`.

Only read finding files named by the manifest; do not infer the current report
by listing the directory. Read every category, including ones added by newer
servers. The current categories are:

- `bugs.json`: reviewed bugs with expected and actual behavior, reproduction
  steps, recording metadata, provenance, and timestamps.
- `testCases.json`: the intended coverage, setup, steps, and acceptance criteria.
- `verdicts.json`: verification outcomes, confirmed behavior, and coverage gaps.
- `triage.json`: human dispositions such as accepted, duplicate, works as
  intended, or cannot reproduce. A bug with no triage entry is open.

Use each bug's text and matching recording together. A bug without a manifest
artifact has no downloaded video; an `error` explains a failed download. Raw
sub-agent transcripts, standalone screenshots, and browser traces are not part
of the structured report, so use `qa read` or ask Mo for more evidence when the
report is insufficient.

For a recheck, ask Mo to rerun the exact reproduction, wait for the new turn to
finish, and export again. Use `--output <directory>` if you want to retain a
separate baseline for comparison. Exporting by itself does not rerun anything.
