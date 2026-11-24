# Momentic agent skills

## Mo install paths

- `qa skills` and generic `skills add` install CLI-first `mo-qa` without MCP
  configuration.
- The full coding-agent plugin bundles the CLI-first `mo-qa` skill, the `qa mcp`
  bridge with saved CLI login, and local authoring servers.
- Hosted-only Claude and OpenAI packages use the hosted-MCP skill and HTTP
  OAuth. ChatGPT and Claude.ai use hosted MCP directly.

Use the interface the user requested. For shell-capable clients, default to `qa`
when it can reach the target. Reuse a hosted connection when it is already
authenticated and supports the task. For clients without CLI access, use direct
HTTP OAuth to `https://mcp.momentic.ai`. See
[CLI setup](#install-skills-without-the-plugin) for commands and
[CLI bridge](#cli-bridge) for upgrade choices.

## Install the plugin

### Claude Code

Add the catalog and install Momentic:

```text
/plugin marketplace add momentic-ai/skills
/plugin install momentic@momentic
```

In Claude Code, the plugin and `install-mcp` are alternatives. Running both
duplicates MCP servers.

The local servers use the API key configured for the plugin, then an inherited
`MOMENTIC_API_KEY`, then the saved CLI login. The API key setting is optional;
leave it blank when the saved CLI login is available.

The plugin also supplies skills. Decline the CLI's skills prompt, or use
`npx momentic init --config-only` (`npx momentic-mobile init --config-only` for
mobile). Do not run `skills` alongside the plugin.

#### Download and check the latest CLIs

Run these commands outside the agent to download and check the latest CLI
packages:

```bash
npx -y qa@latest --version
npx -y momentic@latest --version
npx -y momentic-mobile@latest --version
```

The plugin's MCP servers use the selectors in their manifests. They may download
their configured packages separately at startup, so these commands do not
guarantee that those packages are cached.

A cold `npx` install can exceed Claude Code's default 30-second `MCP_TIMEOUT`
before the CLI process starts.

Claude Code can start its first turn while plugin MCP servers are still
connecting. To wait for connections before that turn, start Claude Code with:

```bash
MCP_CONNECTION_NONBLOCKING=0 MCP_CONNECT_TIMEOUT_MS=30000 claude
```

This waits up to 30 seconds before the first query without increasing the
individual server startup timeout. See Claude Code's
[MCP connection settings](https://code.claude.com/docs/en/env-vars).

### Cursor

Momentic is not yet listed in the Cursor Marketplace. Install MCP and skills
with the CLI for your product. For browser tests:

```bash
npx -y qa login
npx momentic install-mcp --yes --client cursor
npx momentic skills --yes --target cursor
```

For mobile tests, replace `momentic` with `momentic-mobile`. `cursor-agent`
cannot install plugins. In Cursor Agent,
[enable the MCP servers and sign in](https://momentic.ai/docs/coding-agents/mcp-server)
after setup.

### Gemini CLI

Install the extension from the public repository:

```bash
gemini extensions install https://github.com/momentic-ai/skills
```

The extension loads the CLI-first Mo skill and starts `momentic-hosted` with
`qa mcp`. See [CLI bridge](#cli-bridge) for login and upgrade choices. For local
test authoring, configure your product's local MCP server with the
[CLI setup](#install-skills-without-the-plugin).

### Codex

Register the marketplace from your terminal:

```bash
codex plugin marketplace add momentic-ai/skills
codex plugin add momentic@momentic
```

Start a new session before using its skills or MCP servers. See
[Codex plugins](https://developers.openai.com/codex/plugins/) and
[marketplace setup](https://developers.openai.com/plugins/build/plugins#add-a-marketplace-from-the-cli)
for the supported commands and legacy marketplace format.

To download and check the latest CLI packages, follow the
[latest CLI steps](#download-and-check-the-latest-clis).

Start Codex from your project directory. The plugin's local MCP servers use that
directory to find `momentic.config.yaml`; you don't need `install-mcp` alongside
the plugin.

The hosted-only OpenAI listing package uses the portable Agent Plugins format
and is assembled separately from this marketplace plugin.

### Devin

Install the Momentic plugin from this repository.

The plugin bundles the repository-test skills, CLI-first `mo-qa`, the local
`momentic` and `momentic-mobile` MCP servers, and `momentic-hosted` through the
`qa mcp` bridge. The bridge uses the saved CLI login. Load `mo-qa` to start and
follow sessions.

A local server without a matching project stays connected. Its tools explain
which product's project is missing. The unused product's local server still
downloads on first start.

## CLI bridge

The bridge reads the saved CLI login for its configured server from the same
machine and OS user that starts it. A workstation login does not authenticate a
remote MCP process. Client HTTP OAuth is separate; it is not transferred to the
CLI login.

If the bridge runtime has no saved CLI login, or `qa mcp` asks you to sign in
again, run `qa login` there, or `npx -y qa login` for an npm install. For a
custom server, pass the same `--server <bridge-server>` to `qa login` and
`qa mcp`. See the
[server selection reference](https://momentic.ai/docs/cli-reference/mo/commands/mcp).

After upgrading from the bundled HTTP connection, choose one route:

1. Keep the bridge. If sign-in is required, run the login steps above, then
   restart it. A remote agent such as Devin needs its own CLI login.
2. Keep client OAuth. Disable the plugin's `momentic-hosted` bridge entry. If
   your client cannot disable one plugin server, disable the full plugin and
   follow
   [standalone authoring and skills setup](#install-skills-without-the-plugin).
   After setup, keep exactly one Momentic hosted connection. Replace any
   `install-mcp`-generated `qa mcp` stdio entries, regardless of server name,
   with one direct HTTP OAuth connection to `https://mcp.momentic.ai`. If
   `install-mcp` preserved an existing HTTP entry for Momentic, keep it. Remove
   only duplicate Momentic entries; leave unrelated MCP servers, local authoring
   servers, and installed skills untouched. Reuse its OAuth session if retained;
   otherwise reconnect.

Do not leave both routes enabled. For a standalone bridge, configure a stdio
server. Replace `npx -y qa mcp` with `qa mcp` for a standalone CLI install. For
Claude Code:

```bash
claude mcp add --transport stdio momentic-hosted -- npx -y qa mcp
```

For Codex:

```bash
codex mcp add momentic-hosted -- npx -y qa mcp
```

For other agents, configure a stdio server running `npx -y qa mcp`.

## Complete setup for your product

Restart your coding agent after installation. Configure only the product you
intend to use; the plugin includes all products.

Direct HTTP OAuth authenticates only the hosted connection. Local authoring
servers use a saved CLI login or `MOMENTIC_API_KEY`; reuse existing local
credentials, or authenticate those tools if none are configured. The `qa mcp`
bridge needs a saved CLI login in its runtime; see [CLI bridge](#cli-bridge).

### Browser tests

1. Install `momentic` in your project and initialize it with
   `npx momentic init --yes --config-only` if there is no
   `momentic.config.yaml`. For a sample test, use the
   [web quickstart](https://momentic.ai/docs/quickstart/web).
2. Run `npx -y qa login`, or set an API key: in Claude Code, select Momentic on
   the Installed tab in `/plugin` and choose Configure; in other agents, provide
   `MOMENTIC_API_KEY` to the local MCP process. After `login`, confirm
   `npx momentic whoami` reports the intended organization.
3. Check the local `momentic` server's config path and working directory, then
   call its `momentic_get_artifacts` tool and check the project artifacts.
4. Call `momentic_search_docs` on your configured authenticated Momentic hosted
   connection, then load `momentic-test` to write and validate your first test.

### Mobile tests

1. Install `momentic-mobile` and run
   `npx momentic-mobile init --yes --config-only` if the project has no config.
   Follow the [Android](https://momentic.ai/docs/quickstart/android) or
   [iOS](https://momentic.ai/docs/quickstart/ios) quickstart for device and app
   setup.
2. Run `npx -y qa login`, or set an API key: in Claude Code, select Momentic on
   the Installed tab in `/plugin` and choose Configure; in other agents, provide
   `MOMENTIC_API_KEY` to the local MCP process. After `login`, confirm
   `npx momentic-mobile whoami` reports the intended organization.
3. Check the local `momentic-mobile` server's config path and working directory,
   then call its `momentic_get_artifacts` tool and check the project artifacts.
4. Call `momentic_search_docs` on your configured authenticated Momentic hosted
   connection, then load `momentic-test` to write and validate your first test.

### Mo sessions

For package and connection choices, see [Mo install paths](#mo-install-paths).
See the [MCP setup guide](https://momentic.ai/docs/coding-agents/mcp-server) for
server setup.

For a hosted session, call `momentic_mo_list_sessions` through the configured
hosted MCP connection to check it without starting paid work. Hosted private web
targets need an online Connector. If none can reach the target and the user did
not request hosted tools, use the CLI tunnel when its host can reach it. If the
user requested hosted tools, report the access limit before switching
interfaces. Report a blocker if neither route can reach the target.

If the requested interface needs an MCP connection that is not configured,
follow the [MCP setup guide](https://momentic.ai/docs/coding-agents/mcp-server).

## Install skills without the plugin

Use the browser, mobile, or Mo CLI for only the product you need. For browser
tests:

```bash
npx momentic skills
npx momentic install-mcp
```

For mobile tests:

```bash
npx momentic-mobile skills
npx momentic-mobile install-mcp
```

For the `qa mcp` bridge, run `npx -y qa login` once if no saved CLI login
exists. If you use direct HTTP OAuth instead, no new CLI login is needed; after
setup, keep or replace one Momentic hosted connection as described in
[CLI bridge](#cli-bridge). For local authoring credentials, see the
[standalone MCP environment setup](https://momentic.ai/docs/coding-agents/mcp-server#setup-instructions).

For Mo, install only `mo-qa`:

```bash
npx -y qa skills --target claude-code
```

`momentic` and `momentic-mobile` install identical `momentic-test`,
`momentic-maintain`, and `momentic-spec` bundles, including web and mobile
references. Either CLI updates the same skills and pointer block. `qa` installs
only `mo-qa`.

Use `--target codex` for Codex. Without `--target`, each skills command asks
which coding agents to configure; `--yes` selects detected agents without a
prompt. For standalone Mo setup, run `qa login` or `npx -y qa login` only if no
saved CLI login exists, then invoke `/mo-qa`. For package and connection
choices, see [Mo install paths](#mo-install-paths).

## Choose a path

| Task                                       | Use                                                                                                |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Mo bug bash in a coding agent              | CLI-first Mo skill; see [Mo install paths](#mo-install-paths)                                      |
| Localhost or private-target QA             | `qa` CLI tunnel, or an existing Connector for hosted sessions                                      |
| Mobile bug bash through the CLI            | `mo-qa` and the `qa` CLI                                                                           |
| Mobile app build upload or download        | `qa assets` with the [mobile build docs](https://momentic.ai/docs/mo/cli#manage-mobile-app-builds) |
| Write or maintain repository browser tests | `momentic-test` and the local `momentic` MCP                                                       |
| Write or maintain repository mobile tests  | `momentic-test` and the local `momentic-mobile` MCP                                                |
| ChatGPT or Claude.ai                       | The hosted connector at `https://mcp.momentic.ai`                                                  |

See the
[local MCP server guide](https://momentic.ai/docs/coding-agents/mcp-server) for
setup. Hosted Mo uses Connectors for private web targets; it does not provide
local file tools.

Keep an existing connection when it supports the task. Do not authenticate a
second connection or start another paid session after uncertain delivery without
checking the original session.

## Hosted connector

ChatGPT and Claude.ai use Momentic OAuth and hosted tools directly; they do not
install a coding-agent skill. For coding-agent choices, see
[Mo install paths](#mo-install-paths). Keep credentials out of chat and uploads;
use a Momentic environment or session-page secrets instead.

See the [hosted connector guide](https://momentic.ai/docs/mo/chatgpt-and-claude)
for connection setup, files, findings, and retests.

## Skills

| Skill                                                  | Description                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| [momentic-test](skills/momentic-test/SKILL.md)         | Create, run, and maintain Momentic browser, Android, and iOS tests. |
| [momentic-maintain](skills/momentic-maintain/SKILL.md) | Diagnose failures and repair quarantined tests.                     |
| [mo-qa](skills/mo-qa/SKILL.md)                         | Run Mo QA through the CLI and its saved-login MCP bridge.           |
| [momentic-spec](skills/momentic-spec/SKILL.md)         | Improve code correctness with Momentic specs.                       |

## Sources

The CLI-first Mo skill source is `.agents/skills/mo-qa/`. The sync job sends it
to the root public `skills/mo-qa/` path for coding-agent bundles. The
hosted-only skill at `plugins/skills/mo-qa/` remains the source for the Claude
and OpenAI packages. Edit these sources in the Momentic monorepo, not in this
public mirror. Others should open an issue instead of a pull request.
