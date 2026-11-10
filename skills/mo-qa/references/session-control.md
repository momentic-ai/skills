# Control a session

Read [the follow loop](../SKILL.md#follow-the-session) for blocking commands,
progress polling, and when to message Mo.

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

`qa wait "$session_id" --json` waits for root Mo, not its sub-agents.
Check session state for running sub-agents before exporting or stopping.
It has no timeout option. Use `timeout 45s qa wait "$session_id" --json`
for a bounded shell call, then check status and repeat while agents work.
Exit code `124` means the local wait expired; `2` means Mo needs input;
`4` means it stopped. Ending the local wait does not cancel the session.

Use `qa stop <session-id> --subagents` to end spending.
Without `--subagents`, only root Mo stops and other agents can keep testing.
Shutdown can take over a minute. A later message can resume the session.

Archive only when asked: `qa archive <session-id>` cancels work and hides the
session; `qa unarchive <session-id>` restores it.

## Files

Upload with `qa upload <session-id> <local-path>` and send Mo the returned
sandbox path. Its files are remote. Before `qa download`, create the output
directory if `--output` names a directory.
