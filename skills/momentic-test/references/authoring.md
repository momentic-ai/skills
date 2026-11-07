# Project files and formats

Tests use `*.test.yaml`; reusable modules use `*.module.yaml`. Test IDs live in
the test file's `id` field. Check `momentic.config.yaml` and test-level metadata
before assuming project defaults apply.

`fileType: momentic/test/v2` and `fileType: momentic/module/v2` identify v2
files. Treat missing or different `fileType` as deprecated v1. Never edit v1
YAML directly; persist changes through `momentic_test_splice_steps`.

A v2 test selects its environment with `defaultEnv`, and `--env <name>`
overrides it. There is no fallback to the only environment in the config. The
base URL comes from `--url-override`, then the test's own `url`, then
`env.BASE_URL`, so a test that sets `url` keeps it in every environment. With
no base URL the run fails: "Cannot run test with no base URL and no BASE_URL
variable defined in its environment".

V2 can reference modules, JavaScript, and auth state with relative paths. Paths
resolve from the YAML file containing the reference. Use `./...` or `../...`,
never absolute paths or `~`. Before moving, renaming, or deleting a referenced
file, grep its path and update or remove every reference. Do not add internal or
generated fields to v2 YAML.

## AI Action V3

AI Action V3 takes a natural-language goal and determines the browser steps.

- **Cached by default:** save and replay a successful flow, self-healing failed
  replay steps. Use for repeatable flows.
- **Uncached:** run the agent fresh each time. Set `cache: false` in v2 or use
  `--disable-cache` with `AI_ACTION_DYNAMIC`. Prefer this for chats, agentic
  workflows, exploratory tests, and other dynamic or nondeterministic behavior.

Treat "make sure you can do X" as goal-based testing unless the user specifies a
route. Use granular steps when controls, intermediate assertions,
deterministic replay, or a risky side effect needs individual control. Keep
existing granular tests granular unless asked to change strategy.

### Time-sensitive interactions

For rapid sequences such as back-to-back sends or interrupting during startup,
prefer one focused AI Action with explicit ordering and instructions not to wait
between interactions. Separate targeting steps can outlast the window being
tested. Keep prerequisite setup and stable final checks outside that action;
pair it with video-backed run assertions for transient UI states.

AI Action does not guarantee timing. Inspect action timestamps and recorded
evidence to verify the intended state was actually exercised. A successful final
result, or an assertion that infers a transient state without observing it, is
not proof of coverage. If the exact race window matters and cannot be reliably
exercised, use deterministic tests or controlled test fixtures rather than
claiming coverage from a passing end state.

# Test execution behavior

## Cache and memory

Momentic caches resolved selectors, text, coordinates, and other metadata so
most runs avoid repeated AI calls. AI assertions may also reuse past-result
memory. Stale cache or memory can explain a fast wrong-element match or a
repeated borderline verdict.

Cache is scoped by git metadata, including branch. Protected branches read cache
but do not write it unless `--save-cache` is used or `CI` is set.

- Change a granular step description when its intent changes. Do not add `DANGEROUS_FORCE_DYNAMIC` or `--disable-cache` to locator steps unless asked, or unless a proven bad cache persists after clarifying the description and fixing timing.
- Reword an assertion when old memory no longer matches its intended condition.
- For AI Action V3 cache behavior, see [AI Action V3](#ai-action-v3).

## Readiness and timing

Smart waiting runs before targeting steps and defaults to five seconds. Within
that window, do not add sleeps. For longer or semantic readiness, wait for a URL
or use a page, element, or AI check that describes the required positive state.
Checks retry until their timeout; increase that timeout instead of polling the
UI with JavaScript. See the
[browser configuration](https://momentic.ai/docs/configuration/browser) for
project-wide timing settings.

## Test context

Each run has a test-scoped `env` that persists across steps and modules.

- In v2, save returned values with `saveAs`; in MCP step strings, use
  `--env-key`. Use `setVariable(name, value)` in JavaScript when saving several
  values.
- Use `env.NAME` in JavaScript and module input expressions. Use
  `{{ env.NAME }}` in string fields, but not inside JavaScript source.

## JavaScript

Use native click, type, hover, wait, and check steps for browser behavior. They
retain Momentic's smart waiting, cache, traces, and retries. Do not use browser
JavaScript to click or type, and do not poll the UI when a check can retry until
its timeout.

Use Node JavaScript for test setup, data generation, APIs, databases,
OTP/email/SMS, and Momentic helpers. Use Browser JavaScript to access
`window`, `document`, client-side state, or inject page scripts when no native
step expresses the operation. Keep one-off code short and follow nearby project
conventions for reusable v2 scripts. See the
[JavaScript guide](https://momentic.ai/docs/integrations/javascript) for runtime
APIs and timeout details.

Playwright `evaluate` callbacks run in the browser and cannot close over Node
values. Pass values as callback arguments or use `customWindow._momentic`.

# Working with v2 YAML

V2 is human-editable. Tests use `before`, `steps`, and `after`; modules use
`steps`. Each step has one command key, with options nested beneath it. Durations
are milliseconds, and step IDs are not stored in YAML.

If syntax is unclear, consult
the generated v2 format reference at
`infra/scripts/v2-json-schema/build/v2-format-reference.md` when working in the
Momentic monorepo, or https://static.momentic.ai/v2-format-reference.md in an
installed skill. `momentic app` and `momentic run` lint automatically.

`momentic_test_get` reads persisted state; it does not refresh an active session.

## Choose steps

- Prefer natural-language targets. Use selectors or coordinates only when the
  AI cannot see the target or the user requires selector-level precision.
- Do not add initial navigation; a session starts at the test's base URL.
- Keep assertions minimal and user-driven. After navigation or a material state
  change, validate the contract before dependent actions.
- Prefer `waitForUrl` for URL contracts, page/element checks for stable text or
  structure, and AI assertions for semantic visual state.
- Prefer AI Action V3 for new tests. Use granular steps when checkpoints need
  individual control; for rapid sequences, read [Time-sensitive interactions](#time-sensitive-interactions).
- Do not add optional or default-valued fields unless correctness requires them.
- Keep changes narrow. Preserve unrelated values, comments, ordering, and step
  style. Do not weaken a test to hide a broken app or service.
