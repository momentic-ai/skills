# Install or update Mo

## Update

Update an installed release with `qa upgrade`, then verify it with `qa version`.
For an npm-installed copy, update with `npm install -g qa@latest` instead;
`qa upgrade` prints that instruction itself.

## Legacy mo installations

The command is `qa`. Older standalone installations can still be named `mo`.
Run `mo upgrade`, then check `qa --version`. If `qa` is still missing, run
`mo upgrade` again. The first run can execute an older updater that keeps the
`mo` filename; the second run uses the new updater to rename it. Run `hash -r`
if your shell remembers the old path.

## Install

If Mo is missing or too old to support `qa upgrade`, run the installer:

```bash
curl -fsSL https://cli.momentic.ai/qa | sh
```

By default, the installer writes `qa` to `$HOME/.local/bin`. Add that directory
to `PATH` if needed, then verify the installation with `qa version`.

After a new installation, read [Authentication](authentication.md).
