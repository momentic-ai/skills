---
name: mo-qa
description: Run and control Mo QA sessions with the hosted Momentic tools, or with Momentic's `qa` CLI for localhost and private targets that need a tunnel. Use for bug bashes, status checks, report export, replies to Mo, file transfer, triage and retests, or repairs based on Mo findings.
---

# Run QA with Mo

Mo runs browser QA in a hosted sandbox. Its files and processes are remote.

Use the hosted `momentic_mo_*` tools by default; see
[Hosted tools](references/hosted-tools.md). Use the `qa` CLI and the steps below
for a localhost or private target that needs a tunnel, or when the hosted tools
aren't connected.

Continue a session with the tools that started it: the hosted tools for a hosted
session, or [Follow the session](#follow-the-session) and
[Reports](references/reports.md) for a CLI session. If you don't know which, try
the hosted tools first. Don't start, message or stop work for a read-only
request.

## Workflow at a glance

1. Prepare access and the brief; confirm effort before `qa start "$brief" --effort "$effort"`.
2. [Follow the session](#follow-the-session) and read replies with `qa read "$session_id" --from start --timeout 45s --json`.
3. For `needs_you`, answer with `qa send "$session_id" --wait 45s "<answer>"`.
4. Check coverage and export with `qa report "$session_id" --output <dir>`.
5. End spending with `qa stop "$session_id" --subagents`, even if export fails. After the last session, use `qa tunnel stop "$tunnel_id"` for tunnels you started.

## Prepare the brief

Keep passwords and tokens out of commands and tool arguments, even if the user
pastes them into chat. Don't copy them into shell assignments, heredocs or
file-edit payloads. Before handling credentials, read
[Authentication](references/authentication.md#authenticate-the-application)
for secure provisioning and `--env-file` / `--env-var` examples.

Include the exact target URL, goal, requirements, login method, test account
label, allowed data, prohibited actions and coverage exclusions.

Read a reference when it applies:

- Local or private target: [Tunneling](references/tunneling.md).
- Testing a GitHub PR or local changes, or Mo can't access the app's Git
  repository: [Source context](references/source-context.md).
- Signing Mo into the app, or giving Mo secrets or environment variables:
  [Authentication](references/authentication.md#authenticate-the-application).
- Any change to Mo's browser or how fast it interacts:
  [Browser settings](references/browser-settings.md).

Preserve user-specified coverage; otherwise let Mo choose flows and sub-agents.
Supply facts, not a test checklist. Ask only when missing scope, access or
permission would change the run.

You own target setup and actions Mo cannot perform remotely. Read
[Brief](references/brief.md) and confirm `--effort` unless the user chose it.

## Start the session

Run `qa version`; see [Installation](references/installation.md) if missing or
outdated, or [Authentication](references/authentication.md#authenticate-mo)
after a login error. Set `effort` to the confirmed level and keep these values:

```bash
session_json=$(qa start "$brief" --effort "$effort")
session_id=$(jq -r .sessionId <<<"$session_json")
web_url=$(jq -r .webUrl <<<"$session_json")
created_at=$(jq -r '.createdAt // empty' <<<"$session_json")
```

Starting returns before Mo finishes. The user watches or joins through
`web_url`; `created_at` can be absent on older servers.

After an uncertain start, check the session page or dashboard before trying
again. Don't switch to hosted MCP or start a replacement blindly.

## Follow the session

Read [Session control](references/session-control.md) for status meanings and
the polling runner. Poll `qa status "$session_id" --full` about every 30 seconds. Report new
`findings.bugs` names (`kind` is `bug` or `flag`) and `status` changes as they
appear. Read one bug's
details with `qa bugs describe "$session_id" <bug-id>`. Findings expose
`lifecycleStatus`: Needs review, Open, Fixed, or Dismissed. Core commands are in
[reports](references/reports.md). Keep polling while
`status` is `running`, `waiting_on_agents`, or `checking`; if `checking` lasts
over a minute, Mo's last outcome is unknown, so read its last reply and tell the
user. Stop on any other state and act on it as Session control describes. Stop and tell the user
after 3 failed status calls in a row, or once the session has run twice its
effort's testing time.

`ready` and `sleeping` are settled but do not establish passing QA.

## Read and answer Mo

Read questions and replies with
`qa read "$session_id" --from start --timeout 45s --json`.
`--from latest` can miss completed turns; `timedOut: true` means Mo is still
working. Use [Reports](references/reports.md) for findings and
`qa <command> --help` for output schemas.

For `needs_you`, answer each card in `pendingQuestions` with
`qa send "$session_id" --question-id <id> --wait 45s "<answer>"`.
Without `--question-id`, it answers the oldest card (`pendingInput`).

Answer from authorized context or ask the user for missing access, permission
or decisions. Send answers to root Mo; it relays them to sub-agents. Never
invent or reveal a secret.

Use `status`, `read` or `wait` for progress. Messages steer active work between
tool calls or start an idle Mo's next turn; in-flight work continues. Add
`--wait <duration>` only when your next step depends on the reply.

## Work while Mo runs

When fixes are in scope, use the time while Mo tests to investigate findings
and draft fixes in an isolated worktree or as patch files outside the target's
served or watched files. Apply the drafts after the initial bug bash and its
reproductions finish; see [Repair loop](references/remediation-loop.md).

Keep the tested revision and shared test data stable during that pass. Drafts
must not hot-reload the target, restart its app, or deploy to its URL.

## Finish

Before presenting results, check Mo's coverage against the user's scope. If
something in scope is untested, steer Mo with `qa send` to test it and follow
the session again. Then read [Reports](references/reports.md) and export with
`qa report "$session_id" --output <dir>`. End spending with
`qa stop "$session_id" --subagents`, even if the export failed. Then give the
user the findings, any coverage gaps, the export path, and `web_url`. If
`qa report` warned that the report may be partial, tell the user.
After the last session, stop any tunnel you started with
`qa tunnel stop "$tunnel_id"`.
