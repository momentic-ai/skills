# Momentic agent skills

Use one Momentic coding-agent plugin for browser and mobile test authoring,
maintenance, and Mo bug bashes.

## Install the plugin

### Claude Code

Add the catalog and install Momentic:

```text
/plugin marketplace add momentic-ai/skills
/plugin install momentic@momentic
```

### Cursor

In Cursor, open **Customize > Plugins**, search for **Momentic**, and install
the plugin.

### Devin

Install the Momentic plugin from this repository.

The plugin bundles the repository-test skills, `mo-qa`, the local `momentic` and
`momentic-mobile` MCP servers, and the hosted `momentic-hosted` MCP server at
`https://mcp.momentic.ai`. `mo-qa` starts Mo sessions through the hosted server
and uses the `qa` CLI only for localhost and private targets that need a tunnel.

## Install skills without the plugin

Use a Momentic CLI to install the shared skills in supported coding agents:

```bash
npx momentic skills
npx momentic-mobile skills
qa skills
```

Each command asks which coding agents to configure. Pass `--yes` to skip the
prompt. Use the `skills` CLI to install the skills from the public catalog:

```bash
npx skills add https://github.com/momentic-ai/skills
```

Install the standalone `mo-qa` skill when Mo needs a local or private-target
tunnel. It uses the same source as the plugin:

```bash
npx skills add https://github.com/momentic-ai/skills --skill mo-qa
```

## Choose a path

| Task                                       | Use                                                        |
| ------------------------------------------ | ---------------------------------------------------------- |
| Exploratory Mo bug bash or PR testing      | `mo-qa` with the hosted `momentic-hosted` server           |
| Localhost or private-target QA             | `mo-qa` and the `qa` CLI with a tunnel                     |
| Write or maintain repository browser tests | `momentic-test` and the local `momentic` MCP               |
| Write or maintain repository mobile tests  | `momentic-mobile-test` and the local `momentic-mobile` MCP |
| ChatGPT, Claude, or Gemini                 | The hosted connector at `https://mcp.momentic.ai`          |

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

| Skill                                                        | Description                                       |
| ------------------------------------------------------------ | ------------------------------------------------- |
| [momentic-test](skills/momentic-test/SKILL.md)               | Create, run, and maintain Momentic browser tests. |
| [momentic-mobile-test](skills/momentic-mobile-test/SKILL.md) | Create, run, and maintain Momentic mobile tests.  |
| [momentic-maintain](skills/momentic-maintain/SKILL.md)       | Diagnose failures and repair quarantined tests.   |
| [mo-qa](skills/mo-qa/SKILL.md)                               | Run and control Mo bug bashes.                    |
| [momentic-spec](skills/momentic-spec/SKILL.md)               | Improve code correctness with Momentic specs.     |

## Sources

The plugin manifests, marketplace catalogs, and skills are synced from upstream
sources. Momentic contributors should edit them upstream. Others should open an
issue instead of a pull request.
