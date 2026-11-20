# Configure a hosted session

Use `momentic_mo_list_configuration` and pass exact returned values:

- `environments` lists saved environment names. Pass the selected name as `environmentName`. For non-PR sessions, pass `null` for no environment. For PR starts, `null` or omission falls back to the repository's configured environment when one exists; in that case, the hosted PR flow cannot request no environment. An explicit saved `environmentName` overrides that fallback. If the user declines the repository environment, offer another saved environment and pass its exact name as `environmentName`. If no environment is acceptable or the user declines the run, explain the limitation and do not start; do not ask them again to accept the declined default. Saved environments hold `BASE_URL`, variables, and secrets. Do not ask the user to paste secret values into chat.
- `connectors` lists named private web tunnels and their availability. Pass an exact, online Connector name as `access`. Do not invent names or treat a saved but offline Connector as available.
- `mobile_builds` lists uploaded builds. Use the returned platform, channel, and immutable build tag for `mobileTarget`. Use `latest` only when the user asks for the latest build. If the requested tag is not on the current page and `page.nextOffset` is non-null, call `momentic_mo_list_configuration` again with `kind: "mobile_builds"`, the same `platform`, `channel`, and `limit`, and `offset: page.nextOffset`. Ask for an upload only after all pages are checked. If `page.nextOffset` is null but `offset + page.items.length < page.total`, report discovery as incomplete rather than claiming the build is missing. If the build is still missing after complete discovery, ask the user to upload it in the Mo UI. Do not use another tool or CLI to upload it.
- The user can explicitly select AWS Device Farm with `mobileTarget.deviceProvider: "aws-device-farm"` and a platform, without a build. Omit `channel` and `tag` for this selection. AWS Device Farm must be enabled for the organization; otherwise the hosted start returns an access error, even for a buildless selection. Do not substitute a web session if mobile setup fails.
- `knowledge` lists active workspace-wide flows or terminology. Pass selected IDs as `knowledgeItemIds` when they apply.
- `slack_channels` lists available notification destinations. Use an exact returned ID or name only when the user requests Slack reporting.

For a private web target, use an existing online Connector. If none is available, ask for a public target or ask the user to prepare a Connector outside the skill; link the [tunneling guide](https://momentic.ai/docs/mo/tunneling). If the user prepares a temporary tunnel, ask them to stop its process after the run only when they started or resumed that process solely for this run. Leave processes already running or needed by other work alone. Saved Connector identity does not determine process ownership.

Ask the user when discovery returns multiple matches. Use a saved environment for credentials. The session page lets the user manage missing secrets. Do not place secret values in tool inputs, briefs, messages, or files.

For mobile, confirm the app and its backend are reachable from the selected device provider. A web Connector does not route mobile traffic.

Follow the start schema; do not combine unsupported targets:

- `mobileTarget` is for Android or iOS. It cannot be combined with `pullRequest`, Connector `access`, `browserSettings`, `focus`, `capabilities`, or `agentVersion`. There is no mobile PR start flow. Do not promise on-demand mobile PR testing.
- `remoteEmulatorSettings` and `visionOnlyLocators` require `mobileTarget`.
- `previewUrl` requires `pullRequest`. For a deployed site without a PR, put its URL in the brief.
- `browserSettings` and Connector access are web-only.

For a PR, pass a GitHub pull request URL without a query or fragment. The Momentic GitHub App needs access to the repository, and the PR needs a deployed preview. If preview discovery fails, verify the deployed preview and pass its URL as `previewUrl`. An environment `BASE_URL` does not replace the PR preview.

Put advanced settings in `momentic_mo_start_session` inputs, not only in the brief. Use `browserSettings: { browserOptions: ... }` for web provisioning options and `interactionSpeed` where the start schema supports it. Mobile sessions cannot use `browserSettings`. See the [hosted tool schema](https://momentic.ai/docs/mo/chatgpt-and-claude#tool-reference) for the complete input options.

When the host presents an environment or mobile-build picker, use the user's selection. If the picker fails or is cancelled, no session was started; do not retry unless the user asks.
