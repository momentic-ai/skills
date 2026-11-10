# Authenticate Mo and the app

Run `qa login`, or `qa login --no-browser` without a browser.
In CI, supply `MOMENTIC_API_KEY` through the secret store; it overrides saved
login. Preserve an existing key unless it fails or the user asks to replace it.

## Authenticate the application

A Momentic environment groups a `BASE_URL` with reusable variables and secrets.
Use `--environment NAME` to select one saved under **Environments** in Momentic,
not a shell environment or `momentic.config.yaml` environment. Mo copies its
variables and secrets into the session at start.
For an existing session, have the user add a secret through the session-page
composer. Put only the username/account label and variable names in the brief.

For local credentials, have the user or secret manager provision an owner-only
dotenv file outside the checkout (mode `600` on Unix). Pass its path without
reading or printing its contents:

```bash
qa start "$brief" --effort "$effort" --env-file "$HOME/.config/momentic/qa.env"
```

Or forward an already provisioned process variable by name:

```bash
qa start "$brief" --effort "$effort" --env-var QA_PASSWORD
```

These options override matching saved-environment values. `--env-var` accepts
a name, not `NAME=value`. To add CLI variables after start, restart with them.

Never transcribe a secret from chat into commands, shell assignments, scripts,
file edits, messages, URLs, reports, or commits. Use secure provisioning;
disable shell tracing and don't print secret values. Remove temporary
credential files you created after start, not user-managed files.
Continue unauthenticated only when in scope.

## Reuse browser authentication

With authorization, upload an auth-state file through `qa upload` and send Mo
only its returned sandbox path. Don't read it into chat or reports.
Hosted uploads accept non-secret files only; use the CLI for auth state.

A browser auth-state file stores cookies and local storage by origin in
Playwright `storageState` JSON. Momentic `AUTH_SAVE` can also save session
storage and IndexedDB; use it when the app needs either. Uploading this file
doesn't add its values to the session environment.
