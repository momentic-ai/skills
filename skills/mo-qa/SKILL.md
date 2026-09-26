---
name: mo-qa
description: Run and control Mo QA sessions with Momentic's `qa` CLI. Use for bug bashes, status checks, report export, replies to Mo, file transfer, or repairs based on Mo findings.
---

# Run QA with Mo

Mo runs browser QA in a hosted sandbox. Its files and processes are remote.

## Work while Mo runs

Keep the tested revision stable through the initial QA pass and its
reproductions. Do not change anything the target serves or hot-reloads, restart
the app, deploy to its URL, or mutate shared test data while Mo uses it. Other
work, such as code review, is fine. For isolated bug fixes during a longer run,
follow [Repair loop](references/remediation-loop.md).

Findings arrive through `qa status "$session_id" --full`. A `kind: "bug"`
entry has been independently reproduced. A `kind: "flag"` entry is a static,
single-frame mistake such as a typo, recorded without reproduction. Test-case
verdicts are `verified`, `issues_found`, or `blocked`. When you report a finding
to the user, include its name, evidence, status, and `web_url`.

If Mo is blocked, answer from the brief, repository, or authorized environment
data when you can. Otherwise ask the user for the missing access, permission,
or decision, then send the answer to root Mo. Root Mo relays context to its
internal sub-agents. Never invent or reveal a secret.

## Prepare the brief

Run `qa version`. If Mo is missing or outdated, read
[Installation](references/installation.md). Read
[Authentication](references/authentication.md) after an authentication error.

Use the target from the request. For a local or private target, read
[Tunneling](references/tunneling.md).

The brief is Mo's specification. Include:

1. The exact target URL, including the affected path and query.
2. Expected behavior and pass criteria.
3. The login method, test account label, and allowed test data.
4. Prohibited actions and data that Mo must not change.
5. The product areas and user flows in scope, plus explicit exclusions.
6. Any non-default browser setup. Read
   [Browser settings](references/browser-settings.md) when needed.

Fill gaps from the request and repository. Ask only when missing scope, access,
or permission would change the run.

### Set scope and detail

The brief sets scope. `--granularity` sets detail within that scope:

- `low` for an early smoke pass: main happy paths and important failure states.
- `medium` when changed flows work: every meaningful interaction and important
  failure state.
- `high` for release-ready coverage: every in-scope path, alternate, failure
  state, and operable control.

Pass the setting explicitly because the default is `high`. A light bug bash
means narrow scope and low granularity, with Mo's normal sub-agent architecture.
Allow roughly 5–25 concurrent agents according to the task's complexity and the
site's capacity; do not serialize a smoke test or tell Mo not to delegate just
because the request says "light." Reduce concurrency below that range only for
a concrete target, account, or user constraint.

For a happy-path-only smoke test, tell Mo to skip failure states. Mo has no
session-wide time or test count option. If the user specifies a hard time or
spend cap, narrow the brief, monitor wall time or `qa cost <session-id>`, run
`qa stop <session-id> --subagents` at the cap, and report unfinished coverage.
Do not infer a hard deadline from "light" or stop before core assertions are
verified solely to keep the run short.

## Start the session

Pass the brief as one argument after `qa` (option flags follow the brief):

```bash
brief=$(cat <<'EOF'
Target: https://preview.example.com/checkout?variant=express
Goal: Keep the selected shipping method after returning from payment.
Sign in: Use the staging QA buyer account.
Test data: Create test carts and orders only.
Do not: Submit payment, send email, delete data, or change the shared catalog.
Coverage: Smoke the express-checkout happy path and standard checkout. Skip other flows and failure states.
Pass criteria:
- The shipping method stays selected.
- The total does not change.
- Standard checkout still works.
EOF
)
session_json=$(qa start "$brief" --granularity low)
session_id=$(jq -r .sessionId <<<"$session_json")
web_url=$(jq -r .webUrl <<<"$session_json")
created_at=$(jq -r '.createdAt // empty' <<<"$session_json")
```

Starting returns before Mo finishes. Preserve these values: every later command
needs `session_id`, the user can watch or join through `web_url`, and
`created_at` records when the session began. `createdAt` can be absent when the
server runs an earlier API version.

A Momentic environment groups a `BASE_URL` with reusable non-secret variables
under a name such as `staging`. `--environment NAME` selects one created under
**Environments** in the Momentic dashboard, not one from the shell or
`momentic.config.yaml`. Mo copies its variables into the session at start.

Use repeatable `--env-file` or `--env-var NAME` options for local values and
secrets; they override matching environment variables. `--env-var` forwards a
variable that is already present in the `qa start` process environment; it does
not accept `NAME=value`. Never put the secret value in the command or brief.
Use `--tunnel` for private access. Leave normal concurrency available or set
`--max-concurrency` within the range above for the task and site. The limit is
fixed at session start. If the target overloads, run `qa stop --subagents` and start a new session with a lower
value. `--granularity <low|medium|high>` sets how specific explore-agent test
discovery should be. `--interaction-speed <default|human>` slows browser
interaction to a human pace when the target needs it.

