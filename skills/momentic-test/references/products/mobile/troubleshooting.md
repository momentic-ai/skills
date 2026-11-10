# Troubleshoot Android and iOS tests

## Restore device state

Inspect the latest screenshot or emulator state; retry capture once while the
app settles. Handle permission dialogs and system sheets explicitly.
For a drifted session, rerun the required saved range with `resetSession: true`.
Read [Readiness](authoring.md#wait-and-enter-text) when interactions are slow.

## Check device and app health

Run `npx momentic-mobile doctor` for startup, connectivity, WebView, or
repeated capture failures. Inspect logs and retry a clean session before editing
the test. A WebSocket warning alone doesn't establish remote-device failure;
check device and API connectivity.

If `ANDROID_HOME` is missing, forward the SDK/Java environment variables to the
mobile MCP server and restart it. Forward names through the client's environment
configuration rather than copying secret values.

For iOS apps that never become idle, disable continuous animation, video, or
background UI work through a test-mode switch.
Report infrastructure failures with evidence rather than weakening test checks.

## Correct targets and assertions

For absent elements, check prerequisites and scroll state. For visible elements,
use text, role/name, and nearby context.
Read [Cache](authoring.md#correct-cache-or-assertion-memory) for fast wrong matches.

Use `SCROLL_TO` to find content; use `SWIPE` for a gesture without a target.
Read [Choose steps](authoring.md#choose-steps) when semantic targets aren't available.

Quote text only when it must match literally. Name the region, object, count,
or state. Check stable final state; visual-only checks require visible content
and can't inspect hierarchy or offscreen elements.
Read [Writing assertions](https://momentic.ai/docs/core-concepts/writing-assertions)
when choosing a check.

## Check format and data

Lint v2 and check platform and relative references.
Inspect module parameters, defaults, enums, and expressions.
Read [Variables](authoring.md#use-variables-and-javascript) when a value is missing.
For install/launch failures, inspect test app settings, channel/tag,
installed-app artifacts, and local versus remote device selection.
