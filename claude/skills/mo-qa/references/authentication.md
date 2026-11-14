# Authenticate Mo and the app

Run `qa login`, or `qa login --no-browser` without a browser.
In CI, supply `MOMENTIC_API_KEY` through the secret store; it overrides saved
login. Preserve an existing key unless it fails or the user asks to replace it.

## Authenticate the application

A Momentic environment groups a `BASE_URL` with reusable variables and secrets.
For hosted sessions, call `momentic_mo_list_configuration` with
`kind: "environments"` and pass the selected name as `environmentName`.
For CLI sessions, discover names with `qa environments list --search staging`,
then use `--environment NAME`.
These select an environment saved under **Environments** in Momentic, not a shell
environment or `momentic.config.yaml` environment. Discovery doesn't reveal its
variables or secrets; Mo copies them into the session at start.
For an existing hosted session, have the user add a secret through the session-page
composer. Put only the username/account label and variable names in the brief.

For local credentials, have the user or secret manager provision an owner-only
dotenv file outside the checkout (mode `600` on Unix). Pass its path without
reading or printing its contents:

```bash
qa start "$brief" --effort "$effort" --env-file "$HOME/.config/momentic/qa.env"
```

For CLI sessions, use `--env-var NAME` to forward an already provisioned process
variable:

```bash
qa start "$brief" --effort "$effort" --env-var QA_PASSWORD
```

These options override matching saved-environment values. `--env-var` accepts
a name, not `NAME=value`.

Never transcribe a secret from chat into commands, shell assignments, scripts,
file edits, messages, URLs, reports, or commits. Use secure provisioning;
disable shell tracing and don't print secret values. Remove temporary
credential files you created after start, not user-managed files.
Continue unauthenticated only when in scope.

## Add session secrets

For a CLI session you created, save securely provisioned variables without
restarting the session:

```bash
qa secrets set "$session_id" --env-var QA_PASSWORD
qa send "$session_id" --wait 45s "QA_PASSWORD is available. Retry the sign-in."
```

Pass `--question-id "<question-id>"` on the reply when Mo provides an ID.
`--env-var` reads from the shell, not from a file. To use an owner-only dotenv
file, pass `--env-file "$HOME/.config/momentic/qa.env"` instead. Don't read or print
its contents. Confirmation contains only the session ID and saved names.

Saving secrets doesn't send a message. The follow-up turn picks up the new values;
an already-running process keeps its old environment. Rejecting a file saves
nothing. Remove `__proto__` and `BASE_URL` from files passed to `qa secrets set`;
neither name is supported there. `qa start` still accepts `BASE_URL` as public
target configuration, not a secret.

## Reuse browser authentication

With authorization, upload an auth-state file through `qa upload` and send Mo
only its returned sandbox path. Don't read it into chat or reports.
Hosted uploads accept non-secret files only; use the CLI for auth state.

A browser auth-state file stores cookies and local storage by origin in
Playwright `storageState` JSON. Momentic `AUTH_SAVE` can also save session
storage and IndexedDB; use it when the app needs either. Uploading this file
doesn't add its values to the session environment.
