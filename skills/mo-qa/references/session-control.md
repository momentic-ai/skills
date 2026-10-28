# Session control

## Polling

Without a background-output tool or runner sub-agent, run the poll in the
foreground of a long-running command session and check its output between
tasks (in Codex, drain `exec_command` with `write_stdin`). Do not detach it
with `&` or end your turn while it runs. If shell variables do not persist
across commands, interpolate the literal Mo session ID.

## States

`status` is the session's state as the UI shows it. `qa status`, `read`, and
`report` all report the same word there.

Working. Keep polling:

| Status              | Meaning                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `running`           | Root Mo is working.                                                                                                                        |
| `waiting_on_agents` | Root Mo is idle or stopped; its internal sub-agents are still working. After a stop is issued, they may still be shutting down gracefully. |
| `checking`          | Momentic doesn't know how Mo's last turn ended. It often clears within a minute; if not, it stays until you send Mo a message.             |

Waiting on you:

| Status      | Meaning                                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| `needs_you` | Mo needs access, a decision, or an answer. Read its reply and `blockerReason`, then respond with `qa send`. |
| `blocked`   | A quota, access, or login blocker stopped Mo. Read the reply and `blockerReason`, then resolve it.          |

Done:

| Status     | Meaning                                                            |
| ---------- | ------------------------------------------------------------------ |
| `ready`    | Mo marked the task complete.                                       |
| `sleeping` | Mo stopped without marking the task complete; read its last reply. |

Stopped:

| Status      | Meaning                                                         |
| ----------- | --------------------------------------------------------------- |
| `cancelled` | Someone stopped the session. `qa send` resumes it.              |
| `failed`    | The session or its current turn failed. Inspect its transcript. |

Servers running an earlier API can omit `status` on `read` and `report`; use
`qa status` for it on those.

`qa read` returns persisted conversation messages and user-facing messages
streamed during the wait. With `--json`, it writes one JSON response to stdout
and no progress text. Without `--json`, a read that waits longer than two
seconds prints liveness to stderr. Returned messages stay on stdout, while
timeout or stopped status text stays on stderr.

## Wait

`qa wait "$session_id" --json` returns when root Mo's turn finishes, stops, or
needs input. Exit code `2` means Mo needs input; `4` means it was stopped.
Internal sub-agents can still be running. Confirm `qa status` no longer reports
`running` or `waiting_on_agents`, then inspect the outcome. `checking` means the
outcome is unknown; `needs_you` and `blocked` require attention.

## Stop

- `qa stop <session-id>` interrupts root Mo only. Sub-agents keep testing,
  filing findings, and billing. Root Mo stays stopped until your next
  `qa send`. Use it to redirect Mo without losing in-flight tests.
- `qa stop <session-id> --subagents` also stops every running sub-agent. Use it
  to end spending. It returns right away; sub-agents can take a minute or more
  to shut down, and you don't need to wait for them. `qa send` can
  still resume the session.
- `qa archive <session-id>` cancels all work, hides the session, and rejects
  further `qa send`. Restore it with `qa unarchive <session-id>`.

## Files

`qa upload` returns a sandbox path. Send that path to Mo because local paths do
not exist in its sandbox. Create the destination directory before `qa download`
when `--output` names a directory.
