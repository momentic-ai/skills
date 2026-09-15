# Install or update Mo

Read this when Mo is missing, `mo version` fails, or the installed version does
not support `mo upgrade`.

## Update

Use the built-in command to update an installed release, then verify it:

```bash
mo upgrade
mo version
```

## Install

If Mo is missing or too old to support `mo upgrade`, run the installer:

```bash
curl -fsSL https://cli.momentic.ai/mo | sh
```

The installer writes `mo` to `$HOME/.local/bin`. Add that directory to `PATH`
if needed, then verify the installation:

```bash
mo version
```

## Authenticate after installation

After a fresh installation, read [Authentication](authentication.md) and sign
in before running an operational command.
