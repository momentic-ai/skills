# Install or update Mo

Read this when Mo is missing, `qa version` fails, or the installed version does
not support `qa upgrade`.

## Update

Use the built-in command to update an installed release, then verify it:

```bash
qa upgrade
qa version
```

For an npm-installed copy, update with `npm install -g qa@latest` instead;
`qa upgrade` prints that instruction itself.

## Install

If Mo is missing or too old to support `qa upgrade`, run the installer:

```bash
curl -fsSL https://cli.momentic.ai/qa | sh
```

The installer writes `qa` to `$HOME/.local/bin`. Add that directory to `PATH`
if needed, then verify the installation:

```bash
qa version
```

After a new installation, read [Authentication](authentication.md).
