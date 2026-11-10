# Troubleshoot browser tests

## Restore page state

Inspect the latest screenshot or state and retry capture once if the page is
settling. For a drifted session, rerun the required saved range with
`resetSession: true`.
Read [Readiness](authoring.md#wait-for-readiness) when the page loads slowly.

## Check host health

After a browser, page-load, screenshot, or snapshot timeout, retry or reset once.
For persistent failures, inspect CPU, memory, and top processes, including the
browser, Momentic, app, compiler, database, and unrelated workloads.
For saved runs, correlate `attempts/<n>/assets/resource-usage.ndjson`.

Report the error, step, URL, retry result, resource pressure, and supported
cause. Say when evidence can't distinguish host, app, network, or Momentic
failures; fix that cause rather than changing assertions.

## Correct targets and assertions

For absent elements, check prerequisites. For visible elements, use text, role,
and nearby context. Restore hidden, covered, disabled, moving, or offscreen
targets before retrying; force interaction only when the test requires it.
Read [Cache](authoring.md#correct-cache-or-assertion-memory) for fast wrong matches.

Read [Visual actions](https://momentic.ai/docs/configuration/browser#browser-visualactions)
when a control needs coordinate actions, before enabling `browser.visualActions`.

Quote exact text only when required. Specify the region, object, count, or state.
Use `assertVisually` for conditions fully visible in the viewport, scrolling
them into view first; otherwise use `assert`.
Use [run assertions](https://momentic.ai/docs/core-concepts/writing-assertions#run-assertions)
when checking toasts or changes over time.

## Check format and data

Lint v2 and check relative references. For module failures, inspect parameters,
defaults, enums, and input expressions.
For missing variables or JavaScript failures, read
[Variables and JavaScript](authoring.md#use-variables-and-javascript) and check
the producing step and execution runtime.
