# Run a mobile bug bash

Use `qa` for the build and session. Read [Installation](installation.md) if
`qa version` fails, then run `qa whoami` to confirm the workspace.

## Select a build

Obtain an Android APK or iOS simulator `.app` from the repository's build
instructions or CI. Ask for the artifact if it isn't available. Don't deploy
or change the app's backend without permission. The hosted device must be able
to reach the app's test backend; don't assume a web tunnel routes device traffic.

For an existing Android build, run `qa assets list --platform ANDROID --channel checkout`.
For iOS, run `qa assets list --platform IOS --channel checkout --build-target simulator`.
Set `platform`, `channel` and `tag` from the selected result, using its immutable
tag. For a new build, upload and keep the returned selection. These shell
examples use `jq`:

```bash
build_json=$(qa assets upload ./app.apk --channel checkout)
platform=$(jq -er .platform <<<"$build_json")
channel=$(jq -er .channel <<<"$build_json")
tag=$(jq -er .tag <<<"$build_json")
```

For iOS, replace `./app.apk` with the simulator `.app` directory. Read
[Mobile builds](mobile-builds.md) for aliases, retries, downloads and deletion.
Keep the tag fixed for the run. Start Android and iOS as separate sessions.

Check the selected build before starting a device session:

```bash
qa doctor --platform "$platform" --channel "$channel" --tag "$tag"
```

Resolve failed checks before starting. This checks access and build compatibility;
it doesn't allocate a device or prove the app can launch.

## Start and follow

Prepare the brief with the app, selected build, goal, test account, allowed
data and prohibited actions. Include native behavior requirements when in scope,
such as first-run permissions or deep links. Confirm [effort](brief.md#effort).
Use [Authentication](authentication.md) for a saved environment or securely
provisioned `--env-file` / `--env-var` credentials; keep values out of the brief.

Start with the selected build, not only its name in the brief:

```bash
session_json=$(qa start "$brief" --effort "$effort" \
  --platform "$platform" --channel "$channel" --tag "$tag")
session_id=$(jq -er .sessionId <<<"$session_json")
web_url=$(jq -er .webUrl <<<"$session_json")
```

`qa start` generates a startup request ID. To choose one before starting, pass
a UUID with `--request-id "$request_id"` and keep it until the outcome is known.

Share `web_url` and [follow the session](../SKILL.md#follow-the-session).
Answer non-secret questions with `qa send` and the question ID. Add new credentials
with [session secrets](authentication.md#add-session-secrets), then send only their
variable names. Don't put secrets in chat. If startup is uncertain, use
[startup recovery](session-control.md#recover-startup) before retrying; don't start
a web session instead.

## Finish and recheck

After testing and reproductions finish, check coverage against the brief and
[export the report](reports.md). Include the platform, channel, immutable tag,
findings, uncovered scope and session link in the handoff. Report missing
screenshots or video. Then run `qa stop "$session_id" --subagents`, even if
export failed. Leave uploaded builds in place unless deletion was requested.

After landing a fix, use [triage](reports.md#triage-findings) to record it when
authorized. `qa bugs fix` doesn't install a new binary or verify it. If the user
requests a recheck, upload a new tag and start a new mobile session with the
original reproduction requirements. Keep the original build and report for
comparison. If it reproduces the bug, reopen the original finding when authorized
with `qa bugs reopen <original-session-id> <original-bug-id>`. A blocked or
incomplete recheck leaves its status unchanged. Call the fix verified only after
a passing recheck.
