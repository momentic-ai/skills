# Authenticate Mo and the app

`MOMENTIC_API_KEY` overrides the saved login in `~/.momentic/auth.json`, including
in CI. Provision CI keys through the secret store. If an environment key is
rejected, ask the user or secret owner to replace or remove it at its source. Do
not print, copy, or ask for its value. `qa login` updates saved credentials but
does not override a set `MOMENTIC_API_KEY`.

When no environment key overrides it, run `qa login` to create or refresh saved
login. It opens the sign-in link by default, and the user must complete sign-in
in the browser. `qa login --no-browser` prints the link and code instead; the
user still needs to complete sign-in.

After the user changes `MOMENTIC_API_KEY` at its source, refresh or restart the
shell or agent environment that will launch `qa doctor` so it receives the
change. If the key was removed and the user intends to use saved login, ensure
`MOMENTIC_API_KEY` is unset in that environment. Rerun `qa doctor` and confirm
its API-key check passes before continuing. Preserve a working key unless the
user asks to replace it.

## Authenticate the application

A Momentic environment groups a `BASE_URL` with reusable variables and secrets.
Discover names with `qa environments list --search staging`, then select one
with `--environment NAME`. These select an environment saved under
**Environments** in Momentic, not a shell environment or
`momentic.config.yaml` environment. Discovery doesn't reveal its variables or
secrets; Mo copies them into the session at start. Put only the account label
and variable names in the brief.

For local credentials, have the user or secret manager provision an owner-only
dotenv file outside the checkout (mode `600` on Unix). Pass its path without
reading or printing its contents:

```bash
qa start "$brief" --effort "$effort" --env-file "$HOME/.config/momentic/qa.env"
```

Use `--env-var NAME` to forward an already provisioned process variable:

```bash
qa start "$brief" --effort "$effort" --env-var QA_PASSWORD
```

These options override matching saved-environment values. `--env-var` accepts
a name, not `NAME=value`.

Never invent credentials or transcribe a secret from chat into commands, shell
assignments, scripts, file edits, messages, URLs, reports, or commits. Use
secure provisioning; disable shell tracing and don't print secret values.
Remove temporary credential files you created after start, not user-managed
files. Continue unauthenticated only when in scope.

## Add session secrets

For a CLI session you created, save securely provisioned variables without
restarting the session:

```bash
qa secrets set "$session_id" --env-var QA_PASSWORD
qa send "$session_id" --wait 45s "QA_PASSWORD is available. Retry the sign-in."
```

Pass `--question-id "<question-id>"` on the reply when Mo provides an ID.
`--env-var` reads from the shell, not from a file. To use an owner-only dotenv
file, pass `--env-file "$HOME/.config/momentic/qa.env"` instead. Don't read or
print its contents. Confirmation contains only the session ID and saved names.

Saving secrets doesn't send a message. The follow-up turn picks up the new
values; an already-running process keeps its old environment. Rejecting a file
saves nothing. Remove `__proto__` and `BASE_URL` from files passed to
`qa secrets set`; neither name is supported there. `qa start` still accepts
`BASE_URL` as public target configuration, not a secret.

## Reuse browser authentication

With authorization, upload an auth-state file through `qa upload` and send Mo
only its returned sandbox path. Don't read it into chat or reports.

A browser auth-state file stores cookies and local storage by origin in
Playwright `storageState` JSON. Momentic `AUTH_SAVE` can also save session
storage and IndexedDB; use it when the app needs either. Uploading this file
doesn't add its values to the session environment.