## Follow the session

Run this watcher in the background. It prints one line per new finding or state
change and exits when Mo needs input or the session ends:

```bash
seen=""
while :; do
  snapshot=$(qa status "$session_id" --full) ||
    { echo "status request failed"; sleep 30; continue; }
  events=$(jq -r '"displayState \(.displayState // .state)",
    (.findings.bugs[] | "\(.kind) \(.name)"),
    (.findings.verdicts[] | "verdict \(.status) \(.testCaseName // "-")")' \
    <<<"$snapshot" | sort)
  comm -13 <(printf '%s\n' "$seen") <(printf '%s\n' "$events")
  seen=$events
  case $(jq -r '.displayState // .state' <<<"$snapshot") in
    needs_you | ready | sleeping | cancelled | failed_start) break ;;
  esac
  sleep 30
done
```

Run the watcher in one of two ways:

- **Background command.** Run it yourself with a host tool that notifies you on
  each output line, such as Claude Code's `Monitor`, and re-arm it when it
  expires. Without one, start it as a background session and check its output
  between other tasks.
- **Runner sub-agent.** Give a sub-agent the `session_id`, the watcher, and this
  skill. It messages you on each event and keeps watching. Use this only when
  a running sub-agent can message you, such as Codex with `multi_agent_v2`
  enabled (`send_message` to `/root`, then `wait_agent` in the parent). Claude
  Code and default Codex sub-agents report only when they finish.

In Codex without a runner sub-agent, keep the watcher in the foreground of a
long-running `exec_command`, retain its returned session ID, and drain it with
`write_stdin`. Do not append `&`, detach it, or finish the turn while it runs.
Shell variables do not persist across separate commands, so interpolate the
literal Mo session ID or start the watcher in the same shell that set it.

Either way, you answer blockers and send Mo the user's decisions.

`status.displayState` describes the whole session for display and polling.
`status.state` is its legacy alias:

| State               | Meaning                                                    |
| ------------------- | ---------------------------------------------------------- |
| `running`           | Root Mo is working.                                        |
| `waiting_on_agents` | Root Mo is idle; its internal sub-agents are working.      |
| `needs_you`         | Mo asked a question. Answer it with `qa send`.             |
| `ready`             | No agent is running and results are available.             |
| `sleeping`          | No agent is running and there is no report or final reply. |
| `cancelled`         | Work was stopped.                                          |
| `failed_start`      | The session never started. Start a new one.                |

`status.sessionState` is the lifecycle state shared by `read`, `status`, and
`report`: `starting`, `working`, `waitingOnUser`, `waitingOnAgents`, `idle`, or
`stopped`. `createdAt` is the session creation time, and `lastActivityAt` is the
last persisted update. `latestTurn` contains the most recent persisted
assistant timing metadata: `startedAt`, `completedAt`, and `durationMs`. A
partial timing uses `null`. Servers running an earlier API can omit these new
fields.

Use this bounded read for Mo's questions and replies, not findings:

```bash
qa read "$session_id" --from start --timeout 45s --json
```

It omits messages Mo sends during a running turn until that turn ends.
`--from latest` also misses a turn that finishes before the read begins. In a
`read` response, prefer `sessionState`; use its legacy alias `state` when the
server omits it. `timedOut: true` means Mo is still working.

With `--json`, `read` writes one JSON response to stdout and no progress text.
Without `--json`, a read that waits longer than two seconds prints liveness to
stderr. Returned messages stay on stdout, while timeout or stopped status text
stays on stderr.

`qa wait "$session_id" --json` returns when root Mo's turn finishes, stops, or
needs input. Exit code `2` means Mo needs input; `4` means it was stopped.
Internal sub-agents can still be running, so confirm `status.displayState` is
`ready` or `sleeping` before treating the session as done.

Never send a message to ask for progress. Use `status`, `read`, or `wait`.
Send only to answer a blocker or deliberately steer or recheck work. Prefer to
send while Mo is idle or waiting:

```bash
qa send --session-id "$session_id" --wait 45s "Use the staging account."
```

Sending while active stops root Mo's current turn and in-flight tool call. Do
that only when the new direction should take priority. Without `--wait`, confirm
the reply with `read`.

## Finish or repair

Before presenting final results, read [Reports](references/reports.md). Confirm
that the brief still describes the product's expected behavior.

If the user asked for fixes, read
[Repair loop](references/remediation-loop.md). Otherwise, do not change app code.

Choose how to stop:

- `qa stop <session-id>` interrupts root Mo only. Sub-agents keep testing,
  filing findings, and billing. Root Mo stays stopped until your next
  `qa send`. Use it to redirect Mo without losing in-flight tests.
- `qa stop <session-id> --subagents` also stops every running sub-agent. Use it
  to end spending. `qa send` can still resume the session.
- `qa archive <session-id>` cancels all work, hides the session, and rejects
  further `qa send`. Unarchive is web-only.

`qa upload` returns a sandbox path. Send that path to Mo because local paths do
not exist in its sandbox. Create the destination directory before `qa download`
when `--output` names a directory. Run `qa <command> --help` for syntax.
