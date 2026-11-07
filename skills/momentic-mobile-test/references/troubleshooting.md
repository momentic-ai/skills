# Troubleshooting

## Device state and timing

- Wrong or stale screen: inspect the latest screenshot or emulator state; retry
  state capture once if the app is settling.
- Slow readiness at one checkpoint: add the narrowest element, screen, or AI
  check, or increase the existing check's timeout. Checks already retry; do not
  poll with JavaScript.
- Broadly slow targeting across the project: consider increasing
  `emulator.smartWaitingTimeoutMs`. Do not use it to mask one slow assertion.
- Long jobs or uploads: check for a stable positive result with an appropriate
  timeout, not a sleep.
- Permission dialog or system sheet: handle it explicitly before continuing.
- Drifted session: rerun the required saved range with `resetSession: true`.

## Infrastructure and app health

- Treat WDA, Appium, adb, emulator bootstrap or death, provider connectivity,
  lost webview context, and repeated device-state capture failures as
  infrastructure or app-environment signals. Run `npx momentic-mobile doctor`,
  inspect logs and device health, and retry from a clean session before editing
  the test.
- If the app never becomes idle, continuous animation, video, or background UI
  work can block iOS accessibility snapshots. Prefer a test-mode switch that
  disables it; longer waits do not make a permanently busy app idle.
- Do not weaken assertions or inflate step timeouts to hide infrastructure
  failures. Report the failing subsystem and supporting evidence separately
  from test logic.

## Targeting and assertions

- Element absent: debug the prerequisite or scroll state. Element visible but
  not found: use visible text, role/name, and nearby context.
- Fast wrong-target action: consider stale cache, then correct the description.
- Use coordinate targets only when semantic targeting is unavailable. MCP
  fractions use `0..1`; v2 YAML uses percentages from `0..100`.
- Use `SCROLL_TO` when searching for a target. Use manual `SWIPE` only when no
  target exists or scrolling is not appropriate.
- Quoted text is literal. Quote only when the exact text must appear; otherwise
  describe meaning.
- Make assertions concrete about region, object, count, or state. Visual-only
  checks cannot inspect offscreen content or hierarchy.
- AI checks retry instantaneous snapshots until timeout. Prefer stable final
  state; use deterministic element or screen checks when they express the
  contract. See
  [Writing assertions](https://momentic.ai/docs/core-concepts/writing-assertions).

## Format and data

- V2 load failure: lint the file and check platform and relative references.
- Module failure: re-check parameters, defaults, enums, and input expressions.
- Missing env value: verify the producing save and `env.X` versus
  `{{ env.X }}` at the consumer.
- App launch/install issue: inspect test settings, channels/tags, installed-apps
  artifacts, and whether the session is remote or local.

After about three attempts at the same failure, stop and ask the user for
direction.
