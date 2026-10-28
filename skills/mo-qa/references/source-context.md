# Give Mo source context

Read this before testing a GitHub PR or local changes, or when Mo lacks
repository access.

## PR sessions

For a GitHub PR, use PR mode instead of placing its reference only in the brief.
Pass the deployment URL you created or verified with `--url`; any HTTP or HTTPS
preview host works:

```bash
session_json=$(qa start "$brief" --pr https://github.com/acme/shop/pull/412 --url https://preview.example.com)
```

`--pr` accepts a full GitHub PR URL, including comment permalinks and links with
query parameters. Mo keeps the repository and PR number, dropping the query and
fragment. `owner/repo#number` also works. Name the PR explicitly; do not infer
it from the current branch or remote. Mo captures the remote PR revision and
tests its changed app behavior and regressions. Omit the brief to use that
default scope. Changes with no testable app behavior finish without launching
testing agents.

Let Mo identify changed behavior and affected flows from the PR context. Plan
for about 10 minutes of aggregate interaction time and about 20 minutes
elapsed, including planning and reproduction. Mo's PR instructions guide it
toward focused verification and fewer explorers. Follow explicit user scope
and duration requests instead of these defaults. These are
planning targets, not enforced limits.

An environment supplies the target without requiring a preview URL. Otherwise,
Mo looks for a preview tied to the PR commit in Vercel, Cloudflare Pages, or
Netlify bot posts. Failed or ambiguous discovery does not block startup: Mo can
inspect the PR or ask for the target. Don't invent a URL from a branch name.
Use `--tunnel` as well when the chosen deployment is local or private. Without
`--pr`, `--url` and `--patch` are ignored; put a general session's target URL
in its brief.

Each PR session posts a GitHub comment with its session link and updates that
comment with the results. A new session collapses older Mo comments as outdated;
their session and report links remain available. The Mo check on the same
commit follows the latest request. Use the session report for findings instead
of treating a superseded comment as the current result.

## Local changes

Commit and push to that PR before starting whenever authorized. If pushing is
disallowed, pass a curated Git patch with `--patch FILE` from the PR checkout.
The CLI uses local `HEAD` as the base; it must match the published PR head or
startup is rejected. Use a target serving those local changes, with `--url`
when known and `--tunnel` if needed. A patch gives Mo source context; it does
not deploy the changes.

Select only files and hunks needed to test the change, including relevant
untracked files. Exclude secrets, credentials, logs, temporary files, large
blobs, and unrelated changes or customer data. Do not collect the entire working
tree or force-add ignored files. Patches must be text-only Git diffs of at most
256 KiB.

To include tracked and untracked files without changing your real Git index,
use a temporary index and an explicit file list. Verify that local HEAD matches
the named PR head first, then replace these paths with the files you reviewed:

```bash
patch_base=$(git rev-parse --verify HEAD)
patch_file=$(mktemp)
(
  set -eu
  patch_index=$(mktemp)
  rm "$patch_index"
  trap 'rm -f "$patch_index"' EXIT
  export GIT_INDEX_FILE="$patch_index"
  git read-tree "$patch_base"
  git add -- src/checkout.ts src/discount.ts
  git diff --cached --no-renames --no-ext-diff --no-textconv "$patch_base" -- src/checkout.ts src/discount.ts > "$patch_file"
)
git apply --stat "$patch_file"
```

Read every hunk in `patch_file` with your file-reading tool before starting Mo.
Remove any excluded content, then start the session:

```bash
qa start "$brief" --pr https://github.com/acme/shop/pull/412 --url https://preview.example.com --patch "$patch_file"
rm -f "$patch_file"
```

Send the patch in the initial start request. Do not start a session and upload
it afterward: Mo may begin reading code before that upload finishes. Mo uses the
PR revision plus the supplied patch for source investigation. Keep the target
and patch stable throughout testing and reproduction. Clean patch runs produce
a neutral GitHub check because their source includes unpublished changes.

## Without repository access

Prefer setting up Git access in Mo for repository context. If access is
unavailable, tell the user and recommend configuring it.

When Git access cannot be configured, prepare a temporary source snapshot
containing only the files Mo needs. Review its contents before uploading;
exclude `.env` files, credentials, private keys, tokens, `node_modules`, build
output, and unrelated customer data. Include relevant local changes or a
reviewed patch when testing uncommitted work.

After starting the session, upload the snapshot with `qa upload` and send Mo the
returned sandbox path with `qa send`. Remove the temporary local snapshot after
upload. Tell Mo to use it as read-only context, which paths are authoritative,
whether it represents baseline or modified code, and which commands or
dependency files explain how to use it.
