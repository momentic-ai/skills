# Momentic Agent Skills

Agent skills for [Momentic](https://momentic.ai), an end-to-end testing platform
for web and mobile apps.

The skills teach a coding agent how to write Momentic tests, run them, and fix
them when they break. The package also wires up the local Momentic MCP servers,
which are what let the agent drive a real browser or device while it works.

## Installation

### Claude Code

Add this repository as a Claude Code marketplace, then install the Momentic
plugin:

```shell
/plugin marketplace add momentic-ai/skills
/plugin install momentic@momentic
```

The plugin installs all the skills and registers the local Momentic MCP servers.
Run `/mcp` in Claude Code to see which ones started.

### Cursor

Install the Momentic plugin from the Cursor Marketplace. Search for
**Momentic** under **Customize → Plugins**.

### Devin

Install the Devin plugin from this repository. It includes all the skills and
the local Momentic MCP servers.

### Other agents

Install the skills with the `skills` CLI:

```shell
npx skills add momentic-ai/skills
```

This repository is also an Agent Plugins v1 package. The manifest is at
[`plugin.json`](plugin.json).

## MCP servers

The skills call MCP tools that run tests, inspect live pages, and splice steps
back into your YAML files. Those tools come from the Momentic CLIs over stdio, so
the servers run on your machine next to your project:

```json
{
  "mcpServers": {
    "momentic": {
      "command": "npx",
      "args": ["-y", "momentic", "mcp"]
    },
    "momentic-mobile": {
      "command": "npx",
      "args": ["-y", "momentic-mobile", "mcp"]
    }
  }
}
```

That is what `.mcp.json` and the Devin manifest install. `momentic` drives
browsers and `momentic-mobile` drives Android and iOS, so drop whichever one
your project does not test.

Both servers look for `momentic.config.yaml` in the working directory and its
parents. Add `--config /absolute/path/to/momentic.config.yaml` if your agent
starts outside the project, or if the two platforms live in separate
subdirectories.

Sign in once with `npx @momentic/wizard@latest login`, or set
`MOMENTIC_API_KEY` in the environment. The wizard can also register a server
with Claude Code, Cursor, VS Code, Codex, Windsurf, and a few others if you
would rather not edit config by hand. Mobile work needs the usual device
toolchain, and `momentic-mobile mcp` takes `--android-home` and `--java-home`
when those live somewhere unusual. See the
[MCP server documentation](https://momentic.ai/docs/coding-agents/mcp-server)
for the full tool list.

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

## Skill sources

A bot copies most files in `skills/` from an upstream source, so anything you
edit here gets overwritten on the next sync. That covers `momentic-test`,
`momentic-mobile-test`, `momentic-maintain`, `momentic-spec`, and
`momentic-triage-quarantined-tests.md`. If you work at Momentic, edit them at
the source. If you do not, please open an issue instead of a pull request.
