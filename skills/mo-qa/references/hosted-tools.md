# Hosted tools

Use these tools for deployed web apps, GitHub pull requests and saved Momentic
environments. They can't reach localhost, private networks or local files; for
those, use the `qa` CLI with a [tunnel](tunneling.md).

## Start a session

Before you call `momentic_mo_start_session`, you need:

- The target: a deployed URL, a GitHub PR link or a saved Momentic
  environment (`environmentName`).
- The effort: `low` (15 minutes of testing), `medium` (30), `high` (60) or
  `max` (120). Confirm it with the user unless they chose it.
- What Mo must not do, such as place orders, send email or delete data.
- The test account, if the app needs a login.

Share the session link (`webUrl`) as soon as the session starts.

For a PR, pass its link as `pullRequest`, without a query string or `#`
fragment. The Momentic GitHub App needs access to the repository, and the PR
needs a deployed preview. If Mo can't find the preview, ask the user for its URL
and pass it as `previewUrl`.

Never put passwords, tokens, cookies or `.env` contents in the brief, a message
or an upload. Use a saved environment for test accounts, or ask the user to add
credentials on the session page.

## Follow the session

Check progress with `momentic_mo_get_session` and do what its `Next` line says.
An empty list of findings doesn't mean the app passed.

Answer Mo's questions with `momentic_mo_message_session` and the question's
`questionId`. You can also message Mo to change what it tests or to resume a
stopped session.

If you can't wait between checks, share the link and tell the user to ask you
for an update.

If a start, message or retest times out, read the session before you try again.
If a tool returns an error that names a fix, such as a missing `previewUrl`, fix
it and try again.

## Report results

When the session finishes, read the report with `momentic_mo_get_session`. Tell
the user which bugs Mo found, what it didn't cover and the session link, which
has the full report.

## Triage and retest findings

List findings with `momentic_mo_list_findings`, reading every page. Read one
finding with `momentic_mo_get_session`, its session and exact `bugName`.

Accept, dismiss, mark fixed or reopen a finding with
`momentic_mo_triage_finding` only when the user asks. After a code change, offer
a retest instead of marking the finding fixed.

`momentic_mo_retest_finding` reruns a finding in the same session and updates
its status. It uses Mo credits and can change data on the target site.

## Give Mo a file

Upload a non-secret file, such as a CSV, an image or a PDF, with
`momentic_mo_upload_file`, then send Mo the returned path with
`momentic_mo_message_session`.

## Test runs and quarantines

`momentic_list_runs` lists recent Momentic test runs and
`momentic_quarantine_list` lists quarantined tests.
