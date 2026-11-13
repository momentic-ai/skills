# Fix bugs found by QA

For an existing session, recover its brief with
`qa read <session-id> --from start --timeout 0 --json`.
Skip findings dismissed as duplicate, works as intended, or cannot reproduce;
read [Reports](reports.md) when inspecting triage.

1. List findings with `qa bugs list <session-id> --full` and follow
   [Triage findings](reports.md#triage-findings).
   While testing continues, investigate and draft fixes in an isolated worktree
   or patches outside the served files. Keep the target and shared data unchanged.
   Don't hot-reload, restart, or deploy the target while Mo tests and reproduces findings.
2. After testing and reproductions finish, confirm no agents are working and
   export a baseline with `qa report <session-id> --output <dir>`.
3. Apply the fixes and make the fixed revision available at Mo's target,
   reusing its tunnel when present.
4. After you land a fix, mark it Fixed with `qa bugs fix <session-id> <bug-id>`;
   include `--pr <url>` and `--commit <sha>` when available. If the user requests
   a recheck, relay that request with the finding name and original steps.
   Keep the target stable until it finishes.
5. Export to a new directory and compare Mo's reply and `verdicts.json` with
   the baseline. Call the fix verified only after a passing recheck of the
   original steps. A reproduced Fixed bug reopens; a completed non-reproduction
   marks an Open bug Fixed. A blocked recheck leaves status unchanged.
