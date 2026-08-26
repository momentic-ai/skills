---
name: mo-qa
description: Use Momentic's `mo` CLI to run and control Mo, Momentic's cloud autonomous QA agent. Use when starting or continuing Mo sessions, reading their output or status, stopping active work, answering Mo, or moving files between the local machine and Mo's hosted sandbox.
---

# Run QA with Mo

Mo is Momentic's autonomous QA engineer. It runs in a hosted sandbox, where it
can test web applications with a browser, inspect network traffic, run code and
shell commands, delegate exploration, and report test cases and product bugs.
Treat its filesystem and environment as remote, not as the user's machine.

## Install and authenticate

```bash
curl -fsSL https://cli.momentic.ai/mo | sh   # installs to $HOME/.local/bin/mo
mo --version
```

Every command needs an API key. Set `MOMENTIC_API_KEY` in the environment;
prefer this in CI. For an interactive login, use:

```bash
npx @momentic/wizard@latest login
```

This writes `~/.momentic/auth.json`. Do not pass API keys as command arguments,
print them, paste them into a session message, or commit them.

## Write the QA brief first

Treat the brief as the whole input. A vague brief produces a vague bug bash.
Mo's browser runs outside the developer machine, so the target must be
reachable from the public internet: use a deployed environment or preview URL,
never `localhost`.

State in the brief:

1. **Target URL:** Include the exact path and query the change affects.
2. **Expected behavior:** Explain what changed and what it should now do in
   product terms.
3. **Sign-in instructions:** Name the login method and test account to use.
4. **Test data rules:** State what Mo may create and what it must not touch.
5. **Out-of-bounds actions:** Call out deletions, payments, emails, production
   data, bulk operations, and any other destructive action. Mo may take
   destructive actions if the brief invites them.
6. **Acceptance criteria:** List the checks that decide pass or fail.

Ask the user for any missing item before starting Mo. Do not invent scope,
credentials, test data permissions, or acceptance criteria.

## Run a session

Write the brief before invoking the CLI, then pass it as one quoted argument:

```bash
brief=$(cat <<'EOF'
Target URL: https://preview.example.com/checkout?variant=express
Expected behavior: Express checkout now keeps the selected shipping method when the customer returns from payment.
Sign-in: Use the staging QA buyer account already provisioned for Mo.
Test data: Create test carts and orders only. Do not modify shared catalog data.
Out of bounds: Do not submit payment, send emails, delete data, or run bulk operations.
Acceptance criteria:
- The selected shipping method remains selected after returning from payment.
- The order total does not change.
- Standard checkout still works.
EOF
)
session_json=$(mo start "$brief")
session_id=$(jq -r .sessionId <<<"$session_json")
web_url=$(jq -r .webUrl <<<"$session_json")
```

Starting returns before Mo finishes. Preserve both values: every later command
needs `session_id`, and the user can watch or join through `web_url`.

## Follow the turn reliably

Poll the active session with `status`:

```bash
mo status "$session_id"
```

It returns the current run state, latest visible message, web URL, and
structured QA findings. Always inspect `findings.testCases`, `findings.bugs`,
`findings.controls`, and `findings.verdicts`; they contain more evidence than
Mo's closing prose.

Use `read` when waiting for output or retrieving the transcript and pending
input. Prefer bounded 30-60 second reads so the caller stays responsive:

```bash
mo read "$session_id" --from start --timeout 45s --json
```

Use `--from start` for reliable polling. It replays the visible transcript, so
deduplicate messages when automating. Repeat until the expected assistant reply
appears and `state` is `idle`, `waitingOnUser`, or `stopped`. A `timedOut: true`
response means Mo is still working. If `pendingInput` is present, answer it with
`send`.

Do not rely on `--from latest` after `start` or `send`: it only captures output
produced after the read begins, so a fast turn can finish and return no
messages. A timeout accepts `0`, milliseconds, seconds, or minutes such as
`500ms`, `45s`, or `4m`, up to `290s`.

`status.state` reports the backend run state, while `read.state` reports the
visible turn state.

## Continue or stop a session

Send a follow-up or answer:

```bash
mo send --session-id "$session_id" 'Use the staging account and continue'
mo read "$session_id" --from start --timeout 45s --json
```

If Mo is working, `send` steers the live turn at its next tool-step boundary.
Otherwise it starts a new turn in the same session. A successful `send` only
means the message was accepted; confirm that the transcript advances to a new
assistant reply. After a stopped turn, a new `send` can resume the session, but
an immediate read may briefly show the previous stopped state.

Stop only the active turn:

```bash
mo stop "$session_id"
```

Allow a few seconds for propagation, then verify with
`read --from start --timeout 0 --json` that the state is `stopped`. Stopping
does not delete the session, and already-running sub-agents may finish
independently.

## Transfer files

`upload` needs an existing session and prints the authoritative sandbox path.
Send that returned path to Mo; a local path is meaningless inside its hosted
machine.

```bash
remote_path=$(mo upload --session-id "$session_id" ./fixture.csv fixture.csv)
mo send --session-id "$session_id" "Use the sandbox file at $remote_path."

mkdir -p .momentic-artifacts
mo download --session-id "$session_id" --output .momentic-artifacts "$remote_path"
```

If `--output` names a directory, create it first. A nonexistent output path is
treated as a target filename. Without `--output`, downloads use
`MOMENTIC_ARTIFACTS_DIR`, then `<current-directory>/.momentic-artifacts`.

## Command reference

| Command                                                    | Purpose and important arguments                                                                                                      |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `mo start <message>`                                       | Create a cloud session and begin its first turn; return `sessionId` and `webUrl` as JSON.                                            |
| `mo read <session-id>`                                     | Read transcript and turn state; prefer `--from start --timeout <duration> --json`.                                                   |
| `mo status <session-id>`                                   | Return the latest message, web URL, backend run state, and structured QA findings.                                                   |
| `mo send --session-id <id> <message>`                      | Steer active work or start the session's next turn.                                                                                  |
| `mo stop <session-id>`                                     | Stop the active turn without deleting the session.                                                                                   |
| `mo upload --session-id <id> <local-source> [destination]` | Upload one local file and print its remote sandbox path. The optional destination is a remote filename.                              |
| `mo download --session-id <id> <remote-source>`            | Download a sandbox path or durable artifact and print the local path. Use `--output <path>` for a target file or existing directory. |
