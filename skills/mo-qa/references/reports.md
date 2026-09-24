# Read a Mo report

Use `qa wait` when incremental updates are unnecessary. Then export the
session's evidence:

```bash
qa report <session-id> --require-idle
```

`--require-idle` checks once. It writes nothing while Mo or an internal
sub-agent is working. It does not wait. Every successful export downloads the
attached bug recordings.

Read `report.json` first, then inspect every finding file it names. Do not infer
finding filenames by listing the directory.

`report.json` contains the source `sessionId`, a `summary`, a map of finding
categories to filenames, and each recording download under `artifacts`. The CLI
always writes `summary.generatedAt`, `counts`, `verdictsByStatus`, and
`verdictsByScope`. When the server provides them, it also writes `sessionState`,
`createdAt`, `lastActivityAt`, and `latestTurn`. Those server-supplied fields can
be absent when exporting from a server running an earlier API.

| File             | Contents                                                       |
| ---------------- | -------------------------------------------------------------- |
| `bugs.json`      | Reproduced bugs and static flags, with evidence and timestamps |
| `testCases.json` | Planned coverage, setup, steps, and pass criteria              |
| `verdicts.json`  | Verification results and coverage gaps                         |
| `triage.json`    | Human dispositions; no entry means the bug is open             |

Pair each bug with its recording. A missing manifest artifact means no video
was downloaded. An artifact `error` explains a failed download. The report does
not include raw sub-agent transcripts, standalone screenshots, or browser
traces. Inspect the transcript with `qa read`. Ask Mo only when missing evidence
blocks the requested work.

For a recheck, ask Mo to repeat the exact reproduction. Wait for completion,
then export again. Use `--output <directory>` to preserve the baseline.
Exporting alone does not rerun the test.
