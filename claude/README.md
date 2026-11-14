# Momentic for Claude

Bug bash web and mobile apps and review findings with the bundled `mo-qa` skill.
The plugin connects to the hosted MCP server at https://mcp.momentic.ai using
Momentic OAuth. You need a Momentic account to sign in.

The plugin sends your prompts, targets, and briefs to Momentic's hosted MCP
server only. It includes no local servers, hooks, or scripts. Use hosted tools
to discover saved environments, uploaded mobile builds and existing Connectors.
Private web targets need an existing Connector or a tunnel created with the `qa`
CLI. For mobile testing, select an uploaded build or a configured AWS Device
Farm target.

See the [connector guide](https://momentic.ai/docs/mo/chatgpt-and-claude) and
[privacy policy](https://momentic.ai/legal/privacy). For support, contact
support@momentic.ai.
