# Use hosted Mo tools

1. Discover the needed [session inputs](#start-requirements) before starting.
2. Call `momentic_mo_start_session` with the selected configuration, the agreed
   effort, requirements, and prohibited actions.
   Share the returned `webUrl`.
3. Read progress with `momentic_mo_get_session`; use
   [session control](session-control.md#wait-and-stop) for waiting behavior.
   If the live output wait fails, the tool returns a fresh snapshot with a
   warning. Closing the connection cancels the wait.
4. Answer questions with `momentic_mo_message_session` and `questionId`.
   Apply the [message limits](../SKILL.md#message-mo).
5. Follow the [finish sequence](../SKILL.md#finish), using
   `momentic_mo_get_session` for the report and `momentic_mo_stop_session` to stop.

Quote `latestMessage.text` when its role is `assistant`; it is Mo's reply, unlike
the report summary or earlier verdicts. Replies over 20,000 characters end with
an ellipsis; open the session link for the full reply.

Discovery doesn't create or resume a tunnel, upload a build, or read local files.
Read [Tunneling](tunneling.md) when the target needs private access.

## Start requirements

Follow the [workflow](../SKILL.md#workflow-at-a-glance) for effort and interface
selection. Read [Authentication](authentication.md) when the app needs credentials.

Use `momentic_mo_list_configuration` to discover environments, Connectors, and mobile builds.

For a web session with a saved environment and an existing Connector, discover each
kind separately. Set `environmentName` and `access` from those selections in the
start inputs.

If configuration selection fails or is cancelled, don't retry unless asked.

For mobile, select an uploaded app build or explicitly use AWS Device Farm
without one. If a build is missing and uploads are in scope, follow
[Mobile builds](mobile-builds.md) to upload with `qa assets`, or ask for an upload
in the Mo UI. Before a CLI upload, run `qa whoami` and confirm its organization
matches the hosted workspace. If you can't confirm the match, use the Mo UI.
Continue the hosted session with the returned selection; don't substitute a web
session. Pin the selected build tag unless the user asks to follow `latest`.

Put browser, device and advanced settings in the start inputs, not just the
brief. After an uncertain start, inspect the dashboard before retrying.
Correct missing inputs before retrying a rejected request.

## Findings and files

Read every page from `momentic_mo_list_findings` for the report's session; use
`momentic_mo_get_session` with an exact `bugName` for details. Follow
[Triage findings](reports.md#triage-findings), recording outcomes with
`momentic_mo_triage_finding`. For a requested recheck, use
`momentic_mo_retest_finding`; retests spend credits and can change target data.

Use `momentic_mo_upload_file` for test data and follow its instructions to
notify Mo. Never upload credentials; use the
[authentication workflow](authentication.md).
