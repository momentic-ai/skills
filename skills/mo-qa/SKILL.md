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

Give Mo the testing goal and operating boundaries. Include what applies:

1. The target URL when known, including any relevant path and query.
2. The user's goal, relevant product intent, and known requirements.
3. The login method, test account label, and allowed test data.
4. Prohibited actions and data that Mo must not change.
5. What the user wants tested and any requested exclusions.
6. Any non-default browser setup. Read
   [Browser settings](references/browser-settings.md) when needed.

Supply factual context from the request and repository without turning it into
a prescribed test plan. Ask only when missing scope, access, or permission would
change the run.

### Set high level parameters, let Mo plan by default

Let Mo choose flows, test cases, sub-agent orchestration, etc. within the right
scope and budget for the user's request. Describe what the user wants tested.
Preserve user-specified coverage; otherwise do not prescribe a checklist,
interaction steps, or a case count. Supply implementation facts as context.

You own target setup, authentication, and actions Mo cannot perform remotely.
Before starting, remove unrequested testing restrictions. Leave normal
concurrency available; reduce `--max-concurrency` only for an explicit request
or a demonstrated target limitation, and record the reason.

Give Mo the agreed duration or spend budget and let it prioritize coverage.
"Light" does not imply a case limit or serial execution. Mo has no session-wide
time or test-count option. For a user-specified hard cap, monitor wall time or
`qa cost <session-id>`, stop with `qa stop <session-id> --subagents` at the cap,
and report unfinished coverage.

## Start the session

Pass the brief as one argument to `qa start`.
For a user requesting express-checkout smoke coverage and a standard-checkout
regression check:

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
session_json=$(qa start "$brief")
session_id=$(jq -r .sessionId <<<"$session_json")
web_url=$(jq -r .webUrl <<<"$session_json")
created_at=$(jq -r '.createdAt // empty' <<<"$session_json")
```

Starting returns before Mo finishes. Preserve these values: every later command
needs `session_id`, the user can watch or join through `web_url`, and
`created_at` records when the session began. `createdAt` can be absent when the
server runs an earlier API version.

For example, when testing an unreleased CLI that Mo cannot build or run:

> Ask me to start sessions with the branch's unreleased QA CLI. Send the required
> arguments and wait for a session URL, then verify it in the web UI.

For a GitHub PR, use PR mode instead of placing its reference only in the brief.
Pass the deployment URL you created or verified with `--url`; any HTTP or HTTPS
preview host works:

```bash
session_json=$(qa start "$brief" --pr https://github.com/acme/shop/pull/412 --url https://preview.example.com)
```

`--pr` accepts a full GitHub PR URL, including comment permalinks and links with
query parameters. Mo keeps the repository and PR number, dropping the query and
fragment. `owner/repo#number` also works. Name the PR explicitly;
do not infer it from the current branch or remote. Mo captures the remote PR
revision and tests its changed app behavior and regressions. Omit the brief to
use that default scope. Changes with no testable app behavior finish without
launching testing agents.

For PR sessions, let Mo identify changed behavior and affected flows from the
PR context. Plan for about 10 minutes of aggregate interaction time and about
20 minutes elapsed, including planning and reproduction. Mo's PR instructions
guide it toward focused verification and fewer explorers. Follow explicit
user scope, duration, and concurrency requests instead of these defaults.
These are planning targets, not enforced limits; monitor and stop the session
when the user supplies a hard cap.

An environment supplies the target without requiring a preview URL. Otherwise,
Mo looks for a preview tied to the PR commit in Vercel, Cloudflare Pages, or
Netlify bot posts. Failed or ambiguous discovery does not block startup: Mo
can inspect the PR or ask for the target. Don't invent a URL from a branch name.
Use `--tunnel` as well when the chosen deployment is local or private.
Without `--pr`, `--url` and `--patch` are ignored; put a general session's
target URL in its brief.

Each PR session posts a GitHub comment with its session link and updates that
comment with the results. A new session collapses older Mo comments as outdated;
their session and report links remain available. The Mo check on the same
commit follows the latest request. Use the session report for findings instead
of treating a superseded comment as the current result.

For local changes, commit and push to that PR before starting whenever authorized.
If pushing is disallowed, pass a curated Git patch with `--patch FILE` from the
PR checkout. The CLI uses local `HEAD` as the base; it must match the published
PR head or startup is rejected. Use a target serving those local changes,
with `--url` when known and `--tunnel` if needed.
A patch gives Mo source context; it does not deploy the changes.

Select only files and hunks needed to test the change, including relevant
untracked files. Review the patch before sending it. Exclude secrets,
credentials, logs, temporary files, large blobs, and unrelated changes or
customer data. Do not collect the entire working tree or force-add
ignored files. Patches must be text-only Git diffs of at most 256 KiB.

To include tracked and untracked files without changing your real Git
index, use a temporary index and an explicit file list. Verify that local HEAD
matches the named PR head before running this example, then replace its paths
with the files you reviewed:

```bash
patch_base=$(git rev-parse --verify HEAD)
patch_file=$(mktemp)
(
  set -eu
  patch_index=$(mktemp)
  rm "$patch_index"
  trap 'rm -f "$patch_index"' EXIT
  export GIT_INDEX_FILE="$patch_index"
  git read-tree "$patch_base"
  git add -- src/checkout.ts src/discount.ts
  git diff --cached --no-renames --no-ext-diff --no-textconv "$patch_base" -- src/checkout.ts src/discount.ts > "$patch_file"
)
git apply --stat "$patch_file"
```

Read every hunk in `patch_file` with your file-reading tool before starting Mo.
Remove any excluded content, then start the session:

```bash
qa start "$brief" --pr https://github.com/acme/shop/pull/412 --url https://preview.example.com --patch "$patch_file"
rm -f "$patch_file"
```

Send the patch in the initial start request. Do not start a session and upload it
afterward: Mo may begin reading code before that upload finishes. Mo uses the PR
revision plus the supplied patch for source investigation. Keep the target and
patch stable throughout testing and reproduction. Clean patch runs produce a
neutral GitHub check because their source includes unpublished changes.

A Momentic environment groups a `BASE_URL` with reusable non-secret variables
under a name such as `staging`. `--environment NAME` selects one created under
**Environments** in the Momentic dashboard, not one from the shell or
`momentic.config.yaml`. Mo copies its variables into the session at start.

Use repeatable `--env-file` or `--env-var NAME` options for local values and
secrets; they override matching environment variables. `--env-var` forwards a
variable that is already present in the `qa start` process environment; it does
not accept `NAME=value`. Never put the secret value in the command or brief.
Use `--tunnel` for private access. The concurrency limit is fixed at session
start. If target overload requires a lower limit, run `qa stop --subagents`
and start a new session. `--interaction-speed <default|human>` slows browser
interaction to a human pace when the target needs it.

## Follow the session

Use this watcher to print new bug names, verdict states, and display-state
changes. It exits when Mo needs input or reports a terminal state:

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
    needs_you | ready | sleeping | cancelled | failed_start | failed | waitingOnUser | idle | stopped) break ;;
  esac
  sleep 30
