# Fix bugs found by QA

Mo finds and rechecks bugs; you fix them. Bugs can appear in Mo's transcript
before they are fully verified through video or browser reproduction; a
`kind: "bug"` entry in `status` or the report has been verified. For a supplied
session, first recover its brief with
`qa read <session-id> --from start --timeout 0 --json`. Skip bugs a person
marked duplicate, works as intended, or cannot reproduce in the report's
`triage.json`. See [finding status](reports.md#finding-status) for the lifecycle
and core triage commands.

1. Before drafting a fix, pull the finding with
   `qa bugs describe <session-id> <bug-id>`. While Mo runs, investigate verified
   findings and draft fixes in an isolated worktree or as patch files outside
   the target's served or watched files.
   Keep the running target and shared test data unchanged so Mo can finish
   testing and reproducing the original behavior.
2. Once the initial bug bash and its reproductions have finished, confirm no
   agents are still working and export a baseline with
   `qa report <session-id> --output <dir>`.
3. Apply the prepared fixes to the tested branch and make the fixed version
   available at Mo's target. Reuse its tunnel when present.
4. Record the fix with `qa bugs fix <session-id> <bug-id>` once the bug is Open;
   add `--pr <url>` and `--commit <sha>` when available.
   If a recheck is authorized, ask Mo to retest it by name with its original
   steps. Keep the target unchanged until Mo finishes. A reproduced Fixed bug
   reopens; a completed retest marks an Open bug Fixed if it no longer reproduces.
5. After a recheck, export to a new directory and compare Mo's reply and
   `verdicts.json` with the baseline.
   Call a fix verified only when Mo's recheck passes the original steps.
