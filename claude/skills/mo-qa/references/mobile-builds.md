# Mobile app builds

Use `qa assets` to upload and manage workspace app builds from your machine.
Authenticate with `qa login` or `MOMENTIC_API_KEY` before running these commands.
You don't need a Momentic project config.

Upload an APK, list its tag and aliases, and download the build:

```bash
qa assets upload ./app.apk --channel checkout --tag release-42 --alias staging
qa assets list --platform ANDROID --channel checkout
qa assets download ./app-copy.apk --platform ANDROID --channel checkout --tag staging
```

Upload also accepts iOS simulator `.app` directories and device `.ipa` files.
It infers the platform and build target, packages simulator apps, and prints
JSON with the resolved tag. Omit `--tag` to generate an immutable tag.
Re-uploading the same tag and checksum skips the byte transfer. An alias moves
only after upload completion.

Download accepts `--tag latest` to select the newest build in the channel.
List filters match immutable tags or saved aliases, not `latest`.

List, download, and delete accept `--build-target`. The default for download and
delete is `universal` for Android or `simulator` for iOS. Pass
`--platform IOS --build-target device` to manage stored IPAs. Mo sessions cannot
run device builds. Platform values are `ANDROID` and `IOS`.

Delete only when the user asks, using the immutable tag rather than an alias:

```bash
qa assets delete --platform ANDROID --channel checkout --tag release-42 --yes
```

Deletion also removes aliases pointing to the tag. Upload, list, and delete
print JSON; download prints the local path. Use `qa upload --session-id` for
session fixtures, not app builds. Follow [Mobile bug bash](mobile-bug-bash.md)
to start QA with the selected build.
