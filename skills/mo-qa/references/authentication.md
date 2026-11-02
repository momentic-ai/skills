# Authentication

## Authenticate Mo

Run `qa login`, or `qa login --no-browser` when the environment cannot open a
browser. Login saves the API key and server URL in `~/.momentic/auth.json`.

In CI, set `MOMENTIC_API_KEY`. It overrides the saved login. Preserve an
existing value unless authentication fails or the user asks to replace it.

## Authenticate the application

A Momentic environment groups a `BASE_URL` with reusable variables and secrets
under a name such as `staging`. `--environment NAME` selects one created under
**Environments** in the Momentic dashboard, not one from the shell or
`momentic.config.yaml`. Mo copies its variables into the session at start.

Pass local values at session start with repeatable `--env-file` or
`--env-var NAME` options; they override matching Momentic environment variables.
Put only variable names and a non-secret account label in the brief. Root Mo
supplies authentication to its internal sub-agents.

Have the user or secret manager provision a dotenv file outside the checkout,
readable only by its owner (mode `600` on Unix). Pass its path without reading
or printing its contents. For example, if they supplied
`~/.config/momentic/qa.env`:

```bash
qa start "$brief" --effort "$effort" --env-file "$HOME/.config/momentic/qa.env"
```

If your runner already supplies `QA_PASSWORD` through its secret store or
secure environment binding, forward the name, not its value:

```bash
qa start "$brief" --effort "$effort" --env-var QA_PASSWORD
```

`--env-var` reads the process environment, not `NAME=value`. Never transcribe
secrets, including ones pasted in chat, into shell assignments, commands,
heredocs, scripts or file-edit payloads. Quoting, encoding or later deletion
doesn't remove them from tool logs. Disable shell tracing; don't print secrets.
Ask for secure provisioning through the paths above or session-page secrets.
Continue unauthenticated only if in scope. Delete temporary credential files
you created after start completes, not user-managed files.

A browser auth-state file uses Playwright `storageState` JSON: cookies and
`localStorage` by origin. Momentic `AUTH_SAVE` may add `sessionStorage` and a
top-level `idb` dump. Use `AUTH_SAVE` if the app depends on either.

If the user authorizes use of an auth-state file, upload it with `qa upload`
and send root Mo only the returned sandbox path. Do not read its contents into
chat or attach it to a report. This CLI path does not apply to hosted MCP,
which accepts only non-secret assets. Uploading a credential file does not add
its values to the session environment.

The CLI supplies variables only at start. For an existing session, add an
authorized secret through Mo's web composer, or restart with that value.

Keep secret values out of messages, URLs, reports and source control.
