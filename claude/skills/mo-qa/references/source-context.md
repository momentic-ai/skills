# Give Mo source context

## Test a PR

Name the PR explicitly with `--pr`, not a link in the brief or a guess from
the current branch. Pass a verified preview URL with `--url` when known:

```bash
qa start "$brief" --effort "$effort" --pr https://github.com/acme/shop/pull/412 --url https://preview.example.com
```

A full PR URL or `owner/repo#number` works. Omit the brief to test the PR's
changed behavior and regressions. Preserve any user-specified scope.

If preview discovery fails, provide its verified deployment URL.
A saved environment's base URL doesn't replace the PR preview.
Use `--tunnel` for private previews. Without `--pr`, put the target in the
brief; `--url` and `--patch` apply only to PR sessions.

Use the session report for findings rather than a superseded GitHub comment.

## Test local changes

Commit and push to the PR when authorized. Otherwise use `--patch FILE` from
a checkout whose `HEAD` matches the published PR head.
Serve those changes at the target URL; a patch supplies source, not deployment.

Select relevant tracked and untracked files. Exclude secrets, credentials,
logs, temporary files, large blobs, and unrelated changes or customer data.
Use text-only Git diffs at most 256 KiB.

To preserve the real index, prepare a patch with a temporary index and explicit
reviewed paths:

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

Read every hunk and remove excluded content before starting:

```bash
qa start "$brief" --effort "$effort" --pr https://github.com/acme/shop/pull/412 --url https://preview.example.com --patch "$patch_file"
rm -f "$patch_file"
```

Send the patch at start, not as a later upload. Keep the patch and target
stable while Mo tests and reproduces findings.

## Without repository access

Ask the user to configure Git access. If unavailable, prepare a reviewed
snapshot of only the necessary source. Exclude `.env`, credentials, keys,
tokens, dependencies, build outputs, and unrelated customer data.
Include relevant local changes or a reviewed patch.

Upload with `qa upload`, then relay its sandbox path with `qa send`.
Specify read-only use, authoritative paths, baseline versus modified code,
and relevant build/dependency files. Remove your temporary local snapshot.
