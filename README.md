# Momentic Agent Skills

A collection of agent skills for [Momentic](https://momentic.ai) — an
end-to-end testing platform for web and mobile apps.

These skills enable AI coding assistants to author, run, triage, and repair
Momentic browser and app tests. The package also connects to the hosted
[Momentic MCP server](https://api.momentic.ai/mcp) for cloud run history and
quarantine tools.

## Installation

### Claude Code

Add this repository as a Claude Code marketplace, then install the Momentic
plugin:

```shell
/plugin marketplace add momentic-ai/skills
/plugin install momentic@momentic
```

The plugin installs all six skills and connects the hosted Momentic MCP server.
In Claude Code, type `/mcp` and choose **Authenticate** to sign in with
WorkOS AuthKit OAuth.

### Cursor

Install the Momentic plugin from the Cursor Marketplace. Search for
**Momentic** under **Customize → Plugins**.

### Devin

Install the Devin plugin from this repository. The plugin includes all six
skills and the hosted Momentic MCP server. The server uses WorkOS AuthKit OAuth.

### Other agents

Install the skills with the `skills` CLI:

```shell
npx skills add momentic-ai/skills
```

This repository is also an Agent Plugins v1 package. The manifest is at
[`plugin.json`](plugin.json).

## Hosted MCP server

The hosted Momentic MCP server uses streamable HTTP and WorkOS AuthKit OAuth:

```text
https://api.momentic.ai/mcp
```

The Claude, Devin, and repository MCP manifests configure this server. It
currently provides cloud run history and quarantine tools. It does not provide
the full browser or mobile test authoring and execution toolset.

For the full local MCP toolset, see the
[Momentic MCP server documentation](https://momentic.ai/docs/coding-agents/mcp-server)
and start the local stdio server:

```shell
npx momentic mcp --config /absolute/path/to/momentic.config.yaml
```

For mobile projects, use `momentic-mobile mcp` instead. The local server
requires `MOMENTIC_API_KEY`.

## Skills

Skills are Markdown files that provide AI coding assistants with domain-specific
knowledge and step-by-step workflows. Skills follow the
[`SKILL.md` format](https://docs.cursor.com/context/rules-for-ai).

| Skill                                                                            | Description                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [momentic-test](skills/momentic-test/SKILL.md)                                   | Create, run, and maintain Momentic browser E2E tests and modules stored as `*.test.yaml` and `*.module.yaml` files.                                                                                                                                                                                                                                                                  |
| [momentic-mobile-test](skills/momentic-mobile-test/SKILL.md)                     | Create, run, and maintain Momentic mobile E2E tests and modules for Android and iOS. Use Momentic MCP tools for live device validation, and use direct v2 YAML edits only for high-confidence local mobile v2 changes.                                                                                                                                                               |
| [momentic-result-classification](skills/momentic-result-classification/SKILL.md) | Classify or explain Momentic test run results using Momentic MCP tools. Use when the user asks to categorize a failure, understand why a run failed, triage test results, or compare run results to past run results.                                                                                                                                                                |
| [momentic-maintain](skills/momentic-maintain/SKILL.md)                           | Diagnose, classify, triage, and repair failing Momentic tests with MCP run tools, the Momentic CLI, and manual run artifacts. Use when a developer asks what happened on a branch, DevX or on-call asks why main is red, or the user wants to inspect classifications, de-flake quarantined or recovered tests, reduce retries, re-classify runs, run AI triage, or repair failures. |
| [momentic-spec](skills/momentic-spec/SKILL.md)                                   | Improve code correctness using Momentic specs in the feature development process                                                                                                                                                                                                                                                                                                     |
| [momentic-explore-prompt](skills/momentic-explore-prompt/SKILL.md)               | Generate an explore-prompt.md file that gives Momentic's explore agent (`momentic ai explore diff` / `momentic ai explore latest`) repo-specific context — which applications to test, the URLs tests must target, how to authenticate, where to save generated tests, and repo quirks. Use when setting up or improving the prompt file passed via `--prompt-file`.                 |

## Contributing

This repository uses [oxfmt](https://www.npmjs.com/package/oxfmt) to format
Markdown, JSON, and YAML files:

```bash
pnpm install
pnpm format        # format in place
pnpm check-format  # what CI runs
```

The `skills/` directory is excluded from oxfmt. Most files in this directory
are synced by a bot from `agent-markdowns` in the
[Momentic monorepo](https://github.com/momentic-ai/monorepo). The synced skills
include `momentic-test`, `momentic-mobile-test`, `momentic-maintain`,
`momentic-explore-prompt`, `momentic-spec`, and the
`momentic-triage-quarantined-tests.md` file. Edit those files in the monorepo
and let the sync bot propagate them here. Formatting those files here would
fight the sync bot. Format all other repository files before opening a change.
