# Momentic agent skills

The full Momentic marketplace plugin includes repository-authoring skills, local
MCP servers, a hosted OAuth entry, and the separate MCP-only `mo-qa` skill. That
skill uses hosted MCP even in Claude Code or Codex. `qa skills` installs a
different, CLI-only `mo-qa`; its Mo flows use `qa login` and do not need MCP.
Choose one `/mo-qa` variant for a workflow. Do not install the full plugin only
to get hosted tools when you use the CLI skill. ChatGPT and Claude.ai connectors
call hosted MCP directly without installing a skill. Hosted-only Claude and
OpenAI plugins bundle the MCP-only skill and do not need the QA CLI.

For a single product, use the [CLI setup](#install-skills-without-the-plugin).
Existing OAuth connections keep working after plugin updates.

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
`MOMENTIC_API_KEY`, then the saved CLI login.

The plugin also supplies skills. Decline the CLI's skills prompt, or use
`npx momentic init --config-only` (`npx momentic-mobile init --config-only` for
mobile). Do not run `skills` alongside the plugin.

Before your first session, download the local CLIs outside Claude Code:

```bash
npx -y momentic@3.74.2 --version
npx -y momentic-mobile@1.47.1 --version
```

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

The extension loads the skills and the hosted `momentic-hosted` URL with OAuth.
For local test authoring, also configure your product's local MCP server with
the [CLI setup](#install-skills-without-the-plugin).

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

Start Codex from your project directory. The plugin's local MCP servers use that
directory to find `momentic.config.yaml`; you don't need `install-mcp` alongside
the plugin.

The hosted-only OpenAI listing package uses the portable Agent Plugins format
and is assembled separately from this marketplace plugin.

### Devin

Install the Momentic plugin from this repository.

The plugin bundles the repository-test skills, `mo-qa`, the local `momentic` and
`momentic-mobile` MCP servers, and the hosted `momentic-hosted` URL with OAuth.
Load `mo-qa` to start and follow sessions.

A local server without a matching project stays connected. Its tools explain
which product's project is missing. The unused product's local server still
downloads on first start.

## Opt into the CLI bridge

The optional `qa mcp` stdio bridge provides hosted MCP tools for local MCP-only
operations. It is not used by CLI Mo sessions. The bridge reuses the saved `qa`
login for the same machine, OS user, and server. A valid login does not need to
be repeated. To use the bridge instead of the plugin's hosted URL:

1. Disable the plugin's hosted MCP entry before adding the bridge. If your agent
   cannot disable one plugin server, use the
   [CLI setup](#install-skills-without-the-plugin) instead of the plugin. Keep
   only one hosted connection enabled.
2. Run the install-appropriate login command only if no saved login exists or
   the bridge explicitly asks you to sign in again: `npx -y qa login` for an npm
   install, or `qa login` for a standalone install. Run it under the same OS
   user that launches MCP. A workstation-only login does not authenticate a
   remote MCP process.
3. Add `momentic-hosted` as a stdio server. For Claude Code:

   For a standalone install, replace `npx -y qa mcp` with `qa mcp` in each
   command below.

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
4. Call `momentic_search_docs` on `momentic-hosted`, then load `momentic-test`
   to write and validate your first test.

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
4. Call `momentic_search_docs` on `momentic-hosted`, then load `momentic-test`
   to write and validate your first test.

### Mo sessions

`qa skills` installs the CLI-only `mo-qa`; its Mo flows use `qa login` and do
not need MCP. The full Momentic marketplace plugin ships a separate MCP-only
`mo-qa`, even in Claude Code or Codex. The full plugin and standalone CLI skill
both provide `/mo-qa`, so installing them for the same agent and project is
unsupported. Use the plugin's MCP-only `mo-qa` when you use it. For CLI Mo with
repository-authoring skills, disable or remove the full plugin for that agent
and project, then follow the
[standalone authoring setup](https://momentic.ai/docs/coding-agents/building-with-ai#install-the-tools-yourself).
The full bundle still includes repository-authoring skills and local MCP
servers.

ChatGPT and Claude.ai connectors call hosted MCP directly without installing a
skill. Hosted-only Claude and OpenAI plugins bundle the MCP-only skill and do
not need the QA CLI. The full marketplace plugin is for its repository-authoring
skills and local servers; do not install it only to get hosted Mo tools when you
use the CLI skill. For local MCP-only operations, the optional `qa mcp` bridge
reuses a valid saved CLI login on the same machine, OS user, and server. See the
[MCP setup guide](https://momentic.ai/docs/coding-agents/mcp-server).

For a hosted session, call `momentic_mo_list_sessions` through the configured
hosted MCP connection to check it without starting paid work. Hosted private web
targets need an existing online Connector. If none is online, ask for a public
target or ask the user to prepare a Connector using the
[tunneling guide](https://momentic.ai/docs/mo/tunneling).

If a local or hosted connection is missing, follow the
[MCP setup guide](https://momentic.ai/docs/coding-agents/mcp-server).

## Install skills without the plugin

Use the browser, mobile, or Mo CLI for only the product you need. For browser
tests:

```bash
npx momentic skills
npx -y qa login
npx momentic install-mcp
```

For mobile tests:

```bash
npx momentic-mobile skills
npx -y qa login
npx momentic-mobile install-mcp
```

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
prompt. For the CLI-only Mo skill, use `qa login` for a standalone install or
`npx -y qa login` for an npm install, then invoke `/mo-qa`. The marketplace and
hosted-only plugin skills are separate MCP-only distributions, even in Claude
Code and Codex. For local MCP-only operations, use the optional `qa mcp` bridge
with the valid saved CLI login. Do not install both `/mo-qa` variants for one
workflow.

## Choose a path

| Task                                       | Use                                                                                                |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Mo bug bash in a coding agent              | CLI-only `mo-qa` from `qa skills` or MCP-only plugin `mo-qa`                                       |
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

ChatGPT and Claude.ai connectors use Momentic OAuth and hosted tools directly;
they do not install a coding-agent skill. Hosted-only Claude and OpenAI plugins
bundle the MCP-only Mo skill and do not require the full marketplace plugin, QA
CLI, or `qa mcp` bridge. The full marketplace plugin is a separate distribution
with local authoring skills and servers plus a hosted OAuth entry; its `mo-qa`
skill is MCP-only. The optional `qa mcp` bridge reuses the saved CLI login for
local MCP-only operations. Disable the plugin's hosted entry before adding the
bridge to avoid duplicate OAuth entries. Keep credentials out of chat and
uploads; use a Momentic environment or session-page secrets instead.

See the [hosted connector guide](https://momentic.ai/docs/mo/chatgpt-and-claude)
for connection setup, files, findings, and retests.

## Skills

| Skill                                                  | Description                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| [momentic-test](skills/momentic-test/SKILL.md)         | Create, run, and maintain Momentic browser, Android, and iOS tests. |
| [momentic-maintain](skills/momentic-maintain/SKILL.md) | Diagnose failures and repair quarantined tests.                     |
| [mo-qa](skills/mo-qa/SKILL.md)                         | Run hosted Mo QA through MCP.                                       |
| [momentic-spec](skills/momentic-spec/SKILL.md)         | Improve code correctness with Momentic specs.                       |

## Sources

The canonical CLI-only Mo skill at `.agents/skills/mo-qa/` and MCP plugin skill
at `plugins/skills/mo-qa/` live in the Momentic monorepo. Edit those sources
upstream, not in this public mirror. Others should open an issue instead of a
pull request.
