# Control a session

For interactive progress and findings, use
[the bounded follow loop](../SKILL.md#follow-the-session).

## Read the state

- For `running` or `waiting_on_agents`, testing continues.
- For `checking`, read Mo's last reply; the outcome is unknown.
- For `needs_you`, read and answer each question. For `blocked`, resolve or
  report the access, login, or quota blocker.
- For `ready`, Mo marked the task complete. For `sleeping`, it stopped without
  marking completion; read the last reply.
- For `cancelled` or `failed`, inspect the transcript and report what happened.

Read `status` from `qa read`; on older servers that omit it, use `qa status`.
`timedOut: true` means the read reached its timeout while Mo was still working.
A completed root turn can leave sub-agents running; check the session state
before exporting and stopping.

With `--json`, `qa read` writes one JSON response. Without it, replies go to
stdout and waiting/status text goes to stderr. Read from `start` to include
completed turns; `latest` can omit them.

## Wait and stop

Hosted `momentic_mo_get_session` waits up to 45 seconds for new output by default.
You don't need to pass `waitSeconds`; set it to 0 for an immediate snapshot.
Pending questions, finished sessions, and `bugName` lookups return immediately.

For CI and scripts that need a final outcome, `qa wait "$session_id" --json`
blocks while Mo and its sub-agents work.
It allows up to five continuous minutes of `checking` or incomplete `sleeping`
for work to resume. Exit `0` means the wait ended, not necessarily that the task
completed or QA passed; `1` means the command failed or Mo failed (including startup),
`2` means Mo needs input and `4` means the session was cancelled.
It has no timeout option. An outer shell timeout ends only the local wait,
not the session, and restarting the command resets its five-minute timer.

Use `qa stop <session-id> --subagents` to end spending.
Without `--subagents`, only root Mo stops and other agents can keep testing.
Shutdown can take over a minute. A later message can resume the session.

Archive only when asked: `qa archive <session-id>` cancels work and hides the
session; `qa unarchive <session-id>` restores it.

## Recover startup

If an ordinary CLI start loses its response or times out, use the request ID
in the error's recovery command. If you supplied a UUID with `--request-id`,
use that same ID. Set `request_id` to it and look up the request before starting
another session:

```bash
qa sessions recover "$request_id"
qa sessions list --limit 20
```

Use the recovered session ID and link to follow the existing session. Listing
shows recent sessions without starting work. If recovery is unavailable or the
outcome is still uncertain, report that uncertainty and inspect the list; don't
generate a new request ID or repeat the paid start. Recovery doesn't support PR
sessions.

## Files

Upload with `qa upload <local-path> --session-id <session-id>` and send Mo the returned
sandbox path. Its files are remote. Before `qa download`, create the output
directory if `--output` names a directory.
