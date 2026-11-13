# Use hosted Mo tools

1. Discover the needed [session inputs](#start-requirements) before starting.
2. Call `momentic_mo_start_session` with the selected configuration, the agreed
   effort, requirements, and prohibited actions.
   Share the returned `webUrl`.
3. Read progress with `momentic_mo_get_session`; follow the
   [skill's follow loop](../SKILL.md#follow-the-session).
   While Mo is working, it waits up to 45 seconds
   for new output by default, so you don't need to pass `waitSeconds`.
   Set it to 0 for an immediate snapshot; values must be integers from 0 to 45.
   Pending questions, finished sessions, and `bugName` lookups return immediately.
   If the live output wait fails, the tool returns a fresh snapshot with a
   warning. Closing the connection cancels the wait.
4. Answer questions with `momentic_mo_message_session` and `questionId`.
   Apply the [message limits](../SKILL.md#message-mo).
5. Once `ready` or `sleeping`, read the report with
   `momentic_mo_get_session`. Sleeping does not confirm completion; follow
   `nextAction` for incomplete sessions. Quote `latestMessage.text` when its role is
   `assistant`; it is Mo's reply, unlike the report summary or earlier verdicts.
   Replies over 20,000 characters end with an ellipsis; open the session link
   for the full reply.
6. Call `momentic_mo_stop_session` after `get_session` confirms testing is complete
   and no testers are running, unless the user wants more testing. If a prior
   read confirmed completion, stop even if final report retrieval fails.
   During active testing, stop only when the
   user wants to cancel. If access prevents following the session to completion,
   report the pending session and ask whether to cancel; don't claim cleanup is done.
7. After stopping, report findings, uncovered requirements, and the link.

Discovery doesn't create or resume a tunnel, upload a build, or read local files.
Read [Tunneling](tunneling.md) when the target needs private access.

## Start requirements

Follow the [workflow](../SKILL.md#workflow-at-a-glance) for effort and interface
selection. Read [Authentication](authentication.md) when the app needs credentials.

Use `momentic_mo_list_configuration` to find saved environments, uploaded app
builds, existing Connectors, workspace-wide knowledge and Slack destinations.
The connected tool schemas define the filters, pagination and start fields.
Use returned names and IDs; ask when multiple resources match.

For Android/iOS, pass the selected build's `platform`, `channel` and `tag` as
`mobileTarget`, not only in the brief. Pin the tag unless the user requests
`latest`. If the build is missing, ask for an upload in the Mo UI; don't start
a web session. An explicitly selected AWS Device Farm target can start without
a build using `deviceProvider: "aws-device-farm"` and empty `channel`/`tag`.

Pass requested browser, device and advanced settings through the start schema,
not only in the brief. If a needed tool or field is unavailable, report that
limitation rather than starting a different target.

Starts are limited to **5 per user in 15 minutes**. After an uncertain start,
inspect the dashboard before retrying. If a tool names a missing input, correct
it before retrying a rejected request.

For a PR, pass `pullRequest` without a query or fragment. The Momentic GitHub
App needs repository access and the PR needs a deployed preview. If preview
discovery fails, pass a verified `previewUrl`.

## Findings and files

Read every page from `momentic_mo_list_findings`; use `momentic_mo_get_session`
with an exact `bugName` for details. Change a finding with
`momentic_mo_triage_finding` only when requested. After an authorized code change,
use `momentic_mo_retest_finding` to recheck it; retests spend credits and can
change target data.

Upload non-secret files with `momentic_mo_upload_file`, then relay the returned
path with `momentic_mo_message_session`. Use the CLI authentication options,
not hosted uploads, for credential files.
