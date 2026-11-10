# Momentic agent skills

Use one Momentic coding-agent plugin for browser and mobile test authoring,
maintenance, and Mo bug bashes.

For a single product, use the [CLI setup](#install-skills-without-the-plugin).
The plugin includes both local MCP servers and the hosted server.

## Install the plugin

### Claude Code

Add the catalog and install Momentic:

```text
/plugin marketplace add momentic-ai/skills
/plugin install momentic@momentic
```

In Claude Code, the plugin and `install-mcp` are alternatives. Running both
duplicates MCP servers.

The plugin also supplies skills. Decline the CLI's skills prompt, or use
`npx momentic init --config-only` (`npx momentic-mobile init --config-only` for
mobile). Do not run `skills` alongside the plugin.

Before your first session, finish both CLI downloads outside Claude Code:

```bash
npx -y momentic --version
npx -y momentic-mobile --version
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

The extension loads the skills and the hosted `momentic-hosted` MCP server. Sign
in with Momentic OAuth when prompted. For local test authoring, also configure
your product's local MCP server with the
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

Start Codex from your project directory. The plugin's local MCP servers use that
directory to find `momentic.config.yaml`; you don't need `install-mcp` alongside
the plugin.

The hosted-only OpenAI listing package uses the portable Agent Plugins format
and is assembled separately from this marketplace plugin.

### Devin

Install the Momentic plugin from this repository.

The plugin bundles the repository-test skills, `mo-qa`, the local `momentic` and
`momentic-mobile` MCP servers, and the hosted `momentic-hosted` MCP server at
`https://mcp.momentic.ai`. `mo-qa` uses hosted tools for public targets and the
`qa` CLI for localhost and private targets. Keep the interface the user
requests. For a requested hosted session, report unavailable tools or
authentication failures without starting a CLI session.

A local server without a matching project stays connected. Its tools explain
which product's project is missing. The unused product's local server still
downloads on first start.

## Complete setup for your product

Restart your coding agent after installation. Configure only the product you
intend to use; the plugin includes all products.

### Browser tests

1. Install `momentic` in your project and initialize it with
   `npx momentic init --yes --config-only` if there is no
   `momentic.config.yaml`. For a sample test, use the
   [web quickstart](https://momentic.ai/docs/quickstart/web).
2. Run `npx momentic login` or provide `MOMENTIC_API_KEY` to the local MCP
   process. Confirm `npx momentic whoami` reports the intended organization.
3. Check the local `momentic` server's config path and working directory, then
   call its `momentic_get_artifacts` tool and check the project artifacts.
4. Sign in to `momentic-hosted` with OAuth and call `momentic_search_docs`. Load
   `momentic-test` to write and validate your first test.

### Mobile tests

1. Install `momentic-mobile` and run
   `npx momentic-mobile init --yes --config-only` if the project has no config.
   Follow the [Android](https://momentic.ai/docs/quickstart/android) or
   [iOS](https://momentic.ai/docs/quickstart/ios) quickstart for device and app
   setup.
2. Run `npx momentic-mobile login` or provide `MOMENTIC_API_KEY` to the local
   MCP process. Confirm `npx momentic-mobile whoami` reports the intended
   organization.
3. Check the local `momentic-mobile` server's config path and working directory,
   then call its `momentic_get_artifacts` tool and check the project artifacts.
4. Sign in to `momentic-hosted` with OAuth and call `momentic_search_docs`. Load
   `momentic-test` to write and validate your first test.

### Mo sessions

1. Sign in to `momentic-hosted` with OAuth. Verify it exposes
   `momentic_mo_start_session`; use `momentic_mo_list_sessions` to check the
   connection without starting paid work.
2. Load `mo-qa` with your target and brief. Use hosted tools for deployed
   targets.
3. For localhost or private targets, install `qa`, run `qa login` and
   `qa whoami`, then follow the skill's tunnel steps. You do not need either
   local test-authoring MCP server for Mo.

If a local or hosted connection is missing, follow the
[MCP setup guide](https://momentic.ai/docs/coding-agents/mcp-server).

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

For Mo, install only `mo-qa`:

```bash
npx qa skills --target claude-code
```

`momentic` and `momentic-mobile` install identical `momentic-test`,
`momentic-maintain`, and `momentic-spec` bundles, including web and mobile
references. Either CLI updates the same skills and pointer block. `qa` installs
only `mo-qa`.

Use `--target codex` for Codex. Without `--target`, each skills command asks
which coding agents to configure; `--yes` selects detected agents without a
prompt. For Mo, connect the hosted server with the command for your agent:

```bash
claude mcp add --transport http momentic-hosted https://mcp.momentic.ai
```

Or, for Codex:

```bash
codex mcp add momentic-hosted --url https://mcp.momentic.ai
```

For other agents, add `https://mcp.momentic.ai` as `momentic-hosted` with OAuth.
Sign in when your agent asks. Mo uses hosted tools by default and the `qa` CLI
for private targets or when the user requests it. If a requested hosted session
is blocked, report the blocker rather than switching to the CLI.

## Choose a path

| Task                                       | Use                                                 |
| ------------------------------------------ | --------------------------------------------------- |
| Exploratory Mo bug bash or PR testing      | `mo-qa` with the hosted `momentic-hosted` server    |
| Localhost or private-target QA             | `mo-qa` and the `qa` CLI with a tunnel              |
| Write or maintain repository browser tests | `momentic-test` and the local `momentic` MCP        |
| Write or maintain repository mobile tests  | `momentic-test` and the local `momentic-mobile` MCP |
| ChatGPT, Claude, or Gemini                 | The hosted connector at `https://mcp.momentic.ai`   |

See the
[local MCP server guide](https://momentic.ai/docs/coding-agents/mcp-server) for
setup. The hosted connector cannot reach localhost, private networks, or local
files.

Keep an existing connection when it supports the task. Do not authenticate a
second connection or start another paid session after uncertain delivery without
checking the original session.

## Hosted connector

The hosted connector uses Momentic OAuth. Keep credentials out of chat and
uploads; use a Momentic environment or session-page secrets instead.

See the [hosted connector guide](https://momentic.ai/docs/mo/chatgpt-and-claude)
for connection setup, files, findings, and retests.

## Skills

| Skill                                                  | Description                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| [momentic-test](skills/momentic-test/SKILL.md)         | Create, run, and maintain Momentic browser, Android, and iOS tests. |
| [momentic-maintain](skills/momentic-maintain/SKILL.md) | Diagnose failures and repair quarantined tests.                     |
| [mo-qa](skills/mo-qa/SKILL.md)                         | Run and control Mo bug bashes.                                      |
| [momentic-spec](skills/momentic-spec/SKILL.md)         | Improve code correctness with Momentic specs.                       |

## Sources

The plugin manifests, marketplace catalogs, and skills are synced from upstream
sources. Momentic contributors should edit them upstream. Others should open an
issue instead of a pull request.
