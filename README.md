# Momentic agent skills

Use one Momentic coding-agent plugin for browser and mobile test authoring,
maintenance, and Mo bug bashes.

For a single product, use the [CLI setup](#install-skills-without-the-plugin).
The plugin includes both local MCP servers and the hosted server at
`https://mcp.momentic.ai`. Sign in to the hosted server with your agent's OAuth
flow. Existing OAuth connections keep working after plugin updates.

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
npx -y momentic@3.73.0 --version
npx -y momentic-mobile@1.46.0 --version
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

To use `qa mcp` instead of the plugin's hosted URL:

1. Disable the plugin's hosted MCP entry before adding the bridge. If your agent
   cannot disable one plugin server, use the
   [CLI setup](#install-skills-without-the-plugin) instead of the plugin. Keep
   only one hosted connection enabled.
2. Run `npx -y qa login` where the agent launches MCP, under the same OS user. A
   workstation-only login does not authenticate a remote MCP process.
3. Add `momentic-hosted` as a stdio server. For Claude Code:

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

1. After installing the plugin, restart the agent. Call
   `momentic_mo_list_sessions` on `momentic-hosted` to check the connection
   without starting paid work.
2. Load `mo-qa` with your target and brief. Use hosted tools for web or mobile,
   including private web targets with an existing Connector.
3. If you need a new tunnel, install `qa`, run `npx -y qa login` and
   `qa whoami`, then follow the skill's tunnel steps. You do not need either
   local test-authoring MCP server for Mo.

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
prompt. For Mo, follow the login and server steps in
[CLI bridge setup](#opt-into-the-cli-bridge). Claude.ai and ChatGPT connectors
still use `https://mcp.momentic.ai` with OAuth. Mo uses hosted tools by default,
including private web targets with an existing Connector. Use the `qa` CLI to
create a tunnel or when the user requests it. If a requested hosted session is
blocked, report the blocker rather than switching to the CLI.

## Choose a path

| Task                                       | Use                                                                                      |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Exploratory Mo bug bash or PR testing      | `mo-qa` with the hosted `momentic-hosted` server                                         |
| Localhost or private-target QA             | `mo-qa` with an existing Connector or a new CLI tunnel                                   |
| Mobile app build upload or download        | `qa assets` with the [mobile builds reference](skills/mo-qa/references/mobile-builds.md) |
| Write or maintain repository browser tests | `momentic-test` and the local `momentic` MCP                                             |
| Write or maintain repository mobile tests  | `momentic-test` and the local `momentic-mobile` MCP                                      |
| ChatGPT or Claude.ai                       | The hosted connector at `https://mcp.momentic.ai`                                        |

See the
[local MCP server guide](https://momentic.ai/docs/coding-agents/mcp-server) for
setup. Hosted Mo uses Connectors for private web targets; it does not provide
local file tools.

Keep an existing connection when it supports the task. Do not authenticate a
second connection or start another paid session after uncertain delivery without
checking the original session.

## Hosted connector

Plugins and URL-only connectors in Claude.ai and ChatGPT use Momentic OAuth. The
opt-in `qa mcp` bridge uses the shared CLI login. Keep credentials out of chat
and uploads; use a Momentic environment or session-page secrets instead.

See the [hosted connector guide](https://momentic.ai/docs/mo/chatgpt-and-claude)
for connection setup, files, findings, and retests.

## Skills

| Skill                                                  | Description                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| [momentic-test](skills/momentic-test/SKILL.md)         | Create, run, and maintain Momentic browser, Android, and iOS tests. |
| [momentic-maintain](skills/momentic-maintain/SKILL.md) | Diagnose failures and repair quarantined tests.                     |
| [mo-qa](skills/mo-qa/SKILL.md)                         | Run Mo QA and manage app builds with `qa assets`.                   |
| [momentic-spec](skills/momentic-spec/SKILL.md)         | Improve code correctness with Momentic specs.                       |

## Sources

The plugin manifests, marketplace catalogs, and skills are synced from upstream
sources. Momentic contributors should edit them upstream. Others should open an
issue instead of a pull request.
