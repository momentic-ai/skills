# Momentic Agent Skills

Agent skills for [Momentic](https://momentic.ai), an end-to-end testing platform
for web and mobile apps.

The skills teach a coding agent how to write Momentic tests, run them, and fix
them when they break. The package also wires up the hosted
[Momentic MCP server](https://api.momentic.ai/mcp), which gives the agent cloud
run history and the quarantine list.

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

The Claude, Devin, and repository MCP manifests all point at this server. Today
it only exposes cloud run history and the quarantine list. The tools that author
and run browser and mobile tests live in the local server, not here.

To get those tools, see the
[Momentic MCP server documentation](https://momentic.ai/docs/coding-agents/mcp-server)
and start the local stdio server:

```shell
npx momentic mcp --config /absolute/path/to/momentic.config.yaml
```

For mobile projects, use `momentic-mobile mcp` instead. The local server
requires `MOMENTIC_API_KEY`.

## Skills

Each skill is a Markdown file that gives an agent domain knowledge and a
step-by-step workflow. They use the
[`SKILL.md` format](https://docs.cursor.com/context/rules-for-ai).

| Skill                                                                            | Description                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [momentic-test](skills/momentic-test/SKILL.md)                                   | Create, run, and maintain Momentic browser E2E tests and modules stored as `*.test.yaml` and `*.module.yaml` files.                                                                                                                                                                                                                                                                  |
| [momentic-mobile-test](skills/momentic-mobile-test/SKILL.md)                     | Create, run, and maintain Momentic mobile E2E tests and modules for Android and iOS. Use Momentic MCP tools for live device validation, and use direct v2 YAML edits only for high-confidence local mobile v2 changes.                                                                                                                                                               |
| [momentic-result-classification](skills/momentic-result-classification/SKILL.md) | Classify or explain Momentic test run results using Momentic MCP tools. Use when the user asks to categorize a failure, understand why a run failed, triage test results, or compare run results to past run results.                                                                                                                                                                |
| [momentic-maintain](skills/momentic-maintain/SKILL.md)                           | Diagnose, classify, triage, and repair failing Momentic tests with MCP run tools, the Momentic CLI, and manual run artifacts. Use when a developer asks what happened on a branch, DevX or on-call asks why main is red, or the user wants to inspect classifications, de-flake quarantined or recovered tests, reduce retries, re-classify runs, run AI triage, or repair failures. |
| [momentic-spec](skills/momentic-spec/SKILL.md)                                   | Improve code correctness using Momentic specs in the feature development process                                                                                                                                                                                                                                                                                                     |
| [momentic-explore-prompt](skills/momentic-explore-prompt/SKILL.md)               | Generate an explore-prompt.md file that gives Momentic's explore agent (`momentic ai explore diff` / `momentic ai explore latest`) repo-specific context — which applications to test, the URLs tests must target, how to authenticate, where to save generated tests, and repo quirks. Use when setting up or improving the prompt file passed via `--prompt-file`.                 |

## Skill sources

A bot copies most files in `skills/` from an upstream source, so anything you
edit here gets overwritten on the next sync. That covers `momentic-test`,
`momentic-mobile-test`, `momentic-maintain`, `momentic-explore-prompt`,
`momentic-spec`, and `momentic-triage-quarantined-tests.md`. If you work at
Momentic, edit them at the source. If you do not, please open an issue instead
of a pull request.
