# Install or update Mo

Run `qa version`. Update a standalone installation with `qa upgrade`, or
an npm installation with `npm install -g qa@latest`.

If only the older `mo` command exists, run `mo upgrade` and check `qa version`.
If `qa` is still missing, run the installer:

```bash
curl -fsSL https://cli.momentic.ai/qa | sh
```

Add `$HOME/.local/bin` to `PATH` if needed, then run `qa version`.
Read [Authentication](authentication.md) when signing in for the first time.

For a CLI bridge, run `npx -y qa login`, then configure `momentic-hosted` with
`npx -y qa mcp`.

When installing skills from an agent, target that agent explicitly:

```bash
qa skills -y --target claude-code
```

For Codex, use `qa skills -y --target codex` instead.
