# Momentic Skills

A set of skills for enabling **[Claude Code](https://docs.claude.com/en/docs/claude-code/overview)** to work with Momentic to build and run web and mobile E2E tests.

## Skills

This plugin includes the following skills (see `skills/` for details):

| Skill                                                                            | Description                                                                                                                                 |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [momentic-test](skills/momentic-test/SKILL.md)                                   | Run and manage Momentic end-to-end tests from the CLI, including browser, Android, and iOS automation. Supports hosted and local execution. |
| [momentic-result-classification](skills/momentic-result-classification/SKILL.md) | Classify and analyze Momentic test results to identify likely failure causes, separate real bugs from noise, and improve test signal.       |

## Installation

To install the skill to popular coding agents:

```bash
$ npx skills add momentic-ai/skills
```

### Claude Code

On Claude Code, to add the marketplace, simply run:

```bash
/plugin marketplace add momentic-ai/skills
```

Then install a plugin:

```bash
/plugin install momentic-test@momentic
```

If you prefer the manual interface:

1. On Claude Code, type `/plugin`
2. Select option `3. Add marketplace`
3. Enter the marketplace source: `momentic-ai/skills`
4. Press enter to select the plugin you want
5. Hit enter again to `Install now`
6. **Restart Claude Code** for changes to take effect

## Usage

Once installed, you can ask Claude:

- _"Run my Momentic test suite and summarize any failures"_
- _"Build a test for this feature I just shipped"_
- _"Based on the changes on my branch, update any impacted Momentic tests"_
- _"Classify these Momentic test results and tell me which failures are real bugs vs noise"_

Claude will handle the rest.

## Resources

- [Momentic Documentation](https://momentic.ai/docs)
- [Claude Code Skills](https://support.claude.com/en/articles/12512176-what-are-skills)
