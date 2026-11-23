# Install or update the Mo CLI

Run `qa version`. Update a standalone installation with `qa upgrade`, or
an npm installation with `npm install -g qa@latest`.

If only the older `mo` command exists, run `mo upgrade` and check `qa version`.
If `qa` is still missing, run the installer:

```bash
curl -fsSL https://cli.momentic.ai/qa | sh
```

Add `$HOME/.local/bin` to `PATH` if needed, then run `qa version`.
Read [Authentication](authentication.md) when signing in for the first time.

`qa logout` removes the saved login, not a provisioned `MOMENTIC_API_KEY`.
For CLI diagnostics, global `--log-level` accepts `debug`, `info`, `warn`, or
`error`.

Install this CLI-only skill with `qa skills`. In an interactive terminal,
`qa skills` prompts you to choose agents. To target an agent directly, use
`-y` and `--target`:

```bash
qa skills -y --target claude-code
qa skills -y --target codex
```

Run `qa login` for a standalone install or `npx -y qa login` for an npm install
before the first Mo session.
