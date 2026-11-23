---
name: mo-qa
description: Run Mo web and mobile QA sessions with the qa CLI. Covers saved environments, mobile builds, private targets, reports, replies, triage, and retests.
---

# Run QA with Mo

Use the interface the user requested. If they haven't chosen one, default to `qa` in shell-capable clients when the CLI can reach the target. Reuse an already authenticated `momentic-hosted` connection only when it supports the task; don't ask the user for a new login just to use MCP. The full coding-agent plugin runs `momentic-hosted` with `qa mcp` and saved CLI credentials. For repository tests, use `momentic-test` or `momentic-maintain`.

For localhost or private targets, hosted tools need an online Connector that can reach the target. If none can reach it and the user did not request hosted tools, start a CLI tunnel when its host can reach the target. If the user requested hosted tools, report the access limit before changing interfaces.

For hosted sessions, follow only the [hosted Mo guidance](https://github.com/momentic-ai/skills/blob/main/claude/skills/mo-qa/SKILL.md) and its linked references. The checklist and references below apply to CLI sessions. Do not install or authorize another hosted-only skill for the same task.
If the agent's shell cannot find `qa`, replace the leading `qa` in commands in this skill and its references with `npx -y qa`; when `qa` is on `PATH`, use the examples as written.
Stop only a tunnel process you started or resumed solely for this run, after its last session, with `qa tunnel stop "$tunnel_id"`. Ask the user to stop a process they started or resumed solely for this run. Leave tunnels already running or needed by other work alone.

## Workflow at a glance

1. Prepare the brief. If effort is unset, ask the user to choose a level and wait. Read [Brief](references/brief.md) and [Tunneling](references/tunneling.md).
2. For mobile, follow [Mobile bug bash](references/mobile-bug-bash.md). For web, run:

   ```bash
   session_json=$(qa start "$brief" --effort "$effort")
   session_id=$(jq -r .sessionId <<<"$session_json")
   web_url=$(jq -r .webUrl <<<"$session_json")
   ```

   For a private target, add `--tunnel "$tunnel_id"` using the selected tunnel
   ID from [Tunneling](references/tunneling.md).

3. [Follow the session](#follow-the-session) with:

   ```bash
   qa read "$session_id" --from start --timeout 45s --json
   ```

4. For `needs_you`, use `qa send "$session_id" --wait 45s "<answer>"`. Pass any provided ID with `--question-id`.
5. At `ready`, export `qa report "$session_id" --output <dir>` and inspect the report, including verdicts, plus the full transcript from `qa read "$session_id" --from start --json` before judging coverage. If they show an authorized, unblocked gap or a tester-only verdict needing Mo follow-up, use `qa send "$session_id" "<remaining in-scope work>"` and follow the session until `ready`; then refresh and read the report and transcript. Unless the user wants more testing, run `qa stop "$session_id" --subagents` even if the final report export fails.

For read-only requests, inspect without starting, messaging, or stopping work. Report the actual stop result, including when the session was already idle.

## Prepare the brief

Include the target app/build or URL, goal, requirements, test account label, allowed data, prohibited actions, and coverage exclusions. Preserve requested steps. Ask about missing scope, access, or permission that would change the run. Keep passwords out of the brief.

Read [Installation](references/installation.md) when `qa version` fails, [Authentication](references/authentication.md) for credentials, [Source context](references/source-context.md) for PRs or local changes, [Browser settings](references/browser-settings.md) for browser options, and [Mobile builds](references/mobile-builds.md) to manage app builds with `qa assets`.

Keep the returned session ID and `webUrl`; share the link. After an uncertain start, use [startup recovery](references/session-control.md#recover-startup) before retrying.

## Follow the session

Read [Session control](references/session-control.md) for statuses, questions, and wait behavior. Use blocking waits rather than immediate polls or shell sleeps. Keep following `running` and `waiting_on_agents`. For `checking`, read the last reply; if it lasts over a minute, report the unknown outcome without messaging Mo. For `needs_you`, answer each pending question using its question ID, or ask the user. Report blockers. After three consecutive failed reads, report the failures and unknown outcome, share the link, and ask whether to cancel; testing may continue.

Mo manages its testing budget. Use 45-second waits; they are not deadlines. Monitor time caps with wall time and spend caps with signed-in `qa cost`. If spend cannot be monitored, tell the user before starting. At the cap, report coverage cut short. Stop if the user authorized stopping at the cap; otherwise ask before stopping.

Only `ready` means the session finished. Credit findings to Mo; a tester's verified verdict is not a verified session pass.

## Message Mo

Relay new findings and status changes as they arrive. Answer user questions from Mo's latest reply, not a status summary; say when that reply is unavailable. Send messages only for Mo's questions, user requests, or untested areas within the agreed scope. Do not send `continue`, `finalize`, or routine progress requests.

## Finish

Base the coverage summary on the latest report and full transcript, including tester verdicts. Report remaining gaps, findings, the session link, and export directory. Read [Reports](references/reports.md) for evidence and triage. For fixes, use [Mobile bug bash](references/mobile-bug-bash.md#finish-and-recheck) for app builds or [Repair loop](references/remediation-loop.md) for web targets. Keep the target and shared data unchanged until testing and reproductions finish.
