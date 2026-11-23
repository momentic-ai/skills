# Authentication

For direct hosted OAuth, ask the user to reconnect or reauthorize the existing Momentic connection in the host client, then retry once. Report any remaining authentication blocker.

The optional `qa mcp` bridge uses saved CLI login for its configured server. If bridge authentication fails, run `qa login --server <bridge-server>`, replacing the placeholder with the [server configured for `qa mcp`](https://momentic.ai/docs/cli-reference/mo/commands/mcp) even if the error omits it. If `qa` is not on `PATH`, use `npx -y qa login --server <bridge-server>` with that same server. Have the user complete the sign-in flow before retrying the bridge. If sign-in changes the user or organization, restart the bridge so it loads the new saved login before retrying. Do not run `qa login` for direct hosted OAuth.
