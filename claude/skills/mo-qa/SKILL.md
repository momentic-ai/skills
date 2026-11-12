---
name: mo-qa
description: Run and control Mo web and mobile QA with hosted Momentic tools or the qa CLI, including saved environments, mobile builds, private targets, reports, replies, triage, and retests.
---

# Run QA with Mo

Mo runs web and mobile QA in a hosted sandbox; its files and processes are remote.

Control Mo with hosted `momentic_mo_*` tools or the `qa` CLI, not the
`momentic` or `momentic-mobile` CLIs.
Use those CLIs with `momentic-test` / `momentic-maintain` to author, run, or
maintain Momentic tests instead of asking Mo to explore an app.

## Workflow at a glance

1. Keep the interface the user requested. Otherwise, use hosted tools for web
   or mobile, including private web targets with an existing Connector. Use the
   CLI when you need to create a tunnel. Read
   [Hosted tools](references/hosted-tools.md) to discover and select session inputs.
   For a requested hosted session, stop setup and report the blocker if tools
   are unavailable or authentication fails; do not start a CLI session.
2. For CLI sessions, prepare the brief and confirm effort, then run
   `qa start "$brief" --effort "$effort"`.
3. [Follow the session](#follow-the-session) with `qa read "$session_id" --from start --timeout 45s --json`.
4. For `needs_you`, answer with `qa send "$session_id" --wait 45s "<answer>"`.
5. Once testing finishes, export with `qa report "$session_id" --output <dir>`,
   then run `qa stop "$session_id" --subagents`, even if export fails.
   Run `qa tunnel stop "$tunnel_id"` only for tunnels you started, after their last session.

For read-only requests, inspect the existing session without starting,
messaging, or stopping work.
Continue hosted sessions with hosted tools and CLI sessions with the `qa` CLI.
Report the actual stop result. If nothing was running, say the session was
already idle, not stopped.

## Prepare the brief

Include the target URL, goal, requirements, login method, username or test
account label, allowed data, prohibited actions, and coverage exclusions.
Keep passwords out of the brief; use a saved Momentic environment or have the
user add a secret on the session page. Read
[Authentication](references/authentication.md) when the app needs credentials.

Preserve requested coverage. Supply requirements and constraints rather than
inventing a checklist. Ask when missing scope, access, or permission would
change the run.

Read these references when needed:

- [Brief](references/brief.md) when choosing effort or writing the first brief.
- [Installation](references/installation.md) when `qa version` fails or needs updating.
- [Tunneling](references/tunneling.md) when the target is local or private.
- [Source context](references/source-context.md) when testing a PR, local changes,
  or a repository Mo can't access.
- [Browser settings](references/browser-settings.md) when changing Mo's browser.

## Start the session

Keep the returned ID and link:

```bash
session_json=$(qa start "$brief" --effort "$effort")
session_id=$(jq -r .sessionId <<<"$session_json")
web_url=$(jq -r .webUrl <<<"$session_json")
```

Share `web_url`.
After an uncertain start, check for the session before retrying.

## Follow the session

Mo manages its own testing clock and time budget. Use the 45-second waits
below to poll for progress, not to impose a testing deadline.

For hosted sessions, call `momentic_mo_get_session` while Mo is working.
It waits up to 45 seconds for new output by default; you don't need to pass
`waitSeconds`. For CLI sessions, use
`qa read "$session_id" --from start --timeout 45s --json` while `running` or
`waiting_on_agents`; it waits for output across sub-agent turns.
Use `qa send --wait 45s` when replying. Don't replace blocking waits
with repeated immediate status calls or shell sleeps. For CI and scripts that
need a final outcome, use blocking `qa wait` instead. It exits `1` if Mo failed,
including startup failures; see
[Session control](references/session-control.md#wait-and-stop).

Keep following `running` and `waiting_on_agents`. For `checking`, read the
last reply; if it lasts over a minute, report the unknown outcome without
nudging Mo. For `needs_you`, answer each open card or ask the user.
For `blocked`, report the blocker. After three consecutive failed reads, stop
following, report the failures and unknown outcome, and share the session link.
Monitoring has ended, but testing may still be running; ask whether to cancel it.
`ready` means Mo marked the task complete; `sleeping` does not.
For incomplete hosted sessions, follow `get_session.nextAction`.
Neither state verifies a QA pass.

Relay new findings and status changes as they arrive. For user questions,
quote Mo's latest reply, not a status summary or verdict. If the tools don't
expose that reply, say you couldn't retrieve it.

## Message Mo

Send messages only to answer Mo's questions, relay user requests, or point to
an untested area within the agreed scope. Don't send "continue", "finalize",
or routine progress requests.

For `needs_you`, answer each `pendingQuestions` card with its `--question-id`.
Without that flag, a send answers the oldest card. Use authorized context or
ask the user for missing access or decisions.

## Finish

Check coverage against the brief. If unblocked areas within the agreed scope
remain untested, ask Mo to cover them and follow the session again.
Report remaining gaps, findings, the session link, and the export directory
when evidence was exported.
Read [Reports](references/reports.md) when exporting evidence or triaging findings.
Read [Repair loop](references/remediation-loop.md) when fixes are in scope;
keep the running target and shared data unchanged until testing and reproductions finish.

For a completed session, follow step 5 for cleanup. Stopping active testing
cancels it; do that only when the user asks to cancel.