done
```

On older lifecycle-only responses, `idle` or `stopped` does not establish that
sub-agents finished; confirm completion in the web session.

Use a host tool that reports watcher output while you work, or a runner
sub-agent when the environment supports messages from running agents.
Otherwise retain the command session and check its output between tasks.

In Codex without a runner sub-agent, keep the watcher in the foreground of a
long-running `exec_command`, retain its returned session ID, and drain it with
`write_stdin`. Do not append `&`, detach it, or finish the turn while it runs.
Shell variables do not persist across separate commands, so interpolate the
literal Mo session ID or start the watcher in the same shell that set it.

You answer blockers and send Mo the user's decisions.

`displayState` is the session's state as the UI shows it. `status`, `read`,
and `report` all report the same word there:

| State               | Meaning                                                    |
| ------------------- | ---------------------------------------------------------- |
| `running`           | Root Mo is working.                                        |
| `waiting_on_agents` | Root Mo is idle; its internal sub-agents are working.      |
| `needs_you`         | Mo asked a question. Answer it with `qa send`.             |
| `ready`             | No agent is running and results are available.             |
| `sleeping`          | No agent is running and there is no report or final reply. |
| `cancelled`         | Work was stopped.                                          |
| `failed_start`      | The session never started. Start a new one.                |
| `failed`            | The session failed. Inspect its transcript.                |

`sessionState` is the lifecycle state (`starting`, `working`,
`waitingOnUser`, `waitingOnAgents`, `idle`, `stopped`, or `failed`), also identical
across all three commands. `state` is the legacy field, an alias of
`sessionState` wherever it appears. `createdAt` is the session creation time,
and `lastActivityAt` is the last persisted update. `latestTurn` contains the
most recent persisted assistant timing metadata: `startedAt`, `completedAt`,
and `durationMs`. A partial timing uses `null`. Servers running an earlier API
can omit `displayState` on `read` and `report`; use `qa status` for the
display word on those.

Use this bounded read for Mo's questions and replies, not findings:

```bash
qa read "$session_id" --from start --timeout 45s --json
```

It reads persisted conversation messages and user-facing messages streamed
during the wait.
`--from latest` also misses a turn that finishes before the read begins. In a
`read` response, `displayState` matches the `status` word, while `state` and
`sessionState` carry the lifecycle state. Servers running an earlier API omit
`displayState`; use `qa status` for the display word on those.
`timedOut: true` means Mo is still working.

With `--json`, `read` writes one JSON response to stdout and no progress text.
Without `--json`, a read that waits longer than two seconds prints liveness to
stderr. Returned messages stay on stdout, while timeout or stopped status text
stays on stderr.

`qa wait "$session_id" --json` returns when root Mo's turn finishes, stops, or
needs input. Exit code `2` means Mo needs input; `4` means it was stopped.
Internal sub-agents can still be running, so confirm `qa status` reports
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
coverage against the user's scope. An idle session or zero bugs alone does not
establish passing QA.

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

## Fallback: provide source context without repository access

Prefer setting up Git access in Mo for repository context. If access is
unavailable, tell the user and recommend configuring it.

When Git access cannot be configured, prepare a temporary source snapshot
containing only the files Mo needs. Review its contents before uploading;
exclude `.env` files, credentials, private keys, tokens, `node_modules`, build
output, and unrelated customer data. Include relevant local changes or a
reviewed patch when testing uncommitted work.

After starting the session, upload the snapshot with `qa upload` and send Mo
the returned sandbox path with `qa send`. Remove the temporary local snapshot
after upload. Tell Mo to use it as read-only context, which paths are
authoritative, whether it represents baseline or modified code, and which
commands or dependency files explain how to use it. Local paths do not work
inside Mo's sandbox.
