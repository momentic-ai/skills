# Troubleshooting

## Page state and timing

- Wrong or stale page: inspect the latest screenshot or session state; retry
  state capture once if the page is settling.
- Slow readiness at one checkpoint: add the narrowest page, element, or AI check,
  or increase the existing check's timeout. Checks already retry; do not poll
  with JavaScript.
- Broadly slow targeting across the project: consider increasing
  `browser.smartWaitingTimeoutMs`. Do not use it to mask one slow assertion.
- Long jobs or uploads: check for a stable positive result with an appropriate
  timeout, not a sleep.
- Drifted session: rerun the required saved range with `resetSession: true`.

## Browser and host resource pressure

Retry or reset once after a browser, CDP, page-load, screenshot, or snapshot
timeout. If it persists or affects several browser tools, stop changing the
test. Do not hide resource pressure with waits, weaker assertions, cache flags,
or repeated browser calls.

Signals include an unresponsive page, document-tree or page-execution timeout,
empty HTML snapshot, browser or inspector crash, and `data-momentic-id` timeout.
A page-load timeout alone may instead indicate the app or network.

Inspect CPU, memory, and top processes with available host tools. Check the
browser, Momentic, app server, compiler/bundler, database, and unrelated
workloads. For completed runs, correlate with
`attempts/<n>/assets/resource-usage.ndjson` when present.

Report the error, step, URL, retry result, resource pressure, largest consumers,
and supported cause. If evidence cannot distinguish the host, app, services, or
Momentic, say so.

## Targeting and assertions

- Element absent: debug the prerequisite. Element visible but not found: use a
  stable description based on visible text, role, and nearby context.
- Fast wrong-element match: consider stale cache, then correct the description.
- In normal mode, errors that an element is hidden, disabled, detached, covered,
  moving, or outside the viewport originate in Playwright's actionability
  enforcement, which Momentic surfaces; they are not failures in Momentic's
  locator AI. Fix the page state or prerequisite. Use force only when bypassing
  actionability is part of the intended behavior.
- For controls that intentionally cannot satisfy Playwright actionability, such
  as some rich-text editors, `browser.visualActions: true` uses coordinate-based
  actions instead. It avoids those checks but also gives up their stability
  guarantees. See [Visual actions](https://momentic.ai/docs/configuration/browser#browser-visualactions).
- Use quoted text only when the exact text must appear; otherwise describe
  meaning. Make assertions concrete about region, object, count, or state.
- Use `assertVisually` when the condition is visual and fully inside the
  current viewport, e.g. an event block sitting in the 11:30-12:00 row of a
  calendar grid, or a detail inside a video frame or canvas drawing. Scroll the
  target into view if necessary before calling it; otherwise use `assert`.
- Assert stable final state with step assertions. For brief toasts or
  change-over-time comparisons, use video-backed
  [run assertions](https://momentic.ai/docs/core-concepts/writing-assertions#run-assertions).

## Format and data

- V2 load failure: lint the file and check relative references.
- Module failure: re-check parameters, defaults, enums, and input expressions.
- Missing env value: verify the producing save and `env.X` versus
  `{{ env.X }}` at the consumer.
- JavaScript failure: verify Node versus Browser context.

After about three attempts at the same failure, stop and ask the user for
direction.
