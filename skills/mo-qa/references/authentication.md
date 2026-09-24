# Authentication

## Authenticate Mo

```bash
qa login
```

Use `qa login --no-browser` when the environment cannot open a browser. Login
saves the API key and server URL in `~/.momentic/auth.json`.

In CI, set `MOMENTIC_API_KEY`. It overrides the saved login. Preserve an
existing value unless authentication fails or the user asks to replace it.

## Authenticate the application

Pass credentials at session start with `--env-file` or `--env-var NAME`.
`--env-var` forwards a variable already present in the `qa start` process
environment; it does not accept `NAME=value`. Never include the value in the
command or brief. `--environment` selects non-secret variables from a Momentic
dashboard environment. Put variable names and a non-secret account label in the
brief. Root Mo supplies authentication to its internal sub-agents.

A browser auth-state file uses Playwright `storageState` JSON: cookies and
`localStorage` by origin. Momentic `AUTH_SAVE` may add `sessionStorage` and a
top-level `idb` dump. Use `AUTH_SAVE` if the app depends on either.

If the user supplies an auth-state file, upload it and send root Mo the returned
sandbox path. You cannot message Mo's internal sub-agents directly. Uploading a
credential file does not add its values to the session environment.

If Mo needs a new environment variable, ask the user and start a new session
with the authorized value.

Never expose secrets in a brief, Mo message, URL, command, or commit.
