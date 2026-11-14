---
name: mo-qa
description: Run and control Mo web and mobile QA with hosted Momentic tools or the qa CLI, including saved environments, mobile builds, private targets, reports, replies, triage, and retests.
---

# Run QA with Mo

Mo runs web and mobile QA in the cloud. For repository tests, use
`momentic-test` or `momentic-maintain`.

Control Mo with hosted tools or `qa`, not `momentic` or `momentic-mobile`.

## Workflow at a glance

1. Keep the requested interface; in a requested hosted session, report tool or
   authentication failures without starting a CLI session. Otherwise, use hosted
   tools, with an existing Connector for private web targets, or the CLI for a
   new tunnel. If you can't run commands on the machine that reaches the target,
   have the user start it there, then use hosted tools unless you lack them or
   the CLI was requested. Read [Tunneling](references/tunneling.md) and [Hosted tools](references/hosted-tools.md).
2. Prepare the brief. If effort is unset, ask the user to choose [effort](references/brief.md#effort) and wait.
   For mobile CLI sessions, follow [Mobile bug bash](references/mobile-bug-bash.md) to select a build and start. For web CLI sessions:

   ```bash
   session_json=$(qa start "$brief" --effort "$effort")
   session_id=$(jq -r .sessionId <<<"$session_json")
   web_url=$(jq -r .webUrl <<<"$session_json")
   ```

3. [Follow the session](#follow-the-session) with `momentic_mo_get_session`, or
   `qa read "$session_id" --from start --timeout 45s --json`.
4. For `needs_you`, answer with `momentic_mo_message_session`, or
   `qa send "$session_id" --wait 45s "<answer>"`. Pass
   `--question-id "<question-id>"` when Mo provides an ID.
5. After `ready`, unless the user wants more testing, export or read the report,
   stop even if that fails, then summarize results. For CLI sessions, run
   `qa report "$session_id" --output <dir>`, then `qa stop "$session_id" --subagents`;
   do not use the hosted stop tool. For hosted sessions, read the report with
   `momentic_mo_get_session`, then call `momentic_mo_stop_session`.
   Stop only tunnels you started, after their last session: `qa tunnel stop "$tunnel_id"`.

For read-only requests, inspect without starting, messaging or stopping work.
Continue with the same interface. Report the actual stop result, including
when the session was already idle.

## Prepare the brief

Include the target app/build or URL, goal, requirements, login method, test account label,
allowed data, prohibited actions and coverage exclusions. Preserve requested
steps; ask about missing scope, access or permission that would change the run.
Keep passwords out of the brief.

Read these references when needed:

- [Brief](references/brief.md) when preparing the first brief.
- [Installation](references/installation.md) when `qa version` fails or needs updating.
- [Authentication](references/authentication.md) when the app needs credentials.
- [Tunneling](references/tunneling.md) for local or private targets.
- [Source context](references/source-context.md) for PRs, local changes or missing repository access.
- [Browser settings](references/browser-settings.md) for non-default browser setup.
- [Mobile builds](references/mobile-builds.md) to upload, download, or manage app
  builds with `qa assets`.

Keep the returned session ID and `webUrl`; share the link. After an uncertain
start, use [startup recovery](references/session-control.md#recover-startup) before retrying.

## Follow the session

Read [Session control](references/session-control.md) for statuses, questions
and wait behavior. Use blocking waits rather than immediate polls or shell sleeps.
Keep following `running` and `waiting_on_agents`. For `checking`, read the last
reply; if it lasts over a minute, report the unknown outcome without messaging Mo.
For `needs_you`, answer each pending question using its question ID, or ask the
user. Report blockers. After three consecutive failed reads, report the failures
and unknown outcome, share the link and ask whether to cancel; testing may continue.

Mo manages its testing clock and time budget. Use 45-second waits to poll,
not to impose a testing deadline.

Only `ready` means the session finished. For incomplete hosted sessions, follow
`get_session.nextAction`. Do not stop incomplete testing unless the user asks.
Credit findings to Mo; a tester's verified verdict is not a verified session pass.

## Message Mo

Relay new findings and status changes as they arrive. Answer user questions from Mo's latest
reply, not a status summary; say when that reply is unavailable. Send messages
only for Mo's questions, user requests or untested areas within the agreed scope.
Don't send `continue`, `finalize` or routine progress requests.

## Finish

Compare coverage with the brief and ask Mo to cover remaining unblocked areas.
Report gaps, findings, the session link and any export directory.
Read [Reports](references/reports.md) for evidence export, triage and retests.
For fixes, use [Mobile bug bash](references/mobile-bug-bash.md#finish-and-recheck)
for app builds or [Repair loop](references/remediation-loop.md) for web targets.
Keep the target and shared data unchanged until testing and reproductions finish.
