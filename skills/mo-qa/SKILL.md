---
name: mo-qa
description: Run and control Mo QA sessions with Momentic's `qa` CLI. Use for bug bashes, status checks, report export, replies to Mo, file transfer, or repairs based on Mo findings.
---

# Run QA with Mo

Mo runs browser QA in a hosted sandbox. Its files and processes are remote.

## Workflow at a glance

Run these phases in order:

1. **Install and authenticate.** Run `qa version`. If Mo is missing or
   outdated, read [Installation](references/installation.md). After a `qa`
   login error, read [Authentication](references/authentication.md#authenticate-mo).
2. **Start.** Read [Brief](references/brief.md) for a worked example and how
   to pick `--effort`. Then [prepare the brief](#prepare-the-brief) and
   [start the session](#start-the-session) with `qa start "$brief"`.
3. **Follow the session.** First read
   [Session control](references/session-control.md): it explains each
   `status` and how to run the poll. Then
   [follow the session](#follow-the-session) and read Mo's questions and replies
   with `qa read "$session_id" --from start --timeout 45s --json`.
   `qa <command> --help` shows the JSON a command prints.
4. **Answer questions.** `needs_you` means Mo is waiting on you. Answer with
   `qa send "$session_id" --wait 45s "<answer>"`. A plain `qa send` answers the
   oldest open question card. To answer a specific card, add
   `--question-id <id>`; answer each card in `qa read`'s `pendingQuestions`
   (`pendingInput` is the oldest).
5. **Finish.** Check coverage, export with
   `qa report "$session_id" --output <dir>`, then end spending with
   `qa stop "$session_id" --subagents`; see [Finish](#finish). After the
   last session, run `qa tunnel stop "$tunnel_id"` if you started a tunnel.

## Prepare the brief

Give Mo the testing goal and operating boundaries. Include what applies: the
target URL from the request, with any relevant path and query; the user's goal,
relevant product intent, and known requirements; the login method, test account
label, and allowed test data; prohibited actions and data that Mo must not
change; and what the user wants tested, with any requested exclusions.

Read a reference when it applies:

- Local or private target: [Tunneling](references/tunneling.md).
- Testing a GitHub PR or local changes, or Mo can't access the app's Git
  repository: [Source context](references/source-context.md).
- Signing Mo into the app, or giving Mo secrets or environment variables:
  [Authentication](references/authentication.md#authenticate-the-application).
- Any change to Mo's browser or how fast it interacts:
  [Browser settings](references/browser-settings.md).

Supply factual context from the request and repository, not a prescribed test
plan. Preserve user-specified coverage; otherwise do not prescribe a checklist,
interaction steps, or a fixed number of checks. Let Mo choose flows and
sub-agent orchestration within the right scope and budget. Ask only when
missing scope, access, or permission would change the run.

You own target setup, authentication, and actions Mo cannot perform remotely.
Before starting, pick `--effort` as [Brief](references/brief.md#effort)
describes and confirm it with the user unless they chose it.

## Start the session

Pass the brief as one argument and keep the returned values:

```bash
session_json=$(qa start "$brief")
session_id=$(jq -r .sessionId <<<"$session_json")
web_url=$(jq -r .webUrl <<<"$session_json")
created_at=$(jq -r '.createdAt // empty' <<<"$session_json")
```

Starting returns before Mo finishes. The user watches or joins through
`web_url`; `created_at` can be absent on older servers.

## Follow the session

Poll `qa status "$session_id" --full` about every 30 seconds. Report new
`findings.bugs` names (`kind` is `bug` or `flag`) and `status` changes as they
appear. Read one bug's
details with `qa bugs describe "$session_id" <bug-id>`. Keep polling while
`status` is `running`, `waiting_on_agents`, or `checking`; if `checking` lasts
over a minute, Mo's last outcome is unknown, so read its last reply and tell the
user. Stop on any other state and act on it as Session control describes. Stop and tell the user
after 3 failed status calls in a row, or once the session has run twice its
effort's testing time.

Run the poll with a host tool that reports output while you work, a runner
sub-agent, or the fallback in
[Session control](references/session-control.md#polling).

`ready` and `sleeping` are settled but do not establish passing QA.

## Read and answer Mo

Use the bounded `qa read --from start` above for Mo's questions and replies,
not findings; `--from latest` misses a turn that finishes before the read
begins, and `timedOut: true` means Mo is still working.

If Mo is blocked, answer from the brief, repository, or authorized environment
data when you can. Otherwise ask the user for the missing access, permission,
or decision, then send the answer to root Mo, which relays context to its
internal sub-agents. Never invent or reveal a secret.

For routine progress, use `status`, `read`, or `wait`. Send a message to answer
a blocker, to steer or recheck work, or to ask Mo for a summary. Sending while
active steers root Mo between tool calls while in-flight work continues. When
Mo is idle, the message starts its next turn. Without `--wait`, confirm the
reply with `read`.

## Work while Mo runs

Keep the tested revision stable through the initial QA pass and its
reproductions. Do not change anything the target serves or hot-reloads, restart
the app, deploy to its URL, or mutate shared test data while Mo uses it. Other
work, such as code review, is fine. For bug fixes during the run, or if the
user asked for fixes, read [Repair loop](references/remediation-loop.md).
Otherwise, do not change app code.

## Finish

Before presenting results, check Mo's coverage against the user's scope. If
something in scope is untested, steer Mo with `qa send` to test it and follow
the session again. Then read [Reports](references/reports.md) and export with
`qa report "$session_id" --output <dir>`. End spending with
`qa stop "$session_id" --subagents`, even if the export failed. Then give the
user the findings, any coverage gaps, the export path, and `web_url`. If
`qa report` warned that the report may be partial, tell the user.
